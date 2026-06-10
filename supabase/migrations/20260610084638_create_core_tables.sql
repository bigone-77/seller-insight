-- 코어 4개 테이블: conversations, messages, products, insights
-- RLS는 다음 단계 별도 마이그레이션에서 적용한다.

-- 1. conversations: 대화 세션 (익명 손님은 visitor_id로 식별)
create table conversations (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  created_at timestamptz not null default now()
);

-- 2. messages: 대화 메시지 (conversation에 귀속, 세션 삭제 시 함께 삭제)
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- 3. products: 상품 및 재고 (check_inventory 툴 검증 대상)
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  price integer not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  description text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- 4. insights: 분석 결과 (셀러 소유, result는 jsonb)
create table insights (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  period_from timestamptz,
  period_to timestamptz,
  result jsonb not null,
  status text not null default 'completed'
    check (status in ('processing', 'completed', 'failed')),
  created_at timestamptz not null default now()
);

-- 인덱스: 자주 조회하는 FK (최소셋)
create index idx_messages_conversation_id on messages (conversation_id);
create index idx_insights_owner_id on insights (owner_id);
