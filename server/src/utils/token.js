import crypto from "crypto";

function base64url(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

export function createToken(payload) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing. Add it to server/.env");
  }

  const header = base64url({ alg: "HS256", typ: "JWT" });
  const body = base64url({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8
  });
  const signature = sign(`${header}.${body}`, secret);

  return `${header}.${body}.${signature}`;
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing. Add it to server/.env");
  }

  const [header, body, signature] = token.split(".");

  if (!header || !body || !signature) {
    throw new Error("Invalid token");
  }

  const expectedSignature = sign(`${header}.${body}`, secret);

  if (signature !== expectedSignature) {
    throw new Error("Invalid token signature");
  }

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return payload;
}
