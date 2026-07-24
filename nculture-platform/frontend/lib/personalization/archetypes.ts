/**
 * 합성 아키타입 정의 + 실회원 매칭.
 *
 * scripts/gen_synthetic_data.py 의 ARCHETYPES(잠재 취향 분포)를 정규화 벡터로
 * 옮긴 것. 실회원 프로필(affinity)과 축별 코사인 유사도로 매칭해
 * "이 회원은 어떤 검증된 유형과 닮았는가"를 계산한다.
 *
 * 주의: 매칭에 붙는 NDCG 수치는 '그 아키타입의 합성 검증 성적'을 전이한 것이지
 * 그 회원의 실측 정확도가 아니다 — 화면에서 반드시 '합성 검증 전이'로 라벨한다.
 * 실측은 별점(prompt_feedback)이 쌓이면 같은 하네스로 계산한다.
 */
import type { AffinityMap, Profile } from './types';

interface ArchetypeDef {
  id: string;
  label: string;
  content: Record<string, number>;
  style: Record<string, number>;
  service: Record<string, number>;
  section: Record<string, number>; // 관심 구간(타임코드) — 2-3 회차 ingest 기준
}

// gen_synthetic_data.py ARCHETYPES 와 동일 가중 (상대값) — PRD 모델 라인업 기준
const DEFS: ArchetypeDef[] = [
  { id: 'cine_hobbyist', label: '시네마틱 취미러',
    content: { video: 3, image: 1 }, style: { cinematic: 4, photoreal: 1 },
    service: { runway: 3, veo: 2 }, section: { '10:41': 3, '15:31': 2, '01:14': 1 } },
  { id: 'ads_pro', label: '광고쇼츠 실무자',
    content: { ads_shorts: 3, video: 1 }, style: { vintage: 3, minimal: 2 },
    service: { minimax: 3, kling: 1 }, section: { '18:53': 3, '20:17': 3, '18:21': 1 } },
  { id: 'brand_designer', label: '브랜딩 디자이너',
    content: { image: 2, ads_shorts: 2 }, style: { minimal: 3, photoreal: 2 },
    service: { kling: 2, veo: 2 }, section: { '16:19': 3, '18:21': 2, '19:48': 2 } },
  { id: 'anime_creator', label: '애니 크리에이터',
    content: { image: 3, video: 1 }, style: { anime: 4, experimental: 1 },
    service: { kling: 2, seedance: 1 }, section: { '02:12': 3, '12:33': 2 } },
  { id: 'edu_researcher', label: '교육/연구자',
    content: { video: 2, digital_human: 2 }, style: { minimal: 2, photoreal: 2 },
    service: { veo: 2, 'gemini-omni': 1 }, section: { '10:41': 2, '12:33': 3, '15:31': 2 } },
  { id: 'experimental_artist', label: '실험 아티스트',
    content: { video: 2, image: 2 }, style: { experimental: 4, cinematic: 1 },
    service: { seedance: 2, kling: 2 }, section: { '02:12': 2, '19:48': 2, '20:17': 1 } },
  { id: 'digital_human_pro', label: '디지털휴먼 실무',
    content: { digital_human: 4, video: 1 }, style: { photoreal: 4, minimal: 1 },
    service: { veo: 3, runway: 1 }, section: { '16:19': 2, '18:21': 3 } },
  { id: 'novice_explorer', label: '입문 탐색러',
    content: { video: 2, image: 2, ads_shorts: 1 }, style: { cinematic: 1, minimal: 1, photoreal: 1 },
    service: { minimax: 2, runway: 1, veo: 1 }, section: { '01:14': 2, '10:41': 1, '18:53': 1 } },
];

function normalize(m: Record<string, number>): AffinityMap {
  let total = 0;
  for (const k in m) total += m[k];
  if (!total) return {};
  const out: AffinityMap = {};
  for (const k in m) out[k] = +(m[k] / total).toFixed(4);
  return out;
}

export interface Archetype {
  id: string;
  label: string;
  vector: { content: AffinityMap; style: AffinityMap; service: AffinityMap; section: AffinityMap };
}

export const ARCHETYPES: Archetype[] = DEFS.map((d) => ({
  id: d.id,
  label: d.label,
  vector: {
    content: normalize(d.content),
    style: normalize(d.style),
    service: normalize(d.service),
    section: normalize(d.section),
  },
}));

function cosine(a: AffinityMap, b: AffinityMap): number {
  let dot = 0, na = 0, nb = 0;
  for (const k in a) {
    na += a[k] * a[k];
    if (b[k]) dot += a[k] * b[k];
  }
  for (const k in b) nb += b[k] * b[k];
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// 행동 축(section/service)을 선언 축(style/content)보다 무겁게 — 추천도 그 순서로 믿는다
const AXIS_WEIGHTS = { section: 0.4, service: 0.25, style: 0.2, content: 0.15 } as const;
const MIN_SIMILARITY = 0.2; // 이 밑이면 "닮은 유형 없음"이 정직하다

export interface ArchetypeMatch {
  id: string;
  label: string;
  /** 0..1 — 신호 있는 축들의 가중 코사인 유사도 */
  similarity: number;
}

/**
 * 실회원 프로필 → 가장 닮은 합성 아키타입.
 * 신호가 없는 축은 빼고 남은 축의 가중을 재정규화한다. 전 축이 비면 null.
 */
export function matchArchetype(profile: Profile): ArchetypeMatch | null {
  let best: ArchetypeMatch | null = null;
  for (const a of ARCHETYPES) {
    let sim = 0, wsum = 0;
    for (const axis of ['section', 'service', 'style', 'content'] as const) {
      const pv = profile.affinity[axis];
      if (!pv || !Object.keys(pv).length) continue;
      sim += AXIS_WEIGHTS[axis] * cosine(pv, a.vector[axis]);
      wsum += AXIS_WEIGHTS[axis];
    }
    if (!wsum) continue;
    const s = +(sim / wsum).toFixed(4);
    if (!best || s > best.similarity) best = { id: a.id, label: a.label, similarity: s };
  }
  return best && best.similarity >= MIN_SIMILARITY ? best : null;
}
