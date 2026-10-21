import { lazy, Suspense } from "react"; import { createRoot } from "react-dom/client"; import App from "./App"; import { ContentProvider } from "./lib/content"; import "./styles.css";
const Admin = lazy(() => import("./admin/Admin"));
const isAdmin = location.pathname.startsWith("/admin");
// A recovery/error link that landed on the site root (e.g. Site URL) is forwarded to the reset page with its token intact.
if (!isAdmin && /type=recovery|error_code=/.test(location.hash)) location.replace("/admin/reset" + location.search + location.hash);
createRoot(document.getElementById("root")!).render(isAdmin ? <Suspense fallback={<div className="boot">Loading…</div>}><Admin /></Suspense> : <ContentProvider><App /></ContentProvider>);
