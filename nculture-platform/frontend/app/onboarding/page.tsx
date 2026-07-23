'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { savePersonaSeed, setAnalyticsIdentity, logEvent } from '@/lib/analytics';
import {
  Video,
  Image as ImageIcon,
  UserSquare,
  Megaphone,
  Film,
  Palette,
  Camera,
  Minus,
  FlaskConical,
  Sparkles,
  Check,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* 선택지 정의 — 표시용 한글 라벨 + 저장용 영문 값 (확장 쉽게 상단 상수) */
/* ------------------------------------------------------------------ */

interface Option {
  value: string;
  label: string;
  desc?: string;
  icon: LucideIcon;
}

const CONTENT_TYPES: Option[] = [
  { value: 'video', label: '영상', desc: 'Sora · Veo · Kling', icon: Video },
  { value: 'image', label: '이미지', desc: 'Midjourney · Flux', icon: ImageIcon },
  { value: 'digital_human', label: '디지털 휴먼', desc: '가상 인물 · 아바타', icon: UserSquare },
  { value: 'ads_shorts', label: '광고·쇼츠', desc: '숏폼 · 마케팅 영상', icon: Megaphone },
];

const VISUAL_STYLES: Option[] = [
  { value: 'cinematic', label: '시네마틱', desc: '영화적 · 드라마틱', icon: Film },
  { value: 'anime', label: '애니메이션·일러스트', desc: '2D · 그림체', icon: Palette },
  { value: 'photoreal', label: '포토리얼', desc: '실사 · 사진 같은', icon: Camera },
  { value: 'minimal', label: '미니멀·모던', desc: '깔끔 · 절제된', icon: Minus },
  { value: 'experimental', label: '실험적·추상', desc: '아방가르드 · 추상', icon: FlaskConical },
  { value: 'vintage', label: '빈티지·필름', desc: '레트로 · 필름 그레인', icon: Sparkles },
];

const PURPOSES: Option[] = [
  { value: 'hobby', label: '취미·자기표현', desc: '나만의 창작을 즐겨요', icon: Palette },
  { value: 'commercial', label: '실무·커머셜', desc: '업무에 바로 활용해요', icon: Video },
  { value: 'branding', label: '브랜딩·마케팅', desc: '브랜드를 알려요', icon: Megaphone },
  { value: 'education', label: '교육·연구', desc: '가르치거나 연구해요', icon: FlaskConical },
];

const EXPERIENCES: Option[] = [
  { value: 'beginner', label: '입문', desc: '이제 막 시작했어요', icon: Sparkles },
  { value: 'intermediate', label: '중급', desc: '기본은 다뤄봤어요', icon: Camera },
  { value: 'pro', label: '실무자', desc: '실제 작업에 쓰고 있어요', icon: Film },
];

/* ------------------------------------------------------------------ */
/* 데이터 모델                                                          */
/* ------------------------------------------------------------------ */

interface PersonaSeed {
  contentTypes: string[];
  visualStyles: string[];
  purpose: string | null;
  experience: string | null;
  skipped: boolean;
  createdAt: string;
}

const SEED_KEY = 'coming_persona_seed';

/* ------------------------------------------------------------------ */
/* 스텝 메타                                                            */
/* ------------------------------------------------------------------ */

const STEPS = [
  { key: 'content', title: '어떤 콘텐츠에 관심 있으세요?', hint: '관심 있는 걸 모두 골라주세요 (다중 선택)' },
  { key: 'style', title: '어떤 비주얼 스타일이 끌리세요?', hint: '마음에 드는 스타일을 모두 골라주세요 (다중 선택)' },
  { key: 'purpose', title: '주로 어떤 목적으로 창작하세요?', hint: '가장 가까운 하나를 골라주세요' },
  { key: 'experience', title: '생성형 AI, 얼마나 다뤄보셨어요?', hint: '지금 수준에 맞는 하나를 골라주세요' },
  { key: 'done', title: '준비됐어요!', hint: '' },
] as const;

const TOTAL_STEPS = STEPS.length;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [visualStyles, setVisualStyles] = useState<string[]>([]);
  const [purpose, setPurpose] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);

  const toggle = (value: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const persist = (skipped: boolean) => {
    const seed: PersonaSeed = {
      contentTypes,
      visualStyles,
      purpose,
      experience,
      skipped,
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(SEED_KEY, JSON.stringify(seed));
    } catch {
      /* localStorage 접근 실패 시에도 진행은 막지 않음 */
    }
    // 회원 초기 리드 수집: user_persona.seed 에 적재 (실패해도 진행은 막지 않음)
    try {
      const demo = JSON.parse(localStorage.getItem('demo_session') || 'null');
      setAnalyticsIdentity(demo?.email, demo?.name); // 데모 계정별로 페르소나를 분리해 저장
    } catch {
      /* 데모 세션이 없으면 guest 신원으로 저장된다 */
    }
    void savePersonaSeed(seed as unknown as Record<string, unknown>);
    void logEvent('style_select', {
      content_types: contentTypes,
      visual_styles: visualStyles,
      purpose,
      experience,
      skipped,
    });
  };

  const handleSkip = () => {
    persist(true);
    router.push('/curriculum');
  };

  const handleFinish = () => {
    persist(false);
    router.push('/curriculum');
  };

  // 현재 스텝에서 다음으로 넘어갈 수 있는지 (다중 선택 스텝은 최소 1개 요구 X — 자유롭게 진행 가능)
  const canProceed = useMemo(() => {
    switch (step) {
      case 2:
        return purpose !== null;
      case 3:
        return experience !== null;
      default:
        return true;
    }
  }, [step, purpose, experience]);

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const progress = ((step + 1) / TOTAL_STEPS) * 100;
  const current = STEPS[step];
  const isDone = step === TOTAL_STEPS - 1;

  const labelOf = (value: string, options: Option[]) =>
    options.find((o) => o.value === value)?.label ?? value;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* 상단 바: 진행 표시 + 건너뛰기 */}
      <header className="sticky top-0 z-10 bg-[#F9FAFB]/90 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-5 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3182F6]">
              <Sparkles className="w-4 h-4" />
              Coming AI
            </span>
            <button
              onClick={handleSkip}
              className="text-sm font-medium text-neutral-400 hover:text-neutral-500 transition-colors"
            >
              건너뛰기
            </button>
          </div>

          {/* 프로그레스 바 */}
          <div className="mt-4 h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#3182F6] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-medium text-neutral-400">
            {step + 1} / {TOTAL_STEPS}
          </p>
        </div>
      </header>

      {/* 본문 */}
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-8">
          {/* 헤드라인 */}
          <div key={current.key} className="animate-fade-in">
            {step === 0 && (
              <p className="text-sm font-semibold text-[#3182F6] mb-2">
                당신에게 맞는 AI 창작 스타일을 찾아드릴게요
              </p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-[#191F28] tracking-[-0.02em]">
              {current.title}
            </h1>
            {current.hint && (
              <p className="mt-2 text-[15px] text-neutral-500">{current.hint}</p>
            )}
          </div>

          {/* 스텝별 콘텐츠 */}
          <div key={`body-${current.key}`} className="mt-8 animate-fade-in">
            {step === 0 && (
              <CardGrid
                options={CONTENT_TYPES}
                selected={contentTypes}
                multi
                onSelect={(v) => toggle(v, contentTypes, setContentTypes)}
              />
            )}
            {step === 1 && (
              <CardGrid
                options={VISUAL_STYLES}
                selected={visualStyles}
                multi
                onSelect={(v) => toggle(v, visualStyles, setVisualStyles)}
              />
            )}
            {step === 2 && (
              <CardGrid
                options={PURPOSES}
                selected={purpose ? [purpose] : []}
                onSelect={(v) => setPurpose(v)}
              />
            )}
            {step === 3 && (
              <CardGrid
                options={EXPERIENCES}
                selected={experience ? [experience] : []}
                onSelect={(v) => setExperience(v)}
              />
            )}

            {isDone && (
              <Summary
                items={[
                  { label: '관심 콘텐츠', values: contentTypes.map((v) => labelOf(v, CONTENT_TYPES)) },
                  { label: '선호 스타일', values: visualStyles.map((v) => labelOf(v, VISUAL_STYLES)) },
                  { label: '사용 목적', values: purpose ? [labelOf(purpose, PURPOSES)] : [] },
                  { label: '경험 수준', values: experience ? [labelOf(experience, EXPERIENCES)] : [] },
                ]}
              />
            )}
          </div>
        </div>
      </main>

      {/* 하단 네비게이션 */}
      <footer className="sticky bottom-0 bg-[#F9FAFB]/90 backdrop-blur-sm border-t border-neutral-200">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={goPrev}
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              이전
            </button>
          )}

          {!isDone ? (
            <button
              onClick={goNext}
              disabled={!canProceed}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl font-semibold text-white bg-[#3182F6] hover:bg-[#1B64DA] disabled:bg-neutral-200 disabled:text-neutral-400 transition-colors"
            >
              다음
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl font-semibold text-white bg-[#3182F6] hover:bg-[#1B64DA] transition-colors"
            >
              시작하기
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 카드 그리드                                                          */
/* ------------------------------------------------------------------ */

function CardGrid({
  options,
  selected,
  onSelect,
  multi = false,
}: {
  options: Option[];
  selected: string[];
  onSelect: (value: string) => void;
  multi?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`relative text-left p-4 rounded-2xl border-2 shadow-sm transition-all duration-200 ${
              active
                ? 'border-[#3182F6] bg-[#E8F3FF]'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            }`}
          >
            {active && (
              <span className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 rounded-full bg-[#3182F6]">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </span>
            )}
            <span
              className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${
                active ? 'bg-[#3182F6] text-white' : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              <Icon className="w-5 h-5" />
            </span>
            <p className={`font-semibold ${active ? 'text-[#191F28]' : 'text-[#333D4B]'}`}>
              {opt.label}
            </p>
            {opt.desc && <p className="mt-0.5 text-[13px] text-neutral-400">{opt.desc}</p>}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 완료 요약                                                            */
/* ------------------------------------------------------------------ */

function Summary({ items }: { items: { label: string; values: string[] }[] }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm divide-y divide-neutral-100">
      {items.map((item) => (
        <div key={item.label} className="flex items-start justify-between gap-4 px-5 py-4">
          <span className="text-sm font-medium text-neutral-500 shrink-0">{item.label}</span>
          <span className="text-sm font-semibold text-[#333D4B] text-right">
            {item.values.length > 0 ? item.values.join(' · ') : '선택 안 함'}
          </span>
        </div>
      ))}
    </div>
  );
}
