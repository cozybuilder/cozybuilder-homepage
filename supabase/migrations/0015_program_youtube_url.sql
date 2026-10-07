-- 0015_program_youtube_url — 프로그램 상세 상단 YouTube 영상 (선택)
--
-- 배경: 상세페이지 상단 16:9 영역이 대표 이미지(`image`)만 렌더해서 영상을 넣을 수 없었다.
-- 관리자가 `대표 이미지 → 고급 옵션 → URL 직접 입력`에 YouTube 주소를 넣어도 그 값은
-- `image` 로 저장되어 Next <Image> 로 렌더되므로 영상이 표시되지 않는다.
--
-- 결정: 대표 이미지와 YouTube 영상은 서로 다른 데이터다. `image` 에 영상 URL 을 넣는
-- 방식으로 구현하지 않고 선택 컬럼을 분리한다.
--
-- 표시 우선순위(상세페이지 상단만 해당):
--   youtube_url 유효 → YouTube embed / 없거나 무효 → 기존 대표 이미지(현행 동작 보존)
--   목록·메인·카드 썸네일은 종전대로 `image` 만 사용한다(영상으로 대체하지 않는다).
--
-- 하위 호환:
--   - add column if not exists 로 비파괴 추가. 기본값 없음(null 허용).
--   - 기존 행은 youtube_url = null → 상세 상단이 기존 대표 이미지 그대로.
--   - 값 검증·정규화는 애플리케이션이 소유한다(`lib/youtube.ts`). 저장 형식은
--     canonical `https://www.youtube.com/watch?v=<VIDEO_ID>` 이며, iframe src 는
--     저장값을 그대로 쓰지 않고 검증된 video ID 로만 조립한다.
--
-- 영향: 기존 행 데이터 무변경(컬럼만 추가, 값 null).

alter table public.programs
  add column if not exists youtube_url text;
