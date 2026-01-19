'use client';

import Header from '@/components/Header';
import { useAuth } from '@/components/AuthProvider';
import { BookOpen, Clock, Play, User } from 'lucide-react';

const DashboardPageContent = ({ user, currentRole, setCurrentPage }: any) => {
  const effectiveRole = currentRole || user?.role;
  const isInstructor = effectiveRole === 'instructor';
  const isPending = user?.status === 'pending';
  
  if (user?.role === 'instructor' && isPending) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-16">
        <div className="max-w-2xl mx-auto px-8 py-16">
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-3">승인 대기 중</h1>
            <p className="text-neutral-600 mb-6">
              교육자 계정 승인을 기다리고 있습니다.<br />
              관리자 승인 후 클래스 생성 및 학생 관리 기능을 이용할 수 있습니다.
            </p>
            <div className="bg-neutral-50 rounded-xl p-4 mb-6">
              <div className="text-sm text-neutral-500 mb-2">예상 승인 소요 시간</div>
              <div className="text-lg font-semibold text-neutral-900">영업일 기준 1-2일</div>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-neutral-500">
                승인이 완료되면 등록된 이메일로 알림을 보내드립니다.
              </p>
              <p className="text-sm text-neutral-500">
                문의사항은 <span className="text-indigo-600">support@nculture.com</span>으로 연락주세요.
              </p>
            </div>
          </div>
          
          <div className="mt-8 bg-white rounded-2xl border border-neutral-200 p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">승인 대기 중에도 이용 가능한 기능</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                </div>
                <span>다른 강의 둘러보기 및 수강</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-indigo-600" />
                </div>
                <span>AI 실습 체험해보기</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-violet-600" />
                </div>
                <span>프로필 설정 완료하기</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isInstructor) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-16">
        <div className="max-w-2xl mx-auto px-8 py-16">
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
            <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-violet-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-3">마이페이지로 이동하세요</h1>
            <p className="text-neutral-600 mb-6">
              클래스 관리, 학생 현황, 크레딧, 구독 정보를<br />
              마이페이지에서 확인할 수 있습니다.
            </p>
            <button
              onClick={() => setCurrentPage && setCurrentPage('mypage')}
              className="px-6 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors"
            >
              마이페이지로 이동 →
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-50 pt-16">
      <div className="max-w-2xl mx-auto px-8 py-16">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">마이페이지로 이동하세요</h1>
          <p className="text-neutral-600 mb-6">
            학습 현황, 크레딧, 구독 정보를<br />
            마이페이지에서 확인할 수 있습니다.
          </p>
          <button
            onClick={() => setCurrentPage && setCurrentPage('mypage')}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            마이페이지로 이동 →
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { isLoggedIn, user, viewMode, currentRole, wallet, userPlan, handleAuthClick, handleLogout, setCurrentPage, handleRoleSwitch, currentPage } = useAuth();

  return (
    <>
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
      <DashboardPageContent user={user} currentRole={currentRole} setCurrentPage={setCurrentPage} />
    </>
  );
}
