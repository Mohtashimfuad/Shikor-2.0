begin;

-- Reuse public.profiles and keep privileged configuration outside the exposed API.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table if not exists private.admin_authority (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique references auth.users (id) on delete restrict,
  created_at timestamptz not null default now()
);
alter table private.admin_authority enable row level security;
revoke all on table private.admin_authority from public, anon, authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, private, auth
as $$
  select exists (
    select 1
    from private.admin_authority a
    where a.singleton
      and a.user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

create or replace function private.is_verified_auth_user()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, auth
as $$
  select exists (
    select 1
    from auth.users u
    where u.id = (select auth.uid())
      and u.email_confirmed_at is not null
  );
$$;
revoke all on function private.is_verified_auth_user() from public, anon;
grant execute on function private.is_verified_auth_user() to authenticated;

alter table public.profiles add column if not exists privacy_consent_at timestamptz;
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('citizen', 'officer', 'surveyor', 'ac_land_official', 'uno'));
alter table public.profiles enable row level security;
revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name_en, full_name_bn, phone_number)
  on table public.profiles to authenticated;
drop policy if exists "read own profile" on public.profiles;
drop policy if exists "update own profile" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own_permitted_fields" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "profiles_update_own_permitted_fields"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Auth metadata is used only as signup input. NID and phone are removed after
-- the trusted trigger has inserted the protected profile row.
create or replace function private.create_citizen_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_name text := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');
  v_phone text := nullif(btrim(new.raw_user_meta_data ->> 'phone_number'), '');
  v_nid text := nullif(btrim(new.raw_user_meta_data ->> 'nid_number'), '');
begin
  if v_name is null
     or v_phone is null
     or v_nid is null
     or new.raw_user_meta_data ->> 'privacy_consent' is distinct from 'true'
     or v_phone !~ '^(\+?8801[3-9][0-9]{8}|01[3-9][0-9]{8})$'
     or v_nid !~ '^(\d{10}|\d{13}|\d{17})$' then
    raise exception 'Required registration details are invalid.' using errcode = '23514';
  end if;

  insert into public.profiles (id, role, full_name_en, phone_number, nid_number, privacy_consent_at)
  values (new.id, 'citizen', v_name, v_phone, v_nid, now());

  update auth.users
  set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
    - array['phone_number', 'nid_number', 'privacy_consent']::text[]
  where id = new.id;

  return new;
end;
$$;
revoke all on function private.create_citizen_profile_for_auth_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created_citizen_profile on auth.users;
create trigger on_auth_user_created_citizen_profile
  after insert on auth.users
  for each row execute function private.create_citizen_profile_for_auth_user();

create table if not exists public.officer_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references auth.users (id) on delete cascade,
  applicant_email text not null,
  applicant_name text not null,
  applicant_phone text not null,
  department text not null,
  designation text not null,
  employee_number text not null,
  office_district text not null,
  office_upazila text not null,
  appointment_letter_path text not null,
  status text not null default 'draft'
    check (status in ('draft', 'pending', 'approved', 'rejected')),
  rejection_reason text,
  submitted_at timestamptz,
  decided_at timestamptz,
  decided_by uuid references auth.users (id) on delete set null,
  notification_status text not null default 'not_sent'
    check (notification_status in ('not_sent', 'pending', 'sending', 'sent', 'failed')),
  notification_attempts integer not null default 0 check (notification_attempts >= 0),
  notification_last_attempt_at timestamptz,
  notification_last_error text,
  created_at timestamptz not null default now(),
  constraint officer_application_reason_length check (rejection_reason is null or length(rejection_reason) <= 1000),
  constraint officer_application_letter_path check (
    appointment_letter_path = applicant_id::text || '/' || id::text || '/appointment-letter.'
      || (case
            when appointment_letter_path ~* '\.pdf$' then 'pdf'
            when appointment_letter_path ~* '\.jpe?g$' then lower(substring(appointment_letter_path from '\.([^.]+)$'))
            when appointment_letter_path ~* '\.png$' then 'png'
            when appointment_letter_path ~* '\.webp$' then 'webp'
            else ''
          end)
  )
);
create index if not exists officer_applications_applicant_created_idx
  on public.officer_applications (applicant_id, created_at desc);
create index if not exists officer_applications_pending_created_idx
  on public.officer_applications (created_at)
  where status = 'pending';
