# Initial Shikor administrator bootstrap

There is no public Admin signup. Bootstrap exactly one administrator after applying the Phase 1 migration:

1. Create the administrator's account through the normal citizen signup flow and complete email verification. Do not share the account password.
2. In Supabase Dashboard → Authentication → Users, copy that verified user's UUID. Confirm the UUID belongs to the intended administrator.
3. As the Supabase project owner, run this once in SQL Editor, replacing the UUID with the verified Auth UUID:

   ```sql
   insert into private.admin_authority (singleton, user_id)
   select true, u.id
   from auth.users u
   where u.id = 'REPLACE-WITH-VERIFIED-AUTH-UUID'::uuid
     and u.email_confirmed_at is not null
   on conflict (singleton) do nothing;
   ```

4. Confirm the statement inserted one row. The singleton constraint prevents a second administrator from being added. If the wrong UUID was bootstrapped, correct it only from the trusted Supabase SQL Editor after verifying the intended account.
5. Sign in through the Admin Login option and confirm the protected Admin dashboard opens.

The UI cannot read or write `private.admin_authority`; Admin access is resolved by database functions and RLS. Do not put an Admin UUID allowlist or service-role credential in browser code.

## Supabase Edge Function and email setup

The `citizen-signup` and `officer-admin` functions are deployed. Citizen signup is public because it creates new accounts; it validates input, sends signup to Supabase Auth, and returns no Auth user or NID metadata. The approval function requires a valid JWT and separately verifies the trusted Admin role. Configure these Edge Function secrets in Supabase Dashboard (or with `supabase secrets set`):

- `APP_PUBLIC_URL`: the exact public origin for the Shikor app, with no trailing slash. Both functions require it. Allow `/?page=profile` and `/?page=account-activation` in the Supabase Auth redirect URL list.
- `RESEND_API_KEY`: API key for the configured Resend account.
- `OFFICER_MAIL_FROM`: sender address on a domain verified with Resend, for example `Shikor <officers@example.org>`.
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are provided to Supabase Edge Functions. The service role key must remain server-side.

If the mail provider or sender is not configured, the approval/rejection decision remains saved and the application shows a failed notification that the Admin can retry after configuration is corrected. Approval mail contains a short-lived Supabase recovery link for password setup; it never contains a password.

In Supabase Authentication settings, enable email confirmations for the Email provider. Set the app's public origin as the Site URL and allow both confirmation and recovery redirects. Configure SMTP for reliable production confirmation delivery; the app refuses access until Supabase marks the email verified, even if a user can authenticate.
