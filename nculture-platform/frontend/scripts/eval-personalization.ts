/**
 * 개인화 평가 하네스 (Phase 4 의 축소판 — Phase 2 검증용).
 *
 * 합성 데이터로 프로필→추천 랭킹을 돌리고, ground truth(section_interest) 대비
 * NDCG 로 복원율을 잰다. 개인화 vs 제너럴-only baseline 을 비교해 '리프트' 확인.
 *
 * 실행: cd frontend && npx --yes tsx scripts/eval-personalization.ts
 */
import fs from 'fs';
import path from 'path';
import {
  computeProfile,
  computeGlobalStats,
  rankPrompts,
  type LearningEvent,
  type PromptCandidate,
} from '../lib/personalization';

const OUT = path.join(__dirname, '..', '..', 'scripts', 'out', 'synthetic');
const read = (f: string) => JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf-8'));

function ndcg(order: string[], relevance: Record<string, number>, k: number): number {
  const dcg = (arr: string[]) =>
    arr.slice(0, k).reduce((s, sec, i) => s + (relevance[sec] || 0) / Math.log2(i + 2), 0);
  const ideal = Object.keys(relevance).sort((a, b) => (relevance[b] || 0) - (relevance[a] || 0));
  const idcg = dcg(ideal);
  return idcg === 0 ? 0 : dcg(order) / idcg;
}

function main() {
  const users: Array<{ key: string; declared_seed: any }> = read('users.json');
  const allEvents: Array<LearningEvent & { user_id: string }> = read('learning_events.json');
  const ground: Record<string, any> = read('groundtruth.json');

  // 후보 = ground truth 에 등장하는 구간(timecode) 전체
  const sections = Array.from(
    new Set(Object.values(ground).flatMap((g: any) => Object.keys(g.section_interest || {}))),
  );
  const candidates: PromptCandidate[] = sections.map((s) => ({ id: s, section: s, text: `[${s}]` }));

  const global = computeGlobalStats(allEvents);

  // 제너럴-only baseline: 모든 유저 동일 (인기순)
  const generalOrder = candidates
    .map((c) => ({ s: c.section, v: global.sectionPopularity[c.section] || 0 }))
    .sort((a, b) => b.v - a.v)
    .map((x) => x.s);

  const byUser: Record<string, LearningEvent[]> = {};
  for (const e of allEvents) (byUser[e.user_id] ||= []).push(e);

  const K = 3;
  let sumPers = 0,
    sumGen = 0,
    n = 0;
  const perArch: Record<string, { p: number; g: number; n: number }> = {};

  for (const u of users) {
    const gt = ground[u.key];
    if (!gt || !gt.section_interest || Object.keys(gt.section_interest).length === 0) continue;
    const profile = computeProfile(byUser[u.key] || [], u.declared_seed);
    const ranked = rankPrompts(profile, candidates, global);
    const persNdcg = ndcg(ranked.map((r) => r.section), gt.section_interest, K);
    const genNdcg = ndcg(generalOrder, gt.section_interest, K);
    sumPers += persNdcg;
    sumGen += genNdcg;
    n++;
    const a = gt.archetype;
    perArch[a] ||= { p: 0, g: 0, n: 0 };
    perArch[a].p += persNdcg;
    perArch[a].g += genNdcg;
    perArch[a].n++;
  }

  const pers = sumPers / n;
  const gen = sumGen / n;
  console.log(`\n평가 유저 ${n}명 · NDCG@${K}\n`);
  console.log(`  개인화(personal+general): ${pers.toFixed(4)}`);
  console.log(`  제너럴-only baseline:      ${gen.toFixed(4)}`);
  console.log(`  리프트:                    +${(((pers - gen) / gen) * 100).toFixed(1)}%\n`);
  console.log('  아키타입별 (개인화 / 제너럴):');
  for (const a of Object.keys(perArch).sort()) {
    const r = perArch[a];
    console.log(
      `    ${a.padEnd(20)} ${(r.p / r.n).toFixed(3)} / ${(r.g / r.n).toFixed(3)}  (${r.n}명)`,
    );
  }

  // 샘플 1명: 추천 상위 vs 진짜 관심 구간
  const sample = users.find((u) => ground[u.key]?.archetype === 'ads_pro');
  if (sample) {
    const prof = computeProfile(byUser[sample.key] || [], sample.declared_seed);
    const ranked = rankPrompts(prof, candidates, global);
    const trueTop = Object.entries(ground[sample.key].section_interest)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 3)
      .map(([s]) => s);
    console.log(`\n  샘플 ${sample.key} (α=${ranked[0].alpha}, 이벤트=${prof.eventCount})`);
    console.log(`    추천 top3:  ${ranked.slice(0, 3).map((r) => r.section).join(', ')}`);
    console.log(`    진짜 관심:  ${trueTop.join(', ')}`);
  }
}

main();
