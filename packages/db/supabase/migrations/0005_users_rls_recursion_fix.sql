create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
set row_security = off
as $$
  select u.role
  from public.users as u
  where u.id = (select auth.uid())
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to anon, authenticated, service_role;

drop policy if exists "users: self update" on public.users;
create policy "users: self update"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = public.current_user_role());

drop policy if exists "users: admin read all" on public.users;
create policy "users: admin read all"
  on public.users for select
  using (public.current_user_role() = 'admin'::public.user_role);

drop policy if exists "documents: admin read" on public.documents;
create policy "documents: admin read"
  on public.documents for select
  using (public.current_user_role() = 'admin'::public.user_role);

drop policy if exists "agent_traces: admin read all" on public.agent_traces;
create policy "agent_traces: admin read all"
  on public.agent_traces for select
  using (public.current_user_role() = 'admin'::public.user_role);