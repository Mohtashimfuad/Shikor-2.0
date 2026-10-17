import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const migrationPath = 'supabase/migrations/20261017041714_phase_1_identity_officer_approval.sql';
const migrationPaths = [
  migrationPath,
  'supabase/migrations/20261017042148_remove_duplicate_auth_profile_trigger.sql',
  'supabase/migrations/20261017042349_phase_1_nid_consent_and_legacy_evidence_access.sql',
  'supabase/migrations/20261017042722_limit_profile_columns_and_claim_insert_role.sql',
  'supabase/migrations/20261017043744_restrict_citizen_claim_trusted_fields.sql',
];
const completeMigration = migrationPaths.map((path) => readFileSync(path, 'utf8')).join('\n');

test('Phase 1 migration stores admin authority privately and creates citizen roles server-side', () => {
  const sql = completeMigration;
  assert.match(sql, /create table if not exists private\.admin_authority/i);
  assert.match(sql, /check\s*\(\s*singleton\s*\)/i);
  assert.match(sql, /insert into public\.profiles[\s\S]*?'citizen'/i);
  assert.doesNotMatch(sql, /create policy[^;]+on public\.profiles[^;]+for insert/i);
  assert.match(sql, /drop trigger if exists on_auth_user_created on auth\.users/i);
  assert.match(sql, /profiles_nid_number_unique_idx/i);
});

test('Phase 1 migration ties application rows and letter access to the authenticated applicant', () => {
  const sql = completeMigration;
  assert.match(sql, /applicant_id\s*=\s*\(select auth\.uid\(\)\)/i);
  assert.match(sql, /officer-appointment-letters/i);
  assert.match(sql, /'officer-appointment-letters'[\s\S]{0,100}false,\s*10485760/i);
  assert.match(sql, /array\[\s*'application\/pdf'/i);
  assert.match(sql, /document_consent is distinct from true/i);
  assert.match(sql, /document_consent_at := now\(\)/i);
});

test('Phase 1 migration removes public claim access and restricts decisions to one pending transition', () => {
  const sql = completeMigration;
  assert.match(sql, /drop policy if exists "Public Read Claims"/i);
  assert.match(sql, /drop policy if exists "Public Insert Claims"/i);
  assert.match(sql, /private\.is_admin\(\)/i);
  assert.match(sql, /status\s*<>\s*'pending'/i);
  assert.match(sql, /notification_status/i);
  assert.match(sql, /grant select \(id, full_name_en, full_name_bn, phone_number\)/i);
  assert.match(sql, /current_access_role\(\)\) = 'citizen'/i);
});

test('browser backend setup does not offer legacy public claim or storage policies', () => {
  const setup = readFileSync('src/components/backend/BackendSetupModal.tsx', 'utf8');
  assert.match(setup, /reviewed repository migrations/i);
  assert.doesNotMatch(setup, /TO public, anon, authenticated/i);
  assert.doesNotMatch(setup, /CREATE POLICY "Public Read Claims"/i);
});

test('admin email flow uses a recovery link and never supplies a plaintext password', () => {
  const edgeFunction = readFileSync('supabase/functions/officer-admin/index.ts', 'utf8');
  assert.match(edgeFunction, /type:\s*'recovery'/i);
  assert.match(edgeFunction, /redirectTo:.*account-activation/i);
  assert.doesNotMatch(edgeFunction, /password\s*:\s*['"`]/i);
});

test('citizens cannot set claim verification state or issue certificates', () => {
  assert.match(completeMigration, /grant insert\s*\([\s\S]*?river_basin\s*\)[\s\S]*?to authenticated/i);
  assert.match(completeMigration, /alter column status set default 'submitted'/i);
  assert.match(completeMigration, /revoke insert on table public\.loss_certificates from public, anon, authenticated/i);
  assert.match(completeMigration, /drop policy if exists "certificates_insert_own"/i);
});
