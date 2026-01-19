'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Zap, CreditCard, BookOpen, Settings, LogOut, 
  ChevronRight, TrendingUp, Clock, Award, Bell, Crown
} from 'lucide-react';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import PlanModal from '@/components/PlanModal';
import { useAuth } from '@/components/AuthProvider';

// Mock 학습 기록
const LEARNING_HISTORY = [
  { id: 1, title: '프롬프트로 AI 영상 만들기', progress: 80, lastAccessed: '2일 전' },
  { id: 2, title: 'AI 콘텐츠 창작 입문 A to Z', progress: 45, lastAccessed: '1주일 전' },
];

// Mock 크레딧 내역
const CREDIT_HISTORY = [
  { id: 1, type: 'usage', amount: -15, description: 'Sora 영상 생성', date: '오늘' },
  { id: 2, type: 'usage', amount: -8, description: 'DALL-E 이미지 생성', date: '어제' },
  { id: 3, type: 'bonus', amount: 100, description: '신규 가입 보너스', date: '3일 전' },
];

// 요금제
const PRICING_PLANS: Record<string, { name: string; monthlyCredits: number; price: number }> = {
  free: { name: 'Free', monthlyCredits: 50, price: 0 },
  basic: { name: 'Basic', monthlyCredits: 500, price: 15000 },
  pro: { name: 'Pro', monthlyCredits: 2000, price: 45000 },
  max: { name: 'Max', monthlyCredits: 5000, price: 99000 },
};

export default function MyPage() {
  const router = useRouter();
  const { user, profile, isLoggedIn, wallet, login, logout, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState('overview');

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogin = (userData: any) => {
    login(userData);
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">로딩 중...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    router.push('/');
    return null;
  }

  const userPlan = profile?.plan || 'free';
  const currentPlan = PRICING_PLANS[userPlan];

  return (
    <div className="min-h-screen bg-neutral-50 pt-24">
      <Header 
        isLoggedIn={isLoggedIn}
        user={user}
        profile={profile}
        wallet={wallet}
        onAuthClick={handleAuthClick}
        onLogout={handleLogout}
      />

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex gap-8">
          {/* 사이드바 */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-6">
              {/* 프로필 */}
              <div className="text-center mb-6">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 ${
                  profile?.role === 'instructor' 
                    ? 'bg-gradient-to-br from-violet-500 to-violet-600' 
                    : 'bg-gradient-to-br from-indigo-500 to-indigo-600'
                }`}>
                  {profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <h2 className="font-semibold text-neutral-900">{profile?.name || user?.email?.split('@')[0]}</h2>
                <p className="text-sm text-neutral-500">{user?.email}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  profile?.role === 'instructor' 
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {profile?.role === 'instructor' ? '👨‍🏫 교육자' : '👨‍🎓 수강생'}
                </span>
              </div>
              
              {/* 크레딧 */}
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl p-4 text-white mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm opacity-90">보유 크레딧</span>
                </div>
                <div className="text-2xl font-bold">{wallet.balance.toLocaleString()}</div>
              </div>
              
              {/* 요금제 */}
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                <div>
                  <p className="text-xs text-neutral-500">현재 요금제</p>
                  <p className="font-semibold text-neutral-900 flex items-center gap-1">
                    {userPlan !== 'free' && <Crown className="w-4 h-4 text-amber-500" />}
                    {currentPlan?.name}
                  </p>
                </div>
                <button 
                  onClick={() => setShowPlanModal(true)}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  {userPlan === 'free' ? '업그레이드' : '플랜 변경'}
                </button>
              </div>
            </div>
            
            {/* 메뉴 */}
            <nav className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              {[
                { id: 'overview', label: '개요', icon: User },
                { id: 'learning', label: '학습 현황', icon: BookOpen },
                { id: 'credits', label: '크레딧', icon: CreditCard },
                { id: 'settings', label: '설정', icon: Settings },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    activeTab === item.id 
                      ? 'bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600' 
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-neutral-900">안녕하세요, {profile?.name || '사용자'}님!</h1>
                
                {/* 통계 카드 */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border border-neutral-200 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                      </div>
                      <span className="text-sm text-neutral-500">수강 중</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">2개</p>
                  </div>
                  <div className="bg-white rounded-xl border border-neutral-200 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="text-sm text-neutral-500">완료</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">5개</p>
                  </div>
                  <div className="bg-white rounded-xl border border-neutral-200 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="text-sm text-neutral-500">이번 달 사용</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">230</p>
                  </div>
                </div>

                {/* 최근 학습 */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                  <h3 className="font-semibold text-neutral-900 mb-4">최근 학습</h3>
                  <div className="space-y-3">
                    {LEARNING_HISTORY.map(course => (
                      <Link
                        key={course.id}
                        href={`/courses/course${course.id}`}
                        className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900">{course.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-2 bg-neutral-200 rounded-full max-w-xs">
                              <div 
                                className="h-2 bg-indigo-500 rounded-full"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-neutral-500">{course.progress}%</span>
                          </div>
                        </div>
                        <div className="text-sm text-neutral-400 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.lastAccessed}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'learning' && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-6">학습 현황</h2>
                <div className="space-y-4">
                  {LEARNING_HISTORY.map(course => (
                    <div key={course.id} className="p-4 border border-neutral-200 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-neutral-900">{course.title}</h3>
                        <span className="text-sm text-neutral-500">{course.lastAccessed}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-neutral-100 rounded-full">
                          <div 
                            className="h-2 bg-indigo-500 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-indigo-600">{course.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'credits' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-neutral-900">크레딧 내역</h2>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      크레딧 충전
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {CREDIT_HISTORY.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 border-b border-neutral-100 last:border-0">
                        <div>
                          <p className="font-medium text-neutral-900">{item.description}</p>
                          <p className="text-sm text-neutral-500">{item.date}</p>
                        </div>
                        <span className={`font-semibold ${
                          item.amount > 0 ? 'text-emerald-600' : 'text-neutral-900'
                        }`}>
                          {item.amount > 0 ? '+' : ''}{item.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-6">설정</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-neutral-400" />
                      <span className="font-medium">알림 설정</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-neutral-400" />
                      <span className="font-medium">프로필 수정</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-400" />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-4 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">로그아웃</span>
                  </button>
                </div>
              </div>
            )}
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
