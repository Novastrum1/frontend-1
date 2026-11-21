// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/aggregator/[...path]/route";

const upstream = () => new Response(JSON.stringify({ tokens: [] }), {
  headers: { "content-type": "application/json", "x-request-id": "upstream-1" },
});
function request(path: string, method = "GET", body?: string) {
  return new NextRequest(`https://frontend.example/api/aggregator/${path}`, {
    method, body, headers: { cookie: "session=private", authorization: "Bearer private" },
  });
}
function context(path: string) { return { params: Promise.resolve({ path: path.split("/") }) }; }

describe("same-origin aggregator proxy", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VELTRIXAE_API_URL", "https://backend.example");
    vi.stubEnv("NEXT_PUBLIC_VELTRIXAE_API_URL", "https://fallback.example");
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => upstream()));
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it("forwards query parameters, status and request ID without forwarding browser credentials", async () => {
    const res = await GET(request("tokens?limit=2"), context("tokens"));
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toBe("https://backend.example/api/v1/tokens?limit=2");
    expect(new Headers(init?.headers).has("cookie")).toBe(false);
    expect(new Headers(init?.headers).has("authorization")).toBe(false);
    expect(init).toMatchObject({ cache: "no-store", redirect: "error" });
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("x-request-id")).toBe("upstream-1");
    expect(await res.json()).toEqual({ tokens: [] });
  });

  it.each(["quotes", "swaps/prepare"])("forwards a POST body to %s", async path => {
    await POST(request(path, "POST", '{"amount":"100"}'), context(path));
    expect(vi.mocked(fetch).mock.calls[0][1]).toMatchObject({ method: "POST", body: '{"amount":"100"}' });
  });

  it.each([["admin", "GET", 404], ["quotes", "GET", 405], ["tokens", "POST", 405]] as const)(
    "rejects %s %s before contacting the backend", async (path, method, status) => {
      const handler = method === "POST" ? POST : GET;
      expect((await handler(request(path, method), context(path))).status).toBe(status);
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it.each(["https://user:password@backend.example", "http://backend.example", "ftp://backend.example", "not-a-url"])(
    "rejects invalid backend origin %s without fetching", async origin => {
      vi.stubEnv("VELTRIXAE_API_URL", origin);
      expect((await GET(request("tokens"), context("tokens"))).status).toBe(503);
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it("requires production configuration", async () => {
    vi.stubEnv("VELTRIXAE_API_URL", ""); vi.stubEnv("NEXT_PUBLIC_VELTRIXAE_API_URL", "");
    const res = await GET(request("tokens"), context("tokens"));
    expect(await res.json()).toMatchObject({ error: { code: "NOT_CONFIGURED" } });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("uses the documented compatibility fallback", async () => {
    vi.stubEnv("VELTRIXAE_API_URL", "");
    await GET(request("tokens"), context("tokens"));
    expect(String(vi.mocked(fetch).mock.calls[0][0])).toBe("https://fallback.example/api/v1/tokens");
  });
  it("uses localhost only as the development default", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VELTRIXAE_API_URL", ""); vi.stubEnv("NEXT_PUBLIC_VELTRIXAE_API_URL", "");
    await GET(request("tokens"), context("tokens"));
    expect(String(vi.mocked(fetch).mock.calls[0][0])).toBe("http://127.0.0.1:3100/api/v1/tokens");
  });
  it("rejects a body larger than 16KiB without forwarding it", async () => {
    const res = await POST(request("quotes", "POST", "x".repeat(16385)), context("quotes"));
    expect(res.status).toBe(413); expect(fetch).not.toHaveBeenCalled();
  });
  it("preserves backend failure envelopes and status", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{"error":{"code":"RATE_LIMITED","message":"Retry later"}}', {
      status: 429, headers: { "content-type": "application/json" },
    }));
    const res = await GET(request("tokens"), context("tokens"));
    expect(res.status).toBe(429); expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toMatchObject({ error: { code: "RATE_LIMITED" } });
  });
  it("rejects HTML/login responses", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("<html>Sign in</html>", { headers: { "content-type": "text/html" } }));
    const res = await GET(request("tokens"), context("tokens"));
    expect(res.status).toBe(502); expect(await res.json()).toMatchObject({ error: { code: "INVALID_UPSTREAM" } });
  });
  it.each([new TypeError("Network failure"), new DOMException("Timed out", "TimeoutError"), new TypeError("Redirect rejected")])(
    "maps upstream transport failure to an unavailable response", async error => {
      vi.mocked(fetch).mockRejectedValueOnce(error);
      const res = await GET(request("tokens"), context("tokens"));
      expect(res.status).toBe(503); expect(await res.json()).toMatchObject({ error: { code: "API_UNAVAILABLE" } });
    },
  );
});
