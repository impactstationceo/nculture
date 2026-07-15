'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Video, MessageSquare, Users, Volume2, VideoOff, Maximize2, Send } from 'lucide-react';
import { LIVE_CLASSES, LIVE_CHAT_MESSAGES, createAvatar, createScreen } from '@/lib/data';

const LiveClassRoom = ({ classId, onExit }: { classId: number; onExit: () => void }) => {
  const [chatMessages, setChatMessages] = useState(LIVE_CHAT_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeTab, setActiveTab] = useState('classroom');

  const currentClass = LIVE_CLASSES.find(c => c.id === classId);

  const participants = [
    { id: 1, name: "김민지", email: "minji@comingai.com", status: "online" },
    { id: 2, name: "홍길동", email: "hong@naver.com", status: "online" },
    { id: 3, name: "김지영", email: "jiyoung@gmail.com", status: "online" },
    { id: 4, name: "오도윤", email: "doyun@comingai.com", status: "online" },
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
    <div className="min-h-screen bg-[#F9FAFB] pt-14">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-[#E5E8EB] shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="text-base tracking-tight hover:opacity-80 transition-opacity">
              <span className="font-normal text-[#3182F6]">n</span>
              <span className="font-medium text-[#191F28]">Culture</span>
            </button>
            <div className="h-4 w-px bg-[#E5E8EB]" />
            <span className="text-[#6B7684] text-sm truncate max-w-md">{currentClass?.title}</span>
          </div>
          <button onClick={onExit} className="px-3 py-1.5 bg-[#F2F4F6] text-[#6B7684] text-sm font-medium rounded-xl hover:bg-[#E5E8EB]">
            나가기
          </button>
        </div>
      </div>

      <div className="fixed top-[52px] left-0 right-0 z-40 bg-white/95 backdrop-blur border-b border-[#E5E8EB] shadow-sm">
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
                  activeTab === menu.id ? 'bg-[#3182F6] text-white' : 'text-[#6B7684] hover:bg-[#F2F4F6] hover:text-[#191F28]'
                }`}
              >
                <menu.icon className="w-3.5 h-3.5" />
                {menu.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[#6B7684]">연결됨</span>
            <span className="font-mono text-emerald-500">00:17:22</span>
          </div>
        </div>
      </div>

      {activeTab === 'classroom' && (
        <div className="flex h-[calc(100vh-88px)] pt-[36px] max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 gap-4 w-full">
          <div className="w-56 bg-white border border-[#E5E8EB] rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-3 border-b border-[#E5E8EB] bg-[#F9FAFB] flex items-center justify-between">
              <h3 className="text-[#191F28] font-medium text-xs">접속자</h3>
              <span className="text-xs text-white bg-[#3182F6] px-2 py-0.5 rounded-full">{participants.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {participants.map(p => (
                <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#F2F4F6]">
                  <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-xs text-[#191F28] truncate">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-white border border-[#E5E8EB] rounded-2xl shadow-sm p-3">
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0B0F1A]">
              <img src={createScreen('active')} alt="강사 화면" className="w-full h-full object-contain" />
              <div className="absolute top-3 right-3 w-36 aspect-video rounded-xl overflow-hidden border border-[#3182F6]/60 shadow-xl">
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
              <button onClick={() => setIsMuted(!isMuted)} className={`p-2.5 rounded-full ${isMuted ? 'bg-[#F44336] text-white' : 'bg-[#F2F4F6] text-[#6B7684] hover:bg-[#E5E8EB]'}`}>
                <Volume2 className="w-4 h-4" />
              </button>
              <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-2.5 rounded-full ${isVideoOff ? 'bg-[#F44336] text-white' : 'bg-[#F2F4F6] text-[#6B7684] hover:bg-[#E5E8EB]'}`}>
                <VideoOff className="w-4 h-4" />
              </button>
              <button className="p-2.5 rounded-full bg-[#F2F4F6] text-[#6B7684] hover:bg-[#E5E8EB]">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="w-60 bg-white border border-[#E5E8EB] rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-2 border-b border-[#E5E8EB]">
              <div className="relative rounded-xl overflow-hidden aspect-video bg-[#0B0F1A]">
                <img src={createAvatar("김", "#6366f1")} alt="강사" className="w-full h-full object-cover" />
                <div className="absolute bottom-1 left-1 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-xs">강사</span>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {studentCams.map(s => (
                <div key={s.id} className="relative rounded-xl overflow-hidden aspect-video bg-[#0B0F1A]">
                  <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 text-white text-xs bg-black/60 px-1.5 py-0.5 rounded truncate max-w-[80px]">{s.name}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E5E8EB] h-44">
              <div className="px-2 py-1.5 border-b border-[#E5E8EB] flex justify-between bg-[#F9FAFB]">
                <h4 className="text-[#191F28] text-xs font-medium">채팅</h4>
                <button onClick={() => setActiveTab('chat')} className="text-xs text-[#3182F6] hover:text-[#1B64DA]">전체보기</button>
              </div>
              <div className="overflow-y-auto p-2 space-y-1 h-24">
                {chatMessages.slice(-3).map(msg => (
                  <div key={msg.id}>
                    <span className={`text-xs font-medium ${msg.isInstructor ? 'text-[#3182F6]' : 'text-[#6B7684]'}`}>{msg.user}</span>
                    <span className="text-xs text-[#8B95A1] ml-1">{msg.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="h-[calc(100vh-88px)] pt-[36px] flex flex-col bg-[#F9FAFB]">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-screen-md mx-auto w-full">
            <div className="bg-white border border-[#E5E8EB] rounded-2xl shadow-sm p-4 space-y-3">
            {chatMessages.map(msg => (
              <div key={msg.id} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.isInstructor ? 'bg-[#3182F6]' : 'bg-[#F2F4F6]'}`}>
                  <span className={`${msg.isInstructor ? 'text-white' : 'text-[#6B7684]'} text-xs`}>{msg.user.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${msg.isInstructor ? 'text-[#3182F6]' : 'text-[#191F28]'}`}>{msg.user}</span>
                    {msg.isInstructor && <span className="px-1.5 py-0.5 bg-[#E8F3FF] text-[#3182F6] text-xs rounded-full">강사</span>}
                    <span className="text-xs text-[#8B95A1]">{msg.time}</span>
                  </div>
                  <p className="text-sm text-[#333D4B]">{msg.message}</p>
                </div>
              </div>
            ))}
            </div>
          </div>
          <div className="p-4 border-t border-[#E5E8EB] bg-white">
            <div className="flex gap-2 max-w-screen-md mx-auto">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatMessage()}
                placeholder="메시지를 입력하세요"
                className="flex-1 px-4 py-3 bg-white border border-[#E5E8EB] rounded-xl text-sm text-[#191F28] placeholder-[#8B95A1] focus:outline-none focus:border-[#3182F6]"
              />
              <button onClick={handleChatMessage} className="px-4 py-3 bg-[#3182F6] text-white rounded-xl hover:bg-[#1B64DA] shadow-sm">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'participants' && (
        <div className="h-[calc(100vh-88px)] pt-[36px] p-4 bg-[#F9FAFB]">
          <div className="bg-white border border-[#E5E8EB] rounded-2xl shadow-sm overflow-hidden max-w-screen-md mx-auto">
            <div className="px-4 py-3 border-b border-[#E5E8EB] flex justify-between bg-[#F9FAFB]">
              <h3 className="text-[#191F28] font-medium">참여자 목록</h3>
              <span className="text-sm text-[#6B7684]">{participants.length}명</span>
            </div>
            <div className="divide-y divide-[#E5E8EB]">
              {participants.map(p => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#F2F4F6]">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${p.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <div className="w-10 h-10 bg-[#E8F3FF] rounded-full flex items-center justify-center">
                      <span className="text-[#3182F6] text-sm font-semibold">{p.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="text-sm text-[#191F28]">{p.name}</div>
                      <div className="text-xs text-[#8B95A1]">{p.email}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${p.status === 'online' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
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

export default function LiveRoomPage() {
  const params = useParams();
  const router = useRouter();
  const classId = Array.isArray(params.id) ? params.id[0] : params.id;
  const parsedId = classId ? Number(classId) : 0;

  return <LiveClassRoom classId={parsedId} onExit={() => router.push('/live')} />;
}
