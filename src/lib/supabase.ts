import { createClient } from "@supabase/supabase-js";
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim().replace(/\/+$/, "");
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
const role = (k: string) => { try { return JSON.parse(atob(k.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).role as string; } catch { return ""; } };
const validUrl = (u: string) => { try { const x = new URL(u); return /^https?:$/.test(x.protocol) && x.pathname === "/"; } catch { return false; } };
// "" = OK. Anything else explains why the admin cannot work, and keeps the key from ever being used.
export const configIssue: "" | "missing" | "bad-url" | "secret-key" =
  !url || !key ? "missing" : !validUrl(url) ? "bad-url" : key.startsWith("sb_secret_") || role(key) === "service_role" ? "secret-key" : "";
export const configured = configIssue === "";
export const supabase = configured ? createClient(url!, key!) : null;
export const BUCKET = "portfolio";
// Always built from the page you are on, so it is correct on localhost:5173 and in production. Never hardcoded.
export const resetRedirectUrl = () => `${location.origin}/admin/reset`;
