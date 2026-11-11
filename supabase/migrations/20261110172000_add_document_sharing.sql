create or replace function public.share_document_with_user(
  p_document_id uuid,
  p_email text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.documents
    where id = p_document_id
      and owner_id = auth.uid()
  ) then
    raise exception 'Only the document owner can share this document';
  end if;

  select id
  into target_user_id
  from auth.users
  where lower(email) = lower(trim(p_email))
    and id <> auth.uid()
  limit 1;

  if target_user_id is null then
    raise exception 'No account found for that email address';
  end if;

  insert into public.document_shares (document_id, shared_with_user_id)
  values (p_document_id, target_user_id)
  on conflict (document_id, shared_with_user_id) do nothing;
end;
$$;

revoke all on function public.share_document_with_user(uuid, text) from public;
revoke all on function public.share_document_with_user(uuid, text) from anon;
grant execute on function public.share_document_with_user(uuid, text) to authenticated;
