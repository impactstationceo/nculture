'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/components/AuthProvider';
import { createAvatar, createScreen, SESSION_TIMELINE, EVALUATION_RESULTS } from '@/lib/data';
import {
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Clock,
  Users,
  Target,
  Bell,
  X,
  Download,
  BookOpen,
  Monitor,
  FileText,
  AlertCircle,
  History,
  Video,
  Play,
  PenTool,
  Sparkles,
  Save,
} from 'lucide-react';

// ============= 평가·모니터링 컴포넌트 =============
const AnomalyIndicator = ({ type }: { type: string }) => {
  if (!type) return null;
  
  const anomalyConfig: Record<string, { label: string; color: string }> = {
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

const ParticipantStatusCard = ({ participant, onClick }: { participant: any; onClick: () => void }) => {
  const statusConfig: Record<string, { label: string; color: string; ringColor: string }> = {
    active: { label: "참여 중", color: "bg-green-500", ringColor: "ring-green-200" },
    idle: { label: "비활성", color: "bg-amber-500", ringColor: "ring-amber-200" },
    away: { label: "이탈", color: "bg-red-500", ringColor: "ring-red-200" }
  };
  
  const status = statusConfig[participant.status] || statusConfig.idle;
  
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm hover:border-neutral-400 hover:shadow-lg transition-all cursor-pointer"
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

const ParticipantMonitorList = ({ participants, onSelectParticipant }: { participants: any[]; onSelectParticipant: (p: any) => void }) => {
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

const ActivityLogItem = ({ activity }: { activity: any }) => {
  const actionConfig: Record<string, { icon: any; color: string }> = {
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

const SessionTimeline = ({ timeline, participantName }: { timeline: any[]; participantName: string }) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm">
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

const EvaluationSummaryTable = ({ results }: { results: any[] }) => {
  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      graded: { label: "채점완료", color: "bg-green-50 text-green-700 border-green-200" },
      review: { label: "검토중", color: "bg-amber-50 text-amber-700 border-amber-200" },
      pending: { label: "미제출", color: "bg-neutral-100 text-neutral-600 border-neutral-200" }
    };
    const c = config[status] || config.pending;
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${c.color}`}>{c.label}</span>;
  };
  
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
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

const BroadcastMessagePanel = ({ onClose }: { onClose: () => void }) => {
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
            <MessageSquare className="w-4 h-4" />
            발송하기
          </button>
        </div>
      </div>
    </div>
  );
};

// ============= 테스트 목록 페이지 =============
const AssessmentListPage = ({ onEnterStudio }: { onEnterStudio: (test: any) => void }) => {
  const [selectedTest, setSelectedTest] = useState<any>(null);
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

  const getStatusBadge = (status: string) => {
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

  const handleShowDetail = (test: any) => {
    setSelectedTest(test);
    setShowDetailModal(true);
  };

  const handleShowResult = (test: any) => {
    setSelectedTest(test);
    setShowResultModal(true);
  };

  const activeTests = tests.filter(t => t.status === 'active');
  const scheduledTests = tests.filter(t => t.status === 'scheduled');
  const completedTests = tests.filter(t => t.status === 'completed');

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-20">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 md:p-10 shadow-sm mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">테스트</h1>
        </div>
        {/* 요약 카드 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
            <div className="text-sm text-neutral-500 mb-1">진행 중</div>
            <div className="text-2xl font-bold text-emerald-600">{activeTests.length}개</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
            <div className="text-sm text-neutral-500 mb-1">예정된 테스트</div>
            <div className="text-2xl font-bold text-blue-600">{scheduledTests.length}개</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
            <div className="text-sm text-neutral-500 mb-1">완료</div>
            <div className="text-2xl font-bold text-neutral-600">{completedTests.length}개</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
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
                  className="bg-white border-2 border-emerald-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all"
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
                  className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:border-neutral-300 hover:shadow-md transition-all"
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
            <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
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
                        <span className={`text-sm font-semibold ${(test.avgScore ?? 0) >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
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
                  {selectedTest.results.scoreDistribution.map((item: any, idx: number) => (
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

const AssessmentStudioPage = ({ test, onExit, user, currentRole }: { test: any; onExit: () => void; user: any; currentRole: string | null }) => {
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showExitAlert, setShowExitAlert] = useState(false);
  const [activeTab, setActiveTab] = useState('monitor');
  
  const isInstructor = (currentRole || user?.role) === 'instructor';

  const participantsList = [
    { id: 1, name: "용기 있는 바닷가재", email: "bigcrab@guest.io", status: "online" },
    { id: 2, name: "근엄한 유니콘", email: "unicorn@guest.io", status: "online" },
    { id: 3, name: "Jungkook Park", email: "jjk@naver.com", status: "online" },
    { id: 4, name: "유준배", email: "jb@comingai.com", status: "online" },
    { id: 5, name: "김수안", email: "suan@comingai.com", status: "online" },
    { id: 6, name: "황보영", email: "h.young@comingai.com", status: "away" },
    { id: 7, name: "용통성 있는 바닷가재", email: "crab2@guest.io", status: "online" },
    { id: 8, name: "권길동", email: "gkwon@comingai.com", status: "online" },
  ];

  const submissionData = [
    { id: 1, name: "용기 있는 바닷가재", email: "bigcrab@guest.io", status: "submitted", score: 85, submittedAt: "14:23:45", duration: "18분 32초" },
    { id: 2, name: "근엄한 유니콘", email: "unicorn@guest.io", status: "submitted", score: 92, submittedAt: "14:18:12", duration: "13분 59초" },
    { id: 3, name: "Jungkook Park", email: "jjk@naver.com", status: "in_progress", score: null, submittedAt: null, duration: null },
    { id: 4, name: "유준배", email: "jb@comingai.com", status: "submitted", score: 78, submittedAt: "14:31:02", duration: "26분 49초" },
    { id: 5, name: "김수안", email: "suan@comingai.com", status: "submitted", score: 95, submittedAt: "14:15:38", duration: "11분 25초" },
    { id: 6, name: "황보영", email: "h.young@comingai.com", status: "not_started", score: null, submittedAt: null, duration: null },
    { id: 7, name: "용통성 있는 바닷가재", email: "crab2@guest.io", status: "in_progress", score: null, submittedAt: null, duration: null },
    { id: 8, name: "권길동", email: "gkwon@comingai.com", status: "submitted", score: 88, submittedAt: "14:27:55", duration: "23분 42초" },
  ];

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

  const getStatusBadge = (status: string) => {
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
      <div className="fixed top-0 left-0 right-0 z-50 bg-neutral-900 border-b border-neutral-800 h-14">
        <div className="flex items-center justify-between px-6 h-full">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleExit}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
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

      <div className="fixed top-[100px] left-0 right-0 bottom-0 flex">
        <div className="w-60 bg-neutral-800 border-r border-neutral-700 flex flex-col flex-shrink-0">
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

          <div className="p-3 border-b border-neutral-700">
            <div className="flex items-center justify-between">
              <div className="text-neutral-400 text-xs">접속자</div>
              <div className="text-neutral-500 text-xs">{participantsList.length}명</div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-neutral-700">
              {participantsList.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-700/50 transition-colors">
                  <div className={`w-2.5 h-2.5 rounded-full ${p.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{p.name}</div>
                    <div className="text-xs text-neutral-500 truncate">{p.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-neutral-900 p-6 overflow-y-auto">
          {activeTab === 'monitor' && (
            <>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-neutral-800 rounded-xl p-4">
                  <div className="text-xs text-neutral-500 mb-1">제출 완료</div>
                  <div className="text-2xl font-bold text-emerald-400">{submissionStats.submitted}명</div>
                </div>
                <div className="bg-neutral-800 rounded-xl p-4">
                  <div className="text-xs text-neutral-500 mb-1">진행 중</div>
                  <div className="text-2xl font-bold text-amber-400">{submissionStats.inProgress}명</div>
                </div>
                <div className="bg-neutral-800 rounded-xl p-4">
                  <div className="text-xs text-neutral-500 mb-1">미시작</div>
                  <div className="text-2xl font-bold text-neutral-400">{submissionStats.notStarted}명</div>
                </div>
                <div className="bg-neutral-800 rounded-xl p-4">
                  <div className="text-xs text-neutral-500 mb-1">평균 점수</div>
                  <div className="text-2xl font-bold text-indigo-400">{submissionStats.avgScore}점</div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                {monitoringScreens.map(screen => (
                  <div 
                    key={screen.id} 
                    onClick={() => setSelectedParticipant(screen)}
                    className="bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 hover:border-indigo-500 transition-all cursor-pointer"
                  >
                    <div className="relative aspect-video bg-black">
                      <img src={screen.screen} alt="" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 flex items-center gap-2">
                        <img src={screen.face} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-lg" />
                        <div>
                          <div className="text-xs font-medium text-white">{screen.name}</div>
                          <div className="text-[10px] text-neutral-400">{screen.status === 'active' ? '활동 중' : '이탈'}</div>
                        </div>
                      </div>
                      {screen.anomaly && (
                        <div className="absolute top-2 right-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${screen.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-xs text-neutral-400">{screen.status === 'active' ? '온라인' : '자리비움'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${screen.hasVideo ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
                        <div className={`w-1.5 h-1.5 rounded-full ${screen.hasAudio ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'results' && isInstructor && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">제출 현황</h3>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-emerald-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600">{submissionStats.submitted}명</div>
                    <div className="text-xs text-emerald-600 mt-1">제출 완료</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-amber-600">{submissionStats.inProgress}명</div>
                    <div className="text-xs text-amber-600 mt-1">진행 중</div>
                  </div>
                  <div className="bg-neutral-100 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-neutral-600">{submissionStats.notStarted}명</div>
                    <div className="text-xs text-neutral-500 mt-1">미시작</div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-600">{submissionStats.avgScore}점</div>
                    <div className="text-xs text-indigo-500 mt-1">평균 점수</div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="py-3 text-left text-sm font-medium text-neutral-600">학습자</th>
                        <th className="py-3 text-left text-sm font-medium text-neutral-600">상태</th>
                        <th className="py-3 text-left text-sm font-medium text-neutral-600">제출 시간</th>
                        <th className="py-3 text-left text-sm font-medium text-neutral-600">소요 시간</th>
                        <th className="py-3 text-left text-sm font-medium text-neutral-600">점수</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {submissionData.map((submission) => (
                        <tr key={submission.id} className="hover:bg-neutral-50">
                          <td className="py-3">
                            <div>
                              <div className="font-medium text-neutral-900">{submission.name}</div>
                              <div className="text-xs text-neutral-500">{submission.email}</div>
                            </div>
                          </td>
                          <td className="py-3">{getStatusBadge(submission.status)}</td>
                          <td className="py-3 text-sm text-neutral-600">{submission.submittedAt || '-'}</td>
                          <td className="py-3 text-sm text-neutral-600">{submission.duration || '-'}</td>
                          <td className="py-3">
                            {submission.score !== null ? (
                              <span className="font-semibold text-neutral-900">{submission.score}점</span>
                            ) : (
                              <span className="text-neutral-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <EvaluationSummaryTable results={EVALUATION_RESULTS} />
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="bg-neutral-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-700 flex items-center justify-between">
                <h3 className="text-white font-medium">참여자 목록</h3>
                <span className="text-sm text-neutral-400">{participantsList.length}명</span>
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

      {showBroadcast && <BroadcastMessagePanel onClose={() => setShowBroadcast(false)} />}

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
                <div>
                  <h4 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    화면 공유
                  </h4>
                  <div className="rounded-xl overflow-hidden bg-neutral-900 aspect-video shadow-lg">
                    <img src={selectedParticipant.screen} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
                
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

export default function AssessmentPage() {
  const { isLoggedIn, user, viewMode, currentRole, wallet, userPlan, handleAuthClick, handleLogout, setCurrentPage, handleRoleSwitch, currentPage } = useAuth();
  const [currentTest, setCurrentTest] = useState<any>(null);

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
      {!currentTest ? (
        <AssessmentListPage onEnterStudio={(test) => setCurrentTest(test)} />
      ) : (
        <AssessmentStudioPage test={currentTest} onExit={() => setCurrentTest(null)} user={user} currentRole={currentRole} />
      )}
    </>
  );
}
