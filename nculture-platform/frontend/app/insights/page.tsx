'use client';

/**
 * 회원별 개인화 인사이트 — "데이터가 들어온다"가 아니라
 * "사람마다 다르게 쌓이고, 그래서 추천이 달라진다"를 보여주는 화면.
 *
 * 집계는 /api/insights (service_role) 가 한다. RLS 가 소유자 기반이라
 * 클라이언트에서는 본인 데이터만 보이기 때문.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Users, Activity, Star, Award, Clock, Sparkles, ArrowLeft } from 'lucide-react';
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
};

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

export default function InsightsPage() {
  const [data, setData] = useState<any>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auto, setAuto] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/insights', { cache: 'no-store' });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || '불러오기 실패');
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

  // 가장 오래 머문 구간의 실제 인제스트 추천을 끌어와 "그래서 이걸 추천한다"로 연결
  const nextSuggestion = useMemo(() => {
    if (!member) return null;
    const topSection = member.derived?.topSections?.[0]?.key;
    const prompts: any[] = (lectureIngest as any).on_screen_prompts || [];
    const matched = prompts.find((p) => p.timecode === topSection);
    const pick = matched || prompts[0];
    return pick?.recommended?.[0]
      ? { timecode: pick.timecode, prompt: pick.recommended[0], matched: !!matched }
      : null;
  }, [member]);

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
                        <div className="text-[11px] text-neutral-500 mb-1">생성 횟수</div>
                        <div className="text-lg font-bold tabular-nums">{member.totals.generate}</div>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-medium text-neutral-700 mb-2 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" /> 오래 머문 구간
                        </div>
                        {member.derived.topSections.length ? (
                          <div className="space-y-1.5">
                            {member.derived.topSections.map((s: any) => (
                              <div key={s.key} className="flex items-center justify-between text-sm">
                                <span className="text-neutral-600 tabular-nums">{s.key}</span>
                                <span className="font-medium text-neutral-900 tabular-nums">{s.value}초</span>
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-sm text-neutral-400">—</p>}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-neutral-700 mb-2">자주 고른 모델</div>
                        {member.derived.topModels.length ? (
                          <div className="space-y-1.5">
                            {member.derived.topModels.map((s: any) => (
                              <div key={s.key} className="flex items-center justify-between text-sm">
                                <span className="text-neutral-600">{s.key}</span>
                                <span className="font-medium text-neutral-900 tabular-nums">{s.value}회</span>
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-sm text-neutral-400">—</p>}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-neutral-200 flex flex-wrap gap-1.5">
                      {Object.entries(member.derived.eventsByType).map(([t, n]: any) => (
                        <span key={t} className="px-2 py-1 rounded-full bg-neutral-100 text-[11px] text-neutral-600">
                          {EVENT_LABELS[t] || t} {n}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 그래서 다음엔 */}
                  {nextSuggestion && (
                    <div className="bg-[#3182F6]/5 border border-[#3182F6]/20 rounded-2xl p-5">
                      <h2 className="text-sm font-semibold text-[#1b64da] mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> 그래서 다음엔 이걸 추천합니다
                      </h2>
                      <p className="text-[11px] text-neutral-500 mb-3">
                        {nextSuggestion.matched
                          ? `가장 오래 머문 ${nextSuggestion.timecode} 구간의 개념을 아직 연습하지 않았습니다.`
                          : '아직 체류 데이터가 부족해 회차 기본 추천을 보여줍니다.'}
                        {member.seed?.visualStyles?.length ? ` 선호 스타일(${member.seed.visualStyles.join(', ')})도 함께 반영합니다.` : ''}
                      </p>
                      <div className="bg-white border border-neutral-200 rounded-xl p-3 text-sm text-neutral-800 leading-relaxed">
                        {nextSuggestion.prompt}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}

        {/* 실시간 스트림 */}
        {!!data?.recentEvents?.length && (
          <div className="mt-4 bg-white border border-neutral-200 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-neutral-900 mb-3">최근 수집 이벤트</h2>
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {data.recentEvents.map((e: any, i: number) => (
                <div key={i} className="flex items-center gap-3 text-xs py-1.5 border-b border-neutral-100 last:border-0">
                  <span className="text-neutral-400 w-14 shrink-0 tabular-nums">{fmtTime(e.at)}</span>
                  <span className="w-40 shrink-0 truncate text-neutral-600">{e.label || `익명 ${e.userId.slice(0, 6)}`}</span>
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
      </main>
    </div>
  );
}
