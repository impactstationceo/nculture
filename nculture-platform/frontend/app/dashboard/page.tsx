'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, Zap, TrendingUp, Clock, Play, Award, 
  ChevronRight, ArrowRight, Video, Target
} from 'lucide-react';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import PlanModal from '@/components/PlanModal';
import { useAuth } from '@/components/AuthProvider';
import { CURRICULUM, LIVE_CLASSES } from '@/lib/data';

// Mock 학습 기록
const LEARNING_PROGRESS = [
  { id: 'course1', courseId: 'course1', progress: 75, lastSession: '프롬프트 구조화', lastAccessed: '2시간 전' },
  { id: 'course2', courseId: 'course2', progress: 30, lastSession: '참조 이미지 활용', lastAccessed: '3일 전' },
];

// Mock 최근 생성물
const RECENT_CREATIONS = [
  { id: 1, type: 'video', service: 'Sora', thumbnail: '', prompt: '일출 장면의 시네마틱 영상', credits: 15, date: '오늘' },
  { id: 2, type: 'image', service: 'DALL-E', thumbnail: '', prompt: '미래도시 컨셉아트', credits: 5, date: '어제' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, isLoggedIn, wallet, login, logout, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogin = (userData: any) => {
    login(userData);
    setShowAuthModal(false);
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">로딩 중...</div>
      </div>
    );
  }

  // 로그인 안 된 경우 메인으로
  if (!isLoggedIn) {
    router.push('/');
    return null;
  }

  const courses = Object.values(CURRICULUM);
  const upcomingLive = LIVE_CLASSES.filter(c => c.status === 'upcoming' || c.status === 'live')[0];

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
        {/* 환영 메시지 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            안녕하세요, {profile?.name || '사용자'}님! 👋
          </h1>
          <p className="text-neutral-600 mt-2">오늘도 AI 콘텐츠 창작을 시작해보세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <p className="text-sm text-neutral-500 mb-1">수강 중인 클래스</p>
                <p className="text-2xl font-bold text-neutral-900">{LEARNING_PROGRESS.length}개</p>
              </div>
              <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <p className="text-sm text-neutral-500 mb-1">완료한 세션</p>
                <p className="text-2xl font-bold text-neutral-900">12개</p>
              </div>
              <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                    <Video className="w-5 h-5 text-violet-600" />
                  </div>
                </div>
                <p className="text-sm text-neutral-500 mb-1">생성한 콘텐츠</p>
                <p className="text-2xl font-bold text-neutral-900">24개</p>
              </div>
            </div>

            {/* 학습 이어하기 */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">학습 이어하기</h2>
                <Link href="/curriculum" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                  전체 보기 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {LEARNING_PROGRESS.map(item => {
                  const course = courses.find(c => c.id === item.courseId);
                  if (!course) return null;
                  
                  return (
                    <Link
                      key={item.id}
                      href={`/courses/${item.courseId}`}
                      className="block p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-neutral-900">{course.title}</h3>
                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.lastAccessed}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500 mb-3">
                        마지막 학습: {item.lastSession}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-neutral-200 rounded-full">
                          <div 
                            className="h-2 bg-indigo-500 rounded-full transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-indigo-600">{item.progress}%</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {LEARNING_PROGRESS.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500 mb-4">아직 수강 중인 클래스가 없습니다</p>
                  <Link href="/curriculum" className="text-indigo-600 hover:underline">
                    클래스 둘러보기 →
                  </Link>
                </div>
              )}
            </div>

            {/* 최근 생성물 */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">최근 생성물</h2>
                <Link href="/media" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                  전체 보기 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {RECENT_CREATIONS.map(item => (
                  <div 
                    key={item.id}
                    className="bg-neutral-50 rounded-xl overflow-hidden hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <div className="aspect-video bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                      {item.type === 'video' ? (
                        <Play className="w-8 h-8 text-white/80" />
                      ) : (
                        <Video className="w-8 h-8 text-white/80" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-neutral-700 line-clamp-1">{item.prompt}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-neutral-400">
                        <span>{item.service}</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 사이드바 */}
          <div className="space-y-6">
            {/* 크레딧 카드 */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5" />
                <span className="text-sm opacity-90">보유 크레딧</span>
              </div>
              <p className="text-3xl font-bold mb-4">{wallet.balance.toLocaleString()}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-80">
                  {profile?.plan === 'pro' ? 'Pro' : profile?.plan === 'max' ? 'Max' : profile?.plan === 'basic' ? 'Basic' : 'Free'} 플랜
                </span>
                <button 
                  onClick={() => setShowPlanModal(true)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  업그레이드
                </button>
              </div>
            </div>

            {/* 다가오는 라이브 */}
            {upcomingLive && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  다가오는 라이브
                </h3>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <h4 className="font-medium text-neutral-900 mb-2">{upcomingLive.title}</h4>
                  <p className="text-sm text-neutral-500 mb-3">{upcomingLive.instructor}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">{upcomingLive.startTime}</span>
                    <Link
                      href={`/live/${upcomingLive.id}`}
                      className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                    >
                      {upcomingLive.status === 'live' ? '입장하기' : '알림 받기'}
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* 추천 클래스 */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">추천 클래스</h3>
              <div className="space-y-3">
                {courses.slice(0, 2).map(course => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="block p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                  >
                    <h4 className="font-medium text-neutral-900 text-sm line-clamp-1">{course.title}</h4>
                    <p className="text-xs text-neutral-500 mt-1">{course.totalSessions}개 세션</p>
                  </Link>
                ))}
              </div>
              <Link 
                href="/curriculum"
                className="block text-center text-sm text-indigo-600 hover:underline mt-4"
              >
                더 많은 클래스 보기 →
              </Link>
            </div>

            {/* 퀵 액션 */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">빠른 시작</h3>
              <div className="space-y-2">
                <Link
                  href="/session/1"
                  className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Video className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium text-indigo-700">AI 영상 생성하기</span>
                </Link>
                <Link
                  href="/assessment"
                  className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-emerald-700">테스트 응시하기</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onLogin={handleLogin}
      />

      <PlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
      />
    </div>
  );
}
