'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, Clock, BookOpen, ChevronRight, Check } from 'lucide-react';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import { CURRICULUM } from '@/lib/data';
import { useAuth } from '@/components/AuthProvider';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const { user, profile, isLoggedIn, wallet, login, logout, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [expandedSession, setExpandedSession] = useState<number | null>(null);

  const course = CURRICULUM[courseId];

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogin = (userData: any) => {
    login(userData);
    setShowAuthModal(false);
  };

  const handleStartSession = (sessionId: number) => {
    if (!isLoggedIn) {
      handleAuthClick('login');
      return;
    }
    router.push(`/session/${sessionId}`);
  };

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">코스를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      <Header 
        isLoggedIn={isLoggedIn}
        user={user}
        profile={profile}
        wallet={wallet}
        onAuthClick={handleAuthClick}
        onLogout={logout}
      />

      {/* 코스 헤더 */}
      <div className="bg-neutral-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex gap-8">
            {/* 썸네일 */}
            <div className="w-80 flex-shrink-0">
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full rounded-2xl"
              />
            </div>
            
            {/* 정보 */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-indigo-500 text-white text-xs font-medium rounded-full">
                  무료
                </span>
                <span className="text-neutral-400 text-sm">{course.instructor}</span>
              </div>
              
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-neutral-300 mb-6">{course.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-neutral-400 mb-8">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.totalSessions} 세션</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>약 {course.totalSessions * 20}분</span>
                </div>
              </div>
              
              <button
                onClick={() => handleStartSession(course.sessions[0].id)}
                className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                {isLoggedIn ? '학습 시작하기' : '로그인 후 시작'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 커리큘럼 */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">커리큘럼</h2>
        
        <div className="space-y-3">
          {course.sessions.map((session: any, index: number) => (
            <div
              key={session.id}
              className="border border-neutral-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedSession(expandedSession === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-medium text-sm">
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-neutral-900">{session.title}</h3>
                    <p className="text-sm text-neutral-500">{session.summary}</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-neutral-400 transition-transform ${
                  expandedSession === index ? 'rotate-90' : ''
                }`} />
              </button>
              
              {expandedSession === index && (
                <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-neutral-700 mb-2">학습 내용</h4>
                    <ul className="space-y-1">
                      {session.concepts?.map((concept: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                          <Check className="w-4 h-4 text-emerald-500" />
                          {concept}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {session.examples && session.examples.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-neutral-700 mb-2">예시 프롬프트</h4>
                      <div className="space-y-2">
                        {session.examples.map((example: any, i: number) => (
                          <div key={i} className="p-3 bg-white rounded-lg border border-neutral-200">
                            <span className="text-xs text-indigo-600 font-medium">{example.label}</span>
                            <p className="text-sm text-neutral-700 mt-1">{example.prompt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleStartSession(session.id)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    이 세션 학습하기
                  </button>
                </div>
              )}
            </div>
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
