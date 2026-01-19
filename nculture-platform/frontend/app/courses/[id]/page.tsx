'use client';

import { useParams, useRouter } from 'next/navigation';
import { ChevronRight, User, BookOpen } from 'lucide-react';
import Header from '@/components/Header';
import { CURRICULUM } from '@/lib/data';
import { useAuth } from '@/components/AuthProvider';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const course = (CURRICULUM as any)[courseId || ''];

  const { isLoggedIn, user, viewMode, currentRole, wallet, userPlan, handleAuthClick, handleLogout, setCurrentPage, handleRoleSwitch, currentPage } = useAuth();

  if (!course) return null;

  const handleStartSession = (sessionId: number) => {
    if (isLoggedIn) {
      router.push(`/session/${sessionId}`);
    } else {
      handleAuthClick('login');
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
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

      <div className="max-w-6xl mx-auto px-8">
        <button 
          onClick={() => router.push('/curriculum')}
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-8 transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span className="text-sm">전체 클래스</span>
        </button>

        <div className="flex gap-8 mb-12">
          <div className="w-96 flex-shrink-0">
            <img 
              src={course.thumbnail} 
              alt={course.title} 
              className="w-full aspect-video object-cover rounded-2xl"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-neutral-900 mb-3">{course.title}</h1>
            <p className="text-neutral-600 mb-4">{course.description}</p>
            <div className="flex items-center gap-4 text-sm text-neutral-500 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {course.instructor}
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                총 {course.totalSessions}세션
              </div>
            </div>
            <button 
              onClick={() => handleStartSession(course.sessions[0].id)}
              className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
            >
              {isLoggedIn ? '학습 시작하기' : '로그인하고 시작하기'}
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-6">커리큘럼 ({course.sessions.length}개 세션)</h2>
          <div className="space-y-4">
            {course.sessions.map((session: any, index: number) => (
              <div 
                key={session.id}
                className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => handleStartSession(session.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-sm font-bold text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 mb-1">{session.title}</h3>
                    <p className="text-sm text-neutral-500">{session.summary}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
