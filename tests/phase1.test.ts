import assert from 'node:assert/strict';
import test from 'node:test';
import {
  resolveLoginDestination,
  buildAppointmentLetterPath,
  validateAppointmentLetter,
  validateCitizenSignup,
  validateOfficerApplication,
} from '../src/lib/phase1.ts';

test('citizen signup requires identity fields and privacy consent', () => {
  assert.equal(
    validateCitizenSignup({
      fullName: 'Synthetic Citizen',
      phone: '+8801712345678',
      email: 'citizen@example.test',
      nid: '1234567890',
      password: 'synthetic-secret',
      confirmPassword: 'synthetic-secret',
      privacyConsent: true,
    }),
    null,
  );

  assert.equal(
    validateCitizenSignup({
      fullName: 'Synthetic Citizen',
      phone: '+8801712345678',
      email: 'citizen@example.test',
      nid: '1234567890',
      password: 'synthetic-secret',
      confirmPassword: 'synthetic-secret',
      privacyConsent: false,
    }),
    'privacyConsent',
  );

  assert.equal(
    validateCitizenSignup({
      fullName: 'Synthetic Citizen',
      phone: '01712-345678',
      email: 'citizen@example.test',
      nid: '1234567890',
      password: 'synthetic-secret',
      confirmPassword: 'synthetic-secret',
      privacyConsent: true,
    }),
    null,
  );
});

test('citizen signup errors expose only safe, actionable error categories', async () => {
  const { normalizeCitizenSignupErrorCode } = await import('../src/lib/phase1.ts');
  assert.equal(normalizeCitizenSignupErrorCode('server_not_configured'), 'service_not_configured');
  assert.equal(normalizeCitizenSignupErrorCode('invalid_registration_details'), 'invalid_details');
  assert.equal(normalizeCitizenSignupErrorCode('database password or NID leaked'), 'registration_failed');
});

test('officer registration requires office details and secure-document consent', () => {
  const valid = {
    department: 'Department of Land Records',
    designation: 'Assistant Officer',
    employeeNumber: 'EMP-TEST-001',
    district: 'Kurigram',
    upazila: 'Chilmari',
    documentConsent: true,
  };
  assert.equal(validateOfficerApplication(valid), null);
  assert.equal(validateOfficerApplication({ ...valid, documentConsent: false }), 'documentConsent');
  assert.equal(validateOfficerApplication({ ...valid, employeeNumber: '' }), 'employeeNumber');
});

test('appointment letters accept supported PDF/image types up to 10 MB', () => {
  assert.equal(validateAppointmentLetter({ name: 'appointment.pdf', type: 'application/pdf', size: 1024 }), null);
  assert.equal(validateAppointmentLetter({ name: 'appointment.exe', type: 'application/octet-stream', size: 1024 }), 'fileType');
  assert.equal(validateAppointmentLetter({ name: 'appointment.pdf', type: 'application/pdf', size: 10 * 1024 * 1024 + 1 }), 'fileSize');
  assert.equal(buildAppointmentLetterPath('user-uuid', 'application-uuid', 'image/png'), 'user-uuid/application-uuid/appointment-letter.png');
});

test('login destinations follow the trusted role and application status', () => {
  assert.equal(resolveLoginDestination('citizen', 'citizen', null), 'citizen');
  assert.equal(resolveLoginDestination('citizen', 'officer', 'pending'), 'pending');
  assert.equal(resolveLoginDestination('citizen', 'officer', 'rejected'), 'rejected');
  assert.equal(resolveLoginDestination('officer', 'officer', 'approved'), 'officer');
  assert.equal(resolveLoginDestination('citizen', 'admin', null), 'unauthorized');
  assert.equal(resolveLoginDestination('admin', 'admin', null), 'admin');
});

test('citizen signup sends sensitive NID data through the response-minimizing signup function', async () => {
  const { readFileSync } = await import('node:fs');
  const authContext = readFileSync('src/context/AuthContext.tsx', 'utf8');
  const signupFunction = readFileSync('supabase/functions/citizen-signup/index.ts', 'utf8');
  assert.match(authContext, /functions\.invoke\(['"]citizen-signup['"]/i);
  assert.doesNotMatch(authContext, /auth\.signUp\(/i);
  assert.match(signupFunction, /emailRedirectTo:\s*`\$\{appUrl\}\/\?page=profile`/i);
  assert.match(signupFunction, /response\(\{\s*ok:\s*true\s*\}/i);
  assert.doesNotMatch(signupFunction, /console\.(log|error).*nid/i);
});
