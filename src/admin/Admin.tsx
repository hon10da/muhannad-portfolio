import { useCallback, useEffect, useState, type FormEvent } from "react"; import { LogOut } from "lucide-react";
import type { Session } from "@supabase/supabase-js"; import { supabase, configured, configIssue, resetRedirectUrl } from "../lib/supabase";
import Manager, { type Notify } from "./Manager"; import { entities, profileFields } from "./entities"; import { Field, validate } from "./Fields";
import { profile as p0 } from "../data/profile"; import { projects as pj0 } from "../data/projects"; import { skills as s0 } from "../data/skills"; import { experience as e0, education as ed0 } from "../data/experience"; import { certifications as c0 } from "../data/certifications";
import "../styles.css"; import "./admin.css";

const authMsg = (e: { message?: string; status?: number; code?: string }) => {
  const m = (e.message || "").toLowerCase(), c = e.code || "";
  if (c === "email_not_confirmed" || m.includes("email not confirmed")) return "This email is not confirmed yet. In Supabase → Authentication → Users, confirm the user (or recreate it with Auto Confirm).";
  if (c === "invalid_credentials" || m.includes("invalid login")) return "Wrong email or password, or this user has no password set. Use “Forgot password?” or set one in Supabase.";
  if (e.status === 429 || m.includes("rate limit")) return "Too many emails or attempts. Supabase's built-in email allows only a few per hour. Wait about an hour, or set up custom SMTP (docs/ADMIN_SETUP.md).";
  if (m.includes("invalid api key") || e.status === 401) return "Supabase rejected the API key. Check VITE_SUPABASE_ANON_KEY in .env.local and restart the dev server.";
  if (m.includes("failed to fetch") || m.includes("network")) return "Could not reach Supabase. Check VITE_SUPABASE_URL and your connection.";
  return `Sign-in failed: ${e.message || "unknown error"}`;
};

function Login() {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState(""); const [ok, setOk] = useState(""); const [busy, setBusy] = useState(false); const [mode, setMode] = useState<"in" | "forgot">("in"); const [wait, setWait] = useState(0);
  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(t); }, [wait]);
  const go = async (e: FormEvent) => { e.preventDefault(); setErr(""); if (!email.trim() || !pw) return setErr("Enter your email and password."); setBusy(true);
    const { error } = await supabase!.auth.signInWithPassword({ email: email.trim(), password: pw }); setBusy(false); if (error) return setErr(authMsg(error)); location.assign("/admin"); };
  const forgot = async (e: FormEvent) => { e.preventDefault(); setErr(""); setOk(""); if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr("Enter a valid email address."); setBusy(true);
    const { error } = await supabase!.auth.resetPasswordForEmail(email.trim(), { redirectTo: resetRedirectUrl() }); setBusy(false);
    if (error) { if (error.status === 429 || /rate limit/i.test(error.message)) setWait(3600); return setErr(authMsg(error)); }
    setWait(60); setOk("If this email belongs to an account, a reset link has been sent. Open it in this same browser; links expire quickly and work once."); };
  return (<div className="login"><form onSubmit={mode === "in" ? go : forgot} noValidate><h2>{mode === "in" ? "Admin sign in" : "Reset password"}</h2>
    <label>Email<input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} /></label>
    {mode === "in" && <label>Password<input type="password" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} /></label>}
    {err && <em role="alert">{err}</em>}{ok && <p className="status" role="status">{ok}</p>}
    <button className="btn pri" disabled={busy || (mode === "forgot" && wait > 0)}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : wait > 0 ? `Resend in ${wait > 120 ? "about an hour" : wait + "s"}` : "Send reset link"}</button>
    <p className="muted"><button type="button" className="linkbtn" onClick={() => { setMode(mode === "in" ? "forgot" : "in"); setErr(""); setOk(""); }}>{mode === "in" ? "Forgot password?" : "← Back to sign in"}</button> · <a href="/">Back to site</a></p></form></div>);
}

