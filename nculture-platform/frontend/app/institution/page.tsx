'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/components/AuthProvider';
import {
  CREDIT_DISTRIBUTION_HISTORY,
  INSTITUTION_CLASSES,
  INSTITUTION_INSTRUCTORS,
  INSTITUTION_STUDENTS,
} from '@/lib/data';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Image,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Target,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react';

// ============= 기관 관리자 대시보드 컴포넌트 =============
const InstitutionAdminPage = ({ user, institution, setInstitution, setCurrentPage }: any) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [memberFilter, setMemberFilter] = useState('all');
  
  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: BarChart3 },
    { id: 'members', label: '구성원 관리', icon: Users },
    { id: 'classes', label: '클래스 관리', icon: BookOpen },
    { id: 'credits', label: '크레딧 관리', icon: Zap },
    { id: 'settings', label: '설정', icon: Settings }
  ];
  
  const filteredInstructors = INSTITUTION_INSTRUCTORS.filter(i => {
    const matchesSearch = i.name.includes(searchQuery) || i.email.includes(searchQuery);
    const matchesFilter = memberFilter === 'all' || i.status === memberFilter;
    return matchesSearch && matchesFilter;
  });
  
  const filteredStudents = INSTITUTION_STUDENTS.filter(s => {
    const matchesSearch = s.name.includes(searchQuery) || s.email.includes(searchQuery);
    const matchesFilter = memberFilter === 'all' || s.status === memberFilter;
    return matchesSearch && matchesFilter;
  });
  
  const handleAllocateCredits = () => {
    if (!selectedMember || !creditAmount) return;
    // Mock 크레딧 배분
    console.log(`Allocating ${creditAmount} credits to ${selectedMember.name}`);
    setShowCreditModal(false);
    setSelectedMember(null);
    setCreditAmount('');
    setCreditNote('');
  };
  
  // 대시보드 탭
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* 기관 정보 헤더 */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{institution.name}</h1>
                <p className="text-white/80 text-sm">기관 통합 관리자</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/70 text-sm mb-1">기관 크레딧 잔액</div>
            <div className="text-3xl font-bold">{institution.creditPool.toLocaleString()}</div>
          </div>
        </div>
      </div>
      
      {/* 핵심 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: '소속 교육자', value: INSTITUTION_INSTRUCTORS.filter(i => i.status === 'active').length, suffix: '명', icon: User, color: 'violet' },
          { label: '소속 수강생', value: INSTITUTION_STUDENTS.length, suffix: '명', icon: Users, color: 'emerald' },
          { label: '운영 클래스', value: INSTITUTION_CLASSES.filter(c => c.status === 'active').length, suffix: '개', icon: BookOpen, color: 'blue' },
          { label: '총 수익', value: (institution.stats.totalRevenue / 10000).toFixed(0), suffix: '만원', icon: TrendingUp, color: 'amber' },
          { label: '평균 완료율', value: institution.stats.completionRate, suffix: '%', icon: Target, color: 'pink' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${stat.color}-100`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-neutral-900">{stat.value}<span className="text-base font-normal text-neutral-500 ml-1">{stat.suffix}</span></div>
            <div className="text-sm text-neutral-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
      
      {/* 크레딧 현황 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            크레딧 사용 현황
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-600">사용량</span>
                <span className="font-medium">{institution.usedCredits.toLocaleString()} / {institution.creditPool.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                  style={{ width: `${(institution.usedCredits / institution.creditPool) * 100}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-neutral-50 rounded-lg p-3">
                <div className="text-xs text-neutral-500 mb-1">교육자 배분</div>
                <div className="text-lg font-semibold text-neutral-900">
                  {INSTITUTION_INSTRUCTORS.reduce((sum, i) => sum + i.creditsAllocated, 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3">
                <div className="text-xs text-neutral-500 mb-1">수강생 배분</div>
                <div className="text-lg font-semibold text-neutral-900">
                  {INSTITUTION_STUDENTS.reduce((sum, s) => sum + s.creditsAllocated, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 최근 활동 */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            최근 크레딧 변동
          </h3>
          <div className="space-y-3">
            {CREDIT_DISTRIBUTION_HISTORY.slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    item.type === 'allocate' ? 'bg-emerald-100' :
                    item.type === 'recharge' ? 'bg-blue-100' : 'bg-orange-100'
                  }`}>
                    {item.type === 'allocate' ? <ArrowRight className={`w-4 h-4 text-emerald-600`} /> :
                     item.type === 'recharge' ? <Plus className={`w-4 h-4 text-blue-600`} /> :
                     <RefreshCw className={`w-4 h-4 text-orange-600`} />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{item.target}</div>
                    <div className="text-xs text-neutral-500">{item.date}</div>
                  </div>
                </div>
                <div className={`text-sm font-semibold ${item.amount > 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 교육자별 현황 */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900">교육자별 현황</h3>
          <button 
            onClick={() => setActiveTab('members')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            전체 보기 →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600">교육자</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">클래스</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">수강생</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">크레딧 사용</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {INSTITUTION_INSTRUCTORS.slice(0, 5).map(instructor => (
                <tr key={instructor.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold`} style={{ backgroundColor: instructor.avatar }}>
                        {instructor.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{instructor.name}</div>
                        <div className="text-xs text-neutral-500">{instructor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-700">{instructor.classCount}</td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-700">{instructor.studentCount}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm text-neutral-700">{instructor.creditsUsed.toLocaleString()} / {instructor.creditsAllocated.toLocaleString()}</div>
                    <div className="h-1.5 bg-neutral-100 rounded-full mt-1 w-20 mx-auto">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(instructor.creditsUsed / instructor.creditsAllocated) * 100}%` }} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      instructor.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {instructor.status === 'active' ? '활성' : '대기'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  // 구성원 관리 탭
  const renderMembers = () => (
    <div className="space-y-6">
      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="이름 또는 이메일로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'inactive', 'pending'].map(filter => (
            <button
              key={filter}
              onClick={() => setMemberFilter(filter)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                memberFilter === filter
                  ? 'bg-indigo-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {filter === 'all' ? '전체' : filter === 'active' ? '활성' : filter === 'inactive' ? '비활성' : '대기'}
            </button>
          ))}
        </div>
      </div>
      
      {/* 교육자 목록 */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-violet-500" />
            <h3 className="font-semibold text-neutral-900">교육자</h3>
            <span className="text-sm text-neutral-500">({filteredInstructors.length}명)</span>
          </div>
          <button className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            교육자 초대
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600">교육자</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">클래스</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">수강생</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">크레딧</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">가입일</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">상태</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredInstructors.map(instructor => (
                <tr key={instructor.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold`} style={{ backgroundColor: instructor.avatar }}>
                        {instructor.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{instructor.name}</div>
                        <div className="text-xs text-neutral-500">{instructor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-700">{instructor.classCount}</td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-700">{instructor.studentCount}</td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-700">{instructor.creditsAllocated.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-500">{instructor.joinDate}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      instructor.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {instructor.status === 'active' ? '활성' : '대기'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => { setSelectedMember({ ...instructor, type: 'instructor' }); setShowCreditModal(true); }}
                      className="px-3 py-1.5 text-xs bg-amber-100 text-amber-700 font-medium rounded-lg hover:bg-amber-200 transition-colors"
                    >
                      크레딧 배분
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 수강생 목록 */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-neutral-900">수강생</h3>
            <span className="text-sm text-neutral-500">({filteredStudents.length}명)</span>
          </div>
          <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            수강생 초대
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600">수강생</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">수강중</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">완료</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">진도율</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">크레딧</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">상태</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{student.name}</div>
                        <div className="text-xs text-neutral-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-700">{student.enrolledClasses}</td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-700">{student.completedClasses}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 bg-neutral-100 rounded-full w-16">
                        <div className={`h-full rounded-full ${student.progress >= 80 ? 'bg-emerald-500' : student.progress >= 50 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${student.progress}%` }} />
                      </div>
                      <span className="text-xs text-neutral-600">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-700">{student.creditsUsed} / {student.creditsAllocated}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      student.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {student.status === 'active' ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => { setSelectedMember({ ...student, type: 'student' }); setShowCreditModal(true); }}
                      className="px-3 py-1.5 text-xs bg-amber-100 text-amber-700 font-medium rounded-lg hover:bg-amber-200 transition-colors"
                    >
                      크레딧 배분
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  // 클래스 관리 탭
  const renderClasses = () => (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900">전체 클래스 현황</h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
              운영중 {INSTITUTION_CLASSES.filter(c => c.status === 'active').length}
            </span>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              승인대기 {INSTITUTION_CLASSES.filter(c => c.approvalStatus === 'pending').length}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600">클래스명</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600">담당 교육자</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">수강생</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">상태</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">승인</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-600">수익</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {INSTITUTION_CLASSES.map(cls => (
                <tr key={cls.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-neutral-900">{cls.title}</div>
                    <div className="text-xs text-neutral-500">시작일: {cls.startDate || '미정'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">{cls.instructor}</td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-700">{cls.students}명</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      cls.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      cls.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>
                      {cls.status === 'active' ? '운영중' : cls.status === 'scheduled' ? '예정' : '초안'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      cls.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {cls.approvalStatus === 'approved' ? '승인됨' : '대기중'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-neutral-900">
                    ₩{cls.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {cls.approvalStatus === 'pending' && (
                      <button className="px-3 py-1.5 text-xs bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                        검토하기
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  // 크레딧 관리 탭
  const renderCredits = () => (
    <div className="space-y-6">
      {/* 크레딧 풀 현황 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-6 h-6" />
            <span className="font-medium">기관 크레딧 풀</span>
          </div>
          <div className="text-4xl font-bold mb-2">{institution.creditPool.toLocaleString()}</div>
          <div className="text-white/80 text-sm">사용 가능</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="text-neutral-500 text-sm mb-2">총 배분량</div>
          <div className="text-3xl font-bold text-neutral-900">
            {(INSTITUTION_INSTRUCTORS.reduce((sum, i) => sum + i.creditsAllocated, 0) + 
              INSTITUTION_STUDENTS.reduce((sum, s) => sum + s.creditsAllocated, 0)).toLocaleString()}
          </div>
          <div className="text-sm text-neutral-500 mt-1">교육자 + 수강생</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="text-neutral-500 text-sm mb-2">이번 달 사용량</div>
          <div className="text-3xl font-bold text-neutral-900">{institution.usedCredits.toLocaleString()}</div>
          <div className="text-sm text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            전월 대비 +12%
          </div>
        </div>
      </div>
      
      {/* 크레딧 배분 이력 */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900">크레딧 변동 이력</h3>
          <button className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            크레딧 충전
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600">날짜</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600">유형</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600">대상</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-600">수량</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600">메모</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600">처리자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {CREDIT_DISTRIBUTION_HISTORY.map(item => (
                <tr key={item.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 text-sm text-neutral-700">{item.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.type === 'allocate' ? 'bg-emerald-100 text-emerald-700' :
                      item.type === 'recharge' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {item.type === 'allocate' ? '배분' : item.type === 'recharge' ? '충전' : '회수'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900">{item.target}</td>
                  <td className={`px-6 py-4 text-sm font-semibold text-right ${item.amount > 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                    {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">{item.note}</td>
                  <td className="px-6 py-4 text-sm text-neutral-500">{item.admin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  // 설정 탭
  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <h3 className="font-semibold text-neutral-900 mb-6">기관 정보</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">기관명</label>
            <input type="text" defaultValue={institution.name} className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">기관 로고</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-neutral-100 rounded-xl flex items-center justify-center border-2 border-dashed border-neutral-300">
                <Image className="w-8 h-8 text-neutral-400" />
              </div>
              <button className="px-4 py-2 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors">
                이미지 업로드
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <h3 className="font-semibold text-neutral-900 mb-6">기본 정책</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-neutral-100">
            <div>
              <div className="text-sm font-medium text-neutral-900">클래스 승인 필요</div>
              <div className="text-xs text-neutral-500">교육자가 생성한 클래스를 관리자가 검토 후 승인</div>
            </div>
            <button className={`w-12 h-6 rounded-full transition-colors ${institution.settings.requireClassApproval ? 'bg-indigo-600' : 'bg-neutral-200'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${institution.settings.requireClassApproval ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">신규 가입자 기본 크레딧</label>
            <input type="number" defaultValue={institution.settings.defaultMemberCredits} className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">월간 사용 한도 (구성원당)</label>
            <input type="number" defaultValue={institution.settings.monthlyLimitPerMember} className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          변경사항 저장
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-20">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* 탭 네비게이션 */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-1.5 mb-6 flex gap-1 overflow-x-auto shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* 탭 콘텐츠 */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'members' && renderMembers()}
        {activeTab === 'classes' && renderClasses()}
        {activeTab === 'credits' && renderCredits()}
        {activeTab === 'settings' && renderSettings()}
      </div>
      
      {/* 크레딧 배분 모달 */}
      {showCreditModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">크레딧 배분</h3>
              <button onClick={() => setShowCreditModal(false)} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-neutral-50 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold`} style={{ backgroundColor: selectedMember.avatar || '#6366f1' }}>
                    {selectedMember.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900">{selectedMember.name}</div>
                    <div className="text-sm text-neutral-500">{selectedMember.type === 'instructor' ? '교육자' : '수강생'}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-neutral-200 flex justify-between text-sm">
                  <span className="text-neutral-500">현재 배분량</span>
                  <span className="font-semibold text-neutral-900">{selectedMember.creditsAllocated?.toLocaleString()} 크레딧</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">배분할 크레딧</label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">메모 (선택)</label>
                <input
                  type="text"
                  value={creditNote}
                  onChange={(e) => setCreditNote(e.target.value)}
                  placeholder="배분 사유 입력"
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  기관 크레딧 풀에서 차감됩니다. 현재 잔액: <strong>{institution.creditPool.toLocaleString()}</strong>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreditModal(false)}
                className="flex-1 px-4 py-2.5 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAllocateCredits}
                disabled={!creditAmount || parseInt(creditAmount) <= 0}
                className="flex-1 px-4 py-2.5 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                배분하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function InstitutionPage() {
  const { isLoggedIn, user, viewMode, currentRole, wallet, userPlan, handleAuthClick, handleLogout, setCurrentPage, handleRoleSwitch, institution, setInstitution, currentPage } = useAuth();

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
      <InstitutionAdminPage
        user={user}
        institution={institution}
        setInstitution={setInstitution}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
}
