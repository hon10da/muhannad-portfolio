import { useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Github, Linkedin, Mail, Download, ExternalLink, Menu, X, ArrowDown } from "lucide-react";
import { specialties } from "./data/specialties"; import { projectFilters, type Project } from "./data/projects"; import type { Design } from "./data/designs"; import { useContent } from "./lib/content";
import SmartImage from "./components/SmartImage"; import Modal from "./components/Modal";

const nav = [["About", "#about"], ["Work", "#projects"], ["Designs", "#designs"], ["Skills", "#skills"], ["Experience", "#experience"], ["Contact", "#contact"]];
const reveal = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" }, transition: { duration: .5 } };
function Header() {
  const { profile } = useContent();
  const [open, setOpen] = useState(false);
  return (<header className="hdr"><a href="#top" className="mark" aria-label="Muhannad Salah, home"><span>{profile.initials}</span></a>
    <nav className={open ? "open" : ""} aria-label="Main">{nav.map(([l, h]) => <a key={h} href={h} onClick={() => setOpen(false)}>{l}</a>)}<a href="/admin/login" className="admin-link">Admin Sign In</a></nav>
    <button className="burger" aria-expanded={open} aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></header>);
}

function Hero({ spec, setSpec }: { spec: number; setSpec: (i: number) => void }) {
  const { profile } = useContent();
  const s = specialties[spec];
  return (<section id="top" className="hero" style={{ ["--accent" as string]: s.accent }}>
    <div className="glow" aria-hidden />
    <div className="hero-copy">
      <p className="eyebrow">{profile.eyebrow}</p>
      <h1>{profile.headline}</h1>
      <p className="lead">{profile.intro}</p>
      <div className="cta hero-cta"><a className="btn pri" href="#projects">Explore My Work</a><a className="btn" href="#contact">Let's Connect</a>
        {profile.cv && <a className="btn" href={profile.cv} download><Download size={16} /> Download CV</a>}</div>
      <div role="tablist" aria-label="Specialties" className="tabs">
        {specialties.map((x, i) => <button key={x.id} role="tab" aria-selected={i === spec} className={i === spec ? "on" : ""} onClick={() => setSpec(i)}>{x.label}</button>)}
      </div>
      <AnimatePresence mode="wait"><motion.div key={s.id} className="spec" role="tabpanel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }}>
        <h2>{s.title}</h2><p>{s.desc}</p>
        <div className="chips">{s.tools.map(t => <span key={t}>{t}</span>)}</div>
        <a className="link" href={s.link}>See {s.label} work <ArrowDown size={14} /></a>
      </motion.div></AnimatePresence>
    </div>
    <motion.div className="visual" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7 }}>
      <div className="canvas-layer l1" aria-hidden /><div className="canvas-layer l2" aria-hidden />
      <SmartImage src={profile.heroImage || profile.profileImage} alt="Portrait of Muhannad Salah" label="Profile photo (src/data/profile.ts)" ratio={profile.imageRatio} className="portrait" />
      <motion.div className="float code" aria-hidden animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity }}>
        <i /><i /><i /><pre>{`const me = {\n  design: true,\n  code: "React",\n  ai: "Python"\n};`}</pre></motion.div>
      <motion.div className="float ui" aria-hidden animate={{ y: [0, 8, 0] }} transition={{ duration: 7, repeat: Infinity }}>
        <b /><b /><b /></motion.div>
      <motion.div className="float viz" aria-hidden animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity }}>
        <svg viewBox="0 0 120 50"><polyline points="0,40 20,28 40,34 60,14 80,22 100,6 120,12" fill="none" stroke="currentColor" strokeWidth="2" />{[20, 60, 100].map(x => <circle key={x} cx={x} cy={x === 60 ? 14 : x === 20 ? 28 : 6} r="3" fill="currentColor" />)}</svg></motion.div>
    </motion.div></section>);
}

function About() {
  const { profile } = useContent();
  return (<section id="about" className="sec about"><motion.div {...reveal} className="about-img"><SmartImage src={profile.aboutImage || profile.profileImage} alt="Muhannad Salah" label="About photo" ratio={profile.imageRatio} /></motion.div>
    <motion.div {...reveal}><h2>One mindset, four disciplines.</h2>{profile.about.map(p => <p key={p}>{p}</p>)}
      <p className="muted">Languages: {profile.languages.join(" · ")}</p></motion.div></section>);
}