create unique index if not exists officer_applications_one_draft_per_applicant_idx
  on public.officer_applications (applicant_id)
  where status = 'draft';
create unique index if not exists officer_applications_one_open_per_applicant_idx
  on public.officer_applications (applicant_id)
  where status = 'pending';
create unique index if not exists officer_applications_one_approved_per_applicant_idx
  on public.officer_applications (applicant_id)
  where status = 'approved';
create unique index if not exists officer_applications_employee_number_open_idx
  on public.officer_applications (lower(employee_number))
  where status in ('pending', 'approved');

create table if not exists public.officer_application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.officer_applications (id) on delete cascade,
  actor_id uuid not null references auth.users (id) on delete restrict,
  from_status text check (from_status is null or from_status in ('draft', 'pending', 'approved', 'rejected')),
  to_status text not null check (to_status in ('pending', 'approved', 'rejected')),
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists officer_application_events_application_created_idx
  on public.officer_application_events (application_id, created_at desc);

alter table public.officer_applications enable row level security;
alter table public.officer_application_events enable row level security;
revoke all on table public.officer_applications from public, anon, authenticated;
revoke all on table public.officer_application_events from public, anon, authenticated;
grant select on table public.officer_applications to authenticated;
grant insert (
  id, applicant_id, applicant_name, applicant_phone, department, designation,
  employee_number, office_district, office_upazila, appointment_letter_path
) on table public.officer_applications to authenticated;
grant select on table public.officer_application_events to authenticated;

create or replace function private.set_officer_application_identity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, auth
as $$
declare
  v_email text;
  v_confirmed_at timestamptz;
begin
  if new.applicant_id is distinct from (select auth.uid()) then
    raise exception 'Application must belong to the signed-in applicant.' using errcode = '42501';
  end if;
  select u.email, u.email_confirmed_at
    into v_email, v_confirmed_at
  from auth.users u
  where u.id = (select auth.uid());

  if v_email is null or v_confirmed_at is null then
    raise exception 'Verify your email before applying.' using errcode = '42501';
  end if;

  new.applicant_email := v_email;
  new.status := 'draft';
  new.rejection_reason := null;
  new.submitted_at := null;
  new.decided_at := null;
  new.decided_by := null;
  new.notification_status := 'not_sent';
  new.notification_attempts := 0;
  new.notification_last_attempt_at := null;
  new.notification_last_error := null;
  return new;
end;
$$;
revoke all on function private.set_officer_application_identity() from public, anon, authenticated;
drop trigger if exists set_officer_application_identity on public.officer_applications;
create trigger set_officer_application_identity
  before insert on public.officer_applications
  for each row execute function private.set_officer_application_identity();

create policy "officer_applications_read_own_or_admin"
  on public.officer_applications for select to authenticated
  using (applicant_id = (select auth.uid()) or (select private.is_admin()));
create policy "officer_applications_insert_own_draft"
  on public.officer_applications for insert to authenticated
  with check (
    applicant_id = (select auth.uid())
    and status = 'draft'
  );
create policy "officer_application_events_read_own_or_admin"
  on public.officer_application_events for select to authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.officer_applications a
      where a.id = application_id and a.applicant_id = (select auth.uid())
    )
  );

create or replace function public.current_access_role()
returns text
language plpgsql
stable
security definer
set search_path = pg_catalog, private, public, auth
as $$
begin
  if (select auth.uid()) is null or not (select private.is_verified_auth_user()) then
    return null;
  end if;
  if (select private.is_admin()) then
    return 'admin';
  end if;
  if not exists (
    select 1 from public.profiles p where p.id = (select auth.uid())
  ) then
    return null;
  end if;
  if exists (
    select 1
    from public.profiles p
    join public.officer_applications a on a.applicant_id = p.id
    where p.id = (select auth.uid())
      and p.role = 'officer'
      and a.status = 'approved'
  ) then
    return 'officer';
  end if;
  return 'citizen';
end;
$$;
revoke all on function public.current_access_role() from public, anon;
grant execute on function public.current_access_role() to authenticated;

create or replace function public.submit_officer_application(p_application_id uuid)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public, storage, auth
as $$
declare
  v_application public.officer_applications%rowtype;
