# CLAUDE.md

쇼핑몰 챗봇의 대화 로그를 분석해 셀러에게 인사이트를 제공하는 어드민 서비스.
손님용 챗봇이 쌓은 대화 데이터를 셀러 관점에서 분석하는 것이 목표.

## 핵심 방향

단순 통계 대시보드가 아니라, 에이전트가 대화 로그를 읽고 판단을 도출하는 것이 핵심.

- 고객 의도 분류 → 미충족 수요(찾았으나 재고에 없던 상품) 추출 → 소싱 제안
- 단순 요약을 넘어 "이 상품을 입고하면 전환이 개선될 것"까지 도출

## 스택

- Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Supabase (PostgreSQL + Auth)
- Gemini API (@ai-sdk/google, Function Calling), Vercel AI SDK
- 분석 진행 상황은 SSE로 스트리밍

## 프로젝트 구조

- Next.js 단일 앱. 손님/어드민이 동일한 API·DB를 공유하므로 모노레포는 채택하지 않음
- app/(customer): 손님 챗봇 / app/admin: 셀러 어드민 / app/api: 서버 로직
- lib/agent, lib/schemas, lib/supabase, lib/claude
- 화면 규모를 고려해 FSD 대신 관심사 분리 수준의 구조 채택

## 데이터베이스 (테이블 4개 + auth.users)

- conversations: 대화 세션. visitor_id로 익명 손님 식별
- messages: 메시지. conversation_id(FK)로 세션에 귀속, role은 user/assistant
- products: 상품 및 재고. 재고는 에이전트의 check_inventory 툴 검증 대상
- insights: 분석 결과. result는 jsonb로 저장, 자주 조회하는 period·status는 별도 컬럼
- 자주 조회·필터하는 값은 컬럼으로, 구조가 유동적인 결과는 jsonb로 분리

## 에이전트 흐름

1. 로그 적재: 시드 로그 + 실시간 로그 병합 (LLM 미사용)
2. 의도 분류 (LLM)
3. 미충족 수요 추출 (LLM)
4. 소싱 제안 (LLM + check_inventory 툴로 실제 재고 확인, 환각 방지)
5. Zod 스키마 검증 (실패 시 재요청)

- 각 단계 종료 시 SSE로 진행 상황 전송

## 작업 규칙

- 환경변수(.env.local)는 커밋 금지. .env.example만 커밋
- 손님 챗봇은 로그 생성 범위로 한정, 구현 비중은 어드민 에이전트에 집중

### 브랜치 컨벤션

- main: 배포 가능한 안정 브랜치
- feat/\*: 기능 개발 (예: feat/agent-analyze)
- fix/\*: 버그 수정
- refactor/\*: 리팩토링
- chore/\*: 설정·환경 작업
- 작업은 브랜치 단위로 분리하고 PR로 main에 병합

### 커밋 컨벤션

형식: `<이모지> <타입>: <설명>`

- 🎉 Start: 프로젝트 시작
- ✨ Feat: 새로운 기능 추가
- 🐛 Fix: 버그 수정
- 🎨 Design: CSS 등 UI 디자인 변경
- ♻️ Refactor: 코드 리팩토링
- 🔧 Settings: 설정 파일 변경
- 🗃️ Comment: 주석 추가 및 변경
- ➕ Dependency/Plugin: 의존성·플러그인 추가
- 📝 Docs: 문서 수정
- 🔀 Merge: 브랜치 병합
- 🚀 Deploy: 배포
- 🚚 Rename: 파일·폴더명 수정 또는 이동
- 🔥 Remove: 파일 삭제
- ⏪️ Revert: 이전 버전 롤백

## 범위 외 (의도적 제외)

- 손님 챗봇 고도화, 실시간 자동 분석, 결과 캐싱
- 향후 개선: LLM 응답 품질 평가셋, 스키마 버저닝, 멀티 테넌트 지원
