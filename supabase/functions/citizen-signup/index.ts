import { createClient } from '@supabase/supabase-js';

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

type CitizenSignupPayload = {
  fullName?: unknown;
  phone?: unknown;
  email?: unknown;
  nid?: unknown;
  password?: unknown;
  privacyConsent?: unknown;
};
type ValidCitizenSignupPayload = {
  fullName: string;
  phone: string;
  email: string;
  nid: string;
  password: string;
  privacyConsent: true;
};

const appUrl = Deno.env.get('APP_PUBLIC_URL')?.replace(/\/$/, '') ?? '';
const appOrigin = appUrl ? new URL(appUrl).origin : '';
const baseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
};

function response(body: Record<string, unknown>, status = 200, origin?: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...baseHeaders,
      ...(origin && origin === appOrigin ? { 'Access-Control-Allow-Origin': origin } : {}),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function isValidPayload(payload: CitizenSignupPayload): payload is ValidCitizenSignupPayload {
  if (typeof payload.fullName !== 'string' || payload.fullName.trim().length < 2 || payload.fullName.length > 150) return false;
  if (typeof payload.phone !== 'string' || payload.phone.length > 32) return false;
  const phone = payload.phone.trim().replace(/[\s()-]/g, '');
  if (!/^(?:\+?8801[3-9]\d{8}|01[3-9]\d{8})$/.test(phone)) return false;
  if (typeof payload.email !== 'string' || payload.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) return false;
  if (typeof payload.nid !== 'string' || !/^(?:\d{10}|\d{13}|\d{17})$/.test(payload.nid.trim())) return false;
  if (typeof payload.password !== 'string' || payload.password.length < 8 || payload.password.length > 256) return false;
  return payload.privacyConsent === true;
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin') ?? undefined;
  if (request.method === 'OPTIONS') {
    if (!origin || !appOrigin || origin !== appOrigin) return new Response(null, { status: 403 });
    return new Response(null, { status: 204, headers: { ...baseHeaders, 'Access-Control-Allow-Origin': origin } });
  }
  if (request.method !== 'POST') return response({ ok: false, error: 'method_not_allowed' }, 405, origin);
  if (!appOrigin || (origin && origin !== appOrigin)) return response({ ok: false, error: 'server_not_configured' }, 503, origin);

  let payload: CitizenSignupPayload;
  try {
    payload = await request.json() as CitizenSignupPayload;
  } catch {
    return response({ ok: false, error: 'invalid_request' }, 400, origin);
  }
  if (!isValidPayload(payload)) return response({ ok: false, error: 'invalid_registration_details' }, 400, origin);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !anonKey) return response({ ok: false, error: 'server_not_configured' }, 503, origin);

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.auth.signUp({
    email: payload.email.trim(),
    password: payload.password,
    options: {
      emailRedirectTo: `${appUrl}/?page=profile`,
      data: {
        full_name: payload.fullName.trim(),
        phone_number: payload.phone.trim().replace(/[\s()-]/g, ''),
        nid_number: payload.nid.trim(),
        privacy_consent: 'true',
      },
    },
  });

  // Never return Auth user metadata; it contains the private signup input until
  // the database trigger removes it after creating the protected profile row.
  if (error || !data.user) return response({ ok: false, error: 'registration_failed' }, 400, origin);
  return response({ ok: true }, 200, origin);
});
