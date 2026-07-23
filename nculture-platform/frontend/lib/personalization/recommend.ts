/**
 * 추천 프롬프트 랭킹: 프로필 + 후보 프롬프트 → 유저별 랭킹.
 *
 * 제너럴 + 개인화 믹스:
 *   score = α · personal + (1-α) · general
 *   α = evidence / (evidence + K)    (증거량 기반 shrinkage)
 * 콜드유저(이벤트 0)는 α≈0 → 순수 제너럴(인기순). 쌓일수록 개인화.
 */
import type {
  Profile,
  PromptCandidate,
  GlobalStats,
  RankedPrompt,
  LearningEvent,
  AffinityMap,
  SetupRecommendation,
} from './types';

const K_ALPHA = 20; // evidence 이만큼이면 개인화 가중 0.5

function addTo(m: Record<string, number>, k: string | undefined | null, w: number) {
  if (!k) return;
  m[k] = (m[k] || 0) + w;
}

function normalize(m: Record<string, number>): Record<string, number> {
  let total = 0;
  for (const k in m) total += Math.max(0, m[k]);
  if (total === 0) return {};
  const out: Record<string, number> = {};
  for (const k in m) out[k] = +(Math.max(0, m[k]) / total).toFixed(4);
  return out;
}

/**
 * 전체 사용자 이벤트에서 제너럴 baseline 집계.
 * 구간 인기(참여 이벤트 수) + 구간 평균 별점.
 */
export function computeGlobalStats(allEvents: LearningEvent[]): GlobalStats {
  const pop: Record<string, number> = {};
  const starsSum: Record<string, number> = {};
  const starsN: Record<string, number> = {};

  for (const ev of allEvents) {
    const p = ev.payload || {};
    const sec: string | undefined = p.section || p.timecode;
    if (
      sec &&
      (ev.event_type === 'dwell' ||
        ev.event_type === 'generate' ||
        ev.event_type === 'apply_recommendation' ||
        ev.event_type === 'save' ||
        ev.event_type === 'publish')
    ) {
      addTo(pop, sec, 1);
    }
    if (ev.event_type === 'rate' && p.timecode) {
      starsSum[p.timecode] = (starsSum[p.timecode] || 0) + (Number(p.stars) || 0);
      starsN[p.timecode] = (starsN[p.timecode] || 0) + 1;
    }
  }

  const sectionAvgStars: Record<string, number> = {};
  for (const k in starsSum) sectionAvgStars[k] = starsSum[k] / starsN[k];

  return { sectionPopularity: normalize(pop), sectionAvgStars };
}

export interface RankOptions {
  k?: number;        // α shrinkage 상수 (기본 K_ALPHA)
  starBoost?: number; // 구간 평균별점 가산 가중 (기본 0.15)
}

/**
 * 후보 프롬프트를 유저별로 랭킹.
 * personal = 프로필의 구간 affinity, general = 구간 인기(+평균별점 보정).
 */
export function rankPrompts(
  profile: Profile,
  candidates: PromptCandidate[],
  global: GlobalStats,
  opts: RankOptions = {},
): RankedPrompt[] {
  const K = opts.k ?? K_ALPHA;
  const starBoost = opts.starBoost ?? 0.15;
  const alpha = profile.eventCount / (profile.eventCount + K);

  return candidates
    .map((c) => {
      const personal = profile.affinity.section[c.section] ?? 0;
      // 제너럴 = 인기 + 평균별점 정규화(0..1) 보정
      const pop = global.sectionPopularity[c.section] ?? 0;
      const avgStar = global.sectionAvgStars[c.section];
      const starNorm = avgStar ? (avgStar - 1) / 4 : 0; // 1~5 → 0~1
      const general = pop * (1 - starBoost) + starNorm * starBoost;
      const score = alpha * personal + (1 - alpha) * general;
      return { ...c, score: +score.toFixed(6), personal, general: +general.toFixed(6), alpha: +alpha.toFixed(4) };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * 생성 설정(모델·티어·해상도·길이) 추천.
 *
 * 우선순위:
 *   1) 본인이 실제로 성공시킨 조합 (behavior) — 가장 강한 근거
 *   2) 이력이 없으면 온보딩 선언에서 추정 (seed)
 *   3) 그것도 없으면 전체에서 가장 많이 쓰인 조합 (global)
 *
 * 마진 우선 모델 선택은 넣지 않았다(대표님 미결정 사항). 순수하게 사용자 신호만 쓴다.
 */
export function recommendSetup(
  profile: Profile,
  opts: {
    /** 선택 가능한 모델 id 목록 — 여기 없는 모델은 추천하지 않는다 */
    availableServices?: string[];
    /** 전체 사용자 setup 인기 (콜드스타트 폴백) */
    globalSetups?: AffinityMap;
    /** 콘텐츠 종류 → 기본 모델 (시드 폴백용) */
    seedServiceHint?: Record<string, string>;
  } = {},
): SetupRecommendation | null {
  const allowed = opts.availableServices;
  const ok = (svc: string) => !allowed || allowed.includes(svc);

  const parse = (key: string) => {
    const [service, tier, resolution, duration] = key.split('|');
    return {
      service,
      tier: tier || null,
      resolution: resolution || null,
      duration: duration || null,
    };
  };

  // 1) 행동 기반 — 본인이 실제로 성공시킨 조합
  const own = Object.entries(profile.affinity.setup || {})
    .sort((a, b) => b[1] - a[1])
    .find(([k]) => ok(parse(k).service));
  if (own) {
    const s = parse(own[0]);
    const pct = Math.round(own[1] * 100);
    return {
      ...s,
      weight: own[1],
      basis: 'behavior',
      reason: `직접 만든 영상의 ${pct}%를 이 설정으로 작업하셨어요`,
    };
  }

  // 2) 시드 기반 — 관심 콘텐츠에서 모델만 추정 (해상도·길이는 앱 기본값에 맡긴다)
  const hint = opts.seedServiceHint || {};
  const contentTop = Object.entries(profile.affinity.content || {})
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => hint[k])
    .find((svc) => svc && ok(svc));
  if (contentTop) {
    return {
      service: contentTop,
      tier: null,
      resolution: null,
      duration: null,
      weight: 0,
      basis: 'seed',
      reason: '온보딩에서 고르신 관심 분야에 맞춘 기본 모델이에요',
    };
  }

  // 3) 전체 인기
  const glob = Object.entries(opts.globalSetups || {})
    .sort((a, b) => b[1] - a[1])
    .find(([k]) => ok(parse(k).service));
  if (glob) {
    const s = parse(glob[0]);
    return {
      ...s,
      weight: glob[1],
      basis: 'global',
      reason: '다른 수강생들이 가장 많이 쓰는 설정이에요',
    };
  }

  return null;
}

/** 전체 사용자 이벤트에서 setup 인기 집계 (콜드스타트 폴백용) */
export function computeGlobalSetups(allEvents: LearningEvent[]): AffinityMap {
  const m: Record<string, number> = {};
  for (const ev of allEvents) {
    if (ev.event_type !== 'generate') continue;
    const p = ev.payload || {};
    if (p.status === 'failed' || !p.service) continue;
    addTo(m, [p.service, p.tier ?? '', p.resolution ?? '', p.duration ?? ''].join('|'), 1);
  }
  return normalize(m);
}
