# Muhannad Salah — Portfolio (React + Vite + TypeScript + Framer Motion)

## Run
```
npm install
npm run dev      # local preview
npm run build    # production build (type-checks first)
```

## Where things go (all paths are relative to `public/`)
| What | Folder |
|---|---|
| Profile photo | `public/images/profile/` (currently `profile.png`) |
| Graphic design images | `public/images/designs/` |
| Project screenshots | `public/images/projects/voltify/`, `flowtic/`, `ddi/` |
| CV | `public/files/Muhannad_Salah_CV.pdf` |

## Replace your profile photo
1. Put the new file in `public/images/profile/` (e.g. `me.jpg`).
2. Open `src/data/profile.ts` and set `profileImage: "/images/profile/me.jpg"`.
3. Optional: set `heroImage` and `aboutImage` for different photos. Empty = use `profileImage`. All empty = abstract placeholder.

## Add a graphic design
1. Drop `my-logo.jpg` into `public/images/designs/`.
2. In `src/data/designs.ts` add one entry:
`{ id:"my-logo", title:"My Logo", category:"Branding", image:"/images/designs/my-logo.jpg", description:"...", tools:["Illustrator"] }`
3. **Order in the array = order in the gallery.** Delete an entry to remove it. Remove `placeholder:true` from real work.
Categories come from `designCategories` in the same file.

## Add or edit a project
Edit `src/data/projects.ts`. Set `thumbnail`, `cover`, `screenshots` (e.g. `"/images/projects/voltify/home.png"`), and fill `github` / `live` only with real URLs. Empty values show an "Asset needed" placeholder; the layout never breaks.

## Other edits
- Personal info, contact, about text: `src/data/profile.ts`
- Skills / experience / certifications: `skills.ts`, `experience.ts`, `certifications.ts`
- Colors and fonts: top of `src/styles.css` (`:root` variables) and the font link in `index.html`
- Contact form: with no `formEndpoint` in `profile.ts` it opens your email app (nothing is sent by the site). Paste a Formspree-style endpoint to enable real sending.

## Deploy to Vercel
Push to GitHub, import the repo in Vercel (framework: Vite, build `npm run build`, output `dist`).

## Before publishing checklist
- [ ] Confirm profile photo you want public
- [ ] Real design images + entries (remove `placeholder:true`)
- [ ] Screenshots for Voltify, Flowtic, DDI
- [ ] Real GitHub repo / live URLs (Voltify is on Vercel: add its URL)
- [ ] DDI: dataset, architecture, metrics if you want them shown
- [ ] Optional: contact form endpoint, OG share image

## Admin dashboard
Content can be managed at `/admin` once Supabase is configured. Setup, security tests and Cloudflare Pages deployment: see `docs/ADMIN_SETUP.md`. Without `.env.local`, the site uses the local `src/data/*.ts` files as before.
