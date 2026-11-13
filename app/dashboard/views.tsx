"use client";
import { useEffect, useState } from "react";
import { Migration, Schema, Step, ago, api, watchMigration } from "../lib/api";

export const PENDING = ["CHECKED", "SANDBOXED", "APPROVED"];
const COLOR: Record<string, string> = {
  CHECKED: "blue", SANDBOXED: "cyan", APPROVED: "amber", APPLYING: "amber", APPLIED: "green",
  ROLLING_BACK: "amber", ROLLED_BACK: "purple", REJECTED: "red", FAILED: "red", ROLLBACK_FAILED: "red"
};
const ACTIONS: Record<string, { step: Step; label: string; danger?: boolean }[]> = {
  CHECKED: [{ step: "sandbox", label: "Test in sandbox" }, { step: "reject", label: "Reject", danger: true }],
  SANDBOXED: [{ step: "approve", label: "Approve" }, { step: "reject", label: "Reject", danger: true }],
  APPROVED: [{ step: "apply", label: "Apply to real database" }, { step: "reject", label: "Reject", danger: true }],
  APPLIED: [{ step: "rollback", label: "Roll back" }]
};
const NEXT: Record<string, string> = {
  CHECKED: "Safety check passed. Next: test it in the sandbox.",
  SANDBOXED: "The sandbox test passed. Next: a person approves it.",
  APPROVED: "Approved. It can now be applied to the real database.",
  APPLIED: "Applied to the real database. You can still roll it back.",
  ROLLED_BACK: "Rolled back. The database is as before."
};
const EXAMPLES = ["Add a nickname column to users", "Add an index on orders user_id", "Add a check constraint so products price is never negative"];

export function StatusPill({ status }: { status: string }) {
  return <span className={`status-pill ${COLOR[status] ?? "blue"}`}>{status.replace("_", " ")}</span>;
}

export function Migrations({ migs, reload }: { migs: Migration[]; reload: () => Promise<void> }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => { if (open !== null) return watchMigration(open, () => { reload(); }); }, [open]);

  async function run(label: string, job: () => Promise<unknown>) {
    setBusy(label); setError("");
    try { await job(); await reload(); } catch (e: any) { setError(e.message); } finally { setBusy(""); }
  }
  const propose = () => text.trim().length >= 3 && run("The AI is writing the migration. This can take up to 30 seconds...", async () => {
    const m = await api.propose(text.trim()); setOpen(m.id); setText("");
  });
  const act = (m: Migration, step: Step) => {
    if (step === "apply" && !window.confirm("This changes the REAL database. Continue?")) return;
    run(step === "sandbox" ? "Testing in the Docker sandbox..." : "Working...", () => api.step(m.id, step));
  };

  return <div className="view-stack">
    <section className="panel">
      <div className="panel-header"><div><span className="panel-kicker">PLAIN ENGLISH</span><h2>New migration</h2></div></div>
      <form className="prompt-form" onSubmit={e => { e.preventDefault(); propose(); }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Describe the change, for example: Add a nickname column to users" disabled={!!busy}/>
        <button disabled={!!busy || text.trim().length < 3}>Propose</button>
      </form>
      <div className="prompt-suggestions inline">{EXAMPLES.map(x => <button key={x} onClick={() => setText(x)} disabled={!!busy}>{x}</button>)}</div>
      {busy && <div className="notice busy">{busy}</div>}
      {error && <div className="notice bad">{error}</div>}
    </section>

    <section className="panel">
      <div className="panel-header"><div><span className="panel-kicker">AUDIT TRAIL</span><h2>Migrations</h2></div><span className="demo-pill">{migs.length}</span></div>
      {migs.length === 0 && <p className="empty">No migrations yet. Describe a change above.</p>}
      {migs.map(m => <article key={m.id} className={`mig ${open === m.id ? "open" : ""}`}>
        <button className="mig-head" onClick={() => setOpen(open === m.id ? null : m.id)}>
          <span className="mig-id">#{m.id}</span><b>{m.request}</b><StatusPill status={m.status}/><small>{ago(m.created_at)}</small>
        </button>
        {open === m.id && <div className="mig-body">
          {m.summary && <p className="mig-summary">{m.summary}</p>}
          {m.up_sql ? <><span className="lab">MIGRATION</span><pre>{m.up_sql}</pre><span className="lab">ROLLBACK</span><pre>{m.down_sql}</pre></> : null}
          <div className="mig-facts"><span>Safety: <b>{m.safety_verdict ?? "-"}</b></span><span>Sandbox: <b>{m.sandbox_status ?? "not run"}</b></span><span>Approved by: <b>{m.approved_by ?? "-"}</b></span></div>
          {m.error && <div className="notice bad">{m.error}</div>}
          {NEXT[m.status] && <p className="hint">{NEXT[m.status]}</p>}
          <div className="mig-actions">{(ACTIONS[m.status] ?? []).map(a =>
            <button key={a.step} className={a.danger ? "ghost danger" : "solid"} disabled={!!busy} onClick={() => act(m, a.step)}>{a.label}</button>)}</div>
        </div>}
      </article>)}
    </section>
  </div>;
}

export function SchemaExplorer() {
  const [schema, setSchema] = useState<Schema | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.schema().then(setSchema).catch(e => setError(e.message)); }, []);
  if (error) return <div className="notice bad">{error}</div>;
  if (!schema) return <p className="empty">Loading the schema...</p>;
  return <div className="view-stack">
    <p className="empty left">PostgreSQL {schema.server_version.split(" ")[0]} · schema <b>{schema.schema_name}</b> · {schema.tables.length} tables</p>
    <div className="schema-grid">{schema.tables.map(t => <section key={t.name} className="panel schema-card">
      <div className="panel-header"><div><span className="panel-kicker">TABLE{t.estimated_rows !== null ? ` · ~${t.estimated_rows} ROWS` : ""}</span><h2>{t.name}</h2></div></div>
      <table className="cols"><tbody>{t.columns.map(c => <tr key={c.name}>
        <td>{c.name}{t.primary_key.includes(c.name) && <em>PK</em>}{t.foreign_keys.some(f => f.columns.includes(c.name)) && <em>FK</em>}</td>
        <td>{c.data_type}</td><td>{c.nullable ? "null" : "not null"}</td></tr>)}</tbody></table>
    </section>)}</div>
  </div>;
}

export function ComingSoon({ name }: { name: string }) {
  return <section className="panel"><div className="panel-header"><div><span className="panel-kicker">NOT BUILT YET</span><h2>{name}</h2></div></div>
    <p className="empty left">This part is planned, but the backend does not provide it yet. Migrations and Schema explorer are live.</p></section>;
}

