-- Marketing: SNS 하위 채널 구분용 channel_type 컬럼 추가 + 잘못 저장된 category 보정.
-- category 는 기존대로 ('sns','blog') 유지(0002의 CHECK 그대로). 하위 채널은 channel_type 에 저장.
-- Supabase Dashboard > SQL Editor 에서 1회 실행하세요. (실행 전까지는 코드가 channel_type 없이 저장 — 무중단)

alter table public.marketing_channels
  add column if not exists channel_type text;

-- 기존에 category 에 채널 key 가 잘못 들어간 row 보정: category='sns', channel_type=원래값.
update public.marketing_channels
  set channel_type = category,
      category = 'sns'
  where category in ('instagram', 'youtube', 'tiktok', 'facebook', 'threads');
