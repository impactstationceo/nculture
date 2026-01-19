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
      className="bg-neutral-900 rounded-2xl overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={course.thumbnail} 
          alt={course.title} 
          className="w-full aspect-[4/3] object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-neutral-900/50" />
        
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {serviceIcons.map((icon, i) => (
            <div 
              key={i}
              className="w-8 h-8 bg-black/40 backdrop-blur-sm rounded-lg flex items-center justify-center text-sm border border-white/20"
            >
              {icon}
            </div>
          ))}
        </div>
        
        <div className="absolute top-3 right-3 w-12 h-12 border border-white/20 rounded-lg" />
      </div>
      
      <div className="p-4">
        <h3 className="text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
          {course.title}
        </h3>
        
        <div className="text-lg font-bold text-white mb-1">무료</div>
        
        <div className="flex items-center gap-1 text-sm text-neutral-400 mb-3">
          <span className="text-amber-400">★</span>
          <span>후기 {12 + course.totalSessions * 3}개</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>총 {course.totalSessions} 세션</span>
          <span className="w-1 h-1 bg-neutral-600 rounded-full" />
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

      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">클래스</h1>
          <p className="text-neutral-600">체계적인 AI 콘텐츠 창작 학습 과정</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
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