function Reset() {
  const [msg, setMsg] = useState(""); const [state, setState] = useState<"wait" | "ready" | "bad" | "done">("wait"); const [pw, setPw] = useState(""); const [pw2, setPw2] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    const reload = () => location.reload(); addEventListener("hashchange", reload); // a second link opened in the same tab
    const p = new URLSearchParams(location.hash.replace(/^#/, "") + "&" + location.search.replace(/^\?/, "")); const code = p.get("error_code") || p.get("error");
    if (code) { setMsg(code === "otp_expired" ? "This reset link has expired or was already used. Reset links work once and expire quickly; some email apps open them automatically, which uses them up. Request a new one." : `The reset link failed: ${p.get("error_description")?.replace(/\+/g, " ") || code}. Request a new one.`); setState("bad"); history.replaceState(null, "", location.pathname); return () => removeEventListener("hashchange", reload); }
    let live = true; const { data: sub } = supabase!.auth.onAuthStateChange((ev, s) => { if (live && (ev === "PASSWORD_RECOVERY" || (ev === "SIGNED_IN" && s))) { setState("ready"); history.replaceState(null, "", location.pathname); } });
    // getSession() waits until Supabase has finished reading the link, so no artificial delay is needed.
    supabase!.auth.getSession().then(({ data }) => { if (!live) return; if (data.session) { setState("ready"); history.replaceState(null, "", location.pathname); } else { setMsg("Open this page from the link in the reset email. If you did, the link has probably expired. Request a new one."); setState("bad"); } });
    return () => { live = false; removeEventListener("hashchange", reload); sub.subscription.unsubscribe(); }; }, []);
  const save = async (e: FormEvent) => { e.preventDefault(); setErr(""); if (pw.length < 8) return setErr("Use at least 8 characters."); if (pw !== pw2) return setErr("Passwords do not match.");
    setBusy(true); const { error } = await supabase!.auth.updateUser({ password: pw }); setBusy(false); if (error) return setErr(error.message); setState("done"); setTimeout(() => location.assign("/admin"), 1200); };
  return (<div className="login"><form onSubmit={save} noValidate><h2>Set a new password</h2>
    {state === "wait" && <p className="muted" role="status">Checking your reset link…</p>}
    {state === "bad" && <><p role="alert">{msg}</p><a className="btn pri" href="/admin/login">Back to sign in</a></>}
    {state === "done" && <p className="status" role="status">Password updated. Redirecting…</p>}
    {state === "ready" && <><label>New password<input type="password" autoComplete="new-password" value={pw} onChange={e => setPw(e.target.value)} /></label><label>Confirm password<input type="password" autoComplete="new-password" value={pw2} onChange={e => setPw2(e.target.value)} /></label>
      {err && <em role="alert">{err}</em>}<button className="btn pri" disabled={busy}>{busy ? "Saving…" : "Update password"}</button></>}</form></div>);
}

function Dashboard({ notify }: { notify: Notify }) {
  const sb = supabase!; const [counts, setCounts] = useState<Record<string, number> | null>(null); const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { const out: Record<string, number> = {};
    for (const t of Object.keys(entities)) { const { count, error } = await sb.from(t).select("*", { count: "exact", head: true }); if (error) notify("err", error.message); out[t] = count ?? 0; } setCounts(out); }, []);
  useEffect(() => { load(); }, [load]);
  const empty = counts && Object.values(counts).every(n => n === 0);
  const importStarter = async () => {
    if (!confirm("Import your current local portfolio content (projects, skills, experience, education, certifications, profile) as published records?")) return; setBusy(true);
    const { name, fullName, initials, languages, formEndpoint, ...pd } = p0 as any; void name; void fullName; void initials; void languages; void formEndpoint;
    const ops = [sb.from("profile").upsert({ id: 1, data: pd }),
      sb.from("projects").insert(pj0.map((p, i) => ({ slug: p.id, name: p.name, categories: p.categories, short: p.short, tools: p.tools, thumbnail: p.thumbnail, cover: p.cover, screenshots: p.screenshots, github: p.github, live: p.live, overview: p.overview, objective: p.objective, contribution: p.contribution, features: p.features, notes: p.notes || "", featured: true, published: true, sort_order: i }))),
      sb.from("skills").insert(s0.map((s, i) => ({ group_name: s.group, items: s.items, published: true, sort_order: i }))),
      sb.from("experience").insert(e0.map((e, i) => ({ ...e, published: true, sort_order: i }))), sb.from("education").insert([{ ...ed0, published: true }]),
      sb.from("certifications").insert(c0.map((c, i) => ({ title: c.title, issuer: c.issuer, date_text: c.date, published: true, sort_order: i })))];
    const res = await Promise.all(ops); setBusy(false); const bad = res.find(r => r.error);
    bad ? notify("err", bad.error!.message) : notify("ok", "Starter content imported."); load();
  };
  return (<section><h2>Dashboard</h2>{!counts ? <p className="muted" role="status">Loading…</p> : <div className="stats">{Object.entries(counts).map(([t, n]) => <div className="stat" key={t}><b>{n}</b>{entities[t].title}</div>)}</div>}
    {empty && <div className="empty"><p>Your database is empty. Import the content currently in your local data files?</p><button className="btn pri" disabled={busy} onClick={importStarter}>{busy ? "Importing…" : "Import starter content"}</button></div>}
    <p className="muted">Design images start empty on purpose: upload real work in Designs.</p></section>);
}

