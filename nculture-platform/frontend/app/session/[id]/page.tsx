'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Play, Sparkles, Zap, Volume2, Copy, 
  ChevronDown, RefreshCw, Save, Download, Check, Lock
} from 'lucide-react';
import { CURRICULUM, AI_SERVICES, calculateCredits } from '@/lib/data';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';

type AiTier = (typeof AI_SERVICES)[number]['tiers'][number];
type VideoTier = AiTier & {
  maxResolution: string;
  maxDurationSec: number;
  audioSupported: boolean;
};

const isVideoTier = (tier: AiTier): tier is VideoTier =>
  typeof (tier as VideoTier).maxResolution === 'string' &&
  typeof (tier as VideoTier).maxDurationSec === 'number' &&
  typeof (tier as VideoTier).audioSupported === 'boolean';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = parseInt(params.id as string);
  
  const { user, profile, isLoggedIn, wallet, login, logout, updateCredits, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // AI 설정 상태
  const [selectedService, setSelectedService] = useState(AI_SERVICES[0]);
  const [selectedTier, setSelectedTier] = useState(AI_SERVICES[0].tiers[0]);
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('5s');
  const [resolution, setResolution] = useState('720p');
  const [audioOn, setAudioOn] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<any[]>([]);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);

  // 현재 세션 찾기
  const findSession = () => {
    for (const course of Object.values(CURRICULUM)) {
      const session = (course as any).sessions.find((s: any) => s.id === sessionId);
      if (session) return { session, course };
    }
    return null;
  };

  const sessionData = findSession();
  const session = sessionData?.session;
  const course = sessionData?.course;

  // 크레딧 계산
  const estimatedCredits = calculateCredits(
    selectedTier.id, 
    duration, 
    resolution, 
    audioOn, 
    AI_SERVICES
  );

  const handleGenerate = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    
    if (!prompt.trim()) return;
    if (wallet.balance < estimatedCredits) {
      alert('크레딧이 부족합니다. 플랜을 업그레이드해주세요.');
      return;
    }

    setIsGenerating(true);

    try {
      // Supabase Edge Function 호출 시도
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      if (supabaseUrl && user?.isSupabaseUser) {
        const response = await fetch(`${supabaseUrl}/functions/v1/ai-generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            prompt,
            service: selectedService.id,
            tier: selectedTier.id,
            duration,
            resolution,
            audioOn,
            userId: user.id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const newResult = {
            id: data.result?.id || Date.now(),
            prompt,
            service: selectedService.name,
            tier: selectedTier.name,
            duration,
            resolution,
            audioOn,
            credits: data.result?.creditsUsed || estimatedCredits,
            timestamp: new Date().toISOString(),
            status: 'completed',
            url: data.result?.url,
            thumbnailUrl: data.result?.thumbnailUrl,
          };
          
          setGeneratedResults([newResult, ...generatedResults]);
          updateCredits(-estimatedCredits);
          setIsGenerating(false);
          return;
        }
      }
      
      // Fallback: 데모 모드 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newResult = {
        id: Date.now(),
        prompt,
        service: selectedService.name,
        tier: selectedTier.name,
        duration,
        resolution,
        audioOn,
        credits: estimatedCredits,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
      setGeneratedResults([newResult, ...generatedResults]);
      updateCredits(-estimatedCredits);
      
    } catch (error) {
      console.error('AI Generate error:', error);
      // 에러 시에도 데모 결과 표시
      const newResult = {
        id: Date.now(),
        prompt,
        service: selectedService.name,
        tier: selectedTier.name,
        duration,
        resolution,
        audioOn,
        credits: estimatedCredits,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      setGeneratedResults([newResult, ...generatedResults]);
      updateCredits(-estimatedCredits);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseExample = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  const handleLogin = (userData: any) => {
    login(userData);
    setShowAuthModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
        <div className="text-center">
          <p className="mb-4">세션을 찾을 수 없습니다.</p>
          <button 
            onClick={() => router.push('/curriculum')}
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            클래스 목록으로
          </button>
        </div>
      </div>
    );
  }

  const videoServices = AI_SERVICES.filter(s => s.category === 'video');
  const videoTier = isVideoTier(selectedTier) ? selectedTier : null;

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-900/95 backdrop-blur border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs text-neutral-500">{course?.title}</p>
              <h1 className="font-semibold">{session.title}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-xl">
            <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold">{wallet.balance.toLocaleString()}</span>
            {!isLoggedIn && (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="ml-2 text-xs text-indigo-400 hover:underline"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="pt-20 flex">
        {/* 왼쪽: 학습 내용 */}
        <div className="w-96 border-r border-neutral-800 p-6 h-[calc(100vh-80px)] overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">{session.title}</h2>
            <p className="text-sm text-neutral-400">{session.summary}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-neutral-300 mb-3">학습 개념</h3>
            <ul className="space-y-2">
              {session.concepts?.map((concept: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  {concept}
                </li>
              ))}
            </ul>
          </div>

          {session.examples && (
            <div>
              <h3 className="text-sm font-medium text-neutral-300 mb-3">예시 프롬프트</h3>
              <div className="space-y-3">
                {session.examples.map((example: any, i: number) => (
                  <div 
                    key={i}
                    className="p-3 bg-neutral-800 rounded-xl border border-neutral-700 hover:border-indigo-500 transition-colors cursor-pointer"
                    onClick={() => handleUseExample(example.prompt)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-indigo-400 font-medium">{example.label}</span>
                      <Copy className="w-3.5 h-3.5 text-neutral-500" />
                    </div>
                    <p className="text-sm text-neutral-300">{example.prompt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 중앙: AI 스튜디오 */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <button
                  onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition-colors"
                >
                  <span className="text-lg">{selectedService.icon}</span>
                  <span className="font-medium">{selectedService.name}</span>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>
                
                {showServiceDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl z-10 overflow-hidden">
                    {videoServices.map(service => (
                      <button
                        key={service.id}
                        onClick={() => {
                          setSelectedService(service);
                          setSelectedTier(service.tiers[0]);
                          setShowServiceDropdown(false);
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-700 transition-colors ${
                          selectedService.id === service.id ? 'bg-neutral-700' : ''
                        }`}
                      >
                        <span className="text-lg">{service.icon}</span>
                        <div className="text-left">
                          <div className="font-medium">{service.name}</div>
                          <div className="text-xs text-neutral-400">{service.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {selectedService.tiers.map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedTier.id === tier.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {tier.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-xl">
              <div>
                <label className="text-xs text-neutral-500 block mb-1">해상도</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="bg-neutral-700 border-none rounded-lg px-3 py-1.5 text-sm"
                >
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                  {videoTier?.maxResolution === '4K' && <option value="4K">4K</option>}
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-500 block mb-1">길이</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="bg-neutral-700 border-none rounded-lg px-3 py-1.5 text-sm"
                >
                  <option value="5s">5초</option>
                  <option value="10s">10초</option>
                  {(videoTier?.maxDurationSec ?? 10) >= 15 && <option value="15s">15초</option>}
                  {(videoTier?.maxDurationSec ?? 10) >= 20 && <option value="20s">20초</option>}
                </select>
              </div>

              {videoTier?.audioSupported && (
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">오디오</label>
                  <button
                    onClick={() => setAudioOn(!audioOn)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      audioOn ? 'bg-indigo-600 text-white' : 'bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    {audioOn ? 'ON' : 'OFF'}
                  </button>
                </div>
              )}

              <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-neutral-900 rounded-lg">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-semibold">{estimatedCredits}</span>
                <span className="text-xs text-neutral-500">크레딧</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="영상을 설명하는 프롬프트를 입력하세요..."
              className="w-full h-40 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
            
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-neutral-500">{prompt.length} / 500 자</div>
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating || wallet.balance < estimatedCredits}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    생성하기
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-neutral-300 mb-4">생성 결과</h3>
            
            {generatedResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
                <Play className="w-12 h-12 mb-4 opacity-30" />
                <p>프롬프트를 입력하고 생성하기를 클릭하세요</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {generatedResults.map(result => (
                  <div key={result.id} className="bg-neutral-800 rounded-xl overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white/80" />
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-neutral-300 line-clamp-2 mb-2">{result.prompt}</p>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>{result.service} · {result.resolution}</span>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>{result.credits}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 py-2 text-xs bg-neutral-700 rounded-lg hover:bg-neutral-600 transition-colors flex items-center justify-center gap-1">
                          <Save className="w-3.5 h-3.5" />
                          저장
                        </button>
                        <button className="flex-1 py-2 text-xs bg-neutral-700 rounded-lg hover:bg-neutral-600 transition-colors flex items-center justify-center gap-1">
                          <Download className="w-3.5 h-3.5" />
                          다운로드
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
        onLogin={handleLogin}
      />
    </div>
  );
}