function ProjectModal({ p, close }: { p: Project; close: () => void }) {
  const shots = p.screenshots.length ? p.screenshots : [""];
  return (<Modal onClose={close} label={p.name}><SmartImage src={p.cover || p.thumbnail} alt={`${p.name} cover`} label={`${p.name} cover`} ratio="16/7" />
    <div className="mbody"><h3>{p.name}</h3><div className="chips">{p.tools.map(t => <span key={t}>{t}</span>)}</div>
      {p.notes && <p className="note">{p.notes}</p>}
      <h4>Overview</h4><p>{p.overview}</p><h4>Objective</h4><p>{p.objective}</p><h4>My contribution</h4><p>{p.contribution}</p>
      <h4>Key features</h4><ul>{p.features.map(f => <li key={f}>{f}</li>)}</ul>
      <h4>Screenshots</h4><div className="shots">{shots.map((s, i) => <SmartImage key={i} src={s} alt={`${p.name} screenshot ${i + 1}`} label={`public/images/projects/${p.id}/`} ratio="16/10" />)}</div>
      <div className="cta">{p.github ? <a className="btn" href={p.github} target="_blank" rel="noreferrer"><Github size={16} /> GitHub</a> : <span className="muted">Repository link not added yet</span>}
        {p.live ? <a className="btn pri" href={p.live} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Live demo</a> : <span className="muted">Live demo not added yet</span>}</div></div></Modal>);
}

function Projects({ filter, setFilter }: { filter: string; setFilter: (f: string) => void }) {
  const { projects } = useContent();
  const [sel, setSel] = useState<Project | null>(null);
  const list = useMemo(() => projects.filter(p => filter === "All Projects" || p.categories.includes(filter)), [filter]);
  return (<section id="projects" className="sec"><h2>Selected work</h2>
    <div className="filters" role="group" aria-label="Filter projects">{projectFilters.map(f => <button key={f} aria-pressed={f === filter} className={f === filter ? "on" : ""} onClick={() => setFilter(f)}>{f}</button>)}</div>
    <motion.div layout className="grid">
      <AnimatePresence mode="popLayout">{list.map((p, i) => (
        <motion.article layout key={p.id} className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * .06 }}>
          <SmartImage src={p.thumbnail} alt={`${p.name} thumbnail`} label={`${p.name} thumbnail`} />
          <div className="cbody"><small>{p.categories.join(" / ")}</small><h3>{p.name}</h3><p>{p.short}</p>
            <div className="chips">{p.tools.map(t => <span key={t}>{t}</span>)}</div>
            <div className="cta"><button className="btn" onClick={() => setSel(p)}>View Details</button>
              {p.github && <a className="icon" href={p.github} target="_blank" rel="noreferrer" aria-label={`${p.name} on GitHub`}><Github size={18} /></a>}
              {p.live && <a className="icon" href={p.live} target="_blank" rel="noreferrer" aria-label={`${p.name} live demo`}><ExternalLink size={18} /></a>}</div></div>
        </motion.article>))}</AnimatePresence></motion.div>
    {list.length === 0 && <p className="muted empty">No projects in this category yet.</p>}
    <AnimatePresence>{sel && <ProjectModal p={sel} close={() => setSel(null)} />}</AnimatePresence></section>);
}