begin
  if (select auth.uid()) is null or not (select private.is_verified_auth_user()) then
    raise exception 'A verified account is required.' using errcode = '42501';
  end if;

  select * into v_application
  from public.officer_applications a
  where a.id = p_application_id
    and a.applicant_id = (select auth.uid())
  for update;

  if not found or v_application.status <> 'draft' then
    raise exception 'Only your own draft can be submitted.' using errcode = '42501';
  end if;
  if not exists (
    select 1 from storage.objects o
    where o.bucket_id = 'officer-appointment-letters'
      and o.name = v_application.appointment_letter_path
  ) then
    raise exception 'Upload the appointment letter before submitting.' using errcode = '23514';
  end if;

  update public.officer_applications
  set status = 'pending', submitted_at = now()
  where id = v_application.id;
  insert into public.officer_application_events (
    application_id, actor_id, from_status, to_status
  ) values (
    v_application.id, (select auth.uid()), 'draft', 'pending'
  );
  return 'pending';
end;
$$;
revoke all on function public.submit_officer_application(uuid) from public, anon;
grant execute on function public.submit_officer_application(uuid) to authenticated;

create or replace function public.decide_officer_application(
  p_application_id uuid,
  p_decision text,
  p_rejection_reason text default null
)
returns text
language plpgsql
security definer
set search_path = pg_catalog, private, public, auth
as $$
declare
  v_application public.officer_applications%rowtype;
  v_confirmed_at timestamptz;
begin
  if not (select private.is_admin()) then
    raise exception 'Administrator access is required.' using errcode = '42501';
  end if;
  if p_decision not in ('approved', 'rejected') then
    raise exception 'Invalid application decision.' using errcode = '22023';
  end if;
  if p_decision = 'rejected' and nullif(btrim(p_rejection_reason), '') is null then
    raise exception 'A rejection reason is required.' using errcode = '23514';
  end if;

  select * into v_application
  from public.officer_applications a
  where a.id = p_application_id
  for update;

  if not found or v_application.status <> 'pending' then
    raise exception 'Only a pending application can be decided.' using errcode = '23505';
  end if;
  if not exists (
    select 1 from storage.objects o
    where o.bucket_id = 'officer-appointment-letters'
      and o.name = v_application.appointment_letter_path
  ) then
    raise exception 'The appointment letter is unavailable.' using errcode = '23514';
  end if;

  select u.email_confirmed_at into v_confirmed_at
  from auth.users u where u.id = v_application.applicant_id;
  if v_confirmed_at is null then
    raise exception 'The applicant must verify their email before approval.' using errcode = '23514';
  end if;

  if p_decision = 'approved' then
    update public.profiles
    set role = 'officer'
    where id = v_application.applicant_id and role = 'citizen';
    if not found then
      raise exception 'The applicant account is not eligible for officer activation.' using errcode = '23514';
    end if;
  end if;

  update public.officer_applications
  set status = p_decision,
      rejection_reason = case when p_decision = 'rejected' then btrim(p_rejection_reason) else null end,
      decided_at = now(),
      decided_by = (select auth.uid()),
      notification_status = 'pending',
      notification_last_error = null
  where id = v_application.id;

  insert into public.officer_application_events (
    application_id, actor_id, from_status, to_status, reason
  ) values (
    v_application.id, (select auth.uid()), 'pending', p_decision,
    case when p_decision = 'rejected' then btrim(p_rejection_reason) else null end
  );
  return p_decision;
end;
$$;
revoke all on function public.decide_officer_application(uuid, text, text) from public, anon;
grant execute on function public.decide_officer_application(uuid, text, text) to authenticated;

