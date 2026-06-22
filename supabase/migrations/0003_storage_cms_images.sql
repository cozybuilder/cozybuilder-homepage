-- CMS 이미지 업로드용 Storage 버킷 + 정책
-- Supabase Dashboard > SQL Editor 에서 실행.
-- (또는 Storage UI에서 'cms-images' public 버킷 생성 후 정책만 추가)

-- public 버킷 생성
insert into storage.buckets (id, name, public)
values ('cms-images', 'cms-images', true)
on conflict (id) do nothing;

-- 읽기: 누구나 (public 버킷)
create policy "cms_images_public_read"
  on storage.objects for select
  using (bucket_id = 'cms-images');

-- 업로드/수정/삭제: 관리자만 (is_admin() 은 0002 에서 생성됨)
create policy "cms_images_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'cms-images' and public.is_admin());

create policy "cms_images_admin_update"
  on storage.objects for update
  using (bucket_id = 'cms-images' and public.is_admin())
  with check (bucket_id = 'cms-images' and public.is_admin());

create policy "cms_images_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'cms-images' and public.is_admin());