function Designs() {
  const { designs, designCategories } = useContent();
  const [cat, setCat] = useState("All"); const [sel, setSel] = useState<Design | null>(null);
  const list = designs.filter(d => cat === "All" || d.category === cat);
  return (<section id="designs" className="sec"><h2>Graphic design</h2>
    <p className="muted">Items marked Placeholder are empty slots, not client work. Edit <code>src/data/designs.ts</code>.</p>
    <div className="filters" role="group" aria-label="Filter designs">{designCategories.map(f => <button key={f} aria-pressed={f === cat} className={f === cat ? "on" : ""} onClick={() => setCat(f)}>{f}</button>)}</div>
    <motion.div layout className="masonry"><AnimatePresence mode="popLayout">{list.map(d => (
      <motion.button layout key={d.id} className="tile" onClick={() => setSel(d)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-label={`Open ${d.title}`}>
        <SmartImage src={d.image} alt={d.title} label={d.image} ratio="1/1" />{d.placeholder && <span className="badge">Placeholder</span>}<span className="cap">{d.title}</span></motion.button>))}</AnimatePresence></motion.div>
    <AnimatePresence>{sel && <Modal onClose={() => setSel(null)} label={sel.title}><SmartImage src={sel.image} alt={sel.title} label={sel.image} ratio="4/3" fit="contain" />
      <div className="mbody"><h3>{sel.title}</h3><small>{sel.category}</small><p>{sel.description}</p>{sel.details && <p>{sel.details}</p>}
        <div className="chips">{sel.tools.map(t => <span key={t}>{t}</span>)}</div>{sel.placeholder && <p className="note">Placeholder: replace with real work.</p>}</div></Modal>}</AnimatePresence></section>);
}

function Skills() {
  const { skills } = useContent();
  return (<section id="skills" className="sec"><h2>Skills</h2><div className="skillgrid">{skills.map(g => (
    <motion.div key={g.group} {...reveal} className="skill"><h3>{g.group}</h3><div className="chips">{g.items.map(i => <span key={i}>{i}</span>)}</div></motion.div>))}</div></section>);
}

function Experience() {
  const { experience, education, certifications } = useContent();
  return (<section id="experience" className="sec"><h2>Experience & education</h2>
    <div className="timeline">{experience.map(e => (<motion.div {...reveal} key={e.role} className="tl"><small>{e.period}</small><h3>{e.role}</h3><p className="muted">{e.org}</p><ul>{e.points.map(p => <li key={p}>{p}</li>)}</ul></motion.div>))}
      {education.map(ed => <motion.div {...reveal} key={ed.degree} className="tl"><small>{ed.period}</small><h3>{ed.degree}</h3><p className="muted">{ed.school}</p></motion.div>)}</div>
    <h3 className="sub">Certifications & training</h3>
    <ul className="certs">{certifications.map(c => <li key={c.title}><strong>{c.title}</strong><span>{[c.issuer, c.date].filter(Boolean).join(", ")}</span></li>)}</ul></section>);
}

function Contact() {
  const { profile } = useContent();
  const [f, setF] = useState({ name: "", email: "", message: "" }); const [err, setErr] = useState<Record<string, string>>({}); const [msg, setMsg] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault(); const n: Record<string, string> = {};
    if (f.name.trim().length < 2) n.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) n.email = "Enter a valid email address.";
    if (f.message.trim().length < 10) n.message = "Write at least 10 characters.";
    setErr(n); setMsg(""); if (Object.keys(n).length) return;
    if (profile.formEndpoint) {
      try { const r = await fetch(profile.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(f) });
        setMsg(r.ok ? "Message sent." : "The service rejected the message. Use the email link below."); } catch { setMsg("Could not reach the service. Use the email link below."); }
    } else { location.href = `mailto:${profile.email}?subject=${encodeURIComponent("Portfolio inquiry from " + f.name)}&body=${encodeURIComponent(f.message + "\n\n" + f.name + " (" + f.email + ")")}`;
      setMsg("No email service is configured. Your email app should open with the message ready. Nothing has been sent yet."); }
  };
  const fld = (k: "name" | "email" | "message", l: string, t = "text") => (<label>{l}{k === "message" ? <textarea rows={5} value={f[k]} aria-invalid={!!err[k]} onChange={e => setF({ ...f, [k]: e.target.value })} /> : <input type={t} value={f[k]} aria-invalid={!!err[k]} onChange={e => setF({ ...f, [k]: e.target.value })} />}{err[k] && <em role="alert">{err[k]}</em>}</label>);
  return (<section id="contact" className="sec contact"><div><h2>Let's build something.</h2>
    <ul className="links"><li><a href={`mailto:${profile.email}`}><Mail size={16} /> {profile.email}</a></li><li><a href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={16} /> LinkedIn</a></li><li><a href={profile.github} target="_blank" rel="noreferrer"><Github size={16} /> GitHub</a></li></ul>
    <p className="muted">{profile.location}</p></div>
    <form onSubmit={submit} noValidate>{fld("name", "Name")}{fld("email", "Email", "email")}{fld("message", "Message")}
      <button className="btn pri" type="submit">{profile.formEndpoint ? "Send message" : "Open in email app"}</button>
      {!profile.formEndpoint && <p className="muted">Setup needed: no email service is connected, so this opens your email app.</p>}
      {msg && <p className="status" role="status">{msg}</p>}</form></section>);
}

export default function App() {
  const { profile } = useContent();
  const [spec, setSpecI] = useState(0); const [filter, setFilter] = useState("All Projects");
  const setSpec = (i: number) => { setSpecI(i); setFilter(specialties[i].filter === "Graphic Design" ? "All Projects" : specialties[i].filter); };
  return (<MotionConfig reducedMotion="user"><Header /><main><Hero spec={spec} setSpec={setSpec} /><About /><Projects filter={filter} setFilter={setFilter} /><Designs /><Skills /><Experience /><Contact /></main>
    <footer>© {new Date().getFullYear()} {profile.fullName}</footer></MotionConfig>);
}
