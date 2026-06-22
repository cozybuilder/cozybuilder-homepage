-- 베타 셀프 구독: 사용자가 "자기 row"만 생성/수정 가능하도록 RLS 추가.
-- service_role 키 없이 동작(서버 액션이 쿠키 기반 사용자 신원으로 호출 → RLS가 소유권 강제).
-- ※ 베타 테스트용. 실제 결제 도입 시에는 self-write 를 제거하고 결제 웹훅으로만 status 를 바꾸도록 잠가야 함.
-- Supabase SQL Editor 에서 실행 (0004 이후).

-- 본인 row insert 허용
create policy "uas_insert_own"
  on public.user_app_subscriptions
  for insert
  with check (auth.uid() = user_id);

-- 본인 row update 허용 (다른 user_id 로 변경 불가)
create policy "uas_update_own"
  on public.user_app_subscriptions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- delete 는 추가하지 않음 (사용자 삭제 불가, 관리자만)
