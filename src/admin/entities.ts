import type { F } from "./Fields";
export type Entity = { table: string; title: string; label: string; sub?: string; fields: F[]; defaults: Record<string, any> };
const pub: F[] = [{ key: "sort_order", label: "Order", type: "number", help: "Lower numbers show first." }, { key: "published", label: "Published", type: "bool", help: "Unchecked = draft, hidden from visitors." }];
export const projectCats = ["Graphic Design", "Frontend", "Full Stack", "UI/UX", "AI / ML"];
export const designCats = ["Branding", "Social Media", "Banners", "Promotional", "UI/UX"];
export const entities: Record<string, Entity> = {
  projects: { table: "projects", title: "Projects", label: "name", sub: "short", defaults: { categories: [], tools: [], screenshots: [], features: [], featured: false, published: false, sort_order: 0 }, fields: [
    { key: "name", label: "Title", type: "text", req: true }, { key: "slug", label: "Slug", type: "text", help: "Short id, e.g. voltify" }, { key: "short", label: "Short description", type: "textarea", req: true },
    { key: "categories", label: "Categories", type: "multi", options: projectCats, req: true }, { key: "tools", label: "Technologies", type: "list" },
    { key: "thumbnail", label: "Thumbnail", type: "image", folder: "projects" }, { key: "cover", label: "Cover image", type: "image", folder: "projects" }, { key: "screenshots", label: "Gallery images", type: "images", folder: "projects" },
    { key: "live", label: "Demo URL", type: "url", help: "Leave empty if not deployed." }, { key: "github", label: "GitHub URL", type: "url", help: "Leave empty if not public." },
    { key: "overview", label: "Overview", type: "textarea" }, { key: "objective", label: "Objective", type: "textarea" }, { key: "contribution", label: "My contribution", type: "textarea" }, { key: "features", label: "Key features", type: "list" }, { key: "notes", label: "Notice (optional)", type: "textarea" },
    { key: "featured", label: "Featured (shown first)", type: "bool" }, ...pub] },
  designs: { table: "designs", title: "Designs", label: "title", sub: "category", defaults: { tools: [], published: false, sort_order: 0 }, fields: [
    { key: "title", label: "Title", type: "text", req: true }, { key: "category", label: "Category", type: "select", options: designCats, req: true }, { key: "image", label: "Image", type: "image", folder: "designs", req: true },
    { key: "description", label: "Description", type: "textarea", req: true }, { key: "tools", label: "Tools used", type: "list" }, { key: "details", label: "Details (optional)", type: "textarea" }, ...pub] },
  skills: { table: "skills", title: "Skills", label: "group_name", defaults: { items: [], published: false, sort_order: 0 }, fields: [{ key: "group_name", label: "Group", type: "text", req: true }, { key: "items", label: "Skills", type: "list", req: true }, ...pub] },
  experience: { table: "experience", title: "Experience", label: "role", sub: "org", defaults: { points: [], published: false, sort_order: 0 }, fields: [
    { key: "role", label: "Role", type: "text", req: true }, { key: "org", label: "Company", type: "text", req: true }, { key: "period", label: "Period", type: "text", req: true }, { key: "points", label: "Responsibilities", type: "list" }, ...pub] },
  education: { table: "education", title: "Education", label: "degree", sub: "school", defaults: { published: false, sort_order: 0 }, fields: [
    { key: "degree", label: "Degree", type: "text", req: true }, { key: "school", label: "School", type: "text", req: true }, { key: "period", label: "Period", type: "text" }, ...pub] },
  certifications: { table: "certifications", title: "Certifications", label: "title", sub: "issuer", defaults: { published: false, sort_order: 0 }, fields: [
    { key: "title", label: "Title", type: "text", req: true }, { key: "issuer", label: "Issuer", type: "text", req: true }, { key: "date_text", label: "Date", type: "text" }, ...pub] },
};
export const profileFields: F[] = [
  { key: "eyebrow", label: "Hero eyebrow", type: "text" }, { key: "headline", label: "Hero headline", type: "text", req: true }, { key: "intro", label: "Hero description", type: "textarea", req: true },
  { key: "profileImage", label: "Profile photo", type: "image", folder: "profile" }, { key: "heroImage", label: "Hero photo (optional)", type: "image", folder: "profile" }, { key: "aboutImage", label: "About photo (optional)", type: "image", folder: "profile" },
  { key: "imageRatio", label: "Photo ratio", type: "text", help: 'width/height, e.g. "1/1" or "4/5"' }, { key: "about", label: "Biography paragraphs", type: "list", req: true },
  { key: "email", label: "Email", type: "text", req: true }, { key: "phone", label: "Phone", type: "text" }, { key: "location", label: "Location", type: "text" }, { key: "github", label: "GitHub URL", type: "url" }, { key: "linkedin", label: "LinkedIn URL", type: "url" }, { key: "cv", label: "CV (PDF)", type: "file", folder: "files" },
];
