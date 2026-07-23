'use client';

/**
 * 회원별 개인화 인사이트 — "데이터가 들어온다"가 아니라
 * "사람마다 다르게 쌓이고, 그래서 추천이 달라진다"를 보여주는 화면.
 *
 * 집계는 /api/insights (service_role) 가 한다. RLS 가 소유자 기반이라
 * 클라이언트에서는 본인 데이터만 보이기 때문.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Users, Activity, Star, Award, Clock, ArrowLeft } from 'lucide-react';
import lectureIngest from '@/lib/ingest/2-3.ingest.json';

const SEED_LABELS: Record<string, string> = {
  contentTypes: '관심 콘텐츠',
  visualStyles: '선호 스타일',
  purpose: '창작 목적',
  experience: 'AI 숙련도',
};

const EVENT_LABELS: Record<string, string> = {
  dwell: '구간 체류',
  prompt_input: '프롬프트 입력',
  model_select: '모델 선택',
  style_select: '스타일 선택',
  param_select: '파라미터 선택',
  generate: '생성',
  regenerate: '재생성',
  save: '저장',
  publish: '갤러리 공개',
  apply_recommendation: '추천 적용',
  rate: '별점 평가',
  session_start: '접속',
  session_end: '이탈',
  login: '로그인',
  logout: '로그아웃',
  video_seek: '구간 이동',
  tutor_question: '튜터 질문',
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// ── 임원 시선용 번역: 내부 키를 한국어로, 원시 수치를 단계 문구로 ──
const STYLE_KO: Record<string, string> = {
  cinematic: '시네마틱', anime: '애니·일러스트', photoreal: '포토리얼',
  minimal: '미니멀·모던', experimental: '실험적·추상', vintage: '빈티지·필름',
};
const CONTENT_KO: Record<string, string> = {
  video: '영상', image: '이미지', digital_human: '디지털 휴먼', ads_shorts: '광고·쇼츠',
};
const SERVICE_KO: Record<string, string> = {
  sora: 'Sora', veo: 'Google Veo', kling: 'Kling', minimax: 'MiniMax Hailuo',
};
const ko = (map: Record<string, string>, k: string) => map[k] || k;

// confidence(0..1) → 수집 단계. "19%"라는 날숫자는 불안만 주고,
// 실제 의미(이제 막 배우는 중, 정상)는 단계 문구가 전달한다.
const stageOf = (c: number) =>
  c < 0.15 ? { label: '수집 초기', desc: '이제 막 데이터를 모으는 중', color: '#8B95A1', w: 0.2 }
  : c < 0.4 ? { label: '학습 중', desc: '취향 패턴이 잡히기 시작', color: '#F59E0B', w: 0.5 }
  : c < 0.7 ? { label: '개인화 진행', desc: '추천에 개인 취향 반영 중', color: '#3182F6', w: 0.8 }
  : { label: '개인화 완성', desc: '충분한 데이터로 정밀 추천', color: '#10B981', w: 1 };

const alphaLabel = (a: number) =>
  a < 0.2 ? '아직 인기순 중심' : a < 0.5 ? '개인화 반영 중' : '개인 취향 중심';

const topKeyOf = (m: Record<string, number> | undefined) =>
  Object.entries(m || {}).sort((a, b) => b[1] - a[1])[0]?.[0];

// 프로필+추천을 사람 문장 하나로 — 임원에게 '왜'를 설명하는 건 막대그래프가 아니라 문장이다.
function memberSummary(m: any, topic: (tc: string) => string): string {
  const name = m.label || '이 회원';
  const p = m.profile;
  if (!p || !p.eventCount) {
    const seedStyle = m.seed?.visualStyles?.[0];
    return seedStyle
      ? `${name}님은 아직 행동 데이터가 없어 온보딩 선호(${ko(STYLE_KO, seedStyle)})와 인기순 기반으로 추천합니다.`
      : `${name}님은 아직 수집된 데이터가 없어 인기순 추천이 제공됩니다.`;
  }
  const style = topKeyOf(p.affinity.style);
  const section = topKeyOf(p.affinity.section);
  const service = topKeyOf(p.affinity.service);
  const rec0 = m.recommendations?.[0];
  const parts: string[] = [];
  if (style) parts.push(`${ko(STYLE_KO, style)} 취향으로`);
  if (section) parts.push(`「${topic(section)}」(${section}) 대목에 가장 오래 머물렀고`);
  if (service) parts.push(`${ko(SERVICE_KO, service)} 모델을 주로 씁니다`);
  const base = `${name}님은 ${parts.join(' ')}`.replace(/고$/, '고,');
  return rec0
    ? `${base}. 그래서 ${rec0.timecode} 구간 추천이 1순위가 되었습니다.`
    : `${base}.`;
}

// 앱 내부값('10s')을 사람이 읽는 형태로. 저장은 앱과 동일한 값을 유지한다.
const fmtDuration = (d: string | null) => (d ? d.replace(/^(\d+)s$/, '$1초') : null);

const fmtTime = (iso: string | null) => {
  if (!iso) return '-';
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return '방금';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return d.toLocaleDateString('ko-KR');
};

const Stat = ({ icon, label, value }: any) => (
  <div className="flex-1 bg-white border border-neutral-200 rounded-2xl p-4">
    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">{icon}{label}</div>
    <div className="text-2xl font-bold text-neutral-900 tabular-nums">{value}</div>
  </div>
);

const pct = (v: number) => `${Math.round((v || 0) * 100)}%`;

// 정규화 affinity 한 줄 막대
const AffBar = ({ label, value, color = '#3182F6' }: any) => (
  <div className="flex items-center gap-2">
    <span className="w-28 shrink-0 text-xs text-neutral-600 truncate" title={label}>{label}</span>
    <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: pct(value), background: color }} />
    </div>
    <span className="w-9 text-right text-[11px] text-neutral-500 tabular-nums">{pct(value)}</span>
  </div>
);

const sortedEntries = (m: Record<string, number> | undefined, n: number) =>
  Object.entries(m || {}).sort((a, b) => b[1] - a[1]).slice(0, n);

export default function InsightsPage() {
  const [data, setData] = useState<any>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auto, setAuto] = useState(true);
  // 시연 중 "지금 막 들어왔다"가 보이도록, 새로 도착한 이벤트를 잠깐 강조한다
  const [freshIds, setFreshIds] = useState<Set<number>>(new Set());
  const seenIdsRef = useRef<Set<number> | null>(null);
  // 추천 프롬프트 전체보기 토글 (userId:timecode 로 식별, 자동 새로고침에도 유지)
  const [expandedRecs, setExpandedRecs] = useState<Set<string>>(new Set());
  const toggleRec = (key: string) =>
    setExpandedRecs((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  // 실시간 모니터 접기 — 시연 땐 펼치고, 평소엔 접어서 회원 비교가 첫 화면에 오게
  const [monitorOpen, setMonitorOpen] = useState(true);
  // 회원 상세 탭 — 카드 7개 세로 나열의 스크롤 피로를 줄인다
  const [tab, setTab] = useState<'overview' | 'activity' | 'results'>('overview');
  // 비교 모드 — "같은 강의, 다른 추천"을 한 화면에
  const [compare, setCompare] = useState(false);
  const [compareIds, setCompareIds] = useState<[string | null, string | null]>([null, null]);
  // 회원 검색 (목록이 길어질 때)
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/insights', { cache: 'no-store' });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || '불러오기 실패');

      const ids: number[] = (d.recentEvents || []).map((e: any) => e.id).filter((v: any) => v != null);
      if (seenIdsRef.current) {
        const seen = seenIdsRef.current;
        const fresh = ids.filter((id) => !seen.has(id));
        if (fresh.length) {
          setFreshIds(new Set(fresh));
          setTimeout(() => setFreshIds(new Set()), 3000);
        }
      }
      seenIdsRef.current = new Set(ids); // 첫 로드는 전체가 '새 것'이 되므로 강조하지 않는다

      setData(d);
      setError(null);
      setSelected((prev) => prev ?? d.members?.[0]?.userId ?? null);
    } catch (e: any) {
      setError(e?.message || '오류');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(load, 5000); // 시연 중 쌓이는 게 바로 보이도록
    return () => clearInterval(t);
  }, [auto, load]);

  const member = useMemo(
    () => data?.members?.find((m: any) => m.userId === selected) || null,
    [data, selected],
  );

  // 체류 구간을 '어느 강의의 어느 대목인지'로 풀어준다. 타임코드만 보면 무슨 내용인지 알 수 없다.
  const sectionInfo = useCallback((timecode: string) => {
    const prompts: any[] = (lectureIngest as any).on_screen_prompts || [];
    const hit = prompts.find((p) => p.timecode === timecode);
    const raw = hit?.prompt ? String(hit.prompt).replace(/\s+/g, ' ') : '';
    return {
      lecture: (lectureIngest as any).session_title as string,
      topic: raw ? raw.slice(0, 46) + (raw.length > 46 ? '…' : '') : '해당 구간 시연',
    };
  }, []);

  const lectureTitle = (lectureIngest as any).session_title as string;

  // 사업 성과 KPI — 활동량(이벤트 수)이 아니라 "추천이 통하는가"를 헤더에 올린다
  const kpi = useMemo(() => {
    const ms: any[] = data?.members || [];
    const convs = ms.map((m) => m.derived?.recommendationConversion).filter((v: any) => v != null);
    const conv = convs.length
      ? Math.round(convs.reduce((a: number, b: number) => a + b, 0) / convs.length)
      : null;
    let starSum = 0, starN = 0;
    for (const m of ms) {
      if (m.derived?.avgRating != null && m.totals?.ratings) {
        starSum += m.derived.avgRating * m.totals.ratings;
        starN += m.totals.ratings;
      }
    }
    return { conv, avgStar: starN ? (starSum / starN).toFixed(1) : null };
  }, [data]);

  const filteredMembers = useMemo(() => {
    const ms: any[] = data?.members || [];
    if (!q.trim()) return ms;
    const needle = q.trim().toLowerCase();
    return ms.filter(
      (m) =>
        (m.label || '').toLowerCase().includes(needle) ||
        (m.account || '').toLowerCase().includes(needle),
    );
  }, [data, q]);

  // 비교 대상 — 기본은 최근 활동 상위 2명, 셀렉터로 교체 가능
  const [cmpA, cmpB] = useMemo(() => {
    const ms: any[] = data?.members || [];
    const a = ms.find((m) => m.userId === compareIds[0]) || ms[0] || null;
    const b =
      ms.find((m) => m.userId === compareIds[1] && m.userId !== a?.userId) ||
      ms.find((m) => m.userId !== a?.userId) ||
      null;
    return [a, b];
  }, [data, compareIds]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/prototype" className="text-neutral-400 hover:text-neutral-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="font-bold text-neutral-900">Coming<span className="text-[#3182F6]"> AI</span></span>
            <span className="text-sm text-neutral-500">개인화 인사이트</span>
            {auto && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-neutral-500 cursor-pointer">
              <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="accent-[#3182F6]" />
              자동 새로고침
            </label>
            <button onClick={load} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-6">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}

        {/* 실시간 이벤트 모니터 — 시연 땐 펼치고, 평소엔 접어서 회원 인사이트가 첫 화면에 오게 */}
        {!!data?.recentEvents?.length && (
          <div className="mb-4 bg-white border border-neutral-200 rounded-2xl p-4">
            <button
              onClick={() => setMonitorOpen((v) => !v)}
              className="w-full flex items-center justify-between"
            >
              <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-neutral-400" />
                실시간 수집 이벤트
              </h2>
              <span className="text-[11px] text-neutral-400">
                최근 {data.recentEvents.length}건 · 총 {data?.totals?.events ?? '-'}건 · 5초마다 갱신
                <span className="ml-2 text-[#3182F6] font-medium">{monitorOpen ? '접기 ▴' : '펼치기 ▾'}</span>
              </span>
            </button>
            <div className={`space-y-1 max-h-44 overflow-y-auto ${monitorOpen ? 'mt-2' : 'hidden'}`}>
              {data.recentEvents.map((e: any, i: number) => (
                <div
                  key={e.id ?? i}
                  className={`flex items-center gap-3 text-xs py-1.5 border-b border-neutral-100 last:border-0 transition-colors duration-700 ${
                    freshIds.has(e.id) ? 'bg-emerald-50 -mx-2 px-2 rounded-lg' : ''
                  }`}
                >
                  <span className="text-neutral-400 w-14 shrink-0 tabular-nums">{fmtTime(e.at)}</span>
                  <span className="w-32 shrink-0 truncate text-neutral-600">{e.label || `익명 ${e.userId.slice(0, 6)}`}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#3182F6]/10 text-[#1b64da] shrink-0">
                    {EVENT_LABELS[e.type] || e.type}
                  </span>
                  <span className="text-neutral-500 truncate">
                    {e.payload?.section ? `${e.payload.section} · ${e.payload.seconds}초`
                      : e.payload?.service ? `${e.payload.service}${e.payload.tier ? ` · ${e.payload.tier}` : ''}`
                      : e.payload?.prompt ? String(e.payload.prompt).slice(0, 60)
                      : e.payload?.stars ? `${e.payload.stars}★`
                      : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 성과 KPI — 활동량이 아니라 "추천이 통하는가"를 먼저 보여준다 */}
        <div className="flex flex-wrap gap-3 mb-5">
          <Stat icon={<Users className="w-3.5 h-3.5" />} label="회원" value={data?.totals?.members ?? '-'} />
          <Stat
            icon={<Activity className="w-3.5 h-3.5" />}
            label="추천 → 생성 전환"
            value={kpi.conv === null ? '—' : `${kpi.conv}%`}
          />
          <Stat
            icon={<Star className="w-3.5 h-3.5" />}
            label={`추천 별점 평균 (${data?.totals?.ratings ?? 0}건)`}
            value={kpi.avgStar ?? '—'}
          />
          {/* 합성 40명 + ground truth 오프라인 검증(NDCG@3) 결과 — 기술이 작동한다는 근거 */}
          <div className="flex-1 bg-[#3182F6]/5 border border-[#3182F6]/25 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-xs text-[#1b64da] mb-1">
              <Award className="w-3.5 h-3.5" />개인화 추천 정확도
            </div>
            <div className="text-2xl font-bold text-[#1b64da] tabular-nums">
              +133%
              <span className="ml-1.5 text-[11px] font-normal text-neutral-500">인기순 대비 · 합성 검증</span>
            </div>
          </div>
        </div>

        {data?.members?.length === 0 && !loading && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center">
            <p className="text-neutral-900 font-medium mb-1">아직 수집된 데이터가 없습니다</p>
            <p className="text-sm text-neutral-500">
              <Link href="/prototype" className="text-[#3182F6] hover:underline">프로토타입</Link>에서
              강의를 재생하고 추천 프롬프트를 적용해 보세요. 이 화면에 바로 반영됩니다.
            </p>
          </div>
        )}

        {!!data?.members?.length && (
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
            {/* 회원 목록 */}
            <aside className="bg-white border border-neutral-200 rounded-2xl p-2 h-fit">
              <div className="px-2 py-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500">회원</span>
                {data.members.length >= 2 && (
                  <button
                    onClick={() => setCompare((v) => !v)}
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-lg transition ${
                      compare ? 'bg-[#3182F6] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {compare ? '비교 중' : '비교 모드'}
                  </button>
                )}
              </div>
              {data.members.length > 5 && (
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="이름/계정 검색"
                  className="w-full mb-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs focus:border-[#3182F6] focus:outline-none"
                />
              )}
              {filteredMembers.map((m: any) => {
                const seedStyle = m.seed?.visualStyles?.[0] || topKeyOf(m.profile?.affinity?.style);
                const stg = stageOf(m.profile?.confidence || 0);
                return (
                  <button
                    key={m.userId}
                    onClick={() => setSelected(m.userId)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition ${
                      selected === m.userId ? 'bg-[#3182F6]/8 border border-[#3182F6]/30' : 'hover:bg-neutral-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {/* 수집 단계 점 — 목록만 훑어도 "사람마다 다르게 쌓인다"가 보이게 */}
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: stg.color }} title={stg.label} />
                      <span className="text-sm font-medium text-neutral-900 truncate">
                        {m.label || `익명 ${m.userId.slice(0, 6)}`}
                      </span>
                      {seedStyle && (
                        <span className="shrink-0 px-1.5 py-px rounded-md bg-neutral-100 text-[10px] text-neutral-500">
                          {ko(STYLE_KO, seedStyle)}
                        </span>
                      )}
                    </div>
                    {/* 동명이인이 있을 수 있어 계정을 함께 보여준다 */}
                    <div className="text-[11px] text-neutral-400 truncate">
                      {m.account || `uid ${m.userId.slice(0, 8)}`}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      이벤트 {m.totals.events} · {fmtTime(m.lastActiveAt)}
                    </div>
                  </button>
                );
              })}
              {!filteredMembers.length && (
                <p className="px-3 py-2 text-xs text-neutral-400">검색 결과 없음</p>
              )}
            </aside>

            {/* 선택 회원 상세 / 비교 뷰 */}
            <section className="space-y-4">
              {compare ? (
                /* 비교 뷰 — 이 페이지의 핵심 메시지 "같은 강의, 다른 추천"을 한 화면에 */
                <div className="bg-white border border-[#3182F6]/30 rounded-2xl p-5">
                  <h2 className="text-sm font-semibold text-neutral-900 mb-1">
                    회원 비교 <span className="text-[#3182F6] font-normal">— 같은 강의, 다른 추천</span>
                  </h2>
                  <p className="text-[11px] text-neutral-400 mb-4">
                    1회차 · {lectureTitle} — 같은 강의를 들어도 쌓인 데이터가 달라 추천이 갈라집니다.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[cmpA, cmpB].map((cm: any, side: number) => {
                      if (!cm) return <div key={side} />;
                      const other = side === 0 ? cmpB : cmpA;
                      const otherTcs = new Set((other?.recommendations || []).map((r: any) => r.timecode));
                      const stg = stageOf(cm.profile?.confidence || 0);
                      const topSvc = topKeyOf(cm.profile?.affinity?.service);
                      return (
                        <div key={side} className="border border-neutral-200 rounded-xl p-4">
                          <select
                            value={cm.userId}
                            onChange={(e) =>
                              setCompareIds((prev) =>
                                side === 0 ? [e.target.value, prev[1]] : [prev[0], e.target.value],
                              )
                            }
                            className="w-full mb-2 px-2 py-1.5 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-900 bg-white focus:border-[#3182F6] focus:outline-none"
                          >
                            {data.members.map((m: any) => (
                              <option key={m.userId} value={m.userId}>
                                {m.label || `익명 ${m.userId.slice(0, 6)}`}{m.account ? ` (${m.account})` : ''}
                              </option>
                            ))}
                          </select>
                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium text-white" style={{ background: stg.color }}>
                              {stg.label}
                            </span>
                            {(cm.seed?.visualStyles || []).slice(0, 2).map((s: string) => (
                              <span key={s} className="px-1.5 py-0.5 rounded-md bg-neutral-100 text-[10px] text-neutral-600">
                                {ko(STYLE_KO, s)}
                              </span>
                            ))}
                            {topSvc && (
                              <span className="px-1.5 py-0.5 rounded-md bg-violet-50 text-[10px] text-violet-600">
                                {ko(SERVICE_KO, topSvc)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                            {memberSummary(cm, (tc) => sectionInfo(tc).topic)}
                          </p>
                          <div className="text-[11px] font-medium text-neutral-700 mb-1.5">추천 top3</div>
                          <div className="space-y-1.5">
                            {(cm.recommendations || []).map((r: any, i: number) => (
                              <div
                                key={i}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${
                                  otherTcs.has(r.timecode)
                                    ? 'bg-neutral-50 text-neutral-600'
                                    : 'bg-[#3182F6]/8 border border-[#3182F6]/25 text-neutral-800'
                                }`}
                              >
                                <span className="font-bold text-[#3182F6] tabular-nums">{i + 1}</span>
                                <span className="tabular-nums shrink-0">{r.timecode}</span>
                                <span className="truncate">{sectionInfo(r.timecode).topic}</span>
                                {!otherTcs.has(r.timecode) && (
                                  <span className="ml-auto shrink-0 text-[10px] text-[#1b64da] font-medium">이 회원만</span>
                                )}
                              </div>
                            ))}
                            {!(cm.recommendations || []).length && (
                              <p className="text-xs text-neutral-400">아직 추천 없음</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : member && (
                <>
                  {/* 한 줄 요약 — 프로필·추천의 '왜'를 문장으로. 임원은 막대그래프보다 문장을 읽는다 */}
                  <div className="bg-[#E8F3FF] border border-[#3182F6]/25 rounded-2xl px-4 py-3 text-sm text-[#1b3a5c] leading-relaxed">
                    {memberSummary(member, (tc) => sectionInfo(tc).topic)}
                  </div>

                  {/* 탭 — 카드 7개 세로 나열의 스크롤 피로를 줄인다 */}
                  <div className="flex gap-1 bg-white border border-neutral-200 rounded-2xl p-1">
                    {([['overview', '프로필·추천'], ['activity', '활동 기록'], ['results', '결과물·채점']] as const).map(([k, label]) => (
                      <button
                        key={k}
                        onClick={() => setTab(k)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                          tab === k ? 'bg-[#3182F6] text-white' : 'text-neutral-500 hover:bg-neutral-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {tab === 'activity' && (<>
                  {/* 온보딩에서 받은 것 */}
                  <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-3">
                      온보딩에서 받은 선호 <span className="text-neutral-400 font-normal">(초기 리드)</span>
                    </h2>
                    {member.seed ? (
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(SEED_LABELS).map(([key, label]) => {
                          const v = member.seed[key];
                          const text = Array.isArray(v) ? v.join(', ') : v;
                          return (
                            <div key={key}>
                              <div className="text-[11px] text-neutral-500 mb-1">{label}</div>
                              <div className="text-sm text-neutral-900">{text || '—'}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-500">온보딩을 아직 하지 않은 회원입니다 (행동 데이터만 수집 중).</p>
                    )}
                  </div>

                  {/* 행동에서 도출한 것 */}
                  <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-1">
                      행동에서 도출한 특징 <span className="text-neutral-400 font-normal">(강의실 이벤트 기반)</span>
                    </h2>
                    <p className="text-[11px] text-neutral-400 mb-4">
                      원시 이벤트에서 즉석 집계한 값입니다. 데이터가 쌓이면 배치로 user_persona.derived 에 저장합니다.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-neutral-50 rounded-xl p-3">
                        <div className="text-[11px] text-neutral-500 mb-1">생성 성공</div>
                        <div className="text-lg font-bold tabular-nums">
                          {member.totals.generate}
                          {!!member.totals.generateFailed && (
                            <span className="ml-1.5 text-xs font-medium text-amber-600">
                              실패 {member.totals.generateFailed}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="bg-neutral-50 rounded-xl p-3">
                        <div className="text-[11px] text-neutral-500 mb-1">추천 → 생성 전환</div>
                        <div className="text-lg font-bold tabular-nums">
                          {member.derived.recommendationConversion === null ? '—' : `${member.derived.recommendationConversion}%`}
                        </div>
                      </div>
                      <div className="bg-neutral-50 rounded-xl p-3">
                        <div className="text-[11px] text-neutral-500 mb-1">추천 별점 평균</div>
                        <div className="text-lg font-bold tabular-nums">{member.derived.avgRating ?? '—'}</div>
                      </div>
                      <div className="bg-neutral-50 rounded-xl p-3">
                        <div className="text-[11px] text-neutral-500 mb-1">채점 평균</div>
                        <div className="text-lg font-bold tabular-nums">{member.derived.avgGradeScore ?? '—'}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* 접속 패턴 — created_at 만으로 나온다(추가 수집 불필요), KST 기준 */}
                      {!!member.derived.activity && (
                        <div>
                          <div className="text-xs font-medium text-neutral-700 mb-2">
                            접속 패턴 <span className="text-neutral-400 font-normal">(KST)</span>
                            {member.derived.activity.avgSessionSec != null && (
                              <span className="text-neutral-400 font-normal ml-1.5">
                                · 평균 체류 {Math.round(member.derived.activity.avgSessionSec / 60)}분
                                · 방문 {member.derived.activity.sessions}회
                              </span>
                            )}
                          </div>
                          <div className="bg-neutral-50 rounded-xl p-3 space-y-2.5">
                            <div>
                              <div className="text-[10px] text-neutral-400 mb-1">요일</div>
                              <div className="flex gap-1">
                                {member.derived.activity.byWeekday.map((n: number, i: number) => {
                                  const max = Math.max(1, ...member.derived.activity.byWeekday);
                                  return (
                                    <div key={i} className="flex-1 text-center">
                                      <div className="h-8 flex items-end justify-center">
                                        <div className="w-full rounded-sm bg-[#3182F6]"
                                             style={{ height: `${Math.max(n ? 12 : 2, (n / max) * 100)}%`,
                                                      opacity: n ? 0.25 + 0.75 * (n / max) : 0.12 }} />
                                      </div>
                                      <div className="text-[10px] text-neutral-500 mt-0.5">{WEEKDAYS[i]}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-neutral-400 mb-1">시간대</div>
                              <div className="flex gap-[2px]">
                                {member.derived.activity.byHour.map((n: number, h: number) => {
                                  const max = Math.max(1, ...member.derived.activity.byHour);
                                  return (
                                    <div key={h} className="flex-1" title={`${h}시 · ${n}건`}>
                                      <div className="h-6 rounded-sm bg-[#3182F6]"
                                           style={{ opacity: n ? 0.2 + 0.8 * (n / max) : 0.08 }} />
                                      {h % 6 === 0 && <div className="text-[9px] text-neutral-400 mt-0.5">{h}</div>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 추천을 얼마나 고쳐 썼는가 — 별점보다 촘촘한 품질 신호 */}
                      {!!member.derived.promptEdit && (
                        <div className="bg-neutral-50 rounded-xl px-3 py-2 flex items-center justify-between">
                          <div className="text-xs text-neutral-600">
                            추천/예시를 고쳐 쓴 정도
                            <span className="text-neutral-400 ml-1.5">{member.derived.promptEdit.samples}회 기준</span>
                          </div>
                          <div className="text-sm font-medium text-neutral-900 tabular-nums">
                            {Math.round(member.derived.promptEdit.avgEditRatio * 100)}%
                            <span className="text-[11px] text-neutral-400 ml-1">
                              {member.derived.promptEdit.avgEditRatio < 0.2 ? '거의 그대로'
                                : member.derived.promptEdit.avgEditRatio < 0.5 ? '일부 수정' : '많이 수정'}
                            </span>
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="text-xs font-medium text-neutral-700 mb-2 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" /> 오래 머문 구간
                        </div>
                        {member.derived.topSections.length ? (
                          <div className="border border-neutral-200 rounded-xl overflow-hidden">
                            {/* 강의명은 한 번만 — 구간마다 반복하면 정작 어느 대목인지가 안 읽힌다 */}
                            <div className="px-3 py-1.5 bg-neutral-50 border-b border-neutral-200 text-[11px] text-neutral-500 truncate">
                              1회차 · {lectureTitle}
                            </div>
                            {member.derived.topSections.map((s: any) => (
                              <div key={s.key} className="flex items-center justify-between gap-3 px-3 py-2 border-b border-neutral-100 last:border-0">
                                <div className="text-sm text-neutral-900 min-w-0">
                                  <span className="tabular-nums font-medium">{s.key}</span>
                                  <span className="text-neutral-400 mx-1.5">·</span>
                                  <span className="text-neutral-600">{sectionInfo(s.key).topic}</span>
                                </div>
                                <span className="font-medium text-neutral-900 tabular-nums shrink-0">{s.value}초</span>
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-sm text-neutral-400">—</p>}
                      </div>

                      <div>
                        <div className="text-xs font-medium text-neutral-700 mb-2">
                          자주 고른 생성 설정 <span className="text-neutral-400 font-normal">(영상 생성 시점 기준)</span>
                        </div>
                        {member.derived.topSetups?.length ? (
                          <div className="space-y-1.5">
                            {member.derived.topSetups.map((s: any, i: number) => (
                              <div key={i} className="flex items-center justify-between gap-3 bg-neutral-50 rounded-xl px-3 py-2">
                                <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                                  <span className="text-sm text-neutral-900 font-medium truncate">
                                    {s.service}{s.tier ? ` · ${s.tier}` : ''}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-md bg-white border border-neutral-200 text-[11px] text-neutral-600">
                                    {s.resolution || '해상도 미기록'}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-md bg-white border border-neutral-200 text-[11px] text-neutral-600">
                                    {fmtDuration(s.duration) || '길이 미기록'}
                                  </span>
                                </div>
                                <span className="font-medium text-neutral-900 tabular-nums shrink-0">{s.count}회</span>
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-sm text-neutral-400">아직 생성 이력이 없습니다</p>}
                      </div>
                    </div>

                  </div>
                  </>)}

                  {tab === 'overview' && (<>
                  {/* 개인화 프로필 — 공유 모듈(computeProfile)이 계산한 정규화 선호도(추천 엔진 입력) */}
                  {member.profile && (
                    <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                      <h2 className="text-sm font-semibold text-neutral-900 mb-1">
                        개인화 프로필 <span className="text-neutral-400 font-normal">(추천 엔진 입력 · 시드+행동 종합)</span>
                      </h2>
                      <p className="text-[11px] text-neutral-400 mb-4">
                        lib/personalization 이 계산한 정규화 affinity. 이 화면과 추천이 <b>같은 프로필</b>을 씁니다.
                      </p>

                      {/* 원시 % 대신 단계 문구 — "19%"는 불안만 주고, "학습 중(정상)"이 실제 의미다 */}
                      {(() => {
                        const stg = stageOf(member.profile.confidence);
                        return (
                          <div className="flex items-center gap-2 mb-4" title={`confidence ${pct(member.profile.confidence)} · 이벤트 ${member.profile.eventCount}건`}>
                            <span className="w-28 shrink-0 text-xs text-neutral-600">데이터 수집 단계</span>
                            <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: pct(stg.w), background: stg.color }} />
                            </div>
                            <span className="shrink-0 text-[11px] font-medium" style={{ color: stg.color }}>{stg.label}</span>
                            <span className="shrink-0 text-[10px] text-neutral-400 hidden md:inline">· {stg.desc}</span>
                          </div>
                        );
                      })()}

                      <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                          <div className="text-xs font-medium text-neutral-700 mb-2">관심 구간 <span className="text-neutral-400 font-normal">(행동 기반)</span></div>
                          <div className="space-y-1.5">
                            {sortedEntries(member.profile.affinity.section, 4).map(([sec, v]) => (
                              <AffBar key={sec} label={`${sec} · ${sectionInfo(sec).topic}`} value={v} />
                            ))}
                            {!sortedEntries(member.profile.affinity.section, 1).length && <p className="text-sm text-neutral-400">아직 행동 신호 없음</p>}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-neutral-700 mb-2">선호 모델 <span className="text-neutral-400 font-normal">(행동 기반)</span></div>
                          <div className="space-y-1.5">
                            {sortedEntries(member.profile.affinity.service, 4).map(([svc, v]) => (
                              <AffBar key={svc} label={ko(SERVICE_KO, svc)} value={v} color="#8B5CF6" />
                            ))}
                            {!sortedEntries(member.profile.affinity.service, 1).length && <p className="text-sm text-neutral-400">—</p>}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {Object.keys(member.profile.affinity.content || {}).map((k) => (
                              <span key={k} className="px-2 py-0.5 rounded-md bg-neutral-100 text-[11px] text-neutral-600">{ko(CONTENT_KO, k)}</span>
                            ))}
                            {Object.keys(member.profile.affinity.style || {}).map((k) => (
                              <span key={k} className="px-2 py-0.5 rounded-md bg-[#E8F3FF] text-[11px] text-[#1b64da]">{ko(STYLE_KO, k)}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 지금 추천될 프롬프트 — 예측 뷰(rankPrompts 출력) */}
                  {!!member.recommendations?.length && (
                    <div className="bg-white border border-[#3182F6]/30 rounded-2xl p-5">
                      <h2 className="text-sm font-semibold text-neutral-900 mb-1">
                        지금 추천될 프롬프트 <span className="text-[#3182F6] font-normal">(예측)</span>
                      </h2>
                      <p className="text-[11px] text-neutral-400 mb-3">
                        위 프로필로 후보 프롬프트를 재정렬한 결과 ·{' '}
                        <b className="text-neutral-600">{alphaLabel(member.recommendations[0].alpha)}</b>
                        <span className="ml-1 tabular-nums">(개인화 반영도 {pct(member.recommendations[0].alpha)})</span>
                      </p>
                      {/* 후보는 모두 이 회차에서 나온다 — 강의명은 한 번만(구간마다 반복하면 안 읽힌다) */}
                      <div className="mb-2 text-[11px] text-neutral-500 truncate">1회차 · {lectureTitle}</div>

                      {/* 전/후 비교 — 개인화가 실제로 순서를 바꿨다는 증거. 안 바꿨으면(콜드) 그것도 정직하게 보여준다 */}
                      {!!data?.popularityTop?.length && (
                        <div className="mb-3 rounded-xl bg-neutral-50 px-3 py-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                          <span className="text-neutral-500 shrink-0">인기순이라면</span>
                          {data.popularityTop.map((p: any, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-500 tabular-nums">
                              {i + 1}. {p.timecode}
                            </span>
                          ))}
                          <span className="text-neutral-400 mx-0.5">→</span>
                          <span className="text-[#1b64da] font-medium shrink-0">개인화 적용</span>
                          {member.recommendations.map((r: any, i: number) => {
                            const moved = data.popularityTop[i]?.timecode !== r.timecode;
                            return (
                              <span
                                key={i}
                                className={`px-1.5 py-0.5 rounded-md tabular-nums ${
                                  moved
                                    ? 'bg-[#3182F6]/10 border border-[#3182F6]/30 text-[#1b64da] font-medium'
                                    : 'bg-white border border-neutral-200 text-neutral-500'
                                }`}
                              >
                                {i + 1}. {r.timecode}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      <div className="space-y-2">
                        {member.recommendations.map((r: any, i: number) => (
                          <div key={i} className="border border-neutral-200 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1.5 text-[11px]">
                              <span className="w-5 h-5 shrink-0 rounded-full bg-[#3182F6] text-white flex items-center justify-center font-bold">{i + 1}</span>
                              <span className="px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-600 tabular-nums">{r.timecode} 구간</span>
                              <span className="text-neutral-500 truncate">{sectionInfo(r.timecode).topic}</span>
                            </div>
                            {(() => {
                              const recKey = `${member.userId}:${r.timecode}`;
                              const full = String(r.prompt);
                              const isLong = full.length > 140;
                              const open = expandedRecs.has(recKey);
                              return (
                                <>
                                  <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap break-words">
                                    {open || !isLong ? full : full.slice(0, 140) + '…'}
                                  </p>
                                  {isLong && (
                                    <button
                                      onClick={() => toggleRec(recKey)}
                                      className="mt-1 text-[11px] font-medium text-[#3182F6] hover:underline"
                                    >
                                      {open ? '접기' : '더보기'}
                                    </button>
                                  )}
                                </>
                              );
                            })()}
                            {/* raw score 는 임원에게 소음 — 툴팁으로만 남긴다 */}
                            <div
                              className="mt-2 flex items-center gap-3 text-[10px] text-neutral-400"
                              title={`score ${Number(r.score).toFixed(3)}`}
                            >
                              <span>개인 취향 {pct(r.personal)}</span>
                              <span>전체 인기 {pct(r.general)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  </>)}

                  {tab === 'results' && (<>
                  {/* 작성한 생성 프롬프트 — 집계 숫자가 아니라 실제로 무엇을 만들려 했는지 */}
                  <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-3">
                      작성한 생성 프롬프트
                      <span className="text-neutral-400 font-normal ml-1.5">
                        {member.details?.writtenPrompts?.length || 0}건 · 시도 기준
                      </span>
                    </h2>
                    {member.details?.writtenPrompts?.length ? (
                      <div className="space-y-2">
                        {member.details.writtenPrompts.map((w: any, i: number) => (
                          <div key={i} className="border border-neutral-200 rounded-xl p-3">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5 text-[11px]">
                              <span className="text-neutral-400 tabular-nums">{fmtTime(w.at)}</span>
                              {w.timecode && (
                                <span className="px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-600 tabular-nums">
                                  {w.timecode} 구간
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                                {w.service}{w.tier ? ` · ${w.tier}` : ''}
                                {w.resolution ? ` · ${w.resolution}` : ''}{w.duration ? ` · ${fmtDuration(w.duration)}` : ''}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded-md ${
                                w.source === 'recommendation' ? 'bg-[#3182F6]/10 text-[#1b64da]'
                                  : w.source === 'example' ? 'bg-violet-50 text-violet-600'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}>
                                {w.source === 'recommendation' ? '추천 프롬프트'
                                  : w.source === 'example' ? '예시 프롬프트' : '직접 작성'}
                              </span>
                              {w.status === 'failed' && (
                                <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700">
                                  생성 실패 · 크레딧 환불
                                </span>
                              )}
                            </div>
                            <p className={`text-sm leading-relaxed ${w.status === 'failed' ? 'text-neutral-400' : 'text-neutral-800'}`}>
                              {w.prompt}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-sm text-neutral-400">아직 생성 이력이 없습니다</p>}
                  </div>

                  {/* 추천 프롬프트 별점 — 어떤 추천에 몇 점인지 */}
                  <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-3">
                      추천 프롬프트 평가
                      <span className="text-neutral-400 font-normal ml-1.5">
                        {member.details?.ratings?.length || 0}건
                      </span>
                    </h2>
                    {member.details?.ratings?.length ? (
                      <div className="space-y-2">
                        {member.details.ratings.map((r: any, i: number) => (
                          <div key={i} className="border border-neutral-200 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1.5 text-[11px]">
                              <span className="text-amber-500 tracking-tight">
                                {'★'.repeat(r.stars)}<span className="text-neutral-300">{'★'.repeat(5 - r.stars)}</span>
                              </span>
                              <span className="font-medium text-neutral-700 tabular-nums">{r.stars}점</span>
                              {r.timecode && <span className="text-neutral-400 tabular-nums">· {r.timecode} 구간 추천</span>}
                              <span className="text-neutral-400">· {fmtTime(r.at)}</span>
                            </div>
                            <p className="text-sm text-neutral-700 leading-relaxed">{r.prompt}</p>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-sm text-neutral-400">아직 평가한 추천이 없습니다</p>}
                  </div>

                  {/* 영상 채점 — 정량(축별 점수) + 정성(코멘트 원문) 전부 */}
                  <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-3">
                      영상 채점 결과
                      <span className="text-neutral-400 font-normal ml-1.5">
                        {member.details?.gradings?.length || 0}건
                      </span>
                    </h2>
                    {/* 헤더바(메타+등급) → 좌 16:9 영상 / 우 프롬프트→점수→피드백 순서로 정돈 */}
                    {member.details?.gradings?.length ? (
                      <div className="space-y-3">
                        {member.details.gradings.map((g: any, i: number) => {
                          // 등급별 색 — 항상 초록이면 B/C도 잘한 것처럼 보인다
                          const gradeColor =
                            g.score >= 90 ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : g.score >= 80 ? 'bg-[#E8F3FF] border-[#3182F6]/30 text-[#1b64da]'
                            : g.score >= 70 ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-red-50 border-red-200 text-red-600';
                          return (
                            <div key={i} className="border border-neutral-200 rounded-xl overflow-hidden">
                              {/* 흩어져 있던 날짜·모델·등급을 헤더 한 줄로 */}
                              <div className="flex items-center justify-between gap-2 px-3 py-2 bg-neutral-50 border-b border-neutral-200">
                                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 min-w-0">
                                  <span className="tabular-nums shrink-0">{fmtTime(g.at)}</span>
                                  {g.model && <span className="truncate">· {g.model} 채점</span>}
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold tabular-nums shrink-0 ${gradeColor}`}>
                                  {g.grade} · {g.score}점
                                </span>
                              </div>

                              <div className="p-3 grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-3">
                                {/* 영상 — 세로/가로 무관하게 16:9 프레임 고정, 모바일에서도 과대하지 않게 */}
                                <div className="w-full max-w-[320px] md:max-w-none aspect-video rounded-lg overflow-hidden bg-black border border-neutral-200 self-start">
                                  {g.videoUrl ? (
                                    <video
                                      src={g.videoUrl}
                                      controls
                                      preload="metadata"
                                      playsInline
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[11px] text-neutral-400 bg-neutral-50">
                                      영상 없음
                                    </div>
                                  )}
                                </div>

                                {/* 읽는 순서대로: 무엇을 시켰나 → 어떻게 채점됐나 → 코멘트 */}
                                <div className="min-w-0 space-y-2.5">
                                  {g.prompt && (
                                    <div>
                                      <div className="text-[10px] font-medium text-neutral-400 mb-1">입력 프롬프트</div>
                                      <p className="text-[13px] text-neutral-800 leading-relaxed bg-neutral-50 rounded-lg px-2.5 py-2">
                                        {g.prompt}
                                      </p>
                                    </div>
                                  )}

                                  {!!g.criteria?.length && (
                                    <div>
                                      <div className="text-[10px] font-medium text-neutral-400 mb-1">축별 점수</div>
                                      <div className="space-y-1">
                                        {g.criteria.map((c: any, ci: number) => (
                                          <div key={ci} className="flex items-center gap-2 text-[11px]">
                                            <span className="w-24 shrink-0 text-neutral-600 truncate">{c.axis}</span>
                                            <span className="w-8 shrink-0 text-neutral-400 tabular-nums">{c.weight}%</span>
                                            <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                                              <div className="h-full bg-[#3182F6]/60" style={{ width: `${c.score}%` }} />
                                            </div>
                                            <span className="w-7 shrink-0 text-right font-medium text-neutral-700 tabular-nums">{c.score}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {!!g.feedback?.length && (
                                    <div>
                                      <div className="text-[10px] font-medium text-neutral-400 mb-1">AI 피드백</div>
                                      <div className="space-y-1">
                                        {g.feedback.map((f: any, fi: number) => (
                                          <div key={fi} className="flex gap-1.5 text-[11px] leading-relaxed">
                                            <span className={f.type === 'positive' ? 'text-emerald-600' : f.type === 'tip' ? 'text-neutral-400' : 'text-amber-600'}>
                                              {f.type === 'positive' ? '✓' : f.type === 'tip' ? '›' : '!'}
                                            </span>
                                            <span className="text-neutral-600">{f.text}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : <p className="text-sm text-neutral-400">아직 채점된 영상이 없습니다</p>}
                  </div>
                  </>)}

                </>
              )}
            </section>
          </div>
        )}

      </main>
    </div>
  );
}
