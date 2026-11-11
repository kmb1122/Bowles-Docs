create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Untitled document',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_shares (
  document_id uuid not null references public.documents (id) on delete cascade,
  shared_with_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (document_id, shared_with_user_id)
);

alter table public.documents enable row level security;
alter table public.document_shares enable row level security;

create policy "Users can view owned or shared documents"
  on public.documents
  for select
  to authenticated
  using (
    owner_id = (select auth.uid())
    or exists (
      select 1
      from public.document_shares
      where document_id = documents.id
        and shared_with_user_id = (select auth.uid())
    )
  );

create policy "Users can create owned documents"
  on public.documents
  for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

create policy "Users can view their document shares"
  on public.document_shares
  for select
  to authenticated
  using (shared_with_user_id = (select auth.uid()));

grant select, insert on public.documents to authenticated;
grant select on public.document_shares to authenticated;
