-- 셀러(authenticated)용 RLS. insights는 owner_id로 소유자 격리.
-- RLS enable은 customer_rls 단계에서 이미 적용됨 → 여기서는 정책만 추가.

-- 자기 소유 분석 결과만 조회
create policy "authenticated can select own insights"
  on insights for select to authenticated
  using (auth.uid() = owner_id);

-- 자기 소유로만 생성
create policy "authenticated can insert own insights"
  on insights for insert to authenticated
  with check (auth.uid() = owner_id);

-- 자기 소유 행만 수정 (수정 후에도 소유권 유지)
create policy "authenticated can update own insights"
  on insights for update to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
