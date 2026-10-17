begin;

-- Do not expose NID or stored profile roles to browser queries.
revoke select on table public.profiles from authenticated;
grant select (id, full_name_en, full_name_bn, phone_number)
  on table public.profiles to authenticated;

-- Resolve citizen eligibility through the trusted role function instead of
-- reading the protected profile role column in an RLS policy.
drop policy if exists "claims_insert_own" on public.erosion_claims;
create policy "claims_insert_own"
  on public.erosion_claims for insert to authenticated
  with check (
    claimant_id = (select auth.uid())
    and (select public.current_access_role()) = 'citizen'
  );

commit;
