create policy "Owners can update their documents"
  on public.documents
  for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

grant update on public.documents to authenticated;
