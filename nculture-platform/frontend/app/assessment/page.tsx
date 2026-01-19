'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Clock, Users, Play, CheckCircle, Target } from 'lucide-react';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/components/AuthProvider';
import { createPlaceholder } from '@/lib/data';

// Mock 테스트 데이터
const TESTS = [
  {
    id: 1,
    title: "프롬프트 기초 평가",
    description: "AI 영상 생성을 위한 기본 프롬프트 작성 능력을 평가합니다.",
    duration: 30,
    participants: 156,
    difficulty: "초급",
    thumbnail: createPlaceholder('video', '#6366f1'),
    status: 'available'
  },
  {
    id: 2,
    title: "시네마틱 영상 제작 실기",
    description: "카메라 워크와 비주얼 스타일을 활용한 영상 제작 능력을 평가합니다.",
    duration: 45,
    participants: 89,
    difficulty: "중급",
    thumbnail: createPlaceholder('creative', '#7c3aed'),
    status: 'available'
  },
  {
    id: 3,
    title: "멀티모달 AI 활용 종합 평가",
    description: "이미지, 영상, 텍스트 AI를 통합 활용하는 능력을 평가합니다.",
    duration: 60,
    participants: 45,
    difficulty: "고급",
    thumbnail: createPlaceholder('ai', '#059669'),
    status: 'coming_soon'
  }
];

const TestCard = ({ test, onStart, isLoggedIn, onAuthClick }: any) => {
  const handleClick = () => {
    if (test.status === 'coming_soon') return;
    if (!isLoggedIn) {
      onAuthClick('login');
      return;
    }
    onStart(test);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case '초급': return 'bg-emerald-100 text-emerald-700';
      case '중급': return 'bg-amber-100 text-amber-700';
      case '고급': return 'bg-red-100 text-red-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-neutral-200 overflow-hidden ${
      test.status === 'coming_soon' ? 'opacity-60' : 'hover:shadow-lg'
    } transition-all`}>
      <div className="relative">
        <img 
          src={test.thumbnail}
          alt={test.title}
          className="w-full aspect-video object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
            {test.difficulty}
          </span>
        </div>
        {test.status === 'coming_soon' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-4 py-2 bg-black/60 text-white rounded-full text-sm font-medium">
              준비 중
            </span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-neutral-900 mb-2">{test.title}</h3>
        <p className="text-sm text-neutral-500 mb-4 line-clamp-2">{test.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-neutral-400 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{test.duration}분</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{test.participants}명 응시</span>
          </div>
        </div>
        
        <button
          onClick={handleClick}
          disabled={test.status === 'coming_soon'}
          className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
            test.status === 'coming_soon'
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {test.status === 'coming_soon' ? (
            '준비 중'
          ) : (
            <>
              <Play className="w-4 h-4" />
              테스트 시작
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default function AssessmentPage() {
  const { user, profile, isLoggedIn, wallet, login, logout, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTest, setActiveTest] = useState<any>(null);

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogin = (userData: any) => {
    login(userData);
    setShowAuthModal(false);
  };

  const handleStartTest = (test: any) => {
    setActiveTest(test);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">로딩 중...</div>
      </div>
    );
  }

  // 테스트 진행 화면
  if (activeTest) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        {/* 테스트 헤더 */}
        <div className="h-16 bg-neutral-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Target className="w-5 h-5 text-indigo-400" />
            <h1 className="font-medium">{activeTest.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-neutral-400">
              <Clock className="w-4 h-4" />
              <span>{activeTest.duration}:00</span>
            </div>
            <button
              onClick={() => setActiveTest(null)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              종료하기
            </button>
          </div>
        </div>
        
        {/* 테스트 본문 */}
        <div className="max-w-4xl mx-auto py-12 px-8">
          <div className="bg-neutral-800 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">문제 1</h2>
            <p className="text-neutral-300 mb-6">
              다음 시나리오에 맞는 AI 영상 프롬프트를 작성하세요:
            </p>
            <div className="bg-neutral-700 rounded-xl p-4 mb-6">
              <p className="text-neutral-200">
                "일출 시간에 산 정상에서 구름 바다를 내려다보는 등산객의 모습. 
                시네마틱한 분위기로, 카메라가 천천히 뒤로 물러나며 웅장한 풍경을 드러낸다."
              </p>
            </div>
            <textarea
              className="w-full h-40 bg-neutral-700 text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="프롬프트를 작성하세요..."
            />
          </div>
          
          <div className="flex justify-end gap-4">
            <button className="px-6 py-3 bg-neutral-700 text-white rounded-xl hover:bg-neutral-600">
              임시 저장
            </button>
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              제출하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-24">
      <Header 
        isLoggedIn={isLoggedIn}
        user={user}
        profile={profile}
        wallet={wallet}
        onAuthClick={handleAuthClick}
        onLogout={logout}
      />

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">테스트</h1>
          <p className="text-neutral-600">AI 콘텐츠 제작 실력을 평가해보세요</p>
        </div>

        {/* 테스트 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTS.map(test => (
            <TestCard
              key={test.id}
              test={test}
              onStart={handleStartTest}
              isLoggedIn={isLoggedIn}
              onAuthClick={handleAuthClick}
            />
          ))}
        </div>

        {/* 완료한 테스트 */}
        {isLoggedIn && (
          <section className="mt-16">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">완료한 테스트</h2>
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center text-neutral-500">
              아직 완료한 테스트가 없습니다.
            </div>
          </section>
        )}
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
