begin;

-- Citizens may submit source facts only. Verification, workflow status, and
-- certificate issuance must come from a trusted server-side process.
revoke insert on table public.erosion_claims from public, anon, authenticated;
grant insert (
  tracking_id,
  claimant_id,
  district,
  upazila,
  union_name,
  mouza_name,
  jl_number,
  khatian_no,
  dag_no,
  total_area_acre,
  submerged_area_acre,
  erosion_year,
  river_basin
) on table public.erosion_claims to authenticated;

alter table public.erosion_claims
  alter column status set default 'submitted';

revoke insert on table public.loss_certificates from public, anon, authenticated;
drop policy if exists "certificates_insert_own" on public.loss_certificates;

commit;
