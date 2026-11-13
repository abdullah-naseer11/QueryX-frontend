// Talks to the Database Architect AI backend (FastAPI). Settings come from .env.local
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "dev-key-change-me";

export type Migration = {
  id: number; request: string; summary: string; up_sql: string; down_sql: string; status: string;
  safety_verdict: string | null; sandbox_status: string | null; error: string | null;
  created_by: string | null; approved_by: string | null;
  created_at: string | null; approved_at: string | null; applied_at: string | null;
};
export type Column = { name: string; data_type: string; nullable: boolean; default: string | null };
export type Table = {
  name: string; columns: Column[]; primary_key: string[]; estimated_rows: number | null;
  foreign_keys: { columns: string[]; ref_table: string }[]; indexes: { name: string }[];
};
export type Schema = { schema_name: string; server_version: string; tables: Table[] };
export type Step = "sandbox" | "approve" | "reject" | "apply" | "rollback";

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init, headers: { "Content-Type": "application/json", "X-API-Key": API_KEY, ...(init.headers || {}) }
    });
  } catch {
    throw new Error("Cannot reach the API. Is it running? (uvicorn app.api.main:app --reload)");
  }
  if (!res.ok) {
    let detail = res.statusText;
    try { const j = await res.json(); detail = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail); } catch {}
    throw new Error(res.status === 401 ? "Wrong API key. Check NEXT_PUBLIC_API_KEY in .env.local" : detail);
  }
  return res.json();
}

export const api = {
  health: () => call<{ status: string }>("/health"),
  schema: () => call<Schema>("/schema"),
  migrations: () => call<Migration[]>("/migrations"),
  propose: (request: string) => call<Migration>("/migrations/propose", { method: "POST", body: JSON.stringify({ request }) }),
  step: (id: number, name: Step) => call<Migration>(`/migrations/${id}/${name}`, { method: "POST" })
};

// Live status: calls onChange every time the backend reports a change. Returns a function that stops listening.
export function watchMigration(id: number, onChange: () => void): () => void {
  let ws: WebSocket | null = null;
  try {
    ws = new WebSocket(`${API_URL.replace(/^http/, "ws")}/ws/migrations/${id}?api_key=${encodeURIComponent(API_KEY)}`);
    ws.onmessage = () => onChange();
  } catch {}
  return () => ws?.close();
}

export function ago(iso: string | null): string {
  if (!iso) return "";
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return `${Math.floor(s / 86400)} d ago`;
}
