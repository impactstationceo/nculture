'use client';

import { useRouter } from 'next/navigation';
import { Video, Sparkles, Zap, BookOpen, Target, Shield } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/components/AuthProvider';

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, user, viewMode, currentRole, wallet, userPlan, handleAuthClick, handleLogout, setCurrentPage, handleRoleSwitch, currentPage } = useAuth();

  return (
    <div className="min-h-screen bg-white">
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

      <section className="pt-32 pb-24 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold leading-relaxed">
              <span className="text-indigo-600">AI 콘텐츠 교육,</span>
            </h1>
            <h2 className="text-4xl font-bold text-neutral-900 mt-6 leading-relaxed">
              <span className="text-black font-extrabold text-5xl">앤컬쳐</span>와 함께면<br/>
              기초 학습부터 전문가로의 성장까지
            </h2>
            <p className="text-4xl font-bold text-neutral-800 mt-8 mb-12">
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
              className="w-full max-w-md px-8 py-4 bg-indigo-600 text-white text-base font-medium rounded-xl hover:bg-indigo-700 transition-colors"
            >
              {isLoggedIn ? '학습 시작하기' : '무료로 시작하기'}
            </button>
          </div>
          
          <div className="flex-shrink-0 relative">
            <div className="w-80 h-80 bg-indigo-100 rounded-full flex items-center justify-center">
              <div className="text-center">
                <Video className="w-20 h-20 text-indigo-500 mx-auto mb-4" />
                <div className="text-indigo-600 font-medium">AI Video Creation</div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-400 rounded-2xl flex items-center justify-center rotate-12">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-indigo-300 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-4">체계적인 AI 영상 교육</h2>
          <p className="text-neutral-600 text-center mb-12">실무에 바로 적용할 수 있는 커리큘럼</p>
          
          <div className="grid grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-5">
                <BookOpen className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">단계별 커리큘럼</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">기초부터 고급까지 체계적인 학습 경로를 제공합니다.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-5">
                <Video className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">라이브 실습</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">실시간으로 강사와 함께 AI 도구를 실습합니다.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-5">
                <Target className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">실시간 평가</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">학습 진도와 성과를 실시간으로 모니터링합니다.</p>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="bg-white border-t border-neutral-200 py-8 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-lg tracking-tight">
                <span className="font-normal text-indigo-500">n</span>
                <span className="font-medium text-indigo-500">Culture</span>
              </span>
              <p className="text-sm text-neutral-500">© 2025 nCulture. All rights reserved.</p>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-neutral-500">
              <button className="hover:text-neutral-900 transition-colors">이용약관</button>
              <button className="hover:text-neutral-900 transition-colors">개인정보처리방침</button>
              <button className="hover:text-neutral-900 transition-colors">문의하기</button>
              <span className="w-px h-4 bg-neutral-200" />
              <button 
                onClick={() => handleAuthClick('institution_login')}
                className="text-neutral-400 hover:text-neutral-600 transition-colors flex items-center gap-1"
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
