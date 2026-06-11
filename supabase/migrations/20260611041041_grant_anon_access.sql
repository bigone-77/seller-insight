-- 손님 챗봇(anon)용 테이블 레벨 GRANT.
-- RLS 정책(customer_rls)과 별개로, anon role에 테이블 권한이 없어 permission denied(42501)가 발생한다.
-- RLS가 행 접근을 게이트하고, GRANT는 테이블 접근 자체를 허용한다 (둘 다 필요).

-- conversations: 읽기/쓰기
grant select, insert on conversations to anon;

-- messages: 읽기/쓰기
grant select, insert on messages to anon;

-- products: 읽기만
grant select on products to anon;

-- insights: anon 권한 부여하지 않음 (사장님 전용 유지)
