# 핸드오프: 첫 사용자 AI 스타일 선호도 온보딩 페이지

> 아래 전체를 Claude 에이전트에게 그대로 전달하세요. 자기완결형 브리프입니다.

---

## 작업 지시 (이 아래를 에이전트에게 전달)

너는 Next.js 14 App Router 프로젝트에 **첫 사용자 온보딩 페이지 하나**를 추가한다. 넷플릭스식으로 AI 스타일 선호도를 카드로 고르게 해서 초기 개인화 시드 데이터를 확보하는 화면이다. **DB 없이 localStorage에만 저장**한다.

### 프로젝트 컨텍스트

- 위치: `/Users/impactstation/Documents/work/nculture/nculture-platform/frontend`
- 스택: **Next.js 14.0.4 (App Router) · React 18 · TypeScript · Tailwind CSS · lucide-react**
- **의존성 추가 금지.** 위 4개 외에 아무것도 설치하지 마라 (상태·폼·애니메이션 라이브러리 X). 필요한 건 React 내장 훅 + Tailwind로 해결.
- 서비스: K-컬처 AI 크리에이터 교육 플랫폼 "Coming AI". 학생이 Sora·Veo·Kling(영상), Midjourney·Flux(이미지) 같은 생성형 AI로 콘텐츠를 만드는 실습 플랫폼.
- 앱은 현재 **데모 모드**로 DB 없이 돈다. 인증 상태는 `localStorage`에 저장된다 (`components/AuthProvider.tsx`의 `demo_session` 패턴 참고 — 이게 표준 패턴이다).

### 디자인 시스템 (Toss 스타일 — 반드시 준수)

`tailwind.config.js`에 정의된 토큰만 사용:
- Primary: **Toss Blue `#3182F6`** — `bg-indigo-500`, `bg-indigo-600`, `text-indigo-600`, 또는 `toss.blue`
- Primary light: `#E8F3FF` — `bg-indigo-50`, `toss.blue-light`
- 중립: `neutral-50 #F9FAFB`, `neutral-100 #F2F4F6`, `neutral-200 #E5E8EB`, `neutral-400 #8B95A1`, `neutral-500 #6B7684`, `neutral-700 #333D4B`, `neutral-900 #191F28`
- 폰트: Pretendard (전역 적용됨). 별도 폰트 로드 금지.
- 카드/버튼: `rounded-2xl`/`rounded-xl`, 부드러운 그림자(`shadow-sm`), 선택 시 `#3182F6` 테두리·배경 강조. 이모지를 섹션 마커로 남발하지 말 것.
- 한국어 UI. 문구는 따뜻하고 간결하게.

### 만들 것

**파일 1개**: `app/onboarding/page.tsx` (`'use client'` 필수)

화면 흐름 (단일 페이지, 내부 스텝):
1. **환영 헤드라인** — "당신에게 맞는 AI 창작 스타일을 찾아드릴게요" 류. 우측 상단에 **[건너뛰기]** 텍스트 버튼(항상 노출).
2. **스텝 A — 관심 콘텐츠 유형** (다중 선택 카드): 영상 / 이미지 / 디지털 휴먼 / 광고·쇼츠
3. **스텝 B — 선호 비주얼 스타일** (다중 선택 카드, 각 카드에 대표 키워드): 시네마틱 / 애니메이션·일러스트 / 포토리얼 / 미니멀·모던 / 실험적·추상 / 빈티지·필름
4. **스텝 C — 사용 목적** (단일 선택): 취미·자기표현 / 실무·커머셜 / 브랜딩·마케팅 / 교육·연구
5. **스텝 D — 경험 수준** (단일 선택): 입문 / 중급 / 실무자
6. **완료** — 선택 요약을 짧게 보여주고 **[시작하기]** → 시드 저장 후 `/curriculum`로 이동.

- 스텝은 진행 표시(상단 프로그레스 바 or 점)와 이전/다음 버튼. 각 스텝은 부드럽게 전환(Tailwind transition 정도, 무거운 애니메이션 X).
- **[건너뛰기]** 누르면 시드에 `skipped: true`만 기록하고 즉시 `/curriculum`로.

