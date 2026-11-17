import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const allowed = /^(?:health|readiness|tokens|pools(?:\/[A-Z2-7]{56})?|markets|quotes|swaps\/prepare|network\/status|analytics\/overview|transactions\/[a-fA-F0-9]{64})$/;

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const endpoint = path.join("/");
  const headers = { "cache-control": "no-store" };
  const error = (message: string, status: number, code: string) => Response.json({ error: { message, code } }, { status, headers });
  if (!allowed.test(endpoint)) return error("Endpoint not supported.", 404, "NOT_FOUND");
  const writes = endpoint === "quotes" || endpoint === "swaps/prepare";
  if ((request.method === "POST") !== writes) return error("Method not supported.", 405, "METHOD_NOT_ALLOWED");
  const origin = process.env.VELTRIXAE_API_URL || process.env.NEXT_PUBLIC_VELTRIXAE_API_URL ||
    (process.env.NODE_ENV === "development" ? "http://127.0.0.1:3100" : "");
  if (!origin) return error("The aggregator backend URL is not configured on the server.", 503, "NOT_CONFIGURED");
  try {
    const base = new URL(origin);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname);
    if (base.username || base.password || (base.protocol !== "https:" && !(local && base.protocol === "http:"))) {
      return error("The aggregator backend URL must use HTTPS or local HTTP.", 503, "INVALID_CONFIG");
    }
    const url = new URL(`/api/v1/${endpoint}`, base);
    url.search = request.nextUrl.search;
    const body = writes ? await request.text() : undefined;
    if (body && new TextEncoder().encode(body).length > 16384) return error("Request too large.", 413, "INVALID_REQUEST");
    const response = await fetch(url, {
      method: request.method, body, cache: "no-store", redirect: "error",
      headers: { accept: "application/json", ...(writes ? { "content-type": "application/json" } : {}) },
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(22000)]),
    });
    if (!response.headers.get("content-type")?.includes("application/json")) {
      return error("The backend returned a non-JSON response. Check its URL and port availability.", 502, "INVALID_UPSTREAM");
    }
    return new Response(await response.text(), { status: response.status, headers: {
      ...headers, "content-type": "application/json",
      ...(response.headers.get("x-request-id") ? { "x-request-id": response.headers.get("x-request-id")! } : {}),
    } });
  } catch {
    return error("The aggregator backend is unavailable. Start the API or check its server URL.", 503, "API_UNAVAILABLE");
  }
}

export const GET = proxy;
export const POST = proxy;
