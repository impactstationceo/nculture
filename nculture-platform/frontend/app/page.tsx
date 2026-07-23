'use client';

import { useRouter } from 'next/navigation';
import { Video, Sparkles, Zap, BookOpen, Target, Shield, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/components/AuthProvider';

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, user, viewMode, currentRole, wallet, userPlan, handleAuthClick, handleLogout, setCurrentPage, handleRoleSwitch, currentPage } = useAuth();

  const startLearning = () => {
    if (isLoggedIn) {
      router.push('/session/1');
    } else {
      handleAuthClick('signup');
    }
  };

  const features = [
    { icon: BookOpen, step: '01', title: '단계별 커리큘럼', desc: '기초부터 고급까지 체계적인 학습 경로를 제공합니다.' },
    { icon: Video, step: '02', title: '라이브 실습', desc: '실시간으로 강사와 함께 AI 도구를 실습합니다.' },
    { icon: Target, step: '03', title: '실시간 평가', desc: '학습 진도와 성과를 실시간으로 모니터링합니다.' },
  ];

  const highlights = ['실습 중심 커리큘럼', '최신 모델 실전 적용', '결과 기반 피드백'];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isLoggedIn={isLoggedIn}
        user={user}
        viewMode={viewMode}
        currentRole={currentRole}
        onAuthClick={handleAuthClick}
        onLogout={handleLogout}
        wallet={wallet}
        userPlan={userPlan}
        onRoleSwitch={handleRoleSwitch}
      />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pb-24 px-4 md:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 right-0 w-[420px] h-[420px] bg-[#E8F3FF] rounded-full blur-3xl opacity-70" />
          <div className="absolute top-24 -left-10 w-72 h-72 bg-[#EEF3FB] rounded-full blur-3xl opacity-70" />
        </div>

        <div className="max-w-screen-xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-14 lg:gap-10">
            <div className="w-full lg:max-w-2xl text-center lg:text-left animate-fade-in">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E8F3FF] text-[#3182F6] text-sm font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                AI 콘텐츠 교육
              </span>

              <h1 className="mt-6 text-[2.5rem] leading-[1.15] md:text-6xl md:leading-[1.08] font-bold text-[#191F28] tracking-[-0.03em]">
                <span className="gradient-text">Coming AI</span>와 함께<br />
                전문가로 성장하세요
              </h1>

              <p className="mt-6 text-lg md:text-xl text-[#4E5968] leading-relaxed">
                기초 학습부터 실전 프로젝트까지,<br className="hidden md:block" />
                AI 영상 제작의 모든 과정을 한 곳에서.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <button
                  onClick={startLearning}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#3182F6] text-white text-[17px] font-semibold rounded-2xl hover:bg-[#1B64DA] active:scale-[0.98] transition-all shadow-[0_10px_28px_rgba(49,130,246,0.28)]"
                >
                  {isLoggedIn ? '학습 시작하기' : '무료로 시작하기'}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => router.push('/curriculum')}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 bg-white text-[#4E5968] text-[17px] font-semibold rounded-2xl border border-[#E5E8EB] hover:bg-[#F2F4F6] active:scale-[0.98] transition-all"
                >
                  커리큘럼 둘러보기
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-2.5 justify-center lg:justify-start">
                {highlights.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E8EB] rounded-full text-sm text-[#4E5968]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3182F6]" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Illustration */}
            <div className="flex-shrink-0 relative animate-fade-in">
              <div className="w-72 h-72 md:w-80 md:h-80 bg-gradient-to-br from-[#E8F3FF] to-[#D1E5FF] rounded-[2.5rem] flex items-center justify-center shadow-[0_24px_64px_rgba(49,130,246,0.18)]">
                <div className="text-center">
                  <Video className="w-20 h-20 text-[#3182F6] mx-auto mb-4" />
                  <div className="text-[#3182F6] font-semibold">AI Video Creation</div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#3182F6] rounded-[1.25rem] flex items-center justify-center rotate-12 shadow-[0_14px_32px_rgba(49,130,246,0.35)]">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white border border-[#E5E8EB] rounded-full flex items-center justify-center shadow-lg">
                <Zap className="w-8 h-8 text-[#3182F6]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="pb-20 md:pb-28 px-4 md:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-12 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#191F28] tracking-[-0.02em]">체계적인 AI 영상 교육</h2>
            <p className="mt-3 text-lg text-[#8B95A1]">실무에 바로 적용할 수 있는 커리큘럼</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {features.map(({ icon: Icon, step, title, desc }) => (
              <div
                key={step}
                className="group bg-white rounded-3xl p-8 border border-[#E5E8EB] transition-all duration-200 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-[#E8F3FF] rounded-2xl flex items-center justify-center group-hover:bg-[#3182F6] transition-colors">
                    <Icon className="w-7 h-7 text-[#3182F6] group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm font-bold text-[#D1D6DB]">{step}</span>
                </div>
                <h3 className="text-xl font-bold text-[#191F28] mb-2">{title}</h3>
                <p className="text-[#6B7684] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-[#E5E8EB] py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="text-lg tracking-tight">
                <span className="font-normal text-[#3182F6]">Coming</span>
                <span className="font-medium text-[#191F28]"> AI</span>
              </span>
              <p className="text-sm text-[#8B95A1]">© 2025 Coming AI. All rights reserved</p>
            </div>

            <div className="flex items-center gap-6 text-sm text-[#6B7684]">
              <button className="hover:text-[#191F28] transition-colors">이용약관</button>
              <button className="hover:text-[#191F28] transition-colors">개인정보처리방침</button>
              <button className="hover:text-[#191F28] transition-colors">문의하기</button>
              <span className="w-px h-4 bg-[#E5E8EB]" />
              <button
                onClick={() => handleAuthClick('institution_login')}
                className="text-[#3182F6] hover:text-[#1B64DA] transition-colors flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" />
                기관 관리자
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
