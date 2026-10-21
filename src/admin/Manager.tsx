import { useCallback, useEffect, useState } from "react"; import { AnimatePresence } from "framer-motion"; import { Plus } from "lucide-react";
import { supabase } from "../lib/supabase"; import Modal from "../components/Modal"; import { Field, validate, removeByUrl } from "./Fields"; import type { Entity } from "./entities";
export type Notify = (type: "ok" | "err", text: string) => void;
type Row = Record<string, any>;
export default function Manager({ cfg, notify }: { cfg: Entity; notify: Notify }) {
  const sb = supabase!; const [rows, setRows] = useState<Row[] | null>(null); const [edit, setEdit] = useState<Row | null>(null); const [errs, setErrs] = useState<Record<string, string>>({}); const [saving, setSaving] = useState(false);
  const load = useCallback(async () => { setRows(null); const { data, error } = await sb.from(cfg.table).select("*").order("sort_order").order("created_at"); if (error) { notify("err", error.message); setRows([]); } else setRows(data); }, [cfg.table]);
  useEffect(() => { load(); setEdit(null); }, [load]);
  const media = cfg.fields.filter(f => f.type === "image" || f.type === "images");
  const save = async () => {
    const e = validate(cfg.fields, edit!); setErrs(e); if (Object.keys(e).length) return notify("err", "Please fix the highlighted fields.");
    const body: Row = {}; for (const f of cfg.fields) { const v = edit![f.key]; body[f.key] = f.type === "list" ? (v || []).map((x: string) => x.trim()).filter(Boolean) : f.type === "images" ? (v || []) : (typeof v === "string" ? v.trim() : v) ?? ""; }
    if (cfg.table === "projects" && !body.slug) body.slug = String(body.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setSaving(true); const r = edit!.id ? await sb.from(cfg.table).update(body).eq("id", edit!.id) : await sb.from(cfg.table).insert(body); setSaving(false);
    if (r.error) return notify("err", r.error.message); notify("ok", "Saved."); setEdit(null); load();
  };
  const del = async (r: Row) => {
    if (!confirm(`Delete "${r[cfg.label]}"? This cannot be undone.`)) return;
    const { error } = await sb.from(cfg.table).delete().eq("id", r.id); if (error) return notify("err", error.message);
    for (const f of media) for (const u of [].concat(r[f.key] || [])) await removeByUrl(u).catch(() => {});
    notify("ok", "Deleted."); load();
  };
  const toggle = async (r: Row) => { const { error } = await sb.from(cfg.table).update({ published: !r.published }).eq("id", r.id); error ? notify("err", error.message) : (notify("ok", r.published ? "Unpublished." : "Published."), load()); };
  return (<section><div className="bar"><h2>{cfg.title}</h2><button className="btn pri" onClick={() => { setErrs({}); setEdit({ ...cfg.defaults }); }}><Plus size={16} /> Add new</button></div>
    {rows === null && <p className="muted" role="status">Loading…</p>}
    {rows?.length === 0 && <p className="empty">No {cfg.title.toLowerCase()} yet. Add one, or import your starter content from the Dashboard.</p>}
    <ul className="rows">{rows?.map(r => (<li key={r.id}>{media[0] && <img className="thumb" src={[].concat(r[media[0].key] || [])[0] || ""} alt="" onError={e => (e.currentTarget.style.visibility = "hidden")} />}
      <div><strong>{r[cfg.label]}</strong>{cfg.sub && <small>{String(r[cfg.sub] ?? "").slice(0, 90)}</small>}</div>
      <span className={`pill ${r.published ? "on" : ""}`}>{r.published ? "Published" : "Draft"}</span>
      <div className="acts"><button className="btn" onClick={() => toggle(r)}>{r.published ? "Unpublish" : "Publish"}</button><button className="btn" onClick={() => { setErrs({}); setEdit({ ...r }); }}>Edit</button><button className="btn danger" onClick={() => del(r)}>Delete</button></div></li>))}</ul>
    <AnimatePresence>{edit && <Modal onClose={() => !saving && setEdit(null)} label={`${edit.id ? "Edit" : "Add"} ${cfg.title}`}><form className="mbody form" noValidate onSubmit={e => { e.preventDefault(); save(); }}>
      <h3>{edit.id ? "Edit" : "Add"} — {cfg.title}</h3>{cfg.fields.map(f => <Field key={f.key} f={f} value={edit[f.key]} error={errs[f.key]} onChange={v => setEdit({ ...edit, [f.key]: v })} />)}
      <div className="cta"><button className="btn pri" type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</button><button type="button" className="btn" disabled={saving} onClick={() => setEdit(null)}>Cancel</button></div></form></Modal>}</AnimatePresence></section>);
}
