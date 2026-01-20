# nCulture 플랫폼 배포 가이드

## 🚀 빠른 시작 (데모 모드)

환경 변수 없이도 데모 모드로 바로 실행 가능합니다.

```bash
cd frontend
npm install
npm run dev
```

### 데모 계정
- **기관 관리자**: `admin@test.com` (아무 비밀번호)
- **교육자**: `test@test.com` (아무 비밀번호)
- **학생**: 아무 이메일/비밀번호

---

## 📦 프로젝트 구조

```
nculture-platform/
├── frontend/                 # Next.js 14 앱
│   ├── app/                  # 페이지들
│   │   ├── page.tsx          # 홈
│   │   ├── curriculum/       # 클래스 목록
│   │   ├── courses/[id]/     # 클래스 상세
│   │   ├── session/[id]/     # AI 스튜디오 (실습)
│   │   ├── live/             # 라이브 목록
│   │   ├── live/[id]/        # 라이브 강의실
│   │   ├── assessment/       # 테스트
│   │   ├── media/            # 갤러리
│   │   ├── dashboard/        # 대시보드
│   │   ├── mypage/           # 마이페이지
│   │   └── institution/      # 기관 관리
│   ├── components/           # 재사용 컴포넌트
│   │   ├── AuthProvider.tsx  # 전역 인증 상태
│   │   ├── AuthModal.tsx     # 로그인/회원가입
│   │   ├── Header.tsx        # 헤더
│   │   └── PlanModal.tsx     # 요금제 선택
│   └── lib/                  # 유틸리티
│       ├── supabase.ts       # Supabase 클라이언트
│       └── data.ts           # Mock 데이터
├── supabase/
│   ├── migrations/           # DB 스키마
│   └── functions/            # Edge Functions
│       ├── ai-generate/      # AI 생성 API
│       ├── live-room/        # 라이브 룸 API
│       └── payment/          # 결제 API
└── DEPLOY.md
```

---

## 🔧 전체 배포 (Supabase 연동)

### 1. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com) 프로젝트 생성
2. 프로젝트 URL과 anon key 복사

### 2. 데이터베이스 마이그레이션

Supabase 대시보드 → SQL Editor에서 순서대로 실행:

```
migrations/001_schema.sql
migrations/002_rls_policies.sql
migrations/003_storage_policies.sql
migrations/004_invitations.sql
migrations/005_reviews.sql
migrations/006_notifications.sql
migrations/007_inquiries.sql
migrations/008_credit_packages.sql
migrations/009_additional_tables.sql
migrations/010_user_plan_credits.sql
migrations/011_backend_alignment.sql
migrations/012_auth_profile_alignment.sql
migrations/013_media_gallery_rls.sql
migrations/014_course_slug_and_seed.sql
```

### 3. 환경 변수 설정

`frontend/.env.local` 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Edge Functions 배포 (선택)

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-ref

 # 함수 배포
supabase functions deploy ai-generate
supabase functions deploy live-room
supabase functions deploy payment
```

### 4-1. Edge Function 환경 변수

Supabase Functions 환경 변수에 아래 키를 등록:

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
SORA_API_URL
SORA_API_KEY
VEO_API_URL
VEO_API_KEY
MIDJOURNEY_API_URL
MIDJOURNEY_API_KEY
DAILY_API_KEY
TOSS_SECRET_KEY
```

### 5. Vercel 배포

```bash
# Vercel CLI
npm install -g vercel
cd frontend
vercel
```

환경 변수 설정:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (서버/엣지 전용)

---

## ✅ 기능 체크리스트

### 인증
- [x] 이메일/비밀번호 로그인
- [x] 회원가입
- [x] 세션 유지 (새로고침 후에도 로그인 유지)
- [x] 로그아웃
- [x] 역할별 접근 제어 (학생/교육자/기관관리자)

### 클래스
- [x] 클래스 목록 보기
- [x] 클래스 상세 정보
- [x] 세션별 커리큘럼

### AI 스튜디오 (실습)
- [x] AI 서비스 선택 (Sora, Veo, Kling 등)
- [x] 티어 선택 (Standard, Pro, Max)
- [x] 해상도/길이/오디오 설정
- [x] 크레딧 실시간 계산
- [x] 프롬프트 입력 및 생성
- [x] 생성 결과 표시
- [x] 크레딧 차감

### 라이브
- [x] 라이브 목록 (진행중/예정/다시보기)
- [x] 라이브 강의실 입장
- [x] 실시간 채팅
- [x] 마이크/비디오 토글 UI

### 테스트
- [x] 테스트 목록
- [x] 테스트 응시 화면
- [x] 프롬프트 작성 문제

### 요금제
- [x] 플랜 선택 모달
- [x] 플랜별 크레딧 할당
- [x] 플랜 업그레이드

### 대시보드
- [x] 학습 현황
- [x] 최근 생성물
- [x] 통계 카드
- [x] 빠른 액션

### 마이페이지
- [x] 프로필 표시
- [x] 크레딧 잔액
- [x] 크레딧 내역
- [x] 학습 기록
- [x] 설정

### 기관 관리
- [x] 기관 대시보드
- [x] 교육자 관리
- [x] 학생 관리
- [x] 크레딧 배분
- [x] 클래스 승인

---

## 🔌 외부 API 연동 상태

| 서비스 | 상태 | 설명 |
|--------|------|------|
| Supabase Auth | ✅ 구현됨 | 데모 모드 fallback 있음 |
| Supabase DB | ✅ 구현됨 | 마이그레이션 필요 |
| OpenAI Sora | 🟡 준비됨 | SORA_API_URL / SORA_API_KEY 필요 |
| Google Veo | 🟡 준비됨 | VEO_API_URL / VEO_API_KEY 필요 |
| Midjourney | 🟡 준비됨 | MIDJOURNEY_API_URL / MIDJOURNEY_API_KEY 필요 |
| DALL-E | ✅ 구현됨 | OPENAI_API_KEY 필요 |
| Daily.co | 🟡 준비됨 | DAILY_API_KEY 필요 |
| Toss Payments | 🟡 준비됨 | TOSS_SECRET_KEY 필요 |

---

## 🎨 디자인 시스템

- **폰트**: Pretendard (한글), System UI (영문)
- **컬러**:
  - Primary: Toss Blue (#3182F6)
  - Success: #00C853
  - Warning: #FF9100
  - Danger: #F44336
- **스타일**: Tailwind CSS

---

## 📝 주요 수정 내역

### v1.1.0 (최신)
- AuthProvider Context로 전역 상태 관리 통합
- 플랜 선택/업그레이드 기능 추가
- 대시보드 페이지 완전 구현
- AI 스튜디오 Edge Function 연동
- 세션 유지 개선 (24시간 만료)
- 크레딧 계산 버그 수정

### v1.0.0
- 초기 버전
- 12개 페이지 구현
- Supabase 스키마 설계
