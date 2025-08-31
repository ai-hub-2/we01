export const runtime = "experimental-edge";

function joinPaths(base: string, path: string): string {
  if (!base.endsWith("/")) base += "/";
  if (path.startsWith("/")) path = path.slice(1);
  return base + path;
}

export async function proxyToBolt(request: Request): Promise<Response> {
  const base = process.env.BOLT_API_BASE;
  if (!base) {
    return new Response("Missing BOLT_API_BASE env", { status: 500 });
  }

  const url = new URL(request.url);
  const apiPath = url.pathname.replace(/^\/?api\/?/, "");
  const targetUrl = new URL(joinPaths(base, apiPath));
  targetUrl.search = url.search;

  const method = request.method || "GET";
  const headers = new Headers();
  for (const [key, value] of request.headers.entries()) {
    if (key.toLowerCase() === "host") continue;
    if (key.toLowerCase() === "content-length") continue;
    headers.set(key, value);
  }

  const init: RequestInit = { method, headers };
  if (method !== "GET" && method !== "HEAD") {
    init.body = request.body;
  }

  const response = await fetch(targetUrl.toString(), init);
  const responseHeaders = new Headers(response.headers);
  // Optionally sanitize headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

