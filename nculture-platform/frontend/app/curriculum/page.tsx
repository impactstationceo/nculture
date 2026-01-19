'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import { CURRICULUM } from '@/lib/data';
import { useAuth } from '@/components/AuthProvider';

// 코스 카드 컴포넌트
const CourseCard = ({ course, onClick }: { course: any; onClick: () => void }) => {
  const serviceIcons = ['🎬', '🎵', '🎯', '⚡'];
  
  return (
    <div 
      className="bg-neutral-900 rounded-2xl overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* 썸네일 영역 */}
      <div className="relative">
        <img 
          src={course.thumbnail} 
          alt={course.title} 
          className="w-full aspect-[4/3] object-cover"
        />
        
        {/* 어두운 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-neutral-900/50" />
        
        {/* AI 서비스 아이콘 그리드 */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {serviceIcons.map((icon, i) => (
            <div 
              key={i}
              className="w-8 h-8 bg-black/40 backdrop-blur-sm rounded-lg flex items-center justify-center text-sm border border-white/20"
            >
              {icon}
            </div>
          ))}
        </div>
        
        {/* 우측 장식 */}
        <div className="absolute top-3 right-3 w-12 h-12 border border-white/20 rounded-lg" />
      </div>
      
      {/* 정보 영역 */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
          {course.title}
        </h3>
        
        {/* 가격 */}
        <div className="text-lg font-bold text-white mb-1">무료</div>
        
        {/* 리뷰 */}
        <div className="flex items-center gap-1 text-sm text-neutral-400 mb-3">
          <span className="text-amber-400">★</span>
          <span>후기 {12 + course.totalSessions * 3}개</span>
        </div>
        
        {/* 메타 정보 */}
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>총 {course.totalSessions} 세션</span>
          <span className="w-1 h-1 bg-neutral-600 rounded-full" />
          <span>{course.instructor}</span>
        </div>
      </div>
    </div>
  );
};

export default function CurriculumPage() {
  const { user, profile, isLoggedIn, wallet, login, logout, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogin = (userData: any) => {
    login(userData);
    setShowAuthModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <Header 
        isLoggedIn={isLoggedIn}
        user={user}
        profile={profile}
        wallet={wallet}
        onAuthClick={handleAuthClick}
        onLogout={logout}
      />

      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">클래스</h1>
          <p className="text-neutral-600">체계적인 AI 콘텐츠 창작 학습 과정</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(CURRICULUM).map((course: any) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <CourseCard course={course} onClick={() => {}} />
            </Link>
          ))}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onLogin={handleLogin}
      />
    </div>
  );
}
