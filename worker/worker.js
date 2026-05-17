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

function randomId() {
  return crypto.randomUUID();
}

export default {
  async fetch(request, env) {
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
      const { name } = await request.json();
      if (!name || !name.trim()) return json({ error: "Name required" }, 400);
      const id = randomId();
      const now = new Date().toISOString();
      await env.DB.prepare(
        "INSERT INTO items (id, name, checked, created_at) VALUES (?, ?, 0, ?)"
      ).bind(id, name.trim(), now).run();
      return json({ id, name: name.trim(), checked: 0, created_at: now }, 201);
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
