# Admin sign-in and password recovery: troubleshooting

## Why you saw what you saw
| Symptom | Cause |
|---|---|
| Recovery link went to `localhost:3000` | New Supabase projects default **Site URL** to `http://localhost:3000`. Recovery emails send you to the Site URL (or to a custom Reset Password template). Emails sent before you changed it keep the old address. Nothing in this project uses port 3000. |
| `otp_expired` | The link was already used, is older than the OTP expiry, or an email scanner opened it first. The old link is dead; request a new one. |
| `email rate limit exceeded` | Supabase's built-in email service has a very low hourly limit and is for testing only. Stop requesting emails, wait, and set up custom SMTP (below). |
| "Sign-in failed" | The old login page hid the real error. It now shows the specific reason (wrong password, unconfirmed email, bad API key, unreachable URL). |

## Fix your admin account WITHOUT sending any email
1. **Authentication → Users**: find your user. If it says "Waiting for verification", it is unconfirmed and cannot sign in.
2. Easiest reliable fix: delete that user, then **Add user → Create new user**, enter your email and a password you choose, and tick **Auto Confirm User**.
3. Deleting a user also removes its `admin_users` row, so re-add it (SQL Editor):
```sql
insert into public.admin_users (user_id) select id from auth.users where email = 'YOUR_EMAIL';
select u.id, u.email, u.email_confirmed_at, a.user_id as is_admin from auth.users u left join public.admin_users a on a.user_id = u.id where u.email = 'YOUR_EMAIL';
```
`email_confirmed_at` must be filled and `is_admin` must equal `id`.

## Supabase settings to check
- **Authentication → URL Configuration**: Site URL `http://localhost:5173`. Redirect URLs: `http://localhost:5173/**` and `http://localhost:5173/admin/reset`. When you deploy, add your Cloudflare Pages domain the same way and switch the Site URL to it.
- **Authentication → Email Templates → Reset Password**: the link must use `{{ .ConfirmationURL }}`. A hardcoded `localhost:3000` here would override everything.
- **.env.local**: `VITE_SUPABASE_URL=https://YOUR-REF.supabase.co` (no `/rest/v1`) and `VITE_SUPABASE_ANON_KEY` = the **anon / publishable** key. Restart `npm run dev` after any change. The app now refuses a `service_role` / secret key and says so. If you ever pasted one there, rotate it in Supabase.

## Test the fix locally
1. `npm run dev`, open `http://localhost:5173/admin/login`, sign in with the account from the section above. A wrong password now shows a specific message.
2. After the rate-limit window (or after custom SMTP): **Forgot password?**, enter your email, open the email link **in the same browser**. You should land on `http://localhost:5173/admin/reset`; set a password and you are sent to `/admin`.
3. Re-open an already-used link: you get an "expired or already used" page with a way back, not a blank screen.

## Custom SMTP (do this separately; nothing here is configured for you)
1. Pick an email provider (for example Resend, Postmark, Brevo, SendGrid or Amazon SES).
2. **Verify a sending domain** you own in that provider: it gives you DNS records (SPF, DKIM, and ideally a DMARC policy). Add them at your DNS host and wait until the provider shows "verified".
3. Create SMTP credentials (or an API key used as the SMTP password) in the provider. Store them in a password manager.
4. Supabase → **Authentication → SMTP Settings** (also reachable from Project Settings): enable custom SMTP. Sender address must be on the verified domain (e.g. `no-reply@your-domain`). Enter host, port (465 or 587), username and password, then save. Review limits under **Authentication → Rate Limits**.
5. Send yourself a recovery email to test.
**Never** put SMTP credentials or any secret in `.env.local`, in the code, or in a `VITE_` variable: everything with `VITE_` is shipped to the browser. SMTP credentials live only inside Supabase's dashboard.
