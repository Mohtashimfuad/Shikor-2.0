# Shikor Phase 1 Identity and Officer Approval Design

## Goal and constraints

Implement citizen signup, officer application and approval, and trusted role-based access in the existing Shikor frontend. Preserve the current Shikor visual design and Land Records experience, keep the current Supabase project, avoid storing passwords outside Supabase Auth, and keep private identity and officer documents out of public queries and logs. Bangla is the initial language; English remains available.

## Current project

The repository is a Vite/React SPA with a `PageView` state switcher, not a Next.js app. It has Supabase Auth through `@supabase/supabase-js`, an existing `profiles` table linked to `auth.users`, and existing land-record tables. There are no checked-in Supabase migrations. The connected Shikor project has the same core tables, one pre-existing profile, no migration history, profile self-read/update policies, public read/insert policies on claims, and public upload/read/update policies on `citizen-evidence`. The existing signup combines auth with legacy claim submission. Several auth/UI files have pre-existing uncommitted changes; implementation must preserve and build on them.

## Design

### Identity and access

- Citizens sign up with Supabase email/password Auth. Email confirmation is required. A database trigger creates their `profiles` row with role `citizen`; the trigger ignores client role metadata. The current `profiles` table remains the profile source and its NID field remains accessible only under owner/admin authorization.
- An officer applicant must first hold a verified citizen Auth account. Officer applications are linked to that account UUID; approval promotes that same account, never creates a duplicate. The UI explains that a person without an account must complete citizen signup and email verification first.
- Effective roles come from a database function that checks a private one-row admin authority table or the applicant's approved application and `profiles.role`. Admin is a configured Auth UUID, not a client-editable profile value. Public Admin signup is not added.
- Admin bootstrap is a one-time SQL operation by the Supabase project owner, selecting an already email-verified Auth UUID. The singleton constraint prevents a second admin from being added through the same mechanism.

### Officer review and email

- Add `officer_applications` and `officer_application_events`; do not create a second general-purpose users/profiles table. Applicants can insert a draft, upload the appointment letter to a private bucket, and submit it as pending only after the file exists. They can read their own status and history. Admin-only reads expose application details and private document paths.
- Appointment letters are restricted to PDF/JPEG/PNG/WebP and 10 MB. Storage RLS checks both the applicant UUID folder and matching draft application. Admin document review uses a short-lived signed URL after authorization.
- A JWT-protected `officer-admin` Edge Function calls admin-only database functions for approve/reject and notification state. Approval verifies email confirmation, atomically updates application status/profile role/history, then sends a Supabase recovery/password-setup link through Resend. No password is emailed. Rejection requires a reason. Notification errors are recorded without undoing approval; retry sends notification only and cannot repeat the decision.

### RLS and compatibility

- Add RLS and narrow grants for `profiles`, officer applications/events, claims, and storage. Revoke public claim insert/read and public `citizen-evidence` file operations; restrict claim reads/inserts to their authenticated claimant so linked citizen data is not publicly enumerable. Keep existing mock-backed Land Records UI unchanged. The separate appointment-letter bucket remains private.
- Preserve legacy profile role values in the schema during migration for data compatibility, but only `citizen`, approved `officer`, or the trusted admin UUID receives Phase 1 access. An unapproved legacy role does not count as officer authorization.
- No service-role credential is added to browser env or browser code. NID values and document names are never written to application logs or public pages.

### UI and language

- Extend the existing SPA page switcher with officer registration/status, officer dashboard, admin review, and password setup views. Keep the navbar styling, card patterns, spacing, mobile behavior, and existing Land Records page.
- Add Citizen Login and Officer Login modes. Both authenticate through Supabase Auth and then check the effective database role and officer application state. Admin access is resolved only from trusted database authorization. Pending/rejected officers receive Bangla-first status messages.
- Persist language selection and use Bangla when no preference exists. Translate new forms, statuses, actions, errors, and empty states in Bangla and English.

## Operational requirements

The repository migration must be applied to the connected Shikor database before live signup/approval flows work. Configure Supabase Auth email confirmation and redirect URL, deploy `officer-admin`, and set the Resend API key, verified sender, and public app URL. Bootstrap the first admin UUID through the documented project-owner SQL procedure. Local build/type checks and deterministic validation/access tests can run here; end-to-end live Auth/email delivery depends on those external settings.

## Known verification boundary

The initial checks show `npm run build` passes, while `npm run lint` fails due to the pre-existing in-progress migration from `UserSession` to `AuthProfile` in `CitizenProfileView.tsx`. There are no automated tests or test script yet. This phase will add focused tests around authorization decisions and validation, then rerun all configured checks.