create or replace function public.begin_officer_notification(p_application_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, private, public
as $$
declare
  v_application public.officer_applications%rowtype;
begin
  if not (select private.is_admin()) then
    raise exception 'Administrator access is required.' using errcode = '42501';
  end if;

  select * into v_application
  from public.officer_applications a
  where a.id = p_application_id
    and a.status in ('approved', 'rejected')
  for update;
  if not found then
    raise exception 'No decided application was found.' using errcode = 'P0002';
  end if;
  if v_application.notification_status = 'sent' then
    raise exception 'The decision notification has already been sent.' using errcode = '23505';
  end if;
  if v_application.notification_status = 'sending'
     and v_application.notification_last_attempt_at > now() - interval '10 minutes' then
    raise exception 'A notification attempt is already in progress.' using errcode = '55P03';
  end if;

  update public.officer_applications
  set notification_status = 'sending',
      notification_attempts = notification_attempts + 1,
      notification_last_attempt_at = now(),
      notification_last_error = null
  where id = v_application.id;

  return jsonb_build_object(
    'id', v_application.id,
    'status', v_application.status,
    'applicant_email', v_application.applicant_email,
    'applicant_name', v_application.applicant_name,
    'department', v_application.department,
    'designation', v_application.designation,
    'rejection_reason', v_application.rejection_reason,
    'decided_at', v_application.decided_at,
    'attempt', v_application.notification_attempts + 1
  );
end;
$$;
revoke all on function public.begin_officer_notification(uuid) from public, anon;
grant execute on function public.begin_officer_notification(uuid) to authenticated;

create or replace function public.complete_officer_notification(
  p_application_id uuid,
  p_success boolean,
  p_error_code text default null
)
returns text
language plpgsql
security definer
set search_path = pg_catalog, private, public
as $$
begin
  if not (select private.is_admin()) then
    raise exception 'Administrator access is required.' using errcode = '42501';
  end if;
  update public.officer_applications
  set notification_status = case when p_success then 'sent' else 'failed' end,
      notification_last_error = case
        when p_success then null
        else left(regexp_replace(coalesce(p_error_code, 'delivery_failed'), '[^a-z0-9_]', '', 'g'), 80)
      end
  where id = p_application_id
    and status in ('approved', 'rejected')
    and notification_status = 'sending';
  if not found then
    raise exception 'No active notification attempt was found.' using errcode = 'P0002';
  end if;
  return case when p_success then 'sent' else 'failed' end;
end;
$$;
revoke all on function public.complete_officer_notification(uuid, boolean, text) from public, anon;
grant execute on function public.complete_officer_notification(uuid, boolean, text) to authenticated;

-- No anonymous user may enumerate claims, certificates, or citizen evidence.
alter table public.erosion_claims enable row level security;
alter table public.claim_media enable row level security;
alter table public.claim_witnesses enable row level security;
alter table public.loss_certificates enable row level security;
revoke all on table public.erosion_claims from public, anon, authenticated;
revoke all on table public.claim_media from public, anon, authenticated;
revoke all on table public.claim_witnesses from public, anon, authenticated;
revoke all on table public.loss_certificates from public, anon, authenticated;
grant select, insert on table public.erosion_claims to authenticated;
grant select, insert on table public.claim_media to authenticated;
grant select, insert on table public.claim_witnesses to authenticated;
grant select, insert on table public.loss_certificates to authenticated;
drop policy if exists "Public Read Claims" on public.erosion_claims;
drop policy if exists "Public Insert Claims" on public.erosion_claims;
drop policy if exists "Public Read Certificates" on public.loss_certificates;
drop policy if exists "Public Insert Certificates" on public.loss_certificates;
drop policy if exists "claims_read_own_or_admin" on public.erosion_claims;
drop policy if exists "claims_insert_own" on public.erosion_claims;
drop policy if exists "claim_media_read_own_or_admin" on public.claim_media;
drop policy if exists "claim_media_insert_own" on public.claim_media;
drop policy if exists "claim_witnesses_read_own_or_admin" on public.claim_witnesses;
drop policy if exists "claim_witnesses_insert_own" on public.claim_witnesses;
drop policy if exists "certificates_read_own_or_admin" on public.loss_certificates;
drop policy if exists "certificates_insert_own" on public.loss_certificates;
create policy "claims_read_own_or_admin"
  on public.erosion_claims for select to authenticated
  using (claimant_id = (select auth.uid()) or (select private.is_admin()));
create policy "claims_insert_own"
  on public.erosion_claims for insert to authenticated
  with check (
    claimant_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'citizen')
  );
create policy "claim_media_read_own_or_admin"
  on public.claim_media for select to authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.erosion_claims c
      where c.id = claim_id and c.claimant_id = (select auth.uid())
    )
  );
create policy "claim_media_insert_own"
  on public.claim_media for insert to authenticated
  with check (exists (
    select 1 from public.erosion_claims c
    where c.id = claim_id and c.claimant_id = (select auth.uid())
  ));
create policy "claim_witnesses_read_own_or_admin"
  on public.claim_witnesses for select to authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.erosion_claims c
      where c.id = claim_id and c.claimant_id = (select auth.uid())
    )
  );
create policy "claim_witnesses_insert_own"
  on public.claim_witnesses for insert to authenticated
  with check (exists (
    select 1 from public.erosion_claims c
    where c.id = claim_id and c.claimant_id = (select auth.uid())
  ));
