-- Product CMS v1 — products 테이블을 범용 상품 구조로 확장.
-- 등록 대상: 디지털 / 서비스 / 구독 / 실물 상품.
-- 기존 데이터 보존: 레거시 컬럼을 새 이름으로 rename(텍스트 price→price_label) 후 신규 컬럼 추가.
-- 결제/주문/재고는 범위 밖(v1은 노출 + 문의 유도). Supabase SQL Editor 에서 1회 실행. 멱등(재실행 안전).

-- ── 1) 레거시 컬럼 → 스펙 컬럼명 rename ──
do $$
declare
  has boolean;
  hasnew boolean;
begin
  -- name → title
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='name') into has;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='title') into hasnew;
  if has and not hasnew then alter table public.products rename column name to title; end if;

  -- image → thumbnail_url
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='image') into has;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='thumbnail_url') into hasnew;
  if has and not hasnew then alter table public.products rename column image to thumbnail_url; end if;

  -- summary → short_description
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='summary') into has;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='short_description') into hasnew;
  if has and not hasnew then alter table public.products rename column summary to short_description; end if;

  -- long_description → description
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='long_description') into has;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='description') into hasnew;
  if has and not hasnew then alter table public.products rename column long_description to description; end if;

  -- screenshots → gallery_urls
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='screenshots') into has;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='gallery_urls') into hasnew;
  if has and not hasnew then alter table public.products rename column screenshots to gallery_urls; end if;

  -- price(text, 예전 표시문구) → price_label  (이후 숫자 price 컬럼을 새로 추가)
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='price' and data_type='text') into has;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='price_label') into hasnew;
  if has and not hasnew then alter table public.products rename column price to price_label; end if;
end $$;

-- ── 2) 신규 컬럼 추가 ──
alter table public.products add column if not exists product_type text not null default 'digital';
alter table public.products add column if not exists price integer;          -- 숫자 기본가 (없으면 null)
alter table public.products add column if not exists sale_price integer;      -- 할인가
alter table public.products add column if not exists price_type text not null default 'fixed';
alter table public.products add column if not exists price_label text;        -- 가격 표시 문구
alter table public.products add column if not exists options jsonb not null default '[]';
alter table public.products add column if not exists featured boolean not null default false;
alter table public.products add column if not exists thumbnail_url text;
alter table public.products add column if not exists gallery_urls jsonb not null default '[]';
alter table public.products add column if not exists short_description text;
alter table public.products add column if not exists description text;
alter table public.products add column if not exists title text;

-- ── 3) CHECK 제약 완화/추가 ──
-- category: 기존 (website/ebook) 제한 해제 → 자유 텍스트
alter table public.products drop constraint if exists products_category_check;
alter table public.products alter column category drop not null;

-- status: draft/published/hidden/soldout 허용
alter table public.products drop constraint if exists products_status_check;
alter table public.products add constraint products_status_check
  check (status in ('draft','published','hidden','soldout'));

-- product_type / price_type 값 제약
alter table public.products drop constraint if exists products_product_type_check;
alter table public.products add constraint products_product_type_check
  check (product_type in ('digital','service','subscription','physical'));

alter table public.products drop constraint if exists products_price_type_check;
alter table public.products add constraint products_price_type_check
  check (price_type in ('fixed','sale','quote','free','monthly','yearly'));

-- RLS 정책(0002)은 그대로 유효: published 만 공개 select, 관리자 all.
