// Run with: node keygen.js
// Generates a VAPID key pair for Web Push. Run once, save the output.
const crypto = require('crypto');
const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const pub = publicKey.export({ format: 'jwk' });
const priv = privateKey.export({ format: 'jwk' });
const raw = Buffer.concat([Buffer.from([0x04]), Buffer.from(pub.x, 'base64url'), Buffer.from(pub.y, 'base64url')]);
console.log('\nVAPID_PUBLIC_KEY (paste into index.html and wrangler.toml):');
console.log(raw.toString('base64url'));
console.log('\nVAPID_PRIVATE_KEY (paste when wrangler secret put asks):');
console.log(priv.d);
console.log();