### 데이터 모델 (정확히 이 형태로 저장)

`localStorage` 키: **`coming_persona_seed`**

```ts
interface PersonaSeed {
  contentTypes: string[];   // ['video', 'image', ...]
  visualStyles: string[];   // ['cinematic', 'anime', ...]
  purpose: string | null;   // 'hobby' | 'commercial' | 'branding' | 'education'
  experience: string | null;// 'beginner' | 'intermediate' | 'pro'
  skipped: boolean;
  createdAt: string;        // new Date().toISOString()
}
```

- 각 선택지는 **표시용 한글 라벨 + 저장용 영문 값**을 함께 관리(위 값들처럼). 카드 정의를 파일 상단 상수 배열로 두면 나중에 확장이 쉽다.
- 저장은 완료(또는 건너뛰기) 시점에 `localStorage.setItem('coming_persona_seed', JSON.stringify(seed))` 한 번.

### 통합 지점

- **라우트**: `app/onboarding/page.tsx` 새로 만들면 `/onboarding`으로 자동 라우팅됨. 다른 파일 수정 불필요.
- **이동**: `import { useRouter } from 'next/navigation'` → `router.push('/curriculum')`.
- **레이아웃**: 전역 `app/layout.tsx`가 `<AppShell>`로 감싼다. 온보딩은 헤더 없는 풀스크린이 자연스러우면, 페이지 자체를 `min-h-screen`으로 꽉 채우는 정도로 처리(레이아웃 파일은 건드리지 마라).
- **provider 배선은 하지 마라.** 이 작업은 페이지 + localStorage 저장까지만. 프로필을 소비하는 `PersonalizationProvider`는 후속 작업이다.

### 하지 말 것 (범위 경계)

- ❌ Supabase·DB·API 호출 추가 금지 (localStorage만).
- ❌ 의존성 설치 금지.
- ❌ `AuthProvider.tsx`, `Providers.tsx`, `layout.tsx`, `tailwind.config.js` 수정 금지.
- ❌ 개인화 추천 로직·프로필 소비·별점 등 후속 기능 구현 금지. **오직 온보딩 페이지 + 시드 저장.**
- ❌ 첫 방문 자동 리다이렉트 훅 추가 금지(이번엔 `/onboarding` 직접 접근으로 테스트). 자동 진입은 후속 결정.

### 완료 기준 (검증)

1. `cd frontend && npm run dev` 후 `http://localhost:3000/onboarding` 접속 → 스텝 A~D 진행 → 완료 시 `/curriculum` 이동.
2. 완료 후 브라우저 콘솔에서 `localStorage.getItem('coming_persona_seed')` → 위 스키마대로 채워진 JSON 확인.
3. [건너뛰기] → `skipped: true`인 시드 저장 + `/curriculum` 이동.
4. `npm run build` 통과(타입 에러 0).
5. 다중 선택/단일 선택 동작, 이전/다음, 프로그레스 표시 정상.
6. 데스크톱·모바일 폭 모두 레이아웃 깨짐 없음(`max-w-*` + 반응형).

작업 후, 만든 파일 경로와 위 검증 결과(특히 저장된 시드 JSON 예시)를 보고하라.

---

## (핸드오프 발신자용 메모 — 에이전트에게 전달 X)

- 이 시드(`coming_persona_seed`)는 후속 `PersonalizationProvider`가 읽어 "제너럴 + 개인화 믹스"의 개인화 기준점으로 쓴다. 그래서 값 스키마를 지금 고정해두는 게 중요.
- 스타일 카테고리는 플랫폼 실제 서비스(영상/이미지)와 PDF의 프롬프트 어시스턴트 키워드(cinematic·composition·atmosphere)에 맞춰 잡음. 실데이터 쌓이면 조정.
- 다음 후속 작업 순서: PersonalizationProvider → 스튜디오 계측 → 스튜디오 소비 → 별점. (`docs/PROGRESS.md` §7-B)
