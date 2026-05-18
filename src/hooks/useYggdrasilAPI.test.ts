import { describe, it, expect, vi, beforeEach } from "vitest";
import { useYggdrasilAPI } from "./useYggdrasilAPI";

describe("useYggdrasilAPI", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns get/post/del methods bound to default base /api/v1", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );
    const api = useYggdrasilAPI();
    const result = await api.get<{ ok: boolean }>("/integration-instances/abc");
    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/integration-instances/abc",
      expect.objectContaining({ credentials: "include", method: "GET" })
    );
  });

  it("respects baseUrl override", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );
    const api = useYggdrasilAPI({ baseUrl: "https://core.test/v2" });
    await api.get("/x");
    expect(fetchMock).toHaveBeenCalledWith("https://core.test/v2/x", expect.any(Object));
  });

  it("throws on non-2xx with status code in message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "nope" }), { status: 403 })
    );
    const api = useYggdrasilAPI();
    await expect(api.get("/x")).rejects.toThrow(/403/);
  });

  it("posts JSON body", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ created: true }), { status: 200 })
    );
    const api = useYggdrasilAPI();
    await api.post("/x", { a: 1 });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/x",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
        body: JSON.stringify({ a: 1 })
      })
    );
  });
});
