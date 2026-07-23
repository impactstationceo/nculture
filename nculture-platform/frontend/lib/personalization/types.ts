/**
 * 개인화 레이어 타입 — 프로필 계산 + 추천 프롬프트 랭킹.
 * 순수(브라우저/서버/평가 하네스 공용) — DB·React 의존 없음.
 */

/** learning_events 한 건 (payload 는 event_type 별로 다름) */
export interface LearningEvent {
  event_type: string;
  payload?: Record<string, any> | null;
  created_at?: string | null; // ISO. 없으면 recency 감쇠 없이 균등 가중.
}

/** 온보딩 스타일 선호 (coming_persona_seed) — 콜드스타트 prior */
export interface PersonaSeed {
  contentTypes?: string[];
  visualStyles?: string[];
  purpose?: string | null;
  experience?: string | null;
  skipped?: boolean;
}

export type AffinityMap = Record<string, number>; // 정규화된 가중 (합=1, 음수는 0으로 클램프)

/** 이벤트+시드에서 파생되는 사용자 프로필 (user_persona.derived 에 저장) */
export interface Profile {
  affinity: {
    content: AffinityMap;  // 주로 시드(선언) 기반 — 행동엔 콘텐츠 라벨이 없음
    style: AffinityMap;    // 주로 시드 기반
    service: AffinityMap;  // 행동 기반 (model_select/generate)
    section: AffinityMap;  // 행동 기반 (dwell/generate/rate/save…) — 추천 랭킹의 핵심 축
  };
  purpose: string | null;
  experience: string | null;
  eventCount: number;   // 행동 이벤트 수 = 증거량 (믹스 α 계산에 사용)
  confidence: number;   // 0..1, 증거량이 많을수록 1
  updatedAt: string | null;
}

/** 랭킹 대상 후보 프롬프트 */
export interface PromptCandidate {
  id: string;       // 고유 id (보통 timecode)
  section: string;  // 회차 내 구간 (timecode)
  text: string;     // 추천 프롬프트 문구
}

/** 전체 사용자 집계 (제너럴 baseline) */
export interface GlobalStats {
  sectionPopularity: AffinityMap;         // 구간별 인기(정규화)
  sectionAvgStars: Record<string, number>; // 구간별 평균 별점
}

/** 랭킹 결과 (스코어 분해 포함 — 디버깅/설명가능성) */
export interface RankedPrompt extends PromptCandidate {
  score: number;     // 최종 블렌드 스코어
  personal: number;  // 개인화 성분
  general: number;    // 제너럴 성분
  alpha: number;     // 개인화 가중 (증거량 기반)
}
