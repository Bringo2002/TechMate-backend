// ======================================
// FILE: src/utils/httpCache.ts
// ======================================
import crypto from "crypto";
import { Request, Response } from "express";


export function sendCachedJson(req: Request, res: Response, payload: unknown) {
const body = JSON.stringify(payload);
const etag = 'W/"' + crypto.createHash("sha1").update(body).digest("hex") + '"';
res.setHeader("ETag", etag);
res.setHeader("Cache-Control", "private, max-age=30"); // 30s client cache


const ifNoneMatch = req.headers["if-none-match"];
if (ifNoneMatch && ifNoneMatch === etag) {
return res.status(304).end();
}
res.type("application/json").send(body);
}