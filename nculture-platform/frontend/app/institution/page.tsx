'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, BookOpen, Zap, TrendingUp, Search, Plus, 
  MoreVertical, Check, X, Clock, AlertCircle, Download,
  Building, Settings, ChevronDown, Filter
} from 'lucide-react';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/components/AuthProvider';
import { 
  INSTITUTION_DATA, 
  INSTITUTION_INSTRUCTORS, 
  INSTITUTION_STUDENTS, 
  INSTITUTION_CLASSES,
  CREDIT_DISTRIBUTION_HISTORY
} from '@/lib/data';

export default function InstitutionAdminPage() {
  const router = useRouter();
  const { user, profile, isLoggedIn, wallet, login, logout, isLoading, isAdmin } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [institution, setInstitution] = useState(INSTITUTION_DATA);
  const [instructors, setInstructors] = useState(INSTITUTION_INSTRUCTORS);
  const [students, setStudents] = useState(INSTITUTION_STUDENTS);
  const [classes, setClasses] = useState(INSTITUTION_CLASSES);

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

  // 통계 계산
  const stats = {
    totalInstructors: instructors.filter(i => i.status === 'active').length,
    totalStudents: students.filter(s => s.status === 'active').length,
    totalClasses: classes.filter(c => c.status === 'active').length,
    creditUsage: Math.round((institution.usedCredits / institution.creditPool) * 100),
    revenue: institution.stats.totalRevenue,
    completionRate: institution.stats.completionRate,
  };

  // 승인 대기 중인 항목 수
  const pendingInstructors = instructors.filter(i => i.status === 'pending').length;
  const pendingClasses = classes.filter(c => c.approvalStatus === 'pending').length;

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

  // 데모 모드에서는 모든 사용자 접근 허용 (admin@test.com으로 로그인하면 기관관리자)
  // 프로덕션에서는 isAdmin 체크 필요

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

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Building className="w-7 h-7 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{institution.name}</h1>
              <p className="text-sm text-neutral-500">기관 관리 대시보드</p>
            </div>
          </div>
          <button className="p-2 hover:bg-neutral-100 rounded-lg">
            <Settings className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-8 border-b border-neutral-200">
          {[
            { id: 'overview', label: '개요', icon: TrendingUp },
            { id: 'instructors', label: '교육자', icon: Users, badge: pendingInstructors },
            { id: 'students', label: '수강생', icon: Users },
            { id: 'classes', label: '클래스', icon: BookOpen, badge: pendingClasses },
            { id: 'credits', label: '크레딧', icon: Zap },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 개요 탭 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-neutral-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-violet-600" />
                  </div>
                  <span className="text-sm text-neutral-500">활성 교육자</span>
                </div>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalInstructors}명</p>
              </div>
              <div className="bg-white rounded-xl border border-neutral-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-sm text-neutral-500">활성 수강생</span>
                </div>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalStudents}명</p>
              </div>
              <div className="bg-white rounded-xl border border-neutral-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-sm text-neutral-500">진행 중 클래스</span>
                </div>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalClasses}개</p>
              </div>
              <div className="bg-white rounded-xl border border-neutral-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-sm text-neutral-500">크레딧 사용률</span>
                </div>
                <p className="text-2xl font-bold text-neutral-900">{stats.creditUsage}%</p>
              </div>
            </div>

            {/* 크레딧 현황 */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">크레딧 풀 현황</h3>
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-sm text-neutral-500">총 보유</p>
                  <p className="text-2xl font-bold text-neutral-900">{institution.creditPool.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">사용</p>
                  <p className="text-2xl font-bold text-indigo-600">{institution.usedCredits.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">남은 크레딧</p>
                  <p className="text-2xl font-bold text-emerald-600">{(institution.creditPool - institution.usedCredits).toLocaleString()}</p>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-neutral-100 rounded-full">
                    <div 
                      className="h-4 bg-indigo-500 rounded-full"
                      style={{ width: `${stats.creditUsage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 승인 대기 */}
            {(pendingInstructors > 0 || pendingClasses > 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h3 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  승인 대기 중
                </h3>
                <div className="flex gap-6">
                  {pendingInstructors > 0 && (
                    <button 
                      onClick={() => setActiveTab('instructors')}
                      className="text-amber-700 hover:underline"
                    >
                      교육자 승인 대기: {pendingInstructors}건
                    </button>
                  )}
                  {pendingClasses > 0 && (
                    <button 
                      onClick={() => setActiveTab('classes')}
                      className="text-amber-700 hover:underline"
                    >
                      클래스 승인 대기: {pendingClasses}건
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 교육자 탭 */}
        {activeTab === 'instructors' && (
          <div className="bg-white rounded-xl border border-neutral-200">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="교육자 검색..."
                  className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                교육자 초대
              </button>
            </div>
            
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-sm text-neutral-500">
                  <th className="px-4 py-3 font-medium">이름</th>
                  <th className="px-4 py-3 font-medium">이메일</th>
                  <th className="px-4 py-3 font-medium">상태</th>
                  <th className="px-4 py-3 font-medium">클래스</th>
                  <th className="px-4 py-3 font-medium">수강생</th>
                  <th className="px-4 py-3 font-medium">크레딧</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {instructors.map(instructor => (
                  <tr key={instructor.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: instructor.avatar }}
                        >
                          {instructor.name.charAt(0)}
                        </div>
                        <span className="font-medium text-neutral-900">{instructor.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-500">{instructor.email}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        instructor.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {instructor.status === 'active' ? '활성' : '대기'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-700">{instructor.classCount}개</td>
                    <td className="px-4 py-4 text-sm text-neutral-700">{instructor.studentCount}명</td>
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      {instructor.creditsUsed.toLocaleString()} / {instructor.creditsAllocated.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      {instructor.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-emerald-100 rounded text-emerald-600">
                            <Check className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-red-100 rounded text-red-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button className="p-1 hover:bg-neutral-100 rounded">
                          <MoreVertical className="w-4 h-4 text-neutral-400" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 수강생 탭 */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl border border-neutral-200">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="수강생 검색..."
                  className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm hover:bg-neutral-200 flex items-center gap-2">
                <Download className="w-4 h-4" />
                내보내기
              </button>
            </div>
            
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-sm text-neutral-500">
                  <th className="px-4 py-3 font-medium">이름</th>
                  <th className="px-4 py-3 font-medium">이메일</th>
                  <th className="px-4 py-3 font-medium">상태</th>
                  <th className="px-4 py-3 font-medium">수강</th>
                  <th className="px-4 py-3 font-medium">진도</th>
                  <th className="px-4 py-3 font-medium">크레딧</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-4">
                      <span className="font-medium text-neutral-900">{student.name}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-500">{student.email}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {student.status === 'active' ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      {student.completedClasses}/{student.enrolledClasses}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-neutral-100 rounded-full">
                          <div 
                            className="h-2 bg-indigo-500 rounded-full"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-500">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      {student.creditsUsed.toLocaleString()} / {student.creditsAllocated.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 클래스 탭 */}
        {activeTab === 'classes' && (
          <div className="bg-white rounded-xl border border-neutral-200">
            <div className="p-4 border-b border-neutral-200">
              <div className="relative inline-block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="클래스 검색..."
                  className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-sm text-neutral-500">
                  <th className="px-4 py-3 font-medium">클래스</th>
                  <th className="px-4 py-3 font-medium">교육자</th>
                  <th className="px-4 py-3 font-medium">상태</th>
                  <th className="px-4 py-3 font-medium">승인</th>
                  <th className="px-4 py-3 font-medium">수강생</th>
                  <th className="px-4 py-3 font-medium">수익</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {classes.map(cls => (
                  <tr key={cls.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-4">
                      <span className="font-medium text-neutral-900">{cls.title}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-500">{cls.instructor}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cls.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700'
                          : cls.status === 'scheduled'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {cls.status === 'active' ? '진행중' : cls.status === 'scheduled' ? '예정' : '초안'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cls.approvalStatus === 'approved' 
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {cls.approvalStatus === 'approved' ? '승인됨' : '대기'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-700">{cls.students}명</td>
                    <td className="px-4 py-4 text-sm text-neutral-700">₩{cls.revenue.toLocaleString()}</td>
                    <td className="px-4 py-4">
                      {cls.approvalStatus === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-emerald-100 rounded text-emerald-600">
                            <Check className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-red-100 rounded text-red-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button className="p-1 hover:bg-neutral-100 rounded">
                          <MoreVertical className="w-4 h-4 text-neutral-400" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 크레딧 탭 */}
        {activeTab === 'credits' && (
          <div className="space-y-6">
            {/* 크레딧 배분 현황 */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-neutral-900">크레딧 배분 내역</h3>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  크레딧 배분
                </button>
              </div>
              
              <div className="space-y-3">
                {CREDIT_DISTRIBUTION_HISTORY.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-neutral-100 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.type === 'allocate' ? 'bg-indigo-100 text-indigo-600' :
                        item.type === 'recharge' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{item.target}</p>
                        <p className="text-sm text-neutral-500">{item.note}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${item.amount > 0 ? 'text-emerald-600' : 'text-neutral-900'}`}>
                        {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-neutral-400">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
