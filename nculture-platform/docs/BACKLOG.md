# Coming AI — 백로그

> "지금은 안 하지만 나중에 반드시" 할 항목을 잃어버리지 않게 관리하는 문서.
> 각 항목은 **트리거(언제 붙일지)** 를 명시한다. 착수하면 상태를 바꾸고,
> 완료되면 [PROGRESS.md](./PROGRESS.md) 로 옮긴 뒤 여기서 지운다.
>
> 최종 업데이트: 2026-07-23

## 목록

| # | 항목 | 우선순위 | 트리거 | 상태 |
|---|---|---|---|---|
| B-1 | 강의별 루브릭 기반 영상 채점 | 중 | 실서비스에 AI 영상생성 강의 도입 | 📋 대기 |

---

## B-1. 강의별 루브릭 기반 영상 채점

**한 줄**: 지금은 범용 "영상 품질" 루브릭으로 고정 채점 → 실서비스에선 **강의별 학습목표**에 맞춰 채점한다.

### 배경 / 왜 지금 안 하나
- 현재 채점(`/api/grade`)은 하드코딩된 4축 — **강의 무관 범용 영상 품질** 평가:
  프롬프트 충실도 35% · 시각적 품질 25% · 모션 자연스러움 20% · 시간적 일관성 20%.
- 인제스트엔 이미 **강의별 루브릭**(`session_ingest.data.rubric`: `focus` · `keywords_expected` · `criteria`)이
  있으나 채점에서 **전혀 참조하지 않는다**.
- 현재 시연 강의(2-3 디자인씽킹)는 **AI 영상생성 강의가 아니다**. 여기에 맞춰 강의별 루브릭을 붙이면
  잘못된 샘플에 오버핏된다. → 실 AI생성 강의가 여러 개 쌓일 때 붙이는 게 맞다.
- 지금은 "생성 영상의 기술 품질을 실제로 제대로 채점"하는 것(이미 동작)으로 충분하다.

### 이미 있는 seam (그래서 나중에 작은 작업)
- `session_ingest.data.rubric` 필드 — 마이그레이션 015, 인제스트 산출물에 존재.
- `/api/grade` 라우트 — 현재는 고정 SYSTEM 프롬프트만 사용.
- `analytics.ts` `gradeGeneratedVideo()` 가 이미 `sessionId` 를 넘긴다 → 라우트가 그 세션 rubric 을 조회 가능.
- 결과 스키마에 `matchedKeywords` 필드가 이미 있으나 현재 **항상 빈 배열**.

### 해야 할 것
1. `/api/grade` 가 `sessionId` 로 `session_ingest.data.rubric` 을 조회(또는 요청 바디로 전달).
2. `rubric.focus` + `keywords_expected` + `criteria` 를 Gemini 프롬프트에 주입 →
   "프롬프트 충실도"를 **이 강의가 요구한 요소 기준**으로 대조.
3. `matchedKeywords` 를 `keywords_expected` 대조 결과로 실제 채움.
4. **강의 유형별 루브릭 분기**:
   - 영상생성형 강의 → 기술 품질 축(현재 4축)
   - 과제/사고형 강의 → 사고·의도 축(`rubric.criteria`, 예: 의도 일치도 40%)
5. 폴백: 강의에 rubric 이 없으면 현재 범용 4축 유지.

### 트리거
실 서비스에 **AI 영상생성 중심 강의**가 도입될 때. (그전까진 범용 채점으로 충분)

### 관련 파일
- `frontend/app/api/grade/route.ts`
- `frontend/lib/analytics.ts` — `gradeGeneratedVideo()`
- `supabase/migrations/015_analysis_personalization.sql` — `session_ingest.data.rubric`
- `scripts/ingest/grade_video.py` — 채점 레퍼런스

---

<!-- 새 항목은 아래 형식으로 추가하고, 위 목록 표에도 한 줄 넣는다.
## B-N. 제목
**한 줄**: …
### 배경 / 왜 지금 안 하나
### 이미 있는 seam
### 해야 할 것
### 트리거
### 관련 파일
-->
