-- Product 버튼 정책 단순화 + 품절 공개.
-- 1) button_type 컬럼(inquiry/payment, 기본 inquiry) 추가
-- 2) 공개 RLS: published 뿐 아니라 soldout 도 일반 사용자에게 노출(품절 표시)
-- Supabase SQL Editor 에서 1회 실행. 멱등(재실행 안전). 결제 연동은 범위 밖.

-- ── 1) button_type ──
alter table public.products add column if not exists button_type text not null default 'inquiry';
alter table public.products drop constraint if exists products_button_type_check;
alter table public.products add constraint products_button_type_check
  check (button_type in ('inquiry','payment'));

-- ── 2) 공개 select 정책: published + soldout ──
drop policy if exists "products_select_published" on public.products;
create policy "products_select_published"
  on public.products for select
  using (status in ('published','soldout'));
