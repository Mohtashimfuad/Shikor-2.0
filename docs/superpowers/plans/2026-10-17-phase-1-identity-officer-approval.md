# Shikor Phase 1 Identity and Officer Approval Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement secure citizen signup and a single-admin officer approval workflow in the existing Shikor SPA and Supabase project.

**Architecture:** Reuse `profiles` and Supabase Auth. Add a narrow migration for officer applications, history, private admin authority, and bucket policies; use RLS plus admin-only SQL functions for access and decisions. A JWT-protected Edge Function sends approval/rejection email using Resend and supports notification-only retries.

**Tech Stack:** Vite, React, TypeScript, `@supabase/supabase-js`, Supabase Postgres RLS/Storage/Auth/Edge Functions, Resend, Node test runner via existing `tsx`.

**Spec:** `docs/superpowers/specs/2026-10-17-phase-1-identity-officer-approval-design.md`

## Global Constraints

- Do not replace the Vite SPA or existing Shikor visual system.
- Reuse `public.profiles`; do not store passwords in application tables.
- Only a database trigger may create citizen roles; only admin approval may grant officer roles.
- Keep NID, officer application details, and appointment letters private; do not log them.
- Require verified email before officer application submission and activation.
- Keep admin identity in private database configuration, not client profile metadata.
- Public Admin signup is not allowed.
- Bangla is default; English remains selectable.
- Keep pre-existing uncommitted user changes and the existing Land Records behavior.

## Review Focus

- Client-supplied role changes and direct profile writes — test role resolver and ensure user grants exclude role writes.
- Missing, oversized, or unsupported appointment letters — test file validation and check database submission requires a stored file.
- Duplicate or repeated decisions — test state transition guards and review partial unique indexes.
- Pending/rejected officer login — test role resolver and render explicit status messages.
- Email provider failure after approval — test notification status/retry transitions do not undo or reapply approval.

---

### Task 1: Validation and access decision helpers

**Files:**
- Create: `src/lib/phase1.ts`
- Create: `tests/phase1.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces `validateCitizenSignup`, `validateOfficerApplication`, `resolveLoginDestination`, and `validateAppointmentLetter` for UI use.

- [x] Add failing tests for required citizen fields/consent, employee details and attachment bounds, and citizen/officer/admin/pending/rejected destinations.
- [x] Run the focused tests red then green using `node --import tsx --test`.
- [x] Implement the pure helpers and add the `test` script.
- [x] Rerun focused and static migration tests.

### Task 2: Supabase migration and admin bootstrap guide

**Files:**
- Create: five tracked migrations under `supabase/migrations/` matching the applied versions
- Create: `supabase/ADMIN_BOOTSTRAP.md`

**Interfaces:**
- Migration produces private admin predicate, current-role resolver, signup profile trigger, application submit/decision/notification RPCs, RLS policies, and private `officer-appointment-letters` bucket.

- [x] Write static tests for key privilege boundaries before applying the migration.
- [x] Replace only broad policies that conflict with privacy; reuse existing profile and claims tables.
- [x] Define applicant/admin policy paths, atomic pending-to-approved/rejected operations, and notification-only retry state.
- [x] Document owner-only bootstrap for a verified Auth UUID and email setup.
- [x] Apply five migrations to the connected Supabase project and verify live RLS/policies.
- [x] Restrict citizen claim inserts to source facts; prevent client-set verification fields or certificate issuance.

### Task 3: Citizen signup, role-aware auth, and language default

**Files:**
- Modify: `src/context/AuthContext.tsx`
- Modify: `src/components/auth/SignUpPage.tsx`
- Modify: `src/components/auth/SignInPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/types/index.ts`
- Modify: `src/components/views/CitizenProfileView.tsx`

**Interfaces:**
- Auth context exposes `signUpCitizen` and `refreshProfile`; `AuthProfile.role` is `citizen | officer | admin` and includes safe display data only.

- [x] Add tests for signup validation and role-specific login decisions.
- [x] Implement trigger-backed profile creation; remove client profile upsert and legacy claim submission from signup.
- [x] Route citizen signup through the response-minimizing Edge Function so Auth metadata containing NID never returns to the browser.
- [x] Add full name, phone, email, NID, password confirmation, and privacy consent; never display or log NID.
- [x] Add Citizen/Officer/Admin login modes with trusted role checks; remove demo officer access.
- [x] Default language to Bangla and persist an explicit language selection.
- [x] Update the profile view to use safe fields and existing Shikor card styling; run tests and lint.

### Task 4: Officer application, private document, and status

**Files:**
- Create: `src/components/officer/OfficerRegistrationView.tsx`
- Create: `src/components/officer/OfficerStatusView.tsx`
- Modify: `src/lib/supabase.ts`
- Modify: `src/App.tsx`
- Modify: `src/types/index.ts`

**Interfaces:**
- `submitOfficerApplication` stores a draft, uploads the private letter, and calls the submission RPC; status APIs return only the current applicant's application.

- [x] Add tests for file type/size validation and status-aware login handling.
- [x] Implement verified-account-only registration, 10 MB PDF/JPEG/PNG/WebP validation, private upload, and database-recorded applicant consent.
- [x] Implement own-status/history reads and Bangla-first pending/approved/rejected states.
- [x] Add officer dashboard gate requiring an approved effective role.
- [x] Run targeted tests and lint.

### Task 5: Single-admin review, decisions, and mail retry

**Files:**
- Create: `src/components/admin/AdminOfficerApplicationsView.tsx`
- Create: `supabase/functions/citizen-signup/index.ts`
- Create: `supabase/functions/officer-admin/index.ts`
- Modify: `src/App.tsx`
- Modify: `src/context/AuthContext.tsx`
- Modify: `.env.example`
- Modify: `.env.example` and `supabase/ADMIN_BOOTSTRAP.md`

**Interfaces:**
- The Edge Function accepts `{ action: 'approve' | 'reject' | 'retry_notification', applicationId, reason? }`; it validates the signed-in admin through RLS-backed database RPCs, commits decisions once, creates a recovery link for approval, sends via Resend, and records delivery state.

- [x] Implement database guards for a single decision, required rejection reason, and retry-after-failure state.
- [x] Implement admin-only application/history reads and 60-second signed document review links.
- [x] Implement atomic decision and notification-failure recording; retry cannot repeat approval.
- [x] Implement approval/password-setup and rejection email templates; do not send passwords.
- [x] Add notification retry and translated admin controls.
- [x] Document server secrets and Supabase Auth confirmation/redirect/SMTP configuration.
- [x] Deploy public citizen-signup and JWT-verified officer-admin Edge Functions; email delivery and redirect configuration still need project secrets.

### Task 6: Final verification and review

**Files:** all changed files.

- [x] Run the complete test command, `npm run lint`, and `npm run build`.
- [x] Inspect final diff for leaked secrets/NID, public document URLs, role mutation paths, and Land Records access.
- [x] Verify the live Supabase schema and policies after applying migrations.
- [x] Perform a fresh whole-change review and address findings about NID responses, client-set claim verification, and redirect handling.
- [x] Report changed files, migration state, environment/email requirements, actual checks, and deployment-dependent gaps.
