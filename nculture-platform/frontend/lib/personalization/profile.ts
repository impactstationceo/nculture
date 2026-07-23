/**
 * 프로필 계산: learning_events + seed → 파생 affinity 프로필.
 *
 * 원칙:
 *  - 이벤트가 진실, 프로필은 파생물(언제든 재계산 가능).
 *  - recency 지수 감쇠(반감기 14일)로 최근 취향에 가중.
 *  - content/style 은 행동에 라벨이 없어 주로 시드(선언) 기반,
 *    service/section 은 행동 기반(강한 신호). 추천은 section 축을 주로 쓴다.
 */
import type { LearningEvent, PersonaSeed, Profile, AffinityMap } from './types';

const HALF_LIFE_DAYS = 14;
const K_CONFIDENCE = 25; // 이벤트 이만큼 쌓이면 confidence 0.5
const SEED_WEIGHT = 1.0;

function add(m: Record<string, number>, k: string | undefined | null, w: number) {
  if (!k) return;
  m[k] = (m[k] || 0) + w;
}

/** 음수는 0으로 클램프 후 합=1 정규화 */
function normalize(m: Record<string, number>): AffinityMap {
  const pos: Record<string, number> = {};
  let total = 0;
  for (const k in m) {
    const v = Math.max(0, m[k]);
    if (v > 0) {
      pos[k] = v;
      total += v;
    }
  }
  if (total === 0) return {};
  for (const k in pos) pos[k] = +(pos[k] / total).toFixed(4);
  return pos;
}

function recencyWeight(createdAt: string | null | undefined, nowMs: number): number {
  if (!createdAt) return 1;
  const t = Date.parse(createdAt);
  if (isNaN(t)) return 1;
  const days = (nowMs - t) / 86_400_000;
  if (days <= 0) return 1;
  return Math.pow(0.5, days / HALF_LIFE_DAYS);
}

/**
 * 프로필 계산.
 * @param events 해당 사용자의 learning_events
 * @param seed   온보딩 시드(없으면 콜드스타트)
 * @param nowMs  기준 시각(테스트/평가에서 고정 가능). 기본 Date.now()
 */
export function computeProfile(
  events: LearningEvent[],
  seed?: PersonaSeed | null,
  nowMs: number = Date.now(),
): Profile {
  const content: Record<string, number> = {};
  const style: Record<string, number> = {};
  const service: Record<string, number> = {};
  const section: Record<string, number> = {};

  // 시드 prior (선언) — content/style/purpose/experience
  (seed?.contentTypes || []).forEach((c) => add(content, c, SEED_WEIGHT));
  (seed?.visualStyles || []).forEach((s) => add(style, s, SEED_WEIGHT));

  let behavioral = 0;
  let latest: string | null = null;

  for (const ev of events) {
    const w = recencyWeight(ev.created_at, nowMs);
    if (ev.created_at && (!latest || ev.created_at > latest)) latest = ev.created_at;
    const p = ev.payload || {};
    switch (ev.event_type) {
      case 'model_select':
        add(service, p.service, w);
        behavioral++;
        break;
      case 'generate':
        add(service, p.service, w * 2); // 실제로 사용 = 강한 신호
        add(section, p.timecode, w * 1.5);
        behavioral++;
        break;
      case 'regenerate':
        add(service, p.service, w);
        behavioral++;
        break;
      case 'dwell':
        // 체류 오래 = 관심 ↑ (최대 3분까지 반영)
        add(section, p.section, w * Math.min(3, (Number(p.seconds) || 0) / 60));
        behavioral++;
        break;
      case 'apply_recommendation':
        add(section, p.timecode, w * 1.2);
        behavioral++;
        break;
      case 'rate':
        // 별점 3 기준: >3 긍정, <3 부정
        add(section, p.timecode, w * ((Number(p.stars) || 3) - 3) * 0.8);
        behavioral++;
        break;
      case 'save':
        add(section, p.timecode, w * 2); // 결과 저장 = 강한 긍정
        behavioral++;
        break;
      case 'publish':
        add(section, p.timecode, w * 2.5); // 공개 = 최상 긍정
        behavioral++;
        break;
      // style_select 는 온보딩 스냅샷(선언) — 시드로 이미 반영되므로 건너뜀
      default:
        break;
    }
  }

  return {
    affinity: {
      content: normalize(content),
      style: normalize(style),
      service: normalize(service),
      section: normalize(section),
    },
    purpose: seed?.purpose ?? null,
    experience: seed?.experience ?? null,
    eventCount: behavioral,
    confidence: behavioral / (behavioral + K_CONFIDENCE),
    updatedAt: latest,
  };
}
