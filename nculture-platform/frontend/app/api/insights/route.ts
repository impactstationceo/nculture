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
      admin.from('user_persona').select('user_id, label, seed, updated_at'),
      admin.from('learning_events')
        .select('id, user_id, event_type, payload, created_at')
        .order('created_at', { ascending: false })
        .limit(EVENT_CAP),
      admin.from('prompt_feedback').select('user_id, stars, timecode, prompt, created_at'),
      admin.from('video_gradings').select('user_id, ai_score, ai_grade, created_at'),
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
      let creditsUsed = 0;

      for (const e of mine) {
        byType[e.event_type] = (byType[e.event_type] || 0) + 1;
        const p = e.payload || {};
        // 모델 선호는 '고른 것'(model_select)뿐 아니라 '실제로 쓴 것'(generate)도 세야
        // 실제 사용 패턴이 잡힌다. 피커를 안 열고 기본 모델로 생성하는 경우가 흔하다.
        if (e.event_type === 'model_select' || e.event_type === 'generate') {
          if (p.service) {
            const k = `${p.service}${p.tier ? ` · ${p.tier}` : ''}`;
            models[k] = (models[k] || 0) + 1;
          }
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
            generateCount += 1;
            creditsUsed += Number(p.credits) || 0;
            if (p.from_recommendation) generatedFromRecommendation += 1;
            break;
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

      return {
        userId: uid,
        label: persona?.label || null,
        seed: persona?.seed || null,
        lastActiveAt: times[times.length - 1] || null,
        totals: {
          events: mine.length,
          generate: generateCount,
          creditsUsed,
          ratings: stars.length,
          gradings: scores.length,
        },
        derived: {
          eventsByType: byType,
          topModels: topN(models, 3),
          topStyles: topN(styles, 3),
          // 어느 구간에 얼마나 머물렀는지 — 개인화의 핵심 신호
          topSections: topN(dwellBySection, 3),
          appliedRecommendation,
          generatedFromRecommendation,
          // 추천을 적용한 뒤 실제로 생성까지 간 비율
          recommendationConversion:
            appliedRecommendation > 0
              ? Math.round((generatedFromRecommendation / appliedRecommendation) * 100)
              : null,
          avgRating: stars.length ? Number((stars.reduce((a, b) => a + b, 0) / stars.length).toFixed(1)) : null,
          avgGradeScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
        },
      };
    });

    members.sort((a, b) => (b.lastActiveAt || '').localeCompare(a.lastActiveAt || ''));

    return NextResponse.json({
      members,
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
