'use client';

import { useRouter } from 'next/navigation';
import { Video, Sparkles, Zap, BookOpen, Target, Shield } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/components/AuthProvider';

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, user, viewMode, currentRole, wallet, userPlan, handleAuthClick, handleLogout, setCurrentPage, handleRoleSwitch, currentPage } = useAuth();

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

      <section className="pt-24 pb-12 px-4 md:px-6 lg:px-8 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 right-10 w-72 h-72 bg-[#E8F3FF] rounded-full blur-3xl opacity-80" />
          <div className="absolute top-16 left-0 w-56 h-56 bg-[#F2F4F6] rounded-full blur-3xl opacity-80" />
        </div>
        <div className="max-w-screen-xl mx-auto relative">
          <div className="bg-white border border-[#E5E8EB] rounded-3xl p-8 md:p-12 shadow-md flex items-center justify-between gap-10">
            <div className="max-w-2xl">
            <h1 className="text-xs md:text-sm font-semibold text-[#3182F6] tracking-[0.08em]">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E8F3FF] border border-[#D1E5FF] text-[#3182F6]">
                AI 콘텐츠 교육,
              </span>
            </h1>
            <h2 className="text-4xl md:text-6xl font-extrabold text-[#191F28] mt-4 leading-tight tracking-tight">
              <span className="gradient-text font-extrabold text-5xl md:text-7xl">앤컬쳐</span>와 함께면<br/>
              기초 학습부터 전문가로의 성장까지
            </h2>
            <p className="text-lg md:text-2xl font-medium text-[#333D4B] mt-4 mb-8">
              모두 가능합니다!
            </p>
            <button 
              onClick={() => {
                if (isLoggedIn) {
                  router.push('/session/1');
                } else {
                  handleAuthClick('signup');
                }
              }}
              className="w-full max-w-md px-8 py-4 bg-[#3182F6] text-white text-base font-semibold rounded-xl shadow-md hover:bg-[#1B64DA] transition-colors"
            >
              {isLoggedIn ? '학습 시작하기' : '무료로 시작하기'}
            </button>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#6B7684]">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F9FAFB] border border-[#E5E8EB] rounded-full">
                실습 중심 커리큘럼
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F9FAFB] border border-[#E5E8EB] rounded-full">
                최신 모델 실전 적용
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F9FAFB] border border-[#E5E8EB] rounded-full">
                결과 기반 피드백
              </span>
            </div>
            </div>
            
            <div className="flex-shrink-0 relative">
              <div className="w-80 h-80 bg-[#E8F3FF] rounded-full flex items-center justify-center border border-[#D1E5FF] shadow-md">
                <div className="text-center">
                  <Video className="w-20 h-20 text-[#3182F6] mx-auto mb-4" />
                  <div className="text-[#3182F6] font-medium">AI Video Creation</div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#3182F6] rounded-2xl flex items-center justify-center rotate-12 shadow-md">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-[#A7CCFF] rounded-full flex items-center justify-center shadow-md">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white border border-[#E5E8EB] rounded-3xl p-10 md:p-12 shadow-md">
            <h2 className="text-3xl font-bold text-[#191F28] text-center mb-4">체계적인 AI 영상 교육</h2>
            <p className="text-[#6B7684] text-center mb-12">실무에 바로 적용할 수 있는 커리큘럼</p>
            
            <div className="grid grid-cols-3 gap-8">
              <div className="bg-[#F9FAFB] rounded-2xl p-8 border border-[#E5E8EB] shadow-sm">
              <div className="w-14 h-14 bg-[#E8F3FF] rounded-xl flex items-center justify-center mb-5">
                <BookOpen className="w-7 h-7 text-[#3182F6]" />
              </div>
              <h3 className="text-lg font-semibold text-[#191F28] mb-2">단계별 커리큘럼</h3>
              <p className="text-[#6B7684] text-sm leading-relaxed">기초부터 고급까지 체계적인 학습 경로를 제공합니다.</p>
              </div>
              <div className="bg-[#F9FAFB] rounded-2xl p-8 border border-[#E5E8EB] shadow-sm">
              <div className="w-14 h-14 bg-[#E8F3FF] rounded-xl flex items-center justify-center mb-5">
                <Video className="w-7 h-7 text-[#3182F6]" />
              </div>
              <h3 className="text-lg font-semibold text-[#191F28] mb-2">라이브 실습</h3>
              <p className="text-[#6B7684] text-sm leading-relaxed">실시간으로 강사와 함께 AI 도구를 실습합니다.</p>
              </div>
              <div className="bg-[#F9FAFB] rounded-2xl p-8 border border-[#E5E8EB] shadow-sm">
              <div className="w-14 h-14 bg-[#E8F3FF] rounded-xl flex items-center justify-center mb-5">
                <Target className="w-7 h-7 text-[#3182F6]" />
              </div>
              <h3 className="text-lg font-semibold text-[#191F28] mb-2">실시간 평가</h3>
              <p className="text-[#6B7684] text-sm leading-relaxed">학습 진도와 성과를 실시간으로 모니터링합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="bg-white border-t border-[#E5E8EB] py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-lg tracking-tight">
                <span className="font-normal text-[#3182F6]">n</span>
                <span className="font-medium text-[#191F28]">Culture</span>
              </span>
              <p className="text-sm text-[#8B95A1]">© 2025 nCulture. All rights reserved.</p>
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
