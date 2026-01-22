'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, ChevronRight, ChevronLeft, ChevronDown, Save, TrendingUp, BarChart3, CheckCircle, Clock, Zap, Sparkles, Video, Target, Award, BookOpen, ArrowRight, RefreshCw, Eye, Copy, Lightbulb, MessageSquare, X, Send, Upload, Check, User, AlertTriangle, Activity, FileText, Download, Bell, Users, Shield, History, AlertCircle, Radio, PenTool, MousePointer, Monitor, Volume2, VideoOff, Maximize2, Search, Image, Star, Headphones, Settings, Plus } from 'lucide-react';

// ============= Placeholder 이미지 생성 함수 =============
const hashValue = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const THUMBNAIL_LIBRARY = {
  video: [
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1626544827763-d516dce335e2?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80'
  ],
  live: [
    'https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=900&q=80'
  ],
  creative: [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1541356665065-22676f35dd40?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=900&q=80'
  ],
  ai: [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=900&q=80'
  ],
  robot: [
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80'
  ],
  business: [
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80'
  ],
  code: [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80'
  ],
  default: [
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80'
  ]
};

const REAL_FACE_IMAGES = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1545996124-0501ebae84d0?auto=format&fit=crop&w=400&h=400&q=80'
];

const SCREEN_IMAGES = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80'
];

const CLASS_AI_RESULT_IMAGES = [
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1541356665065-22676f35dd40?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80'
];

const createPlaceholder = (type, bgColor = '#6366f1') => {
  const pool = THUMBNAIL_LIBRARY[type] || THUMBNAIL_LIBRARY.default;
  const hash = hashValue(`${type}-${bgColor}`);
  return pool[hash % pool.length];
};

const createAvatar = (name, bgColor = '#6366f1') => {
  const hash = hashValue(`${name}-${bgColor}`);
  return REAL_FACE_IMAGES[hash % REAL_FACE_IMAGES.length];
};

const createScreen = (status = 'active', bgColor = '#1e293b') => {
  const hash = hashValue(`${status}-${bgColor}`);
  return SCREEN_IMAGES[hash % SCREEN_IMAGES.length];
};

const createResult = (index = 0) => {
  const safeIndex = Math.abs(index) % CLASS_AI_RESULT_IMAGES.length;
  return CLASS_AI_RESULT_IMAGES[safeIndex];
};

// ============= 라이브 클래스 Mock 데이터 =============
const LIVE_CLASSES = [
  {
    id: 1,
    title: "SORA로 시네마틱 영상 만들기 - 실시간 실습",
    instructor: "김민수 강사",
    status: "live",
    participants: 42,
    thumbnail: createPlaceholder('live', '#dc2626'),
    startTime: "14:00",
    duration: "2시간"
  },
  {
    id: 2,
    title: "VEO 고급 테크닉 - 리얼리즘 극대화",
    instructor: "박지영 강사",
    status: "upcoming",
    participants: 0,
    thumbnail: createPlaceholder('video', '#6366f1'),
    startTime: "16:00",
    duration: "1.5시간"
  },
  {
    id: 3,
    title: "멀티 AI 활용 워크플로우 - 지난 세션",
    instructor: "이준호 강사",
    status: "replay",
    participants: 38,
    thumbnail: createPlaceholder('ai', '#64748b'),
    startTime: "완료",
    duration: "2시간"
  }
];

const LIVE_CHAT_MESSAGES = [
  { id: 1, user: "강사", message: "안녕하세요! 오늘은 SORA를 활용한 시네마틱 영상 제작을 배워보겠습니다.", isInstructor: true, time: "14:02" },
  { id: 2, user: "학습자42", message: "질문있습니다! 프롬프트 길이는 어느정도가 적당한가요?", isInstructor: false, time: "14:05" },
  { id: 3, user: "강사", message: "좋은 질문입니다. 50-100 단어 정도가 적당합니다.", isInstructor: true, time: "14:06" }
];

// ============= 기관 관리자 Mock 데이터 =============
const INSTITUTION_DATA = {
  id: 'inst_001',
  name: '서울디지털대학교',
  logo: null,
  adminId: 'user_admin_001',
  creditPool: 50000,
  usedCredits: 12450,
  settings: {
    requireClassApproval: true,
    defaultMemberCredits: 100,
    monthlyLimitPerMember: 500
  },
  createdAt: '2024-01-01',
  stats: {
    totalRevenue: 5200000,
    totalClasses: 12,
    completionRate: 78
  }
};

const INSTITUTION_INSTRUCTORS = [
  { id: 'inst_001', name: '김민수', email: 'minsu@sdu.ac.kr', status: 'active', classCount: 3, studentCount: 85, creditsUsed: 3200, creditsAllocated: 5000, joinDate: '2024-03-15', avatar: '#6366f1' },
  { id: 'inst_002', name: '박지영', email: 'jiyoung@sdu.ac.kr', status: 'active', classCount: 4, studentCount: 102, creditsUsed: 4100, creditsAllocated: 5000, joinDate: '2024-02-20', avatar: '#0891b2' },
  { id: 'inst_003', name: '이준호', email: 'junho@sdu.ac.kr', status: 'active', classCount: 2, studentCount: 28, creditsUsed: 1850, creditsAllocated: 3000, joinDate: '2024-05-10', avatar: '#7c3aed' },
  { id: 'inst_004', name: '최서연', email: 'seoyeon@sdu.ac.kr', status: 'pending', classCount: 0, studentCount: 0, creditsUsed: 0, creditsAllocated: 0, joinDate: '2024-06-01', avatar: '#059669' },
  { id: 'inst_005', name: '정하은', email: 'haeun@sdu.ac.kr', status: 'active', classCount: 3, studentCount: 67, creditsUsed: 3300, creditsAllocated: 4000, joinDate: '2024-04-05', avatar: '#dc2626' }
];

const INSTITUTION_STUDENTS = [
  { id: 'std_001', name: '홍길동', email: 'hong@sdu.ac.kr', status: 'active', enrolledClasses: 3, completedClasses: 2, creditsUsed: 450, creditsAllocated: 500, progress: 85, joinDate: '2024-03-20' },
  { id: 'std_002', name: '김서현', email: 'seohyun@sdu.ac.kr', status: 'active', enrolledClasses: 2, completedClasses: 1, creditsUsed: 280, creditsAllocated: 500, progress: 62, joinDate: '2024-04-01' },
  { id: 'std_003', name: '이도윤', email: 'doyun@sdu.ac.kr', status: 'active', enrolledClasses: 4, completedClasses: 3, creditsUsed: 520, creditsAllocated: 600, progress: 91, joinDate: '2024-02-15' },
  { id: 'std_004', name: '박민서', email: 'minseo@sdu.ac.kr', status: 'inactive', enrolledClasses: 1, completedClasses: 0, creditsUsed: 50, creditsAllocated: 500, progress: 12, joinDate: '2024-05-20' },
  { id: 'std_005', name: '최예은', email: 'yeeun@sdu.ac.kr', status: 'active', enrolledClasses: 2, completedClasses: 2, creditsUsed: 400, creditsAllocated: 500, progress: 100, joinDate: '2024-03-10' },
  { id: 'std_006', name: '정우진', email: 'woojin@sdu.ac.kr', status: 'active', enrolledClasses: 3, completedClasses: 1, creditsUsed: 310, creditsAllocated: 500, progress: 45, joinDate: '2024-04-15' },
  { id: 'std_007', name: '강수아', email: 'sua@sdu.ac.kr', status: 'active', enrolledClasses: 2, completedClasses: 2, creditsUsed: 480, creditsAllocated: 500, progress: 100, joinDate: '2024-02-28' },
  { id: 'std_008', name: '윤지호', email: 'jiho@sdu.ac.kr', status: 'active', enrolledClasses: 1, completedClasses: 0, creditsUsed: 120, creditsAllocated: 300, progress: 35, joinDate: '2024-05-25' }
];

const INSTITUTION_CLASSES = [
  { id: 'cls_001', title: 'SORA 영상 제작 마스터', instructor: '김민수', instructorId: 'inst_001', students: 32, status: 'active', approvalStatus: 'approved', revenue: 480000, startDate: '2024-04-01' },
  { id: 'cls_002', title: 'VEO 고급 테크닉', instructor: '박지영', instructorId: 'inst_002', students: 28, status: 'active', approvalStatus: 'approved', revenue: 420000, startDate: '2024-04-15' },
  { id: 'cls_003', title: 'AI 콘텐츠 창작 입문', instructor: '이준호', instructorId: 'inst_003', students: 45, status: 'active', approvalStatus: 'approved', revenue: 675000, startDate: '2024-03-20' },
  { id: 'cls_004', title: '디지털 휴먼 활용법', instructor: '정하은', instructorId: 'inst_005', students: 38, status: 'active', approvalStatus: 'approved', revenue: 570000, startDate: '2024-05-01' },
  { id: 'cls_005', title: 'Kling 실전 워크숍', instructor: '박지영', instructorId: 'inst_002', students: 22, status: 'scheduled', approvalStatus: 'pending', revenue: 0, startDate: '2024-07-01' },
  { id: 'cls_006', title: 'Midjourney 마스터클래스', instructor: '김민수', instructorId: 'inst_001', students: 0, status: 'draft', approvalStatus: 'pending', revenue: 0, startDate: null }
];

const CREDIT_DISTRIBUTION_HISTORY = [
  { id: 1, date: '2024-06-15', type: 'allocate', target: '김민수 (교육자)', amount: 2000, note: '6월 추가 배정', admin: '기관관리자' },
  { id: 2, date: '2024-06-14', type: 'allocate', target: '신규 수강생 15명', amount: 7500, note: '신규 가입 기본 배정', admin: '시스템' },
  { id: 3, date: '2024-06-10', type: 'recharge', target: '기관 크레딧 풀', amount: 30000, note: '월간 충전', admin: '기관관리자' },
  { id: 4, date: '2024-06-05', type: 'allocate', target: '박지영 (교육자)', amount: 1500, note: '워크숍 준비', admin: '기관관리자' },
  { id: 5, date: '2024-06-01', type: 'recall', target: '비활성 수강생 3명', amount: -600, note: '미사용 크레딧 회수', admin: '기관관리자' }
];

const AI_SERVICES = [
  // ============= 영상 생성 서비스 =============
  {
    id: 'sora',
    name: 'OpenAI Sora',
    category: 'video',
    description: '사운드 포함 멀티샷 영상 생성',
    icon: '🎵',
    tiers: [
      { id: 'sora-2', name: 'Sora 2', description: '표준 품질', specs: { resolution: '720p', duration: '5-10초', audio: true }, pricing: { multiplier: 1.0 }, maxResolution: '720p', maxDurationSec: 10, audioSupported: true },
      { id: 'sora-2-pro', name: 'Sora 2 Pro', description: '고품질', specs: { resolution: '1080p', duration: '5-15초', audio: true }, pricing: { multiplier: 1.5 }, maxResolution: '1080p', maxDurationSec: 15, audioSupported: true },
      { id: 'sora-2-max', name: 'Sora 2 Max', description: '최고 품질', specs: { resolution: '4K', duration: '5-20초', audio: true }, pricing: { multiplier: 2.0 }, maxResolution: '4K', maxDurationSec: 20, audioSupported: true }
    ]
  },
  {
    id: 'veo',
    name: 'Google Veo',
    category: 'video',
    description: '정밀한 사운드 제어 영상',
    icon: '🎯',
    tiers: [
      { id: 'veo-lite', name: 'Veo Lite', description: '빠른 생성', specs: { resolution: '720p', duration: '3-8초', audio: false }, pricing: { multiplier: 0.8 }, maxResolution: '720p', maxDurationSec: 8, audioSupported: false },
      { id: 'veo-standard', name: 'Veo Standard', description: '균형 잡힌 품질', specs: { resolution: '1080p', duration: '4-12초', audio: true }, pricing: { multiplier: 1.2 }, maxResolution: '1080p', maxDurationSec: 12, audioSupported: true }
    ]
  },
  {
    id: 'kling',
    name: 'Kling',
    category: 'video',
    description: '완벽한 모션과 고급 영상 제어',
    icon: '⚡',
    tiers: [
      { id: 'kling-v1', name: 'Kling v1.0', description: '표준 모션', specs: { resolution: '1080p', duration: '5-10초', audio: false }, pricing: { multiplier: 1.0 }, maxResolution: '1080p', maxDurationSec: 10, audioSupported: false },
      { id: 'kling-v2', name: 'Kling v2.0', description: '향상된 모션', specs: { resolution: '1080p', duration: '5-15초', audio: true }, pricing: { multiplier: 1.3 }, maxResolution: '1080p', maxDurationSec: 15, audioSupported: true }
    ]
  },
  {
    id: 'minimax',
    name: 'Minimax Hailuo',
    category: 'video',
    description: '고다이나믹, VFX 지원, 가장 빠르고 저렴함',
    icon: '🚀',
    tiers: [
      { id: 'minimax-fast', name: '패스트', description: '빠른 생성', specs: { resolution: '720p', duration: '3-6초', audio: false }, pricing: { multiplier: 0.7 }, maxResolution: '720p', maxDurationSec: 6, audioSupported: false },
      { id: 'minimax-quality', name: '퀄리티', description: '최고 품질', specs: { resolution: '1080p', duration: '5-12초', audio: true }, pricing: { multiplier: 1.0 }, maxResolution: '1080p', maxDurationSec: 12, audioSupported: true }
    ]
  },
  // ============= 이미지 생성 서비스 =============
  {
    id: 'dalle',
    name: 'DALL·E 3',
    category: 'image',
    description: '자연어 이해력이 뛰어난 이미지 생성',
    icon: '🎨',
    tiers: [
      { id: 'dalle-standard', name: '스탠다드', description: '표준 품질', specs: { resolution: '1024x1024', style: '자연스러운' }, pricing: { multiplier: 1.0, base: 8 } },
      { id: 'dalle-hd', name: 'HD', description: '고해상도', specs: { resolution: '1792x1024', style: '선명한' }, pricing: { multiplier: 1.5, base: 12 } }
    ]
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    category: 'image',
    description: '예술적이고 창의적인 이미지 생성',
    icon: '✨',
    tiers: [
      { id: 'mj-v6', name: 'v6.0', description: '최신 버전', specs: { resolution: '1024x1024', style: '예술적' }, pricing: { multiplier: 1.2, base: 10 } },
      { id: 'mj-v6-raw', name: 'v6.0 RAW', description: '사실적 스타일', specs: { resolution: '1024x1024', style: '사실적' }, pricing: { multiplier: 1.3, base: 11 } }
    ]
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion 3',
    category: 'image',
    description: '빠르고 다양한 스타일 지원',
    icon: '🖼️',
    tiers: [
      { id: 'sd3-turbo', name: 'Turbo', description: '빠른 생성', specs: { resolution: '1024x1024', style: '다양함' }, pricing: { multiplier: 0.6, base: 5 } },
      { id: 'sd3-ultra', name: 'Ultra', description: '최고 품질', specs: { resolution: '2048x2048', style: '정교함' }, pricing: { multiplier: 1.0, base: 8 } }
    ]
  },
  {
    id: 'flux',
    name: 'Flux',
    category: 'image',
    description: '텍스트 렌더링과 구도에 강점',
    icon: '⚡',
    tiers: [
      { id: 'flux-schnell', name: 'Schnell', description: '초고속 생성', specs: { resolution: '1024x1024', style: '빠른' }, pricing: { multiplier: 0.5, base: 4 } },
      { id: 'flux-pro', name: 'Pro', description: '프로페셔널', specs: { resolution: '1440x1440', style: '전문가용' }, pricing: { multiplier: 1.2, base: 10 } }
    ]
  },
  {
    id: 'ideogram',
    name: 'Ideogram',
    category: 'image',
    description: '텍스트가 포함된 이미지에 특화',
    icon: '📝',
    tiers: [
      { id: 'ideogram-v2', name: 'v2.0', description: '텍스트 특화', specs: { resolution: '1024x1024', style: '타이포그래피' }, pricing: { multiplier: 0.8, base: 7 } },
      { id: 'ideogram-v2-turbo', name: 'v2.0 Turbo', description: '빠른 텍스트', specs: { resolution: '1024x1024', style: '빠른 타이포' }, pricing: { multiplier: 0.6, base: 5 } }
    ]
  },
  // ============= 텍스트 생성 서비스 =============
  {
    id: 'gpt4',
    name: 'GPT-4o',
    category: 'text',
    description: '가장 강력한 멀티모달 언어 모델',
    icon: '🧠',
    tiers: [
      { id: 'gpt4o', name: 'GPT-4o', description: '최신 모델', specs: { context: '128K', speed: '빠름' }, pricing: { multiplier: 1.0, base: 3 } },
      { id: 'gpt4o-mini', name: 'GPT-4o Mini', description: '경량 모델', specs: { context: '128K', speed: '매우 빠름' }, pricing: { multiplier: 0.3, base: 1 } }
    ]
  },
  {
    id: 'claude',
    name: 'Claude 3.5',
    category: 'text',
    description: '안전하고 유용한 AI 어시스턴트',
    icon: '🤖',
    tiers: [
      { id: 'claude-sonnet', name: 'Sonnet', description: '균형 잡힌 성능', specs: { context: '200K', speed: '빠름' }, pricing: { multiplier: 0.8, base: 2 } },
      { id: 'claude-opus', name: 'Opus', description: '최고 성능', specs: { context: '200K', speed: '보통' }, pricing: { multiplier: 1.5, base: 5 } }
    ]
  },
  {
    id: 'gemini',
    name: 'Gemini Pro',
    category: 'text',
    description: '구글의 최신 멀티모달 AI',
    icon: '💎',
    tiers: [
      { id: 'gemini-pro', name: 'Pro', description: '표준 모델', specs: { context: '1M', speed: '빠름' }, pricing: { multiplier: 0.7, base: 2 } },
      { id: 'gemini-ultra', name: 'Ultra', description: '최고 성능', specs: { context: '1M', speed: '보통' }, pricing: { multiplier: 1.2, base: 4 } }
    ]
  },
  {
    id: 'llama',
    name: 'Llama 3.1',
    category: 'text',
    description: '오픈소스 기반 강력한 모델',
    icon: '🦙',
    tiers: [
      { id: 'llama-70b', name: '70B', description: '대형 모델', specs: { context: '128K', speed: '보통' }, pricing: { multiplier: 0.5, base: 2 } },
      { id: 'llama-405b', name: '405B', description: '초대형 모델', specs: { context: '128K', speed: '느림' }, pricing: { multiplier: 1.0, base: 3 } }
    ]
  },
  {
    id: 'mistral',
    name: 'Mistral Large',
    category: 'text',
    description: '유럽 기반 고성능 모델',
    icon: '🌬️',
    tiers: [
      { id: 'mistral-medium', name: 'Medium', description: '중형 모델', specs: { context: '32K', speed: '빠름' }, pricing: { multiplier: 0.4, base: 1 } },
      { id: 'mistral-large', name: 'Large', description: '대형 모델', specs: { context: '128K', speed: '보통' }, pricing: { multiplier: 0.8, base: 3 } }
    ]
  }
];

// ============= 크레딧 시스템 유틸리티 =============

// 카테고리별 서비스 필터링
const getServicesByCategory = (category) => AI_SERVICES.filter(s => s.category === category);
const VIDEO_SERVICES = AI_SERVICES.filter(s => s.category === 'video');
const IMAGE_SERVICES = AI_SERVICES.filter(s => s.category === 'image');
const TEXT_SERVICES = AI_SERVICES.filter(s => s.category === 'text');

// Duration 문자열 파싱 (예: "10s" -> 10)
const parseDurationSec = (durationStr) => {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 5;
};

// Resolution에 따른 추가 비용 (내부 계산용, UI 노출 금지)
const getResolutionFactor = (resolution) => {
  switch (resolution) {
    case '4K': return 6;
    case '1080p': return 2;
    case '720p': 
    default: return 0;
  }
};

// 크레딧 비용 계산 함수 (내부 계산식, UI에는 결과만 노출)
const calculateCredits = (tierId, durationStr, resolution, audioOn, services = AI_SERVICES) => {
  const baseCost = 2;
  const durationSec = parseDurationSec(durationStr);
  const durationCost = durationSec * 1;
  const resolutionCost = getResolutionFactor(resolution);
  const audioCost = audioOn ? 2 : 0;
  
  // 티어 찾기
  let tierMultiplier = 1.0;
  for (const service of services) {
    const tier = service.tiers.find(t => t.id === tierId);
    if (tier) {
      tierMultiplier = tier.pricing?.multiplier || 1.0;
      break;
    }
  }
  
  const total = (baseCost + durationCost + resolutionCost + audioCost) * tierMultiplier;
  return Math.ceil(total);
};

// ============= 요금제 정의 =============
const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyCredits: 50,
    features: {
      maxResolution: '720p',
      allowedTiers: ['standard'],
      concurrentJobs: 1,
      classAccess: 'sample',
      liveAccess: false,
    },
    description: '서비스 체험용',
    detailedFeatures: [
      '클래스 샘플 1회차',
      '라이브 참여 불가',
      'AI 생성 720p',
      '동시생성 1개'
    ]
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 15000,
    yearlyPrice: 144000,
    monthlyCredits: 500,
    features: {
      maxResolution: '720p',
      allowedTiers: ['standard'],
      concurrentJobs: 2,
      classAccess: 'credit',
      liveAccess: false,
    },
    description: '개인 학습자용',
    detailedFeatures: [
      '클래스 수강',
      '라이브 참여 불가',
      'AI 생성 720p',
      '동시생성 2개'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 45000,
    yearlyPrice: 432000,
    monthlyCredits: 2000,
    features: {
      maxResolution: '1080p',
      allowedTiers: ['standard', 'pro'],
      concurrentJobs: 5,
      classAccess: 'credit',
      liveAccess: 'credit',
    },
    description: '크리에이터용',
    popular: true,
    detailedFeatures: [
      '클래스 수강',
      '라이브 참여',
      'AI 생성 1080p',
      '동시생성 5개'
    ]
  },
  max: {
    id: 'max',
    name: 'Max',
    monthlyPrice: 99000,
    yearlyPrice: 948000,
    monthlyCredits: 5000,
    features: {
      maxResolution: '1080p',
      allowedTiers: ['standard', 'pro', 'max'],
      concurrentJobs: 8,
      classAccess: 'credit',
      liveAccess: 'credit',
    },
    description: '전문가용',
    detailedFeatures: [
      '클래스 수강',
      '라이브 참여',
      'AI 생성 1080p',
      '동시생성 8개'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 299000,
    yearlyPrice: 2880000,
    monthlyCredits: 10000,
    features: {
      maxResolution: '1080p',
      allowedTiers: ['standard', 'pro', 'max'],
      concurrentJobs: 8,
      classAccess: 'credit',
      liveAccess: 'credit',
      prioritySupport: true,
      dedicatedManager: true,
      customAPI: true,
    },
    description: '기업/기관용',
    detailedFeatures: [
      '클래스 수강',
      '라이브 참여',
      'AI 생성 1080p',
      '동시생성 8개',
    ],
    enterpriseFeatures: [
      '전담 계정 매니저',
      '우선 기술 지원 (24시간 이내 응답)',
      'SLA 99.9% 가동률 보장',
      '팀 시트 협의',
      'API 액세스 및 커스텀 통합',
      '월간 사용량 리포트',
      '볼륨 디스카운트 협의 가능'
    ],
    tiers: [
      {
        id: 'enterprise-team',
        name: 'Team',
        monthlyPrice: 299000,
        yearlyPrice: 2880000,
        monthlyCredits: 10000,
        teamSeats: 5,
        concurrentJobs: 10,
        description: '소규모 팀용'
      },
      {
        id: 'enterprise-business',
        name: 'Business',
        monthlyPrice: 599000,
        yearlyPrice: 5760000,
        monthlyCredits: 25000,
        teamSeats: 15,
        concurrentJobs: 20,
        description: '성장하는 비즈니스용',
        popular: true
      },
      {
        id: 'enterprise-scale',
        name: 'Scale',
        monthlyPrice: 1190000,
        yearlyPrice: 11400000,
        monthlyCredits: 60000,
        teamSeats: 50,
        concurrentJobs: 50,
        description: '대규모 조직용'
      },
      {
        id: 'enterprise-unlimited',
        name: 'Unlimited',
        monthlyPrice: null,
        yearlyPrice: null,
        monthlyCredits: 'unlimited',
        teamSeats: 'unlimited',
        concurrentJobs: 100,
        description: '맞춤 견적'
      }
    ]
  }
};

// 크레딧 소모 정책
const CREDIT_COSTS = {
  class: {
    // 강의 전체 수강 (회차 수에 따라 다름)
    // 1회차 맛보기는 무료
    range: { min: 1500, max: 3000 }, // 강의당 (5~15회차 기준)
  },
  live: {
    participation: { min: 800, max: 1500 }, // 라이브 1회 참여 (강의 길이/강사에 따라)
    replay: { min: 600, max: 1200 },        // 다시보기 (미참여자)
    replayParticipant: 0                     // 다시보기 (참여자, 7일간 무료)
  },
  ai: {
    video: { min: 15, max: 80 },
    image: { min: 8, max: 25 },
    text: { min: 2, max: 10 }
  }
};

// 티어 레벨 매핑 (standard < pro < max)
const TIER_LEVELS = {
  'standard': 1,
  'pro': 2,
  'max': 3
};

// 티어 ID에서 레벨 추출
const getTierLevel = (tierId) => {
  // max 레벨: max, ultra, opus, 405b 등 최고급 티어
  if (tierId.includes('max') || tierId.includes('ultra') || tierId.includes('opus') || tierId.includes('405b')) return 'max';
  // pro 레벨: pro, hd, raw, v2, large 등 중급 티어
  if (tierId.includes('pro') || tierId.includes('hd') || tierId.includes('raw') || tierId.includes('large')) return 'pro';
  // standard 레벨: 나머지 모든 티어
  return 'standard';
};

// 플랜 제한 체크 함수
const checkPlanLimits = (userPlan, selectedTierId, resolution, currentJobs = 0) => {
  const plan = PRICING_PLANS[userPlan] || PRICING_PLANS.free;
  const tierLevel = getTierLevel(selectedTierId);
  
  const issues = [];
  
  // 1. 티어 레벨 체크
  if (!plan.features.allowedTiers.includes(tierLevel)) {
    issues.push({
      type: 'tier',
      message: `${tierLevel.toUpperCase()} 모델은 ${plan.name} 플랜에서 사용할 수 없습니다.`
    });
  }
  
  // 2. 해상도 체크
  const resolutionOrder = ['720p', '1080p', '4K'];
  const planMaxIdx = resolutionOrder.indexOf(plan.features.maxResolution);
  const selectedIdx = resolutionOrder.indexOf(resolution);
  if (selectedIdx > planMaxIdx) {
    issues.push({
      type: 'resolution',
      message: `${resolution} 해상도는 ${plan.name} 플랜에서 지원하지 않습니다.`
    });
  }
  
  // 3. 동시 생성 체크
  if (plan.features.concurrentJobs !== 'unlimited' && currentJobs >= plan.features.concurrentJobs) {
    issues.push({
      type: 'concurrent',
      message: `동시생성 제한(${plan.features.concurrentJobs}개)에 도달했습니다.`
    });
  }
  
  return {
    allowed: issues.length === 0,
    issues
  };
};

