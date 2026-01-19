'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, Users, Clock, Bell, Radio } from 'lucide-react';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import { LIVE_CLASSES } from '@/lib/data';
import { useAuth } from '@/components/AuthProvider';

// 라이브 클래스 카드
const LiveClassCard = ({ liveClass, onJoin, isLoggedIn, onAuthClick }: any) => {
  const getStatusBadge = () => {
    const badges: Record<string, { label: string; color: string }> = {
      live: { label: 'LIVE', color: 'bg-red-500 text-white animate-pulse' },
      upcoming: { label: '예정', color: 'bg-indigo-500 text-white' },
      replay: { label: '다시보기', color: 'bg-neutral-500 text-white' }
    };
    const badge = badges[liveClass.status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const handleClick = () => {
    if (liveClass.status === 'upcoming') {
      if (!isLoggedIn) {
        onAuthClick('login');
        return;
      }
      alert('알림이 설정되었습니다.');
      return;
    }
    onJoin(liveClass.id);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all">
      <div className="relative">
        <img 
          src={liveClass.thumbnail} 
          alt={liveClass.title}
          className="w-full aspect-video object-cover"
        />
        <div className="absolute top-3 left-3">
          {getStatusBadge()}
        </div>
        {liveClass.status === 'live' && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
            <Users className="w-3 h-3" />
            {liveClass.participants}
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2">
          {liveClass.title}
        </h3>
        <p className="text-sm text-neutral-500 mb-4">{liveClass.instructor}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Clock className="w-4 h-4" />
            <span>{liveClass.startTime}</span>
            <span>•</span>
            <span>{liveClass.duration}</span>
          </div>
          
          <button
            onClick={handleClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              liveClass.status === 'live'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : liveClass.status === 'upcoming'
                ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {liveClass.status === 'live' ? (
              <>
                <Radio className="w-4 h-4 inline mr-1" />
                입장하기
              </>
            ) : liveClass.status === 'upcoming' ? (
              <>
                <Bell className="w-4 h-4 inline mr-1" />
                알림 받기
              </>
            ) : (
              <>
                <Play className="w-4 h-4 inline mr-1" />
                다시보기
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function LiveStudioPage() {
  const router = useRouter();
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

  const handleJoinClass = (classId: number) => {
    if (!isLoggedIn) {
      handleAuthClick('login');
      return;
    }
    router.push(`/live/${classId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">로딩 중...</div>
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
        {/* 헤더 */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">라이브 스튜디오</h1>
          <p className="text-neutral-600">실시간 강의와 함께 AI 도구를 실습해보세요</p>
        </div>

        {/* 현재 진행 중 */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500" />
            지금 진행 중
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LIVE_CLASSES.filter(c => c.status === 'live').map(liveClass => (
              <LiveClassCard
                key={liveClass.id}
                liveClass={liveClass}
                onJoin={handleJoinClass}
                isLoggedIn={isLoggedIn}
                onAuthClick={handleAuthClick}
              />
            ))}
          </div>
        </section>

        {/* 예정된 라이브 */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            예정된 라이브
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LIVE_CLASSES.filter(c => c.status === 'upcoming').map(liveClass => (
              <LiveClassCard
                key={liveClass.id}
                liveClass={liveClass}
                onJoin={handleJoinClass}
                isLoggedIn={isLoggedIn}
                onAuthClick={handleAuthClick}
              />
            ))}
          </div>
        </section>

        {/* 다시보기 */}
        <section>
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
            <Play className="w-5 h-5 text-neutral-500" />
            다시보기
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LIVE_CLASSES.filter(c => c.status === 'replay').map(liveClass => (
              <LiveClassCard
                key={liveClass.id}
                liveClass={liveClass}
                onJoin={handleJoinClass}
                isLoggedIn={isLoggedIn}
                onAuthClick={handleAuthClick}
              />
            ))}
          </div>
        </section>
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
