export interface YggdrasilAPIOptions {
  baseUrl?: string;
}

export interface YggdrasilAPI {
  get: <T>(path: string) => Promise<T>;
  post: <T>(path: string, body: unknown) => Promise<T>;
  del: <T>(path: string) => Promise<T>;
}

async function send<T>(url: string, init: RequestInit): Promise<T> {
  const resp = await fetch(url, { credentials: "include", ...init });
  if (!resp.ok) {
    let detail = "";
    try {
      detail = await resp.text();
    } catch {
      detail = "";
    }
    throw new Error(`${resp.status} ${resp.statusText}: ${detail}`);
  }
  if (resp.status === 204) return undefined as T;
  return (await resp.json()) as T;
}

export function useYggdrasilAPI(opts: YggdrasilAPIOptions = {}): YggdrasilAPI {
  const base = (opts.baseUrl ?? "/api/v1").replace(/\/$/, "");
  return {
    get: <T>(path: string) => send<T>(`${base}${path}`, { method: "GET" }),
    post: <T>(path: string, body: unknown) =>
      send<T>(`${base}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }),
    del: <T>(path: string) => send<T>(`${base}${path}`, { method: "DELETE" })
  };
}
