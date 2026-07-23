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
  | 'generate' | 'regenerate' | 'save' | 'publish' | 'apply_recommendation' | 'rate'
  | 'session_start' | 'session_end' | 'login' | 'logout' | 'video_seek' | 'tutor_question';

/**
 * 두 프롬프트의 편집 정도(0=그대로, 1=완전히 다름).
 *
 * 추천을 적용한 뒤 학생이 얼마나 고쳐 쓰는지가 추천 품질의 가장 정직한 신호다.
 * 별점은 대부분 안 누르지만 이 값은 그냥 쌓인다. 프롬프트는 길어야 수백 자라
 * 단순 Levenshtein 으로 충분하다(디바운스 후 1회 계산).
 */
export function editDistanceRatio(a: string, b: string): number {
  if (a === b) return 0;
  if (!a || !b) return 1;
  const s = a.length > b.length ? b : a;
  const l = a.length > b.length ? a : b;
  let prev = Array.from({ length: s.length + 1 }, (_, i) => i);
  for (let i = 1; i <= l.length; i++) {
    const cur = [i];
    for (let j = 1; j <= s.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (l[i - 1] === s[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return Math.min(1, prev[s.length] / l.length);
}

let client: SupabaseClient | null = null;

/**
 * 데모 계정 식별자. 데모 로그인은 user.id 가 항상 'demo' 라 email 로 구분한다.
 * 계정마다 익명 세션(=DB 사용자)을 분리해야 user_persona(PK=user_id)가
 * 계정별로 쌓인다. 안 나누면 학생을 바꿔가며 온보딩할 때 같은 행을 덮어쓴다.
 */
let currentIdentity = 'guest';
let currentLabel = 'guest'; // 화면 표시용 (이름이 있으면 이름, 없으면 계정)

function storageKeyFor(identity: string): string {
  const safe = identity.replace(/[^a-zA-Z0-9_.@-]/g, '_') || 'guest';
  return `coming_analytics_auth__${safe}`;
}

/**
 * 수집 신원을 데모 계정에 맞춘다. 계정이 바뀌면 클라이언트와 익명 세션을 새로 만든다.
 * (같은 값으로 여러 번 불러도 안전)
 *
 * identity 는 계정을 가르는 고유값(데모 email), displayName 은 화면에 보일 이름.
 * 세션 분리는 identity 로만 하고, 이름은 라벨에만 쓴다.
 */
export function setAnalyticsIdentity(
  identity: string | null | undefined,
  displayName?: string | null,
): void {
  const next = (identity || 'guest').toLowerCase();
  const label = displayName || identity || 'guest';
  if (next === currentIdentity) {
    currentLabel = label; // 같은 계정인데 이름만 늦게 들어오는 경우
    return;
  }
  currentIdentity = next;
  currentLabel = label;
  client = null;        // 다음 사용 시 새 storageKey 로 재생성
  userIdPromise = null; // 익명 세션도 계정별로 새로 확보
}

function getClient(): SupabaseClient | null {
  if (!analyticsEnabled) return null;
  if (!client) {
    client = createClient(ANALYTICS_URL, ANALYTICS_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // 앱 공용 클라이언트와 겹치지 않게 + 데모 계정별로 분리
        storageKey: storageKeyFor(currentIdentity),
      },
    });
  }
  return client;
}

// 동시에 여러 이벤트가 들어와도 익명 로그인은 한 번만 (in-flight promise 재사용)
let userIdPromise: Promise<string | null> | null = null;

/**
 * DB 에 표시용 라벨과 계정 식별자를 남긴다. 익명 사용자는 UUID 뿐이라
 * 이게 없으면 '어느 데모 계정의 데이터인지' 알 수 없다.
 * label 만으론 동명이인을 못 가르므로 account(email)도 같이 남긴다.
 * seed 는 건드리지 않는다 — 온보딩이 채우는 값이라 덮어쓰면 안 된다.
 */
async function tagIdentity(sb: SupabaseClient, userId: string): Promise<void> {
  try {
    await sb.from('user_persona').upsert(
      { user_id: userId, label: currentLabel, account: currentIdentity },
      { onConflict: 'user_id' },
    );
  } catch (e) {
    console.debug('[analytics] 라벨 기록 실패', e);
  }
}

/** 익명 세션을 확보하고 auth.uid() 를 반환. 실패 시 null. */
export async function getAnalyticsUserId(): Promise<string | null> {
  const sb = getClient();
  if (!sb) return null;
  if (!userIdPromise) {
    userIdPromise = (async () => {
      try {
        const { data: existing } = await sb.auth.getSession();
        if (existing.session?.user?.id) {
          void tagIdentity(sb, existing.session.user.id);
          return existing.session.user.id;
        }
        const { data, error } = await sb.auth.signInAnonymously();
        if (error) throw error;
        const uid = data.user?.id ?? null;
        if (uid) void tagIdentity(sb, uid);
        return uid;
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
    // 별점 행위 자체도 이벤트로 남겨 개인화 신호에 포함.
    // 어떤 추천에 준 점수인지 프롬프트 원문까지 같이 남긴다 (점수만으로는 추천 개선에 못 쓴다).
    void logEvent('rate', {
      stars: args.stars,
      timecode: args.timecode ?? null,
      prompt: args.prompt,
    });
    return true;
  } catch (e) {
    console.debug('[analytics] saveRating 실패', e);
    return false;
  }
}

/**
 * 온보딩 스타일 선호(회원 초기 리드)를 user_persona.seed 에 저장.
 * PK 가 user_id 라 재실행 시 upsert. 데모 계정별로 분리되려면
 * 호출 전에 setAnalyticsIdentity() 로 신원이 맞춰져 있어야 한다.
 */
export async function savePersonaSeed(seed: Record<string, unknown>): Promise<boolean> {
  const sb = getClient();
  if (!sb) return false;
  try {
    const userId = await getAnalyticsUserId();
    if (!userId) return false;
    const { error } = await sb
      .from('user_persona')
      .upsert({ user_id: userId, seed, updated_at: new Date().toISOString() },
              { onConflict: 'user_id' });
    if (error) throw error;
    return true;
  } catch (e) {
    console.debug('[analytics] savePersonaSeed 실패', e);
    return false;
  }
}

/**
 * 생성 영상 채점 요청. 실제 채점(Gemini)과 DB 기록은 서버 라우트가 한다.
 *   - Gemini 키가 서버 전용이고,
 *   - video_gradings 는 쓰기 정책이 없어 service_role 로만 기록 가능하기 때문.
 * 반환: 프론트 평가 카드 객체(sd2.grade.json 과 같은 스키마) 또는 null.
 */
export async function gradeGeneratedVideo(args: {
  videoUrl: string;
  prompt: string;
  aiJobId?: string | null;
  sessionId?: string;
}): Promise<any | null> {
  try {
    const userId = await getAnalyticsUserId();
    const res = await fetch('/api/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoUrl: args.videoUrl,
        prompt: args.prompt,
        userId,
        aiJobId: args.aiJobId ?? null,
        sessionId: args.sessionId ?? SESSION_UUID,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || `채점 실패 (${res.status})`);
    return data.evaluation ?? null;
  } catch (e) {
    console.debug('[analytics] gradeGeneratedVideo 실패', e);
    return null;
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