create policy "certificates_read_own_or_admin"
  on public.loss_certificates for select to authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.erosion_claims c
      where c.id = claim_id and c.claimant_id = (select auth.uid())
    )
  );
create policy "certificates_insert_own"
  on public.loss_certificates for insert to authenticated
  with check (exists (
    select 1 from public.erosion_claims c
    where c.id = claim_id and c.claimant_id = (select auth.uid())
  ));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'officer-appointment-letters', 'officer-appointment-letters', false, 10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = excluded.allowed_mime_types;
update storage.buckets set public = false where id = 'citizen-evidence';

drop policy if exists "Allow public upload to citizen-evidence" on storage.objects;
drop policy if exists "Allow reading citizen-evidence" on storage.objects;
drop policy if exists "Allow updates on citizen-evidence" on storage.objects;
drop policy if exists "citizen_evidence_read_own_or_admin" on storage.objects;
drop policy if exists "citizen_evidence_insert_own" on storage.objects;
drop policy if exists "citizen_evidence_update_own" on storage.objects;
drop policy if exists "citizen_evidence_delete_own" on storage.objects;
drop policy if exists "officer_letters_read_own_or_admin" on storage.objects;
drop policy if exists "officer_letters_insert_own_draft" on storage.objects;
drop policy if exists "officer_letters_update_own_draft" on storage.objects;
drop policy if exists "officer_letters_delete_own_draft" on storage.objects;
create policy "citizen_evidence_read_own_or_admin"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'citizen-evidence'
    and (
      (select private.is_admin())
      or (
        (storage.foldername(name))[1] = (select auth.uid())::text
        and exists (
          select 1 from public.erosion_claims c
          where c.id::text = (storage.foldername(name))[2]
            and c.claimant_id = (select auth.uid())
        )
      )
    )
  );
create policy "citizen_evidence_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'citizen-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.erosion_claims c
      where c.id::text = (storage.foldername(name))[2]
        and c.claimant_id = (select auth.uid())
    )
  );
create policy "citizen_evidence_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'citizen-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.erosion_claims c
      where c.id::text = (storage.foldername(name))[2]
        and c.claimant_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'citizen-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.erosion_claims c
      where c.id::text = (storage.foldername(name))[2]
        and c.claimant_id = (select auth.uid())
    )
  );
create policy "citizen_evidence_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'citizen-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.erosion_claims c
      where c.id::text = (storage.foldername(name))[2]
        and c.claimant_id = (select auth.uid())
    )
  );
create policy "officer_letters_read_own_or_admin"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'officer-appointment-letters'
    and (
      (select private.is_admin())
      or exists (
        select 1 from public.officer_applications a
        where a.applicant_id = (select auth.uid())
          and a.id::text = (storage.foldername(name))[2]
          and a.appointment_letter_path = name
      )
    )
  );
create policy "officer_letters_insert_own_draft"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'officer-appointment-letters'
    and exists (
      select 1 from public.officer_applications a
      where a.applicant_id = (select auth.uid())
        and a.id::text = (storage.foldername(name))[2]
        and (storage.foldername(name))[1] = (select auth.uid())::text
        and a.appointment_letter_path = name
        and a.status = 'draft'
    )
  );
create policy "officer_letters_update_own_draft"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'officer-appointment-letters'
    and exists (
      select 1 from public.officer_applications a
      where a.applicant_id = (select auth.uid())
        and a.id::text = (storage.foldername(name))[2]
        and (storage.foldername(name))[1] = (select auth.uid())::text
        and a.appointment_letter_path = name
        and a.status = 'draft'
    )
  )
  with check (
    bucket_id = 'officer-appointment-letters'
    and exists (
      select 1 from public.officer_applications a
      where a.applicant_id = (select auth.uid())
        and a.id::text = (storage.foldername(name))[2]
        and (storage.foldername(name))[1] = (select auth.uid())::text
        and a.appointment_letter_path = name
        and a.status = 'draft'
    )
  );
create policy "officer_letters_delete_own_draft"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'officer-appointment-letters'
    and exists (
      select 1 from public.officer_applications a
      where a.applicant_id = (select auth.uid())
        and a.id::text = (storage.foldername(name))[2]
        and (storage.foldername(name))[1] = (select auth.uid())::text
        and a.appointment_letter_path = name
        and a.status = 'draft'
    )
  );

commit;