// ============= API 어댑터 스텁 (실제 호출 X, 향후 백엔드 연동 대비) =============

// TODO: 실제 백엔드 API 연동 시 구현
async function apiReserveCredits(userId, amount) {
  // TODO: POST /api/credits/reserve { userId, amount }
  console.log(`[API Stub] Reserve credits: user=${userId}, amount=${amount}`);
  return { success: true, reservationId: `res_${Date.now()}` };
}

// TODO: 실제 백엔드 API 연동 시 구현
async function apiGenerateJob(payload) {
  // TODO: POST /api/generate { prompt, serviceId, tierId, duration, resolution, ... }
  console.log(`[API Stub] Generate job:`, payload);
  return { success: true, jobId: `job_${Date.now()}` };
}

// TODO: 실제 백엔드 API 연동 시 구현
async function apiPollJob(jobId) {
  // TODO: GET /api/jobs/{jobId}/status
  console.log(`[API Stub] Poll job: ${jobId}`);
  return { status: 'completed', resultUrl: null };
}

// TODO: 실제 백엔드 API 연동 시 구현
async function apiCaptureCredits(jobId) {
  // TODO: POST /api/credits/capture { jobId }
  console.log(`[API Stub] Capture credits for job: ${jobId}`);
  return { success: true };
}

// TODO: 실제 백엔드 API 연동 시 구현
async function apiRefundCredits(jobId) {
  // TODO: POST /api/credits/refund { jobId }
  console.log(`[API Stub] Refund credits for job: ${jobId}`);
  return { success: true };
}

// 실습 평가 생성 함수 (Mock)
const generatePracticeEvaluation = (prompt, sessionId, category = 'video') => {
  // 세션별 학습 목표 기반 평가 기준
  const sessionCriteria = {
    1: { focus: '기본 프롬프트 구조', keywords: ['주체', '동작', '배경'] },
    2: { focus: '4요소 활용', keywords: ['주체', '행동', '공간', '분위기'] },
    3: { focus: '카메라 제어', keywords: ['클로즈업', '와이드', '앵글', '무브먼트', '달리', '팬', '틸트'] },
    4: { focus: '비주얼 스타일', keywords: ['시네마틱', '애니메이션', '리얼리스틱', '스타일'] },
    5: { focus: '장면 분할', keywords: ['씬', '장면', '전환', '연결'] },
    6: { focus: '동작 묘사', keywords: ['동작', '움직임', '속도', '연속'] },
  };

  const criteria = sessionCriteria[sessionId] || sessionCriteria[1];
  const promptLower = prompt.toLowerCase();
  
  // 평가 점수 계산
  let score = 60; // 기본 점수
  const matchedKeywords = [];
  const missingKeywords = [];
  
  criteria.keywords.forEach(keyword => {
    if (promptLower.includes(keyword.toLowerCase())) {
      score += 8;
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });
  
  // 프롬프트 길이 보너스
  if (prompt.length > 50) score += 5;
  if (prompt.length > 100) score += 5;
  
  // 구체성 보너스 (쉼표로 구분된 요소 수)
  const elements = prompt.split(',').length;
  if (elements >= 3) score += 5;
  if (elements >= 5) score += 5;
  
  score = Math.min(100, score);
  
  // 등급 결정
  let grade, gradeColor, gradeLabel;
  if (score >= 90) {
    grade = 'A';
    gradeColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    gradeLabel = '우수';
  } else if (score >= 80) {
    grade = 'B';
    gradeColor = 'text-blue-600 bg-blue-50 border-blue-200';
    gradeLabel = '양호';
  } else if (score >= 70) {
    grade = 'C';
    gradeColor = 'text-amber-600 bg-amber-50 border-amber-200';
    gradeLabel = '보통';
  } else {
    grade = 'D';
    gradeColor = 'text-red-600 bg-red-50 border-red-200';
    gradeLabel = '개선 필요';
  }
  
  // 피드백 생성
  const feedbacks = [];
  
  if (matchedKeywords.length > 0) {
    feedbacks.push({
      type: 'positive',
      text: `${criteria.focus} 학습 목표에 맞게 "${matchedKeywords.join('", "')}" 요소를 잘 활용했습니다.`
    });
  }
  
  if (missingKeywords.length > 0 && missingKeywords.length <= 2) {
    feedbacks.push({
      type: 'suggestion',
      text: `"${missingKeywords.join('", "')}" 요소를 추가하면 더 완성도 높은 결과물을 얻을 수 있습니다.`
    });
  }
  
  if (prompt.length < 50) {
    feedbacks.push({
      type: 'suggestion',
      text: '프롬프트를 더 구체적으로 작성하면 원하는 결과에 가까워집니다.'
    });
  }
  
  if (elements < 3) {
    feedbacks.push({
      type: 'tip',
      text: '쉼표로 구분하여 여러 요소(주체, 배경, 조명, 분위기 등)를 명시해보세요.'
    });
  }
  
  if (score >= 85) {
    feedbacks.push({
      type: 'positive',
      text: '이번 세션의 학습 목표를 훌륭하게 달성했습니다!'
    });
  }

  return {
    score,
    grade,
    gradeColor,
    gradeLabel,
    focus: criteria.focus,
    feedbacks,
    matchedKeywords,
    missingKeywords
  };
};

const CURRICULUM = {
  course1: {
    id: 'course1',
    title: "프롬프트로 AI 영상 만들기",
    instructor: "nCulture",
    totalSessions: 6,
    thumbnail: createPlaceholder('video', '#6366f1'),
    description: "텍스트 프롬프트로 AI 영상을 생성하는 기초부터 고급 테크닉까지",
    sessions: [
      { id: 1, title: "첫 영상 AI 경험", summary: "텍스트로 영상 생성의 기본 원리 이해", concepts: ["간단한 프롬프트로 시작", "같은 프롬프트 다른 결과", "AI 생성의 확률성 이해"], examples: [{ label: "기본", prompt: "창가에 앉아 있는 고양이" }, { label: "변형", prompt: "비 오는 날 창가에 앉아 있는 고양이, 유리창에 빗방울이 맺혀 있다" }] },
      { id: 2, title: "프롬프트 4요소", summary: "주체·행동·공간·분위기 구조화 학습", concepts: ["주체(Subject) 명확히", "행동(Action) 구체화", "공간(Space)과 분위기(Mood)"], examples: [{ label: "4요소 적용", prompt: "젊은 여성이 공원을 조깅하고 있다, 아침 햇살, 활기찬 분위기" }, { label: "분위기 변경", prompt: "젊은 여성이 공원을 조깅하고 있다, 노을, 평화롭고 차분한 분위기" }] },
      { id: 3, title: "카메라 제어", summary: "샷 크기, 앵글, 무브먼트 설정", concepts: ["Close-up, Medium, Wide shot", "High angle, Low angle", "Pan, Tilt, Dolly"], examples: [{ label: "클로즈업", prompt: "김이 모락모락 나는 커피잔을 잡고 있는 손, 익스트림 클로즈업, 얕은 심도, 피어오르는 수증기" }, { label: "와이드+무브먼트", prompt: "황금빛 시간대의 도시 스카이라인, 와이드샷, 드론이 천천히 전진하며 항구를 드러낸다" }] },
      { id: 4, title: "비주얼 스타일", summary: "리얼리즘, 시네마틱, 애니메이션 스타일", concepts: ["Photorealistic vs Stylized", "Cinematic lighting", "Animation styles"], examples: [{ label: "시네마틱", prompt: "네온 불빛 아래를 걷는 남자, 시네마틱 룩, 아나모픽 렌즈 플레어, 필름 그레인, 블레이드 러너 스타일" }, { label: "애니메이션", prompt: "마법의 숲을 달리는 여우, 지브리 스타일, 손으로 그린 애니메이션, 반짝이는 마법 입자" }] },
      { id: 5, title: "장면 분할 설계", summary: "멀티 씬 구성과 장면 전환", concepts: ["씬 단위로 생각하기", "장면 간 연결성", "전환 설계"], examples: [{ label: "씬1", prompt: "침대에서 일어나는 남자, 커튼 사이로 부드러운 아침 햇살, 천천히 기지개를 편다" }, { label: "씬2", prompt: "같은 남자가 주방에서 커피를 따르고 있다, 자연스러운 연속 동작, 따뜻한 실내 조명" }] },
      { id: 6, title: "행동과 동작 지시", summary: "캐릭터 행동의 구체화", concepts: ["동작 중심 동사 사용", "속도·강도·연속성 묘사", "모호함 vs 명확함"], examples: [{ label: "동작 묘사", prompt: "발레리나가 천천히 우아한 피루엣을 돌고 있다, 우아한 팔 동작, 부드러운 스포트라이트, 슬로우 모션" }, { label: "연속 동작", prompt: "농구 선수가 전력 질주하여 높이 점프한 뒤 강력한 덩크슛을 꽂는다, 역동적인 카메라가 동작을 따라간다" }] }
    ]
  },
  course2: {
    id: 'course2',
    title: "AI 콘텐츠 창작 입문 A to Z",
    instructor: "이승정 강사",
    totalSessions: 10,
    thumbnail: createPlaceholder('creative', '#7c3aed'),
    description: "이미지, 영상, 음성까지 AI 창작 도구 완전 정복",
    sessions: [
      { id: 7, title: "AI 콘텐츠 창작 개론", summary: "AI 창작 도구의 이해와 활용 범위", concepts: ["생성형 AI의 종류", "창작 도구 비교", "활용 사례 분석"], examples: [{ label: "이미지 기초", prompt: "일출 시간의 고요한 산속 호수, 수정처럼 맑은 반영, 소나무 숲, 4K 포토리얼리스틱 품질" }, { label: "스타일 탐색", prompt: "밤의 미래형 도쿄 도시 풍경, 사이버펑크 네온 미학, 날아다니는 자동차, 비에 젖은 거리" }] },
      { id: 8, title: "이미지 생성 AI 마스터", summary: "Midjourney, DALL-E, Stable Diffusion", concepts: ["프롬프트 엔지니어링", "스타일 제어", "고급 파라미터 활용"], examples: [{ label: "Midjourney", prompt: "절벽 위의 고대 판타지 성, 극적인 폭풍 구름, 번개, 웅장한 스케일, --ar 16:9 --v 6 --style raw" }, { label: "포토리얼", prompt: "현대적인 북유럽 스타일 카페 인테리어, 자연 원목과 식물, 큰 창문으로 들어오는 아침 햇살, 건축 사진" }] },
      { id: 9, title: "영상 생성 AI 활용", summary: "SORA, Runway, Pika Labs 실습", concepts: ["텍스트 to 비디오", "이미지 to 비디오", "영상 편집 AI"], examples: [{ label: "텍스트 to 비디오", prompt: "일몰 시간에 바위 해안에 부딪히는 파도, 부드러운 달리 무브먼트, 날아가는 바닷새들, 골든아워 촬영" }, { label: "이미지 to 비디오", prompt: "이 풍경 사진을 애니메이션으로: 잔디 사이로 부는 부드러운 바람, 천천히 흘러가는 구름, 멀리서 나는 새들" }] },
      { id: 10, title: "음성 및 음악 AI", summary: "AI 보이스와 음악 생성", concepts: ["TTS 기술", "음악 생성 AI", "사운드 디자인"], examples: [{ label: "나레이션", prompt: "깊고 따뜻한 남성 목소리, 다큐멘터리 내레이터 스타일, 차분하고 권위 있는 톤, 명확한 발음, 약간의 리버브" }, { label: "배경음악", prompt: "로파이 힙합 인스트루멘탈, 부드러운 피아노 코드, 바이닐 잡음, 여유로운 오후 공부 분위기, 90 BPM" }] },
      { id: 11, title: "AI 콘텐츠 통합 제작", summary: "멀티모달 AI 활용 프로젝트", concepts: ["워크플로우 설계", "도구 간 연동", "최종 아웃풋 완성"], examples: [{ label: "통합 프로젝트", prompt: "30초 친환경 브랜드 영상: 자연 이미지 + 부드러운 전환 + 밝은 어쿠스틱 음악 + 은은한 텍스트 오버레이" }, { label: "숏폼 광고", prompt: "15초 세로형 인스타그램 스킨케어 광고, ASMR 텍스처 샷, 부드러운 파스텔 색상, 트렌디한 전자음악" }] }
    ]
  },
  course3: {
    id: 'course3',
    title: "디지털 휴먼 올인원 활용백서",
    instructor: "임재호 강사",
    totalSessions: 21,
    thumbnail: createPlaceholder('robot', '#059669'),
    description: "AI 아바타부터 버추얼 인플루언서까지 디지털 휴먼의 모든 것",
    sessions: [
      { id: 12, title: "디지털 휴먼 개론", summary: "디지털 휴먼의 이해와 활용 분야", concepts: ["디지털 휴먼 정의", "기술 발전 역사", "산업별 활용 사례"], examples: [{ label: "친근한 아바타", prompt: "친근한 젊은 아시아 여성 아바타, 다가가기 쉬운 미소, 캐주얼한 현대적 의상, 중립적인 스튜디오 배경, 고객 서비스 스타일" }, { label: "전문가 아바타", prompt: "네이비 정장을 입은 전문직 남성 아바타, 자신감 있는 자세, 단정한 외모, 기업 프레젠테이션 세팅" }] },
      { id: 13, title: "AI 아바타 제작", summary: "나만의 디지털 휴먼 만들기", concepts: ["외형 디자인", "음성 설정", "개성 부여하기"], examples: [{ label: "외형 설정", prompt: "한국인 여성 아바타, 어깨 길이 검은 머리, 자연스러운 화장, 따뜻한 갈색 눈, 25-30세, 친근한 인플루언서 룩" }, { label: "음성 페르소나", prompt: "밝고 에너지 넘치는 여성 목소리, 20대 초반 한국어 억양, 친근한 대화체, 명확한 발음, 목소리에 미소가 담긴" }] },
      { id: 14, title: "디지털 휴먼 애니메이션", summary: "자연스러운 움직임과 표정", concepts: ["모션 캡처 기술", "표정 애니메이션", "립싱크 기술"], examples: [{ label: "설명 제스처", prompt: "자연스러운 손동작으로 설명하는 아바타, 열린 손바닥 움직임, 가끔 끄덕임, 카메라와 시선 유지" }, { label: "감정 전환", prompt: "따뜻한 환영 미소에서 진지한 사려 깊은 표정으로 전환하는 아바타, 미묘한 눈썹 움직임, 현실적인 타이밍" }] },
      { id: 15, title: "실시간 디지털 휴먼", summary: "라이브 스트리밍과 인터랙션", concepts: ["실시간 렌더링", "인터랙티브 대화", "방송 활용"], examples: [{ label: "라이브 호스트", prompt: "실시간 채팅에 반응하는 버추얼 호스트, 댓글을 소리 내어 읽고, 놀람과 웃음으로 반응, 시청자와 적극적인 소통" }, { label: "실시간 반응", prompt: "후원 알림에 흥분된 표정으로 반응하는 아바타, 박수치며, 진심 어린 감사 인사" }] },
      { id: 16, title: "디지털 휴먼 비즈니스", summary: "상업적 활용과 미래 전망", concepts: ["마케팅 활용", "버추얼 인플루언서", "메타버스 연계"], examples: [{ label: "인플루언서 콘텐츠", prompt: "새 테크 제품을 언박싱하는 버추얼 인플루언서, 진정한 호기심 표현, 기능 시연, 라이프스타일 브랜드 통합" }, { label: "AI 상담원", prompt: "친근한 디지털 휴먼 고객 서비스 상담원, 경청하는 자세, 이해한다는 듯이 끄덕임, 전문적이고 도움이 되는 태도" }] }
    ]
  }
};

// ============= 평가·모니터링 Mock 데이터 =============
const ASSESSMENT_PARTICIPANTS = [
  {
    id: 1,
    name: "김민준",
    status: "active",
    lastActivity: "2분 전",
    promptCount: 8,
    generationCount: 5,
    submitted: false,
    anomaly: null,
    avatar: createAvatar("김", "#6366f1")
  },
  {
    id: 2,
    name: "이서연",
    status: "active",
    lastActivity: "방금",
    promptCount: 12,
    generationCount: 9,
    submitted: true,
    anomaly: null,
    avatar: createAvatar("이", "#0891b2")
  },
  {
    id: 3,
    name: "박지호",
    status: "idle",
    lastActivity: "8분 전",
    promptCount: 3,
    generationCount: 2,
    submitted: false,
    anomaly: "long_idle",
    avatar: createAvatar("박", "#7c3aed")
  },
  {
    id: 4,
    name: "최수아",
    status: "active",
    lastActivity: "1분 전",
    promptCount: 15,
    generationCount: 14,
    submitted: false,
    anomaly: "rapid_submit",
    avatar: createAvatar("최", "#059669")
  },
  {
    id: 5,
    name: "정예준",
    status: "away",
    lastActivity: "15분 전",
    promptCount: 1,
    generationCount: 0,
    submitted: false,
    anomaly: "away",
    avatar: createAvatar("정", "#dc2626")
  },
  {
    id: 6,
    name: "강하은",
    status: "active",
    lastActivity: "30초 전",
    promptCount: 6,
    generationCount: 4,
    submitted: false,
    anomaly: null,
    avatar: createAvatar("강", "#ea580c")
  }
];

const SESSION_TIMELINE = [
  { id: 1, time: "14:00:00", action: "session_start", description: "평가 세션 시작" },
  { id: 2, time: "14:02:15", action: "prompt_write", description: "프롬프트 작성: '해변을 걷는 여성...'" },
  { id: 3, time: "14:03:30", action: "prompt_edit", description: "프롬프트 수정: 조명 키워드 추가" },
  { id: 4, time: "14:04:00", action: "generation", description: "영상 생성 요청 (Sora 2 Pro)" },
  { id: 5, time: "14:06:45", action: "generation_complete", description: "영상 생성 완료" },
  { id: 6, time: "14:07:20", action: "prompt_write", description: "프롬프트 작성: '도시의 야경...'" },
  { id: 7, time: "14:08:10", action: "generation", description: "영상 생성 요청 (Veo Standard)" },
  { id: 8, time: "14:10:30", action: "generation_complete", description: "영상 생성 완료" },
  { id: 9, time: "14:11:00", action: "save", description: "결과물 저장" }
];

const EVALUATION_RESULTS = [
  { id: 1, name: "김민준", submitted: true, generationCount: 5, editCount: 12, score: 85, status: "graded" },
  { id: 2, name: "이서연", submitted: true, generationCount: 9, editCount: 18, score: 92, status: "graded" },
  { id: 3, name: "박지호", submitted: true, generationCount: 2, editCount: 5, score: 68, status: "graded" },
  { id: 4, name: "최수아", submitted: true, generationCount: 14, editCount: 8, score: null, status: "review" },
  { id: 5, name: "정예준", submitted: false, generationCount: 0, editCount: 1, score: null, status: "pending" },
  { id: 6, name: "강하은", submitted: true, generationCount: 4, editCount: 9, score: 78, status: "graded" }
];

const ASSESSMENTS_LIST = [
  { id: 1, title: "1회차 실습 평가", date: "2025-01-15", participants: 24, status: "completed" },
  { id: 2, title: "2회차 프롬프트 테스트", date: "2025-01-17", participants: 22, status: "ongoing" },
  { id: 3, title: "중간 프로젝트", date: "2025-01-20", participants: 0, status: "scheduled" }
];

// ============= 평가·모니터링 컴포넌트 =============
const AnomalyIndicator = ({ type }) => {
  if (!type) return null;
  
  const anomalyConfig = {
    rapid_submit: { label: "빠른 연속 제출", color: "text-amber-600 bg-amber-50 border-amber-200" },
    long_idle: { label: "장시간 비활성", color: "text-orange-600 bg-orange-50 border-orange-200" },
    away: { label: "이탈 감지", color: "text-red-600 bg-red-50 border-red-200" },
    duplicate: { label: "중복 프롬프트", color: "text-purple-600 bg-purple-50 border-purple-200" }
  };
  
  const config = anomalyConfig[type] || anomalyConfig.away;
  
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${config.color}`}>
      <AlertTriangle className="w-3 h-3" />
      {config.label}
    </div>
  );
};

const ParticipantStatusCard = ({ participant, onClick }) => {
  const statusConfig = {
    active: { label: "참여 중", color: "bg-green-500", ringColor: "ring-green-200" },
    idle: { label: "비활성", color: "bg-amber-500", ringColor: "ring-amber-200" },
    away: { label: "이탈", color: "bg-red-500", ringColor: "ring-red-200" }
  };
  
  const status = statusConfig[participant.status] || statusConfig.idle;
  
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-neutral-200 rounded-xl p-4 hover:border-neutral-400 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={participant.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${status.color}`} />
          </div>
          <div>
            <div className="font-semibold text-neutral-900">{participant.name}</div>
            <div className="text-xs text-neutral-500">{status.label} · {participant.lastActivity}</div>
          </div>
        </div>
        {participant.submitted && (
          <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
            제출완료
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-neutral-50 rounded-lg px-3 py-2">
          <div className="text-xs text-neutral-500 mb-0.5">프롬프트</div>
          <div className="text-lg font-semibold text-neutral-900">{participant.promptCount}</div>
        </div>
        <div className="bg-neutral-50 rounded-lg px-3 py-2">
          <div className="text-xs text-neutral-500 mb-0.5">생성</div>
          <div className="text-lg font-semibold text-neutral-900">{participant.generationCount}</div>
        </div>
      </div>
      
      {participant.anomaly && <AnomalyIndicator type={participant.anomaly} />}
    </div>
  );
};

const ParticipantMonitorList = ({ participants, onSelectParticipant }) => {
  const activeCount = participants.filter(p => p.status === 'active').length;
  const submittedCount = participants.filter(p => p.submitted).length;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-neutral-700">참여 중 {activeCount}명</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-neutral-700">제출 {submittedCount}명</span>
          </div>
        </div>
        <div className="text-sm text-neutral-500">총 {participants.length}명</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {participants.map(participant => (
          <ParticipantStatusCard 
            key={participant.id} 
            participant={participant}
            onClick={() => onSelectParticipant(participant)}
          />
        ))}
      </div>
    </div>
  );
};

const ActivityLogItem = ({ activity }) => {
  const actionConfig = {
    session_start: { icon: Play, color: "text-indigo-600 bg-indigo-50" },
    prompt_write: { icon: PenTool, color: "text-purple-600 bg-purple-50" },
    prompt_edit: { icon: PenTool, color: "text-amber-600 bg-amber-50" },
    generation: { icon: Sparkles, color: "text-pink-600 bg-pink-50" },
    generation_complete: { icon: CheckCircle, color: "text-green-600 bg-green-50" },
    save: { icon: Save, color: "text-neutral-600 bg-neutral-100" }
  };
  
  const config = actionConfig[activity.action] || actionConfig.save;
  const Icon = config.icon;
  
  return (
    <div className="flex items-start gap-3 py-3 border-b border-neutral-100 last:border-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-neutral-900">{activity.description}</div>
        <div className="text-xs text-neutral-500 mt-0.5">{activity.time}</div>
      </div>
    </div>
  );
};

