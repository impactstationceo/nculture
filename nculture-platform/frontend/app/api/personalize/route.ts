/**
 * 강의실 개인화 추천 — 생성 설정 · 구간 · 스타일.
 *
 * service_role 로 도는 이유: 개인 프로필은 본인 이벤트로 충분하지만,
 * 제너럴 baseline(전체 인기)과 콜드스타트 폴백은 전체 이벤트가 있어야 나온다.
 * 인사이트 화면과 '같은 모듈'을 써서 화면에 보이는 프로필과 추천이 어긋나지 않게 한다.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  computeProfile,
  computeGlobalStats,
  computeGlobalSetups,
  rankPrompts,
  recommendSetup,
} from '@/lib/personalization';
import lectureIngest from '@/lib/ingest/2-3.ingest.json';

export const dynamic = 'force-dynamic';

const EVENT_CAP = 5000;

/** 온보딩 관심 콘텐츠 → 콜드스타트 기본 모델 (해당 모델이 없으면 추천 생략) */
const CONTENT_TO_SERVICE: Record<string, string> = {
  video: 'sora',
  image: 'dalle',
  ads_shorts: 'minimax',
  digital_human: 'sora',
};

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_COMING_ANALYTICS_URL;
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !svcKey) {
    return NextResponse.json({ error: '서버 환경변수 미설정' }, { status: 500 });
  }

  try {
    const { userId, availableServices } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId 가 필요합니다.' }, { status: 400 });

    const admin = createClient(url, svcKey, { auth: { persistSession: false } });

    const [mineRes, allRes, personaRes] = await Promise.all([
      admin.from('learning_events')
        .select('event_type, payload, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1000),
      admin.from('learning_events')
        .select('event_type, payload, created_at')
        .order('created_at', { ascending: false })
        .limit(EVENT_CAP),
      admin.from('user_persona').select('seed').eq('user_id', userId).maybeSingle(),
    ]);
    for (const r of [mineRes, allRes, personaRes]) if (r.error) throw r.error;

    const mine = (mineRes.data || []) as any[];
    const all = (allRes.data || []) as any[];
    const seed = (personaRes.data?.seed as any) ?? null;

    const profile = computeProfile(mine, seed);
    const globalStats = computeGlobalStats(all);
    const globalSetups = computeGlobalSetups(all);

    const setup = recommendSetup(profile, {
      availableServices,
      globalSetups,
      seedServiceHint: CONTENT_TO_SERVICE,
    });

    // 구간 랭킹 — 현재 재생 구간과 무관하게 '이 사람에게 맞는 대목'
    const candidates = ((lectureIngest as any).on_screen_prompts || [])
      .filter((p: any) => p?.recommended?.length)
      .map((p: any) => ({ id: p.timecode, section: p.timecode, text: p.recommended[0] }));
    const ranked = rankPrompts(profile, candidates, globalStats).slice(0, 3);

    const topStyles = Object.entries(profile.affinity.style || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([token, weight]) => ({ token, weight }));

    return NextResponse.json({
      setup,
      ranked,
      topStyles,
      profile: {
        eventCount: profile.eventCount,
        confidence: Number(profile.confidence.toFixed(3)),
        // 이벤트가 거의 없으면 화면에서 '추천'을 내세우지 않고 기본값만 조용히 맞춘다
        isCold: profile.eventCount < 3,
      },
    });
  } catch (e: any) {
    console.error('[personalize] 실패:', e);
    return NextResponse.json({ error: e?.message || '추천 계산 실패' }, { status: 500 });
  }
}
