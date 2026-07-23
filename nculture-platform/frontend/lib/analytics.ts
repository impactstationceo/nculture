'use client';

/**
 * 분석/개인화 레이어 클라이언트 (우리 팀 관할 5개 테이블 전용)
 *
 * 앱 공용 `lib/supabase.ts` 와 의도적으로 분리되어 있다.
 * 공용 쪽 NEXT_PUBLIC_SUPABASE_URL/ANON_KEY 를 채우면 isSupabaseConfigured 가 켜지면서
 * 데모 로그인이 실인증으로 전환되는데, 공유 user/role 스키마(users_profile 등)를
 * 다른 업체가 아직 만들지 않아 로그인이 깨진다. 그래서 별도 env 이름 + 별도 클라이언트를 쓴다.
 *
 * 인증: Supabase 익명 로그인으로 실제 auth.uid() 를 확보한다.
 *   RLS 가 user_id = auth.uid() 소유 기반이라 익명이라도 진짜 세션이 있어야 기록된다.
 *   세션은 localStorage 에 유지되므로 같은 브라우저 = 같은 사용자로 누적된다.
 *
 * 모든 함수는 fail-soft: 실패해도 절대 throw 하지 않는다(수집 실패가 수업을 막으면 안 됨).
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const ANALYTICS_URL = process.env.NEXT_PUBLIC_COMING_ANALYTICS_URL || '';
const ANALYTICS_KEY = process.env.NEXT_PUBLIC_COMING_ANALYTICS_KEY || '';

/** 프로토타입 회차(2-3 강의)의 session_ingest.session_id */
export const SESSION_UUID = process.env.NEXT_PUBLIC_COMING_SESSION_ID || '';

export const analyticsEnabled = Boolean(ANALYTICS_URL && ANALYTICS_KEY);

export type LearningEventType =
  | 'dwell' | 'prompt_input' | 'model_select' | 'style_select' | 'param_select'
  | 'generate' | 'regenerate' | 'save' | 'publish' | 'apply_recommendation' | 'rate';

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!analyticsEnabled) return null;
  if (!client) {
    client = createClient(ANALYTICS_URL, ANALYTICS_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // 앱 공용 클라이언트와 저장소 키가 겹치지 않도록 분리
        storageKey: 'coming_analytics_auth',
      },
    });
  }
  return client;
}

// 동시에 여러 이벤트가 들어와도 익명 로그인은 한 번만 (in-flight promise 재사용)
let userIdPromise: Promise<string | null> | null = null;

/** 익명 세션을 확보하고 auth.uid() 를 반환. 실패 시 null. */
export async function getAnalyticsUserId(): Promise<string | null> {
  const sb = getClient();
  if (!sb) return null;
  if (!userIdPromise) {
    userIdPromise = (async () => {
      try {
        const { data: existing } = await sb.auth.getSession();
        if (existing.session?.user?.id) return existing.session.user.id;
        const { data, error } = await sb.auth.signInAnonymously();
        if (error) throw error;
        return data.user?.id ?? null;
      } catch (e) {
        // 익명 로그인이 꺼져 있거나 네트워크 실패 — 수집만 조용히 중단
        console.debug('[analytics] 익명 세션 확보 실패', e);
        userIdPromise = null; // 다음 기회에 재시도
        return null;
      }
    })();
  }
  return userIdPromise;
}

/**
 * 강의실 이벤트 기록 (체류·프롬프트입력·모델선택·생성 등).
 * fire-and-forget — 호출부에서 await 하지 않아도 된다.
 */
export async function logEvent(
  eventType: LearningEventType,
  payload: Record<string, unknown> = {},
  sessionId: string = SESSION_UUID,
): Promise<void> {
  const sb = getClient();
  if (!sb) return;
  try {
    const userId = await getAnalyticsUserId();
    if (!userId) return;
    const { error } = await sb.from('learning_events').insert({
      user_id: userId,
      session_id: sessionId || null,
      event_type: eventType,
      payload,
    });
    if (error) throw error;
  } catch (e) {
    console.debug('[analytics] logEvent 실패', eventType, e);
  }
}

/** 추천 프롬프트 별점 저장 (추천 품질 피드백 루프) */
export async function saveRating(
  args: { prompt: string; stars: number; timecode?: string | null; sessionId?: string },
): Promise<boolean> {
  const sb = getClient();
  if (!sb) return false;
  try {
    const userId = await getAnalyticsUserId();
    if (!userId) return false;
    const { error } = await sb.from('prompt_feedback').insert({
      user_id: userId,
      session_id: args.sessionId ?? SESSION_UUID ?? null,
      timecode: args.timecode ?? null,
      prompt: args.prompt,
      stars: args.stars,
    });
    if (error) throw error;
    // 별점 행위 자체도 이벤트로 남겨 개인화 신호에 포함
    void logEvent('rate', { stars: args.stars, timecode: args.timecode ?? null });
    return true;
  } catch (e) {
    console.debug('[analytics] saveRating 실패', e);
    return false;
  }
}

/** 회차 인제스트(추천 프롬프트·루브릭 등)를 DB에서 조회. 실패 시 null → 호출부가 번들 JSON으로 폴백. */
export async function fetchIngest(sessionId: string = SESSION_UUID): Promise<any | null> {
  const sb = getClient();
  if (!sb || !sessionId) return null;
  try {
    const userId = await getAnalyticsUserId();
    if (!userId) return null; // session_ingest 조회 정책이 로그인 사용자 요구
    const { data, error } = await sb
      .from('session_ingest')
      .select('data, session_title, status')
      .eq('session_id', sessionId)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (e) {
    console.debug('[analytics] fetchIngest 실패', e);
    return null;
  }
}
