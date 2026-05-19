const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// ─── Web Push helpers ────────────────────────────────────────────────────────

function b64uDecode(str) {
  const pad = "=".repeat((4 - (str.length % 4)) % 4);
  return Uint8Array.from(atob(str.replace(/-/g, "+").replace(/_/g, "/") + pad), c => c.charCodeAt(0));
}

function b64uEncode(buf) {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function concat(...arrays) {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) { out.set(a, offset); offset += a.length; }
  return out;
}

async function hkdf(salt, ikm, info, length) {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info },
    key,
    length * 8
  );
  return new Uint8Array(bits);
}

async function makeVapidJwt(endpoint, vapidPublicKey, vapidPrivateKey, subject) {
  const enc = new TextEncoder();
  const audience = new URL(endpoint).origin;

  const header = b64uEncode(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = b64uEncode(enc.encode(JSON.stringify({
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 43200,
    sub: subject,
  })));
  const signingInput = `${header}.${payload}`;

  const pubBytes = b64uDecode(vapidPublicKey);
  const jwk = {
    kty: "EC", crv: "P-256",
    d: vapidPrivateKey,
    x: b64uEncode(pubBytes.slice(1, 33)),
    y: b64uEncode(pubBytes.slice(33, 65)),
    key_ops: ["sign"], ext: true,
  };
  const privKey = await crypto.subtle.importKey(
    "jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    privKey,
    enc.encode(signingInput)
  );
  return `${signingInput}.${b64uEncode(sig)}`;
}

async function encryptForPush(payloadStr, p256dh, auth) {
  const enc = new TextEncoder();
  const clientPub = b64uDecode(p256dh);
  const authSecret = b64uDecode(auth);

  const serverPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]
  );
  const serverPubRaw = new Uint8Array(await crypto.subtle.exportKey("raw", serverPair.publicKey));

  const clientKey = await crypto.subtle.importKey(
    "raw", clientPub, { name: "ECDH", namedCurve: "P-256" }, false, []
  );
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: clientKey }, serverPair.privateKey, 256)
  );

  // RFC 8291: derive IKM from shared secret + auth secret
  const authInfo = concat(enc.encode("WebPush: info\x00"), clientPub, serverPubRaw);
  const ikm = await hkdf(authSecret, sharedSecret, authInfo, 32);

  // RFC 8188: derive CEK and nonce from random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\x00"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\x00"), 12);

  const padded = concat(enc.encode(payloadStr), new Uint8Array([2])); // 0x02 = last-record delimiter
  const cekKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, cekKey, padded)
  );

  // aes128gcm body header: salt(16) + rs(4 big-endian) + idlen(1) + keyid(65)
  const header = new Uint8Array(86);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, 4096, false);
  header[20] = 65;
  header.set(serverPubRaw, 21);

  return concat(header, ciphertext);
}

async function sendPushes(env, title, body, senderEndpoint) {
  const { results: subs } = await env.DB.prepare("SELECT * FROM subscriptions").all();
  console.log(`[push] ${subs.length} subscriptions in DB, senderEndpoint=${senderEndpoint ? senderEndpoint.slice(0,40) : "none"}`);
  if (!subs.length) return;

  const targets = subs.filter(s => s.endpoint !== senderEndpoint);
  console.log(`[push] sending to ${targets.length} targets`);

  await Promise.allSettled(
    targets.map(async sub => {
      try {
        const jwt = await makeVapidJwt(sub.endpoint, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY, env.VAPID_SUBJECT);
        const encrypted = await encryptForPush(JSON.stringify({ title, body }), sub.p256dh, sub.auth);
        const res = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            Authorization: `vapid t=${jwt},k=${env.VAPID_PUBLIC_KEY}`,
            "Content-Type": "application/octet-stream",
            "Content-Encoding": "aes128gcm",
            TTL: "86400",
          },
          body: encrypted,
        });
        console.log(`[push] response ${res.status} for ${sub.endpoint.slice(0,40)}`);
        if (res.status === 404 || res.status === 410) {
          await env.DB.prepare("DELETE FROM subscriptions WHERE endpoint = ?").bind(sub.endpoint).run();
        }
      } catch (err) {
        console.log(`[push] error: ${err.message}`);
      }
    })
  );
}

// ─── Request handler ─────────────────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // GET /api/items
    if (path === "/api/items" && request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT * FROM items ORDER BY created_at ASC"
      ).all();
      return json(results);
    }

    // POST /api/items
    if (path === "/api/items" && request.method === "POST") {
      const { name, senderEndpoint } = await request.json();
      if (!name || !name.trim()) return json({ error: "Name required" }, 400);
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await env.DB.prepare(
        "INSERT INTO items (id, name, checked, created_at) VALUES (?, ?, 0, ?)"
      ).bind(id, name.trim(), now).run();

      if (env.VAPID_PRIVATE_KEY && env.VAPID_PRIVATE_KEY !== "REPLACE_WITH_VAPID_PRIVATE_KEY") {
        ctx.waitUntil(
          sendPushes(env, "Dog Shop 🛒", `"${name.trim()}" was added to the list`, senderEndpoint)
        );
      }

      return json({ id, name: name.trim(), checked: 0, created_at: now }, 201);
    }

    // POST /api/subscribe
    if (path === "/api/subscribe" && request.method === "POST") {
      const { endpoint, p256dh, auth } = await request.json();
      if (!endpoint || !p256dh || !auth) return json({ error: "Missing fields" }, 400);
      await env.DB.prepare(
        "INSERT OR REPLACE INTO subscriptions (endpoint, p256dh, auth) VALUES (?, ?, ?)"
      ).bind(endpoint, p256dh, auth).run();
      return json({ ok: true });
    }

    // DELETE /api/subscribe
    if (path === "/api/subscribe" && request.method === "DELETE") {
      const { endpoint } = await request.json();
      if (endpoint) {
        await env.DB.prepare("DELETE FROM subscriptions WHERE endpoint = ?").bind(endpoint).run();
      }
      return json({ ok: true });
    }

    // PATCH /api/items/:id/note
    const noteMatch = path.match(/^\/api\/items\/([^/]+)\/note$/);
    if (noteMatch && request.method === "PATCH") {
      const id = noteMatch[1];
      const { note } = await request.json();
      await env.DB.prepare("UPDATE items SET note = ? WHERE id = ?").bind(note || null, id).run();
      return json({ ok: true });
    }

    // PATCH /api/items/:id/check
    const checkMatch = path.match(/^\/api\/items\/([^/]+)\/check$/);
    if (checkMatch && request.method === "PATCH") {
      const id = checkMatch[1];
      const item = await env.DB.prepare("SELECT * FROM items WHERE id = ?").bind(id).first();
      if (!item) return json({ error: "Not found" }, 404);
      const newChecked = item.checked ? 0 : 1;
      await env.DB.prepare("UPDATE items SET checked = ? WHERE id = ?").bind(newChecked, id).run();
      return json({ ...item, checked: newChecked });
    }

    // DELETE /api/items/:id
    const deleteMatch = path.match(/^\/api\/items\/([^/]+)$/);
    if (deleteMatch && request.method === "DELETE") {
      const id = deleteMatch[1];
      await env.DB.prepare("DELETE FROM items WHERE id = ?").bind(id).run();
      return json({ ok: true });
    }

    return json({ error: "Not found" }, 404);
  },
};
