'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  X, Send, Users, MessageSquare, Mic, MicOff, 
  Video, VideoOff, Monitor, Maximize2, Settings
} from 'lucide-react';
import { LIVE_CLASSES } from '@/lib/data';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';

const LIVE_CHAT_MESSAGES = [
  { id: 1, user: "강사", message: "안녕하세요! 오늘은 SORA를 활용한 시네마틱 영상 제작을 배워보겠습니다.", isInstructor: true, time: "14:02" },
  { id: 2, user: "학습자42", message: "질문있습니다! 프롬프트 길이는 어느정도가 적당한가요?", isInstructor: false, time: "14:05" },
  { id: 3, user: "강사", message: "좋은 질문입니다. 50-100 단어 정도가 적당합니다.", isInstructor: true, time: "14:06" }
];

export default function LiveClassRoom() {
  const params = useParams();
  const router = useRouter();
  const classId = parseInt(params.id as string);
  const { user, profile, isLoggedIn, login, isLoading } = useAuth();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [messages, setMessages] = useState(LIVE_CHAT_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [participantCount, setParticipantCount] = useState(42);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const liveClass = LIVE_CLASSES.find(c => c.id === classId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 참가자 수 변동 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setParticipantCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      user: profile?.name || "나",
      message: newMessage,
      isInstructor: false,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }]);
    setNewMessage('');
  };

  const handleLogin = (userData: any) => {
    login(userData);
    setShowAuthModal(false);
  };

  const handleExit = () => {
    if (confirm('라이브 강의실을 나가시겠습니까?')) {
      router.push('/live');
    }
  };

  if (!liveClass) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">라이브 강의를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-neutral-900 flex">
      {/* 메인 비디오 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 바 */}
        <div className="h-16 bg-neutral-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white font-medium">LIVE</span>
            </div>
            <h1 className="text-white text-sm truncate max-w-md">{liveClass.title}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-neutral-400">
              <Users className="w-4 h-4" />
              <span className="text-sm">{participantCount}</span>
            </div>
            <button
              onClick={handleExit}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              나가기
            </button>
          </div>
        </div>

        {/* 비디오 영역 */}
        <div className="flex-1 flex items-center justify-center bg-neutral-950 relative">
          <img 
            src={liveClass.thumbnail}
            alt="Live Stream"
            className="max-h-full max-w-full object-contain"
          />
          
          {/* 강사 정보 오버레이 */}
          <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
              {liveClass.instructor.charAt(0)}
            </div>
            <div>
              <p className="text-white font-medium">{liveClass.instructor}</p>
              <p className="text-neutral-400 text-sm">강의 중</p>
            </div>
          </div>
          
          {/* 전체화면 버튼 */}
          <button className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-lg hover:bg-black/60 transition-colors">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* 하단 컨트롤 바 */}
        <div className="h-20 bg-neutral-800 flex items-center justify-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-colors ${
              isMuted ? 'bg-neutral-700 text-neutral-400' : 'bg-indigo-500 text-white'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-full transition-colors ${
              isVideoOff ? 'bg-neutral-700 text-neutral-400' : 'bg-indigo-500 text-white'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
          
          <button className="p-4 rounded-full bg-neutral-700 text-neutral-400 hover:bg-neutral-600 transition-colors">
            <Monitor className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-4 rounded-full transition-colors ${
              showChat ? 'bg-indigo-500 text-white' : 'bg-neutral-700 text-neutral-400'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          
          <button className="p-4 rounded-full bg-neutral-700 text-neutral-400 hover:bg-neutral-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 채팅 패널 */}
      {showChat && (
        <div className="w-80 bg-neutral-800 flex flex-col border-l border-neutral-700">
          <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-700">
            <h3 className="text-white font-medium">실시간 채팅</h3>
            <button 
              onClick={() => setShowChat(false)}
              className="p-1 hover:bg-neutral-700 rounded"
            >
              <X className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
          
          {/* 메시지 목록 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.isInstructor ? 'bg-indigo-900/30 -mx-4 px-4 py-2' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                  msg.isInstructor ? 'bg-indigo-500' : 'bg-neutral-600'
                }`}>
                  {msg.user.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${msg.isInstructor ? 'text-indigo-400' : 'text-neutral-300'}`}>
                      {msg.user}
                    </span>
                    {msg.isInstructor && (
                      <span className="px-1.5 py-0.5 bg-indigo-500 text-white text-[10px] rounded">강사</span>
                    )}
                    <span className="text-xs text-neutral-500">{msg.time}</span>
                  </div>
                  <p className="text-sm text-neutral-200 break-words">{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          {/* 메시지 입력 */}
          <div className="p-4 border-t border-neutral-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isLoggedIn ? "메시지 입력..." : "로그인 후 채팅에 참여하세요"}
                className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-neutral-500"
                disabled={!isLoggedIn}
              />
              <button
                onClick={handleSendMessage}
                disabled={!isLoggedIn}
                className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {!isLoggedIn && (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="w-full mt-2 py-2 text-sm text-indigo-400 hover:text-indigo-300"
              >
                로그인하여 채팅에 참여하기
              </button>
            )}
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
        onLogin={handleLogin}
      />
    </div>
  );
}
