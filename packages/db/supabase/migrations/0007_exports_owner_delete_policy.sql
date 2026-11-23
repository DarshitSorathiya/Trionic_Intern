drop policy if exists "exports: owner read" on storage.objects;
create policy "exports: owner read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'exports'
    and exists (
      select 1
      from public.documents d
      where d.id::text = (storage.foldername(name))[1]
        and d.owner_id = auth.uid()
    )
  );

drop policy if exists "exports: owner delete" on storage.objects;
create policy "exports: owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'exports'
    and exists (
      select 1
      from public.documents d
      where d.id::text = (storage.foldername(name))[1]
        and d.owner_id = auth.uid()
    )
  );