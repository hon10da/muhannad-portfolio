import { useState } from "react"; import { supabase, BUCKET } from "../lib/supabase"; import SmartImage from "../components/SmartImage";
export type F = { key: string; label: string; type: "text" | "url" | "textarea" | "list" | "image" | "images" | "file" | "bool" | "number" | "select" | "multi"; req?: boolean; options?: string[]; help?: string; folder?: string };
const IMG = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export async function upload(file: File, folder: string, pdf = false) {
  const okType = pdf ? file.type === "application/pdf" : IMG.includes(file.type);
  if (!okType) throw new Error(pdf ? "Only PDF files are allowed." : "Only JPG, PNG, WebP or GIF images are allowed.");
  if (file.size > (pdf ? 10 : 5) * 1048576) throw new Error(`File is too large (max ${pdf ? 10 : 5} MB).`);
  const path = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const { error } = await supabase!.storage.from(BUCKET).upload(path, file, { contentType: file.type, cacheControl: "3600" });
  if (error) throw error; return supabase!.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
export async function removeByUrl(url: string) { const m = `/object/public/${BUCKET}/`, i = url.indexOf(m); if (i >= 0) await supabase!.storage.from(BUCKET).remove([decodeURIComponent(url.slice(i + m.length))]); }
export function validate(fields: F[], v: Record<string, any>) {
  const e: Record<string, string> = {};
  for (const f of fields) { const x = v[f.key];
    if (f.req && (Array.isArray(x) ? x.filter(Boolean).length === 0 : !String(x ?? "").trim())) e[f.key] = "Required.";
    else if (f.type === "url" && x && !/^https?:\/\/\S+$/.test(x)) e[f.key] = "Must start with http:// or https://"; }
  return e;
}
function Up({ f, onDone, multi, pdf }: { f: F; onDone: (urls: string[]) => void; multi?: boolean; pdf?: boolean }) {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  return (<><input type="file" disabled={busy} multiple={multi} accept={pdf ? "application/pdf" : IMG.join(",")} aria-label={`Upload ${f.label}`} onChange={async e => {
    const files = Array.from(e.target.files || []); e.target.value = ""; if (!files.length) return; setBusy(true); setErr("");
    try { const urls: string[] = []; for (const x of files) urls.push(await upload(x, f.folder || "misc", pdf)); onDone(urls); } catch (x: any) { setErr(x.message || "Upload failed"); } setBusy(false); }} />
    {busy && <small role="status">Uploading…</small>}{err && <em role="alert">{err}</em>}</>);
}
export function Field({ f, value, onChange, error }: { f: F; value: any; onChange: (v: any) => void; error?: string }) {
  const err = error && <em role="alert">{error}</em>; const lab = <>{f.label}{f.req && " *"}</>;
  switch (f.type) {
    case "bool": return <label className="chk"><input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} /> {f.label}{f.help && <small>{f.help}</small>}</label>;
    case "textarea": return <label>{lab}<textarea rows={4} value={value ?? ""} aria-invalid={!!error} onChange={e => onChange(e.target.value)} />{err}</label>;
    case "list": return <label>{lab} <small>(one per line)</small><textarea rows={4} value={(value || []).join("\n")} aria-invalid={!!error} onChange={e => onChange(e.target.value.split("\n"))} />{err}</label>;
    case "number": return <label>{lab}<input type="number" value={value ?? 0} onChange={e => onChange(parseInt(e.target.value || "0", 10))} />{f.help && <small>{f.help}</small>}</label>;
    case "select": return <label>{lab}<select value={value ?? ""} aria-invalid={!!error} onChange={e => onChange(e.target.value)}><option value="">Select…</option>{f.options!.map(o => <option key={o}>{o}</option>)}</select>{err}</label>;
    case "multi": return <fieldset><legend>{lab}</legend><div className="chips">{f.options!.map(o => <label key={o} className="chk"><input type="checkbox" checked={(value || []).includes(o)} onChange={e => onChange(e.target.checked ? [...(value || []), o] : (value || []).filter((x: string) => x !== o))} /> {o}</label>)}</div>{err}</fieldset>;
    case "image": return (<div className="up"><span>{lab}</span><SmartImage src={value} alt={f.label} label={f.label} ratio="16/9" fit="contain" /><Up f={f} onDone={u => onChange(u[0])} />
      <input type="text" placeholder="…or paste an image URL / public path" value={value ?? ""} onChange={e => onChange(e.target.value)} />{value && <button type="button" className="btn" onClick={() => onChange("")}>Clear</button>}{err}</div>);
    case "images": return (<div className="up"><span>{lab}</span><div className="shots">{(value || []).map((u: string, i: number) => <div key={u + i}><SmartImage src={u} alt={`${f.label} ${i + 1}`} ratio="16/10" />
      <button type="button" className="btn" onClick={() => onChange((value || []).filter((_: string, j: number) => j !== i))}>Remove</button></div>)}</div><Up f={f} multi onDone={u => onChange([...(value || []), ...u])} />{err}</div>);
    case "file": return (<div className="up"><span>{lab}</span>{value ? <a href={value} target="_blank" rel="noreferrer">Current file</a> : <small>No file yet</small>}<Up f={f} pdf onDone={u => onChange(u[0])} /><input type="text" placeholder="…or paste a file URL / public path" value={value ?? ""} onChange={e => onChange(e.target.value)} />{err}</div>);
    default: return <label>{lab}<input type={f.type === "url" ? "url" : "text"} value={value ?? ""} aria-invalid={!!error} onChange={e => onChange(e.target.value)} />{f.help && <small>{f.help}</small>}{err}</label>;
  }
}
