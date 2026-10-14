-- 방명록 테이블 + 관리자
-- Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 Run 하세요. (다시 실행해도 안전)
-- 맨 아래 관리자 이메일을 내 로그인 이메일로 바꾼 뒤 실행하세요.

create table if not exists public.guestbook (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 30),
  message    text not null check (char_length(message) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists guestbook_recent on public.guestbook (created_at desc);

-- 관리자 목록 (방명록 글 삭제 권한). 회원가입을 열어 두므로 "로그인한 사람"이 아니라 관리자만 삭제 가능하게 함
create table if not exists public.admins (
  user_id uuid primary key references auth.users on delete cascade
);
alter table public.admins enable row level security;
drop policy if exists "see self" on public.admins;
create policy "see self" on public.admins
  for select to authenticated using (user_id = auth.uid());
grant select on public.admins to authenticated;

alter table public.guestbook enable row level security;

-- 누구나(로그인 없이) 읽고 쓰기 가능
drop policy if exists "guestbook read" on public.guestbook;
create policy "guestbook read" on public.guestbook
  for select to anon, authenticated using (true);

drop policy if exists "guestbook write" on public.guestbook;
create policy "guestbook write" on public.guestbook
  for insert to anon, authenticated with check (true);

-- 삭제는 관리자만
drop policy if exists "guestbook delete" on public.guestbook;
create policy "guestbook delete" on public.guestbook
  for delete to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

grant select, insert on public.guestbook to anon, authenticated;
grant delete on public.guestbook to authenticated;

-- 관리자 등록: 따옴표 안을 내 로그인 이메일로 바꾸세요 (그 이메일로 먼저 가입/계정 생성이 되어 있어야 함)
insert into public.admins (user_id)
select id from auth.users where email = 'my-email@example.com'
on conflict do nothing;
