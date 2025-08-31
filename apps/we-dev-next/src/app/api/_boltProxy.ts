export const runtime = "experimental-edge";

function joinPaths(base: string, path: string): string {
  if (!base.endsWith("/")) base += "/";
  if (path.startsWith("/")) path = path.slice(1);
  return base + path;
}

function getCorsHeaders(origin: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Requested-With",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
  return headers;
}

export async function proxyToBolt(request: Request): Promise<Response> {
  const defaultBase = process.env.BOLT_API_BASE;
  if (!defaultBase) {
    return new Response("Missing BOLT_API_BASE env", { status: 500 });
  }

  const allowClientBase = (process.env.BOLT_ALLOW_CLIENT_BASE || "true").toLowerCase() === "true";
  const headerBase = request.headers.get("x-api-base");
  const base = allowClientBase && headerBase ? headerBase : defaultBase;

  const url = new URL(request.url);
  const origin = request.headers.get("origin");

  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
  }

  const rewritePrefix = process.env.BOLT_API_PREFIX || "";
  const forwardAuth = (process.env.BOLT_FORWARD_AUTH || "true").toLowerCase() === "true";
  const scheme = process.env.BOLT_AUTH_SCHEME || "Bearer";
  const staticKey = process.env.BOLT_API_KEY || "";

  // Derive target path: /api/... -> optional prefix + ...
  const apiPath = url.pathname.replace(/^\/?api\/?/, "");
  const pathWithPrefix = rewritePrefix
    ? joinPaths(rewritePrefix, apiPath)
    : apiPath;
  const targetUrl = new URL(joinPaths(base, pathWithPrefix));
  targetUrl.search = url.search;

  const method = request.method || "GET";
  const headers = new Headers();
  for (const [key, value] of request.headers.entries()) {
    const k = key.toLowerCase();
    if (k === "host" || k === "content-length") continue;
    // skip browser-specific fetch metadata
    if (k.startsWith("sec-fetch")) continue;
    // do not forward x-api-base downstream
    if (k === "x-api-base") continue;
    headers.set(key, value);
  }

  // Authorization: prefer forwarded header/cookie-based if allowed, otherwise inject env key
  const incomingAuth = request.headers.get("authorization");
  if (!forwardAuth || !incomingAuth) {
    if (staticKey) {
      headers.set("authorization", `${scheme} ${staticKey}`.trim());
    }
  }

  // Forward model hint if present to downstream (some providers honor it via header)
  const model = request.headers.get("x-api-model");
  if (model && !headers.has("x-api-model")) {
    headers.set("x-api-model", model);
  }

  const init: RequestInit = { method, headers };
  if (method !== "GET" && method !== "HEAD") {
    init.body = request.body;
  }

  const response = await fetch(targetUrl.toString(), init);
  const responseHeaders = new Headers(response.headers);
  // Add CORS headers to response
  for (const [k, v] of Object.entries(getCorsHeaders(origin))) {
    responseHeaders.set(k, v);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

