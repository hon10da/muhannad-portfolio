import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase, configured } from "./supabase";
import { profile as p0 } from "../data/profile"; import { projects as pj0, type Project } from "../data/projects";
import { designs as d0, designCategories as dc0, type Design } from "../data/designs"; import { skills as s0 } from "../data/skills";
import { experience as e0, education as ed0 } from "../data/experience"; import { certifications as c0 } from "../data/certifications";
export type Content = { profile: typeof p0; projects: Project[]; designs: Design[]; skills: typeof s0; experience: typeof e0; education: (typeof ed0)[]; certifications: typeof c0; designCategories: string[] };
const local: Content = { profile: p0, projects: pj0, designs: d0, skills: s0, experience: e0, education: [ed0], certifications: c0, designCategories: dc0 };
const Ctx = createContext<Content>(local);
export const useContent = () => useContext(Ctx);
export function ContentProvider({ children }: { children: ReactNode }) {
  const [c, setC] = useState<Content | null>(configured ? null : local);
  useEffect(() => { const sb = supabase; if (!sb) return; (async () => {
    try {
      const o = (t: string) => sb.from(t).select("*").order("sort_order").order("created_at");
      const r = await Promise.all([sb.from("profile").select("data").eq("id", 1).maybeSingle(), sb.from("projects").select("*").order("featured", { ascending: false }).order("sort_order"), o("designs"), o("skills"), o("experience"), o("education"), o("certifications")]);
      const bad = r.find(x => x.error); if (bad) throw bad.error;
      const [pr, pj, ds, sk, ex, ed, ce] = r.map(x => x.data) as any[];
      const designs: Design[] = (ds || []).map((d: any) => ({ id: d.id, title: d.title, category: d.category, image: d.image, description: d.description, tools: d.tools, details: d.details || undefined }));
      setC({ profile: { ...p0, ...(pr?.data || {}) },
        projects: (pj || []).map((p: any) => ({ id: p.slug || p.id, name: p.name, categories: p.categories, short: p.short, tools: p.tools, thumbnail: p.thumbnail, cover: p.cover, screenshots: p.screenshots, github: p.github, live: p.live, overview: p.overview, objective: p.objective, contribution: p.contribution, features: p.features, notes: p.notes || undefined })),
        designs, skills: (sk || []).map((s: any) => ({ group: s.group_name, items: s.items })), experience: (ex || []).map((e: any) => ({ role: e.role, org: e.org, period: e.period, points: e.points })),
        education: (ed || []).map((e: any) => ({ degree: e.degree, school: e.school, period: e.period })), certifications: (ce || []).map((x: any) => ({ title: x.title, issuer: x.issuer, date: x.date_text })),
        designCategories: ["All", ...Array.from(new Set([...dc0.slice(1), ...designs.map(d => d.category)]))] });
    } catch (e) { console.warn("Supabase load failed, using local data:", e); setC(local); }
  })(); }, []);
  if (!c) return <div className="boot" role="status">Loading…</div>;
  return <Ctx.Provider value={c}>{children}</Ctx.Provider>;
}
