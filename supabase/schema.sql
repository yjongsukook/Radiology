-- 판독지 스튜디오 저장소 테이블
-- Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 Run 하세요. (한 번만)

create table if not exists public.items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users on delete cascade,
  module     text not null,              -- 판독지 종류 (예: thyroid-us)
  kind       text not null check (kind in ('template', 'report', 'phrase')),
  field      text,                       -- phrase 일 때 어느 칸의 문구인지 (reason, comment, rec)
  title      text,
  body       text not null,
  created_at timestamptz not null default now()
);

create index if not exists items_lookup on public.items (user_id, module, kind, created_at desc);

-- 로그인한 본인 데이터만 읽고 쓸 수 있게 막기 (공개 키가 노출돼도 남의 데이터는 못 봄)
alter table public.items enable row level security;

drop policy if exists "own items" on public.items;
create policy "own items" on public.items
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
