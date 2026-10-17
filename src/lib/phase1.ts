export type AccessRole = 'citizen' | 'officer' | 'admin';
export type LoginMode = 'citizen' | 'officer' | 'admin';
export type OfficerApplicationStatus = 'pending' | 'approved' | 'rejected' | null;
export type SignupFieldError =
  | 'fullName'
  | 'phone'
  | 'email'
  | 'nid'
  | 'password'
  | 'confirmPassword'
  | 'privacyConsent';
export type OfficerApplicationFieldError =
  | 'department'
  | 'designation'
  | 'employeeNumber'
  | 'district'
  | 'upazila'
  | 'documentConsent';
export type AppointmentLetterError = 'fileType' | 'fileSize';
export type CitizenSignupErrorCode =
  | 'service_not_configured'
  | 'invalid_details'
  | 'network_error'
  | 'registration_failed'
  | 'registration_unavailable';

export function normalizeCitizenSignupErrorCode(code: unknown): CitizenSignupErrorCode {
  if (code === 'server_not_configured') return 'service_not_configured';
  if (code === 'invalid_request' || code === 'invalid_registration_details') return 'invalid_details';
  if (code === 'network_error') return 'network_error';
  return 'registration_failed';
}

export interface CitizenSignupInput {
  fullName: string;
  phone: string;
  email: string;
  nid: string;
  password: string;
  confirmPassword: string;
  privacyConsent: boolean;
}

export interface OfficerApplicationInput {
  department: string;
  designation: string;
  employeeNumber: string;
  district: string;
  upazila: string;
  documentConsent: boolean;
}

export interface AppointmentLetterMetadata {
  name: string;
  type: string;
  size: number;
}

const SUPPORTED_LETTER_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export const MAX_APPOINTMENT_LETTER_BYTES = 10 * 1024 * 1024;

export function validateCitizenSignup(input: CitizenSignupInput): SignupFieldError | null {
  if (input.fullName.trim().length < 2) return 'fullName';
  const phone = input.phone.trim().replace(/[\s()-]/g, '');
  if (!/^(?:\+?8801[3-9]\d{8}|01[3-9]\d{8})$/.test(phone)) return 'phone';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) return 'email';
  if (!/^(?:\d{10}|\d{13}|\d{17})$/.test(input.nid.trim())) return 'nid';
  if (input.password.length < 8) return 'password';
  if (input.password !== input.confirmPassword) return 'confirmPassword';
  if (!input.privacyConsent) return 'privacyConsent';
  return null;
}

export function validateOfficerApplication(
  input: OfficerApplicationInput,
): OfficerApplicationFieldError | null {
  if (!input.department.trim()) return 'department';
  if (!input.designation.trim()) return 'designation';
  if (!input.employeeNumber.trim()) return 'employeeNumber';
  if (!input.district.trim()) return 'district';
  if (!input.upazila.trim()) return 'upazila';
  if (!input.documentConsent) return 'documentConsent';
  return null;
}

export function validateAppointmentLetter(
  file: AppointmentLetterMetadata,
): AppointmentLetterError | null {
  if (file.size <= 0 || file.size > MAX_APPOINTMENT_LETTER_BYTES) return 'fileSize';
  const allowedExtensions = SUPPORTED_LETTER_TYPES[file.type];
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!allowedExtensions?.includes(extension)) return 'fileType';
  return null;
}

export function buildAppointmentLetterPath(
  applicantId: string,
  applicationId: string,
  mimeType: string,
): string | null {
  const extension = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }[mimeType];
  if (!extension) return null;
  return `${applicantId}/${applicationId}/appointment-letter.${extension}`;
}

export function resolveLoginDestination(
  role: AccessRole,
  mode: LoginMode,
  applicationStatus: OfficerApplicationStatus,
): 'citizen' | 'officer' | 'admin' | 'pending' | 'rejected' | 'unauthorized' {
  if (role === 'admin') return mode === 'admin' ? 'admin' : 'unauthorized';
  if (mode === 'admin') return 'unauthorized';
  if (mode === 'citizen') return role === 'citizen' ? 'citizen' : 'unauthorized';
  if (role === 'officer' && applicationStatus === 'approved') return 'officer';
  if (applicationStatus === 'pending') return 'pending';
  if (applicationStatus === 'rejected') return 'rejected';
  return 'unauthorized';
}
