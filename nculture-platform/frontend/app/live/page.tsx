'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Zap, MessageSquare } from 'lucide-react';
import Header from '@/components/Header';
import { LIVE_CLASSES } from '@/lib/data';
import { getLiveClasses } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

const LiveClassCard = ({ liveClass, onJoin, isLoggedIn, onAuthClick }: any) => {
  const getStatusBadge = () => {
    const badges: Record<string, { label: string; color: string }> = {
      live: { label: 'LIVE', color: 'bg-[#F44336] text-white animate-pulse' },
      upcoming: { label: '예정', color: 'bg-[#3182F6] text-white' },
      replay: { label: '다시보기', color: 'bg-[#F2F4F6] text-[#6B7684]' }
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
      alert('알림 설정 완료! (데모)');
      return;
    }
    onJoin(liveClass.id);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E8EB] hover:shadow-md transition-all">
      <div className="relative">
        <img 
          src={liveClass.thumbnail} 
          alt={liveClass.title} 
          className="w-full aspect-video object-cover"
        />
        <div className="absolute top-3 left-3">
          {getStatusBadge()}
        </div>
        <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
          {liveClass.duration}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-[#191F28] mb-2 line-clamp-2">{liveClass.title}</h3>
        <p className="text-sm text-[#6B7684] mb-3">{liveClass.instructor}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#8B95A1]">{liveClass.startTime}</span>
          <button 
            onClick={handleClick}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              liveClass.status === 'live' 
                ? 'bg-[#F44336] text-white hover:bg-[#D32F2F]' 
                : liveClass.status === 'upcoming'
                  ? 'bg-[#3182F6] text-white hover:bg-[#1B64DA]'
                  : 'bg-[#F2F4F6] text-[#6B7684] hover:bg-[#E5E8EB]'
            }`}
          >
            {liveClass.status === 'live' ? '입장하기' : liveClass.status === 'upcoming' ? '알림 받기' : '다시보기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function LivePage() {
  const router = useRouter();
  const { isLoggedIn, user, viewMode, currentRole, wallet, userPlan, handleAuthClick, handleLogout, setCurrentPage, handleRoleSwitch, currentPage } = useAuth();
  const [liveClasses, setLiveClasses] = useState<any[]>(LIVE_CLASSES);

  useEffect(() => {
    let isActive = true;
    getLiveClasses()
      .then((data) => {
        if (isActive && Array.isArray(data)) {
          setLiveClasses(data);
        }
      })
      .catch((error) => {
        console.error('Failed to load live classes:', error);
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-20 pb-16">
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

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#191F28] mb-3">라이브</h1>
          <p className="text-[#6B7684]">실시간 AI 실습 클래스에 참여하세요</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {liveClasses.map((liveClass) => (
            <LiveClassCard
              key={liveClass.id}
              liveClass={liveClass}
              onJoin={(id: number) => router.push(`/live/${id}`)}
              isLoggedIn={isLoggedIn}
              onAuthClick={handleAuthClick}
            />
          ))}
        </div>

        <div className="mt-16 bg-[#E8F3FF] rounded-2xl p-10">
          <h3 className="text-2xl font-bold text-[#191F28] mb-6">라이브란?</h3>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 border border-[#E5E8EB]">
                <Video className="w-7 h-7 text-[#3182F6]" />
              </div>
              <h4 className="font-semibold text-[#191F28] mb-2">실시간 시연</h4>
              <p className="text-sm text-[#6B7684] leading-relaxed">강사가 AI 도구를 실시간으로 사용하는 모습을 직접 확인</p>
            </div>
            <div>
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 border border-[#E5E8EB]">
                <Zap className="w-7 h-7 text-[#3182F6]" />
              </div>
              <h4 className="font-semibold text-[#191F28] mb-2">동시 실습</h4>
              <p className="text-sm text-[#6B7684] leading-relaxed">강사 프롬프트를 받아 함께 생성하며 학습</p>
            </div>
            <div>
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 border border-[#E5E8EB]">
                <MessageSquare className="w-7 h-7 text-[#3182F6]" />
              </div>
              <h4 className="font-semibold text-[#191F28] mb-2">즉시 질문</h4>
              <p className="text-sm text-[#6B7684] leading-relaxed">실시간 채팅으로 궁금한 점을 바로 해결</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
