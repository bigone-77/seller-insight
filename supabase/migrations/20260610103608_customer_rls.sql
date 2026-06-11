-- 손님 챗봇(anon, 비로그인)용 RLS 정책.
-- 데모 수준 — visitor 단위 행 격리는 하지 않음. authenticated(셀러) 정책은 admin-auth 단계에서 별도.

-- 4개 테이블 모두 RLS enable
alter table conversations enable row level security;
alter table messages enable row level security;
alter table products enable row level security;
alter table insights enable row level security;

-- conversations: anon 읽기/쓰기 허용
create policy "anon can select conversations"
  on conversations for select to anon using (true);
create policy "anon can insert conversations"
  on conversations for insert to anon with check (true);

-- messages: anon 읽기/쓰기 허용
create policy "anon can select messages"
  on messages for select to anon using (true);
create policy "anon can insert messages"
  on messages for insert to anon with check (true);

-- products: anon 읽기만 허용 (insert/update/delete 정책 없음)
create policy "anon can select products"
  on products for select to anon using (true);

-- insights: anon 정책을 만들지 않음 → RLS enable만으로 기본 차단 유지
--           (분석 결과는 손님에게 노출 금지. 서버측 service_role은 RLS를 우회하므로 어드민 접근엔 영향 없음)
