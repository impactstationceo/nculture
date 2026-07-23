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
