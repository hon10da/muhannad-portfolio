# Admin dashboard setup (Supabase + Cloudflare Pages)

## 1. Create the Supabase project
1. supabase.com → New project. Save the database password somewhere private (the app never needs it).
2. Project Settings → API: copy the **Project URL** and the **anon public** key. Never use the `service_role` key in this project.

## 2. Configure authentication
1. Authentication → Providers → Email: keep enabled.
2. Authentication → Sign In / Providers (settings): **turn OFF "Allow new users to sign up"**. The app has no signup form either way, and even a signed-up user has no admin rights unless listed in `admin_users`.
3. Authentication → URL Configuration: set Site URL to your deployed domain (for local work: Site URL `http://localhost:5173`, redirect URLs `http://localhost:5173/**` and `http://localhost:5173/admin/reset`). Having trouble signing in or resetting a password? See `docs/AUTH_TROUBLESHOOTING.md`.

## 3. Run the migration
SQL Editor → paste all of `supabase/migrations/001_schema.sql` → Run. It creates the tables, RLS policies, the `is_admin()` function and the `portfolio` Storage bucket with its policies. Run it once; re-running will error on existing objects.

## 4. Create the first admin (safely)
1. Authentication → Users → **Add user** → enter your email and a strong password you choose (tick auto-confirm). Do not put the password in any file.
2. SQL Editor, replacing the email:
```sql
insert into public.admin_users (user_id) select id from auth.users where email = 'you@example.com';
```
Admins can only be added this way. The API roles have no insert permission on `admin_users`.

## 5. Local setup
```
cp .env.example .env.local     # fill in the two values from step 1
npm install && npm run dev
```
Open `http://localhost:5173/admin/login`. On the Dashboard, click **Import starter content** once to load your current CV content as published records. Design images start empty on purpose.

## 6. Test the security yourself (do this before trusting it)
Replace the placeholders and run in a terminal (anon key only):
```
# 1. Unpublished rows must NOT appear (create a Draft project first, then check it's absent):
curl "$URL/rest/v1/projects?select=name,published" -H "apikey: $ANON" -H "Authorization: Bearer $ANON"
# 2. Anonymous writes must be rejected (expect an error / 401 / 403, not 201):
curl -X POST "$URL/rest/v1/projects" -H "apikey: $ANON" -H "Authorization: Bearer $ANON" -H "Content-Type: application/json" -d '{"name":"x"}'
# 3. Anonymous upload must be rejected:
curl -X POST "$URL/storage/v1/object/portfolio/test.txt" -H "apikey: $ANON" -H "Authorization: Bearer $ANON" -d x
```
Also: sign up a second test user in Auth → Users (not in `admin_users`), sign in at /admin/login, and confirm you see "Not authorized" and that writes from that user fail.

## 7. Cloudflare Pages
- Connect the Git repo. Framework preset: Vite (or None).
- Build command: `npm run build` · Build output directory: `dist` · Root directory: `/`
- Environment variables (Production and Preview): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `NODE_VERSION=20`
- `public/_redirects` makes `/admin` and `/admin/login` work on refresh. Variables are baked in at build time, so redeploy after changing them.

## Notes and limits
- Deleting a record also deletes its uploaded images from Storage (best effort). Replacing an image leaves the old file in Storage; remove it in Supabase → Storage if needed.
- Gallery images can be added and removed but not reordered yet.
- Image paths such as `/images/profile/profile.png` still work in image fields, so local files and uploaded files can be mixed.