function ProfileEditor({ notify }: { notify: Notify }) {
  const sb = supabase!; const [v, setV] = useState<Record<string, any> | null>(null); const [errs, setErrs] = useState<Record<string, string>>({}); const [saving, setSaving] = useState(false);
  useEffect(() => { sb.from("profile").select("data").eq("id", 1).maybeSingle().then(({ data, error }) => { if (error) notify("err", error.message); setV({ ...p0, ...(data?.data || {}) }); }); }, []);
  if (!v) return <p className="muted" role="status">Loading…</p>;
  const save = async (e: FormEvent) => { e.preventDefault(); const er = validate(profileFields, v); setErrs(er); if (Object.keys(er).length) return notify("err", "Please fix the highlighted fields.");
    const data: Record<string, any> = {}; for (const f of profileFields) data[f.key] = f.type === "list" ? (v[f.key] || []).map((x: string) => x.trim()).filter(Boolean) : v[f.key] ?? "";
    setSaving(true); const { error } = await sb.from("profile").upsert({ id: 1, data }); setSaving(false); error ? notify("err", error.message) : notify("ok", "Profile saved."); };
  return (<section><h2>Profile</h2><form className="form" noValidate onSubmit={save}>{profileFields.map(f => <Field key={f.key} f={f} value={v[f.key]} error={errs[f.key]} onChange={x => setV({ ...v, [f.key]: x })} />)}
    <div><button className="btn pri" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button></div></form></section>);
}

export default function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined); const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState("dashboard"); const [toast, setToast] = useState<{ type: string; text: string } | null>(null);
  const notify: Notify = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 4500); };
  const onLogin = location.pathname.startsWith("/admin/login"), onReset = location.pathname.startsWith("/admin/reset");
  useEffect(() => { document.title = "Admin — Muhannad Salah"; const m = document.createElement("meta"); m.name = "robots"; m.content = "noindex,nofollow"; document.head.append(m); }, []);
  useEffect(() => { if (!supabase) return; supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s)); return () => sub.subscription.unsubscribe(); }, []);
  useEffect(() => { if (!supabase || !session) { setIsAdmin(null); return; } supabase.from("admin_users").select("user_id").eq("user_id", session.user.id).maybeSingle().then(({ data, error }) => { if (error) console.warn("admin check failed:", error.message); setIsAdmin(!!data); }); }, [session]);
  if (!configured) return <div className="login"><div><h2>{configIssue === "secret-key" ? "Wrong Supabase key" : "Supabase is not configured"}</h2><p className="muted">{configIssue === "secret-key" ? "VITE_SUPABASE_ANON_KEY contains a secret/service_role key. Never use it in the browser. Replace it with the anon (public) key and rotate the exposed key in Supabase." : configIssue === "bad-url" ? "VITE_SUPABASE_URL must look like https://YOUR-REF.supabase.co with no path (no /rest/v1)." : <>Create <code>.env.local</code> from <code>.env.example</code> and restart the dev server.</>} See docs/ADMIN_SETUP.md.</p><a href="/">← Back to site</a></div></div>;
  if (onReset) return <Reset />;
  if (session === undefined) return <div className="boot" role="status">Loading…</div>;
  if (!session) { if (!onLogin) { location.replace("/admin/login"); return null; } return <Login />; }
  if (isAdmin === null) return <div className="boot" role="status">Checking access…</div>;
  if (!isAdmin) return <div className="login"><div><h2>Not authorized</h2><p className="muted">This account is not on the admin list.</p><button className="btn" onClick={() => supabase!.auth.signOut()}>Sign out</button></div></div>;
  if (onLogin) { location.replace("/admin"); return null; }
  const tabs: [string, string][] = [["dashboard", "Dashboard"], ["profile", "Profile"], ...Object.entries(entities).map(([k, e]) => [k, e.title] as [string, string])];
  return (<div className="adm"><aside className="side"><a className="mark" href="/" aria-label="View site"><span>MS</span></a>{tabs.map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}
    <button onClick={() => supabase!.auth.signOut().then(() => location.assign("/admin/login"))}><LogOut size={14} /> Sign out</button></aside>
    <main className="main">{tab === "dashboard" ? <Dashboard notify={notify} /> : tab === "profile" ? <ProfileEditor notify={notify} /> : <Manager key={tab} cfg={entities[tab]} notify={notify} />}</main>
    {toast && <div className={`toast ${toast.type}`} role="status">{toast.text}</div>}</div>);
}
