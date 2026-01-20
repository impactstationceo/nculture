'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { CURRICULUM } from '@/lib/data';
import { getCourses } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

const CourseCard = ({ course, onClick }: { course: any; onClick: () => void }) => {
  const serviceIcons = ['🎬', '🎵', '🎯', '⚡'];
  
  return (
    <div 
      className="bg-white rounded-3xl overflow-hidden border border-[#E5E8EB] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={course.thumbnail} 
          alt={course.title} 
          className="w-full aspect-[4/3] object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
        
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {serviceIcons.map((icon, i) => (
            <div 
              key={i}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-sm border border-[#E5E8EB] shadow-sm"
            >
              {icon}
            </div>
          ))}
        </div>
        
        <div className="absolute top-3 right-3 w-12 h-12 border border-[#E5E8EB] rounded-lg" />
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-semibold text-[#191F28] mb-2 line-clamp-2 group-hover:text-[#3182F6] transition-colors tracking-tight">
          {course.title}
        </h3>
        
        <div className="text-lg font-bold text-[#191F28] mb-1">무료</div>
        
        <div className="flex items-center gap-1 text-sm text-[#6B7684] mb-4">
          <span className="text-[#FF9100]">★</span>
          <span>후기 {12 + course.totalSessions * 3}개</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-[#8B95A1]">
          <span>총 {course.totalSessions} 세션</span>
          <span className="w-1 h-1 bg-[#E5E8EB] rounded-full" />
          <span>{course.instructor}</span>
        </div>
      </div>
    </div>
  );
};

export default function CurriculumPage() {
  const router = useRouter();
  const { isLoggedIn, user, viewMode, currentRole, wallet, userPlan, handleAuthClick, handleLogout, setCurrentPage, handleRoleSwitch, currentPage } = useAuth();
  const [courses, setCourses] = useState<any[]>(Object.values(CURRICULUM));
  const totalSessions = courses.reduce((sum, course) => sum + Number(course.totalSessions || 0), 0);
  const totalReviews = courses.reduce((sum, course) => sum + (12 + Number(course.totalSessions || 0) * 3), 0);

  useEffect(() => {
    let isActive = true;
    getCourses()
      .then((data) => {
        if (isActive && Array.isArray(data)) {
          setCourses(data);
        }
      })
      .catch((error) => {
        console.error('Failed to load courses:', error);
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
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-[#E8F3FF] via-white to-[#F9FAFB] rounded-3xl" />
          <div className="relative bg-white/90 border border-[#E5E8EB] rounded-3xl p-8 shadow-md backdrop-blur">
            <h1 className="text-4xl font-bold text-[#191F28] mb-2 tracking-tight">클래스</h1>
            <p className="text-[#6B7684] mb-6">체계적인 AI 콘텐츠 창작 학습 과정</p>
            <div className="flex flex-wrap gap-3 mb-6">
              {['영상', '이미지', '프롬프트', '라이브 실습', '평가'].map((tag) => (
                <span key={tag} className="px-3 py-1.5 bg-white border border-[#E5E8EB] rounded-full text-sm text-[#6B7684]">
                  {tag}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-[#E5E8EB] rounded-2xl p-4 shadow-sm">
                <div className="text-xs text-[#8B95A1] mb-1">총 클래스</div>
                <div className="text-2xl font-bold text-[#191F28]">{courses.length}개</div>
              </div>
              <div className="bg-white border border-[#E5E8EB] rounded-2xl p-4 shadow-sm">
                <div className="text-xs text-[#8B95A1] mb-1">총 세션</div>
                <div className="text-2xl font-bold text-[#3182F6]">{totalSessions}개</div>
              </div>
              <div className="bg-white border border-[#E5E8EB] rounded-2xl p-4 shadow-sm">
                <div className="text-xs text-[#8B95A1] mb-1">누적 후기</div>
                <div className="text-2xl font-bold text-[#FF9100]">{totalReviews.toLocaleString()}+</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {courses.map((course: any) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => router.push(`/courses/${course.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
