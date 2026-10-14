-- 방명록 테이블
-- Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 Run 하세요. (한 번만, 다시 실행해도 안전)

create table if not exists public.guestbook (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 30),
  message    text not null check (char_length(message) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists guestbook_recent on public.guestbook (created_at desc);

alter table public.guestbook enable row level security;

-- 누구나(로그인 없이) 읽고 쓰기 가능
drop policy if exists "guestbook read" on public.guestbook;
create policy "guestbook read" on public.guestbook
  for select to anon, authenticated using (true);

drop policy if exists "guestbook write" on public.guestbook;
create policy "guestbook write" on public.guestbook
  for insert to anon, authenticated with check (true);

-- 삭제는 로그인한 사람만. 회원가입을 꺼 두었으므로 사실상 사이트 주인만 가능
drop policy if exists "guestbook delete" on public.guestbook;
create policy "guestbook delete" on public.guestbook
  for delete to authenticated using (true);

grant select, insert on public.guestbook to anon, authenticated;
grant delete on public.guestbook to authenticated;
