begin;

-- Replace the legacy profile trigger with the validated Phase 1 trigger.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

commit;
