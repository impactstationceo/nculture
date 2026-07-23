'use client';

import { useCallback, useRef, useState } from 'react';
import { Sparkles, Loader2, Download, AlertCircle } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* 옵션 정의                                                            */
/* ------------------------------------------------------------------ */

// 텍스트→영상은 Hailuo-2.3만 지원 (Fast는 이미지 입력 필요한 image-to-video 전용)
const MODELS = [
  { value: 'MiniMax-Hailuo-2.3', label: 'Hailuo 2.3', hint: '텍스트→영상' },
] as const;

const RESOLUTIONS = ['768P', '1080P'] as const;
const DURATIONS = [6, 10] as const;

// 크레딧 소모량 (pay-as-you-go 정가 × 1,000). 미공개 조합은 null.
const CREDIT_COST: Record<string, Record<string, Record<number, number | null>>> = {
  'MiniMax-Hailuo-2.3-Fast': {
    '768P': { 6: 190, 10: 320 },
    '1080P': { 6: 330, 10: null },
  },
  'MiniMax-Hailuo-2.3': {
    '768P': { 6: 280, 10: 560 },
    '1080P': { 6: 490, 10: null },
  },
};

type Model = (typeof MODELS)[number]['value'];
type Status = 'idle' | 'submitting' | 'polling' | 'success' | 'error';

/* ------------------------------------------------------------------ */

export default function VideoStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<Model>('MiniMax-Hailuo-2.3');
  const [resolution, setResolution] = useState<string>('768P');
  const [duration, setDuration] = useState<number>(6);

  const [status, setStatus] = useState<Status>('idle');
  const [statusText, setStatusText] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cancelRef = useRef(false);

  const cost = CREDIT_COST[model]?.[resolution]?.[duration] ?? null;
  const busy = status === 'submitting' || status === 'polling';

  const poll = useCallback(async (taskId: string) => {
    // 최대 ~5분(60회 × 5초)까지 폴링
    for (let i = 0; i < 60; i++) {
      if (cancelRef.current) return;
      await new Promise((r) => setTimeout(r, 5000));
      const res = await fetch(`/api/video/status?taskId=${encodeURIComponent(taskId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '상태 조회 실패');

      setStatusText(`상태: ${data.status}`);

      if (data.status === 'Success' && data.downloadUrl) {
        setVideoUrl(data.downloadUrl);
        setStatus('success');
        return;
      }
      if (data.status === 'Fail') {
        throw new Error(data.error || '영상 생성 실패');
      }
    }
    throw new Error('시간 초과 — 잠시 후 다시 시도해주세요.');
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || busy) return;
    cancelRef.current = false;
    setError(null);
    setVideoUrl(null);
    setStatus('submitting');
    setStatusText('태스크 제출 중…');

    try {
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), model, resolution, duration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '생성 요청 실패');

      setStatus('polling');
      setStatusText('생성 중… (보통 30초~2분)');
      await poll(data.taskId);
    } catch (e: any) {
      setError(e?.message || '오류가 발생했습니다.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 px-5">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3182F6]">
            <Sparkles className="w-4 h-4" />
            Hailuo 영상 생성 (테스트)
          </span>
          <h1 className="mt-2 text-2xl font-bold text-[#191F28] tracking-[-0.02em]">
            프롬프트로 영상 만들기
          </h1>
          <p className="mt-1 text-[15px] text-neutral-500">
            MiniMax 크레딧으로 실습용 짧은 영상을 생성합니다.
          </p>
        </div>

        {/* 입력 카드 */}
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#333D4B] mb-2">프롬프트</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 네온사인이 반짝이는 밤거리를 걷는 고양이, 시네마틱한 느낌"
              rows={3}
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-[15px] text-[#191F28] placeholder:text-neutral-400 focus:border-[#3182F6] focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="모델">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as Model)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-[#191F28] focus:border-[#3182F6] focus:outline-none bg-white"
              >
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </Field>
            <Field label="해상도">
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-[#191F28] focus:border-[#3182F6] focus:outline-none bg-white"
              >
                {RESOLUTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="길이">
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-[#191F28] focus:border-[#3182F6] focus:outline-none bg-white"
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>{d}초</option>
                ))}
              </select>
            </Field>
          </div>

          {/* 예상 비용 */}
          <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
            <span className="text-sm text-neutral-500">예상 소모</span>
            <span className="text-sm font-semibold text-[#333D4B]">
              {cost != null ? (
                <>약 {cost.toLocaleString()} 크레딧 <span className="text-neutral-400">(${(cost / 1000).toFixed(2)})</span></>
              ) : (
                <span className="text-warning">이 조합은 요금 미공개</span>
              )}
            </span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || busy || cost == null}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-[#3182F6] hover:bg-[#1B64DA] disabled:bg-neutral-200 disabled:text-neutral-400 transition-colors"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {status === 'submitting' ? '제출 중…' : status === 'polling' ? '생성 중…' : '영상 생성'}
          </button>

          {busy && (
            <p className="text-center text-sm text-neutral-500">{statusText}</p>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-[#FEECEC] px-4 py-3">
              <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}
        </div>

        {/* 결과 */}
        {videoUrl && (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white shadow-sm p-5">
            <video src={videoUrl} controls autoPlay loop className="w-full rounded-xl bg-black" />
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3182F6] hover:text-[#1B64DA]"
            >
              <Download className="w-4 h-4" />
              다운로드 / 새 탭에서 열기
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
