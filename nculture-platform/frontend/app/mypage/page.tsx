// @ts-nocheck
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/components/AuthProvider';
import { PRICING_PLANS } from '@/lib/data';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  FileText,
  Headphones,
  History,
  Image,
  Lightbulb,
  Maximize2,
  MessageSquare,
  Monitor,
  MousePointer,
  PenTool,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Upload,
  User,
  Users,
  Video,
  VideoOff,
  Volume2,
  X,
  Zap,
} from 'lucide-react';

// ============= 마이페이지 =============
const MyPage = ({ wallet, userPlan, setUserPlan, setWallet, creditLedger, userEnterpriseTier, setUserEnterpriseTier, user, setUser, currentRole }) => {
  // 현재 역할 결정 (viewMode 반영)
  const effectiveRole = currentRole || user?.role;
  const isInstructor = effectiveRole === 'instructor';
  const isInstitutionAdmin = effectiveRole === 'institution_admin';
  
  // 기관관리자는 subscription 탭으로 시작
  const [activeTab, setActiveTab] = useState(isInstitutionAdmin ? 'subscription' : 'dashboard');
  
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showEnterpriseTierModal, setShowEnterpriseTierModal] = useState(false);
  const [showQuoteRequestModal, setShowQuoteRequestModal] = useState(false);
  const [quoteRequestStep, setQuoteRequestStep] = useState('form'); // 'form', 'complete'
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
  const [selectedEnterpriseTier, setSelectedEnterpriseTier] = useState(null);
  const [paymentStep, setPaymentStep] = useState('info'); // 'info', 'processing', 'complete'
  const [cardNumber, setCardNumber] = useState('4242424242424242');
  const [cardExpiry, setCardExpiry] = useState('1227');
  const [cardCvc, setCardCvc] = useState('123');
  const plan = PRICING_PLANS[userPlan] || PRICING_PLANS.free;
  const enterpriseTiers = PRICING_PLANS.enterprise.tiers;

  // 교육자 클래스 관리 상태
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseManageTab, setCourseManageTab] = useState('overview'); // overview, students, curriculum, notice
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [newCourseStep, setNewCourseStep] = useState(1); // 1: 기본정보, 2: 상세정보, 3: 미디어/영상
  
  // 클래스 관리 서브 모달/상태
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(null);
  const [showSessionPreviewModal, setShowSessionPreviewModal] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [editingNotice, setEditingNotice] = useState(null);
  const [newSessionForm, setNewSessionForm] = useState({ title: '', description: '', credits: 20, hasTest: false });
  const [newNoticeForm, setNewNoticeForm] = useState({ title: '', content: '', pinned: false });
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [showCourseInfoModal, setShowCourseInfoModal] = useState(false);
  const [showExamplePromptsModal, setShowExamplePromptsModal] = useState(null); // session id
  const [showTimelineNoticesModal, setShowTimelineNoticesModal] = useState(null); // session object
  
  // 클래스 기본 정보
  const [courseInfo, setCourseInfo] = useState({
    title: '프롬프트로 AI 영상 만들기',
    description: 'AI 영상 생성 도구를 활용하여 전문적인 영상 콘텐츠를 제작하는 방법을 배웁니다. 프롬프트 작성부터 고급 편집 기법까지 체계적으로 학습합니다.',
    category: 'video',
    level: 'beginner',
    targetAudience: 'AI 영상 제작에 관심 있는 초보자',
    prerequisites: '기본적인 컴퓨터 사용 능력',
    creditPrice: 150,
    creditsPerSession: 20,
    learningGoals: ['프롬프트 작성 기초 익히기', 'AI 영상 도구 활용법 습득', '실전 프로젝트 완성']
  });
  const [courseInfoForm, setCourseInfoForm] = useState({...courseInfo});
  
  // 클래스별 데이터
  const [courseSessions, setCourseSessions] = useState([
    { id: 1, session: 1, title: '프롬프트 기초', description: 'AI 영상 생성의 기본 개념과 프롬프트 작성법을 배웁니다.', duration: '25:30', views: 142, hasVideo: true, credits: 20, hasTest: false, examplePrompts: ['도시의 밤하늘을 배경으로 한 시네마틱 드론 샷', '해변에서 석양을 바라보는 실루엣'],
      timelineNotices: [
        { id: 1, time: '00:00', type: 'start', message: '안녕하세요! 오늘 수업을 시작합니다. 집중해서 들어주세요.' },
        { id: 2, time: '05:00', type: 'practice', message: '이제 첫 번째 실습을 시작해보세요. 프롬프트를 직접 작성해봅시다!' },
        { id: 3, time: '10:00', type: 'hint', message: '힌트: 구체적인 형용사와 분위기를 설명하면 더 좋은 결과를 얻을 수 있어요.' },
        { id: 4, time: '15:00', type: 'info', message: '다음 섹션에서는 스타일 키워드에 대해 배워봅니다.' }
      ]
    },
    { id: 2, session: 2, title: '영상 스타일 이해하기', description: '다양한 영상 스타일과 분위기 설정 방법을 학습합니다.', duration: '32:15', views: 128, hasVideo: true, credits: 25, hasTest: true, examplePrompts: ['빈티지 필름 느낌의 카페 인테리어', '네온 사이버펑크 스타일의 도시 야경'],
      timelineNotices: [
        { id: 1, time: '00:00', type: 'start', message: '2회차 수업을 시작합니다!' },
        { id: 2, time: '08:00', type: 'practice', message: '영상 스타일 프롬프트를 작성해보세요.' }
      ]
    },
    { id: 3, session: 3, title: '고급 프롬프트 작성법', description: '복잡한 장면을 표현하는 고급 프롬프트 기법을 익힙니다.', duration: '28:45', views: 98, hasVideo: true, credits: 30, hasTest: false, examplePrompts: [''], timelineNotices: [] },
    { id: 4, session: 4, title: '실전 프로젝트 1', description: '배운 내용을 바탕으로 첫 번째 프로젝트를 진행합니다.', duration: '45:00', views: 76, hasVideo: true, credits: 40, hasTest: true, examplePrompts: [''], timelineNotices: [] },
    { id: 5, session: 5, title: '피드백 및 수정', description: '프로젝트 결과물에 대한 피드백과 수정 작업을 진행합니다.', duration: '', views: 0, hasVideo: false, credits: 20, hasTest: false, examplePrompts: [''], timelineNotices: [] },
  ]);
  const [courseNotices, setCourseNotices] = useState([
    { id: 1, title: '중간 과제 안내', content: '이번 주까지 3회차 과제를 제출해주세요.', date: '2024-01-15', pinned: true },
    { id: 2, title: '라이브 수업 일정 변경', content: '다음 주 라이브는 수요일로 변경됩니다.', date: '2024-01-10', pinned: false },
    { id: 3, title: '크레딧 추가 지급 안내', content: '모든 수강생에게 50 크레딧이 추가 지급되었습니다.', date: '2024-01-05', pinned: false },
  ]);
  const courseStudents = [
    { id: 1, name: '김민준', email: 'minjun@email.com', progress: 92, credits: 45, lastActive: '오늘', joinDate: '2024-01-01', completedSessions: [1,2,3,4] },
    { id: 2, name: '이서연', email: 'seoyeon@email.com', progress: 78, credits: 32, lastActive: '오늘', joinDate: '2024-01-03', completedSessions: [1,2,3] },
    { id: 3, name: '박지호', email: 'jiho@email.com', progress: 45, credits: 18, lastActive: '3일 전', joinDate: '2024-01-05', completedSessions: [1,2] },
    { id: 4, name: '최수아', email: 'sua@email.com', progress: 100, credits: 67, lastActive: '어제', joinDate: '2024-01-02', completedSessions: [1,2,3,4,5] },
  ];
  
  const [newCourseForm, setNewCourseForm] = useState({
    title: '',
    description: '',
    sessions: 8,
    category: 'video',
    level: 'beginner',
    thumbnail: null,
    introVideo: null,
    lectureVideos: [], // 각 회차별 클래스 영상
    examplePrompts: ['', '', ''],
    learningGoals: ['', '', ''],
    targetAudience: '',
    prerequisites: '',
    creditPrice: 150, // 크레딧 기반 수강료
    creditsPerSession: 20, // 회차당 제공 크레딧
    sessionDetails: [] // 회차별 상세 정보
  });
  
  // 회차 수 변경 시 sessionDetails 초기화
  const initSessionDetails = (count) => {
    const details = [];
    for (let i = 1; i <= count; i++) {
      details.push({
        session: i,
        title: '',
        description: '',
        credits: 20,
        hasTest: false
      });
    }
    return details;
  };
  
  // sessionDetails가 비어있으면 초기화
  const getSessionDetails = () => {
    if (newCourseForm.sessionDetails.length > 0) {
      return newCourseForm.sessionDetails;
    }
    return initSessionDetails(newCourseForm.sessions);
  };
  
  const instructorCourses = [
    { id: 1, title: '프롬프트로 AI 영상 만들기', students: 156, progress: 67, status: 'active', thumbnail: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=400' },
    { id: 2, title: 'AI 이미지 생성 마스터', students: 78, progress: 42, status: 'active', thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400' },
  ];

  // 테스트 관리 상태
  const [showNewTestModal, setShowNewTestModal] = useState(false);
  const [selectedTestForGrading, setSelectedTestForGrading] = useState(null);
  const [selectedTestForManage, setSelectedTestForManage] = useState(null);
  const [gradingScore, setGradingScore] = useState('');
  const [gradingFeedback, setGradingFeedback] = useState('');
  const [isAIGrading, setIsAIGrading] = useState(false);
  const [newTestForm, setNewTestForm] = useState({
    title: '',
    courseId: 1,
    type: 'mixed',
    timeLimit: 30,
    passingScore: 60,
    practicalCredits: 10
  });
  const instructorTests = [
    { id: 1, title: '1회차 이해도 점검', courseId: 1, courseName: '프롬프트로 AI 영상 만들기', type: 'objective', submissions: 45, graded: 45, avgScore: 82, status: 'active' },
    { id: 2, title: '중간 실기 평가', courseId: 1, courseName: '프롬프트로 AI 영상 만들기', type: 'practical', submissions: 38, graded: 12, avgScore: null, status: 'grading' },
    { id: 3, title: '기초 문법 테스트', courseId: 2, courseName: 'AI 이미지 생성 마스터', type: 'mixed', submissions: 28, graded: 28, avgScore: 75, status: 'closed' },
  ];
  // 테스트별 학생 제출 데이터
  const testSubmissions = {
    1: [
      { id: 1, studentName: '김민준', submittedAt: '1일 전', score: 95, aiScore: 95, feedback: '완벽한 이해도입니다.', status: 'graded' },
      { id: 2, studentName: '이서연', submittedAt: '1일 전', score: 88, aiScore: 88, feedback: '좋은 성적입니다.', status: 'graded' },
      { id: 3, studentName: '박지호', submittedAt: '2일 전', score: 72, aiScore: 72, feedback: '복습이 필요합니다.', status: 'graded' },
    ],
    2: [
      { id: 1, studentName: '김민준', submittedAt: '2시간 전', score: null, aiScore: 85, feedback: '', status: 'pending', prompt: '네온 불빛이 반짝이는 도시의 밤거리, 시네마틱한 분위기로 표현', thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400' },
      { id: 2, studentName: '이서연', submittedAt: '3시간 전', score: null, aiScore: 92, feedback: '', status: 'pending', prompt: '환상적인 보라색 오로라가 펼쳐진 북극의 밤하늘', thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400' },
      { id: 3, studentName: '박지호', submittedAt: '5시간 전', score: null, aiScore: 78, feedback: '', status: 'pending', prompt: '고요한 호수 위에 비친 산의 모습, 일출 시간대', thumbnail: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400' },
      { id: 4, studentName: '최수아', submittedAt: '1일 전', score: 88, aiScore: 85, feedback: 'AI 추천 점수에서 상향 조정했습니다. 창의성이 돋보입니다.', status: 'graded', prompt: '미래 도시의 하늘을 나는 자동차들', thumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400' },
    ],
    3: [
      { id: 1, studentName: '정예준', submittedAt: '3일 전', score: 80, aiScore: 80, feedback: '기본기가 탄탄합니다.', status: 'graded' },
      { id: 2, studentName: '한소희', submittedAt: '3일 전', score: 75, aiScore: 75, feedback: '조금 더 연습이 필요합니다.', status: 'graded' },
    ]
  };
  const pendingSubmissions = [
    { id: 1, testId: 2, testTitle: '중간 실기 평가', studentName: '김민준', submittedAt: '2시간 전', prompt: '네온 불빛이 반짝이는 도시의 밤거리...', thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200', aiScore: 85 },
    { id: 2, testId: 2, testTitle: '중간 실기 평가', studentName: '이서연', submittedAt: '3시간 전', prompt: '환상적인 보라색 오로라가 펼쳐진...', thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200', aiScore: 92 },
    { id: 3, testId: 2, testTitle: '중간 실기 평가', studentName: '박지호', submittedAt: '5시간 전', prompt: '고요한 호수 위에 비친 산의 모습...', thumbnail: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=200', aiScore: 78 },
  ];

  // 라이브 관리 상태
  const [showNewLiveModal, setShowNewLiveModal] = useState(false);
  const [newLiveForm, setNewLiveForm] = useState({
    title: '',
    courseId: 1,
    date: '',
    time: '',
    duration: 60,
    description: '',
    maxParticipants: 50
  });

  // 개인정보 수정 상태
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    institution: user?.institution || ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // 견적 문의 폼 상태
  const [quoteForm, setQuoteForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    teamSize: '',
    expectedUsage: '',
    message: ''
  });

  // Enterprise 팀 관리 상태
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: '김민수', email: 'minsu@company.com', role: 'admin', credits: 3000, usedCredits: 1250, status: 'active', lastActive: '2025-01-15' },
    { id: 2, name: '이지영', email: 'jiyoung@company.com', role: 'member', credits: 2500, usedCredits: 890, status: 'active', lastActive: '2025-01-14' },
    { id: 3, name: '박준혁', email: 'junhyuk@company.com', role: 'member', credits: 2000, usedCredits: 2000, status: 'active', lastActive: '2025-01-13' },
    { id: 4, name: '최서연', email: 'seoyeon@company.com', role: 'member', credits: 1500, usedCredits: 450, status: 'active', lastActive: '2025-01-15' },
    { id: 5, name: '정태현', email: 'taehyun@company.com', role: 'member', credits: 1000, usedCredits: 0, status: 'pending', lastActive: '-' },
  ]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [showExcelUploadModal, setShowExcelUploadModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberCredits, setNewMemberCredits] = useState(1000);
  
  // 엑셀 업로드 상태
  const [excelFile, setExcelFile] = useState(null);
  const [excelPreviewData, setExcelPreviewData] = useState([]);
  const [excelUploadStep, setExcelUploadStep] = useState('upload'); // 'upload', 'preview', 'complete'

  // 팀 크레딧 통계 (Enterprise 티어 반영)
  const totalTeamCredits = teamMembers.reduce((sum, m) => sum + m.credits, 0);
  const usedTeamCredits = teamMembers.reduce((sum, m) => sum + m.usedCredits, 0);
  const enterpriseMonthlyCredits = userEnterpriseTier?.monthlyCredits || plan.monthlyCredits || 20000;
  const poolCredits = enterpriseMonthlyCredits - totalTeamCredits;

  // 엑셀 파일 처리 (Mock)
  const handleExcelFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExcelFile(file);
      // Mock: 파일에서 데이터 추출했다고 가정
      const mockParsedData = [
        { name: '홍길동', email: 'gildong@company.com', credits: 1500 },
        { name: '김철수', email: 'chulsoo@company.com', credits: 2000 },
        { name: '이영희', email: 'younghee@company.com', credits: 1000 },
        { name: '박지민', email: 'jimin@company.com', credits: 1500 },
      ];
      setExcelPreviewData(mockParsedData);
      setExcelUploadStep('preview');
    }
  };
  // 엑셀 데이터 일괄 추가
  const handleExcelImport = () => {
    const newMembers = excelPreviewData.map((data, idx) => ({
      id: Date.now() + idx,
      name: data.name,
      email: data.email,
      role: 'member',
      credits: data.credits,
      usedCredits: 0,
      status: 'pending',
      lastActive: '-'
    }));
    setTeamMembers([...teamMembers, ...newMembers]);
    setExcelUploadStep('complete');
    setTimeout(() => {
      setShowExcelUploadModal(false);
      setExcelFile(null);
      setExcelPreviewData([]);
      setExcelUploadStep('upload');
    }, 1500);
  };

  // 엑셀 미리보기에서 항목 수정
  const handleExcelPreviewEdit = (index, field, value) => {
    setExcelPreviewData(excelPreviewData.map((item, idx) => 
      idx === index ? { ...item, [field]: field === 'credits' ? parseInt(value) || 0 : value } : item
    ));
  };

  // 엑셀 미리보기에서 항목 삭제
  const handleExcelPreviewRemove = (index) => {
    setExcelPreviewData(excelPreviewData.filter((_, idx) => idx !== index));
  };

  // 멤버 추가
  const handleAddMember = () => {
    if (!newMemberEmail || !newMemberName) return;
    const newMember = {
      id: Date.now(),
      name: newMemberName,
      email: newMemberEmail,
      role: 'member',
      credits: newMemberCredits,
      usedCredits: 0,
      status: 'pending',
      lastActive: '-'
    };
    setTeamMembers([...teamMembers, newMember]);
    setShowAddMemberModal(false);
    setNewMemberEmail('');
    setNewMemberName('');
    setNewMemberCredits(1000);
  };

  // 멤버 크레딧 수정
  const handleUpdateMemberCredits = (memberId, newCredits) => {
    setTeamMembers(teamMembers.map(m => 
      m.id === memberId ? { ...m, credits: Math.max(0, newCredits) } : m
    ));
  };

  // 멤버 삭제
  const handleRemoveMember = (memberId) => {
    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
  };

  // 멤버 역할 변경
  const handleChangeRole = (memberId, newRole) => {
    setTeamMembers(teamMembers.map(m => 
      m.id === memberId ? { ...m, role: newRole } : m
    ));
  };

  // 플랜 등급 비교용
  const planRank = { free: 0, basic: 1, pro: 2, max: 3, enterprise: 4 };
  
  // Mock 데이터
  const nextBillingDate = '2025-02-15';
  
  // 이번 달 사용량 계산 (ledger에서 capture 타입의 합계)
  const usedThisMonth = creditLedger
    ?.filter(entry => entry.type === 'capture')
    .reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0;
  
  // 최근 생성 기록 (ledger에서 capture 타입만)
  const recentGenerations = creditLedger
    ?.filter(entry => entry.type === 'capture')
    .slice(0, 5) || [];

  const formatPrice = (price) => {
    if (price === null) return '별도 협의';
    return `₩${price.toLocaleString()}`;
  };

  const handlePlanChangeClick = (newPlanId) => {
    if (newPlanId === userPlan) return;
    
    const isDowngrade = planRank[newPlanId] < planRank[userPlan];
    setSelectedPlanForPayment(newPlanId);
    
    if (isDowngrade) {
      setShowDowngradeModal(true);
    } else {
      setPaymentStep('info');
      setShowPaymentModal(true);
    }
  };

  const handleDowngradeConfirm = () => {
    const newPlan = PRICING_PLANS[selectedPlanForPayment];
    if (newPlan) {
      setUserPlan(selectedPlanForPayment);
      setUserEnterpriseTier(null);
      setWallet({ balance: newPlan.monthlyCredits });
    }
    setShowDowngradeModal(false);
    setSelectedPlanForPayment(null);
  };

  const handlePaymentSubmit = () => {
    setPaymentStep('processing');
    // Mock 결제 처리
    setTimeout(() => {
      setPaymentStep('complete');
    }, 1500);
  };

  const handlePaymentComplete = () => {
    if (selectedPlanForPayment === 'enterprise' && selectedEnterpriseTier) {
      setUserPlan('enterprise');
      setUserEnterpriseTier(selectedEnterpriseTier);
      setWallet({ balance: selectedEnterpriseTier.monthlyCredits || 999999 });
    } else {
      const newPlan = PRICING_PLANS[selectedPlanForPayment];
      if (newPlan) {
        setUserPlan(selectedPlanForPayment);
        setUserEnterpriseTier(null);
        setWallet({ balance: newPlan.monthlyCredits });
      }
    }
    setShowPaymentModal(false);
    setSelectedPlanForPayment(null);
    setSelectedEnterpriseTier(null);
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
  };

  const handleCancelPlan = () => {
    setUserPlan('free');
    setUserEnterpriseTier(null);
    setWallet({ balance: PRICING_PLANS.free.monthlyCredits });
    setShowCancelModal(false);
  };

  // 현재 플랜 정보 (Enterprise 티어 반영)
  const currentPlanInfo = userPlan === 'enterprise' && userEnterpriseTier
    ? {
        name: `Enterprise ${userEnterpriseTier.name}`,
        monthlyPrice: userEnterpriseTier.monthlyPrice,
        monthlyCredits: userEnterpriseTier.monthlyCredits,
        teamSeats: userEnterpriseTier.teamSeats,
        sla: userEnterpriseTier.sla
      }
    : plan;

  // 프로필 저장 핸들러
  const handleProfileSave = () => {
    if (setUser) {
      setUser(prev => ({
        ...prev,
        name: profileForm.name,
        email: profileForm.email,
        institution: profileForm.institution
      }));
    }
    setIsEditingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-8">
        {/* 프로필 헤더 */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-6 mb-6 text-white shadow-sm">
          <div className="flex items-center gap-5">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
              user?.role === 'instructor' ? 'bg-violet-400' : 'bg-indigo-400'
            }`}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{user?.name || '사용자'}</h1>
              <p className="text-indigo-200 text-sm">{user?.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.role === 'instructor' ? 'bg-violet-400/30 text-white' : 'bg-indigo-400/30 text-white'
                }`}>
                  {user?.role === 'instructor' ? '교육자' : '수강생'}
                </span>
                <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-medium">
                  {plan.name} 플랜
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-indigo-200 text-xs mb-1">보유 크레딧</div>
              <div className="text-3xl font-bold flex items-center gap-1">
                <Zap className="w-6 h-6" />
                {wallet?.balance?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-1.5 mb-6 flex gap-1 shadow-sm">
          {(isInstitutionAdmin ? [
            // 기관관리자는 플랜 구독과 설정만
            { id: 'subscription', label: '플랜 구독', icon: Zap },
            { id: 'settings', label: '설정', icon: User }
          ] : [
            // 일반 사용자 (수강생/교육자)
            { id: 'dashboard', label: '대시보드', icon: BarChart3 },
            ...(isInstructor ? [{ id: 'classes', label: '클래스 관리', icon: BookOpen }] : []),
            ...(isInstructor ? [{ id: 'tests', label: '테스트 관리', icon: FileText }] : []),
            { id: 'subscription', label: '플랜 구독', icon: Zap },
            { id: 'settings', label: '설정', icon: User }
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
            ))}
        </div>

        {/* 대시보드 탭 - 역할별 대시보드 */}
        {activeTab === 'dashboard' && (
          <>
            {/* 교육자 대시보드 */}
            {isInstructor ? (
              <div className="space-y-6">
                {/* 환영 메시지 & 요약 */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-1">안녕하세요, {user?.name} 강사님!</h2>
                    <p className="text-neutral-500">오늘도 멋진 강의를 준비해볼까요?</p>
                  </div>
                </div>
                {/* 요약 카드 */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-5 border border-neutral-200">
                    <div className="text-sm text-neutral-500 mb-1">운영 중인 클래스</div>
                    <div className="text-2xl font-bold text-neutral-900">2개</div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-neutral-200">
                    <div className="text-sm text-neutral-500 mb-1">전체 수강생</div>
                    <div className="text-2xl font-bold text-indigo-600">234명</div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-neutral-200">
                    <div className="text-sm text-neutral-500 mb-1">이번 달 수익</div>
                    <div className="text-2xl font-bold text-emerald-600">₩1,250,000</div>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
                    <div className="text-sm text-amber-600 mb-1">잔여 크레딧</div>
                    <div className="text-2xl font-bold text-amber-700 flex items-center gap-1">
                      <Zap className="w-5 h-5" />
                      {wallet?.balance?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* 최근 학생 활동 */}
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">최근 학생 활동</h3>
                    <div className="space-y-3">
                      {[
                        { name: '김민준', action: '영상 생성', model: 'Sora Pro', time: '10분 전' },
                        { name: '이서연', action: '영상 생성', model: 'Runway', time: '25분 전' },
                        { name: '최수아', action: '과제 제출', model: '-', time: '1시간 전' },
                        { name: '박지호', action: '영상 생성', model: 'Kling', time: '2시간 전' },
                      ].map((activity, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600">{activity.name.charAt(0)}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-neutral-900">{activity.name}</span>
                              <span className="text-sm text-neutral-500"> · {activity.action}</span>
                            </div>
                          </div>
                          <span className="text-xs text-neutral-400">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 예정된 라이브 */}
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-neutral-900">예정된 라이브</h3>
                      <button
                        onClick={() => setShowNewLiveModal(true)}
                        className="px-3 py-1.5 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors"
                      >
                        + 새 라이브
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Radio className="w-4 h-4 text-rose-600" />
                          <span className="text-sm font-medium text-rose-700">오늘 14:00</span>
                        </div>
                        <h4 className="font-semibold text-neutral-900 mb-1">AI 영상 제작 실습</h4>
                        <p className="text-sm text-neutral-500">프롬프트로 AI 영상 만들기 6회차</p>
                      </div>
                      <div className="p-4 bg-neutral-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm font-medium text-neutral-500">내일 10:00</span>
                        </div>
                        <h4 className="font-semibold text-neutral-900 mb-1">중간 평가 리뷰</h4>
                        <p className="text-sm text-neutral-500">AI 이미지 생성 마스터 4회차</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 클래스 & 테스트 요약 현황 */}
                <div className="grid grid-cols-2 gap-6">
                  {/* 내 클래스 현황 */}
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-neutral-900">내 클래스 현황</h3>
                      <button
                        onClick={() => setActiveTab('classes')}
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        전체보기 →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {instructorCourses.slice(0, 3).map((course) => (
                        <div key={course.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                          <img src={course.thumbnail} alt="" className="w-16 h-12 object-cover rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-neutral-900 text-sm truncate">{course.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-neutral-500">수강생 {course.students}명</span>
                              <div className="flex items-center gap-1">
                                <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{width: `${course.progress}%`}} />
                                </div>
                                <span className="text-xs text-indigo-600">{course.progress}%</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setSelectedCourse(course);
                              setCourseManageTab('overview');
                              setActiveTab('classes');
                            }}
                            className="px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded"
                          >
                            관리
                          </button>
                        </div>
                      ))}
                      {instructorCourses.length === 0 && (
                        <div className="text-center py-6 text-neutral-400">
                          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">아직 클래스가 없습니다</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 테스트 현황 */}
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-neutral-900">테스트 현황</h3>
                      <button
                        onClick={() => setActiveTab('tests')}
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        전체보기 →
                      </button>
                    </div>
                    
                    {/* 테스트 통계 요약 */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-amber-50 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-amber-600">5</div>
                        <div className="text-xs text-amber-700">채점 대기</div>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-emerald-600">23</div>
                        <div className="text-xs text-emerald-700">채점 완료</div>
                      </div>
                      <div className="bg-indigo-50 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-indigo-600">78%</div>
                        <div className="text-xs text-indigo-700">평균 점수</div>
                      </div>
                    </div>
                    
                    {/* 최근 제출 목록 */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-neutral-500 mb-2">최근 제출</div>
                      {[
                        { student: '김민준', test: '2회차 테스트', time: '10분 전', status: 'pending' },
                        { student: '이서연', test: '3회차 테스트', time: '1시간 전', status: 'pending' },
                        { student: '박지호', test: '2회차 테스트', time: '2시간 전', status: 'graded', score: 85 },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-neutral-600">{item.student.charAt(0)}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-neutral-900">{item.student}</span>
                              <span className="text-xs text-neutral-400 ml-1">· {item.test}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.status === 'pending' ? (
                              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">대기</span>
                            ) : (
                              <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded">{item.score}점</span>
                            )}
                            <span className="text-xs text-neutral-400">{item.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* 수강생 대시보드 */
              <div className="space-y-6">
                {/* 환영 메시지 & 크레딧 요약 */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-1">안녕하세요, {user?.name}님!</h2>
                    <p className="text-neutral-500">오늘도 창작을 시작해볼까요?</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl px-5 py-3">
                      <div className="text-xs text-amber-600 mb-0.5">잔여 크레딧</div>
                      <div className="text-2xl font-bold text-amber-700 flex items-center gap-1">
                        <Zap className="w-5 h-5" />
                        {wallet?.balance?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 현재 수강 중인 클래스 */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">수강 중인 클래스</h3>
                  <div className="flex items-start gap-6">
                    <img 
                      src="https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=400" 
                      alt="" 
                      className="w-44 h-28 object-cover rounded-xl" 
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">수강 중</span>
                        <span className="text-sm text-neutral-500">김교수</span>
                      </div>
                      <h4 className="text-lg font-bold text-neutral-900 mb-2">프롬프트로 AI 영상 만들기</h4>
                      <div className="flex items-center gap-4 text-sm text-neutral-500 mb-3">
                        <span>5 / 12 회차</span>
                        <span>·</span>
                        <span>진도율 42%</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '42%' }} />
                      </div>
                      <button className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors">
                        실습 계속하기 →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* 오늘의 학습 */}
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">오늘의 학습</h3>
                    <div className="bg-indigo-50 rounded-xl p-4 mb-4">
                      <div className="text-sm text-indigo-600 mb-1">다음 회차</div>
                      <div className="font-semibold text-indigo-900">5회차: 고급 프롬프트 기법</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                            <Play className="w-4 h-4 text-neutral-600" />
                          </div>
                          <span className="text-sm text-neutral-900">5회차 실습 과제</span>
                        </div>
                        <span className="text-xs font-medium text-red-600">오늘</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Award className="w-4 h-4 text-amber-600" />
                          </div>
                          <span className="text-sm text-neutral-900">중간 평가</span>
                        </div>
                        <span className="text-xs font-medium text-neutral-500">3일 후</span>
                      </div>
                    </div>
                  </div>

                  {/* 최근 생성 결과물 */}
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">최근 생성 결과물</h3>
                    <div className="space-y-3">
                      {[
                        { type: 'video', prompt: '도시의 야경이 반짝이는 영상', time: '2시간 전', credits: 8, img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200' },
                        { type: 'image', prompt: '미래 도시의 일출', time: '어제', credits: 3, img: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=200' },
                        { type: 'video', prompt: '바다 위를 날아가는 드론 영상', time: '2일 전', credits: 6, img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200' },
                      ].map((work, idx) => (
                        <div key={idx} className="flex items-center gap-3 py-2 border-b border-neutral-100 last:border-0">
                          <img src={work.img} alt="" className="w-12 h-12 object-cover rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-neutral-900 truncate">{work.prompt}</div>
                            <div className="text-xs text-neutral-400">{work.time}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            {work.type === 'video' ? <Video className="w-3.5 h-3.5 text-indigo-500" /> : <Image className="w-3.5 h-3.5 text-emerald-500" />}
                            <span className="text-xs text-neutral-500">-{work.credits}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 추천 클래스 */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">추천 클래스</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { title: 'Midjourney 마스터 클래스', instructor: '이아트', sessions: 10, img: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=300' },
                      { title: 'Sora로 시작하는 영상 제작', instructor: '박영상', sessions: 8, img: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=300' },
                      { title: 'ChatGPT 프롬프트 엔지니어링', instructor: '최텍스트', sessions: 6, img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300' },
                    ].map((course, idx) => (
                      <div key={idx} className="border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                        <img src={course.img} alt="" className="w-full h-32 object-cover" />
                        <div className="p-4">
                          <h4 className="font-medium text-neutral-900 mb-1">{course.title}</h4>
                          <div className="text-sm text-neutral-500">{course.instructor} · {course.sessions}회차</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* 클래스 관리 탭 (교육자 전용) */}
        {activeTab === 'classes' && isInstructor && (
          <div className="space-y-6">
            {!selectedCourse ? (
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">내 클래스</h3>
                    <p className="text-sm text-neutral-500 mt-1">총 {instructorCourses.length}개의 클래스를 운영하고 있습니다</p>
                  </div>
                  <button 
                    onClick={() => setShowNewCourseModal(true)}
                    className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    새 클래스 만들기
                  </button>
                </div>
                <div className="space-y-4">
                  {instructorCourses.map((course) => (
                    <div key={course.id} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                      <img src={course.thumbnail} alt="" className="w-28 h-20 object-cover rounded-lg" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-neutral-900">{course.title}</h4>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">진행중</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                          <span>수강생 {course.students}명</span>
                          <span>진도율 {course.progress}%</span>
                          <span className="flex items-center gap-1 text-amber-600">
                            <Zap className="w-3 h-3" />
                            150 크레딧
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedCourse(course);
                          setCourseManageTab('overview');
                        }}
                        className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        관리
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* 클래스 상세 관리 */
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <button 
                    onClick={() => setSelectedCourse(null)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-neutral-600" />
                  </button>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900">{selectedCourse.title}</h3>
                    <p className="text-sm text-neutral-500">클래스 관리</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    selectedCourse.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {selectedCourse.status === 'active' ? '운영중' : '종료'}
                  </span>
                </div>
                
                {/* 세부 카테고리 탭 */}
                <div className="flex gap-1 mb-6 bg-neutral-100 p-1 rounded-xl">
                  {[
                    { id: 'overview', label: '개요', icon: BarChart3 },
                    { id: 'students', label: '수강생', icon: Users },
                    { id: 'curriculum', label: '커리큘럼', icon: BookOpen },
                    { id: 'notice', label: '클래스 공지', icon: Bell }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setCourseManageTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        courseManageTab === tab.id
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* 개요 탭 */}
                {courseManageTab === 'overview' && (
                  <>
                    {/* 클래스 통계 */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="bg-neutral-50 rounded-xl p-4">
                        <div className="text-sm text-neutral-500 mb-1">수강생</div>
                        <div className="text-xl font-bold text-neutral-900">{selectedCourse.students}명</div>
                      </div>
                      <div className="bg-neutral-50 rounded-xl p-4">
                        <div className="text-sm text-neutral-500 mb-1">평균 진도율</div>
                        <div className="text-xl font-bold text-indigo-600">{selectedCourse.progress}%</div>
                      </div>
                      <div className="bg-neutral-50 rounded-xl p-4">
                        <div className="text-sm text-neutral-500 mb-1">총 크레딧 사용</div>
                        <div className="text-xl font-bold text-amber-600">4,250</div>
                      </div>
                      <div className="bg-neutral-50 rounded-xl p-4">
                        <div className="text-sm text-neutral-500 mb-1">완료율</div>
                        <div className="text-xl font-bold text-emerald-600">24%</div>
                      </div>
                    </div>

                    {/* 최근 활동 */}
                    <div className="bg-neutral-50 rounded-xl p-4">
                      <h4 className="font-semibold text-neutral-900 mb-3">최근 활동</h4>
                      <div className="space-y-3">
                        {[
                          { user: '김민준', action: '3회차 영상 시청 완료', time: '10분 전' },
                          { user: '이서연', action: '과제 제출', time: '1시간 전' },
                          { user: '박지호', action: '2회차 테스트 완료 (85점)', time: '2시간 전' },
                        ].map((activity, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 border-b border-neutral-200 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-600">{activity.user.charAt(0)}</span>
                              </div>
                              <div>
                                <span className="font-medium text-neutral-900">{activity.user}</span>
                                <span className="text-neutral-500 ml-2">{activity.action}</span>
                              </div>
                            </div>
                            <span className="text-sm text-neutral-400">{activity.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                
                {/* 수강생 탭 */}
                {courseManageTab === 'students' && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-500">전체 {courseStudents.length}명</span>
                      </div>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          placeholder="수강생 검색..."
                          className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-neutral-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">수강생</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">진도율</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">사용 크레딧</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">최근 활동</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">가입일</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {courseStudents
                            .filter(s => s.name.includes(studentSearchQuery) || s.email.includes(studentSearchQuery))
                            .map((student) => (
                            <tr key={student.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-indigo-600">{student.name.charAt(0)}</span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-neutral-900">{student.name}</div>
                                    <div className="text-xs text-neutral-500">{student.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-neutral-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-indigo-500 rounded-full"
                                      style={{ width: `${student.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium text-neutral-700">{student.progress}%</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="flex items-center gap-1 text-sm text-amber-600">
                                  <Zap className="w-3 h-3" />
                                  {student.credits}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-neutral-500">{student.lastActive}</td>
                              <td className="py-3 px-4 text-sm text-neutral-500">{student.joinDate}</td>
                              <td className="py-3 px-4">
                                <button 
                                  onClick={() => setSelectedStudent(student)}
                                  className="text-sm text-indigo-600 hover:underline"
                                >
                                  상세
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
                
                {/* 커리큘럼 탭 */}
                {courseManageTab === 'curriculum' && (
                  <>
                    {/* 클래스 기본 정보 */}
                    <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-200 mb-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-neutral-900">{courseInfo.title}</h4>
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              courseInfo.level === 'beginner' ? 'bg-emerald-100 text-emerald-700' :
                              courseInfo.level === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {courseInfo.level === 'beginner' ? '입문' : courseInfo.level === 'intermediate' ? '중급' : '고급'}
                            </span>
                            <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded">
                              {courseInfo.category === 'video' ? 'AI 영상' : 
                               courseInfo.category === 'image' ? 'AI 이미지' : 
                               courseInfo.category === 'text' ? 'AI 텍스트' : 'AI 음악'}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{courseInfo.description}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1 text-amber-600">
                              <Zap className="w-3 h-3" />
                              수강료: {courseInfo.creditPrice} 크레딧
                            </span>
                            <span className="flex items-center gap-1 text-emerald-600">
                              <Zap className="w-3 h-3" />
                              회차당: {courseInfo.creditsPerSession} 크레딧
                            </span>
                            <span className="text-neutral-500">
                              총 {courseSessions.length}회차
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setCourseInfoForm({...courseInfo});
                            setShowCourseInfoModal(true);
                          }}
                          className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          수정
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-neutral-900">회차별 커리큘럼</h4>
                        <p className="text-xs text-neutral-500">총 {courseSessions.length}회차 · 제공 크레딧 {courseSessions.reduce((sum, s) => sum + (s.credits || 0), 0)} · 테스트 {courseSessions.filter(s => s.hasTest).length}개</p>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingSession(null);
                          setNewSessionForm({ title: '', description: '', credits: 20, hasTest: false });
                          setShowAddSessionModal(true);
                        }}
                        className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        + 회차 추가
                      </button>
                    </div>
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                      {courseSessions.map((item) => (
                        <div key={item.id} className={`rounded-xl border ${item.hasVideo ? 'bg-white border-neutral-200' : 'bg-neutral-50 border-dashed border-neutral-300'}`}>
                          <div className="flex items-start gap-4 p-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.hasVideo ? 'bg-indigo-100 text-indigo-600' : 'bg-neutral-200 text-neutral-400'}`}>
                              {item.session}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium text-neutral-900">{item.title}</h5>
                                {item.hasTest && (
                                  <span className="px-1.5 py-0.5 text-xs bg-violet-100 text-violet-600 rounded">테스트</span>
                                )}
                                {item.timelineNotices && item.timelineNotices.length > 0 && (
                                  <span className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-600 rounded">
                                    공지 {item.timelineNotices.length}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-sm text-neutral-500 mb-2 line-clamp-1">{item.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-neutral-400">
                                {item.hasVideo ? (
                                  <>
                                    <span>{item.duration}</span>
                                    <span>조회 {item.views}회</span>
                                  </>
                                ) : (
                                  <span className="text-amber-500">영상 미등록</span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-amber-500" />
                                  {item.credits} 크레딧
                                </span>
                                {item.examplePrompts && item.examplePrompts.filter(p => p).length > 0 && (
                                  <span className="text-amber-500">
                                    예시 {item.examplePrompts.filter(p => p).length}개
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button 
                                onClick={() => setShowExamplePromptsModal(item)}
                                className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"
                                title="예시 프롬프트"
                              >
                                <Sparkles className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setShowTimelineNoticesModal(item)}
                                className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg"
                                title="예약 공지 설정"
                              >
                                <Bell className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setEditingSession(item);
                                  setNewSessionForm({ 
                                    title: item.title, 
                                    description: item.description || '', 
                                    credits: item.credits || 20, 
                                    hasTest: item.hasTest || false 
                                  });
                                  setShowAddSessionModal(true);
                                }}
                                className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg"
                                title="수정"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              {item.hasVideo ? (
                                <button 
                                  onClick={() => setShowSessionPreviewModal(item)}
                                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                  title="미리보기"
                                >
                                  <Play className="w-4 h-4" />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => {
                                    const updated = courseSessions.map(s => 
                                      s.id === item.id 
                                        ? {...s, hasVideo: true, duration: `${20 + Math.floor(Math.random() * 25)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`}
                                        : s
                                    );
                                    setCourseSessions(updated);
                                    alert('영상이 업로드되었습니다! (데모)');
                                  }}
                                  className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                                  title="영상 업로드"
                                >
                                  <Upload className="w-4 h-4" />
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  if (confirm('이 회차를 삭제하시겠습니까?')) {
                                    setCourseSessions(courseSessions.filter(s => s.id !== item.id));
                                  }
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                title="삭제"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {/* 클래스 공지 탭 */}
                {courseManageTab === 'notice' && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-neutral-900">클래스 공지</h4>
                        <p className="text-xs text-neutral-500">수강생 전체에게 전달되는 공지사항</p>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingNotice(null);
                          setNewNoticeForm({ title: '', content: '', pinned: false });
                          setShowNoticeModal(true);
                        }}
                        className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        + 공지 작성
                      </button>
                    </div>
                    {courseNotices.length > 0 ? (
                      <div className="space-y-3">
                        {courseNotices.map((notice) => (
                          <div key={notice.id} className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-xl hover:border-indigo-200">
                            {notice.pinned && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-600 rounded">고정</span>
                            )}
                            <span className="flex-1 font-medium text-neutral-900">{notice.title}</span>
                            <span className="text-sm text-neutral-400">{notice.date}</span>
                            <button 
                              onClick={() => {
                                setEditingNotice(notice);
                                setNewNoticeForm({ title: notice.title, content: notice.content, pinned: notice.pinned });
                                setShowNoticeModal(true);
                              }}
                              className="text-sm text-neutral-500 hover:text-neutral-700"
                            >
                              수정
                            </button>
                            <button 
                              onClick={() => {
                                if(confirm('공지를 삭제하시겠습니까?')) {
                                  setCourseNotices(courseNotices.filter(n => n.id !== notice.id));
                                }
                              }}
                              className="text-sm text-red-500 hover:text-red-700"
                            >
                              삭제
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-neutral-400">
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>등록된 클래스 공지가 없습니다</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* 테스트 관리 탭 (교육자 전용) */}
        {activeTab === 'tests' && isInstructor && (
          <div className="space-y-6">
            {/* 요약 카드 */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-neutral-200">
                <div className="text-sm text-neutral-500 mb-1">전체 테스트</div>
                <div className="text-2xl font-bold text-neutral-900">{instructorTests.length}개</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-neutral-200">
                <div className="text-sm text-neutral-500 mb-1">진행중</div>
                <div className="text-2xl font-bold text-emerald-600">{instructorTests.filter(t => t.status === 'active').length}개</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-neutral-200">
                <div className="text-sm text-neutral-500 mb-1">채점 대기</div>
                <div className="text-2xl font-bold text-amber-600">{pendingSubmissions.length}건</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-neutral-200">
                <div className="text-sm text-neutral-500 mb-1">평균 점수</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {Math.round(instructorTests.filter(t => t.avgScore).reduce((a, t) => a + t.avgScore, 0) / instructorTests.filter(t => t.avgScore).length)}점
                </div>
              </div>
            </div>

            {/* 채점 대기 목록 */}
            {pendingSubmissions.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    채점 대기 ({pendingSubmissions.length}건)
                  </h3>
                </div>
                <div className="space-y-3">
                  {pendingSubmissions.map(sub => (
                    <div key={sub.id} className="flex items-center gap-4 bg-white rounded-xl p-4">
                      <img src={sub.thumbnail} alt="" className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-neutral-900">{sub.studentName}</span>
                          <span className="text-neutral-400">·</span>
                          <span className="text-sm text-neutral-500">{sub.testTitle}</span>
                        </div>
                        <p className="text-sm text-neutral-500 truncate">{sub.prompt}</p>
                        <p className="text-xs text-neutral-400 mt-1">{sub.submittedAt}</p>
                      </div>
                      <button
                        onClick={() => setSelectedTestForGrading(sub)}
                        className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
                      >
                        채점하기
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 테스트 목록 또는 학생 관리 */}
            {!selectedTestForManage ? (
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">내 테스트</h3>
                  <button
                    onClick={() => setShowNewTestModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    + 새 테스트 만들기
                  </button>
                </div>
                <div className="overflow-hidden rounded-xl border border-neutral-200">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">테스트명</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">연결 강의</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">유형</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">응시/채점</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">평균</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">상태</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {instructorTests.map(test => (
                        <tr key={test.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3">
                            <span className="font-medium text-neutral-900">{test.title}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-600">{test.courseName}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              test.type === 'objective' ? 'bg-blue-100 text-blue-700' :
                              test.type === 'practical' ? 'bg-purple-100 text-purple-700' :
                              'bg-indigo-100 text-indigo-700'
                            }`}>
                              {test.type === 'objective' ? '객관식' : test.type === 'practical' ? '실기' : '혼합'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="text-neutral-900">{test.submissions}</span>
                            <span className="text-neutral-400"> / </span>
                            <span className={test.graded < test.submissions ? 'text-amber-600' : 'text-emerald-600'}>{test.graded}</span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {test.avgScore ? `${test.avgScore}점` : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              test.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                              test.status === 'grading' ? 'bg-amber-100 text-amber-700' :
                              'bg-neutral-100 text-neutral-600'
                            }`}>
                              {test.status === 'active' ? '진행중' : test.status === 'grading' ? '채점중' : '종료'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setSelectedTestForManage(test)}
                              className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              관리
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* 테스트별 학생 관리 화면 */
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <button 
                    onClick={() => setSelectedTestForManage(null)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-neutral-600" />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-neutral-900">{selectedTestForManage.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedTestForManage.type === 'objective' ? 'bg-blue-100 text-blue-700' :
                        selectedTestForManage.type === 'practical' ? 'bg-purple-100 text-purple-700' :
                        'bg-indigo-100 text-indigo-700'
                      }`}>
                        {selectedTestForManage.type === 'objective' ? '객관식' : selectedTestForManage.type === 'practical' ? '실기' : '혼합'}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500">{selectedTestForManage.courseName}</p>
                  </div>
                  {selectedTestForManage.type !== 'objective' && (
                    <button
                      onClick={() => {
                        setIsAIGrading(true);
                        setTimeout(() => {
                          setIsAIGrading(false);
                          alert('AI 자동 채점이 완료되었습니다! 결과를 확인하고 필요시 수정해주세요.');
                        }, 2000);
                      }}
                      disabled={isAIGrading}
                      className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isAIGrading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          AI 채점중...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          AI 전체 채점
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* 통계 카드 */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <div className="text-sm text-neutral-500 mb-1">총 응시자</div>
                    <div className="text-xl font-bold text-neutral-900">{selectedTestForManage.submissions}명</div>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <div className="text-sm text-neutral-500 mb-1">채점 완료</div>
                    <div className="text-xl font-bold text-emerald-600">{selectedTestForManage.graded}명</div>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <div className="text-sm text-neutral-500 mb-1">채점 대기</div>
                    <div className="text-xl font-bold text-amber-600">{selectedTestForManage.submissions - selectedTestForManage.graded}명</div>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <div className="text-sm text-neutral-500 mb-1">평균 점수</div>
                    <div className="text-xl font-bold text-indigo-600">{selectedTestForManage.avgScore || '-'}점</div>
                  </div>
                </div>

                {/* 학생 목록 */}
                <div className="overflow-hidden rounded-xl border border-neutral-200">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">학생</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">제출일</th>
                        {selectedTestForManage.type !== 'objective' && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">AI 추천</th>
                        )}
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">최종 점수</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">상태</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {(testSubmissions[selectedTestForManage.id] || []).map(sub => (
                        <tr key={sub.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-600">{sub.studentName.charAt(0)}</span>
                              </div>
                              <span className="font-medium text-neutral-900">{sub.studentName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-500">{sub.submittedAt}</td>
                          {selectedTestForManage.type !== 'objective' && (
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-violet-600">{sub.aiScore}점</span>
                            </td>
                          )}
                          <td className="px-4 py-3">
                            {sub.score !== null ? (
                              <span className="text-sm font-bold text-neutral-900">{sub.score}점</span>
                            ) : (
                              <span className="text-sm text-neutral-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              sub.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {sub.status === 'graded' ? '채점완료' : '대기중'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setSelectedTestForGrading({...sub, testTitle: selectedTestForManage.title, testType: selectedTestForManage.type});
                                setGradingScore(sub.score !== null ? String(sub.score) : String(sub.aiScore || ''));
                                setGradingFeedback(sub.feedback || '');
                              }}
                              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                sub.status === 'graded' 
                                  ? 'text-neutral-600 hover:bg-neutral-100' 
                                  : 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                              }`}
                            >
                              {sub.status === 'graded' ? '수정' : '채점'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 구독/크레딧 탭 */}
        {activeTab === 'subscription' && (
          <>
        {/* 현재 플랜 */}
        <div className={`border rounded-2xl p-6 mb-6 ${userPlan === 'enterprise' ? 'bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200' : 'bg-white border-neutral-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${userPlan === 'enterprise' ? 'text-violet-900' : 'text-neutral-900'}`}>현재 플랜</h2>
            <div className="flex items-center gap-2">
              {plan.id !== 'free' && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  구독 해지
                </button>
              )}
              {userPlan === 'enterprise' && userEnterpriseTier ? (
                <>
                  <button
                    onClick={() => setShowEnterpriseTierModal(true)}
                    className="px-3 py-1 text-sm text-violet-600 hover:text-violet-700 hover:bg-violet-100 rounded-lg transition-colors"
                  >
                    티어 변경
                  </button>
                  <span className="px-3 py-1 bg-violet-100 text-violet-700 text-sm font-medium rounded-full">
                    {userEnterpriseTier.name}
                  </span>
                </>
              ) : plan.id !== 'enterprise' && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                  {plan.name}
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className={`text-sm mb-1 ${userPlan === 'enterprise' ? 'text-violet-500' : 'text-neutral-500'}`}>플랜명</div>
              <div className={`text-xl font-bold ${userPlan === 'enterprise' ? 'text-violet-900' : 'text-neutral-900'}`}>
                {currentPlanInfo.name}
              </div>
            </div>
            <div>
              <div className={`text-sm mb-1 ${userPlan === 'enterprise' ? 'text-violet-500' : 'text-neutral-500'}`}>월 요금</div>
              <div className={`text-xl font-bold ${userPlan === 'enterprise' ? 'text-violet-900' : 'text-neutral-900'}`}>
                {formatPrice(currentPlanInfo.monthlyPrice)}
              </div>
            </div>
            <div>
              <div className={`text-sm mb-1 ${userPlan === 'enterprise' ? 'text-violet-500' : 'text-neutral-500'}`}>다음 결제일</div>
              <div className={`text-xl font-bold ${userPlan === 'enterprise' ? 'text-violet-900' : 'text-neutral-900'}`}>
                {plan.id === 'free' ? '-' : nextBillingDate}
              </div>
            </div>
          </div>
          
          {/* 플랜 혜택 상세 */}
          <div className={`mt-5 pt-5 border-t ${userPlan === 'enterprise' ? 'border-violet-200' : 'border-neutral-100'}`}>
            <div className="grid grid-cols-4 gap-3">
              <div className={`rounded-xl p-4 text-center ${
                userPlan === 'enterprise' 
                  ? 'bg-gradient-to-br from-violet-100 to-violet-50 border border-violet-200' 
                  : 'bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200'
              }`}>
                <Zap className={`w-5 h-5 mx-auto mb-2 ${userPlan === 'enterprise' ? 'text-violet-500' : 'text-amber-500'}`} />
                <div className={`text-[10px] uppercase tracking-wider mb-1 ${userPlan === 'enterprise' ? 'text-violet-500' : 'text-amber-600'}`}>월 크레딧</div>
                <div className={`text-xl font-bold ${userPlan === 'enterprise' ? 'text-violet-800' : 'text-amber-800'}`}>
                  {userEnterpriseTier 
                    ? (userEnterpriseTier.monthlyCredits === 'unlimited' ? '∞' : userEnterpriseTier.monthlyCredits?.toLocaleString())
                    : plan.monthlyCredits?.toLocaleString()
                  }
                </div>
              </div>
              <div className={`rounded-xl p-4 text-center ${
                userPlan === 'enterprise' 
                  ? 'bg-violet-50 border border-violet-100' 
                  : plan.features?.classAccess === 'credit' 
                    ? 'bg-emerald-50 border border-emerald-100' 
                    : 'bg-neutral-50 border border-neutral-200'
              }`}>
                <BookOpen className={`w-5 h-5 mx-auto mb-2 ${
                  plan.features?.classAccess === 'credit' ? 'text-emerald-500' : 'text-neutral-400'
                }`} />
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">클래스</div>
                <div className={`text-sm font-bold ${
                  plan.features?.classAccess === 'credit' ? 'text-emerald-700' : 'text-neutral-400'
                }`}>
                  {plan.features?.classAccess === 'sample' ? '샘플만' : plan.features?.classAccess === 'credit' ? '수강 가능' : '불가'}
                </div>
              </div>
              <div className={`rounded-xl p-4 text-center ${
                userPlan === 'enterprise' 
                  ? 'bg-violet-50 border border-violet-100' 
                  : plan.features?.liveAccess === 'credit'
                    ? 'bg-rose-50 border border-rose-100'
                    : 'bg-neutral-50 border border-neutral-200'
              }`}>
                <Radio className={`w-5 h-5 mx-auto mb-2 ${
                  plan.features?.liveAccess === 'credit' ? 'text-rose-500' : 'text-neutral-400'
                }`} />
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">라이브</div>
                <div className={`text-sm font-bold ${
                  plan.features?.liveAccess === 'credit' ? 'text-rose-700' : 'text-neutral-400'
                }`}>
                  {plan.features?.liveAccess === 'credit' ? '참여 가능' : '불가'}
                </div>
              </div>
              <div className={`rounded-xl p-4 text-center ${
                userPlan === 'enterprise' 
                  ? 'bg-violet-50 border border-violet-100' 
                  : 'bg-indigo-50 border border-indigo-100'
              }`}>
                <Sparkles className={`w-5 h-5 mx-auto mb-2 ${userPlan === 'enterprise' ? 'text-violet-500' : 'text-indigo-500'}`} />
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">AI 생성</div>
                <div className={`text-sm font-bold ${userPlan === 'enterprise' ? 'text-violet-700' : 'text-indigo-700'}`}>
                  {plan.features?.maxResolution}
                </div>
                <div className="text-[10px] text-neutral-500">
                  동시생성 {userEnterpriseTier?.concurrentJobs || plan.features?.concurrentJobs}개
                </div>
              </div>
            </div>
          </div>
          
          {/* Enterprise 추가 정보 */}
          {userPlan === 'enterprise' && userEnterpriseTier && (
            <div className="mt-4 pt-4 border-t border-violet-200 grid grid-cols-3 gap-4">
              <div className="bg-violet-100/50 rounded-xl p-3 text-center">
                <Users className="w-5 h-5 text-violet-500 mx-auto mb-1" />
                <div className="text-[10px] text-violet-500 mb-1">팀 시트</div>
                <div className="text-lg font-bold text-violet-800">
                  {userEnterpriseTier.teamSeats === 'unlimited' ? '∞' : userEnterpriseTier.teamSeats}
                </div>
              </div>
              <div className="bg-violet-100/50 rounded-xl p-3 text-center">
                <Shield className="w-5 h-5 text-violet-500 mx-auto mb-1" />
                <div className="text-[10px] text-violet-500 mb-1">SLA</div>
                <div className="text-lg font-bold text-violet-800">{userEnterpriseTier.sla || '99.9%'}</div>
              </div>
              <div className="bg-violet-100/50 rounded-xl p-3 text-center">
                <Headphones className="w-5 h-5 text-violet-500 mx-auto mb-1" />
                <div className="text-[10px] text-violet-500 mb-1">지원</div>
                <div className="text-sm font-bold text-violet-800">전담 매니저</div>
              </div>
            </div>
          )}
        </div>
        
        {/* 크레딧 현황 */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">크레딧 현황</h2>
          
          <div className="grid grid-cols-3 gap-6 mb-4">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <Zap className="w-5 h-5" />
                <span className="text-sm font-medium">잔여 크레딧</span>
              </div>
              <div className="text-3xl font-bold text-amber-800">✨ {wallet?.balance || 0}</div>
            </div>
            <div className="bg-neutral-50 rounded-xl p-4">
              <div className="text-sm text-neutral-500 mb-2">이번 달 사용량</div>
              <div className="text-2xl font-bold text-neutral-900">✨ {usedThisMonth}</div>
            </div>
            <div className="bg-neutral-50 rounded-xl p-4">
              <div className="text-sm text-neutral-500 mb-2">예상 생성 가능</div>
              <div className="text-lg font-bold text-neutral-900">
                {(wallet?.balance || 0) === 0 
                  ? '영상 0개'
                  : `영상 약 ${Math.floor((wallet?.balance || 0) / 15)}~${Math.floor((wallet?.balance || 0) / 8)}개`
                }
              </div>
            </div>
          </div>
          
          <div className="text-xs text-neutral-500">
            * 고급 옵션 사용 시 비용이 증가할 수 있습니다
          </div>
        </div>
        
        {/* 플랜 비교 - 카드형 디자인 */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">플랜 비교</h2>
            <span className="text-xs text-neutral-500">현재: {PRICING_PLANS[userPlan]?.name}</span>
          </div>
          
          {/* 플랜 카드 그리드 */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {['free', 'basic', 'pro', 'max', 'enterprise'].map(planId => {
              const p = PRICING_PLANS[planId];
              const isCurrentPlan = userPlan === planId;
              const isPro = planId === 'pro';
              const isEnterprise = planId === 'enterprise';
              
              return (
                <div 
                  key={planId}
                  className={`relative rounded-xl p-4 transition-all ${
                    isCurrentPlan 
                      ? isEnterprise 
                        ? 'bg-gradient-to-br from-violet-100 to-indigo-100 ring-2 ring-violet-400'
                        : 'bg-gradient-to-br from-indigo-50 to-indigo-100 ring-2 ring-indigo-400'
                      : isPro
                        ? 'bg-gradient-to-br from-indigo-50 to-white border border-indigo-200'
                        : isEnterprise
                          ? 'bg-gradient-to-br from-violet-50 to-white border border-violet-200'
                          : 'bg-neutral-50 border border-neutral-200'
                  }`}
                >
                  {isCurrentPlan && (
                    <div className={`absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-medium rounded-full ${
                      isEnterprise ? 'bg-violet-500 text-white' : 'bg-indigo-500 text-white'
                    }`}>
                      현재
                    </div>
                  )}
                  {isPro && !isCurrentPlan && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-medium rounded-full">
                      인기
                    </div>
                  )}
                  
                  <div className="text-center mb-3">
                    <div className={`text-sm font-bold ${
                      isEnterprise ? 'text-violet-700' : isPro ? 'text-indigo-700' : 'text-neutral-800'
                    }`}>{p.name}</div>
                    <div className={`text-[10px] ${
                      isEnterprise ? 'text-violet-500' : isPro ? 'text-indigo-500' : 'text-neutral-500'
                    }`}>{p.description}</div>
                  </div>
                  
                  <div className="text-center mb-3">
                    <div className={`text-lg font-bold ${
                      isEnterprise ? 'text-violet-800' : isPro ? 'text-indigo-800' : 'text-neutral-900'
                    }`}>
                      {isEnterprise ? '₩29만~' : p.monthlyPrice === 0 ? '무료' : `₩${(p.monthlyPrice/1000).toFixed(0)}K`}
                    </div>
                    <div className="text-[10px] text-neutral-400">/월</div>
                  </div>
                  
                  <div className={`text-center py-2 rounded-lg mb-3 ${
                    isEnterprise ? 'bg-violet-200/50' : isPro ? 'bg-indigo-200/50' : 'bg-neutral-200/50'
                  }`}>
                    <div className={`text-xs font-semibold ${
                      isEnterprise ? 'text-violet-700' : isPro ? 'text-indigo-700' : 'text-neutral-700'
                    }`}>
                      {isEnterprise ? '10,000+' : p.monthlyCredits?.toLocaleString()} 크레딧
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {p.features?.classAccess === 'credit' ? (
                        <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <span className="w-3 h-3 flex items-center justify-center text-neutral-400 flex-shrink-0">−</span>
                      )}
                      <span className={p.features?.classAccess === 'credit' ? 'text-neutral-700' : 'text-neutral-400'}>
                        클래스 {p.features?.classAccess === 'credit' ? '수강' : '샘플만'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {p.features?.liveAccess === 'credit' ? (
                        <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <X className="w-3 h-3 text-neutral-300 flex-shrink-0" />
                      )}
                      <span className={p.features?.liveAccess === 'credit' ? 'text-neutral-700' : 'text-neutral-400'}>
                        라이브
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      <span className="text-neutral-700">{p.features?.maxResolution}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      <span className="text-neutral-700">동시생성 {p.features?.concurrentJobs}개</span>
                    </div>
                    {isEnterprise && (
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-violet-500 flex-shrink-0" />
                        <span className="text-violet-700 font-medium">전담 매니저</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* 크레딧 소비 가이드 */}
          <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-neutral-800">크레딧 소비 가이드</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 border border-neutral-200">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-medium text-neutral-800">클래스</span>
                </div>
                <div className="text-lg font-bold text-neutral-900">1,500<span className="text-neutral-400 font-normal">~</span>3,000</div>
                <div className="text-[10px] text-neutral-500">강의당</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-neutral-200">
                <div className="flex items-center gap-2 mb-1">
                  <Radio className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-medium text-neutral-800">라이브</span>
                </div>
                <div className="text-lg font-bold text-neutral-900">800<span className="text-neutral-400 font-normal">~</span>1,500</div>
                <div className="text-[10px] text-neutral-500">회당</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-neutral-200">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <span className="text-xs font-medium text-neutral-800">AI 생성</span>
                </div>
                <div className="text-sm font-bold text-neutral-900">
                  <span className="text-neutral-600">영상</span> 15~80
                  <span className="mx-1 text-neutral-300">|</span>
                  <span className="text-neutral-600">이미지</span> 8~25
                </div>
                <div className="text-[10px] text-neutral-500">건당</div>
              </div>
            </div>
          </div>
        </div>

        {/* 플랜 변경 */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">플랜 변경</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  billingCycle === 'monthly' 
                    ? 'bg-neutral-900 text-white' 
                    : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                월간
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  billingCycle === 'yearly' 
                    ? 'bg-neutral-900 text-white' 
                    : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                연간 20%↓
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-3">
            {['free', 'basic', 'pro', 'max', 'enterprise'].map(planId => {
              const p = PRICING_PLANS[planId];
              const isCurrentPlan = userPlan === planId;
              const price = billingCycle === 'yearly' ? p.yearlyPrice : p.monthlyPrice;
              const isEnterprise = planId === 'enterprise';
              
              // Enterprise 티어 가격 범위
              const enterpriseMinPrice = billingCycle === 'yearly' 
                ? PRICING_PLANS.enterprise.tiers[0].yearlyPrice 
                : PRICING_PLANS.enterprise.tiers[0].monthlyPrice;
              const enterpriseMaxPrice = billingCycle === 'yearly'
                ? PRICING_PLANS.enterprise.tiers[1].yearlyPrice
                : PRICING_PLANS.enterprise.tiers[1].monthlyPrice;
              
              return (
                <div 
                  key={planId}
                  className={`border rounded-xl p-4 transition-all flex flex-col h-full ${
                    isCurrentPlan 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : isEnterprise
                        ? 'border-violet-300 bg-gradient-to-br from-violet-50 to-indigo-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {/* 헤더 */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-semibold ${isEnterprise ? 'text-violet-900' : 'text-neutral-900'}`}>{p.name}</span>
                    {p.popular && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">인기</span>
                    )}
                    {isEnterprise && !isCurrentPlan && (
                      <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs rounded-full">4개 티어</span>
                    )}
                  </div>
                  
                  {/* 콘텐츠 영역 - 고정 높이 */}
                  <div className="flex-1 min-h-[72px]">
                    {isEnterprise ? (
                      <>
                        <div className="text-sm font-bold text-violet-900 mb-1">
                          {formatPrice(enterpriseMinPrice)}
                          <span className="text-xs text-violet-500 font-normal"> ~ </span>
                          {formatPrice(enterpriseMaxPrice)}
                        </div>
                        <div className="text-xs text-violet-600 mb-1">
                          ✨ 20,000 ~ 120,000+/월
                        </div>
                        <div className="text-xs text-violet-500">
                          Team · Business · Scale · Unlimited
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-lg font-bold mb-1 text-neutral-900">
                          {formatPrice(price)}
                          <span className="text-xs text-neutral-500 font-normal">/{billingCycle === 'yearly' ? '년' : '월'}</span>
                        </div>
                        <div className="text-xs text-neutral-500">✨ {p.monthlyCredits?.toLocaleString()}/월</div>
                      </>
                    )}
                  </div>
                  
                  {/* 버튼 - 하단 고정 */}
                  <button
                    onClick={() => {
                      if (isCurrentPlan) return;
                      if (isEnterprise) {
                        setShowEnterpriseTierModal(true);
                      } else {
                        handlePlanChangeClick(planId);
                      }
                    }}
                    disabled={isCurrentPlan}
                    className={`w-full py-2 rounded-lg text-xs font-medium transition-colors mt-3 ${
                      isCurrentPlan 
                        ? 'bg-indigo-600 text-white cursor-default'
                        : isEnterprise
                          ? 'bg-violet-600 text-white hover:bg-violet-700'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {isCurrentPlan ? '사용 중' : isEnterprise ? '티어 선택하기 →' : '변경하기'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Enterprise 팀 관리 섹션 */}
        {userPlan === 'enterprise' && (
          <div className="bg-white border border-violet-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-violet-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  팀 크레딧 관리
                </h2>
                <p className="text-sm text-violet-600 mt-1">구성원들의 크레딧을 배분하고 사용량을 관리하세요</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowExcelUploadModal(true)}
                  className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-200 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  엑셀로 추가
                </button>
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  멤버 추가
                </button>
              </div>
            </div>

            {/* 크레딧 풀 요약 */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-violet-50 rounded-xl p-4">
                <div className="text-xs text-violet-600 mb-1">총 크레딧</div>
                <div className="text-2xl font-bold text-violet-900">✨ {enterpriseMonthlyCredits.toLocaleString()}</div>
              </div>
              <div className="bg-indigo-50 rounded-xl p-4">
                <div className="text-xs text-indigo-600 mb-1">배분된 크레딧</div>
                <div className="text-2xl font-bold text-indigo-900">✨ {totalTeamCredits.toLocaleString()}</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="text-xs text-emerald-600 mb-1">미배분 풀</div>
                <div className="text-2xl font-bold text-emerald-900">✨ {poolCredits.toLocaleString()}</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="text-xs text-amber-600 mb-1">팀 사용량</div>
                <div className="text-2xl font-bold text-amber-900">✨ {usedTeamCredits.toLocaleString()}</div>
              </div>
            </div>

            {/* 크레딧 사용률 바 */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                <span>크레딧 배분 현황</span>
                <span>{Math.round((totalTeamCredits / enterpriseMonthlyCredits) * 100)}% 배분됨</span>
              </div>
              <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full flex">
                  <div 
                    className="bg-amber-400 transition-all"
                    style={{ width: `${(usedTeamCredits / enterpriseMonthlyCredits) * 100}%` }}
                  />
                  <div 
                    className="bg-violet-400 transition-all"
                    style={{ width: `${((totalTeamCredits - usedTeamCredits) / enterpriseMonthlyCredits) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full"></span> 사용됨</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-violet-400 rounded-full"></span> 배분됨 (미사용)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-neutral-200 rounded-full"></span> 미배분</span>
              </div>
            </div>

            {/* 팀 멤버 테이블 */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">멤버</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">역할</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">배분 크레딧</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">사용량</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">상태</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">최근 활동</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {teamMembers.map(member => (
                    <tr key={member.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-medium text-sm">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-neutral-900">{member.name}</div>
                            <div className="text-xs text-neutral-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={member.role}
                          onChange={(e) => handleChangeRole(member.id, e.target.value)}
                          className="text-xs bg-neutral-100 border-0 rounded-lg px-2 py-1 font-medium"
                        >
                          <option value="admin">관리자</option>
                          <option value="member">멤버</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={member.credits}
                            onChange={(e) => handleUpdateMemberCredits(member.id, parseInt(e.target.value) || 0)}
                            className="w-20 text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 text-right"
                          />
                          <span className="text-xs text-neutral-500">✨</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${member.usedCredits >= member.credits ? 'bg-red-400' : 'bg-emerald-400'}`}
                              style={{ width: `${Math.min((member.usedCredits / member.credits) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-neutral-600">{member.usedCredits.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          member.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {member.status === 'active' ? '활성' : '대기중'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500">
                        {member.lastActive}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 좌석 정보 */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-neutral-500">
                사용 중인 좌석: <span className="font-medium text-neutral-900">{teamMembers.length}</span> / {userEnterpriseTier?.teamSeats === 'unlimited' ? '무제한' : `${userEnterpriseTier?.teamSeats || plan.features?.teamSeats || 10}석`}
              </span>
              {userEnterpriseTier?.teamSeats !== 'unlimited' && teamMembers.length >= (userEnterpriseTier?.teamSeats || plan.features?.teamSeats || 10) && (
                <button className="text-violet-600 hover:text-violet-700 font-medium">
                  + 좌석 추가 구매
                </button>
              )}
            </div>
          </div>
        )}

        {/* 멤버 추가 모달 */}
        {showAddMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddMemberModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-6">새 멤버 초대</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">이름</label>
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="홍길동"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">이메일</label>
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="email@company.com"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">초기 크레딧 배분</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={newMemberCredits}
                        onChange={(e) => setNewMemberCredits(parseInt(e.target.value) || 0)}
                        className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                      <span className="text-neutral-500">✨</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">미배분 풀: ✨ {poolCredits.toLocaleString()} 사용 가능</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddMemberModal(false)}
                    className="flex-1 py-3 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleAddMember}
                    disabled={!newMemberEmail || !newMemberName || newMemberCredits > poolCredits}
                    className="flex-1 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
                  >
                    초대 보내기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 엑셀 업로드 모달 */}
        {showExcelUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => {
              if (excelUploadStep !== 'complete') {
                setShowExcelUploadModal(false);
                setExcelFile(null);
                setExcelPreviewData([]);
                setExcelUploadStep('upload');
              }
            }} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-neutral-900">엑셀로 멤버 일괄 추가</h3>
                  <button 
                    onClick={() => {
                      setShowExcelUploadModal(false);
                      setExcelFile(null);
                      setExcelPreviewData([]);
                      setExcelUploadStep('upload');
                    }}
                    className="p-2 hover:bg-neutral-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                </div>

                {excelUploadStep === 'upload' && (
                  <>
                    {/* 업로드 영역 */}
                    <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center mb-6">
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleExcelFileChange}
                        className="hidden"
                        id="excel-upload"
                      />
                      <label htmlFor="excel-upload" className="cursor-pointer">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-8 h-8 text-emerald-600" />
                        </div>
                        <p className="text-neutral-700 font-medium mb-1">엑셀 파일을 업로드하세요</p>
                        <p className="text-sm text-neutral-500">xlsx, xls, csv 파일 지원</p>
                      </label>
                    </div>

                    {/* 템플릿 다운로드 */}
                    <div className="bg-neutral-50 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-neutral-900">템플릿 파일이 필요하신가요?</p>
                          <p className="text-xs text-neutral-500">이름, 이메일, 크레딧 열이 포함된 양식입니다</p>
                        </div>
                        <button className="px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          템플릿 다운로드
                        </button>
                      </div>
                    </div>

                    {/* 안내 */}
                    <div className="text-sm text-neutral-500">
                      <p className="font-medium text-neutral-700 mb-2">엑셀 파일 형식 안내</p>
                      <ul className="space-y-1 ml-4 list-disc">
                        <li>첫 번째 행은 헤더로 인식됩니다</li>
                        <li>필수 열: 이름, 이메일, 크레딧</li>
                        <li>최대 100명까지 한 번에 추가 가능합니다</li>
                      </ul>
                    </div>
                  </>
                )}

                {excelUploadStep === 'preview' && (
                  <>
                    {/* 파일 정보 */}
                    <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900">{excelFile?.name}</p>
                        <p className="text-xs text-neutral-500">{excelPreviewData.length}명 감지됨</p>
                      </div>
                      <button 
                        onClick={() => {
                          setExcelFile(null);
                          setExcelPreviewData([]);
                          setExcelUploadStep('upload');
                        }}
                        className="text-sm text-neutral-500 hover:text-neutral-700"
                      >
                        다른 파일
                      </button>
                    </div>

                    {/* 미리보기 테이블 */}
                    <div className="border border-neutral-200 rounded-xl overflow-hidden mb-4 max-h-64 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-neutral-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-neutral-600">이름</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-neutral-600">이메일</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-neutral-600">크레딧</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-neutral-600">삭제</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {excelPreviewData.map((item, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50">
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => handleExcelPreviewEdit(idx, 'name', e.target.value)}
                                  className="w-full text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-violet-300 rounded px-1"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="email"
                                  value={item.email}
                                  onChange={(e) => handleExcelPreviewEdit(idx, 'email', e.target.value)}
                                  className="w-full text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-violet-300 rounded px-1"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="number"
                                  value={item.credits}
                                  onChange={(e) => handleExcelPreviewEdit(idx, 'credits', e.target.value)}
                                  className="w-20 text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-violet-300 rounded px-1 text-right"
                                />
                              </td>
                              <td className="px-4 py-2 text-right">
                                <button
                                  onClick={() => handleExcelPreviewRemove(idx)}
                                  className="p-1 text-neutral-400 hover:text-red-500 rounded"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* 요약 */}
                    <div className="bg-violet-50 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-violet-700">총 배분 크레딧</span>
                        <span className="font-bold text-violet-900">
                          ✨ {excelPreviewData.reduce((sum, m) => sum + m.credits, 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-violet-700">미배분 풀 잔여</span>
                        <span className={`font-bold ${poolCredits - excelPreviewData.reduce((sum, m) => sum + m.credits, 0) < 0 ? 'text-red-600' : 'text-violet-900'}`}>
                          ✨ {(poolCredits - excelPreviewData.reduce((sum, m) => sum + m.credits, 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setExcelFile(null);
                          setExcelPreviewData([]);
                          setExcelUploadStep('upload');
                        }}
                        className="flex-1 py-3 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition-colors"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleExcelImport}
                        disabled={excelPreviewData.length === 0 || poolCredits - excelPreviewData.reduce((sum, m) => sum + m.credits, 0) < 0}
                        className="flex-1 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        {excelPreviewData.length}명 추가하기
                      </button>
                    </div>
                  </>
                )}

                {excelUploadStep === 'complete' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h4 className="text-lg font-bold text-neutral-900 mb-2">추가 완료!</h4>
                    <p className="text-neutral-600">{excelPreviewData.length}명의 멤버가 추가되었습니다</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enterprise 티어 선택 모달 */}
        {showEnterpriseTierModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowEnterpriseTierModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* 헤더 */}
              <div className="px-6 py-5 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-violet-900">Enterprise 플랜 선택</h2>
                    <p className="text-sm text-violet-600 mt-0.5">비즈니스 규모에 맞는 플랜을 선택하세요</p>
                  </div>
                  <button onClick={() => setShowEnterpriseTierModal(false)} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-violet-500" />
                  </button>
                </div>
              </div>

              {/* 결제 주기 토글 */}
              <div className="px-6 py-4 bg-violet-50/50 border-b border-violet-100">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      billingCycle === 'monthly' 
                        ? 'bg-violet-600 text-white' 
                        : 'bg-white text-neutral-600 border border-violet-200'
                    }`}
                  >
                    월간 결제
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      billingCycle === 'yearly' 
                        ? 'bg-violet-600 text-white' 
                        : 'bg-white text-neutral-600 border border-violet-200'
                    }`}
                  >
                    연간 결제 <span className="text-xs ml-1 text-emerald-500">20% 할인</span>
                  </button>
                </div>
              </div>

              {/* Enterprise 티어 그리드 */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-4 gap-4">
                  {enterpriseTiers.map((tier) => {
                    const price = billingCycle === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice;
                    const isUnlimited = tier.id === 'enterprise-unlimited';
                    const isCurrentTier = userEnterpriseTier?.id === tier.id;
                    
                    return (
                      <div 
                        key={tier.id}
                        className={`relative border rounded-2xl p-4 transition-all flex flex-col h-full ${
                          isCurrentTier
                            ? 'border-indigo-500 ring-2 ring-indigo-100 bg-indigo-50'
                            : tier.popular 
                              ? 'border-violet-500 ring-2 ring-violet-100 bg-gradient-to-br from-violet-50 to-white' 
                              : isUnlimited
                                ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50'
                                : 'border-violet-200 hover:border-violet-300 bg-white'
                        }`}
                      >
                        {isCurrentTier && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full">
                            현재 티어
                          </div>
                        )}
                        {!isCurrentTier && tier.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-violet-600 text-white text-xs font-medium rounded-full">
                            추천
                          </div>
                        )}
                        {!isCurrentTier && isUnlimited && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                            대기업
                          </div>
                        )}
                        
                        {/* 헤더 */}
                        <div className="text-center mb-3">
                          <h3 className={`text-lg font-bold ${isUnlimited ? 'text-amber-900' : 'text-violet-900'}`}>{tier.name}</h3>
                          <p className="text-xs text-violet-600 mt-1 h-8">{tier.description}</p>
                        </div>
                        
                        {/* 가격 */}
                        <div className="text-center mb-3">
                          <div className={`text-2xl font-bold ${isUnlimited ? 'text-amber-900' : 'text-violet-900'}`}>
                            {price ? `₩${price.toLocaleString()}` : '별도 협의'}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {isUnlimited ? '맞춤 견적' : billingCycle === 'yearly' ? '/ 년' : '/ 월'}
                          </div>
                        </div>
                        
                        {/* 기능 목록 - flex-1로 확장 */}
                        <div className="space-y-1.5 text-xs flex-1">
                          <div className="flex items-center gap-2">
                            <Zap className={`w-3.5 h-3.5 ${isUnlimited ? 'text-amber-500' : 'text-violet-500'}`} />
                            <span className={isUnlimited ? 'text-amber-700' : 'text-violet-700'}>
                              {tier.monthlyCredits ? `월 ✨ ${tier.monthlyCredits.toLocaleString()}` : '무제한'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className={`w-3.5 h-3.5 ${isUnlimited ? 'text-amber-500' : 'text-violet-500'}`} />
                            <span className={isUnlimited ? 'text-amber-600' : 'text-violet-600'}>
                              팀 {tier.teamSeats === 'unlimited' ? '무제한' : `${tier.teamSeats}석`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className={`w-3.5 h-3.5 ${isUnlimited ? 'text-amber-400' : 'text-violet-400'}`} />
                            <span className={isUnlimited ? 'text-amber-600' : 'text-violet-600'}>SLA {tier.sla}</span>
                          </div>
                        </div>
                        
                        {/* 버튼 - 하단 고정 */}
                        <button
                          onClick={() => {
                            if (isCurrentTier) return;
                            if (isUnlimited) {
                              setShowEnterpriseTierModal(false);
                              setShowQuoteRequestModal(true);
                              setQuoteRequestStep('form');
                            } else {
                              setSelectedEnterpriseTier(tier);
                              setSelectedPlanForPayment('enterprise');
                              setShowEnterpriseTierModal(false);
                              setPaymentStep('info');
                              setShowPaymentModal(true);
                            }
                          }}
                          disabled={isCurrentTier}
                          className={`w-full py-2 rounded-xl text-xs font-medium transition-colors mt-4 ${
                            isCurrentTier
                              ? 'bg-indigo-600 text-white cursor-default'
                              : isUnlimited
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : tier.popular
                                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                                  : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                          }`}
                        >
                          {isCurrentTier ? '사용 중' : isUnlimited ? '견적 문의' : '선택'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Enterprise 공통 혜택 */}
                <div className="mt-5 bg-violet-50 rounded-xl p-4">
                  <h4 className="font-semibold text-violet-900 mb-2 text-sm">모든 Enterprise 플랜 공통 혜택</h4>
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-violet-700">
                      <Check className="w-3.5 h-3.5 text-violet-500" />
                      전담 계정 매니저
                    </div>
                    <div className="flex items-center gap-1.5 text-violet-700">
                      <Check className="w-3.5 h-3.5 text-violet-500" />
                      우선 기술 지원
                    </div>
                    <div className="flex items-center gap-1.5 text-violet-700">
                      <Check className="w-3.5 h-3.5 text-violet-500" />
                      API 액세스
                    </div>
                    <div className="flex items-center gap-1.5 text-violet-700">
                      <Check className="w-3.5 h-3.5 text-violet-500" />
                      맞춤형 교육 세션
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 견적 문의 모달 */}
        {showQuoteRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => {
              if (quoteRequestStep !== 'complete') {
                setShowQuoteRequestModal(false);
              }
            }} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              {quoteRequestStep === 'form' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-amber-900">Enterprise Unlimited</h3>
                      <p className="text-sm text-amber-600 mt-1">맞춤 견적을 위한 정보를 입력해주세요</p>
                    </div>
                    <button 
                      onClick={() => setShowQuoteRequestModal(false)}
                      className="p-2 hover:bg-neutral-100 rounded-lg"
                    >
                      <X className="w-5 h-5 text-neutral-500" />
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">회사명 *</label>
                        <input
                          type="text"
                          value={quoteForm.companyName}
                          onChange={(e) => setQuoteForm({...quoteForm, companyName: e.target.value})}
                          placeholder="(주)회사이름"
                          className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">담당자명 *</label>
                        <input
                          type="text"
                          value={quoteForm.contactName}
                          onChange={(e) => setQuoteForm({...quoteForm, contactName: e.target.value})}
                          placeholder="홍길동"
                          className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">이메일 *</label>
                        <input
                          type="email"
                          value={quoteForm.email}
                          onChange={(e) => setQuoteForm({...quoteForm, email: e.target.value})}
                          placeholder="contact@company.com"
                          className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">연락처 *</label>
                        <input
                          type="tel"
                          value={quoteForm.phone}
                          onChange={(e) => setQuoteForm({...quoteForm, phone: e.target.value})}
                          placeholder="010-1234-5678"
                          className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">예상 사용 인원</label>
                        <select
                          value={quoteForm.teamSize}
                          onChange={(e) => setQuoteForm({...quoteForm, teamSize: e.target.value})}
                          className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white"
                        >
                          <option value="">선택해주세요</option>
                          <option value="100-200">100~200명</option>
                          <option value="200-500">200~500명</option>
                          <option value="500-1000">500~1,000명</option>
                          <option value="1000+">1,000명 이상</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">예상 월 사용량</label>
                        <select
                          value={quoteForm.expectedUsage}
                          onChange={(e) => setQuoteForm({...quoteForm, expectedUsage: e.target.value})}
                          className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm bg-white"
                        >
                          <option value="">선택해주세요</option>
                          <option value="200000-500000">20만~50만 크레딧</option>
                          <option value="500000-1000000">50만~100만 크레딧</option>
                          <option value="1000000+">100만 크레딧 이상</option>
                          <option value="unlimited">무제한</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">추가 요청사항</label>
                      <textarea
                        value={quoteForm.message}
                        onChange={(e) => setQuoteForm({...quoteForm, message: e.target.value})}
                        placeholder="특별히 필요한 기능이나 요구사항이 있으시면 알려주세요"
                        rows={3}
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm resize-none"
                      />
                    </div>
                  </div>

                  {/* Unlimited 혜택 안내 */}
                  <div className="bg-amber-50 rounded-xl p-4 mb-6">
                    <h4 className="text-sm font-semibold text-amber-900 mb-2">Unlimited 플랜 혜택</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-amber-700">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-500" />
                        무제한 크레딧
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-500" />
                        무제한 팀 시트
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-500" />
                        SLA 99.99% 보장
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-500" />
                        전용 인프라 제공
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowQuoteRequestModal(false)}
                      className="flex-1 py-3 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => {
                        // Mock: 견적 문의 제출
                        setQuoteRequestStep('complete');
                      }}
                      disabled={!quoteForm.companyName || !quoteForm.contactName || !quoteForm.email || !quoteForm.phone}
                      className="flex-1 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
                    >
                      견적 요청하기
                    </button>
                  </div>
                </div>
              )}

              {quoteRequestStep === 'complete' && (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">견적 요청 완료!</h3>
                  <p className="text-neutral-600 text-sm mb-6">
                    담당자가 확인 후 영업일 기준 1~2일 내에<br />
                    입력하신 연락처로 연락드리겠습니다.
                  </p>
                  <button
                    onClick={() => {
                      setShowQuoteRequestModal(false);
                      setQuoteRequestStep('form');
                      setQuoteForm({
                        companyName: '',
                        contactName: '',
                        email: '',
                        phone: '',
                        teamSize: '',
                        expectedUsage: '',
                        message: ''
                      });
                    }}
                    className="w-full py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
                  >
                    확인
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 최근 크레딧 사용 내역 */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">최근 크레딧 사용 내역</h2>
          
          {recentGenerations.length > 0 ? (
            <div className="space-y-3">
              {recentGenerations.map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Video className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-900">영상 생성</div>
                      <div className="text-xs text-neutral-500">
                        {new Date(entry.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-red-500">-✨ {entry.amount}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500 text-sm">
              아직 사용 내역이 없습니다
            </div>
          )}
        </div>
          </>
        )}

        {/* 설정 탭 */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* 프로필 정보 */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900">프로필 정보</h2>
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    수정
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleProfileSave}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                    >
                      저장
                    </button>
                  </div>
                )}
              </div>
              
              {profileSaved && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  프로필이 저장되었습니다.
                </div>
              )}
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">이름</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-neutral-50 rounded-xl text-neutral-900">{user?.name || '-'}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">이메일</label>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-neutral-50 rounded-xl text-neutral-900">{user?.email || '-'}</div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">연락처</label>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="010-0000-0000"
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-neutral-50 rounded-xl text-neutral-900">{profileForm.phone || '-'}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">소속</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileForm.institution}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, institution: e.target.value }))}
                        placeholder="소속 기관명"
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-neutral-50 rounded-xl text-neutral-900">{profileForm.institution || '-'}</div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">자기소개</label>
                  {isEditingProfile ? (
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="자기소개를 입력하세요"
                      rows={3}
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-neutral-50 rounded-xl text-neutral-500">
                      {profileForm.bio || '소개글이 없습니다'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 계정 정보 */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">계정 정보</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <div>
                    <div className="font-medium text-neutral-900">계정 유형</div>
                    <div className="text-sm text-neutral-500">{user?.role === 'instructor' ? '교육자 계정' : '수강생 계정'}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user?.role === 'instructor' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {user?.role === 'instructor' ? '교육자' : '수강생'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <div>
                    <div className="font-medium text-neutral-900">가입일</div>
                    <div className="text-sm text-neutral-500">2024년 1월 15일</div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-neutral-900">비밀번호</div>
                    <div className="text-sm text-neutral-500">마지막 변경: 30일 전</div>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    변경
                  </button>
                </div>
              </div>
            </div>

            {/* 알림 설정 */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">알림 설정</h2>
              <div className="space-y-4">
                {[
                  { id: 'email', label: '이메일 알림', desc: '새로운 강의, 라이브 알림을 이메일로 받습니다' },
                  { id: 'marketing', label: '마케팅 수신', desc: '프로모션 및 이벤트 정보를 받습니다' },
                  { id: 'credit', label: '크레딧 알림', desc: '크레딧 부족 시 알림을 받습니다' }
                ].map(setting => (
                  <div key={setting.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium text-neutral-900">{setting.label}</div>
                      <div className="text-sm text-neutral-500">{setting.desc}</div>
                    </div>
                    <button className="relative w-12 h-6 bg-indigo-600 rounded-full transition-colors">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 구독 해지 확인 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 text-center mb-2">구독을 해지하시겠습니까?</h3>
              <p className="text-neutral-600 text-sm text-center mb-6">
                구독을 해지하면 현재 결제 기간이 끝난 후<br />
                무료 플랜으로 전환됩니다.
              </p>
              
              <div className="bg-neutral-50 rounded-xl p-4 mb-6">
                <div className="text-sm text-neutral-500 mb-2">해지 시 변경 사항</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-neutral-700">
                    <X className="w-4 h-4 text-red-500" />
                    월간 크레딧: {plan.monthlyCredits} → 50
                  </li>
                  <li className="flex items-center gap-2 text-neutral-700">
                    <X className="w-4 h-4 text-red-500" />
                    해상도 제한: {plan.features?.maxResolution || '720p'} → 720p
                  </li>
                  <li className="flex items-center gap-2 text-neutral-700">
                    <X className="w-4 h-4 text-red-500" />
                    Pro/Max 모델 사용 불가
                  </li>
                </ul>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleCancelPlan}
                  className="flex-1 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
                >
                  해지하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 결제 모달 */}
      {showPaymentModal && selectedPlanForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => paymentStep !== 'processing' && setShowPaymentModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {paymentStep === 'info' && (
              <div className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-6">결제 정보 입력</h3>
                
                {/* 선택한 플랜 정보 */}
                <div className={`rounded-xl p-4 mb-6 ${selectedPlanForPayment === 'enterprise' ? 'bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200' : 'bg-indigo-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-sm font-medium ${selectedPlanForPayment === 'enterprise' ? 'text-violet-600' : 'text-indigo-600'}`}>선택한 플랜</div>
                      <div className="text-lg font-bold text-neutral-900">
                        {selectedPlanForPayment === 'enterprise' && selectedEnterpriseTier 
                          ? `Enterprise ${selectedEnterpriseTier.name}`
                          : PRICING_PLANS[selectedPlanForPayment]?.name
                        }
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-neutral-900">
                        {selectedPlanForPayment === 'enterprise' && selectedEnterpriseTier
                          ? formatPrice(billingCycle === 'yearly' ? selectedEnterpriseTier.yearlyPrice : selectedEnterpriseTier.monthlyPrice)
                          : formatPrice(billingCycle === 'yearly' 
                              ? PRICING_PLANS[selectedPlanForPayment]?.yearlyPrice 
                              : PRICING_PLANS[selectedPlanForPayment]?.monthlyPrice
                            )
                        }
                      </div>
                      <div className="text-xs text-neutral-500">/{billingCycle === 'yearly' ? '년' : '월'}</div>
                    </div>
                  </div>
                  {selectedPlanForPayment === 'enterprise' && selectedEnterpriseTier && (
                    <div className="mt-3 pt-3 border-t border-violet-200">
                      <div className="text-xs text-violet-700 space-y-1">
                        <div>✓ 월 {selectedEnterpriseTier.monthlyCredits ? `${selectedEnterpriseTier.monthlyCredits.toLocaleString()} 크레딧` : '무제한 크레딧'} · 팀 {selectedEnterpriseTier.teamSeats === 'unlimited' ? '무제한' : `${selectedEnterpriseTier.teamSeats}석`} 포함</div>
                        <div>✓ 전담 계정 매니저 · 우선 기술 지원</div>
                        <div>✓ API 액세스 · SLA {selectedEnterpriseTier.sla} 보장</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 카드 정보 입력 */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">카드 번호</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">유효기간</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">CVC</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="000"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={!cardNumber || !cardExpiry || !cardCvc}
                    className={`flex-1 py-3 font-medium rounded-xl transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed ${
                      selectedPlanForPayment === 'enterprise'
                        ? 'bg-violet-600 text-white hover:bg-violet-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    결제하기
                  </button>
                </div>
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="p-6 text-center py-16">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">결제 처리 중...</h3>
                <p className="text-sm text-neutral-500">잠시만 기다려주세요</p>
              </div>
            )}

            {paymentStep === 'complete' && (
              <div className="p-6 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${selectedPlanForPayment === 'enterprise' ? 'bg-violet-100' : 'bg-emerald-100'}`}>
                  <Check className={`w-8 h-8 ${selectedPlanForPayment === 'enterprise' ? 'text-violet-600' : 'text-emerald-600'}`} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">결제 완료!</h3>
                <p className="text-neutral-600 text-sm mb-6">
                  {selectedPlanForPayment === 'enterprise' && selectedEnterpriseTier ? (
                    <>
                      Enterprise {selectedEnterpriseTier.name} 플랜이 활성화되었습니다.<br />
                      ✨ {selectedEnterpriseTier.monthlyCredits?.toLocaleString() || '무제한'} 크레딧이 충전되었습니다.
                    </>
                  ) : (
                    <>
                      {PRICING_PLANS[selectedPlanForPayment]?.name} 플랜이 활성화되었습니다.<br />
                      ✨ {PRICING_PLANS[selectedPlanForPayment]?.monthlyCredits?.toLocaleString()} 크레딧이 충전되었습니다.
                    </>
                  )}
                </p>
                <button
                  onClick={handlePaymentComplete}
                  className={`w-full py-3 font-medium rounded-xl transition-colors ${
                    selectedPlanForPayment === 'enterprise' 
                      ? 'bg-violet-600 text-white hover:bg-violet-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  확인
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 다운그레이드 확인 모달 */}
      {showDowngradeModal && selectedPlanForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDowngradeModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 text-center mb-2">플랜을 변경하시겠습니까?</h3>
              <p className="text-neutral-600 text-sm text-center mb-6">
                <span className="font-medium">{plan.name}</span>에서{' '}
                <span className="font-medium">{PRICING_PLANS[selectedPlanForPayment]?.name}</span>으로 변경됩니다.
              </p>
              
              <div className="bg-amber-50 rounded-xl p-4 mb-6">
                <div className="text-sm text-amber-800 font-medium mb-2">변경 시 주의사항</div>
                <ul className="space-y-2 text-sm text-amber-700">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>현재 결제 기간 종료 후 적용됩니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>월간 크레딧이 {plan.monthlyCredits}에서 {PRICING_PLANS[selectedPlanForPayment]?.monthlyCredits}으로 감소합니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>일부 고급 기능 사용이 제한될 수 있습니다</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDowngradeModal(false)}
                  className="flex-1 py-3 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleDowngradeConfirm}
                  className="flex-1 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
                >
                  변경하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 새 라이브 만들기 모달 */}
      {showNewLiveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col my-auto">
            <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-neutral-200">
              <h2 className="text-lg font-bold text-neutral-900">새 라이브 만들기</h2>
              <button 
                onClick={() => setShowNewLiveModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">라이브 제목 *</label>
                <input
                  type="text"
                  value={newLiveForm.title}
                  onChange={(e) => setNewLiveForm({...newLiveForm, title: e.target.value})}
                  placeholder="예: AI 영상 제작 실습"
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">연결할 클래스</label>
                <select
                  value={newLiveForm.courseId}
                  onChange={(e) => setNewLiveForm({...newLiveForm, courseId: parseInt(e.target.value)})}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  {instructorCourses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">날짜 *</label>
                  <input
                    type="date"
                    value={newLiveForm.date}
                    onChange={(e) => setNewLiveForm({...newLiveForm, date: e.target.value})}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">시작 시간 *</label>
                  <input
                    type="time"
                    value={newLiveForm.time}
                    onChange={(e) => setNewLiveForm({...newLiveForm, time: e.target.value})}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">예상 진행 시간</label>
                  <select
                    value={newLiveForm.duration}
                    onChange={(e) => setNewLiveForm({...newLiveForm, duration: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value={30}>30분</option>
                    <option value={60}>1시간</option>
                    <option value={90}>1시간 30분</option>
                    <option value={120}>2시간</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">최대 참가자</label>
                  <input
                    type="number"
                    value={newLiveForm.maxParticipants}
                    onChange={(e) => setNewLiveForm({...newLiveForm, maxParticipants: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">라이브 설명</label>
                <textarea
                  value={newLiveForm.description}
                  onChange={(e) => setNewLiveForm({...newLiveForm, description: e.target.value})}
                  placeholder="라이브에서 다룰 내용을 간단히 설명해주세요"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>
              
              {/* 요약 */}
              <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
                <h4 className="text-sm font-semibold text-rose-900 mb-2 flex items-center gap-1">
                  <Radio className="w-4 h-4" />
                  라이브 요약
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-rose-600">일시:</span>
                    <span className="font-medium text-rose-900 ml-1">
                      {newLiveForm.date && newLiveForm.time 
                        ? `${newLiveForm.date} ${newLiveForm.time}` 
                        : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-rose-600">진행 시간:</span>
                    <span className="font-medium text-rose-900 ml-1">{newLiveForm.duration}분</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 flex gap-3 p-5 border-t border-neutral-200">
              <button
                onClick={() => setShowNewLiveModal(false)}
                className="flex-1 py-2.5 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  alert('라이브가 생성되었습니다! 예정된 라이브 목록에서 확인하세요.');
                  setShowNewLiveModal(false);
                  setNewLiveForm({ title: '', courseId: 1, date: '', time: '', duration: 60, description: '', maxParticipants: 50 });
                }}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors"
              >
                라이브 생성
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수강생 상세 모달 */}
      {showStudentDetailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col my-auto">
            <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-neutral-200">
              <h2 className="text-lg font-bold text-neutral-900">수강생 정보</h2>
              <button 
                onClick={() => setShowStudentDetailModal(null)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-600">{showStudentDetailModal.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">{showStudentDetailModal.name}</h3>
                  <p className="text-sm text-neutral-500">{showStudentDetailModal.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-neutral-50 rounded-xl p-4">
                  <div className="text-sm text-neutral-500 mb-1">진도율</div>
                  <div className="text-xl font-bold text-indigo-600">{showStudentDetailModal.progress}%</div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <div className="text-sm text-neutral-500 mb-1">크레딧 사용</div>
                  <div className="text-xl font-bold text-amber-600">{showStudentDetailModal.credits}</div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <div className="text-sm text-neutral-500 mb-1">등록일</div>
                  <div className="text-lg font-semibold text-neutral-900">{showStudentDetailModal.joinDate}</div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <div className="text-sm text-neutral-500 mb-1">최근 활동</div>
                  <div className="text-lg font-semibold text-neutral-900">{showStudentDetailModal.lastActive}</div>
                </div>
              </div>
              
              <h4 className="font-semibold text-neutral-900 mb-3">완료한 회차</h4>
              <div className="flex flex-wrap gap-2">
                {showStudentDetailModal.completedSessions.map(session => (
                  <span key={session} className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                    {session}회차
                  </span>
                ))}
                {showStudentDetailModal.completedSessions.length === 0 && (
                  <span className="text-sm text-neutral-400">완료한 회차가 없습니다</span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 p-5 border-t border-neutral-200">
              <button
                onClick={() => setShowStudentDetailModal(null)}
                className="w-full py-2.5 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 회차 추가/수정 모달 */}
      {showAddSessionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full my-auto">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200">
              <h2 className="text-lg font-bold text-neutral-900">
                {editingSession ? '회차 수정' : '새 회차 추가'}
              </h2>
              <button 
                onClick={() => {
                  setShowAddSessionModal(false);
                  setEditingSession(null);
                }}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">회차 제목 *</label>
                <input
                  type="text"
                  value={newSessionForm.title}
                  onChange={(e) => setNewSessionForm({...newSessionForm, title: e.target.value})}
                  placeholder="예: 프롬프트 기초"
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">설명 (선택)</label>
                <textarea
                  value={newSessionForm.description}
                  onChange={(e) => setNewSessionForm({...newSessionForm, description: e.target.value})}
                  placeholder="이 회차에서 다룰 내용을 간단히 설명하세요"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    <Zap className="w-4 h-4 inline mr-1 text-amber-500" />
                    제공 크레딧
                  </label>
                  <input
                    type="number"
                    value={newSessionForm.credits}
                    onChange={(e) => setNewSessionForm({...newSessionForm, credits: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSessionForm.hasTest}
                      onChange={(e) => setNewSessionForm({...newSessionForm, hasTest: e.target.checked})}
                      className="w-5 h-5 text-indigo-600 rounded"
                    />
                    <span className="text-sm text-neutral-700">테스트 포함</span>
                  </label>
                </div>
              </div>
              
              {/* 수정 모드일 때 영상 관리 옵션 */}
              {editingSession && (
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                  <h4 className="text-sm font-medium text-neutral-700 mb-3">영상 관리</h4>
                  {editingSession.hasVideo ? (
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-emerald-600">✓ 영상 등록됨</span>
                        <span className="text-neutral-400 ml-2">{editingSession.duration}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowSessionPreviewModal(editingSession)}
                          className="px-3 py-1.5 text-xs text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                        >
                          미리보기
                        </button>
                        <button 
                          onClick={() => alert('영상을 교체합니다 (데모)')}
                          className="px-3 py-1.5 text-xs text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200"
                        >
                          교체
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        const updated = courseSessions.map(s => 
                          s.id === editingSession.id 
                            ? {...s, hasVideo: true, duration: `${20 + Math.floor(Math.random() * 25)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`}
                            : s
                        );
                        setCourseSessions(updated);
                        setEditingSession({...editingSession, hasVideo: true});
                        alert('영상이 업로드되었습니다!');
                      }}
                      className="w-full py-2 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
                    >
                      <Upload className="w-4 h-4 inline mr-1" />
                      영상 업로드
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t border-neutral-200">
              <button
                onClick={() => {
                  setShowAddSessionModal(false);
                  setEditingSession(null);
                }}
                className="flex-1 py-2.5 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (editingSession) {
                    setCourseSessions(courseSessions.map(s => 
                      s.id === editingSession.id 
                        ? {
                            ...s, 
                            title: newSessionForm.title,
                            description: newSessionForm.description,
                            credits: newSessionForm.credits,
                            hasTest: newSessionForm.hasTest
                          } 
                        : s
                    ));
                    alert('회차가 수정되었습니다!');
                  } else {
                    const newSession = {
                      id: Math.max(...courseSessions.map(s => s.id), 0) + 1,
                      session: courseSessions.length + 1,
                      title: newSessionForm.title,
                      description: newSessionForm.description,
                      duration: '',
                      views: 0,
                      hasVideo: false,
                      credits: newSessionForm.credits,
                      hasTest: newSessionForm.hasTest
                    };
                    setCourseSessions([...courseSessions, newSession]);
                    alert('새 회차가 추가되었습니다!');
                  }
                  setShowAddSessionModal(false);
                  setEditingSession(null);
                }}
                disabled={!newSessionForm.title}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {editingSession ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 회차 미리보기 모달 */}
      {showSessionPreviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-auto">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-neutral-900">{showSessionPreviewModal.session}회차</h2>
                  {showSessionPreviewModal.hasTest && (
                    <span className="px-2 py-0.5 text-xs bg-violet-100 text-violet-600 rounded">테스트 포함</span>
                  )}
                </div>
                <p className="text-sm text-neutral-500">{showSessionPreviewModal.title}</p>
              </div>
              <button 
                onClick={() => setShowSessionPreviewModal(null)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            <div className="p-5">
              <div className="bg-neutral-900 rounded-xl aspect-video flex items-center justify-center mb-4">
                <div className="text-center">
                  <Play className="w-16 h-16 text-white/80 mx-auto mb-2" />
                  <p className="text-white/60 text-sm">영상 미리보기</p>
                </div>
              </div>
              
              {/* 회차 정보 */}
              {showSessionPreviewModal.description && (
                <div className="mb-4 p-4 bg-neutral-50 rounded-xl">
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">회차 설명</h4>
                  <p className="text-sm text-neutral-600">{showSessionPreviewModal.description}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-neutral-500">
                <span>재생 시간: {showSessionPreviewModal.duration}</span>
                <span>조회수: {showSessionPreviewModal.views}회</span>
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-500" />
                  제공 크레딧: {showSessionPreviewModal.credits || 20}
                </span>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-neutral-200">
              <button
                onClick={() => setShowSessionPreviewModal(null)}
                className="flex-1 py-2.5 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  alert('전체 화면으로 재생합니다 (데모)');
                }}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
              >
                전체 화면 재생
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 클래스 공지 작성/수정 모달 */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full my-auto">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200">
              <h2 className="text-lg font-bold text-neutral-900">
                {editingNotice ? '클래스 공지 수정' : '클래스 공지 작성'}
              </h2>
              <button 
                onClick={() => {
                  setShowNoticeModal(false);
                  setEditingNotice(null);
                }}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">제목 *</label>
                <input
                  type="text"
                  value={newNoticeForm.title}
                  onChange={(e) => setNewNoticeForm({...newNoticeForm, title: e.target.value})}
                  placeholder="공지 제목"
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">내용 *</label>
                <textarea
                  value={newNoticeForm.content}
                  onChange={(e) => setNewNoticeForm({...newNoticeForm, content: e.target.value})}
                  placeholder="공지 내용을 입력하세요"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newNoticeForm.pinned}
                  onChange={(e) => setNewNoticeForm({...newNoticeForm, pinned: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm text-neutral-700">상단 고정</span>
              </label>
            </div>
            <div className="flex gap-3 p-5 border-t border-neutral-200">
              <button
                onClick={() => {
                  setShowNoticeModal(false);
                  setEditingNotice(null);
                }}
                className="flex-1 py-2.5 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50"
              >
                취소
              </button>
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  if (editingNotice) {
                    setCourseNotices(courseNotices.map(n => 
                      n.id === editingNotice.id 
                        ? {...n, title: newNoticeForm.title, content: newNoticeForm.content, pinned: newNoticeForm.pinned}
                        : n
                    ));
                    alert('공지가 수정되었습니다!');
                  } else {
                    const newNotice = {
                      id: Math.max(...courseNotices.map(n => n.id), 0) + 1,
                      title: newNoticeForm.title,
                      content: newNoticeForm.content,
                      date: today,
                      pinned: newNoticeForm.pinned
                    };
                    setCourseNotices([newNotice, ...courseNotices]);
                    alert('공지가 등록되었습니다!');
                  }
                  setShowNoticeModal(false);
                  setEditingNotice(null);
                }}
                disabled={!newNoticeForm.title || !newNoticeForm.content}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {editingNotice ? '수정' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 클래스 기본 정보 수정 모달 */}
      {showCourseInfoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col my-auto">
            <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-neutral-200">
              <h2 className="text-lg font-bold text-neutral-900">클래스 정보 수정</h2>
              <button 
                onClick={() => setShowCourseInfoModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">클래스명 *</label>
                <input
                  type="text"
                  value={courseInfoForm.title}
                  onChange={(e) => setCourseInfoForm({...courseInfoForm, title: e.target.value})}
                  placeholder="예: AI 영상 제작 마스터 클래스"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">클래스 소개 *</label>
                <textarea
                  value={courseInfoForm.description}
                  onChange={(e) => setCourseInfoForm({...courseInfoForm, description: e.target.value})}
                  placeholder="수강생에게 보여질 클래스 소개를 입력하세요"
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">카테고리</label>
                  <select
                    value={courseInfoForm.category}
                    onChange={(e) => setCourseInfoForm({...courseInfoForm, category: e.target.value})}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="video">AI 영상 생성</option>
                    <option value="image">AI 이미지 생성</option>
                    <option value="text">AI 텍스트 생성</option>
                    <option value="music">AI 음악 생성</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">난이도</label>
                  <select
                    value={courseInfoForm.level}
                    onChange={(e) => setCourseInfoForm({...courseInfoForm, level: e.target.value})}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="beginner">입문</option>
                    <option value="intermediate">중급</option>
                    <option value="advanced">고급</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">총 회차</label>
                  <div className="px-4 py-3 bg-neutral-100 border border-neutral-200 rounded-xl text-neutral-700">
                    {courseSessions.length}회 <span className="text-xs text-neutral-500">(커리큘럼에서 수정)</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    <Zap className="w-4 h-4 inline mr-1 text-amber-500" />
                    수강료 (크레딧)
                  </label>
                  <input
                    type="number"
                    value={courseInfoForm.creditPrice}
                    onChange={(e) => setCourseInfoForm({...courseInfoForm, creditPrice: parseInt(e.target.value) || 0})}
                    placeholder="150"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  <Zap className="w-4 h-4 inline mr-1 text-emerald-500" />
                  회차당 제공 크레딧
                </label>
                <p className="text-xs text-neutral-500 mb-2">수강생이 실습에 사용할 수 있는 크레딧</p>
                <input
                  type="number"
                  value={courseInfoForm.creditsPerSession}
                  onChange={(e) => setCourseInfoForm({...courseInfoForm, creditsPerSession: parseInt(e.target.value) || 0})}
                  placeholder="20"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 크레딧 요약 */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  크레딧 요약
                </h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-amber-600">수강료:</span>
                    <span className="font-bold text-amber-900 ml-1">{courseInfoForm.creditPrice} 크레딧</span>
                  </div>
                  <div>
                    <span className="text-amber-600">총 제공:</span>
                    <span className="font-bold text-amber-900 ml-1">{courseSessions.length * (courseInfoForm.creditsPerSession || 0)} 크레딧</span>
                  </div>
                  <div>
                    <span className="text-amber-600">회차당:</span>
                    <span className="font-bold text-amber-900 ml-1">{courseInfoForm.creditsPerSession || 0} 크레딧</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 flex gap-3 p-5 border-t border-neutral-200">
              <button
                onClick={() => setShowCourseInfoModal(false)}
                className="flex-1 py-2.5 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setCourseInfo({...courseInfoForm});
                  setShowCourseInfoModal(false);
                  alert('클래스 정보가 수정되었습니다!');
                }}
                disabled={!courseInfoForm.title || !courseInfoForm.description}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 예시 프롬프트 편집 모달 */}
      {showExamplePromptsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col my-auto">
            <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-neutral-200">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">{showExamplePromptsModal.session}회차 예시 프롬프트</h2>
                <p className="text-sm text-neutral-500">{showExamplePromptsModal.title}</p>
              </div>
              <button 
                onClick={() => setShowExamplePromptsModal(null)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-5">
              <p className="text-sm text-neutral-500 mb-4">
                수강생에게 이 회차에서 만들 수 있는 결과물의 예시를 보여주세요.
              </p>
              <div className="space-y-3">
                {(showExamplePromptsModal.examplePrompts || ['', '', '']).map((prompt, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs font-medium mt-2 flex-shrink-0">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <textarea
                      value={prompt}
                      onChange={(e) => {
                        const updated = courseSessions.map(s => {
                          if (s.id === showExamplePromptsModal.id) {
                            const newPrompts = [...(s.examplePrompts || ['', '', ''])];
                            newPrompts[idx] = e.target.value;
                            return {...s, examplePrompts: newPrompts};
                          }
                          return s;
                        });
                        setCourseSessions(updated);
                        setShowExamplePromptsModal({
                          ...showExamplePromptsModal,
                          examplePrompts: updated.find(s => s.id === showExamplePromptsModal.id)?.examplePrompts
                        });
                      }}
                      placeholder={`예시 프롬프트 ${idx + 1}: "도시의 밤하늘을 배경으로 한 시네마틱 드론 샷..."`}
                      rows={2}
                      className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-sm"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  const updated = courseSessions.map(s => {
                    if (s.id === showExamplePromptsModal.id) {
                      return {...s, examplePrompts: [...(s.examplePrompts || []), '']};
                    }
                    return s;
                  });
                  setCourseSessions(updated);
                  setShowExamplePromptsModal({
                    ...showExamplePromptsModal,
                    examplePrompts: updated.find(s => s.id === showExamplePromptsModal.id)?.examplePrompts
                  });
                }}
                className="mt-3 w-full py-2 text-sm text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50"
              >
                + 예시 추가
              </button>
            </div>
            <div className="flex-shrink-0 flex gap-3 p-5 border-t border-neutral-200">
              <button
                onClick={() => setShowExamplePromptsModal(null)}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 타임라인 예약 공지 모달 */}
      {showTimelineNoticesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col my-auto">
            <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-semibold">
                  {showTimelineNoticesModal.session}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">예약 공지 설정</h2>
                  <p className="text-sm text-neutral-500">{showTimelineNoticesModal.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-orange-600 font-medium">
                  {(showTimelineNoticesModal.timelineNotices || []).length}개 활성
                </span>
                <button 
                  onClick={() => setShowTimelineNoticesModal(null)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-5">
              <p className="text-sm text-neutral-500 mb-4">
                영상 재생 중 특정 시간에 표시될 공지를 설정하세요.
              </p>
              
              {/* 공지 목록 */}
              <div className="space-y-3 mb-4">
                {(showTimelineNoticesModal.timelineNotices || []).map((notice, idx) => (
                  <div key={notice.id} className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-lg">▶</span>
                        <input
                          type="text"
                          value={notice.time}
                          onChange={(e) => {
                            const updated = courseSessions.map(s => {
                              if (s.id === showTimelineNoticesModal.id) {
                                const newNotices = [...(s.timelineNotices || [])];
                                newNotices[idx] = {...newNotices[idx], time: e.target.value};
                                return {...s, timelineNotices: newNotices};
                              }
                              return s;
                            });
                            setCourseSessions(updated);
                            setShowTimelineNoticesModal({
                              ...showTimelineNoticesModal,
                              timelineNotices: updated.find(s => s.id === showTimelineNoticesModal.id)?.timelineNotices
                            });
                          }}
                          placeholder="MM:SS"
                          className="w-16 px-2 py-1 text-sm border border-neutral-200 rounded text-center"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <select
                          value={notice.type}
                          onChange={(e) => {
                            const updated = courseSessions.map(s => {
                              if (s.id === showTimelineNoticesModal.id) {
                                const newNotices = [...(s.timelineNotices || [])];
                                newNotices[idx] = {...newNotices[idx], type: e.target.value};
                                return {...s, timelineNotices: newNotices};
                              }
                              return s;
                            });
                            setCourseSessions(updated);
                            setShowTimelineNoticesModal({
                              ...showTimelineNoticesModal,
                              timelineNotices: updated.find(s => s.id === showTimelineNoticesModal.id)?.timelineNotices
                            });
                          }}
                          className={`px-2 py-1 text-xs rounded border-0 ${
                            notice.type === 'start' ? 'bg-emerald-100 text-emerald-700' :
                            notice.type === 'practice' ? 'bg-amber-100 text-amber-700' :
                            notice.type === 'hint' ? 'bg-violet-100 text-violet-700' :
                            'bg-blue-100 text-blue-700'
                          }`}
                        >
                          <option value="start">📋 시작</option>
                          <option value="practice">✏️ 실습</option>
                          <option value="hint">💡 힌트</option>
                          <option value="info">📢 알림</option>
                        </select>
                        <textarea
                          value={notice.message}
                          onChange={(e) => {
                            const updated = courseSessions.map(s => {
                              if (s.id === showTimelineNoticesModal.id) {
                                const newNotices = [...(s.timelineNotices || [])];
                                newNotices[idx] = {...newNotices[idx], message: e.target.value};
                                return {...s, timelineNotices: newNotices};
                              }
                              return s;
                            });
                            setCourseSessions(updated);
                            setShowTimelineNoticesModal({
                              ...showTimelineNoticesModal,
                              timelineNotices: updated.find(s => s.id === showTimelineNoticesModal.id)?.timelineNotices
                            });
                          }}
                          placeholder="공지 메시지를 입력하세요..."
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => {
                            const updated = courseSessions.map(s => {
                              if (s.id === showTimelineNoticesModal.id) {
                                const newNotices = (s.timelineNotices || []).filter((_, i) => i !== idx);
                                return {...s, timelineNotices: newNotices};
                              }
                              return s;
                            });
                            setCourseSessions(updated);
                            setShowTimelineNoticesModal({
                              ...showTimelineNoticesModal,
                              timelineNotices: updated.find(s => s.id === showTimelineNoticesModal.id)?.timelineNotices
                            });
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 새 공지 추가 */}
              <button
                onClick={() => {
                  const newNotice = {
                    id: Date.now(),
                    time: '',
                    type: 'info',
                    message: ''
                  };
                  const updated = courseSessions.map(s => {
                    if (s.id === showTimelineNoticesModal.id) {
                      return {...s, timelineNotices: [...(s.timelineNotices || []), newNotice]};
                    }
                    return s;
                  });
                  setCourseSessions(updated);
                  setShowTimelineNoticesModal({
                    ...showTimelineNoticesModal,
                    timelineNotices: updated.find(s => s.id === showTimelineNoticesModal.id)?.timelineNotices
                  });
                }}
                className="w-full py-3 text-sm text-orange-600 border border-orange-200 rounded-xl hover:bg-orange-50 flex items-center justify-center gap-2"
              >
                + 새 공지 추가
              </button>
              
              {/* 입력 영역 */}
              <div className="mt-4 bg-orange-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="MM:SS"
                    className="w-16 px-2 py-2 text-sm border border-orange-200 rounded-lg text-center bg-white"
                  />
                  <select className="px-3 py-2 text-sm border border-orange-200 rounded-lg bg-white">
                    <option value="info">📢 정보</option>
                    <option value="start">📋 시작</option>
                    <option value="practice">✏️ 실습</option>
                    <option value="hint">💡 힌트</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="공지 메시지를 입력하세요..."
                  className="w-full mt-2 px-3 py-2 text-sm border border-orange-200 rounded-lg bg-white"
                />
                <button className="w-full mt-2 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                  추가
                </button>
              </div>
            </div>
            <div className="flex-shrink-0 flex gap-3 p-5 border-t border-neutral-200">
              <button
                onClick={() => setShowTimelineNoticesModal(null)}
                className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 새 테스트 만들기 모달 */}
      {showNewTestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col my-auto">
            <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-neutral-200">
              <h2 className="text-lg font-bold text-neutral-900">새 테스트 만들기</h2>
              <button 
                onClick={() => setShowNewTestModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">테스트명 *</label>
                <input
                  type="text"
                  value={newTestForm.title}
                  onChange={(e) => setNewTestForm({...newTestForm, title: e.target.value})}
                  placeholder="예: 1회차 이해도 점검"
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">연결할 클래스</label>
                <select
                  value={newTestForm.courseId}
                  onChange={(e) => setNewTestForm({...newTestForm, courseId: parseInt(e.target.value)})}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {instructorCourses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">테스트 유형</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'objective', label: '객관식', desc: '자동 채점' },
                    { id: 'practical', label: '실기', desc: 'AI 생성 과제' },
                    { id: 'mixed', label: '혼합', desc: '객관식 + 실기' }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setNewTestForm({...newTestForm, type: type.id})}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        newTestForm.type === type.id
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-neutral-500">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">제한 시간 (분)</label>
                  <input
                    type="number"
                    value={newTestForm.timeLimit}
                    onChange={(e) => setNewTestForm({...newTestForm, timeLimit: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">합격 점수</label>
                  <input
                    type="number"
                    value={newTestForm.passingScore}
                    onChange={(e) => setNewTestForm({...newTestForm, passingScore: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              {(newTestForm.type === 'practical' || newTestForm.type === 'mixed') && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <label className="block text-sm font-medium text-amber-900 mb-1">
                    <Zap className="w-4 h-4 inline mr-1" />
                    실기용 제공 크레딧
                  </label>
                  <input
                    type="number"
                    value={newTestForm.practicalCredits}
                    onChange={(e) => setNewTestForm({...newTestForm, practicalCredits: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <p className="text-xs text-amber-600 mt-1">학생이 실기 과제 수행 시 사용할 수 있는 크레딧</p>
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0 flex gap-3 p-5 border-t border-neutral-200">
              <button
                onClick={() => setShowNewTestModal(false)}
                className="flex-1 py-2.5 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  alert('테스트가 생성되었습니다! 문제 출제 페이지로 이동합니다. (데모)');
                  setShowNewTestModal(false);
                  setNewTestForm({ title: '', courseId: 1, type: 'mixed', timeLimit: 30, passingScore: 60, practicalCredits: 10 });
                }}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                테스트 만들기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 채점 모달 */}
      {selectedTestForGrading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col my-auto">
            <div className="flex-shrink-0 p-5 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">
                    {selectedTestForGrading.status === 'graded' ? '채점 수정' : '실기 채점'}
                  </h2>
                  <p className="text-sm text-neutral-500">{selectedTestForGrading.testTitle} · {selectedTestForGrading.studentName}</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedTestForGrading(null);
                    setGradingScore('');
                    setGradingFeedback('');
                  }}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 min-h-0 overflow-y-auto p-5">
              {/* 제출물 - 실기인 경우만 */}
              {selectedTestForGrading.thumbnail && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-neutral-700 mb-2">제출된 결과물</h3>
                  <div className="bg-neutral-100 rounded-xl overflow-hidden">
                    <img src={selectedTestForGrading.thumbnail} alt="" className="w-full h-48 object-cover" />
                  </div>
                </div>
              )}
              
              {/* 프롬프트 */}
              {selectedTestForGrading.prompt && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-neutral-700 mb-2">사용한 프롬프트</h3>
                  <div className="bg-neutral-50 rounded-xl p-3">
                    <p className="text-sm text-neutral-700">{selectedTestForGrading.prompt}</p>
                  </div>
                </div>
              )}

              {/* AI 추천 점수 */}
              {selectedTestForGrading.aiScore && (
                <div className="mb-4 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-violet-500" />
                      <span className="text-sm font-semibold text-violet-900">AI 추천 점수</span>
                    </div>
                    <span className="text-2xl font-bold text-violet-600">{selectedTestForGrading.aiScore}점</span>
                  </div>
                  <p className="text-xs text-violet-600 mt-2">AI가 프롬프트 완성도, 결과물 품질, 창의성을 분석하여 산출한 점수입니다.</p>
                  <button
                    onClick={() => setGradingScore(String(selectedTestForGrading.aiScore))}
                    className="mt-2 px-3 py-1.5 bg-violet-100 text-violet-700 text-xs font-medium rounded-lg hover:bg-violet-200 transition-colors"
                  >
                    AI 점수 적용하기
                  </button>
                </div>
              )}
              
              {/* 채점 입력 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">최종 점수 (100점 만점)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradingScore}
                    onChange={(e) => setGradingScore(e.target.value)}
                    placeholder="점수 입력"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-semibold"
                  />
                  {selectedTestForGrading.aiScore && gradingScore && parseInt(gradingScore) !== selectedTestForGrading.aiScore && (
                    <p className="text-xs text-amber-600 mt-1">
                      AI 추천 대비 {parseInt(gradingScore) > selectedTestForGrading.aiScore ? '+' : ''}{parseInt(gradingScore) - selectedTestForGrading.aiScore}점 조정됨
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">피드백 (선택)</label>
                  <textarea
                    rows={3}
                    value={gradingFeedback}
                    onChange={(e) => setGradingFeedback(e.target.value)}
                    placeholder="학생에게 전달할 피드백을 작성하세요"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 flex gap-3 p-5 border-t border-neutral-200 bg-neutral-50">
              <button
                onClick={() => {
                  setSelectedTestForGrading(null);
                  setGradingScore('');
                  setGradingFeedback('');
                }}
                className="px-5 py-2.5 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-white transition-colors"
              >
                취소
              </button>
              <div className="flex-1" />
              <button
                onClick={() => {
                  alert(`채점이 완료되었습니다!\n점수: ${gradingScore}점\n피드백: ${gradingFeedback || '없음'}`);
                  setSelectedTestForGrading(null);
                  setGradingScore('');
                  setGradingFeedback('');
                }}
                disabled={!gradingScore}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedTestForGrading.status === 'graded' ? '수정 완료' : '채점 완료'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 새 클래스 만들기 모달 */}
      {showNewCourseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col my-auto">
            {/* 헤더 */}
            <div className="flex-shrink-0 p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">새 클래스 만들기</h2>
                  <p className="text-sm text-neutral-500 mt-1">단계 {newCourseStep} / 3</p>
                </div>
                <button 
                  onClick={() => {
                    setShowNewCourseModal(false);
                    setNewCourseStep(1);
                  }}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* 스텝 인디케이터 */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map(step => (
                  <div key={step} className="flex-1 flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                      step < newCourseStep ? 'bg-emerald-500 text-white' :
                      step === newCourseStep ? 'bg-indigo-600 text-white' :
                      'bg-neutral-200 text-neutral-500'
                    }`}>
                      {step < newCourseStep ? <Check className="w-4 h-4" /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`flex-1 h-1 mx-2 rounded ${
                        step < newCourseStep ? 'bg-emerald-500' : 'bg-neutral-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-neutral-500">
                <span>기본 정보</span>
                <span>회차 설정</span>
                <span>미디어</span>
              </div>
            </div>
            
            {/* 컨텐츠 */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6">
              {/* 스텝 1: 기본 정보 */}
              {newCourseStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">클래스명 *</label>
                    <input
                      type="text"
                      value={newCourseForm.title}
                      onChange={(e) => setNewCourseForm({...newCourseForm, title: e.target.value})}
                      placeholder="예: AI 영상 제작 마스터 클래스"
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">클래스 소개 *</label>
                    <textarea
                      value={newCourseForm.description}
                      onChange={(e) => setNewCourseForm({...newCourseForm, description: e.target.value})}
                      placeholder="수강생에게 보여질 클래스 소개를 입력하세요"
                      rows={4}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">카테고리</label>
                      <select
                        value={newCourseForm.category}
                        onChange={(e) => setNewCourseForm({...newCourseForm, category: e.target.value})}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="video">AI 영상 생성</option>
                        <option value="image">AI 이미지 생성</option>
                        <option value="text">AI 텍스트 생성</option>
                        <option value="music">AI 음악 생성</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">난이도</label>
                      <select
                        value={newCourseForm.level}
                        onChange={(e) => setNewCourseForm({...newCourseForm, level: e.target.value})}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="beginner">입문</option>
                        <option value="intermediate">중급</option>
                        <option value="advanced">고급</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">총 회차</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="4"
                          max="20"
                          value={newCourseForm.sessions}
                          onChange={(e) => {
                            const count = parseInt(e.target.value);
                            setNewCourseForm({
                              ...newCourseForm, 
                              sessions: count,
                              sessionDetails: initSessionDetails(count)
                            });
                          }}
                          className="flex-1"
                        />
                        <span className="text-lg font-semibold text-indigo-600 w-12 text-center">{newCourseForm.sessions}회</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        <Zap className="w-4 h-4 inline mr-1 text-amber-500" />
                        수강료 (크레딧)
                      </label>
                      <input
                        type="number"
                        value={newCourseForm.creditPrice}
                        onChange={(e) => setNewCourseForm({...newCourseForm, creditPrice: parseInt(e.target.value) || 0})}
                        placeholder="150"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      <Zap className="w-4 h-4 inline mr-1 text-emerald-500" />
                      회차당 제공 크레딧
                    </label>
                    <p className="text-xs text-neutral-500 mb-2">수강생이 실습에 사용할 수 있는 크레딧</p>
                    <input
                      type="number"
                      value={newCourseForm.creditsPerSession}
                      onChange={(e) => setNewCourseForm({...newCourseForm, creditsPerSession: parseInt(e.target.value) || 0})}
                      placeholder="20"
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* 크레딧 요약 */}
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      크레딧 요약
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-amber-600">수강료:</span>
                        <span className="font-bold text-amber-900 ml-1">{newCourseForm.creditPrice} 크레딧</span>
                      </div>
                      <div>
                        <span className="text-amber-600">총 제공:</span>
                        <span className="font-bold text-amber-900 ml-1">{newCourseForm.sessions * newCourseForm.creditsPerSession} 크레딧</span>
                      </div>
                      <div>
                        <span className="text-amber-600">회차당:</span>
                        <span className="font-bold text-amber-900 ml-1">{newCourseForm.creditsPerSession} 크레딧</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 스텝 2: 회차별 설정 */}
              {newCourseStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-neutral-900">회차별 커리큘럼 설정</h4>
                      <p className="text-xs text-neutral-500">각 회차의 제목과 상세 설정을 입력하세요</p>
                    </div>
                    <button
                      onClick={() => {
                        const defaultTitles = [
                          '오리엔테이션 및 기초 개념',
                          '핵심 도구 사용법',
                          '기본 프롬프트 작성',
                          '고급 프롬프트 기법',
                          '스타일 적용하기',
                          '실전 프로젝트 1',
                          '피드백 및 수정',
                          '실전 프로젝트 2',
                          '고급 활용 기법',
                          '최종 프로젝트',
                          '포트폴리오 완성',
                          '마무리 및 Q&A'
                        ];
                        const autoFilled = getSessionDetails().map((s, idx) => ({
                          ...s,
                          title: defaultTitles[idx] || `${idx + 1}회차 수업`,
                          description: ''
                        }));
                        setNewCourseForm({...newCourseForm, sessionDetails: autoFilled});
                      }}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      자동 채우기
                    </button>
                  </div>
                  
                  <div className="max-h-[45vh] overflow-y-auto space-y-3 pr-1">
                    {getSessionDetails().map((session, idx) => (
                      <div key={idx} className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                            {session.session}
                          </div>
                          <div className="flex-1 space-y-3">
                            <input
                              type="text"
                              value={session.title}
                              onChange={(e) => {
                                const updated = [...getSessionDetails()];
                                updated[idx] = {...updated[idx], title: e.target.value};
                                setNewCourseForm({...newCourseForm, sessionDetails: updated});
                              }}
                              placeholder={`${idx + 1}회차 제목`}
                              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                            <textarea
                              value={session.description}
                              onChange={(e) => {
                                const updated = [...getSessionDetails()];
                                updated[idx] = {...updated[idx], description: e.target.value};
                                setNewCourseForm({...newCourseForm, sessionDetails: updated});
                              }}
                              placeholder="회차 설명 (선택)"
                              rows={2}
                              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                            />
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <span className="text-xs text-neutral-500">제공 크레딧:</span>
                                <input
                                  type="number"
                                  value={session.credits}
                                  onChange={(e) => {
                                    const updated = [...getSessionDetails()];
                                    updated[idx] = {...updated[idx], credits: parseInt(e.target.value) || 0};
                                    setNewCourseForm({...newCourseForm, sessionDetails: updated});
                                  }}
                                  className="w-16 px-2 py-1 border border-neutral-200 rounded text-sm text-center"
                                />
                              </div>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={session.hasTest}
                                  onChange={(e) => {
                                    const updated = [...getSessionDetails()];
                                    updated[idx] = {...updated[idx], hasTest: e.target.checked};
                                    setNewCourseForm({...newCourseForm, sessionDetails: updated});
                                  }}
                                  className="w-4 h-4 text-indigo-600 rounded"
                                />
                                <span className="text-xs text-neutral-600">테스트 포함</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* 요약 */}
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-indigo-700">총 {newCourseForm.sessions}회차</span>
                      <span className="text-indigo-700">
                        총 제공 크레딧: {getSessionDetails().reduce((sum, s) => sum + (s.credits || 0), 0)}
                      </span>
                      <span className="text-indigo-700">
                        테스트: {getSessionDetails().filter(s => s.hasTest).length}개
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 스텝 3: 미디어 & 클래스 영상 업로드 */}
              {newCourseStep === 3 && (
                <div className="space-y-6">
                  {/* 썸네일 업로드 */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">클래스 썸네일 *</label>
                    <div className="border-2 border-dashed border-neutral-300 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer">
                      {newCourseForm.thumbnail ? (
                        <div className="relative inline-block">
                          <img src={newCourseForm.thumbnail} alt="썸네일" className="h-24 rounded-lg" />
                          <button 
                            onClick={() => setNewCourseForm({...newCourseForm, thumbnail: null})}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-4">
                          <Upload className="w-8 h-8 text-neutral-400" />
                          <div className="text-left">
                            <p className="text-sm text-neutral-600">썸네일 이미지 업로드</p>
                            <p className="text-xs text-neutral-400">1280x720px, JPG/PNG</p>
                          </div>
                          <button 
                            onClick={() => setNewCourseForm({...newCourseForm, thumbnail: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=400'})}
                            className="px-3 py-1.5 bg-neutral-100 text-neutral-600 text-xs rounded-lg hover:bg-neutral-200"
                          >
                            샘플 사용
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 소개 영상 업로드 */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">소개 영상 (선택)</label>
                    <div className="border-2 border-dashed border-neutral-300 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer">
                      {newCourseForm.introVideo ? (
                        <div className="flex items-center justify-center gap-3">
                          <Video className="w-6 h-6 text-indigo-500" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-neutral-900">intro_video.mp4</p>
                            <p className="text-xs text-neutral-500">2:30 · 45MB</p>
                          </div>
                          <button 
                            onClick={() => setNewCourseForm({...newCourseForm, introVideo: null})}
                            className="p-1 bg-red-500 text-white rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-4">
                          <Video className="w-8 h-8 text-neutral-400" />
                          <div className="text-left">
                            <p className="text-sm text-neutral-600">무료 미리보기 영상</p>
                            <p className="text-xs text-neutral-400">1~3분, MP4</p>
                          </div>
                          <button 
                            onClick={() => setNewCourseForm({...newCourseForm, introVideo: 'intro.mp4'})}
                            className="px-3 py-1.5 bg-neutral-100 text-neutral-600 text-xs rounded-lg hover:bg-neutral-200"
                          >
                            샘플 사용
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 클래스 영상 업로드 */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      <Play className="w-4 h-4 inline mr-1 text-indigo-500" />
                      클래스 영상 ({newCourseForm.lectureVideos.length}/{newCourseForm.sessions}회차)
                    </label>
                    <p className="text-xs text-neutral-500 mb-3">각 회차별 클래스 영상을 업로드하세요</p>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {Array.from({ length: newCourseForm.sessions }, (_, i) => {
                        const video = newCourseForm.lectureVideos.find(v => v.session === i + 1);
                        return (
                          <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${video ? 'bg-emerald-50 border-emerald-200' : 'bg-neutral-50 border-neutral-200'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${video ? 'bg-emerald-500 text-white' : 'bg-neutral-300 text-neutral-600'}`}>
                              {video ? <Check className="w-4 h-4" /> : i + 1}
                            </div>
                            <div className="flex-1">
                              {video ? (
                                <div>
                                  <p className="text-sm font-medium text-neutral-900">{video.title}</p>
                                  <p className="text-xs text-neutral-500">{video.duration} · {video.size}</p>
                                </div>
                              ) : (
                                <p className="text-sm text-neutral-500">{i + 1}회차 영상 미등록</p>
                              )}
                            </div>
                            {video ? (
                              <button 
                                onClick={() => {
                                  const newVideos = newCourseForm.lectureVideos.filter(v => v.session !== i + 1);
                                  setNewCourseForm({...newCourseForm, lectureVideos: newVideos});
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => {
                                  const newVideo = {
                                    session: i + 1,
                                    title: `${i + 1}회차 - ${['기초 개념', '프롬프트 작성법', '고급 기법', '실전 프로젝트', '최적화 전략', '응용 사례', '트러블슈팅', '최종 정리'][i % 8]}`,
                                    duration: `${15 + Math.floor(Math.random() * 20)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
                                    size: `${80 + Math.floor(Math.random() * 120)}MB`
                                  };
                                  setNewCourseForm({...newCourseForm, lectureVideos: [...newCourseForm.lectureVideos, newVideo]});
                                }}
                                className="px-3 py-1.5 bg-indigo-100 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-200"
                              >
                                업로드
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* 전체 업로드 버튼 */}
                    <button 
                      onClick={() => {
                        const allVideos = Array.from({ length: newCourseForm.sessions }, (_, i) => ({
                          session: i + 1,
                          title: `${i + 1}회차 - ${['기초 개념', '프롬프트 작성법', '고급 기법', '실전 프로젝트', '최적화 전략', '응용 사례', '트러블슈팅', '최종 정리'][i % 8]}`,
                          duration: `${15 + Math.floor(Math.random() * 20)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
                          size: `${80 + Math.floor(Math.random() * 120)}MB`
                        }));
                        setNewCourseForm({...newCourseForm, lectureVideos: allVideos});
                      }}
                      className="mt-3 w-full py-2 border border-indigo-200 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-50"
                    >
                      전체 샘플 영상 추가 (데모)
                    </button>
                  </div>

                  {/* 최종 요약 */}
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-indigo-900 mb-3">클래스 요약</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-indigo-600">클래스명:</span>
                        <span className="font-medium text-indigo-900 ml-2">{newCourseForm.title || '-'}</span>
                      </div>
                      <div>
                        <span className="text-indigo-600">카테고리:</span>
                        <span className="font-medium text-indigo-900 ml-2">
                          {newCourseForm.category === 'video' ? 'AI 영상' : 
                           newCourseForm.category === 'image' ? 'AI 이미지' : 
                           newCourseForm.category === 'text' ? 'AI 텍스트' : 'AI 음악'}
                        </span>
                      </div>
                      <div>
                        <span className="text-indigo-600">총 회차:</span>
                        <span className="font-medium text-indigo-900 ml-2">{newCourseForm.sessions}회</span>
                      </div>
                      <div>
                        <span className="text-indigo-600">수강료:</span>
                        <span className="font-medium text-amber-600 ml-2">{newCourseForm.creditPrice} 크레딧</span>
                      </div>
                      <div>
                        <span className="text-indigo-600">영상 등록:</span>
                        <span className={`font-medium ml-2 ${newCourseForm.lectureVideos.length === newCourseForm.sessions ? 'text-emerald-600' : 'text-red-500'}`}>
                          {newCourseForm.lectureVideos.length}/{newCourseForm.sessions}회차
                        </span>
                      </div>
                      <div>
                        <span className="text-indigo-600">총 제공 크레딧:</span>
                        <span className="font-medium text-emerald-600 ml-2">{newCourseForm.sessions * newCourseForm.creditsPerSession}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* 푸터 버튼 */}
            <div className="flex-shrink-0 flex gap-3 p-6 border-t border-neutral-200">
              {newCourseStep > 1 && (
                <button
                  onClick={() => setNewCourseStep(newCourseStep - 1)}
                  className="px-6 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  이전
                </button>
              )}
              <div className="flex-1" />
              {newCourseStep < 3 ? (
                <button
                  onClick={() => {
                    // 1단계에서 2단계로 갈 때 sessionDetails 초기화
                    if (newCourseStep === 1 && newCourseForm.sessionDetails.length === 0) {
                      setNewCourseForm({
                        ...newCourseForm,
                        sessionDetails: initSessionDetails(newCourseForm.sessions)
                      });
                    }
                    setNewCourseStep(newCourseStep + 1);
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  다음
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (newCourseForm.lectureVideos.length < newCourseForm.sessions) {
                      if (!confirm(`아직 ${newCourseForm.sessions - newCourseForm.lectureVideos.length}개 회차 영상이 등록되지 않았습니다. 그래도 생성하시겠습니까?`)) {
                        return;
                      }
                    }
                    alert('클래스가 생성되었습니다! (데모)');
                    setShowNewCourseModal(false);
                    setNewCourseStep(1);
                    setNewCourseForm({ 
                      title: '', description: '', sessions: 8, category: 'video', level: 'beginner',
                      thumbnail: null, introVideo: null, lectureVideos: [], examplePrompts: ['', '', ''], 
                      learningGoals: ['', '', ''], targetAudience: '', prerequisites: '', creditPrice: 150, creditsPerSession: 20,
                      sessionDetails: []
                    });
                  }}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                >
                  클래스 생성하기
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function MyPagePage() {
  const {
    isLoggedIn,
    user,
    viewMode,
    currentRole,
    wallet,
    userPlan,
    userEnterpriseTier,
    creditLedger,
    setUserPlan,
    setUserEnterpriseTier,
    setWallet,
    setUser,
    handleAuthClick,
    handleLogout,
    setCurrentPage,
    handleRoleSwitch,
    currentPage,
  } = useAuth();

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
      <MyPage
        wallet={wallet}
        userPlan={userPlan}
        setUserPlan={setUserPlan}
        setWallet={setWallet}
        creditLedger={creditLedger}
        userEnterpriseTier={userEnterpriseTier}
        setUserEnterpriseTier={setUserEnterpriseTier}
        user={user}
        setUser={setUser}
        currentRole={currentRole}
      />
    </>
  );
}
