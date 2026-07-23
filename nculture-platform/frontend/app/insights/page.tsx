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

        {/* 실시간 이벤트 모니터 — 시연의 핵심이라 맨 위. 아래 회원 비교가 밀리지 않게 높이를 조인다. */}
        {!!data?.recentEvents?.length && (
          <div className="mb-4 bg-white border border-neutral-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-neutral-400" />
                실시간 수집 이벤트
              </h2>
              <span className="text-[11px] text-neutral-400">
                최근 {data.recentEvents.length}건 · 5초마다 갱신
              </span>
            </div>
            <div className="space-y-1 max-h-44 overflow-y-auto">
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

        <div className="flex gap-3 mb-5">
          <Stat icon={<Users className="w-3.5 h-3.5" />} label="회원" value={data?.totals?.members ?? '-'} />
          <Stat icon={<Activity className="w-3.5 h-3.5" />} label="수집 이벤트" value={data?.totals?.events ?? '-'} />
          <Stat icon={<Star className="w-3.5 h-3.5" />} label="추천 별점" value={data?.totals?.ratings ?? '-'} />
          <Stat icon={<Award className="w-3.5 h-3.5" />} label="영상 채점" value={data?.totals?.gradings ?? '-'} />
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
              <div className="px-2 py-1.5 text-xs font-semibold text-neutral-500">회원</div>
              {data.members.map((m: any) => (
                <button
                  key={m.userId}
                  onClick={() => setSelected(m.userId)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition ${
                    selected === m.userId ? 'bg-[#3182F6]/8 border border-[#3182F6]/30' : 'hover:bg-neutral-50 border border-transparent'
                  }`}
                >
                  <div className="text-sm font-medium text-neutral-900 truncate">
                    {m.label || `익명 ${m.userId.slice(0, 6)}`}
                  </div>
                  {/* 동명이인이 있을 수 있어 계정을 함께 보여준다 */}
                  <div className="text-[11px] text-neutral-400 truncate">
                    {m.account || `uid ${m.userId.slice(0, 8)}`}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    이벤트 {m.totals.events} · {fmtTime(m.lastActiveAt)}
                  </div>
                </button>
              ))}
            </aside>

            {/* 선택 회원 상세 */}
            <section className="space-y-4">
              {member && (
                <>
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

                  {/* 개인화 프로필 — 공유 모듈(computeProfile)이 계산한 정규화 선호도(추천 엔진 입력) */}
                  {member.profile && (
                    <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                      <h2 className="text-sm font-semibold text-neutral-900 mb-1">
                        개인화 프로필 <span className="text-neutral-400 font-normal">(추천 엔진 입력 · 시드+행동 종합)</span>
                      </h2>
                      <p className="text-[11px] text-neutral-400 mb-4">
                        lib/personalization 이 계산한 정규화 affinity. 이 화면과 추천이 <b>같은 프로필</b>을 씁니다.
                      </p>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-28 shrink-0 text-xs text-neutral-600">데이터 신뢰도</span>
                        <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: pct(member.profile.confidence) }} />
                        </div>
                        <span className="w-9 text-right text-[11px] text-neutral-500 tabular-nums">{pct(member.profile.confidence)}</span>
                      </div>

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
                              <AffBar key={svc} label={svc} value={v} color="#8B5CF6" />
                            ))}
                            {!sortedEntries(member.profile.affinity.service, 1).length && <p className="text-sm text-neutral-400">—</p>}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {[...Object.keys(member.profile.affinity.content || {}), ...Object.keys(member.profile.affinity.style || {})].map((k) => (
                              <span key={k} className="px-2 py-0.5 rounded-md bg-neutral-100 text-[11px] text-neutral-600">{k}</span>
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
                      <p className="text-[11px] text-neutral-400 mb-4">
                        위 프로필로 후보 프롬프트를 재정렬한 결과 · 개인화 반영도 <b className="text-neutral-600">{pct(member.recommendations[0].alpha)}</b>
                        <span className="ml-1">(낮으면 인기순, 높으면 개인 취향)</span>
                      </p>
                      <div className="space-y-2">
                        {member.recommendations.map((r: any, i: number) => (
                          <div key={i} className="border border-neutral-200 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1.5 text-[11px]">
                              <span className="w-5 h-5 shrink-0 rounded-full bg-[#3182F6] text-white flex items-center justify-center font-bold">{i + 1}</span>
                              <span className="px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-600 tabular-nums">{r.timecode} 구간</span>
                              <span className="text-neutral-500 truncate">{sectionInfo(r.timecode).topic}</span>
                            </div>
                            <p className="text-sm text-neutral-800 leading-relaxed">
                              {String(r.prompt).slice(0, 140)}{String(r.prompt).length > 140 ? '…' : ''}
                            </p>
                            <div className="mt-2 flex items-center gap-3 text-[10px] text-neutral-400">
                              <span>개인 {pct(r.personal)}</span>
                              <span>제너럴 {pct(r.general)}</span>
                              <span className="tabular-nums">score {Number(r.score).toFixed(3)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                    {member.details?.gradings?.length ? (
                      <div className="space-y-3">
                        {member.details.gradings.map((g: any, i: number) => (
                          <div key={i} className="border border-neutral-200 rounded-xl p-3">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                                <span>{fmtTime(g.at)}</span>
                                {g.model && <span>· {g.model}</span>}
                                {g.videoUrl && (
                                  <a href={g.videoUrl} target="_blank" rel="noreferrer"
                                     className="text-[#3182F6] hover:underline">새 탭에서 열기</a>
                                )}
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 tabular-nums">
                                {g.grade} {g.score}점
                              </span>
                            </div>

                            {/* 채점 대상 영상을 그 자리에서 확인할 수 있어야 점수가 납득된다 */}
                            {g.videoUrl && (
                              <video
                                src={g.videoUrl}
                                controls
                                preload="metadata"
                                playsInline
                                className="w-full max-w-sm rounded-xl border border-neutral-200 bg-black mb-2"
                              />
                            )}

                            {g.prompt && (
                              <p className="text-sm text-neutral-800 mb-2 leading-relaxed">{g.prompt}</p>
                            )}

                            {/* 정량 */}
                            {!!g.criteria?.length && (
                              <div className="space-y-1 mb-2 pb-2 border-b border-neutral-100">
                                {g.criteria.map((c: any, ci: number) => (
                                  <div key={ci} className="flex items-center gap-2 text-[11px]">
                                    <span className="w-28 shrink-0 text-neutral-600">{c.axis}</span>
                                    <span className="w-8 shrink-0 text-neutral-400 tabular-nums">{c.weight}%</span>
                                    <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                                      <div className="h-full bg-[#3182F6]/60" style={{ width: `${c.score}%` }} />
                                    </div>
                                    <span className="w-7 shrink-0 text-right font-medium text-neutral-700 tabular-nums">{c.score}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* 정성 */}
                            {!!g.feedback?.length && (
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
                            )}
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-sm text-neutral-400">아직 채점된 영상이 없습니다</p>}
                  </div>

                </>
              )}
            </section>
          </div>
        )}

      </main>
    </div>
  );
}
