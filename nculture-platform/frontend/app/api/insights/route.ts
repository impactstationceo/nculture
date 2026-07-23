/**
 * 회원별 개인화 인사이트 집계.
 *
 * service_role 로 도는 이유: 우리 RLS 는 user_id = auth.uid() 소유 기반이라
 * 클라이언트에서는 '본인 것'만 보인다. 회원들을 나란히 비교하려면 서버가 읽어야 한다.
 *
 * user_persona.derived 는 아직 아무도 계산하지 않는다. 여기서는 learning_events 원시
 * 신호에서 즉석 집계한다 — "이 원시 로그에서 이런 특징을 뽑아낼 수 있다"를 그대로 보여주는 셈.
 * 배치로 derived 를 채우는 건 데이터가 쌓인 뒤 단계다.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { computeProfile, computeGlobalStats, rankPrompts } from '@/lib/personalization';
import lectureIngest from '@/lib/ingest/2-3.ingest.json';

export const dynamic = 'force-dynamic';

const EVENT_CAP = 5000; // 프로토타입 규모 가정: 전량 읽어 JS 에서 집계

type Row = Record<string, any>;

function topN(counts: Record<string, number>, n: number) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, value]) => ({ key, value }));
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_COMING_ANALYTICS_URL;
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !svcKey) {
    return NextResponse.json({ error: '서버 환경변수 미설정' }, { status: 500 });
  }
  const admin = createClient(url, svcKey, { auth: { persistSession: false } });

  try {
    const [personaRes, eventRes, feedbackRes, gradingRes] = await Promise.all([
      admin.from('user_persona').select('user_id, label, account, seed, updated_at'),
      admin.from('learning_events')
        .select('id, user_id, event_type, payload, created_at')
        .order('created_at', { ascending: false })
        .limit(EVENT_CAP),
      admin.from('prompt_feedback').select('user_id, stars, timecode, prompt, created_at'),
      // 채점은 정량(ai_criteria)·정성(ai_feedback) 원문까지 그대로 내린다
      admin.from('video_gradings')
        .select('user_id, ai_score, ai_grade, ai_criteria, ai_feedback, ai_model, prompt, video_url, created_at'),
    ]);
    for (const r of [personaRes, eventRes, feedbackRes, gradingRes]) {
      if (r.error) throw r.error;
    }

    const personas: Row[] = personaRes.data || [];
    const events: Row[] = eventRes.data || [];
    const feedback: Row[] = feedbackRes.data || [];
    const gradings: Row[] = gradingRes.data || [];

    // 온보딩만 하고 만 사람, 이벤트만 있고 페르소나가 없는 사람 모두 목록에 잡아야 한다
    const userIds = new Set<string>([
      ...personas.map((p) => p.user_id),
      ...events.map((e) => e.user_id),
      ...feedback.map((f) => f.user_id),
      ...gradings.map((g) => g.user_id),
    ]);

    // 추천 후보 = 회차 인제스트의 화면 프롬프트(구간별). 제너럴 baseline = 전체 이벤트 집계.
    const candidates = ((lectureIngest as any).on_screen_prompts || []).map((p: any) => ({
      id: p.timecode,
      section: p.timecode,
      text: (p.recommended && p.recommended[0]) || p.prompt || '',
    }));
    const globalStats = computeGlobalStats(events as any);

    // "개인화가 없었다면"의 순서 — 빈 프로필(α=0)로 랭킹하면 순수 인기순이 나온다.
    // 회원 상세의 전/후 비교(인기순 → 개인화)에 쓴다. 전 회원 공통이라 한 번만 계산.
    const popularityTop = rankPrompts(computeProfile([], null), candidates, globalStats)
      .slice(0, 3)
      .map((r) => ({ timecode: r.section, prompt: r.text }));

    const members = Array.from(userIds).map((uid) => {
      const persona = personas.find((p) => p.user_id === uid);
      const mine = events.filter((e) => e.user_id === uid);
      const myFeedback = feedback.filter((f) => f.user_id === uid);
      const myGradings = gradings.filter((g) => g.user_id === uid);

      const byType: Record<string, number> = {};
      const models: Record<string, number> = {};
      const styles: Record<string, number> = {};
      const dwellBySection: Record<string, number> = {};
      let appliedRecommendation = 0;
      let generatedFromRecommendation = 0;
      let generateCount = 0;
      let generateFailed = 0;
      let creditsUsed = 0;

      for (const e of mine) {
        byType[e.event_type] = (byType[e.event_type] || 0) + 1;
        const p = e.payload || {};
        // 생성 설정은 '성공한 생성'만 센다. 실패는 크레딧이 환불되고 결과물도 없어서
        // 선호 신호로 쓰면 안 된다(같은 프롬프트를 재시도한 것이 3회 선택처럼 잡힘).
        // status 가 없는 과거 이벤트는 성공으로 간주한다(그때는 성공만 기록됐거나 구분이 없었음).
        if (e.event_type === 'generate' && p.status !== 'failed' && p.service) {
          const k = JSON.stringify({
            service: p.service, tier: p.tier ?? null,
            resolution: p.resolution ?? null, duration: p.duration ?? null,
          });
          models[k] = (models[k] || 0) + 1;
        }

        switch (e.event_type) {
          case 'style_select':
            for (const s of p.visual_styles || []) styles[s] = (styles[s] || 0) + 1;
            break;
          case 'dwell':
            if (p.section) dwellBySection[p.section] = (dwellBySection[p.section] || 0) + (Number(p.seconds) || 0);
            break;
          case 'apply_recommendation':
            if (p.is_recommendation) appliedRecommendation += 1;
            break;
          case 'generate':
            if (p.status === 'failed') {
              generateFailed += 1;   // 실패는 별도로 — 재시도 빈발은 UX 신호이지 선호가 아니다
            } else {
              generateCount += 1;
              creditsUsed += Number(p.credits) || 0;
              if (p.from_recommendation) generatedFromRecommendation += 1;
            }
            break;
        }
      }

      // ── 접속 패턴: created_at 만으로 나온다(추가 수집 불필요).
      // created_at 은 UTC 라 그대로 시(hour)를 뽑으면 9시간 어긋난다 → KST 로 옮긴다.
      const byWeekday = [0, 0, 0, 0, 0, 0, 0];   // 일~토
      const byHour: number[] = Array.from({ length: 24 }, () => 0);
      let sessionSeconds = 0;
      let sessionCount = 0;
      for (const e of mine) {
        if (!e.created_at) continue;
        const kst = new Date(new Date(e.created_at).getTime() + 9 * 3600 * 1000);
        byWeekday[kst.getUTCDay()] += 1;
        byHour[kst.getUTCHours()] += 1;
        if (e.event_type === 'session_end') {
          sessionSeconds += Number((e.payload || {}).seconds) || 0;
          sessionCount += 1;
        }
      }

      const times = [
        ...mine.map((e) => e.created_at),
        ...myFeedback.map((f) => f.created_at),
        ...myGradings.map((g) => g.created_at),
        persona?.updated_at,
      ].filter(Boolean).sort();

      const stars = myFeedback.map((f) => Number(f.stars)).filter((n) => !Number.isNaN(n));
      const scores = myGradings.map((g) => Number(g.ai_score)).filter((n) => !Number.isNaN(n));

      // 공유 개인화 모듈(lib/personalization)로 파생 프로필 계산.
      // recency 가중 + 정규화 affinity(content/style/service/section) + confidence.
      // 추천기(rankPrompts)가 쓰는 것과 '같은 프로필' — insights 표시와 추천이 일치한다.
      const profile = computeProfile(mine as any, (persona?.seed as any) ?? null);

      // 예측 뷰: 프로필로 후보 프롬프트를 재정렬 (제너럴+개인화 믹스) → 상위 3개
      const recommendations = rankPrompts(profile, candidates, globalStats)
        .slice(0, 3)
        .map((r) => ({
          timecode: r.section,
          prompt: r.text,
          score: r.score,
          personal: r.personal,
          general: r.general,
          alpha: r.alpha,
        }));

      // ── 상세 내역: 집계 숫자만으로는 '무엇에 대해 그랬는지'가 사라진다 ──
      const writtenPrompts = mine
        .filter((e) => e.event_type === 'generate' && (e.payload || {}).prompt)
        .slice(0, 10)
        .map((e) => {
          const p = e.payload || {};
          return {
            prompt: p.prompt,
            service: p.service ?? null, tier: p.tier ?? null,
            resolution: p.resolution ?? null, duration: p.duration ?? null,
            timecode: p.timecode ?? null,
            // 'recommendation' | 'example' | 'custom' — 없으면 과거 이벤트라 불리언으로 되짚는다
            source: p.prompt_source ?? (p.from_recommendation ? 'recommendation' : 'custom'),
            status: p.status ?? 'success',
            error: p.error ?? null,
            at: e.created_at,
          };
        });

      const ratingDetails = myFeedback
        .slice()
        .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
        .slice(0, 10)
        .map((f) => ({ stars: f.stars, timecode: f.timecode, prompt: f.prompt, at: f.created_at }));

      const gradingDetails = myGradings
        .slice()
        .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
        .slice(0, 5)
        .map((g) => ({
          score: g.ai_score, grade: g.ai_grade, model: g.ai_model,
          prompt: g.prompt, videoUrl: g.video_url,
          criteria: g.ai_criteria || [],   // 정량 (축·가중치·점수)
          feedback: g.ai_feedback || [],   // 정성 (원문 코멘트)
          at: g.created_at,
        }));

      return {
        userId: uid,
        label: persona?.label || null,
        account: persona?.account || null,   // 동명이인 구분용 보조 표시
        seed: persona?.seed || null,
        lastActiveAt: times[times.length - 1] || null,
        details: { writtenPrompts, ratings: ratingDetails, gradings: gradingDetails },
        totals: {
          events: mine.length,
          generate: generateCount,      // 성공한 생성만
          generateFailed,               // 실패(크레딧 환불) 건수
          creditsUsed,
          ratings: stars.length,
          gradings: scores.length,
        },
        derived: {
          eventsByType: byType,
          // 생성 설정 Top3 — 화면에서 모델/해상도/길이를 나눠 보여줄 수 있게 풀어서 넘긴다
          topSetups: topN(models, 3).map(({ key, value }) => ({ ...JSON.parse(key), count: value })),
          topStyles: topN(styles, 3),
          // 어느 구간에 얼마나 머물렀는지 — 개인화의 핵심 신호
          topSections: topN(dwellBySection, 3),
          appliedRecommendation,
          generatedFromRecommendation,
          // 접속 패턴 (KST 기준) — 요일·시간대·평균 세션 길이
          activity: {
            byWeekday, byHour,
            avgSessionSec: sessionCount ? Math.round(sessionSeconds / sessionCount) : null,
            sessions: sessionCount,
          },
          // 추천/예시를 적용한 뒤 얼마나 고쳐 썼는지 — 별점보다 촘촘한 추천 품질 신호
          promptEdit: (() => {
            const rs = mine
              .filter((e) => e.event_type === 'prompt_input')
              .map((e) => (e.payload || {}))
              .filter((p) => p.base_source && p.base_source !== 'custom' && p.edit_ratio != null);
            if (!rs.length) return null;
            const avg = rs.reduce((a, p) => a + Number(p.edit_ratio), 0) / rs.length;
            return { samples: rs.length, avgEditRatio: Number(avg.toFixed(2)) };
          })(),
          // 추천을 적용한 뒤 실제로 생성까지 간 비율
          recommendationConversion:
            appliedRecommendation > 0
              ? Math.round((generatedFromRecommendation / appliedRecommendation) * 100)
              : null,
          avgRating: stars.length ? Number((stars.reduce((a, b) => a + b, 0) / stars.length).toFixed(1)) : null,
          avgGradeScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
        },
        // 공유 개인화 모듈 산출 프로필 (정규화 affinity + confidence) — 추천기와 동일 소스
        profile,
        // 이 프로필로 지금 추천될 프롬프트 top3 (예측 뷰)
        recommendations,
      };
    });

    members.sort((a, b) => (b.lastActiveAt || '').localeCompare(a.lastActiveAt || ''));

    return NextResponse.json({
      members,
      popularityTop, // 개인화 미적용(인기순) 추천 — 전/후 비교용
      recentEvents: events.slice(0, 40).map((e) => ({
        id: e.id,          // 화면에서 '방금 들어온 이벤트'를 가려내는 데 쓴다
        userId: e.user_id,
        label: personas.find((p) => p.user_id === e.user_id)?.label || null,
        type: e.event_type,
        payload: e.payload,
        at: e.created_at,
      })),
      totals: {
        members: members.length,
        events: events.length,
        ratings: feedback.length,
        gradings: gradings.length,
        capped: events.length >= EVENT_CAP, // 상한에 걸렸으면 화면에 알린다
      },
    });
  } catch (e: any) {
    console.error('[insights] 실패:', e);
    return NextResponse.json({ error: e?.message || '집계 실패' }, { status: 500 });
  }
}