const SessionTimeline = ({ timeline, participantName }) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl">
      <div className="px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-neutral-900">{participantName}님의 실습 기록</h3>
            <p className="text-sm text-neutral-500 mt-0.5">세션 타임라인</p>
          </div>
          <button className="px-4 py-2 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2">
            <History className="w-4 h-4" />
            리플레이
          </button>
        </div>
      </div>
      <div className="p-6 max-h-96 overflow-y-auto">
        {timeline.map(activity => (
          <ActivityLogItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
};

const EvaluationSummaryTable = ({ results }) => {
  const getStatusBadge = (status) => {
    const config = {
      graded: { label: "채점완료", color: "bg-green-50 text-green-700 border-green-200" },
      review: { label: "검토중", color: "bg-amber-50 text-amber-700 border-amber-200" },
      pending: { label: "미제출", color: "bg-neutral-100 text-neutral-600 border-neutral-200" }
    };
    const c = config[status] || config.pending;
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${c.color}`}>{c.label}</span>;
  };
  
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900">평가 결과 요약</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-sm rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-1.5">
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-sm rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">학습자</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">제출</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">생성 수</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">수정 횟수</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">점수</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {results.map(result => (
              <tr key={result.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-neutral-900">{result.name}</td>
                <td className="px-6 py-4 text-center">
                  {result.submitted ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-neutral-300 mx-auto" />
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-center text-neutral-700">{result.generationCount}</td>
                <td className="px-6 py-4 text-sm text-center text-neutral-700">{result.editCount}</td>
                <td className="px-6 py-4 text-center">
                  {result.score !== null ? (
                    <span className="text-sm font-semibold text-neutral-900">{result.score}점</span>
                  ) : (
                    <span className="text-sm text-neutral-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">{getStatusBadge(result.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BroadcastMessagePanel = ({ onClose }) => {
  const [messageType, setMessageType] = useState('all');
  const [message, setMessage] = useState('');
  
  const presetMessages = [
    "평가 시작 10분 전입니다.",
    "제출 마감 5분 전입니다.",
    "질문이 있으시면 채팅으로 문의해 주세요.",
    "시간 연장이 승인되었습니다."
  ];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">메시지 발송</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-900">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">발송 대상</label>
            <div className="flex gap-2">
              <button
                onClick={() => setMessageType('all')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  messageType === 'all' 
                    ? 'bg-neutral-900 text-white' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                전체 학습자
              </button>
              <button
                onClick={() => setMessageType('individual')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  messageType === 'individual' 
                    ? 'bg-neutral-900 text-white' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                개별 선택
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">빠른 메시지</label>
            <div className="flex flex-wrap gap-2">
              {presetMessages.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => setMessage(msg)}
                  className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-xs rounded-full hover:bg-neutral-200 transition-colors"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">메시지 내용</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="발송할 메시지를 입력하세요..."
              className="w-full border border-neutral-300 rounded-lg px-4 py-3 text-sm h-24 resize-none focus:outline-none focus:border-neutral-500"
            />
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-neutral-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            발송하기
          </button>
        </div>
      </div>
    </div>
  );
};

// ============= 평가·모니터링 메인 페이지 =============
// ============= 테스트 목록 페이지 =============
const AssessmentListPage = ({ onEnterStudio }) => {
  const [selectedTest, setSelectedTest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const tests = [
    {
      id: 1,
      title: 'AI 영상 생성 실습 평가',
      course: '프롬프트로 AI 영상 만들기',
      status: 'active',
      scheduledAt: '2025-01-17 14:00',
      duration: 30,
      participants: 8,
      submitted: 5,
      avgScore: 88,
      description: 'AI 영상 생성 도구를 활용하여 주어진 주제에 맞는 영상을 제작하는 실습 평가입니다.',
      questions: 5,
      passingScore: 70
    },
    {
      id: 2,
      title: '프롬프트 작성 기초 테스트',
      course: '프롬프트로 AI 영상 만들기',
      status: 'scheduled',
      scheduledAt: '2025-01-20 10:00',
      duration: 20,
      participants: 115,
      submitted: 0,
      avgScore: null,
      description: '효과적인 프롬프트 작성 방법에 대한 이해도를 평가하는 테스트입니다.',
      questions: 10,
      passingScore: 60
    },
    {
      id: 3,
      title: '이미지 생성 중간 평가',
      course: 'AI 이미지 생성 마스터',
      status: 'completed',
      scheduledAt: '2025-01-10 15:00',
      duration: 45,
      participants: 78,
      submitted: 72,
      avgScore: 82,
      description: 'AI 이미지 생성 도구 활용 능력을 평가하는 중간 테스트입니다.',
      questions: 8,
      passingScore: 70,
      results: {
        passed: 58,
        failed: 14,
        scoreDistribution: [
          { range: '90-100', count: 15 },
          { range: '80-89', count: 28 },
          { range: '70-79', count: 15 },
          { range: '60-69', count: 10 },
          { range: '0-59', count: 4 }
        ],
        topScore: 98,
        lowestScore: 45
      }
    },
    {
      id: 4,
      title: '최종 실기 평가',
      course: '생성형 AI 기초',
      status: 'completed',
      scheduledAt: '2024-12-20 14:00',
      duration: 60,
      participants: 234,
      submitted: 228,
      avgScore: 79,
      description: '생성형 AI 전반에 대한 이해와 실무 적용 능력을 종합적으로 평가합니다.',
      questions: 15,
      passingScore: 65,
      results: {
        passed: 185,
        failed: 43,
        scoreDistribution: [
          { range: '90-100', count: 32 },
          { range: '80-89', count: 68 },
          { range: '70-79', count: 55 },
          { range: '65-69', count: 30 },
          { range: '0-64', count: 43 }
        ],
        topScore: 100,
        lowestScore: 38
      }
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />진행 중</span>;
      case 'scheduled':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">예정</span>;
      case 'completed':
        return <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-full">완료</span>;
      default:
        return null;
    }
  };

  const handleShowDetail = (test) => {
    setSelectedTest(test);
    setShowDetailModal(true);
  };

  const handleShowResult = (test) => {
    setSelectedTest(test);
    setShowResultModal(true);
  };

  const activeTests = tests.filter(t => t.status === 'active');
  const scheduledTests = tests.filter(t => t.status === 'scheduled');
  const completedTests = tests.filter(t => t.status === 'completed');

  return (
    <div className="min-h-screen bg-neutral-50 pt-16">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-8">
          <h1 className="text-xl font-bold text-neutral-900 py-5">테스트</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* 요약 카드 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-neutral-200">
            <div className="text-sm text-neutral-500 mb-1">진행 중</div>
            <div className="text-2xl font-bold text-emerald-600">{activeTests.length}개</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-neutral-200">
            <div className="text-sm text-neutral-500 mb-1">예정된 테스트</div>
            <div className="text-2xl font-bold text-blue-600">{scheduledTests.length}개</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-neutral-200">
            <div className="text-sm text-neutral-500 mb-1">완료</div>
            <div className="text-2xl font-bold text-neutral-600">{completedTests.length}개</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-neutral-200">
            <div className="text-sm text-neutral-500 mb-1">전체 응시자</div>
            <div className="text-2xl font-bold text-indigo-600">{tests.reduce((sum, t) => sum + t.participants, 0)}명</div>
          </div>
        </div>

        {/* 진행 중인 테스트 */}
        {activeTests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">진행 중인 테스트</h2>
            <div className="space-y-3">
              {activeTests.map(test => (
                <div
                  key={test.id}
                  className="bg-white border-2 border-emerald-200 rounded-xl p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(test.status)}
                        <span className="text-sm text-neutral-500">{test.course}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{test.title}</h3>
                      <div className="flex items-center gap-6 text-sm text-neutral-600">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-neutral-400" />
                          {test.duration}분
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-neutral-400" />
                          {test.submitted}/{test.participants}명 제출
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-neutral-400" />
                          평균 {test.avgScore}점
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onEnterStudio(test)}
                      className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      평가실 입장
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 예정된 테스트 */}
        {scheduledTests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">예정된 테스트</h2>
            <div className="space-y-3">
              {scheduledTests.map(test => (
                <div
                  key={test.id}
                  className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(test.status)}
                        <span className="text-sm text-neutral-500">{test.course}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{test.title}</h3>
                      <div className="flex items-center gap-6 text-sm text-neutral-600">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-neutral-400" />
                          {test.scheduledAt}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-neutral-400" />
                          {test.participants}명 대상
                        </span>
                        <span>{test.duration}분</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleShowDetail(test)}
                      className="px-5 py-2.5 bg-neutral-100 text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                      상세보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 완료된 테스트 */}
        {completedTests.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">완료된 테스트</h2>
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">테스트명</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">강의</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">일시</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">제출</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">평균 점수</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {completedTests.map(test => (
                    <tr key={test.id} className="hover:bg-neutral-50">
                      <td className="px-5 py-4 text-sm font-medium text-neutral-900">{test.title}</td>
                      <td className="px-5 py-4 text-sm text-neutral-600">{test.course}</td>
                      <td className="px-5 py-4 text-sm text-neutral-600">{test.scheduledAt}</td>
                      <td className="px-5 py-4 text-sm text-neutral-600">{test.submitted}/{test.participants}명</td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-semibold ${test.avgScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {test.avgScore}점
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button 
                          onClick={() => handleShowResult(test)}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          결과보기
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

      {/* 상세보기 모달 */}
      {showDetailModal && selectedTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedTest.status)}
                  <h2 className="text-lg font-bold text-neutral-900">테스트 상세정보</h2>
                </div>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-1">{selectedTest.title}</h3>
                <p className="text-sm text-neutral-500">{selectedTest.course}</p>
              </div>
              
              <p className="text-sm text-neutral-600 leading-relaxed">{selectedTest.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 rounded-xl p-4">
                  <div className="text-xs text-neutral-500 mb-1">예정 일시</div>
                  <div className="font-semibold text-neutral-900">{selectedTest.scheduledAt}</div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <div className="text-xs text-neutral-500 mb-1">소요 시간</div>
                  <div className="font-semibold text-neutral-900">{selectedTest.duration}분</div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <div className="text-xs text-neutral-500 mb-1">문항 수</div>
                  <div className="font-semibold text-neutral-900">{selectedTest.questions}문항</div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <div className="text-xs text-neutral-500 mb-1">합격 기준</div>
                  <div className="font-semibold text-neutral-900">{selectedTest.passingScore}점 이상</div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">응시 대상자</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{selectedTest.participants}명</div>
              </div>
            </div>
            <div className="p-6 border-t border-neutral-200 flex gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2.5 bg-neutral-100 text-neutral-700 font-medium rounded-lg hover:bg-neutral-200 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  // 알림 설정 등 추가 기능
                }}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                알림 설정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결과보기 모달 */}
      {showResultModal && selectedTest && selectedTest.results && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-neutral-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-neutral-900">테스트 결과</h2>
                <button 
                  onClick={() => setShowResultModal(false)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-1">{selectedTest.title}</h3>
                <p className="text-sm text-neutral-500">{selectedTest.course} • {selectedTest.scheduledAt}</p>
              </div>

              {/* 요약 통계 */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <div className="text-xs text-emerald-600 mb-1">합격</div>
                  <div className="text-2xl font-bold text-emerald-700">{selectedTest.results.passed}명</div>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <div className="text-xs text-red-600 mb-1">불합격</div>
                  <div className="text-2xl font-bold text-red-700">{selectedTest.results.failed}명</div>
                </div>
                <div className="bg-indigo-50 rounded-xl p-4 text-center">
                  <div className="text-xs text-indigo-600 mb-1">평균 점수</div>
                  <div className="text-2xl font-bold text-indigo-700">{selectedTest.avgScore}점</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <div className="text-xs text-amber-600 mb-1">합격률</div>
                  <div className="text-2xl font-bold text-amber-700">
                    {Math.round((selectedTest.results.passed / selectedTest.submitted) * 100)}%
                  </div>
                </div>
              </div>

              {/* 점수 분포 */}
              <div className="bg-neutral-50 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-neutral-900 mb-4">점수 분포</h4>
                <div className="space-y-3">
                  {selectedTest.results.scoreDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-16 text-xs text-neutral-600 font-medium">{item.range}</div>
                      <div className="flex-1 bg-neutral-200 rounded-full h-5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            item.range.startsWith('90') ? 'bg-emerald-500' :
                            item.range.startsWith('80') ? 'bg-emerald-400' :
                            item.range.startsWith('70') ? 'bg-yellow-400' :
                            item.range.startsWith('6') ? 'bg-orange-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${(item.count / selectedTest.submitted) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-xs text-neutral-600 text-right">{item.count}명</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 추가 통계 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-neutral-200 rounded-xl p-4">
                  <div className="text-xs text-neutral-500 mb-1">최고 점수</div>
                  <div className="text-xl font-bold text-emerald-600">{selectedTest.results.topScore}점</div>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-4">
                  <div className="text-xs text-neutral-500 mb-1">최저 점수</div>
                  <div className="text-xl font-bold text-red-600">{selectedTest.results.lowestScore}점</div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-neutral-200 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setShowResultModal(false)}
                className="flex-1 px-4 py-2.5 bg-neutral-100 text-neutral-700 font-medium rounded-lg hover:bg-neutral-200 transition-colors"
              >
                닫기
              </button>
              <button
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                상세 리포트 다운로드
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AssessmentStudioPage = ({ test, onExit, user, currentRole }) => {
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showExitAlert, setShowExitAlert] = useState(false);
  const [activeTab, setActiveTab] = useState('monitor');
  
  // currentRole 사용 (viewMode 반영)
  const isInstructor = (currentRole || user?.role) === 'instructor';

  // 강의실 접속자 목록
  const participantsList = [
    { id: 1, name: "용기 있는 바닷가재", email: "bigcrab@guest.io", status: "online" },
    { id: 2, name: "근엄한 유니콘", email: "unicorn@guest.io", status: "online" },
    { id: 3, name: "Jungkook Park", email: "jjk@naver.com", status: "online" },
    { id: 4, name: "유준배", email: "jb@nculture.com", status: "online" },
    { id: 5, name: "김수안", email: "suan@nculture.com", status: "online" },
    { id: 6, name: "황보영", email: "h.young@nculture.com", status: "away" },
    { id: 7, name: "용통성 있는 바닷가재", email: "crab2@guest.io", status: "online" },
    { id: 8, name: "권길동", email: "gkwon@nculture.com", status: "online" },
  ];

  // 제출 현황 데이터
  const submissionData = [
    { id: 1, name: "용기 있는 바닷가재", email: "bigcrab@guest.io", status: "submitted", score: 85, submittedAt: "14:23:45", duration: "18분 32초" },
    { id: 2, name: "근엄한 유니콘", email: "unicorn@guest.io", status: "submitted", score: 92, submittedAt: "14:18:12", duration: "13분 59초" },
    { id: 3, name: "Jungkook Park", email: "jjk@naver.com", status: "in_progress", score: null, submittedAt: null, duration: null },
    { id: 4, name: "유준배", email: "jb@nculture.com", status: "submitted", score: 78, submittedAt: "14:31:02", duration: "26분 49초" },
    { id: 5, name: "김수안", email: "suan@nculture.com", status: "submitted", score: 95, submittedAt: "14:15:38", duration: "11분 25초" },
    { id: 6, name: "황보영", email: "h.young@nculture.com", status: "not_started", score: null, submittedAt: null, duration: null },
    { id: 7, name: "용통성 있는 바닷가재", email: "crab2@guest.io", status: "in_progress", score: null, submittedAt: null, duration: null },
    { id: 8, name: "권길동", email: "gkwon@nculture.com", status: "submitted", score: 88, submittedAt: "14:27:55", duration: "23분 42초" },
  ];

  // 학습자 화면 모니터링 데이터
  const monitoringScreens = [
    { id: 1, name: "용기 있는 바닷가재", hasVideo: true, hasAudio: true, screen: createScreen('active'), face: createAvatar("용", "#6366f1"), status: "active" },
    { id: 2, name: "근엄한 유니콘", hasVideo: true, hasAudio: false, screen: createScreen('active'), face: createAvatar("근", "#6366f1"), status: "active" },
    { id: 3, name: "Jungkook Park", hasVideo: true, hasAudio: true, screen: createScreen('active'), face: createAvatar("J", "#6366f1"), status: "active" },
    { id: 4, name: "유준배", hasVideo: true, hasAudio: false, screen: createScreen('active'), face: createAvatar("유", "#6366f1"), status: "active" },
    { id: 5, name: "김수안", hasVideo: true, hasAudio: true, screen: createScreen('active'), face: createAvatar("김", "#6366f1"), status: "active" },
    { id: 6, name: "황보영", hasVideo: true, hasAudio: false, screen: createScreen('away'), face: createAvatar("황", "#94a3b8"), status: "away", anomaly: "장시간 비활성" },
    { id: 7, name: "용통성 있는 바닷가재", hasVideo: true, hasAudio: true, screen: createScreen('active'), face: createAvatar("용", "#6366f1"), status: "active" },
    { id: 8, name: "권길동", hasVideo: true, hasAudio: false, screen: createScreen('active'), face: createAvatar("권", "#6366f1"), status: "active" },
  ];

  // 제출 현황 통계
  const submissionStats = {
    total: submissionData.length,
    submitted: submissionData.filter(s => s.status === 'submitted').length,
    inProgress: submissionData.filter(s => s.status === 'in_progress').length,
    notStarted: submissionData.filter(s => s.status === 'not_started').length,
    avgScore: Math.round(submissionData.filter(s => s.score !== null).reduce((acc, s) => acc + s.score, 0) / submissionData.filter(s => s.score !== null).length),
  };

  const handleExit = () => {
    setShowExitAlert(true);
  };

  const confirmExit = () => {
    setShowExitAlert(false);
    if (onExit) {
      onExit();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">제출 완료</span>;
      case 'in_progress':
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">진행 중</span>;
      case 'not_started':
        return <span className="px-2 py-1 bg-neutral-100 text-neutral-500 text-xs font-medium rounded-full">미시작</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* 상단 네비게이션 바 - 높이 56px (py-3 = 12px * 2 + 내용) */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-neutral-900 border-b border-neutral-800 h-14">
        <div className="flex items-center justify-between px-6 h-full">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleExit}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              {/* nCulture 로고 */}
              <span className="text-lg tracking-tight">
                <span className="font-normal text-indigo-400">n</span>
                <span className="font-medium text-indigo-400">Culture</span>
              </span>
            </button>
            <div className="h-5 w-px bg-neutral-700" />
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-sm">{test?.title || '평가'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExit}
              className="px-4 py-2 bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg hover:bg-neutral-600 transition-colors"
            >
              나가기
            </button>
          </div>
        </div>
      </div>

      {/* 서브 네비게이션 - 높이 44px, top-14 (56px) */}
      <div className="fixed top-14 left-0 right-0 z-40 bg-neutral-800 h-11">
        <div className="flex items-center justify-between px-6 h-full">
          <div className="flex items-center gap-1">
            {[
              { id: 'monitor', label: '화면 모니터링', icon: Monitor },
              ...(isInstructor ? [{ id: 'results', label: '제출 현황', icon: FileText }] : []),
              { id: 'participants', label: '참여자', icon: Users },
            ].map((menu) => (
              <button
                key={menu.id}
                onClick={() => setActiveTab(menu.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-colors ${
                  activeTab === menu.id 
                    ? 'bg-indigo-600 text-white font-medium' 
                    : 'text-neutral-400 hover:bg-neutral-700 hover:text-white'
                }`}
              >
                <menu.icon className="w-4 h-4" />
                {menu.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-700 rounded-lg">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-neutral-300 text-sm">연결됨</span>
              <span className="font-mono text-emerald-400 text-sm">00:12:34</span>
            </div>
            {isInstructor && (
              <button 
                onClick={() => setShowBroadcast(true)}
                className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                전체 공지
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 - top: 56px + 44px = 100px */}
      <div className="fixed top-[100px] left-0 right-0 bottom-0 flex">
        
        {/* 좌측: 강의실 접속자 */}
        <div className="w-60 bg-neutral-800 border-r border-neutral-700 flex flex-col flex-shrink-0">
          {/* 내 화면 프리뷰 */}
          <div className="p-3 border-b border-neutral-700">
            <div className="relative rounded-lg overflow-hidden aspect-video bg-neutral-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-1">
                  <Video className="w-5 h-5 text-neutral-600" />
                </div>
                <span className="text-neutral-500 text-xs">카메라 꺼짐</span>
              </div>
            </div>
          </div>

          {/* 접속자 목록 헤더 */}
          <div className="px-4 py-3 border-b border-neutral-700">
            <div className="flex items-center justify-between">
              <h3 className="text-neutral-200 font-semibold text-sm">접속자</h3>
              <span className="text-xs text-white bg-indigo-600 px-2 py-0.5 rounded-full">{participantsList.length}명</span>
            </div>
          </div>

          {/* 접속자 목록 */}
          <div className="flex-1 overflow-y-auto">
            {participantsList.map(p => (
              <div key={p.id} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-neutral-700/50 transition-colors cursor-pointer border-b border-neutral-700/50">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-neutral-200 truncate">{p.name}</div>
                  <div className="text-xs text-neutral-500 truncate">{p.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 중앙: 탭별 컨텐츠 */}
        <div className="flex-1 bg-neutral-800 p-5 overflow-y-auto">
          {/* 화면 모니터링 탭 */}
          {activeTab === 'monitor' && (
            <div className="grid grid-cols-4 gap-4 auto-rows-fr">
              {monitoringScreens.map(student => (
                <div 
                  key={student.id} 
                  className="relative rounded-xl overflow-hidden bg-neutral-900 aspect-video group cursor-pointer shadow-md hover:shadow-lg hover:ring-2 hover:ring-indigo-500 transition-all"
                  onClick={() => setSelectedParticipant(student)}
                >
                  {/* 화면 공유 */}
                  <img 
                    src={student.screen}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* 얼굴 PIP */}
                  <div className="absolute top-2 right-2 w-14 h-10 rounded-md overflow-hidden border-2 border-white/30 shadow-lg">
                    <img 
                      src={student.face}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* X 버튼 */}
                  <button 
                    className="absolute top-2 left-2 p-1 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>

                  {/* 이상 행동 경고 */}
                  {student.anomaly && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded flex items-center gap-1 shadow-lg">
                      <AlertTriangle className="w-3 h-3" />
                      {student.anomaly}
                    </div>
                  )}

                  {/* 하단 정보 바 */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className="text-white text-xs font-medium truncate">{student.name}</span>
                        {student.hasAudio && <Volume2 className="w-3 h-3 text-white/70 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button className="p-1 hover:bg-white/20 rounded transition-colors" onClick={(e) => e.stopPropagation()}>
                          <MessageSquare className="w-3.5 h-3.5 text-white/80" />
                        </button>
                        <button className="p-1 hover:bg-white/20 rounded transition-colors" onClick={(e) => e.stopPropagation()}>
                          <Search className="w-3.5 h-3.5 text-white/80" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 제출 현황 탭 */}
          {activeTab === 'results' && (
            <div>
              {/* 통계 카드 */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-neutral-700 rounded-xl p-4">
                  <div className="text-sm text-neutral-400 mb-1">전체 참여자</div>
                  <div className="text-2xl font-bold text-white">{submissionStats.total}명</div>
                </div>
                <div className="bg-neutral-700 rounded-xl p-4">
                  <div className="text-sm text-neutral-400 mb-1">제출 완료</div>
                  <div className="text-2xl font-bold text-emerald-400">{submissionStats.submitted}명</div>
                </div>
                <div className="bg-neutral-700 rounded-xl p-4">
                  <div className="text-sm text-neutral-400 mb-1">진행 중</div>
                  <div className="text-2xl font-bold text-amber-400">{submissionStats.inProgress}명</div>
                </div>
                <div className="bg-neutral-700 rounded-xl p-4">
                  <div className="text-sm text-neutral-400 mb-1">평균 점수</div>
                  <div className="text-2xl font-bold text-indigo-400">{submissionStats.avgScore}점</div>
                </div>
              </div>

              {/* 제출 현황 테이블 */}
              <div className="bg-neutral-700 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-600">
                  <h3 className="font-semibold text-white">제출 현황</h3>
                </div>
                <table className="w-full">
                  <thead className="bg-neutral-800">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase">참여자</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase">상태</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase">점수</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase">제출 시간</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase">소요 시간</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-600">
                    {submissionData.map(student => (
                      <tr key={student.id} className="hover:bg-neutral-600/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-white">{student.name.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{student.name}</div>
                              <div className="text-xs text-neutral-400">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">{getStatusBadge(student.status)}</td>
                        <td className="px-5 py-4">
                          {student.score !== null ? (
                            <span className={`text-sm font-semibold ${
                              student.score >= 90 ? 'text-emerald-400' : 
                              student.score >= 70 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {student.score}점
                            </span>
                          ) : (
                            <span className="text-sm text-neutral-500">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm text-neutral-300">
                          {student.submittedAt || '-'}
                        </td>
                        <td className="px-5 py-4 text-sm text-neutral-300">
                          {student.duration || '-'}
                        </td>
                        <td className="px-5 py-4">
                          {student.status === 'submitted' && (
                            <button className="px-3 py-1.5 text-xs font-medium text-indigo-400 bg-indigo-500/20 rounded-lg hover:bg-indigo-500/30 transition-colors">
                              상세 보기
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 참여자 탭 */}
          {activeTab === 'participants' && (
            <div className="bg-neutral-700 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-600 flex items-center justify-between">
                <h3 className="font-semibold text-white">참여자 목록</h3>
                <span className="text-sm text-neutral-400">{participantsList.length}명 접속 중</span>
              </div>
              <div className="divide-y divide-neutral-600">
                {participantsList.map(p => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-4 hover:bg-neutral-600/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${p.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">{p.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{p.name}</div>
                        <div className="text-xs text-neutral-400">{p.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        p.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {p.status === 'online' ? '온라인' : '자리 비움'}
                      </span>
                      <button className="p-2 hover:bg-neutral-600 rounded-lg transition-colors">
                        <MessageSquare className="w-4 h-4 text-neutral-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 나가기 확인 알럿 */}
      {showExitAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowExitAlert(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">평가실을 나가시겠습니까?</h3>
              <p className="text-neutral-600 text-sm mb-6">
                평가실을 나가면 학습자 모니터링이 중단됩니다.<br />
                진행 중인 평가가 있다면 다른 관리자에게 인계해 주세요.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitAlert(false)}
                  className="flex-1 py-3 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={confirmExit}
                  className="flex-1 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  나가기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 전체 공지 모달 */}
      {showBroadcast && <BroadcastMessagePanel onClose={() => setShowBroadcast(false)} />}

      {/* 학습자 상세 모달 */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedParticipant(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-3">
                <img src={selectedParticipant.face} alt="" className="w-10 h-10 rounded-full border-2 border-white shadow" />
                <div>
                  <h3 className="font-semibold text-neutral-900">{selectedParticipant.name}</h3>
                  <p className="text-sm text-neutral-500">실시간 모니터링</p>
                </div>
              </div>
              <button onClick={() => setSelectedParticipant(null)} className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* 화면 공유 */}
                <div>
                  <h4 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    화면 공유
                  </h4>
                  <div className="rounded-xl overflow-hidden bg-neutral-900 aspect-video shadow-lg">
                    <img src={selectedParticipant.screen} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
                
                {/* 웹캠 */}
                <div>
                  <h4 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    웹캠
                  </h4>
                  <div className="rounded-xl overflow-hidden bg-neutral-900 aspect-video shadow-lg">
                    <img src={selectedParticipant.face} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* 활동 로그 */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  최근 활동
                </h4>
                <div className="bg-neutral-50 rounded-xl p-4 space-y-2 max-h-40 overflow-y-auto">
                  {SESSION_TIMELINE.slice(0, 5).map(activity => (
                    <div key={activity.id} className="flex items-center gap-3 text-sm py-1">
                      <span className="text-neutral-400 font-mono text-xs w-16">{activity.time}</span>
                      <span className="text-neutral-700">{activity.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="mt-6 flex gap-3">
                <button className="flex-1 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  메시지 보내기
                </button>
                <button className="flex-1 py-3 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2">
                  <History className="w-5 h-5" />
                  전체 기록 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const generateImage = (prompt, sessionId) => {
  return createResult(sessionId);
};

// ============= 2단 선택 컴포넌트 =============
const SpecBadge = ({ label, value }) => (
  <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded">
    {label}: {value}
  </span>
);

const ServiceListItem = ({ service, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-all text-left border-l-2 ${
      isSelected ? 'bg-indigo-50 border-l-indigo-600' : 'border-l-transparent'
    }`}
  >
    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-xl flex-shrink-0">
      {service.icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-neutral-900">{service.name}</div>
      <div className="text-xs text-neutral-500 truncate">{service.description}</div>
    </div>
    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-indigo-600' : 'text-neutral-400'}`} strokeWidth={1.5} />
  </button>
);

const TierListItem = ({ tier, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-3 border rounded-lg text-left transition-all ${
      isSelected 
        ? 'bg-indigo-50 border-indigo-300' 
        : 'bg-white border-neutral-200 hover:border-neutral-300'
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="font-semibold text-sm text-neutral-900">{tier.name}</div>
      {isSelected && <Check className="w-4 h-4 text-indigo-600" strokeWidth={2} />}
    </div>
    <div className="text-xs text-neutral-600 mb-2">{tier.description}</div>
    <div className="flex flex-wrap gap-1">
      <SpecBadge label="해상도" value={tier.specs.resolution} />
      <SpecBadge label="길이" value={tier.specs.duration} />
      {tier.specs.audio && <SpecBadge label="오디오" value="지원" />}
    </div>
  </button>
);

const ModelPickerPanel = ({ isOpen, onClose, services, selectedService, selectedTier, onApply, userPlan, onShowUpgradeModal }) => {
  const [tempService, setTempService] = useState(selectedService);
  const [tempTier, setTempTier] = useState(selectedTier);
  const [activeCategory, setActiveCategory] = useState('video');

  // 현재 선택된 서비스의 카테고리 찾기
  useEffect(() => {
    if (isOpen && selectedService) {
      const service = services.find(s => s.id === selectedService);
      if (service) {
        setActiveCategory(service.category);
      }
    }
  }, [isOpen, selectedService, services]);

  if (!isOpen) return null;

  const categories = [
    { id: 'video', label: '영상', icon: '🎬' },
    { id: 'image', label: '이미지', icon: '🖼️' },
    { id: 'text', label: '텍스트', icon: '📝' }
  ];

  const filteredServices = services.filter(s => s.category === activeCategory);
  const currentService = services.find(s => s.id === tempService);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    const firstService = services.find(s => s.category === categoryId);
    if (firstService) {
      setTempService(firstService.id);
      setTempTier(firstService.tiers[0].id);
    }
  };

  const handleApply = () => {
    // 플랜 제한 체크
    if (userPlan && onShowUpgradeModal) {
      const tierLevel = getTierLevel(tempTier);
      const plan = PRICING_PLANS[userPlan] || PRICING_PLANS.free;
      
      if (!plan.features.allowedTiers.includes(tierLevel)) {
        onShowUpgradeModal({
          type: 'tier',
          message: `${tierLevel.toUpperCase()} 모델은 ${plan.name} 플랜에서 사용할 수 없습니다.`
        });
        return;
      }
    }
    
    onApply(tempService, tempTier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">AI 모델 선택</h3>
            <button onClick={onClose} className="text-neutral-500 hover:text-neutral-900">
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
          {/* 카테고리 탭 */}
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="w-2/5 border-r border-neutral-200 overflow-y-auto">
            <div className="p-3 bg-neutral-50 border-b border-neutral-200">
              <h4 className="text-xs font-semibold text-neutral-700 uppercase">
                {categories.find(c => c.id === activeCategory)?.label} 서비스
              </h4>
            </div>
            {filteredServices.map(service => (
              <ServiceListItem
                key={service.id}
                service={service}
                isSelected={tempService === service.id}
                onClick={() => {
                  setTempService(service.id);
                  setTempTier(service.tiers[0].id);
                }}
              />
            ))}
          </div>

          <div className="w-3/5 overflow-y-auto bg-neutral-50">
            <div className="p-3 border-b border-neutral-200">
              <h4 className="text-xs font-semibold text-neutral-700 uppercase">
                {currentService?.name} 모델
              </h4>
            </div>
            <div className="p-4 space-y-3">
              {currentService?.tiers.map(tier => (
                <TierListItem
                  key={tier.id}
                  tier={tier}
                  isSelected={tempTier === tier.id}
                  onClick={() => setTempTier(tier.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-neutral-200 flex gap-3 justify-end bg-neutral-50">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
};

const ModelPicker = ({ service, tier, services, onClick }) => {
  const selectedService = services.find(s => s.id === service);
  const selectedTier = selectedService?.tiers.find(t => t.id === tier);

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-900 mb-1.5">AI 모델</label>
      <button
        onClick={onClick}
        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-left flex items-center justify-between hover:border-indigo-400 hover:bg-white transition-all group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-lg border border-neutral-100">
            {selectedService?.icon}
          </div>
          <div>
            <div className="text-sm font-medium text-neutral-900">{selectedService?.name}</div>
            <div className="text-xs text-neutral-500">{selectedTier?.name}</div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-indigo-500" strokeWidth={2} />
      </button>
    </div>
  );
};

// ============= Create Video 컴포넌트 =============
const FramePickerCard = ({ type }) => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 hover:border-indigo-300 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-neutral-900">
          {type === 'start' ? '시작 프레임' : '종료 프레임'}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-500">
          선택
        </span>
      </div>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="aspect-video bg-white rounded-lg flex items-center justify-center border border-dashed border-neutral-300 cursor-pointer hover:border-indigo-400 transition-all overflow-hidden group"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <Upload className="w-5 h-5 text-neutral-400 mx-auto mb-1 group-hover:text-indigo-500 transition-colors" strokeWidth={1.5} />
            <p className="text-xs text-neutral-500">업로드</p>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

const PromptBox = ({ value, onChange, enhance, onEnhanceToggle, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-neutral-900 mb-1.5">프롬프트</label>
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-neutral-900 placeholder-neutral-400 resize-none h-24 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white leading-relaxed transition-all"
      />
      <div className="absolute bottom-2 right-2">
        <button
          onClick={onEnhanceToggle}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium transition-all ${
            enhance 
              ? 'bg-indigo-600 text-white' 
              : 'bg-neutral-200 text-neutral-500 hover:bg-neutral-300'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          AI 강화
        </button>
      </div>
    </div>
  </div>
);

// 해상도별 최소 플랜 요구사항
const RESOLUTION_PLAN_REQUIREMENTS = {
  '720p': 'free',
  '1080p': 'pro'
};

// 이미지 크기별 최소 플랜 요구사항
const IMAGE_SIZE_PLAN_REQUIREMENTS = {
  '1024x1024': 'free',
  '1792x1024': 'free',
  '1024x1792': 'free',
  '2048x2048': 'pro'
};

// 생성 개수별 최소 플랜 요구사항
const IMAGE_COUNT_PLAN_REQUIREMENTS = {
  '1': 'free',
  '2': 'basic',
  '4': 'pro'
};

// 플랜 순위
const PLAN_RANK = {
  'free': 0,
  'basic': 1,
  'pro': 2,
  'max': 3,
  'enterprise': 4
};

// 플랜이 요구사항을 충족하는지 확인
const isPlanSufficient = (userPlan, requiredPlan) => {
  return PLAN_RANK[userPlan] >= PLAN_RANK[requiredPlan];
};

const DurationResolutionControls = ({ duration, resolution, onDurationChange, onResolutionChange, userPlan = 'free' }) => (
  <div className="grid grid-cols-2 gap-3">
    <div>
      <label className="block text-sm font-medium text-neutral-900 mb-1.5">길이</label>
      <div className="relative">
        <select
          value={duration}
          onChange={(e) => onDurationChange(e.target.value)}
          className="w-full appearance-none bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all cursor-pointer"
        >
          <option value="5s">5초</option>
          <option value="10s">10초</option>
          <option value="15s">15초</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-neutral-900 mb-1.5">해상도</label>
      <div className="relative">
        <select
          value={resolution}
          onChange={(e) => onResolutionChange(e.target.value)}
          className="w-full appearance-none bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all cursor-pointer"
        >
          <option value="720p">720p</option>
          <option value="1080p" disabled={!isPlanSufficient(userPlan, 'pro')}>
            1080p {!isPlanSufficient(userPlan, 'pro') && '(Pro 이상)'}
          </option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>
    </div>
  </div>
);

// 이미지 생성용 설정 컴포넌트
const ImageSettingsControls = ({ imageSize, setImageSize, imageStyle, setImageStyle, imageCount, setImageCount, userPlan = 'free' }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium text-neutral-900 mb-1.5">이미지 크기</label>
        <div className="relative">
          <select
            value={imageSize}
            onChange={(e) => setImageSize(e.target.value)}
            className="w-full appearance-none bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all cursor-pointer"
          >
            <option value="1024x1024">1024 × 1024 (정사각형)</option>
            <option value="1792x1024">1792 × 1024 (가로)</option>
            <option value="1024x1792">1024 × 1792 (세로)</option>
            <option value="2048x2048" disabled={!isPlanSufficient(userPlan, 'pro')}>
              2048 × 2048 (고해상도) {!isPlanSufficient(userPlan, 'pro') && '(Pro 이상)'}
            </option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-900 mb-1.5">생성 개수</label>
        <div className="relative">
          <select
            value={imageCount}
            onChange={(e) => setImageCount(e.target.value)}
            className="w-full appearance-none bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all cursor-pointer"
          >
            <option value="1">1장</option>
            <option value="2" disabled={!isPlanSufficient(userPlan, 'basic')}>
              2장 {!isPlanSufficient(userPlan, 'basic') && '(Basic 이상)'}
            </option>
            <option value="4" disabled={!isPlanSufficient(userPlan, 'pro')}>
              4장 {!isPlanSufficient(userPlan, 'pro') && '(Pro 이상)'}
            </option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-neutral-900 mb-1.5">스타일</label>
      <div className="flex flex-wrap gap-2">
        {['자연스러운', '생생한', '예술적', '사실적', '3D 렌더'].map(style => (
          <button
            key={style}
            onClick={() => setImageStyle(style)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              imageStyle === style
                ? 'bg-indigo-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {style}
          </button>
        ))}
      </div>
    </div>
  </div>
);

// 텍스트 생성용 설정 컴포넌트
const TextSettingsControls = ({ maxTokens, setMaxTokens, temperature, setTemperature, outputFormat, setOutputFormat, userPlan = 'free' }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium text-neutral-900 mb-1.5">최대 길이</label>
        <div className="relative">
          <select
            value={maxTokens}
            onChange={(e) => setMaxTokens(e.target.value)}
            className="w-full appearance-none bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all cursor-pointer"
          >
            <option value="256">짧게 (~256 토큰)</option>
            <option value="512">보통 (~512 토큰)</option>
            <option value="1024">길게 (~1024 토큰)</option>
            <option value="2048" disabled={!isPlanSufficient(userPlan, 'pro')}>
              매우 길게 (~2048 토큰) {!isPlanSufficient(userPlan, 'pro') && '(Pro 이상)'}
            </option>
            <option value="4096" disabled={!isPlanSufficient(userPlan, 'enterprise')}>
              최대 (~4096 토큰) {!isPlanSufficient(userPlan, 'enterprise') && '(Enterprise)'}
            </option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-900 mb-1.5">창의성</label>
        <div className="relative">
          <select
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="w-full appearance-none bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all cursor-pointer"
          >
            <option value="0">정확함 (0)</option>
            <option value="0.3">보수적 (0.3)</option>
            <option value="0.7">균형 (0.7)</option>
            <option value="1.0">창의적 (1.0)</option>
            <option value="1.5">매우 창의적 (1.5)</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-neutral-900 mb-1.5">출력 형식</label>
      <div className="flex flex-wrap gap-2">
        {['일반 텍스트', 'JSON', 'Markdown', '코드', '표 형식'].map(format => (
          <button
            key={format}
            onClick={() => setOutputFormat(format)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              outputFormat === format
                ? 'bg-indigo-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {format}
          </button>
        ))}
      </div>
    </div>
  </div>
);

// 참조 이미지 업로더 (이미지 생성용)
const ReferenceImageUploader = () => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 hover:border-indigo-300 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-neutral-900">참조 이미지</span>
        <span className="text-xs px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-500">선택</span>
      </div>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="aspect-video bg-white rounded-lg flex items-center justify-center border border-dashed border-neutral-300 cursor-pointer hover:border-indigo-400 transition-all overflow-hidden group"
      >
        {preview ? (
          <img src={preview} alt="Reference" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <Upload className="w-5 h-5 text-neutral-400 mx-auto mb-1 group-hover:text-indigo-500 transition-colors" strokeWidth={1.5} />
            <p className="text-xs text-neutral-500">이미지 업로드</p>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

const GenerateButton = ({ onClick, isGenerating, cost = 6, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={isGenerating || disabled}
    className={`group px-8 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-sm ${
      isGenerating || disabled
        ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
        : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg hover:shadow-indigo-500/20'
    }`}
  >
    {isGenerating ? (
      <>
        <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-500 rounded-full animate-spin" />
        <span>생성 중...</span>
      </>
    ) : (
      <>
        <Sparkles className="w-4 h-4" strokeWidth={2} />
        <span>{disabled ? '잔액 부족' : '생성하기'}</span>
        <div className="ml-1 flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-md text-xs">
          <Zap className="w-3 h-3 text-amber-300" strokeWidth={2} />
          <span className="text-amber-200 font-medium">{cost}</span>
        </div>
      </>
    )}
  </button>
);

const VideoToolTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'create', label: '영상 생성', icon: Video, enabled: true },
    { id: 'edit', label: '영상 편집', icon: PenTool, enabled: false },
    { id: 'motion', label: '모션 제어', icon: Activity, enabled: false }
  ];

  return (
    <div className="border-b border-neutral-200 bg-white px-4 py-1.5">
      <div className="flex gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => tab.enabled && onTabChange(tab.id)}
            disabled={!tab.enabled}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-100 text-indigo-700'
                : tab.enabled
                ? 'text-neutral-600 hover:bg-neutral-100'
                : 'text-neutral-300 cursor-not-allowed'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============= Tutor Drawer =============
const TutorDrawer = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-96 bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h3 className="text-xl font-semibold text-neutral-900">튜터에게 질문하기</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-900">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-neutral-700">튜터가 곧 응답할 예정입니다.</p>
          </div>
          <div className="space-y-3">
            <div className="bg-neutral-100 rounded-lg p-3">
              <p className="text-sm">👨‍🏫 안녕하세요! 무엇을 도와드릴까요?</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200">
          <input
            type="text"
            placeholder="질문을 입력하세요..."
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg mb-3"
          />
          <button className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">
            전송
          </button>
        </div>
      </div>
    </div>
  );
};

// ============= 플랜 업그레이드 모달 =============
const UpgradePlanModal = ({ isOpen, onClose, currentPlan, onUpgrade, triggerReason }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showEnterpriseTiers, setShowEnterpriseTiers] = useState(false);
  const [selectedEnterpriseTier, setSelectedEnterpriseTier] = useState(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteStep, setQuoteStep] = useState('form');
  const [quoteForm, setQuoteForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    teamSize: '',
    expectedUsage: '',
    message: ''
  });
  
  if (!isOpen) return null;

  const plans = ['free', 'basic', 'pro', 'max', 'enterprise'];
  const enterpriseTiers = PRICING_PLANS.enterprise.tiers;
  
  const formatPrice = (price) => {
    if (price === null) return '맞춤 견적';
    return `₩${price.toLocaleString()}`;
  };

  const getRecommendedPlan = () => {
    if (triggerReason?.type === 'tier') return 'pro';
    if (triggerReason?.type === 'resolution') return 'pro';
    if (triggerReason?.type === 'credits') return 'pro';
    return 'pro';
  };

  const handleEnterpriseClick = () => {
    setShowEnterpriseTiers(true);
  };

  const handleEnterpriseTierSelect = (tier) => {
    if (tier.id === 'enterprise-unlimited') {
      setShowQuoteForm(true);
      setQuoteStep('form');
    } else {
      setSelectedEnterpriseTier(tier);
      onUpgrade('enterprise', tier);
    }
  };

  const handleQuoteSubmit = () => {
    setQuoteStep('complete');
  };

  const handleQuoteClose = () => {
    setShowQuoteForm(false);
    setQuoteStep('form');
    setQuoteForm({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      teamSize: '',
      expectedUsage: '',
      message: ''
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              {showEnterpriseTiers ? (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowEnterpriseTiers(false)}
                    className="p-1 hover:bg-neutral-100 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5 text-neutral-500" />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-violet-900">Enterprise 플랜 선택</h2>
                    <p className="text-sm text-violet-600 mt-0.5">비즈니스 규모에 맞는 플랜을 선택하세요</p>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-neutral-900">플랜 업그레이드</h2>
                  {triggerReason && (
                    <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {triggerReason.message}
                    </p>
                  )}
                </>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
        </div>

        {/* 결제 주기 토글 */}
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-100">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingCycle === 'monthly' 
                  ? showEnterpriseTiers ? 'bg-violet-600 text-white' : 'bg-indigo-600 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200'
              }`}
            >
              월간 결제
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingCycle === 'yearly' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-neutral-600 border border-neutral-200'
              }`}
            >
              연간 결제 <span className="text-xs ml-1 text-emerald-500">20% 할인</span>
            </button>
          </div>
        </div>

        {/* 플랜 카드 그리드 */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-5 gap-3">
            {plans.map(planId => {
              const plan = PRICING_PLANS[planId];
              const isCurrentPlan = currentPlan === planId;
              const isRecommended = getRecommendedPlan() === planId;
              const isEnterprise = planId === 'enterprise';
              const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
              
              return (
                <div 
                  key={planId}
                  className={`relative border rounded-2xl p-5 transition-all flex flex-col ${
                    isEnterprise
                      ? 'border-violet-300 bg-gradient-to-br from-violet-50 to-indigo-50'
                      : isRecommended 
                        ? 'border-indigo-500 ring-2 ring-indigo-100' 
                        : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {isRecommended && !isEnterprise && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full">
                      추천
                    </div>
                  )}
                  {isEnterprise && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-violet-600 text-white text-xs font-medium rounded-full">
                      기업용
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <h3 className={`text-lg font-bold ${isEnterprise ? 'text-violet-900' : 'text-neutral-900'}`}>{plan.name}</h3>
                    <p className={`text-xs mt-1 ${isEnterprise ? 'text-violet-600' : 'text-neutral-500'}`}>{plan.description}</p>
                  </div>
                  
                  <div className="text-center mb-4">
                    {isEnterprise ? (
                      <>
                        <div className="text-2xl font-bold text-violet-900">
                          {billingCycle === 'yearly' 
                            ? `₩${(2880000/10000).toFixed(0)}만~${(5760000/10000).toFixed(0)}만`
                            : `₩${(299000/10000).toFixed(0)}만~${(599000/10000).toFixed(0)}만`
                          }
                        </div>
                        <div className="text-xs text-violet-500">
                          {billingCycle === 'yearly' ? '/ 년' : '/ 월'}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={`text-3xl font-bold text-neutral-900`}>
                          {formatPrice(price)}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {billingCycle === 'yearly' ? '/ 년' : '/ 월'}
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className={`w-4 h-4 flex-shrink-0 ${isEnterprise ? 'text-violet-500' : 'text-amber-500'}`} />
                      <span className={isEnterprise ? 'text-violet-700' : 'text-neutral-700'}>
                        월 {typeof plan.monthlyCredits === 'number' ? plan.monthlyCredits.toLocaleString() : plan.monthlyCredits}+ 크레딧
                      </span>
                    </div>
                    {plan.detailedFeatures?.slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        {feature.includes('불가') ? (
                          <X className="w-4 h-4 flex-shrink-0 text-neutral-300" />
                        ) : (
                          <Check className={`w-4 h-4 flex-shrink-0 ${isEnterprise ? 'text-violet-500' : 'text-emerald-500'}`} />
                        )}
                        <span className={feature.includes('불가') ? 'text-neutral-400' : isEnterprise ? 'text-violet-600' : 'text-neutral-600'}>
                          {feature}
                        </span>
                      </div>
                    ))}
                    {isEnterprise && (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4 flex-shrink-0 text-violet-500" />
                        <span className="text-violet-600">전담 매니저 · 우선 지원</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      if (isCurrentPlan) return;
                      if (isEnterprise) {
                        handleEnterpriseClick();
                      } else {
                        onUpgrade(planId);
                      }
                    }}
                    disabled={isCurrentPlan}
                    className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors mt-5 ${
                      isCurrentPlan 
                        ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                        : isEnterprise
                          ? 'bg-violet-600 text-white hover:bg-violet-700'
                          : isRecommended
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-neutral-900 text-white hover:bg-neutral-800'
                    }`}
                  >
                    {isCurrentPlan ? '현재 플랜' : isEnterprise ? '플랜 선택하기 →' : '업그레이드'}
                  </button>
                </div>
              );
            })}
          </div>
          
          {/* 크레딧 소비 안내 */}
          <div className="mt-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">💡 크레딧 소비 안내</h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="font-medium text-neutral-700 mb-1">📚 클래스</div>
                <div className="text-neutral-500">강의 수강: 1,500~3,000</div>
              </div>
              <div>
                <div className="font-medium text-neutral-700 mb-1">🎬 라이브</div>
                <div className="text-neutral-500">참여: 800~1,500</div>
                <div className="text-neutral-500">다시보기: 600~1,200</div>
              </div>
              <div>
                <div className="font-medium text-neutral-700 mb-1">🤖 AI 생성</div>
                <div className="text-neutral-500">영상: 15~80</div>
                <div className="text-neutral-500">이미지: 8~25</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise 티어 선택 오버레이 */}
      {showEnterpriseTiers && (
        <div className="absolute inset-0 bg-white rounded-2xl overflow-hidden flex flex-col">
          {/* Enterprise 티어 헤더 (별도 렌더링) */}
          <div className="px-6 py-5 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowEnterpriseTiers(false)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-violet-600" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-violet-900">Enterprise 플랜 선택</h2>
                  <p className="text-sm text-violet-600 mt-0.5">비즈니스 규모에 맞는 플랜을 선택하세요</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
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
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-4 gap-4">
              {enterpriseTiers.map((tier) => {
                const price = billingCycle === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice;
                const isUnlimited = tier.id === 'enterprise-unlimited';
                
                return (
                  <div 
                    key={tier.id}
                    className={`relative border rounded-2xl p-5 transition-all flex flex-col h-full ${
                      tier.popular 
                        ? 'border-violet-500 ring-2 ring-violet-100 bg-gradient-to-br from-violet-50 to-white' 
                        : isUnlimited
                          ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50'
                          : 'border-violet-200 hover:border-violet-300 bg-white'
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-violet-600 text-white text-xs font-medium rounded-full">
                        추천
                      </div>
                    )}
                    {isUnlimited && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                        대기업
                      </div>
                    )}
                    
                    {/* 헤더 */}
                    <div className="text-center mb-4">
                      <h3 className={`text-lg font-bold ${isUnlimited ? 'text-amber-900' : 'text-violet-900'}`}>{tier.name}</h3>
                      <p className="text-xs text-violet-600 mt-1 h-8">{tier.description}</p>
                    </div>
                    
                    {/* 가격 */}
                    <div className="text-center mb-4">
                      <div className={`text-3xl font-bold ${isUnlimited ? 'text-amber-900' : 'text-violet-900'}`}>
                        {formatPrice(price)}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {isUnlimited ? '맞춤 견적' : billingCycle === 'yearly' ? '/ 년' : '/ 월'}
                      </div>
                    </div>
                    
                    {/* 기능 목록 - flex-1로 확장 */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className={`w-4 h-4 ${isUnlimited ? 'text-amber-500' : 'text-violet-500'}`} />
                        <span className={isUnlimited ? 'text-amber-700' : 'text-violet-700'}>
                          {tier.monthlyCredits ? `월 ✨ ${tier.monthlyCredits.toLocaleString()}` : '무제한 크레딧'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className={`w-4 h-4 ${isUnlimited ? 'text-amber-500' : 'text-violet-500'}`} />
                        <span className={isUnlimited ? 'text-amber-600' : 'text-violet-600'}>
                          팀 시트 {tier.teamSeats === 'unlimited' ? '무제한' : `${tier.teamSeats}석`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className={`w-4 h-4 ${isUnlimited ? 'text-amber-400' : 'text-violet-400'}`} />
                        <span className={isUnlimited ? 'text-amber-600' : 'text-violet-600'}>
                          동시생성 {tier.concurrentJobs === 'unlimited' ? '무제한' : `${tier.concurrentJobs}개`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className={`w-4 h-4 ${isUnlimited ? 'text-amber-400' : 'text-violet-400'}`} />
                        <span className={isUnlimited ? 'text-amber-600' : 'text-violet-600'}>SLA {tier.sla}</span>
                      </div>
                    </div>
                    
                    {/* 버튼 - 하단 고정 */}
                    <button
                      onClick={() => handleEnterpriseTierSelect(tier)}
                      className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors mt-5 ${
                        isUnlimited
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : tier.popular
                            ? 'bg-violet-600 text-white hover:bg-violet-700'
                            : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                      }`}
                    >
                      {isUnlimited ? '견적 문의하기' : '이 플랜 선택'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Enterprise 공통 혜택 */}
            <div className="mt-6 bg-violet-50 rounded-xl p-5">
              <h4 className="font-semibold text-violet-900 mb-3">모든 Enterprise 플랜 공통 혜택</h4>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-violet-700">
                  <Check className="w-4 h-4 text-violet-500" />
                  전담 계정 매니저
                </div>
                <div className="flex items-center gap-2 text-violet-700">
                  <Check className="w-4 h-4 text-violet-500" />
                  우선 기술 지원
                </div>
                <div className="flex items-center gap-2 text-violet-700">
                  <Check className="w-4 h-4 text-violet-500" />
                  API 액세스
                </div>
                <div className="flex items-center gap-2 text-violet-700">
                  <Check className="w-4 h-4 text-violet-500" />
                  맞춤형 교육 세션
                </div>
                <div className="flex items-center gap-2 text-violet-700">
                  <Check className="w-4 h-4 text-violet-500" />
                  월간 사용량 리포트
                </div>
                <div className="flex items-center gap-2 text-violet-700">
                  <Check className="w-4 h-4 text-violet-500" />
                  4K+ 해상도 지원
                </div>
                <div className="flex items-center gap-2 text-violet-700">
                  <Check className="w-4 h-4 text-violet-500" />
                  모든 AI 모델 액세스
                </div>
                <div className="flex items-center gap-2 text-violet-700">
                  <Check className="w-4 h-4 text-violet-500" />
                  SSO/SAML 지원
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 견적 문의 폼 오버레이 */}
      {showQuoteForm && (
        <div className="absolute inset-0 bg-white rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowQuoteForm(false)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-amber-600" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-amber-900">Enterprise Unlimited</h2>
                  <p className="text-sm text-amber-600 mt-0.5">맞춤 견적을 위한 정보를 입력해주세요</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                <X className="w-5 h-5 text-amber-500" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {quoteStep === 'form' && (
              <>
                <div className="max-w-lg mx-auto space-y-4">
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

                  {/* Unlimited 혜택 안내 */}
                  <div className="bg-amber-50 rounded-xl p-4">
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

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowQuoteForm(false)}
                      className="flex-1 py-3 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleQuoteSubmit}
                      disabled={!quoteForm.companyName || !quoteForm.contactName || !quoteForm.email || !quoteForm.phone}
                      className="flex-1 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
                    >
                      견적 요청하기
                    </button>
                  </div>
                </div>
              </>
            )}

            {quoteStep === 'complete' && (
              <div className="max-w-md mx-auto text-center py-12">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">견적 요청 완료!</h3>
                <p className="text-neutral-600 mb-8">
                  담당자가 확인 후 영업일 기준 1~2일 내에<br />
                  입력하신 연락처로 연락드리겠습니다.
                </p>
                <button
                  onClick={() => {
                    handleQuoteClose();
                    onClose();
                  }}
                  className="px-8 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
                >
                  확인
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
    <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-8">
        {/* 프로필 헤더 */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 mb-6 text-white">
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
        <div className="bg-white rounded-xl border border-neutral-200 p-1.5 mb-6 flex gap-1">
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
                        placeholder="회사/학교"
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-neutral-50 rounded-xl text-neutral-900">{user?.institution || '-'}</div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">자기소개</label>
                  {isEditingProfile ? (
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="간단한 자기소개를 작성해주세요"
                      rows={3}
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-neutral-50 rounded-xl text-neutral-900 min-h-[80px]">{profileForm.bio || '-'}</div>
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

// ============= 로그인/회원가입 모달 =============
const AuthModal = ({ isOpen, onClose, initialMode = 'login', onLogin }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  
  // 역할 선택 관련 상태
  const [selectedRole, setSelectedRole] = useState(null); // 'student' | 'instructor'
  const [signupStep, setSignupStep] = useState(1); // 1: 역할 선택, 2: 정보 입력
  const [authMethod, setAuthMethod] = useState(null); // 'email' | 'code' | 'none'
  const [institutionEmail, setInstitutionEmail] = useState('');
  const [institutionCode, setInstitutionCode] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  
  // 기관 관리자 가입 관련 상태
  const [instRegStep, setInstRegStep] = useState(1); // 1: 정보 입력, 2: 완료
  const [instRegData, setInstRegData] = useState({
    institutionName: '',
    businessNumber: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    expectedUsers: '',
    purpose: ''
  });

  // 저장된 이메일 불러오기
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('nculture_saved_email');
      const savedRemember = localStorage.getItem('nculture_remember_email');
      if (savedEmail && savedRemember === 'true') {
        setEmail(savedEmail);
        setRememberEmail(true);
      }
    } catch (e) {
      // localStorage 접근 불가 시 무시
    }
  }, []);

  // initialMode가 변경되면 mode도 업데이트
  useEffect(() => {
    setMode(initialMode);
    // 기관 관리자 모드 초기화
    if (initialMode === 'institution_login' || initialMode === 'institution_signup') {
      setInstRegStep(1);
    }
  }, [initialMode]);

  // 모달이 열릴 때 저장된 이메일 유지, 나머지만 초기화
  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setName('');
      setAgreeTerms(false);
      setSelectedRole(null);
      setSignupStep(1);
      setAuthMethod(null);
      setInstitutionEmail('');
      setInstitutionCode('');
      setInstitutionName('');
      setInstRegStep(1);
      setInstRegData({
        institutionName: '',
        businessNumber: '',
        adminName: '',
        adminEmail: '',
        adminPhone: '',
        expectedUsers: '',
        purpose: ''
      });
      // 아이디 저장이 체크되어 있지 않으면 이메일도 초기화
      if (!rememberEmail) {
        setEmail('');
      }
    }
  }, [isOpen, rememberEmail]);

  if (!isOpen) return null;

  // 기관관리자 모드인지 체크
  const isInstitutionMode = mode === 'institution_login' || mode === 'institution_signup';

  // 이메일 저장 처리
  const handleSaveEmail = (shouldSave, emailValue) => {
    try {
      if (shouldSave && emailValue) {
        localStorage.setItem('nculture_saved_email', emailValue);
        localStorage.setItem('nculture_remember_email', 'true');
      } else {
        localStorage.removeItem('nculture_saved_email');
        localStorage.removeItem('nculture_remember_email');
      }
    } catch (e) {
      // localStorage 접근 불가 시 무시
    }
  };

  // 기관 이메일 도메인 체크 (데모용)
  const isInstitutionEmail = (email) => {
    const institutionDomains = ['ac.kr', 'edu', 'edu.kr', 'school.kr', 'university.edu'];
    return institutionDomains.some(domain => email.toLowerCase().endsWith(domain));
  };

  // 기관 코드 검증 (데모용)
  const isValidInstitutionCode = (code) => {
    // 데모: NC- 또는 EDU- 로 시작하는 코드는 유효
    return code.startsWith('NC-') || code.startsWith('EDU-');
  };

  // 승인 상태 결정
  const determineApprovalStatus = () => {
    if (selectedRole === 'student') return 'approved';
    if (authMethod === 'email' && isInstitutionEmail(institutionEmail)) return 'approved';
    if (authMethod === 'code' && isValidInstitutionCode(institutionCode)) return 'approved';
    return 'pending';
  };

  const handleLogin = () => {
    if (mode === 'login') {
      if (email && password) {
        handleSaveEmail(rememberEmail, email);
        // test@test.com만 교육자, 나머지는 수강생
        const isTestInstructor = email.toLowerCase() === 'test@test.com';
        onLogin({ 
          email, 
          name: email.split('@')[0],
          role: isTestInstructor ? 'instructor' : 'student',
          status: 'approved'
        });
      }
    } else if (mode === 'institution_login') {
      if (email && password) {
        handleSaveEmail(rememberEmail, email);
        // 기관 관리자로 로그인
        onLogin({ 
          email, 
          name: email.split('@')[0],
          role: 'institution_admin',
          status: 'approved',
          institutionId: 'inst_001'
        });
      }
    } else {
      if (email && password && name && agreeTerms) {
        const status = determineApprovalStatus();
        onLogin({ 
          email, 
          name,
          role: selectedRole,
          status,
          institution: institutionName || null
        });
      }
    }
  };
  
  // 기관 등록 신청
  const handleInstitutionRegister = () => {
    // 데모: 신청 완료 처리
    setInstRegStep(2);
  };

  // 역할 선택 화면
  const renderRoleSelection = () => (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">어떤 목적으로 가입하시나요?</h3>
      <p className="text-sm text-neutral-500 mb-6">가입 후에도 설정에서 변경할 수 있습니다.</p>
      
      <div className="space-y-3">
        <button
          onClick={() => {
            setSelectedRole('student');
            setSignupStep(2);
          }}
          className="w-full p-4 border-2 border-neutral-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl group-hover:bg-emerald-200 transition-colors">
              👨‍🎓
            </div>
            <div>
              <div className="font-semibold text-neutral-900">수강생으로 가입</div>
              <div className="text-sm text-neutral-500">AI 클래스를 수강하고 실습하고 싶어요</div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => {
            setSelectedRole('instructor');
            setSignupStep(2);
          }}
          className="w-full p-4 border-2 border-neutral-200 rounded-xl hover:border-violet-400 hover:bg-violet-50 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-2xl group-hover:bg-violet-200 transition-colors">
              👨‍🏫
            </div>
            <div>
              <div className="font-semibold text-neutral-900">교육자로 가입</div>
              <div className="text-sm text-neutral-500">강의를 만들고 학생들을 관리하고 싶어요</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  // 교육자 기관 인증 선택
  const renderInstructorAuth = () => (
    <div className="space-y-4">
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
        <h4 className="font-medium text-violet-900 mb-2">🏫 기관 인증 (선택)</h4>
        <p className="text-xs text-violet-700 mb-3">기관 인증 시 즉시 승인됩니다. 인증 없이도 가입 가능하며, 관리자 승인 후 이용 가능합니다.</p>
        
        <div className="space-y-2">
          <button
            onClick={() => setAuthMethod(authMethod === 'email' ? null : 'email')}
            className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${
              authMethod === 'email' 
                ? 'border-violet-400 bg-violet-100' 
                : 'border-violet-200 bg-white hover:bg-violet-50'
            }`}
          >
            <div className="font-medium text-violet-900">📧 기관 이메일 인증</div>
            <div className="text-xs text-violet-600">ac.kr, edu 등 기관 이메일로 인증</div>
          </button>
          
          {authMethod === 'email' && (
            <div className="pl-3 space-y-2">
              <input
                type="email"
                value={institutionEmail}
                onChange={(e) => setInstitutionEmail(e.target.value)}
                placeholder="professor@university.ac.kr"
                className="w-full px-3 py-2 border border-violet-200 rounded-lg text-sm focus:outline-none focus:border-violet-400"
              />
              {institutionEmail && (
                <div className={`text-xs ${isInstitutionEmail(institutionEmail) ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isInstitutionEmail(institutionEmail) 
                    ? '✅ 기관 이메일로 확인되었습니다. 자동 승인됩니다.' 
                    : '⚠️ 기관 이메일이 아닙니다. 관리자 승인이 필요합니다.'}
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={() => setAuthMethod(authMethod === 'code' ? null : 'code')}
            className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${
              authMethod === 'code' 
                ? 'border-violet-400 bg-violet-100' 
                : 'border-violet-200 bg-white hover:bg-violet-50'
            }`}
          >
            <div className="font-medium text-violet-900">🔑 기관 코드 입력</div>
            <div className="text-xs text-violet-600">소속 기관에서 발급받은 코드 입력</div>
          </button>
          
          {authMethod === 'code' && (
            <div className="pl-3 space-y-2">
              <input
                type="text"
                value={institutionCode}
                onChange={(e) => setInstitutionCode(e.target.value.toUpperCase())}
                placeholder="NC-XXXX-XXXX"
                className="w-full px-3 py-2 border border-violet-200 rounded-lg text-sm focus:outline-none focus:border-violet-400 font-mono"
              />
              {institutionCode && (
                <div className={`text-xs ${isValidInstitutionCode(institutionCode) ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isValidInstitutionCode(institutionCode) 
                    ? '✅ 유효한 기관 코드입니다. 자동 승인됩니다.' 
                    : '⚠️ 유효하지 않은 코드입니다. 코드를 확인해주세요.'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">소속 기관명 (선택)</label>
        <input
          type="text"
          value={institutionName}
          onChange={(e) => setInstitutionName(e.target.value)}
          placeholder="예: 서울대학교, ABC 교육원"
          className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
  
  // 기관 등록 신청 폼
  const renderInstitutionRegistration = () => {
    if (instRegStep === 2) {
      // 신청 완료 화면
      return (
        <div className="p-6 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mb-3">신청이 완료되었습니다</h3>
          <p className="text-neutral-600 mb-6">
            영업일 기준 1~2일 내로 담당자가 연락드립니다.<br/>
            빠른 상담을 원하시면 아래 연락처로 문의해주세요.
          </p>
          <div className="bg-neutral-50 rounded-xl p-4 mb-6">
            <div className="text-sm text-neutral-500 mb-1">문의 전화</div>
            <div className="text-lg font-semibold text-neutral-900">02-1234-5678</div>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            확인
          </button>
        </div>
      );
    }
    
    return (
      <div className="p-6 space-y-4">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-2">
          <h4 className="font-medium text-indigo-900 mb-1">🏢 기관 관리자 등록</h4>
          <p className="text-xs text-indigo-700">기관 정보 입력 후 담당자 확인을 거쳐 계정이 활성화됩니다.</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">기관명 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={instRegData.institutionName}
            onChange={(e) => setInstRegData({...instRegData, institutionName: e.target.value})}
            placeholder="예: 서울디지털대학교"
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">사업자등록번호 (선택)</label>
          <input
            type="text"
            value={instRegData.businessNumber}
            onChange={(e) => setInstRegData({...instRegData, businessNumber: e.target.value})}
            placeholder="000-00-00000"
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        
        <div className="border-t border-neutral-200 pt-4 mt-4">
          <h5 className="text-sm font-medium text-neutral-700 mb-3">담당자 정보</h5>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">담당자 이름 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={instRegData.adminName}
                onChange={(e) => setInstRegData({...instRegData, adminName: e.target.value})}
                placeholder="홍길동"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-xs text-neutral-500 mb-1">이메일 <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={instRegData.adminEmail}
                onChange={(e) => setInstRegData({...instRegData, adminEmail: e.target.value})}
                placeholder="admin@institution.ac.kr"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-xs text-neutral-500 mb-1">연락처 <span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={instRegData.adminPhone}
                onChange={(e) => setInstRegData({...instRegData, adminPhone: e.target.value})}
                placeholder="010-0000-0000"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">예상 사용 인원</label>
          <select
            value={instRegData.expectedUsers}
            onChange={(e) => setInstRegData({...instRegData, expectedUsers: e.target.value})}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-white"
          >
            <option value="">선택해주세요</option>
            <option value="1-10">1~10명</option>
            <option value="11-50">11~50명</option>
            <option value="51-100">51~100명</option>
            <option value="101-500">101~500명</option>
            <option value="500+">500명 이상</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">도입 목적 (선택)</label>
          <textarea
            value={instRegData.purpose}
            onChange={(e) => setInstRegData({...instRegData, purpose: e.target.value})}
            placeholder="예: 대학교 AI 미디어 교육 과정 도입"
            rows={2}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>
        
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="instTerms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-indigo-600 border-neutral-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="instTerms" className="text-sm text-neutral-600">
            <span className="text-indigo-600 hover:underline cursor-pointer">이용약관</span> 및{' '}
            <span className="text-indigo-600 hover:underline cursor-pointer">개인정보처리방침</span>에 동의합니다
          </label>
        </div>
        
        <button
          onClick={handleInstitutionRegister}
          disabled={!instRegData.institutionName || !instRegData.adminName || !instRegData.adminEmail || !instRegData.adminPhone || !agreeTerms}
          className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
        >
          신청하기
        </button>
      </div>
    );
  };
  
  // 기관 관리자 로그인 폼
  const renderInstitutionLogin = () => (
    <div className="p-6 space-y-4">
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <h4 className="font-medium text-indigo-900">기관 관리자 전용</h4>
        </div>
        <p className="text-xs text-indigo-700 mt-1">기관 관리자 계정으로 로그인하세요.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@institution.ac.kr"
          className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="instRememberEmail"
          checked={rememberEmail}
          onChange={(e) => {
            setRememberEmail(e.target.checked);
            if (!e.target.checked) {
              handleSaveEmail(false, '');
            }
          }}
          className="w-4 h-4 text-indigo-600 border-neutral-300 rounded focus:ring-indigo-500 cursor-pointer"
        />
        <label htmlFor="instRememberEmail" className="text-sm text-neutral-600 cursor-pointer">
          아이디 저장
        </label>
      </div>
      
      <button
        onClick={handleLogin}
        className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
      >
        로그인
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-16 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[calc(100vh-5rem)] flex flex-col overflow-hidden my-4">
        {/* 헤더 - 고정 */}
        <div className="px-6 py-5 border-b border-neutral-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl tracking-tight">
                <span className="font-normal text-indigo-500">n</span>
                <span className="font-medium text-indigo-500">Culture</span>
              </span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            {mode === 'signup' && signupStep === 2 && (
              <button 
                onClick={() => setSignupStep(1)}
                className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-500" />
              </button>
            )}
            {mode === 'institution_signup' && instRegStep === 1 && (
              <button 
                onClick={() => setMode('institution_login')}
                className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-500" />
              </button>
            )}
            <h2 className="text-xl font-bold text-neutral-900">
              {mode === 'login' ? '로그인' : 
               mode === 'institution_login' ? '기관 관리자 로그인' :
               mode === 'institution_signup' ? '기관 등록 신청' :
               signupStep === 1 ? '회원가입' : 
               selectedRole === 'student' ? '수강생 가입' : '교육자 가입'}
            </h2>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            {mode === 'login' 
              ? 'AI 콘텐츠 제작의 새로운 경험을 시작하세요' 
              : mode === 'institution_login'
                ? '기관 대시보드에 접속합니다'
              : mode === 'institution_signup'
                ? '기관 도입 상담을 신청하세요'
              : signupStep === 1 
                ? '가입 유형을 선택해주세요'
                : selectedRole === 'student'
                  ? '무료로 가입하고 AI 클래스를 수강하세요'
                  : '강의를 만들고 학생들을 관리하세요'}
          </p>
        </div>

        {/* 스크롤 가능한 본문 영역 */}
        <div className="flex-1 overflow-y-auto">
          {/* 기관 관리자 로그인 */}
          {mode === 'institution_login' && renderInstitutionLogin()}
          
          {/* 기관 등록 신청 */}
          {mode === 'institution_signup' && renderInstitutionRegistration()}
          
          {/* 회원가입 - 역할 선택 */}
          {mode === 'signup' && signupStep === 1 && renderRoleSelection()}

          {/* 로그인 또는 회원가입 정보 입력 */}
          {(mode === 'login' || (mode === 'signup' && signupStep === 2)) && (
            <div className="p-6 space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">이름</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* 교육자 가입: 기관 인증 */}
              {mode === 'signup' && selectedRole === 'instructor' && renderInstructorAuth()}

              {/* 로그인 모드: 아이디 저장 체크박스 */}
            {mode === 'login' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberEmail"
                  checked={rememberEmail}
                  onChange={(e) => {
                    setRememberEmail(e.target.checked);
                    if (!e.target.checked) {
                      handleSaveEmail(false, '');
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 border-neutral-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="rememberEmail" className="text-sm text-neutral-600 cursor-pointer">
                  아이디 저장
                </label>
              </div>
            )}

            {/* 회원가입 모드: 약관 동의 체크박스 */}
            {mode === 'signup' && (
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-indigo-600 border-neutral-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="terms" className="text-sm text-neutral-600">
                  <span className="text-indigo-600 hover:underline cursor-pointer">이용약관</span> 및{' '}
                  <span className="text-indigo-600 hover:underline cursor-pointer">개인정보처리방침</span>에 동의합니다
                </label>
              </div>
            )}

            <button
              onClick={handleLogin}
              className={`w-full py-3 text-white font-medium rounded-xl transition-colors cursor-pointer ${
                selectedRole === 'instructor' 
                  ? 'bg-violet-600 hover:bg-violet-700' 
                  : selectedRole === 'student'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {mode === 'login' ? '로그인' : '가입하기'}
            </button>
            
            {/* 교육자 승인 대기 안내 */}
            {mode === 'signup' && selectedRole === 'instructor' && determineApprovalStatus() === 'pending' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                <p className="text-xs text-amber-700">
                  ⏳ 기관 인증 없이 가입 시 관리자 승인 후 교육자 기능을 이용할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        )}
        </div>

        {/* 푸터 - 고정 */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 text-center flex-shrink-0">
          {mode === 'login' ? (
            <p className="text-sm text-neutral-600">
              아직 계정이 없으신가요?{' '}
              <button 
                onClick={() => {
                  setMode('signup');
                  setSignupStep(1);
                  setSelectedRole(null);
                }} 
                className="text-indigo-600 font-medium hover:underline"
              >
                회원가입
              </button>
            </p>
          ) : mode === 'institution_login' ? (
            <p className="text-sm text-neutral-600">
              기관 계정이 없으신가요?{' '}
              <button 
                onClick={() => setMode('institution_signup')} 
                className="text-indigo-600 font-medium hover:underline"
              >
                기관 등록 신청
              </button>
            </p>
          ) : mode === 'institution_signup' && instRegStep === 1 ? (
            <p className="text-sm text-neutral-600">
              이미 기관 계정이 있으신가요?{' '}
              <button 
                onClick={() => setMode('institution_login')} 
                className="text-indigo-600 font-medium hover:underline"
              >
                로그인
              </button>
            </p>
          ) : mode !== 'institution_signup' ? (
            <p className="text-sm text-neutral-600">
              이미 계정이 있으신가요?{' '}
              <button 
                onClick={() => setMode('login')} 
                className="text-indigo-600 font-medium hover:underline"
              >
                로그인
              </button>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// ============= Header =============
const Header = ({ currentPage, setCurrentPage, isLoggedIn, user, viewMode, currentRole, onAuthClick, onLogout, wallet, userPlan, onToggleRole, onRoleSwitch }) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  
  // 역할별 설정
  const getRoleConfig = () => {
    if (viewMode) {
      return { label: '👁️ ' + (viewMode === 'student' ? '수강생 미리보기' : viewMode === 'instructor' ? '교육자 미리보기' : '기관관리 미리보기'), color: 'bg-neutral-100 border-neutral-300 text-neutral-700' };
    }
    switch(user?.role) {
      case 'institution_admin':
        return { label: '🏢 기관 관리자', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' };
      case 'instructor':
        return user?.status === 'pending' 
          ? { label: '⏳ 승인 대기', color: 'bg-amber-50 border-amber-200 text-amber-700' }
          : { label: '👨‍🏫 교육자', color: 'bg-violet-50 border-violet-200 text-violet-700' };
      default:
        return { label: '👨‍🎓 수강생', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' };
    }
  };
  
  const roleConfig = getRoleConfig();
  
  // 역할 전환 옵션
  const getRoleSwitchOptions = () => {
    const options = [];
    const baseRole = user?.role;
    
    if (baseRole === 'institution_admin') {
      if (!viewMode) options.push({ id: null, label: '🏢 기관 관리', active: true });
      else options.push({ id: null, label: '🏢 기관 관리', active: false });
      
      options.push({ id: 'instructor', label: '👨‍🏫 교육자 모드', active: viewMode === 'instructor' });
      options.push({ id: 'student', label: '👨‍🎓 수강생 모드', active: viewMode === 'student' });
    } else if (baseRole === 'instructor' && user?.status === 'approved') {
      if (!viewMode) options.push({ id: null, label: '👨‍🏫 교육자', active: true });
      else options.push({ id: null, label: '👨‍🏫 교육자', active: false });
      
      options.push({ id: 'student', label: '👨‍🎓 수강생 모드', active: viewMode === 'student' });
    }
    
    return options;
  };
  
  const roleSwitchOptions = getRoleSwitchOptions();
  const canSwitchRole = roleSwitchOptions.length > 1;
  
  return (
  <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-100">
    <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
      <div className="flex items-center gap-10">
        <div className="cursor-pointer" onClick={() => setCurrentPage('main')}>
          {/* nCulture 로고 */}
          <span className="text-xl tracking-tight">
            <span className="font-normal text-indigo-500">n</span>
            <span className="font-medium text-indigo-500">Culture</span>
          </span>
        </div>
        <nav className="flex gap-8">
          {[
            { id: 'curriculum', label: '클래스' },
            { id: 'live', label: '라이브' },
            { id: 'assessment', label: '테스트' },
            { id: 'media', label: '갤러리' },
            // 기관 관리자 전용 메뉴
            ...(user?.role === 'institution_admin' && !viewMode ? [{ id: 'institution', label: '기관 관리' }] : [])
          ].map(page => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              className={`text-sm transition-colors ${
                currentPage === page.id ? 'text-neutral-900 font-medium' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {page.label}
            </button>
          ))}
        </nav>
      </div>
      
      {isLoggedIn ? (
        <div className="flex items-center gap-3">
          {/* 역할 표시 및 전환 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => canSwitchRole && setShowRoleDropdown(!showRoleDropdown)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 ${roleConfig.color} ${canSwitchRole ? 'cursor-pointer hover:opacity-80' : ''}`}
            >
              {roleConfig.label}
              {canSwitchRole && <ChevronDown className="w-3 h-3" />}
            </button>
            
            {/* 역할 전환 드롭다운 */}
            {showRoleDropdown && canSwitchRole && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-50">
                <div className="p-2">
                  <div className="text-xs text-neutral-500 px-3 py-2">역할 전환</div>
                  {roleSwitchOptions.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onRoleSwitch && onRoleSwitch(option.id);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        option.active 
                          ? 'bg-indigo-50 text-indigo-700 font-medium' 
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {option.label}
                      {option.active && <Check className="w-4 h-4 inline ml-2" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* 프로필 버튼 (마이페이지로 이동) */}
          <button
            onClick={() => setCurrentPage('mypage')}
            className="flex items-center gap-3 px-3 py-1.5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-sm transition-all group"
          >
            {/* 크레딧 표시 */}
            <div className="flex items-center gap-1.5 pr-3 border-r border-neutral-200">
              <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-neutral-800">{wallet?.balance?.toLocaleString() || 0}</span>
            </div>
            {/* 프로필 */}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                user?.role === 'institution_admin'
                  ? 'bg-gradient-to-br from-indigo-500 to-indigo-600'
                  : user?.role === 'instructor' 
                    ? 'bg-gradient-to-br from-violet-500 to-violet-600' 
                    : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              }`}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-neutral-800 leading-tight">{user?.name}</div>
                <div className="text-[10px] text-neutral-500 leading-tight">{PRICING_PLANS[userPlan]?.name || 'Free'}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
            </div>
          </button>
          <button 
            onClick={onLogout}
            className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <button 
          onClick={() => onAuthClick('login')}
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          시작하기
        </button>
      )}
    </div>
  </header>
  );
};

// ============= 라이브 스튜디오 컴포넌트 =============
const LiveClassCard = ({ liveClass, onJoin, isLoggedIn, onAuthClick }) => {
  const getStatusBadge = () => {
    const badges = {
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
      // 알림 받기는 로그인 필요
      if (!isLoggedIn) {
        onAuthClick('login');
        return;
      }
      // TODO: 알림 설정
      return;
    }
    
    if (!isLoggedIn) {
      onAuthClick('login');
      return;
    }
    onJoin(liveClass.id);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full">
      {/* 썸네일 - 실제 이미지 + 오버레이 */}
      <div className="relative">
        <img src={liveClass.thumbnail} alt="" className="w-full aspect-video object-cover" />
        {/* 상태에 따른 오버레이 */}
        <div className={`absolute inset-0 ${
          liveClass.status === 'live' 
            ? 'bg-gradient-to-t from-red-900/60 to-transparent' 
            : liveClass.status === 'upcoming'
            ? 'bg-gradient-to-t from-indigo-900/50 to-transparent'
            : 'bg-gradient-to-t from-neutral-900/50 to-transparent'
        }`} />
        <div className="absolute top-3 left-3">
          {getStatusBadge()}
        </div>
        {liveClass.status === 'live' && (
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {liveClass.participants}명 참여중
          </div>
        )}
        {/* 하단 시간 정보 */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-white text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-medium">{liveClass.startTime}</span>
          </div>
          {liveClass.status === 'live' && (
            <div className="flex items-center gap-1 text-white text-xs bg-red-500/80 px-2 py-0.5 rounded">
              <Radio className="w-3 h-3" />
              <span>LIVE</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-semibold text-neutral-900 mb-2 line-clamp-2">{liveClass.title}</h3>
        <div className="flex items-center gap-3 text-sm text-neutral-500 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-neutral-100 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-neutral-600" />
            </div>
            {liveClass.instructor}
          </div>
        </div>
        <div className="mt-auto">
          <button
            onClick={handleClick}
            className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              liveClass.status === 'live'
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
                : liveClass.status === 'upcoming'
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {liveClass.status === 'live' ? (
              <>
                <Radio className="w-4 h-4" />
                지금 입장하기
              </>
            ) : liveClass.status === 'upcoming' ? (
              <>
                <Bell className="w-4 h-4" />
                알림 받기
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                다시보기
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const PromptSyncIndicator = ({ isSynced }) => (
  <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
    isSynced ? 'bg-green-50 border-green-200' : 'bg-neutral-50 border-neutral-200'
  }`}>
    <div className={`w-2 h-2 rounded-full ${isSynced ? 'bg-green-500' : 'bg-neutral-400'}`} />
    <span className="text-sm font-medium text-neutral-700">
      {isSynced ? '강사 프롬프트 동기화됨' : '개별 수정 모드'}
    </span>
  </div>
);

const LiveChatPanel = ({ messages, onSendMessage }) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-neutral-200 rounded-lg">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="font-semibold text-neutral-900">실시간 채팅</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`${msg.isInstructor ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-neutral-50'} rounded-lg p-3`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold ${msg.isInstructor ? 'text-indigo-700' : 'text-neutral-600'}`}>
                {msg.user}
              </span>
              <span className="text-xs text-neutral-400">{msg.time}</span>
            </div>
            <p className="text-sm text-neutral-800">{msg.message}</p>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-neutral-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-neutral-500"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Send className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

const LiveClassRoom = ({ classId, onExit }) => {
  const [chatMessages, setChatMessages] = useState(LIVE_CHAT_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeTab, setActiveTab] = useState('classroom');

  const currentClass = LIVE_CLASSES.find(c => c.id === classId);

  const participants = [
    { id: 1, name: "김민지", email: "minji@nculture.com", status: "online" },
    { id: 2, name: "홍길동", email: "hong@naver.com", status: "online" },
    { id: 3, name: "김지영", email: "jiyoung@gmail.com", status: "online" },
    { id: 4, name: "오도윤", email: "doyun@nculture.com", status: "online" },
    { id: 5, name: "박서연", email: "seoyeon@gmail.com", status: "away" },
  ];

  const studentCams = [
    { id: 1, name: "용기 있는 바닷가재", img: createAvatar("용", "#6366f1") },
    { id: 2, name: "근엄한 유니콘", img: createAvatar("근", "#6366f1") },
    { id: 3, name: "김수안", img: createAvatar("김", "#6366f1") },
  ];

  const handleChatMessage = () => {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, {
        id: Date.now(),
        user: "나",
        message: chatInput,
        isInstructor: false,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      }]);
      setChatInput('');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 pt-14">
      {/* 상단 네비게이션 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="text-base tracking-tight hover:opacity-80 transition-opacity">
              <span className="font-normal text-indigo-400">n</span>
              <span className="font-medium text-indigo-400">Culture</span>
            </button>
            <div className="h-4 w-px bg-neutral-700" />
            <span className="text-neutral-400 text-sm truncate max-w-md">{currentClass?.title}</span>
          </div>
          <button onClick={onExit} className="px-3 py-1.5 bg-neutral-700 text-neutral-300 text-sm font-medium rounded-lg hover:bg-neutral-600">
            나가기
          </button>
        </div>
      </div>

      {/* 서브 네비게이션 */}
      <div className="fixed top-[52px] left-0 right-0 z-40 bg-neutral-800 border-b border-neutral-700">
        <div className="flex items-center justify-between px-4 py-1.5">
          <div className="flex items-center gap-1">
            {[
              { id: 'classroom', label: '강의실', icon: Video },
              { id: 'chat', label: '채팅', icon: MessageSquare },
              { id: 'participants', label: '참여자', icon: Users },
            ].map((menu) => (
              <button
                key={menu.id}
                onClick={() => setActiveTab(menu.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                  activeTab === menu.id ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:bg-neutral-700 hover:text-white'
                }`}
              >
                <menu.icon className="w-3.5 h-3.5" />
                {menu.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-neutral-400">연결됨</span>
            <span className="font-mono text-emerald-400">00:17:22</span>
          </div>
        </div>
      </div>

      {/* 강의실 탭 */}
      {activeTab === 'classroom' && (
        <div className="flex h-[calc(100vh-88px)] pt-[36px]">
          <div className="w-52 bg-neutral-800 border-r border-neutral-700 flex flex-col">
            <div className="p-3 border-b border-neutral-700 flex items-center justify-between">
              <h3 className="text-neutral-200 font-medium text-xs">접속자</h3>
              <span className="text-xs text-white bg-indigo-600 px-1.5 py-0.5 rounded">{participants.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {participants.map(p => (
                <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-700/50">
                  <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-xs text-neutral-200 truncate">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-neutral-900 p-3">
            <div className="flex-1 relative rounded-lg overflow-hidden bg-black">
              <img src={createScreen('active')} alt="강사 화면" className="w-full h-full object-contain" />
              <div className="absolute top-3 right-3 w-36 aspect-video rounded-lg overflow-hidden border border-indigo-500/50 shadow-xl">
                <img src={createAvatar("김", "#6366f1")} alt="강사" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-xs">김민수 강사</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-red-400 text-xs">LIVE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 mt-3">
              <button onClick={() => setIsMuted(!isMuted)} className={`p-2.5 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'}`}>
                <Volume2 className="w-4 h-4" />
              </button>
              <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-2.5 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'}`}>
                <VideoOff className="w-4 h-4" />
              </button>
              <button className="p-2.5 rounded-full bg-neutral-700 text-neutral-300 hover:bg-neutral-600">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="w-56 bg-neutral-800 border-l border-neutral-700 flex flex-col">
            <div className="p-2 border-b border-neutral-700">
              <div className="relative rounded overflow-hidden aspect-video bg-neutral-900">
                <img src={createAvatar("김", "#6366f1")} alt="강사" className="w-full h-full object-cover" />
                <div className="absolute bottom-1 left-1 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-xs">강사</span>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {studentCams.map(s => (
                <div key={s.id} className="relative rounded overflow-hidden aspect-video bg-neutral-900">
                  <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 text-white text-xs bg-black/60 px-1.5 py-0.5 rounded truncate max-w-[80px]">{s.name}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-700 h-44">
              <div className="px-2 py-1.5 border-b border-neutral-700 flex justify-between">
                <h4 className="text-neutral-200 text-xs font-medium">채팅</h4>
                <button onClick={() => setActiveTab('chat')} className="text-xs text-indigo-400 hover:text-indigo-300">전체보기</button>
              </div>
              <div className="overflow-y-auto p-2 space-y-1 h-24">
                {chatMessages.slice(-3).map(msg => (
                  <div key={msg.id}>
                    <span className={`text-xs font-medium ${msg.isInstructor ? 'text-indigo-400' : 'text-neutral-500'}`}>{msg.user}</span>
                    <span className="text-xs text-neutral-400 ml-1">{msg.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 채팅 탭 */}
      {activeTab === 'chat' && (
        <div className="h-[calc(100vh-88px)] pt-[36px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map(msg => (
              <div key={msg.id} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.isInstructor ? 'bg-indigo-600' : 'bg-neutral-700'}`}>
                  <span className="text-white text-xs">{msg.user.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${msg.isInstructor ? 'text-indigo-400' : 'text-neutral-200'}`}>{msg.user}</span>
                    {msg.isInstructor && <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded">강사</span>}
                    <span className="text-xs text-neutral-500">{msg.time}</span>
                  </div>
                  <p className="text-sm text-neutral-300">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-neutral-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatMessage()}
                placeholder="메시지를 입력하세요"
                className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              />
              <button onClick={handleChatMessage} className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 참여자 탭 */}
      {activeTab === 'participants' && (
        <div className="h-[calc(100vh-88px)] pt-[36px] p-4">
          <div className="bg-neutral-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-700 flex justify-between">
              <h3 className="text-white font-medium">참여자 목록</h3>
              <span className="text-sm text-neutral-400">{participants.length}명</span>
            </div>
            <div className="divide-y divide-neutral-700">
              {participants.map(p => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-700/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${p.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">{p.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="text-sm text-white">{p.name}</div>
                      <div className="text-xs text-neutral-500">{p.email}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${p.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {p.status === 'online' ? '접속 중' : '자리 비움'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LiveStudioPage = ({ onJoinClass, isLoggedIn, onAuthClick }) => {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">라이브</h1>
          <p className="text-neutral-600">실시간 AI 실습 클래스에 참여하세요</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {LIVE_CLASSES.map(liveClass => (
            <LiveClassCard
              key={liveClass.id}
              liveClass={liveClass}
              onJoin={onJoinClass}
              isLoggedIn={isLoggedIn}
              onAuthClick={onAuthClick}
            />
          ))}
        </div>

        <div className="mt-16 bg-indigo-50 rounded-2xl p-10">
          <h3 className="text-2xl font-bold text-neutral-900 mb-6">라이브란?</h3>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Video className="w-7 h-7 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-2">실시간 시연</h4>
              <p className="text-sm text-neutral-600 leading-relaxed">강사가 AI 도구를 실시간으로 사용하는 모습을 직접 확인</p>
            </div>
            <div>
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-2">동시 실습</h4>
              <p className="text-sm text-neutral-600 leading-relaxed">강사 프롬프트를 받아 함께 생성하며 학습</p>
            </div>
            <div>
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-7 h-7 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-2">즉시 질문</h4>
              <p className="text-sm text-neutral-600 leading-relaxed">실시간 채팅으로 궁금한 점을 바로 해결</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= Main Page =============
const MainPage = ({ setCurrentPage, setCurrentSession, isLoggedIn, onAuthClick, onInstitutionAuthClick }) => (
  <div className="min-h-screen bg-white">
    <section className="pt-32 pb-24 px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold leading-relaxed">
            <span className="text-indigo-600">AI 콘텐츠 교육,</span>
          </h1>
          <h2 className="text-4xl font-bold text-neutral-900 mt-6 leading-relaxed">
            <span className="text-black font-extrabold text-5xl">앤컬쳐</span>와 함께면<br/>
            기초 학습부터 전문가로의 성장까지
          </h2>
          <p className="text-4xl font-bold text-neutral-800 mt-8 mb-12">
            모두 가능합니다!
          </p>
          <button 
            onClick={() => {
              if (isLoggedIn) {
                setCurrentSession(1);
              } else {
                onAuthClick('signup');
              }
            }}
            className="w-full max-w-md px-8 py-4 bg-indigo-600 text-white text-base font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            {isLoggedIn ? '학습 시작하기' : '무료로 시작하기'}
          </button>
        </div>
        
        {/* 우측 일러스트 영역 */}
        <div className="flex-shrink-0 relative">
          <div className="w-80 h-80 bg-indigo-100 rounded-full flex items-center justify-center">
            <div className="text-center">
              <Video className="w-20 h-20 text-indigo-500 mx-auto mb-4" />
              <div className="text-indigo-600 font-medium">AI Video Creation</div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-400 rounded-2xl flex items-center justify-center rotate-12">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-indigo-300 rounded-full flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </section>

    {/* 기능 소개 섹션 */}
    <section className="py-20 px-8 bg-neutral-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-neutral-900 text-center mb-4">체계적인 AI 영상 교육</h2>
        <p className="text-neutral-600 text-center mb-12">실무에 바로 적용할 수 있는 커리큘럼</p>
        
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-5">
              <BookOpen className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">단계별 커리큘럼</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">기초부터 고급까지 체계적인 학습 경로를 제공합니다.</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-5">
              <Video className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">라이브 실습</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">실시간으로 강사와 함께 AI 도구를 실습합니다.</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-5">
              <Target className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">실시간 평가</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">학습 진도와 성과를 실시간으로 모니터링합니다.</p>
          </div>
        </div>
      </div>
    </section>
    
    {/* Footer */}
    <footer className="bg-white border-t border-neutral-200 py-8 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          {/* 로고 및 저작권 */}
          <div className="flex items-center gap-6">
            <span className="text-lg tracking-tight">
              <span className="font-normal text-indigo-500">n</span>
              <span className="font-medium text-indigo-500">Culture</span>
            </span>
            <p className="text-sm text-neutral-500">© 2025 nCulture. All rights reserved.</p>
          </div>
          
          {/* 링크 */}
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <button className="hover:text-neutral-900 transition-colors">이용약관</button>
            <button className="hover:text-neutral-900 transition-colors">개인정보처리방침</button>
            <button className="hover:text-neutral-900 transition-colors">문의하기</button>
            <span className="w-px h-4 bg-neutral-200" />
            <button 
              onClick={() => onInstitutionAuthClick && onInstitutionAuthClick('institution_login')}
              className="text-neutral-400 hover:text-neutral-600 transition-colors flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5" />
              기관 관리자
            </button>
          </div>
        </div>
      </div>
    </footer>
  </div>
);

// ============= Course Card =============
const CourseCard = ({ course, onClick }) => {
  // AI 서비스 아이콘들 (썸네일 위에 표시)
  const serviceIcons = ['🎬', '🎵', '🎯', '⚡'];
  
  return (
    <div 
      className="bg-neutral-900 rounded-2xl overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* 썸네일 영역 - 이미지 + 오버레이 */}
      <div className="relative">
        <img 
          src={course.thumbnail} 
          alt={course.title} 
          className="w-full aspect-[4/3] object-cover"
        />
        
        {/* 어두운 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-neutral-900/50" />
        
        {/* AI 서비스 아이콘 그리드 - 좌측 */}
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
        
        {/* 우측 장식 */}
        <div className="absolute top-3 right-3 w-12 h-12 border border-white/20 rounded-lg" />
      </div>
      
      {/* 정보 영역 */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
          {course.title}
        </h3>
        
        {/* 가격 */}
        <div className="text-lg font-bold text-white mb-1">무료</div>
        
        {/* 리뷰 */}
        <div className="flex items-center gap-1 text-sm text-neutral-400 mb-3">
          <span className="text-amber-400">★</span>
          <span>후기 {12 + course.totalSessions * 3}개</span>
        </div>
        
        {/* 메타 정보 */}
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>총 {course.totalSessions} 세션</span>
          <span className="w-1 h-1 bg-neutral-600 rounded-full" />
          <span>{course.instructor}</span>
        </div>
      </div>
    </div>
  );
};

// ============= Curriculum Page (강의 목록) =============
const CurriculumPage = ({ setCurrentPage, setCurrentCourse }) => (
  <div className="min-h-screen bg-white pt-24 pb-16">
    <div className="max-w-7xl mx-auto px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-neutral-900 mb-3">클래스</h1>
        <p className="text-neutral-600">체계적인 AI 콘텐츠 창작 학습 과정</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {Object.values(CURRICULUM).map(course => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={() => {
              setCurrentCourse(course.id);
              setCurrentPage('courseDetail');
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ============= Course Detail Page (세부 커리큘럼) =============
const CourseDetailPage = ({ courseId, setCurrentPage, setCurrentSession, isLoggedIn, onAuthClick }) => {
  const course = CURRICULUM[courseId];
  
  if (!course) return null;

  const handleStartSession = (sessionId) => {
    if (isLoggedIn) {
      setCurrentSession(sessionId);
    } else {
      onAuthClick('login');
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-8">
        {/* 뒤로가기 */}
        <button 
          onClick={() => setCurrentPage('curriculum')}
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-8 transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span className="text-sm">전체 클래스</span>
        </button>

        {/* 강의 헤더 */}
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

        {/* 세션 목록 */}
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-6">커리큘럼 ({course.sessions.length}개 세션)</h2>
          <div className="space-y-4">
            {course.sessions.map((session, index) => (
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
};

// ============= Session Page =============
const SessionPage = ({ sessionId, wallet, setWallet, addLedgerEntry, userPlan, onShowUpgradeModal, user, currentRole }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [selectedService, setSelectedService] = useState('sora');
  const [selectedTier, setSelectedTier] = useState('sora-2');
  const [prompt, setPrompt] = useState('');
  const [enhance, setEnhance] = useState(false);
  // 영상 설정
  const [duration, setDuration] = useState('10s');
  const [resolution, setResolution] = useState('1080p');
  const [audioOn, setAudioOn] = useState(true);
  // 이미지 설정
  const [imageSize, setImageSize] = useState('1024x1024');
  const [imageStyle, setImageStyle] = useState('자연스러운');
  const [imageCount, setImageCount] = useState('1');
  // 텍스트 설정
  const [maxTokens, setMaxTokens] = useState('1024');
  const [temperature, setTemperature] = useState('0.7');
  const [outputFormat, setOutputFormat] = useState('일반 텍스트');
  
  const [results, setResults] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [runningJobs, setRunningJobs] = useState(0);
  
  // 알림 자동 스크롤 ref
  const notificationRef = useRef(null);
  
  // 교육자 전용 상태
  const [showStudentPanel, setShowStudentPanel] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [showScheduledNoticePanel, setShowScheduledNoticePanel] = useState(false);
  
  // 공지 수신 상태 (모든 사용자)
  const [receivedBroadcast, setReceivedBroadcast] = useState(null);
  
  // 예약 공지 시스템
  const [scheduledNotices, setScheduledNotices] = useState([
    { id: 1, time: '00:00', type: 'start', message: '안녕하세요! 오늘 수업을 시작합니다. 집중해서 들어주세요.', enabled: true },
    { id: 2, time: '05:00', type: 'practice', message: '이제 첫 번째 실습을 시작해보세요. 프롬프트를 직접 작성해봅시다!', enabled: true },
    { id: 3, time: '10:00', type: 'hint', message: '💡 힌트: 구체적인 형용사와 분위기를 설명하면 더 좋은 결과를 얻을 수 있어요.', enabled: true },
    { id: 4, time: '15:00', type: 'reminder', message: '⏰ 실습 마무리 5분 전입니다. 작업을 완료해주세요.', enabled: true },
    { id: 5, time: '20:00', type: 'end', message: '수고하셨습니다! 오늘 배운 내용을 복습해보세요. 다음 회차에서 만나요! 👋', enabled: true },
  ]);
  const [newNoticeTime, setNewNoticeTime] = useState('');
  const [newNoticeMessage, setNewNoticeMessage] = useState('');
  const [newNoticeType, setNewNoticeType] = useState('info');
  const [editingNotice, setEditingNotice] = useState(null);
  
  // 영상 재생 시간 시뮬레이션 (실제로는 비디오 플레이어와 연동)
  const [videoTime, setVideoTime] = useState(0); // 초 단위
  const [displayedNotices, setDisplayedNotices] = useState([]); // 이미 표시된 공지 ID
  
  // currentRole 사용 (viewMode 반영)
  const isInstructor = (currentRole || user?.role) === 'instructor';
  
  // 수강생 목록 (교육자용)
  const studentList = [
    { id: 1, name: '김민준', status: 'active', generates: 5, lastPrompt: '도시의 야경이 반짝이는...' },
    { id: 2, name: '이서연', status: 'active', generates: 3, lastPrompt: '바다 위를 나는 드론...' },
    { id: 3, name: '박지호', status: 'idle', generates: 1, lastPrompt: '숲 속의 오두막...' },
    { id: 4, name: '최수아', status: 'active', generates: 8, lastPrompt: '미래 도시의 일출...' },
    { id: 5, name: '정예준', status: 'offline', generates: 0, lastPrompt: '-' },
  ];
  
  // 시간 문자열을 초로 변환
  const timeToSeconds = (timeStr) => {
    const [min, sec] = timeStr.split(':').map(Number);
    return min * 60 + sec;
  };
  
  // 초를 시간 문자열로 변환
  const secondsToTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };
  
  // 영상 시간 시뮬레이션 (데모용 - 5초마다 1분씩 진행)
  useEffect(() => {
    if (!isInstructor) {
      const timer = setInterval(() => {
        setVideoTime(prev => prev + 60); // 5초마다 1분 증가 (데모 가속)
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isInstructor]);
  
  // 예약 공지 트리거
  useEffect(() => {
    if (!isInstructor) {
      scheduledNotices.forEach(notice => {
        if (notice.enabled && !displayedNotices.includes(notice.id)) {
          const noticeSeconds = timeToSeconds(notice.time);
          if (videoTime >= noticeSeconds) {
            setReceivedBroadcast({
              message: notice.message,
              from: '김교수',
              time: notice.time,
              type: notice.type
            });
            setDisplayedNotices(prev => [...prev, notice.id]);
          }
        }
      });
    }
  }, [videoTime, isInstructor, scheduledNotices, displayedNotices]);
  
  // 공지 타입별 아이콘
  const getNoticeTypeInfo = (type) => {
    switch(type) {
      case 'start': return { label: '시작', color: 'bg-emerald-100 text-emerald-700', icon: '🎬' };
      case 'practice': return { label: '실습', color: 'bg-indigo-100 text-indigo-700', icon: '✏️' };
      case 'hint': return { label: '힌트', color: 'bg-amber-100 text-amber-700', icon: '💡' };
      case 'reminder': return { label: '알림', color: 'bg-orange-100 text-orange-700', icon: '⏰' };
      case 'end': return { label: '종료', color: 'bg-neutral-100 text-neutral-700', icon: '👋' };
      default: return { label: '정보', color: 'bg-blue-100 text-blue-700', icon: '📢' };
    }
  };
  
  // 피드 스크롤 ref
  const feedRef = useRef(null);
  
  // 새 결과가 추가되면 피드 맨 아래로 스크롤
  useEffect(() => {
    if (feedRef.current && results.length > 0) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [results]);

  // notification이 변경되면 해당 영역으로 스크롤
  useEffect(() => {
    if (notification && notificationRef.current) {
      notificationRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [notification]);

  const currentSession = Object.values(CURRICULUM)
    .flatMap(stage => stage.sessions)
    .find(s => s.id === sessionId);

  if (!currentSession) return null;

  // 현재 선택된 서비스의 카테고리 확인
  const currentServiceData = AI_SERVICES.find(s => s.id === selectedService);
  const currentCategory = currentServiceData?.category || 'video';

  // 실시간 크레딧 계산 (카테고리별로 다르게)
  const calculateCategoryCredits = () => {
    if (currentCategory === 'video') {
      return calculateCredits(selectedTier, duration, resolution, audioOn);
    } else if (currentCategory === 'image') {
      const tierData = currentServiceData?.tiers.find(t => t.id === selectedTier);
      const base = tierData?.pricing?.base || 8;
      const multiplier = tierData?.pricing?.multiplier || 1;
      return Math.ceil(base * multiplier * parseInt(imageCount));
    } else {
      const tierData = currentServiceData?.tiers.find(t => t.id === selectedTier);
      const base = tierData?.pricing?.base || 2;
      const multiplier = tierData?.pricing?.multiplier || 1;
      const tokenMultiplier = parseInt(maxTokens) / 1024;
      return Math.ceil(base * multiplier * tokenMultiplier);
    }
  };
  
  const estimatedCredits = calculateCategoryCredits();
  const insufficientBalance = wallet.balance < estimatedCredits;
  
  // 플랜 제한 체크 (영상만 해상도 체크, 이미지/텍스트는 티어만 체크)
  const planCheck = currentCategory === 'video' 
    ? checkPlanLimits(userPlan, selectedTier, resolution, runningJobs)
    : checkPlanLimits(userPlan, selectedTier, '720p', runningJobs); // 이미지/텍스트는 해상도 체크 스킵

  const handlePromptApply = (text) => {
    setPrompt(text);
  };

  const getPromptPlaceholder = () => {
    if (currentCategory === 'image') {
      if (selectedService === 'dalle') return '생성하고 싶은 이미지를 자세히 설명하세요...';
      if (selectedService === 'midjourney') return '예술적인 이미지 스타일과 내용을 설명하세요...';
      return '생성하고 싶은 이미지를 설명하세요...';
    }
    if (currentCategory === 'text') {
      if (selectedService === 'gpt4') return '질문이나 작업 내용을 입력하세요...';
      if (selectedService === 'claude') return '요청사항을 자세히 설명하세요...';
      return '텍스트 생성 요청을 입력하세요...';
    }
    if (selectedService === 'sora') return '멀티샷 장면을 구체적으로 설명하세요...';
    if (selectedService === 'veo') return '정밀한 비디오 설명을 입력하세요...';
    return '생성하고 싶은 영상을 설명하세요...';
  };

  const handleModelApply = (service, tier) => {
    setSelectedService(service);
    setSelectedTier(tier);
    // 선택된 티어의 오디오 지원 여부 확인
    const selectedSvc = AI_SERVICES.find(s => s.id === service);
    const selectedTierData = selectedSvc?.tiers.find(t => t.id === tier);
    setAudioOn(selectedTierData?.audioSupported || false);
  };

  const handleGenerate = async () => {
    // 1. 프롬프트 체크
    if (!prompt.trim()) {
      setNotification({ type: 'error', message: '프롬프트를 입력해주세요.' });
      return;
    }
    
    // 2. 크레딧 잔액 체크 - 부족하면 플랜 구매 모달 표시
    if (insufficientBalance) {
      onShowUpgradeModal({
        type: 'credits',
        message: '크레딧이 부족합니다. 플랜을 업그레이드하거나 크레딧을 충전해주세요.'
      });
      return;
    }
    
    const jobId = `job_${Date.now()}`;
    const creditsToUse = estimatedCredits;
    
    // 1. Reserve: 크레딧 예약 (임시 차감)
    setWallet(prev => ({ ...prev, balance: prev.balance - creditsToUse }));
    addLedgerEntry({
      id: Date.now(),
      type: 'reserve',
      amount: creditsToUse,
      jobId,
      createdAt: new Date().toISOString(),
      providerId: selectedService,
      tierId: selectedTier
    });
    
    // API 스텁 호출 (실제로는 백엔드 연동)
    await apiReserveCredits('user_mock', creditsToUse);
    
    setIsGenerating(true);
    setRunningJobs(prev => prev + 1);
    
    // 2. Generate Job (mock)
    const payload = {
      prompt,
      serviceId: selectedService,
      tierId: selectedTier,
      duration,
      resolution,
      audioOn
    };
    await apiGenerateJob(payload);
    
    // 3. Mock 생성 결과 (80% 성공, 20% 실패)
    setTimeout(async () => {
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        // Capture: 크레딧 확정
        await apiCaptureCredits(jobId);
        addLedgerEntry({
          id: Date.now(),
          type: 'capture',
          amount: creditsToUse,
          jobId,
          createdAt: new Date().toISOString(),
          providerId: selectedService,
          tierId: selectedTier
        });
        
        const service = AI_SERVICES.find(s => s.id === selectedService);
        const tier = service?.tiers.find(t => t.id === selectedTier);
        
        // 실습 평가 생성
        const evaluation = generatePracticeEvaluation(prompt, sessionId, currentCategory);
        
        // 함수형 업데이트로 새 항목을 배열 끝에 추가 (최신이 아래로)
        setResults(prev => [...prev, {
          id: Date.now(),
          service: service?.name,
          tier: tier?.name,
          prompt: prompt,
          thumbnail: generateImage(prompt, sessionId),
          timestamp: new Date().toLocaleString(),
          duration,
          resolution,
          creditsUsed: creditsToUse,
          evaluation
        }]);
        
        setNotification({ type: 'success', message: `생성 완료! ${creditsToUse} 크레딧 사용` });
      } else {
        // Refund: 실패 시 크레딧 환불
        await apiRefundCredits(jobId);
        setWallet(prev => ({ ...prev, balance: prev.balance + creditsToUse }));
        addLedgerEntry({
          id: Date.now(),
          type: 'refund',
          amount: creditsToUse,
          jobId,
          createdAt: new Date().toISOString(),
          providerId: selectedService,
          tierId: selectedTier
        });
        
        setNotification({ type: 'error', message: `생성 실패. ${creditsToUse} 크레딧 환불됨` });
      }
      
      setIsGenerating(false);
      setRunningJobs(prev => Math.max(0, prev - 1));
      setPrompt('');
      
      // 알림 3초 후 자동 제거
      setTimeout(() => setNotification(null), 3000);
    }, 2000);
  };

  return (
    <div className="h-screen bg-white pt-20 overflow-hidden">
      {/* 교육자 전용: 플로팅 버튼 */}
      {isInstructor && (
        <div className="fixed top-24 right-6 z-30 flex flex-col gap-2">
          <button
            onClick={() => setShowStudentPanel(!showStudentPanel)}
            className={`px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-all flex items-center gap-2 ${
              showStudentPanel 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Users className="w-4 h-4" />
            수강생 현황
          </button>
          <button
            onClick={() => setShowScheduledNoticePanel(!showScheduledNoticePanel)}
            className={`px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-all flex items-center gap-2 ${
              showScheduledNoticePanel 
                ? 'bg-amber-500 text-white' 
                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            공지 설정
          </button>
        </div>
      )}

      {/* 교육자 전용: 예약 공지 설정 패널 */}
      {isInstructor && showScheduledNoticePanel && (
        <div className="fixed top-40 right-6 z-30 w-96 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900 text-sm">📅 예약 공지 설정</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-700">{scheduledNotices.filter(n => n.enabled).length}개 활성</span>
              <button 
                onClick={() => setShowScheduledNoticePanel(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* 공지 목록 */}
          <div className="max-h-72 overflow-y-auto">
            {scheduledNotices.sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time)).map(notice => {
              const typeInfo = getNoticeTypeInfo(notice.type);
              return (
                <div key={notice.id} className={`px-4 py-3 border-b border-neutral-100 ${!notice.enabled ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-medium text-neutral-900">▶ {notice.time}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${typeInfo.color}`}>
                        {typeInfo.icon} {typeInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingNotice(notice)}
                        className="p-1 text-neutral-400 hover:text-indigo-600 transition-colors"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setScheduledNotices(prev => prev.map(n => 
                          n.id === notice.id ? { ...n, enabled: !n.enabled } : n
                        ))}
                        className={`p-1 transition-colors ${notice.enabled ? 'text-emerald-500' : 'text-neutral-300'}`}
                      >
                        {notice.enabled ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setScheduledNotices(prev => prev.filter(n => n.id !== notice.id))}
                        className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 line-clamp-2">{notice.message}</p>
                </div>
              );
            })}
          </div>
          
          {/* 새 공지 추가 */}
          <div className="p-4 bg-neutral-50 border-t border-neutral-200">
            <div className="text-xs font-medium text-neutral-700 mb-2">+ 새 공지 추가</div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="MM:SS"
                value={newNoticeTime}
                onChange={(e) => setNewNoticeTime(e.target.value)}
                className="w-20 px-2 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <select
                value={newNoticeType}
                onChange={(e) => setNewNoticeType(e.target.value)}
                className="px-2 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="start">🎬 시작</option>
                <option value="practice">✏️ 실습</option>
                <option value="hint">💡 힌트</option>
                <option value="reminder">⏰ 알림</option>
                <option value="end">👋 종료</option>
                <option value="info">📢 정보</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="공지 메시지를 입력하세요..."
                value={newNoticeMessage}
                onChange={(e) => setNewNoticeMessage(e.target.value)}
                className="flex-1 px-2 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={() => {
                  if (newNoticeTime && newNoticeMessage) {
                    setScheduledNotices(prev => [...prev, {
                      id: Date.now(),
                      time: newNoticeTime,
                      type: newNoticeType,
                      message: newNoticeMessage,
                      enabled: true
                    }]);
                    setNewNoticeTime('');
                    setNewNoticeMessage('');
                    setNewNoticeType('info');
                  }
                }}
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 교육자 전용: 공지 수정 모달 */}
      {isInstructor && editingNotice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">공지 수정</h3>
              <button onClick={() => setEditingNotice(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">시간</label>
                  <input
                    type="text"
                    value={editingNotice.time}
                    onChange={(e) => setEditingNotice({ ...editingNotice, time: e.target.value })}
                    className="w-24 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-neutral-500 mb-1 block">유형</label>
                  <select
                    value={editingNotice.type}
                    onChange={(e) => setEditingNotice({ ...editingNotice, type: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="start">🎬 시작</option>
                    <option value="practice">✏️ 실습</option>
                    <option value="hint">💡 힌트</option>
                    <option value="reminder">⏰ 알림</option>
                    <option value="end">👋 종료</option>
                    <option value="info">📢 정보</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">메시지</label>
                <textarea
                  value={editingNotice.message}
                  onChange={(e) => setEditingNotice({ ...editingNotice, message: e.target.value })}
                  className="w-full h-24 px-3 py-2 border border-neutral-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingNotice(null)}
                className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setScheduledNotices(prev => prev.map(n => 
                    n.id === editingNotice.id ? editingNotice : n
                  ));
                  setEditingNotice(null);
                }}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 교육자 전용: 수강생 현황 패널 */}
      {isInstructor && showStudentPanel && (
        <div className="fixed top-40 right-6 z-30 w-80 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden">
          <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900 text-sm">수강생 현황</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                {studentList.filter(s => s.status !== 'offline').length}/{studentList.length}명 접속
              </span>
              <button 
                onClick={() => setShowStudentPanel(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {studentList.map(student => (
              <div key={student.id} className="px-4 py-3 border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      student.status === 'active' ? 'bg-emerald-500' :
                      student.status === 'idle' ? 'bg-amber-500' : 'bg-neutral-300'
                    }`} />
                    <span className="text-sm font-medium text-neutral-900">{student.name}</span>
                  </div>
                  <span className="text-xs text-neutral-500">생성 {student.generates}회</span>
                </div>
                <p className="text-xs text-neutral-500 truncate pl-4">
                  최근: {student.lastPrompt}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 공지 수신 팝업 (모든 사용자) */}
      {receivedBroadcast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
          <div className={`text-white rounded-2xl shadow-2xl p-4 max-w-md min-w-[320px] ${
            receivedBroadcast.type === 'hint' ? 'bg-amber-500' :
            receivedBroadcast.type === 'reminder' ? 'bg-orange-500' :
            receivedBroadcast.type === 'start' ? 'bg-emerald-500' :
            receivedBroadcast.type === 'end' ? 'bg-neutral-700' :
            receivedBroadcast.type === 'practice' ? 'bg-indigo-500' :
            'bg-indigo-600'
          }`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
                {receivedBroadcast.type === 'hint' ? '💡' :
                 receivedBroadcast.type === 'reminder' ? '⏰' :
                 receivedBroadcast.type === 'start' ? '🎬' :
                 receivedBroadcast.type === 'end' ? '👋' :
                 receivedBroadcast.type === 'practice' ? '✏️' : '📢'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">
                    {receivedBroadcast.type === 'hint' ? '힌트' :
                     receivedBroadcast.type === 'reminder' ? '알림' :
                     receivedBroadcast.type === 'start' ? '수업 시작' :
                     receivedBroadcast.type === 'end' ? '수업 종료' :
                     receivedBroadcast.type === 'practice' ? '실습 안내' : '교육자 공지'}
                  </span>
                  <button 
                    onClick={() => setReceivedBroadcast(null)}
                    className="text-white/70 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-white/90 mb-2">{receivedBroadcast.message}</p>
                <div className="text-xs text-white/60">
                  {receivedBroadcast.from} · {receivedBroadcast.time}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-full flex flex-col">
        {/* 상단 영역: 강의 + 피드 */}
        <div className="flex-[6] flex min-h-0">
          {/* 왼쪽: 강의 콘텐츠 */}
          <div className="w-1/2 border-r border-neutral-200 overflow-y-auto">
            <div className="p-5">
              <div className="bg-neutral-100 rounded-xl mb-4 aspect-video flex items-center justify-center">
                <Play className="w-14 h-14 text-neutral-400" />
              </div>

              <h2 className="text-lg font-semibold mb-2">{sessionId}회차: {currentSession.title}</h2>
              <p className="text-neutral-600 text-sm mb-4">{currentSession.summary}</p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                <h3 className="text-sm font-medium text-amber-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  핵심 개념
                </h3>
                <div className="space-y-1">
                  {currentSession.concepts.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                      <span className="w-5 h-5 bg-amber-200 rounded text-amber-800 text-xs font-medium flex items-center justify-center">{i + 1}</span>
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              {currentSession.examples && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                  <h3 className="text-sm font-medium text-neutral-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    예시 프롬프트
                  </h3>
                  <div className="space-y-1.5">
                    {currentSession.examples.map((ex, i) => (
                      <div key={i} className="flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-3 py-2 hover:border-indigo-300 transition-all">
                        <div className="flex-1 min-w-0 mr-3">
                          <span className="text-xs text-indigo-600 font-medium">{ex.label}</span>
                          <p className="text-xs text-neutral-600 truncate">{ex.prompt}</p>
                        </div>
                        <button 
                          onClick={() => handlePromptApply(ex.prompt)}
                          className="flex-shrink-0 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          적용
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 실습 히스토리 피드 */}
          <div className="w-1/2 flex flex-col min-h-0">
            <div className="flex-shrink-0 bg-white p-4 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                실습 히스토리 {results.length > 0 && <span className="text-sm font-normal text-neutral-500">({results.length}개)</span>}
              </h3>
            </div>
            
            <div ref={feedRef} className="flex-1 overflow-y-auto bg-white">
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                  <Sparkles className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm">프롬프트를 입력하고 생성해보세요</p>
                  <p className="text-xs mt-1">결과와 AI 평가가 여기에 표시됩니다</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {results.map((r) => (
                    <div key={r.id}>
                    <div className="space-y-2.5">
                      {/* 1. 프롬프트 입력 카드 (오른쪽 정렬 - 대화창 스타일) */}
                      <div className="flex justify-end">
                        <div className="inline-block max-w-[80%] bg-indigo-500 text-white rounded-2xl rounded-tr-sm p-3 shadow-sm">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{r.prompt}</p>
                          <div className="flex items-center justify-end gap-2 mt-2 text-xs text-indigo-200">
                            <span>{r.service} · {r.tier}</span>
                            <span>{r.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* 2. 생성 결과 카드 (왼쪽 정렬) */}
                      <div className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                        </div>
                        <div className="flex-1 max-w-[85%] bg-white border border-neutral-200 rounded-2xl rounded-tl-sm overflow-hidden shadow-sm">
                          <img src={r.thumbnail} alt="" className="w-full" />
                          <div className="p-2.5 flex items-center justify-between">
                            <span className="text-xs text-neutral-500">✨ {r.creditsUsed} 크레딧</span>
                            <div className="flex gap-1.5">
                              <button className="px-2.5 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 rounded-lg font-medium text-neutral-600">
                                <Save className="w-3 h-3 inline mr-1" />저장
                              </button>
                              <button 
                                onClick={() => setPrompt(r.prompt)}
                                className="px-2.5 py-1 text-xs bg-indigo-100 hover:bg-indigo-200 rounded-lg text-indigo-700 font-medium"
                              >
                                <RefreshCw className="w-3 h-3 inline mr-1" />재생성
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 3. AI 평가 피드백 카드 (왼쪽 정렬) */}
                      {r.evaluation && (
                        <div className="flex gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <div className="flex-1 max-w-[85%] bg-white border border-neutral-200 rounded-2xl rounded-tl-sm p-3 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-emerald-600">AI 평가</span>
                              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${r.evaluation.gradeColor}`}>
                                <span className="font-bold">{r.evaluation.grade}</span>
                                <span className="font-medium">{r.evaluation.score}점</span>
                              </div>
                            </div>
                            
                            <div className="text-xs text-neutral-500 mb-2 pb-2 border-b border-neutral-200">
                              📚 {r.evaluation.focus}
                            </div>
                            
                            <div className="space-y-1">
                              {r.evaluation.feedbacks.map((fb, idx) => (
                                <div 
                                  key={idx} 
                                  className={`flex items-start gap-1.5 text-xs p-1.5 rounded ${
                                    fb.type === 'positive' ? 'bg-emerald-50 text-emerald-700' :
                                    fb.type === 'suggestion' ? 'bg-amber-50 text-amber-700' :
                                    'bg-blue-50 text-blue-700'
                                  }`}
                                >
                                  {fb.type === 'positive' && <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                                  {fb.type === 'suggestion' && <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                                  {fb.type === 'tip' && <Target className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                                  <span className="leading-relaxed">{fb.text}</span>
                                </div>
                              ))}
                            </div>
                            
                            {r.evaluation.matchedKeywords.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-neutral-200 flex items-center gap-1 flex-wrap">
                                <span className="text-xs text-neutral-500">✓</span>
                                {r.evaluation.matchedKeywords.map((kw, idx) => (
                                  <span key={idx} className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>

        {/* 하단 영역: 설정 + 프롬프트 */}
        <div className="flex-[4] flex border-t border-neutral-300 min-h-0">
          {/* 왼쪽: 생성 설정 */}
          <div className="w-1/2 border-r border-neutral-200 bg-neutral-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">생성 설정</h3>

              <div className="space-y-3">
                <ModelPicker
                  service={selectedService}
                  tier={selectedTier}
                  services={AI_SERVICES}
                  onClick={() => setModelPickerOpen(true)}
                />

                {currentCategory === 'video' && (
                  <>
                    <DurationResolutionControls
                      duration={duration}
                      resolution={resolution}
                      onDurationChange={setDuration}
                      onResolutionChange={setResolution}
                      userPlan={userPlan}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <FramePickerCard type="start" />
                      <FramePickerCard type="end" />
                    </div>
                  </>
                )}

                {currentCategory === 'image' && (
                  <>
                    <ImageSettingsControls
                      imageSize={imageSize}
                      setImageSize={setImageSize}
                      imageStyle={imageStyle}
                      setImageStyle={setImageStyle}
                      imageCount={imageCount}
                      setImageCount={setImageCount}
                      userPlan={userPlan}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <ReferenceImageUploader />
                      <div className="bg-white border border-neutral-200 rounded-xl p-2.5">
                        <span className="text-xs font-medium text-neutral-900 block mb-1">네거티브 프롬프트</span>
                        <textarea
                          placeholder="제외할 요소..."
                          className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs text-neutral-700 placeholder-neutral-400 resize-none h-12 focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                    </div>
                  </>
                )}

                {currentCategory === 'text' && (
                  <>
                    <TextSettingsControls
                      maxTokens={maxTokens}
                      setMaxTokens={setMaxTokens}
                      temperature={temperature}
                      setTemperature={setTemperature}
                      outputFormat={outputFormat}
                      setOutputFormat={setOutputFormat}
                      userPlan={userPlan}
                    />
                    <div className="bg-white border border-neutral-200 rounded-xl p-2.5">
                      <span className="text-xs font-medium text-neutral-900 block mb-1">시스템 프롬프트</span>
                      <textarea
                        placeholder="AI 역할 지정..."
                        className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs text-neutral-700 placeholder-neutral-400 resize-none h-12 focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽: 프롬프트 입력 + 생성 버튼 */}
          <div className="w-1/2 flex flex-col min-h-0 bg-white">
            <div className="flex-shrink-0 p-4 pb-2 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900">프롬프트 입력</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-500">
                  예상 <span className="font-medium text-indigo-600">✨ {estimatedCredits}</span>
                  <span className="mx-1.5 text-neutral-300">|</span>
                  잔여 <span className={`font-medium ${insufficientBalance ? 'text-red-500' : 'text-emerald-600'}`}>✨ {wallet.balance}</span>
                </span>
                <GenerateButton 
                  onClick={handleGenerate}
                  isGenerating={isGenerating}
                  cost={estimatedCredits}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 pt-3">
              <PromptBox 
                value={prompt}
                onChange={setPrompt}
                enhance={enhance}
                onEnhanceToggle={() => setEnhance(!enhance)}
                placeholder={getPromptPlaceholder()}
              />
              
              {notification && (
                <div 
                  ref={notificationRef}
                  className={`mt-3 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    notification.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {notification.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  {notification.message}
                </div>
              )}
            </div>

            <div className="flex-shrink-0 p-4 pt-3 border-t border-neutral-100 flex justify-end">
              <button
                onClick={() => setTutorOpen(true)}
                className="px-4 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg text-sm hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                튜터에게 질문
              </button>
            </div>
          </div>
        </div>
      </div>

      <ModelPickerPanel
        isOpen={modelPickerOpen}
        onClose={() => setModelPickerOpen(false)}
        services={AI_SERVICES}
        selectedService={selectedService}
        selectedTier={selectedTier}
        onApply={handleModelApply}
        userPlan={userPlan}
        onShowUpgradeModal={onShowUpgradeModal}
      />

      <TutorDrawer isOpen={tutorOpen} onClose={() => setTutorOpen(false)} />
    </div>
  );
};

// ============= Media Gallery =============
const MediaGalleryPage = ({ setCurrentPage, wallet }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStyle, setActiveStyle] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);

  const categories = [
    { id: 'all', label: '전체' },
    { id: 'video', label: '영상' },
    { id: 'image', label: '이미지' },
    { id: 'featured', label: '추천' },
  ];

  const styles = [
    { id: 'cinematic', label: 'Cinematic', color: 'from-amber-500 to-orange-600' },
    { id: 'anime', label: 'Anime', color: 'from-pink-500 to-purple-600' },
    { id: 'realistic', label: 'Realistic', color: 'from-emerald-500 to-teal-600' },
    { id: 'abstract', label: 'Abstract', color: 'from-indigo-500 to-purple-600' },
    { id: 'vintage', label: 'Vintage', color: 'from-amber-600 to-yellow-500' },
    { id: 'noir', label: 'Noir', color: 'from-neutral-600 to-neutral-800' },
    { id: 'sketch', label: 'Sketch', color: 'from-neutral-400 to-neutral-600' },
    { id: 'comic', label: 'Comic', color: 'from-red-500 to-pink-500' },
    { id: 'surreal', label: 'Surreal', color: 'from-violet-500 to-fuchsia-500' },
    { id: 'minimalist', label: 'Minimalist', color: 'from-slate-400 to-slate-600' },
  ];

  // 더미 작품 데이터 (프롬프트 추가)
  const works = [
    { id: 1, title: '도시의 밤', creator: '김민준', course: 'AI 영상 생성', style: 'cinematic', type: 'video', likes: 234, thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400', featured: true, prompt: '네온 불빛이 반짝이는 밤의 도시 거리, 비 온 뒤 젖은 아스팔트에 반사되는 조명들, 시네마틱한 분위기, 4K', model: 'Sora Pro', createdAt: '2025-01-15', creditsUsed: 12 },
    { id: 2, title: '꿈의 정원', creator: '이서연', course: 'AI 이미지 생성', style: 'surreal', type: 'image', likes: 189, thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400', featured: true, prompt: '공중에 떠 있는 섬 위의 환상적인 정원, 거대한 꽃들과 빛나는 나비들, 초현실적인 분위기', model: 'Midjourney', createdAt: '2025-01-14', creditsUsed: 8 },
    { id: 3, title: '미래 도시', creator: '박지호', course: 'AI 영상 생성', style: 'cinematic', type: 'video', likes: 312, thumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400', featured: false, prompt: '2150년의 서울, 하늘을 나는 자동차들과 홀로그램 광고판, 미래지향적인 건축물', model: 'Runway Gen-3', createdAt: '2025-01-13', creditsUsed: 15 },
    { id: 4, title: '고양이의 하루', creator: '최수아', course: 'AI 영상 생성', style: 'anime', type: 'video', likes: 456, thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', featured: true, prompt: '귀여운 고양이가 창가에서 햇살을 받으며 낮잠 자는 모습, 지브리 스타일 애니메이션', model: 'Kling Pro', createdAt: '2025-01-12', creditsUsed: 10 },
    { id: 5, title: '추상적 감정', creator: '정예준', course: 'AI 이미지 생성', style: 'abstract', type: 'image', likes: 145, thumbnail: 'https://images.unsplash.com/photo-1541356665065-22676f35dd40?w=400', featured: false, prompt: '기쁨과 슬픔이 혼합된 감정을 색상과 형태로 표현, 추상 표현주의', model: 'DALL-E 3', createdAt: '2025-01-11', creditsUsed: 6 },
    { id: 6, title: '빈티지 카페', creator: '한소희', course: 'AI 이미지 생성', style: 'vintage', type: 'image', likes: 278, thumbnail: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400', featured: true, prompt: '1950년대 파리의 작은 카페, 따뜻한 조명과 빈티지 가구, 필름 그레인 효과', model: 'Midjourney', createdAt: '2025-01-10', creditsUsed: 8 },
    { id: 7, title: '도시 탐정', creator: '윤도현', course: 'AI 영상 생성', style: 'noir', type: 'video', likes: 198, thumbnail: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400', featured: false, prompt: '비 내리는 밤, 가로등 아래 서 있는 트렌치코트를 입은 탐정, 흑백 필름 누아르', model: 'Sora Standard', createdAt: '2025-01-09', creditsUsed: 10 },
    { id: 8, title: '봄의 스케치', creator: '김나영', course: 'AI 이미지 생성', style: 'sketch', type: 'image', likes: 167, thumbnail: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400', featured: false, prompt: '연필 스케치 스타일의 벚꽃 나무와 그 아래 벤치, 부드러운 선과 음영', model: 'Stable Diffusion', createdAt: '2025-01-08', creditsUsed: 5 },
    { id: 9, title: '슈퍼히어로', creator: '이준호', course: 'AI 영상 생성', style: 'comic', type: 'video', likes: 389, thumbnail: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400', featured: true, prompt: '마블 코믹스 스타일의 슈퍼히어로가 도시를 지키는 장면, 역동적인 액션', model: 'Runway Gen-3', createdAt: '2025-01-07', creditsUsed: 18 },
    { id: 10, title: '우주 여행', creator: '박서연', course: 'AI 영상 생성', style: 'cinematic', type: 'video', likes: 421, thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400', featured: true, prompt: '우주선이 토성의 고리를 지나가는 장면, 인터스텔라 스타일의 시네마틱 샷', model: 'Sora Pro', createdAt: '2025-01-06', creditsUsed: 20 },
    { id: 11, title: '일본 거리', creator: '최민수', course: 'AI 이미지 생성', style: 'anime', type: 'image', likes: 234, thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400', featured: false, prompt: '비 오는 도쿄의 골목길, 네온사인과 우산을 쓴 사람들, 신카이 마코토 스타일', model: 'Midjourney', createdAt: '2025-01-05', creditsUsed: 8 },
    { id: 12, title: '미니멀 공간', creator: '정다은', course: 'AI 이미지 생성', style: 'minimalist', type: 'image', likes: 156, thumbnail: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400', featured: false, prompt: '순백의 공간에 놓인 단 하나의 의자, 극도로 단순한 구성과 빛의 그라데이션', model: 'DALL-E 3', createdAt: '2025-01-04', creditsUsed: 6 },
    // Realistic 스타일
    { id: 13, title: '산속의 오두막', creator: '김태현', course: 'AI 이미지 생성', style: 'realistic', type: 'image', likes: 342, thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400', featured: true, prompt: '안개 낀 산속의 작은 통나무 오두막, 굴뚝에서 피어오르는 연기, 포토리얼리스틱', model: 'Midjourney', createdAt: '2025-01-03', creditsUsed: 8 },
    { id: 14, title: '바다 위의 일출', creator: '이하늘', course: 'AI 영상 생성', style: 'realistic', type: 'video', likes: 287, thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', featured: false, prompt: '고요한 바다 위로 떠오르는 태양, 수평선에 반사되는 황금빛, 드론 촬영 스타일', model: 'Sora Standard', createdAt: '2025-01-02', creditsUsed: 12 },
    { id: 15, title: '도심 속 자연', creator: '박준영', course: 'AI 이미지 생성', style: 'realistic', type: 'image', likes: 198, thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', featured: true, prompt: '고층 빌딩 사이로 자란 거대한 나무, 도시와 자연의 공존, 하이퍼리얼리즘', model: 'Stable Diffusion', createdAt: '2025-01-01', creditsUsed: 7 },
    // Abstract 추가
    { id: 16, title: '색의 흐름', creator: '최예린', course: 'AI 영상 생성', style: 'abstract', type: 'video', likes: 267, thumbnail: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400', featured: true, prompt: '액체처럼 흐르는 색상들의 춤, 음악에 맞춰 변화하는 추상적 형태', model: 'Runway Gen-3', createdAt: '2024-12-31', creditsUsed: 14 },
    { id: 17, title: '기하학적 꿈', creator: '정민서', course: 'AI 이미지 생성', style: 'abstract', type: 'image', likes: 189, thumbnail: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400', featured: false, prompt: '삼각형과 원이 조화를 이루는 기하학적 패턴, 칸딘스키 스타일', model: 'DALL-E 3', createdAt: '2024-12-30', creditsUsed: 6 },
    // Vintage 추가
    { id: 18, title: '옛날 사진관', creator: '윤서현', course: 'AI 이미지 생성', style: 'vintage', type: 'image', likes: 312, thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', featured: false, prompt: '1920년대 사진관의 내부, 대형 카메라와 빈티지 소품들, 세피아 톤', model: 'Midjourney', createdAt: '2024-12-29', creditsUsed: 8 },
    { id: 19, title: '1960년대 거리', creator: '한지우', course: 'AI 영상 생성', style: 'vintage', type: 'video', likes: 234, thumbnail: 'https://images.unsplash.com/photo-1531219432768-9f540ce91ef3?w=400', featured: true, prompt: '1960년대 뉴욕 거리, 클래식 자동차들과 빈티지 패션의 사람들', model: 'Sora Standard', createdAt: '2024-12-28', creditsUsed: 11 },
    // Noir 추가
    { id: 20, title: '비 오는 골목', creator: '김도윤', course: 'AI 이미지 생성', style: 'noir', type: 'image', likes: 276, thumbnail: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=400', featured: true, prompt: '어두운 골목에 비가 내리고, 단 하나의 가로등이 빛을 비추는 장면, 필름 누아르', model: 'Midjourney', createdAt: '2024-12-27', creditsUsed: 8 },
    { id: 21, title: '그림자 속의 남자', creator: '이승우', course: 'AI 영상 생성', style: 'noir', type: 'video', likes: 198, thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400', featured: false, prompt: '그림자 속에서 담배 연기를 내뿜는 남자, 흑백 영화 느낌', model: 'Runway Gen-3', createdAt: '2024-12-26', creditsUsed: 13 },
    // Sketch 추가
    { id: 22, title: '연필로 그린 풍경', creator: '박소율', course: 'AI 이미지 생성', style: 'sketch', type: 'image', likes: 145, thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400', featured: false, prompt: '연필 스케치로 그린 프랑스 시골 마을 풍경, 섬세한 선과 음영', model: 'Stable Diffusion', createdAt: '2024-12-25', creditsUsed: 5 },
    { id: 23, title: '스케치북 여행', creator: '최유진', course: 'AI 영상 생성', style: 'sketch', type: 'video', likes: 234, thumbnail: 'https://images.unsplash.com/photo-1502657877623-f66bf489d236?w=400', featured: true, prompt: '스케치북에 그림이 그려지는 과정, 여행지의 풍경들이 차례로 완성되는 영상', model: 'Kling Standard', createdAt: '2024-12-24', creditsUsed: 9 },
    // Comic 추가
    { id: 24, title: '만화 속 세상', creator: '정하준', course: 'AI 이미지 생성', style: 'comic', type: 'image', likes: 367, thumbnail: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400', featured: false, prompt: '리히텐슈타인 스타일의 팝아트, 말풍선과 벤데이 도트 패턴', model: 'DALL-E 3', createdAt: '2024-12-23', creditsUsed: 6 },
    { id: 25, title: '팝 아트 초상화', creator: '윤지아', course: 'AI 이미지 생성', style: 'comic', type: 'image', likes: 289, thumbnail: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400', featured: true, prompt: '앤디 워홀 스타일의 4분할 초상화, 각각 다른 색상 조합', model: 'Midjourney', createdAt: '2024-12-22', creditsUsed: 8 },
    // Surreal 추가
    { id: 26, title: '녹아내리는 시계', creator: '한서윤', course: 'AI 이미지 생성', style: 'surreal', type: 'image', likes: 412, thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400', featured: true, prompt: '달리의 기억의 지속성에서 영감받은 녹아내리는 시계들, 초현실적 사막 풍경', model: 'Midjourney', createdAt: '2024-12-21', creditsUsed: 8 },
    { id: 27, title: '하늘을 나는 물고기', creator: '김지원', course: 'AI 영상 생성', style: 'surreal', type: 'video', likes: 356, thumbnail: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=400', featured: false, prompt: '도시 하늘을 유영하는 거대한 금붕어들, 꿈같은 초현실적 장면', model: 'Sora Pro', createdAt: '2024-12-20', creditsUsed: 16 },
    // Minimalist 추가
    { id: 28, title: '빈 공간의 미학', creator: '이도현', course: 'AI 이미지 생성', style: 'minimalist', type: 'image', likes: 178, thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', featured: false, prompt: '넓은 흰 벽과 작은 창문 하나, 극도로 미니멀한 공간 구성', model: 'DALL-E 3', createdAt: '2024-12-19', creditsUsed: 6 },
    { id: 29, title: '선과 여백', creator: '박채원', course: 'AI 영상 생성', style: 'minimalist', type: 'video', likes: 203, thumbnail: 'https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=400', featured: true, prompt: '단순한 선들이 천천히 그려지며 형태를 만들어가는 미니멀 애니메이션', model: 'Runway Gen-3', createdAt: '2024-12-18', creditsUsed: 10 },
    // Anime 추가
    { id: 30, title: '벚꽃 아래', creator: '최서아', course: 'AI 이미지 생성', style: 'anime', type: 'image', likes: 523, thumbnail: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400', featured: true, prompt: '벚꽃이 흩날리는 학교 운동장, 교복 입은 소녀가 서 있는 장면, 애니메이션 스타일', model: 'Midjourney', createdAt: '2024-12-17', creditsUsed: 8 },
    { id: 31, title: '사이버펑크 도쿄', creator: '정유나', course: 'AI 영상 생성', style: 'anime', type: 'video', likes: 445, thumbnail: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400', featured: true, prompt: '네온 불빛이 가득한 미래의 도쿄 거리, 사이버펑크 애니메이션 스타일', model: 'Kling Pro', createdAt: '2024-12-16', creditsUsed: 12 },
  ];

  const filteredWorks = works.filter(work => {
    if (activeCategory === 'featured') return work.featured;
    if (activeCategory === 'video') return work.type === 'video';
    if (activeCategory === 'image') return work.type === 'image';
    if (activeStyle) return work.style === activeStyle;
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* 히어로 섹션 */}
      <div className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 to-white" />
        <div className="max-w-7xl mx-auto px-8 py-12 relative">
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">갤러리</h1>
          <p className="text-neutral-500 text-lg">수강생들이 만든 우수 작품을 만나보세요</p>
        </div>
      </div>

      {/* 스타일 필터 - Higgsfield 스타일 가로 스크롤 */}
      <div className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-neutral-500 text-sm font-medium flex-shrink-0">Style</span>
            <div className="h-4 w-px bg-neutral-300 flex-shrink-0" />
            {styles.map(style => (
              <button
                key={style.id}
                onClick={() => setActiveStyle(activeStyle === style.id ? null : style.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeStyle === style.id
                    ? `bg-gradient-to-r ${style.color} text-white shadow-lg`
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="text-sm text-neutral-500">
            {filteredWorks.length}개의 작품
          </div>
        </div>

        {/* 작품 그리드 - 메이슨리 스타일 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredWorks.map((work, index) => (
            <div
              key={work.id}
              onClick={() => setSelectedWork(work)}
              className={`group relative rounded-xl overflow-hidden bg-neutral-100 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl ${
                index % 5 === 0 ? 'row-span-2' : ''
              }`}
            >
              <div className={`relative ${index % 5 === 0 ? 'aspect-[3/4]' : 'aspect-video'}`}>
                <img
                  src={work.thumbnail}
                  alt={work.title}
                  className="w-full h-full object-cover"
                />
                {/* 비디오 아이콘 */}
                {work.type === 'video' && (
                  <div className="absolute top-3 left-3 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                )}
                {/* 추천 뱃지 */}
                {work.featured && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full">
                    <span className="text-xs font-medium text-white">추천</span>
                  </div>
                )}
                {/* 호버 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <h3 className="text-white font-semibold mb-1">{work.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">{work.creator.charAt(0)}</span>
                      </div>
                      <span className="text-sm text-neutral-300">{work.creator}</span>
                    </div>
                    <div className="flex items-center gap-1 text-neutral-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                      <span className="text-sm">{work.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 더 보기 버튼 */}
        <div className="flex justify-center mt-10">
          <button className="px-8 py-3 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 transition-colors flex items-center gap-2">
            더 많은 작품 보기
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 작품 상세 모달 */}
      {selectedWork && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8" onClick={() => setSelectedWork(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex" onClick={e => e.stopPropagation()}>
            {/* 이미지/비디오 영역 */}
            <div className="w-1/2 bg-neutral-900 relative">
              <img 
                src={selectedWork.thumbnail} 
                alt={selectedWork.title}
                className="w-full h-full object-cover"
              />
              {selectedWork.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
              )}
            </div>
            
            {/* 정보 영역 */}
            <div className="w-1/2 p-6 overflow-y-auto">
              {/* 닫기 버튼 */}
              <div className="flex justify-end mb-4">
                <button 
                  onClick={() => setSelectedWork(null)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
              
              {/* 제목 및 스타일 */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${
                    styles.find(s => s.id === selectedWork.style)?.color || 'from-neutral-500 to-neutral-600'
                  } text-white`}>
                    {styles.find(s => s.id === selectedWork.style)?.label || selectedWork.style}
                  </span>
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full">
                    {selectedWork.type === 'video' ? '영상' : '이미지'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900">{selectedWork.title}</h2>
              </div>
              
              {/* 작성자 정보 */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-neutral-200">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-white">{selectedWork.creator.charAt(0)}</span>
                </div>
                <div>
                  <div className="font-medium text-neutral-900">{selectedWork.creator}</div>
                  <div className="text-sm text-neutral-500">{selectedWork.course}</div>
                </div>
              </div>
              
              {/* 프롬프트 */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  사용된 프롬프트
                </h3>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <p className="text-sm text-neutral-700 leading-relaxed">{selectedWork.prompt}</p>
                </div>
              </div>
              
              {/* 생성 정보 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-neutral-50 rounded-xl p-4">
                  <div className="text-xs text-neutral-500 mb-1">사용 모델</div>
                  <div className="font-medium text-neutral-900">{selectedWork.model}</div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <div className="text-xs text-neutral-500 mb-1">사용 크레딧</div>
                  <div className="font-medium text-amber-600">{selectedWork.creditsUsed} 크레딧</div>
                </div>
              </div>
              
              {/* 통계 */}
              <div className="flex items-center justify-between py-4 border-t border-neutral-200">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-neutral-600">
                    <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                    </svg>
                    <span className="font-medium">{selectedWork.likes}</span>
                  </div>
                  <div className="text-sm text-neutral-500">{selectedWork.createdAt}</div>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                  이 스타일로 만들기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============= Dashboard =============

// 수강생 대시보드
const StudentDashboard = ({ user, wallet, onStartSession }) => {
  const currentCourse = {
    id: 1,
    title: '프롬프트로 AI 영상 만들기',
    instructor: '김교수',
    currentSession: 5,
    totalSessions: 12,
    nextSessionTitle: '5회차: 고급 프롬프트 기법',
    progress: 42,
    thumbnail: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=400'
  };

  const recentWorks = [
    { id: 1, type: 'video', prompt: '도시의 야경이 반짝이는 영상', createdAt: '2시간 전', credits: 8, thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200' },
    { id: 2, type: 'image', prompt: '미래 도시의 일출', createdAt: '어제', credits: 3, thumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=200' },
    { id: 3, type: 'video', prompt: '바다 위를 날아가는 드론 영상', createdAt: '2일 전', credits: 6, thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200' },
  ];

  const upcomingTasks = [
    { id: 1, title: '5회차 실습 과제', dueDate: '오늘', type: 'practice' },
    { id: 2, title: '중간 평가', dueDate: '3일 후', type: 'assessment' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pt-16">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-8">
          <h1 className="text-xl font-bold text-neutral-900 py-5">내 학습</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* 환영 메시지 & 크레딧 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-1">안녕하세요, {user?.name}님!</h2>
            <p className="text-neutral-500">오늘도 창작을 시작해볼까요?</p>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-2xl px-6 py-4">
            <div className="text-sm text-amber-600 mb-1">잔여 크레딧</div>
            <div className="text-3xl font-bold text-amber-700">✨ {wallet?.balance || 0}</div>
          </div>
        </div>

        {/* 현재 수강 중인 클래스 */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-6">
            <img src={currentCourse.thumbnail} alt="" className="w-48 h-28 object-cover rounded-xl" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">수강 중</span>
                <span className="text-sm text-neutral-500">{currentCourse.instructor}</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{currentCourse.title}</h3>
              <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                <span>{currentCourse.currentSession} / {currentCourse.totalSessions} 회차</span>
                <span>·</span>
                <span>진도율 {currentCourse.progress}%</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${currentCourse.progress}%` }} />
              </div>
              <button 
                onClick={() => onStartSession && onStartSession()}
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
              >
                실습 계속하기 →
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* 오늘 학습할 내용 */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">오늘의 학습</h3>
            <div className="bg-indigo-50 rounded-xl p-4 mb-4">
              <div className="text-sm text-indigo-600 mb-1">다음 회차</div>
              <div className="font-semibold text-indigo-900">{currentCourse.nextSessionTitle}</div>
            </div>
            <div className="space-y-3">
              {upcomingTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${task.type === 'assessment' ? 'bg-amber-100' : 'bg-neutral-100'}`}>
                      {task.type === 'assessment' ? <Award className="w-4 h-4 text-amber-600" /> : <Play className="w-4 h-4 text-neutral-600" />}
                    </div>
                    <span className="text-sm text-neutral-900">{task.title}</span>
                  </div>
                  <span className={`text-xs font-medium ${task.dueDate === '오늘' ? 'text-red-600' : 'text-neutral-500'}`}>{task.dueDate}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 최근 생성한 결과물 */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">최근 생성 결과물</h3>
            <div className="space-y-3">
              {recentWorks.map(work => (
                <div key={work.id} className="flex items-center gap-3 py-2 border-b border-neutral-100 last:border-0">
                  <img src={work.thumbnail} alt="" className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-neutral-900 truncate">{work.prompt}</div>
                    <div className="text-xs text-neutral-400">{work.createdAt}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {work.type === 'video' ? <Video className="w-3.5 h-3.5 text-indigo-500" /> : <FileText className="w-3.5 h-3.5 text-emerald-500" />}
                    <span className="text-xs text-neutral-500">-✨{work.credits}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 교육자 대시보드 (기존 DashboardPage 100% 유지)
const InstructorDashboard = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // 운영 중인 클래스 목록
  const courses = [
    { 
      id: 1, 
      title: '프롬프트로 AI 영상 만들기', 
      students: 115, 
      progress: 65, 
      creditsUsed: 4580, 
      creditsTotal: 10000,
      status: 'active',
      startDate: '2025-01-06',
      thumbnail: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=400'
    },
    { 
      id: 2, 
      title: 'AI 이미지 생성 마스터', 
      students: 78, 
      progress: 42, 
      creditsUsed: 2340, 
      creditsTotal: 8000,
      status: 'active',
      startDate: '2025-01-13',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400'
    },
    { 
      id: 3, 
      title: '생성형 AI 기초', 
      students: 234, 
      progress: 89, 
      creditsUsed: 7820, 
      creditsTotal: 8000,
      status: 'completed',
      startDate: '2024-11-04',
      thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400'
    },
  ];

  const tabs = [
    { id: 'overview', label: '학습 현황' },
    { id: 'students', label: '학생 관리' },
    { id: 'credits', label: '크레딧 현황' },
  ];

  const students = [
    { id: 1, name: '김민준', email: 'minjun.kim@gmail.com', progress: 92, creditsUsed: 45, lastActive: '오늘' },
    { id: 2, name: '이서연', email: 'seoyeon.lee@naver.com', progress: 78, creditsUsed: 32, lastActive: '오늘' },
    { id: 3, name: '박지호', email: 'jiho.park@gmail.com', progress: 45, creditsUsed: 18, lastActive: '3일 전' },
    { id: 4, name: '최수아', email: 'sua.choi@nculture.com', progress: 100, creditsUsed: 67, lastActive: '어제' },
    { id: 5, name: '정예준', email: 'yejun.jung@gmail.com', progress: 12, creditsUsed: 5, lastActive: '1주 전' },
  ];

  const creditHistory = [
    { id: 1, student: '김민준', action: '영상 생성', model: 'Sora Pro', credits: 8, time: '10분 전' },
    { id: 2, student: '이서연', action: '영상 생성', model: 'Runway Standard', credits: 4, time: '25분 전' },
    { id: 3, student: '최수아', action: '영상 생성', model: 'Kling Pro', credits: 6, time: '1시간 전' },
    { id: 4, student: '김민준', action: '영상 생성', model: 'Pika Standard', credits: 3, time: '2시간 전' },
    { id: 5, student: '박지호', action: '영상 생성', model: 'Sora Standard', credits: 5, time: '3시간 전' },
  ];

  // 전체 대시보드 (강의 목록)
  if (!selectedCourse) {
    const totalStudents = courses.reduce((sum, c) => sum + c.students, 0);
    const totalCreditsUsed = courses.reduce((sum, c) => sum + c.creditsUsed, 0);
    const activeCourses = courses.filter(c => c.status === 'active').length;

    return (
      <div className="min-h-screen bg-neutral-50 pt-16">
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-8">
            <h1 className="text-xl font-bold text-neutral-900 py-5">대시보드</h1>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* 전체 요약 */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 border border-neutral-200">
              <div className="text-sm text-neutral-500 mb-1">운영 중인 클래스</div>
              <div className="text-2xl font-bold text-neutral-900">{activeCourses}개</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-neutral-200">
              <div className="text-sm text-neutral-500 mb-1">전체 수강생</div>
              <div className="text-2xl font-bold text-indigo-600">{totalStudents}명</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-neutral-200">
              <div className="text-sm text-neutral-500 mb-1">오늘 생성 수</div>
              <div className="text-2xl font-bold text-emerald-600">127건</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-neutral-200">
              <div className="text-sm text-neutral-500 mb-1">총 크레딧 사용</div>
              <div className="text-2xl font-bold text-amber-600">✨ {totalCreditsUsed.toLocaleString()}</div>
            </div>
          </div>

          {/* 강의 목록 */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">내 클래스</h2>
            <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              + 새 클래스 만들기
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {courses.map(course => (
              <div 
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex gap-5">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">{course.title}</h3>
                        <div className="text-sm text-neutral-500">시작일: {course.startDate}</div>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        course.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {course.status === 'active' ? '진행 중' : '완료'}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-600">{course.students}명</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-600">평균 진도율 {course.progress}%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-neutral-600">
                          {course.creditsUsed.toLocaleString()} / {course.creditsTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 개별 클래스 관리 페이지
  return (
    <div className="min-h-screen bg-neutral-50 pt-16">
      {/* 강의 헤더 */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <button 
            onClick={() => setSelectedCourse(null)}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">돌아가기</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-1">{selectedCourse.title}</h1>
              <p className="text-neutral-500">수강생 {selectedCourse.students}명</p>
            </div>
            <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${
              selectedCourse.status === 'active' 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-neutral-100 text-neutral-600'
            }`}>
              {selectedCourse.status === 'active' ? '진행 중' : '완료'}
            </span>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* 학습 현황 탭 */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-5 border border-neutral-200">
                <div className="text-sm text-neutral-500 mb-1">전체 학생</div>
                <div className="text-2xl font-bold text-neutral-900">{selectedCourse.students}명</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-neutral-200">
                <div className="text-sm text-neutral-500 mb-1">평균 진도율</div>
                <div className="text-2xl font-bold text-indigo-600">{selectedCourse.progress}%</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-neutral-200">
                <div className="text-sm text-neutral-500 mb-1">오늘 생성 수</div>
                <div className="text-2xl font-bold text-emerald-600">127건</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-neutral-200">
                <div className="text-sm text-neutral-500 mb-1">크레딧 사용</div>
                <div className="text-2xl font-bold text-amber-600">✨ {selectedCourse.creditsUsed.toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100">
                <h3 className="font-semibold text-neutral-900">최근 활동 학생</h3>
              </div>
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">학생</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">진도율</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">크레딧 사용</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">최근 활동</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-neutral-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">{student.name.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-neutral-900">{student.name}</div>
                            <div className="text-xs text-neutral-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${student.progress}%` }} />
                          </div>
                          <span className="text-sm text-neutral-600">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-neutral-600">✨ {student.creditsUsed}</td>
                      <td className="px-5 py-4 text-sm text-neutral-500">{student.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 학생 관리 탭 */}
        {activeTab === 'students' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900">학생 목록</h2>
              <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
                + 학생 초대
              </button>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">학생</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">진도율</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">크레딧 사용</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">최근 활동</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-neutral-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">{student.name.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-neutral-900">{student.name}</div>
                            <div className="text-xs text-neutral-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${student.progress}%` }} />
                          </div>
                          <span className="text-sm text-neutral-600">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-neutral-600">✨ {student.creditsUsed}</td>
                      <td className="px-5 py-4 text-sm text-neutral-500">{student.lastActive}</td>
                      <td className="px-5 py-4">
                        <button className="text-sm text-indigo-600 hover:text-indigo-800">상세보기</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 크레딧 현황 탭 */}
        {activeTab === 'credits' && (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-5 border border-neutral-200">
                <div className="text-sm text-neutral-500 mb-1">총 할당 크레딧</div>
                <div className="text-2xl font-bold text-neutral-900">✨ {selectedCourse.creditsTotal.toLocaleString()}</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-neutral-200">
                <div className="text-sm text-neutral-500 mb-1">사용된 크레딧</div>
                <div className="text-2xl font-bold text-amber-600">✨ {selectedCourse.creditsUsed.toLocaleString()}</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-neutral-200">
                <div className="text-sm text-neutral-500 mb-1">남은 크레딧</div>
                <div className="text-2xl font-bold text-emerald-600">✨ {(selectedCourse.creditsTotal - selectedCourse.creditsUsed).toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100">
                <h3 className="font-semibold text-neutral-900">최근 사용 내역</h3>
              </div>
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">학생</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">활동</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">모델</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">크레딧</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500">시간</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {creditHistory.map(item => (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="px-5 py-4 text-sm font-medium text-neutral-900">{item.student}</td>
                      <td className="px-5 py-4 text-sm text-neutral-600">{item.action}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-md">{item.model}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-amber-600 font-medium">-{item.credits}</td>
                      <td className="px-5 py-4 text-sm text-neutral-500">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============= 기관 관리자 대시보드 컴포넌트 =============
const InstitutionAdminPage = ({ user, institution, setInstitution, setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMember, setSelectedMember] = useState(null);
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
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
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
          <div key={idx} className="bg-white border border-neutral-200 rounded-xl p-5">
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
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
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
                      onClick={() => { setSelectedMember({...instructor, type: 'instructor'}); setShowCreditModal(true); }}
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
                      onClick={() => { setSelectedMember({...student, type: 'student'}); setShowCreditModal(true); }}
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
    <div className="min-h-screen bg-neutral-50 pt-16">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* 탭 네비게이션 */}
        <div className="bg-white border border-neutral-200 rounded-xl p-1.5 mb-6 flex gap-1 overflow-x-auto">
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
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">크레딧 배분</h3>
              <button onClick={() => setShowCreditModal(false)} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-neutral-50 rounded-xl p-4">
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

// DashboardPage - role 기반 분기
const DashboardPage = ({ user, currentRole, wallet, onStartSession, setCurrentPage }) => {
  // currentRole이 있으면 사용, 없으면 user.role 사용
  const effectiveRole = currentRole || user?.role;
  const isInstructor = effectiveRole === 'instructor';
  const isPending = user?.status === 'pending';
  
  // 승인 대기 중인 교육자 (원래 역할이 instructor이고 pending인 경우)
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
          
          {/* 그동안 할 수 있는 것들 */}
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
  
  // 승인된 교육자 - 마이페이지로 이동 안내
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
  
  // 수강생 - 마이페이지로 이동 안내
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

// ============= App =============
/**
 * @param {{
 *  initialPage?: string,
 *  initialSession?: number,
 *  initialLiveClass?: number | null,
 *  initialCourse?: string | null,
 *  initialTest?: any,
 * }} props
 */
export default function App({
  initialPage = 'main',
  initialSession = 1,
  initialLiveClass = null,
  initialCourse = null,
  initialTest = null,
} = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentSession, setCurrentSession] = useState(initialSession);
  const [currentLiveClass, setCurrentLiveClass] = useState(initialLiveClass);
  const [currentCourse, setCurrentCourse] = useState(initialCourse);
  const [currentTest, setCurrentTest] = useState(initialTest);
  
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);
  
  useEffect(() => {
    setCurrentSession(initialSession);
  }, [initialSession]);
  
  useEffect(() => {
    setCurrentLiveClass(initialLiveClass);
  }, [initialLiveClass]);
  
  useEffect(() => {
    setCurrentCourse(initialCourse);
  }, [initialCourse]);
  
  useEffect(() => {
    setCurrentTest(initialTest);
  }, [initialTest]);
  
  // 인증 상태 - 테스트 계정으로 기본 로그인 (교육자)
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [user, setUser] = useState({ 
    id: 'user_001',
    email: 'test@test.com', 
    name: '테스트',
    role: 'instructor', // 'student' | 'instructor' | 'institution_admin'
    status: 'approved', // 'approved' | 'pending'
    institutionId: null
  });
  // 역할 전환을 위한 뷰 모드
  const [viewMode, setViewMode] = useState(null); // null | 'student' | 'instructor' (null이면 원래 역할 사용)
  
  // 기관 데이터 상태
  const [institution, setInstitution] = useState(INSTITUTION_DATA);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [pendingAction, setPendingAction] = useState(null);

  // 크레딧 시스템 상태
  const [wallet, setWallet] = useState({ balance: 1000 }); // 기본 크레딧
  const [creditLedger, setCreditLedger] = useState([]); // 크레딧 원장
  const [userPlan, setUserPlan] = useState('pro'); // 현재 사용자 플랜
  const [userEnterpriseTier, setUserEnterpriseTier] = useState(null); // Enterprise 선택 티어
  
  // 플랜 업그레이드 모달 상태
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState(null);
  
  // 현재 표시되는 역할 (viewMode가 있으면 viewMode, 없으면 원래 역할)
  const currentRole = viewMode || user?.role;

  // 역할 전환 함수 (기관 관리자/교육자 전용)
  const handleToggleRole = () => {
    if (user?.role === 'instructor' && user?.status === 'approved') {
      setViewMode(prev => prev === 'student' ? null : 'student');
    } else if (user?.role === 'institution_admin') {
      // 기관 관리자는 다양한 역할로 전환 가능
      setViewMode(prev => {
        if (!prev) return 'instructor';
        if (prev === 'instructor') return 'student';
        return null;
      });
    }
  };
  
  // 역할 전환 함수 (드롭다운용)
  const handleRoleSwitch = (newViewMode) => {
    setViewMode(newViewMode);
  };

  // 원장 기록 추가 함수
  const addLedgerEntry = (entry) => {
    setCreditLedger(prev => [entry, ...prev]);
  };

  // 플랜 업그레이드 핸들러
  const handleShowUpgradeModal = (reason) => {
    setUpgradeReason(reason);
    setShowUpgradeModal(true);
  };

  const handlePlanUpgrade = (newPlanId, enterpriseTier = null) => {
    if (newPlanId === 'enterprise' && enterpriseTier) {
      setUserPlan('enterprise');
      setUserEnterpriseTier(enterpriseTier);
      setWallet({ balance: enterpriseTier.monthlyCredits || 999999 });
    } else {
      const newPlan = PRICING_PLANS[newPlanId];
      if (newPlan) {
        setUserPlan(newPlanId);
        setUserEnterpriseTier(null);
        setWallet({ balance: newPlan.monthlyCredits });
      }
    }
    setShowUpgradeModal(false);
    setUpgradeReason(null);
  };

  // 로그인이 필요한 페이지들
  const protectedPages = ['session', 'liveroom', 'assessment', 'dashboard', 'mypage', 'institution'];

  const handleAuthClick = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogin = (userData) => {
    setUser({
      id: 'user_' + Date.now(),
      email: userData.email,
      name: userData.name,
      role: userData.role || 'instructor',
      status: userData.status || 'approved',
      institutionId: userData.institutionId || null
    });
    setIsLoggedIn(true);
    setShowAuthModal(false);
    setViewMode(null); // 로그인 시 뷰모드 초기화
    
    // 대기 중인 액션이 있으면 실행
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('main');
    setViewMode(null);
  };

  // 보호된 페이지 접근 시 로그인 체크
  const navigateWithAuth = (page, action) => {
    if (protectedPages.includes(page) && !isLoggedIn) {
      setPendingAction(() => action);
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    action();
  };

  const handlePageChange = (page) => {
    if (protectedPages.includes(page) && !isLoggedIn) {
      setPendingAction(() => () => setCurrentPage(page));
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setCurrentPage(page);
  };

  const handleJoinLiveClass = (classId) => {
    navigateWithAuth('liveroom', () => {
      setCurrentLiveClass(classId);
      setCurrentPage('liveroom');
    });
  };

  const handleExitLiveClass = () => {
    setCurrentLiveClass(null);
    setCurrentPage('live');
  };

  const handleStartSession = (sessionId) => {
    navigateWithAuth('session', () => {
      setCurrentSession(sessionId);
      setCurrentPage('session');
    });
  };

  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        * { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; }
      `}</style>
      <div className="bg-white min-h-screen">
      {currentPage !== 'liveroom' && !currentTest && (
        <Header 
          currentPage={currentPage} 
          setCurrentPage={handlePageChange}
          isLoggedIn={isLoggedIn}
          user={user}
          viewMode={viewMode}
          currentRole={currentRole}
          onAuthClick={handleAuthClick}
          onLogout={handleLogout}
          wallet={wallet}
          userPlan={userPlan}
          onToggleRole={handleToggleRole}
          onRoleSwitch={handleRoleSwitch}
        />
      )}
      
      {currentPage === 'main' && (
        <MainPage 
          setCurrentPage={handlePageChange} 
          setCurrentSession={handleStartSession}
          isLoggedIn={isLoggedIn}
          onAuthClick={handleAuthClick}
          onInstitutionAuthClick={handleAuthClick}
        />
      )}
      {currentPage === 'curriculum' && (
        <CurriculumPage 
          setCurrentPage={handlePageChange} 
          setCurrentCourse={setCurrentCourse}
        />
      )}
      {currentPage === 'courseDetail' && (
        <CourseDetailPage 
          courseId={currentCourse} 
          setCurrentPage={handlePageChange} 
          setCurrentSession={handleStartSession}
          isLoggedIn={isLoggedIn}
          onAuthClick={handleAuthClick}
        />
      )}
      {currentPage === 'live' && (
        <LiveStudioPage 
          onJoinClass={handleJoinLiveClass}
          isLoggedIn={isLoggedIn}
          onAuthClick={handleAuthClick}
        />
      )}
      {currentPage === 'liveroom' && <LiveClassRoom classId={currentLiveClass} onExit={handleExitLiveClass} />}
      {currentPage === 'session' && (
        <SessionPage 
          sessionId={currentSession} 
          wallet={wallet}
          setWallet={setWallet}
          addLedgerEntry={addLedgerEntry}
          userPlan={userPlan}
          onShowUpgradeModal={handleShowUpgradeModal}
          user={user}
          currentRole={currentRole}
        />
      )}
      {currentPage === 'assessment' && !currentTest && (
        <AssessmentListPage onEnterStudio={(test) => setCurrentTest(test)} />
      )}
      {currentPage === 'assessment' && currentTest && (
        <AssessmentStudioPage test={currentTest} onExit={() => setCurrentTest(null)} user={user} currentRole={currentRole} />
      )}
      {currentPage === 'media' && <MediaGalleryPage setCurrentPage={handlePageChange} wallet={wallet} />}
      {currentPage === 'dashboard' && (
        <DashboardPage 
          user={user}
          currentRole={currentRole}
          wallet={wallet} 
          onStartSession={() => handlePageChange('session')}
          setCurrentPage={handlePageChange}
        />
      )}
      {currentPage === 'institution' && (
        <InstitutionAdminPage 
          user={user}
          institution={institution}
          setInstitution={setInstitution}
          setCurrentPage={handlePageChange}
        />
      )}
      {currentPage === 'mypage' && (
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
      )}

      {/* 로그인/회원가입 모달 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingAction(null);
        }}
        initialMode={authMode}
        onLogin={handleLogin}
      />

      {/* 플랜 업그레이드 모달 */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          setUpgradeReason(null);
        }}
        currentPlan={userPlan}
        onUpgrade={handlePlanUpgrade}
        triggerReason={upgradeReason}
      />
    </div>
    </>
  );
}
