'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronRight, User, BookOpen } from 'lucide-react';
import Header from '@/components/Header';
import { CURRICULUM } from '@/lib/data';
import { getCourse } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [course, setCourse] = useState<any>((CURRICULUM as any)[courseId || '']);

  const { isLoggedIn, user, viewMode, currentRole, wallet, userPlan, handleAuthClick, handleLogout, setCurrentPage, handleRoleSwitch, currentPage } = useAuth();

  useEffect(() => {
    if (!courseId) return;
    let isActive = true;

    getCourse(courseId)
      .then((data) => {
        if (isActive && data) {
          setCourse(data);
        }
      })
      .catch((error) => {
        console.error('Failed to load course:', error);
      });

    return () => {
      isActive = false;
    };
  }, [courseId]);

  if (!course) return null;

  const handleStartSession = (sessionId: number) => {
    if (isLoggedIn) {
      router.push(`/session/${sessionId}`);
    } else {
      handleAuthClick('login');
    }
  };

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
        <button 
          onClick={() => router.push('/curriculum')}
          className="flex items-center gap-2 text-[#6B7684] hover:text-[#191F28] mb-8 transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span className="text-sm">전체 클래스</span>
        </button>

        <div className="bg-white border border-[#E5E8EB] rounded-3xl p-8 md:p-10 shadow-sm mb-12">
          <div className="flex gap-8">
            <div className="w-96 flex-shrink-0">
              <div className="w-full aspect-video rounded-2xl border border-[#E5E8EB] bg-[#F2F4F6] overflow-hidden">
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-[#191F28] mb-3 tracking-tight">
                {course.title}
              </h1>
              <p className="text-[#6B7684] leading-relaxed mb-5">{course.description}</p>
              <div className="flex items-center gap-4 text-sm text-[#8B95A1] mb-7">
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
                className="px-8 py-3 bg-[#3182F6] text-white font-semibold rounded-xl shadow-sm hover:bg-[#1B64DA] transition-colors"
              >
                {isLoggedIn ? '학습 시작하기' : '로그인하고 시작하기'}
              </button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#191F28] mb-5">
            커리큘럼 ({course.sessions.length}개 세션)
          </h2>
          <div className="space-y-4">
            {course.sessions.map((session: any, index: number) => (
              <div 
                key={session.id}
                className="bg-white border border-[#E5E8EB] rounded-2xl p-5 hover:shadow-sm transition-shadow cursor-pointer group"
                onClick={() => handleStartSession(session.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#E8F3FF] rounded-lg flex items-center justify-center text-sm font-bold text-[#3182F6] group-hover:bg-[#3182F6] group-hover:text-white transition-colors">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#191F28] mb-1">{session.title}</h3>
                    <p className="text-sm text-[#6B7684]">{session.summary}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#8B95A1] group-hover:text-[#3182F6] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
