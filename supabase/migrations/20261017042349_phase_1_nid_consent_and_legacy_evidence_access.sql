begin;

-- Prevent separate Auth accounts from registering with the same NID.
create unique index if not exists profiles_nid_number_unique_idx
  on public.profiles (nid_number)
  where nid_number is not null;

-- Persist document consent as an auditable timestamp set by the trusted trigger.
alter table public.officer_applications
  add column if not exists document_consent boolean not null default false;
alter table public.officer_applications
  add column if not exists document_consent_at timestamptz;
grant insert (document_consent)
  on table public.officer_applications to authenticated;

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
  if new.document_consent is distinct from true then
    raise exception 'Consent to secure document processing is required.' using errcode = '23514';
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
  new.document_consent_at := now();
  return new;
end;
$$;

drop policy if exists "citizen_evidence_read_own_or_admin" on storage.objects;
create policy "citizen_evidence_read_own_or_admin"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'citizen-evidence'
    and (
      (select private.is_admin())
      or (
        (
          (storage.foldername(name))[1] = (select auth.uid())::text
          and exists (
            select 1 from public.erosion_claims c
            where c.id::text = (storage.foldername(name))[2]
              and c.claimant_id = (select auth.uid())
          )
        )
        or exists (
          select 1 from public.erosion_claims c
          where c.id::text = (storage.foldername(name))[1]
            and c.claimant_id = (select auth.uid())
        )
      )
    )
  );

commit;
