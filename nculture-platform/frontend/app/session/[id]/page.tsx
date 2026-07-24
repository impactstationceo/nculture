'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/components/AuthProvider';
import { AI_SERVICES, CURRICULUM, createResult, PRICING_PLANS } from '@/lib/data';
import { getAIServices, generateAI, deductCredits } from '@/lib/api';
import { isSupabaseConfigured } from '@/lib/supabase';
import { apiReserveCredits, apiGenerateJob, apiCaptureCredits, apiRefundCredits, calculateCredits, checkPlanLimits, getTierLevel, generatePracticeEvaluation } from '@/lib/utils';
import { 
  Play,
  ChevronRight,
  ChevronDown,
  Save,
  CheckCircle,
  Clock,
  Zap,
  Sparkles,
  Video,
  Target,
  Award,
  RefreshCw,
  Eye,
  MessageSquare,
  X,
  Upload,
  Check,
  AlertTriangle,
  Activity,
  AlertCircle,
  PenTool,
  Users,
  Lightbulb,
  Monitor,
} from 'lucide-react';

// ============= 2단 선택 컴포넌트 =============
const SpecBadge = ({ label, value }: any) => (
  <span className="px-2.5 py-0.5 bg-[#F2F4F6] text-[#6B7684] text-xs rounded-full font-medium">
    {label}: {value}
  </span>
);

const ServiceListItem = ({ service, isSelected, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-3 flex items-center gap-3 transition-all text-left border-l-2 ${
      isSelected ? 'bg-[#E8F3FF] border-l-[#3182F6]' : 'border-l-transparent hover:bg-[#F9FAFB]'
    }`}
  >
    <div className="w-10 h-10 rounded-lg bg-[#F2F4F6] border border-[#E5E8EB] flex items-center justify-center text-xl flex-shrink-0">
      {service.icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-neutral-900">{service.name}</div>
      <div className="text-xs text-neutral-500 truncate">{service.description}</div>
    </div>
    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#3182F6]' : 'text-[#8B95A1]'}`} strokeWidth={1.5} />
  </button>
);

const TierListItem = ({ tier, isSelected, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-3 border rounded-2xl text-left transition-all ${
      isSelected 
        ? 'bg-[#E8F3FF] border-[#A7CCFF] shadow-sm' 
        : 'bg-white border-[#E5E8EB] hover:border-[#A7CCFF]'
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

const ModelPickerPanel = ({ isOpen, onClose, services, selectedService, selectedTier, onApply, userPlan, onShowUpgradeModal }: any) => {
  const [tempService, setTempService] = useState(selectedService);
  const [tempTier, setTempTier] = useState(selectedTier);
  const [activeCategory, setActiveCategory] = useState('video');

  useEffect(() => {
    if (isOpen && selectedService) {
      const service = services.find((s: any) => s.id === selectedService);
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

  const filteredServices = services.filter((s: any) => s.category === activeCategory);
  const currentService = services.find((s: any) => s.id === tempService);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    const firstService = services.find((s: any) => s.category === categoryId);
    if (firstService) {
      setTempService(firstService.id);
      setTempTier(firstService.tiers[0].id);
    }
  };

  const handleApply = () => {
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
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-[#E5E8EB] shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="px-6 py-4 border-b border-[#E5E8EB]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">AI 모델 선택</h3>
            <button onClick={onClose} className="text-neutral-500 hover:text-neutral-900">
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#3182F6] text-white'
                    : 'bg-[#F2F4F6] text-[#6B7684] hover:bg-[#E5E8EB]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="w-2/5 border-r border-[#E5E8EB] overflow-y-auto">
            <div className="p-3 bg-[#F9FAFB] border-b border-[#E5E8EB]">
              <h4 className="text-xs font-semibold text-neutral-700 uppercase">
                {categories.find(c => c.id === activeCategory)?.label} 서비스
              </h4>
            </div>
            {filteredServices.map((service: any) => (
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

          <div className="w-3/5 overflow-y-auto bg-[#F9FAFB]">
            <div className="p-3 border-b border-[#E5E8EB]">
              <h4 className="text-xs font-semibold text-neutral-700 uppercase">
                {currentService?.name} 모델
              </h4>
            </div>
            <div className="p-4 space-y-3">
              {currentService?.tiers.map((tier: any) => (
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

        <div className="px-6 py-4 border-t border-[#E5E8EB] flex gap-3 justify-end bg-[#F9FAFB]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-[#E5E8EB] rounded-xl text-sm font-medium text-[#333D4B] hover:bg-[#F9FAFB] transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 bg-[#3182F6] text-white rounded-xl text-sm font-medium shadow-sm hover:bg-[#1B64DA] transition-colors"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
};

const ModelPicker = ({ service, tier, services, onClick }: any) => {
  const selectedService = services.find((s: any) => s.id === service);
  const selectedTier = selectedService?.tiers.find((t: any) => t.id === tier);

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-900 mb-1.5">AI 모델</label>
      <button
        onClick={onClick}
        className="w-full bg-white border border-[#E5E8EB] rounded-2xl px-3 py-2.5 text-left flex items-center justify-between shadow-sm hover:border-[#A7CCFF] hover:bg-[#F9FAFB] transition-all group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#F2F4F6] rounded-lg flex items-center justify-center text-lg border border-[#E5E8EB]">
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
const FramePickerCard = ({ type }: any) => {
  const [preview, setPreview] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: any) => {
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

const PromptBox = ({ value, onChange, enhance, onEnhanceToggle, placeholder }: any) => (
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
const RESOLUTION_PLAN_REQUIREMENTS: Record<string, string> = {
  '720p': 'free',
  '1080p': 'pro'
};

// 이미지 크기별 최소 플랜 요구사항
const IMAGE_SIZE_PLAN_REQUIREMENTS: Record<string, string> = {
  '1024x1024': 'free',
  '1792x1024': 'free',
  '1024x1792': 'free',
  '2048x2048': 'pro'
};

// 생성 개수별 최소 플랜 요구사항
const IMAGE_COUNT_PLAN_REQUIREMENTS: Record<string, string> = {
  '1': 'free',
  '2': 'basic',
  '4': 'pro'
};

// 플랜 순위
const PLAN_RANK: Record<string, number> = {
  'free': 0,
  'basic': 1,
  'pro': 2,
  'max': 3,
  'enterprise': 4
};

// 플랜이 요구사항을 충족하는지 확인
const isPlanSufficient = (userPlan: string, requiredPlan: string) => {
  return PLAN_RANK[userPlan] >= PLAN_RANK[requiredPlan];
};

const DurationResolutionControls = ({ duration, resolution, onDurationChange, onResolutionChange, userPlan = 'free' }: any) => (
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
const ImageSettingsControls = ({ imageSize, setImageSize, imageStyle, setImageStyle, imageCount, setImageCount, userPlan = 'free' }: any) => (
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
const TextSettingsControls = ({ maxTokens, setMaxTokens, temperature, setTemperature, outputFormat, setOutputFormat, userPlan = 'free' }: any) => (
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
  const [preview, setPreview] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: any) => {
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

const GenerateButton = ({ onClick, isGenerating, cost = 6, disabled = false }: any) => (
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

const VideoToolTabs = ({ activeTab, onTabChange }: any) => {
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
const TutorDrawer = ({ isOpen, onClose }: any) => {
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

const generateImage = (prompt: string, sessionId: number) => {
  return createResult(sessionId);
};

// ============= Session Page =============
const SessionPageContent = ({ sessionId, wallet, setWallet, addLedgerEntry, userPlan, onShowUpgradeModal, user, currentRole, isLoggedIn, onAuthClick }: any) => {
  const [activeTab, setActiveTab] = useState('create');
  const [selectedService, setSelectedService] = useState('runway');
  const [selectedTier, setSelectedTier] = useState('runway-gen4-turbo');
  const [services, setServices] = useState<any[]>(AI_SERVICES);
  const [prompt, setPrompt] = useState('');
  const [enhance, setEnhance] = useState(false);
  const [duration, setDuration] = useState('10s');
  const [resolution, setResolution] = useState('1080p');
  const [audioOn, setAudioOn] = useState(true);
  const [imageSize, setImageSize] = useState('1024x1024');
  const [imageStyle, setImageStyle] = useState('자연스러운');
  const [imageCount, setImageCount] = useState('1');
  const [maxTokens, setMaxTokens] = useState('1024');
  const [temperature, setTemperature] = useState('0.7');
  const [outputFormat, setOutputFormat] = useState('일반 텍스트');
  
  const [results, setResults] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [notification, setNotification] = useState<any>(null);
  const [runningJobs, setRunningJobs] = useState(0);

  useEffect(() => {
    let isActive = true;
    getAIServices()
      .then((data) => {
        if (isActive && Array.isArray(data) && data.length > 0) {
          setServices(data);
        }
      })
      .catch((error) => {
        console.error('Failed to load AI services:', error);
      });

    return () => {
      isActive = false;
    };
  }, []);
  
  const notificationRef = useRef<HTMLDivElement | null>(null);
  
  const [showStudentPanel, setShowStudentPanel] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [showScheduledNoticePanel, setShowScheduledNoticePanel] = useState(false);
  
  const [receivedBroadcast, setReceivedBroadcast] = useState<any>(null);
  
  const [scheduledNotices, setScheduledNotices] = useState<any[]>([
    { id: 1, time: '00:00', type: 'start', message: '안녕하세요! 오늘 수업을 시작합니다. 집중해서 들어주세요.', enabled: true },
    { id: 2, time: '05:00', type: 'practice', message: '이제 첫 번째 실습을 시작해보세요. 프롬프트를 직접 작성해봅시다!', enabled: true },
    { id: 3, time: '10:00', type: 'hint', message: '💡 힌트: 구체적인 형용사와 분위기를 설명하면 더 좋은 결과를 얻을 수 있어요.', enabled: true },
    { id: 4, time: '15:00', type: 'reminder', message: '⏰ 실습 마무리 5분 전입니다. 작업을 완료해주세요.', enabled: true },
    { id: 5, time: '20:00', type: 'end', message: '수고하셨습니다! 오늘 배운 내용을 복습해보세요. 다음 회차에서 만나요! 👋', enabled: true },
  ]);
  const [newNoticeTime, setNewNoticeTime] = useState('');
  const [newNoticeMessage, setNewNoticeMessage] = useState('');
  const [newNoticeType, setNewNoticeType] = useState('info');
  const [editingNotice, setEditingNotice] = useState<any>(null);
  
  const [videoTime, setVideoTime] = useState(0);
  const [displayedNotices, setDisplayedNotices] = useState<any[]>([]);
  
  const isInstructor = (currentRole || user?.role) === 'instructor';
  
  const studentList = [
    { id: 1, name: '김민준', status: 'active', generates: 5, lastPrompt: '도시의 야경이 반짝이는...' },
    { id: 2, name: '이서연', status: 'active', generates: 3, lastPrompt: '바다 위를 나는 드론...' },
    { id: 3, name: '박지호', status: 'idle', generates: 1, lastPrompt: '숲 속의 오두막...' },
    { id: 4, name: '최수아', status: 'active', generates: 8, lastPrompt: '미래 도시의 일출...' },
    { id: 5, name: '정예준', status: 'offline', generates: 0, lastPrompt: '-' },
  ];
  
  const timeToSeconds = (timeStr: string) => {
    const [min, sec] = timeStr.split(':').map(Number);
    return min * 60 + sec;
  };
  
  const secondsToTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };
  
  useEffect(() => {
    if (!isInstructor) {
      const timer = setInterval(() => {
        setVideoTime(prev => prev + 60);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isInstructor]);
  
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
  
  const getNoticeTypeInfo = (type: string) => {
    switch(type) {
      case 'start': return { label: '시작', color: 'bg-emerald-100 text-emerald-700', icon: '🎬' };
      case 'practice': return { label: '실습', color: 'bg-indigo-100 text-indigo-700', icon: '✏️' };
      case 'hint': return { label: '힌트', color: 'bg-amber-100 text-amber-700', icon: '💡' };
      case 'reminder': return { label: '알림', color: 'bg-orange-100 text-orange-700', icon: '⏰' };
      case 'end': return { label: '종료', color: 'bg-neutral-100 text-neutral-700', icon: '👋' };
      default: return { label: '정보', color: 'bg-blue-100 text-blue-700', icon: '📢' };
    }
  };
  
  const feedRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (feedRef.current && results.length > 0) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [results]);

  const currentSession = Object.values(CURRICULUM)
    .flatMap((stage: any) => stage.sessions)
    .find((s: any) => s.id === sessionId);

  if (!currentSession) return null;

  const currentServiceData = services.find((s: any) => s.id === selectedService);
  const currentCategory = currentServiceData?.category || 'video';

  const calculateCategoryCredits = () => {
    if (currentCategory === 'video') {
      return calculateCredits(selectedTier, duration, resolution, audioOn);
    } else if (currentCategory === 'image') {
      const tierData = currentServiceData?.tiers.find((t: any) => t.id === selectedTier);
      const base = tierData?.pricing?.base || 8;
      const multiplier = tierData?.pricing?.multiplier || 1;
      return Math.ceil(base * multiplier * parseInt(imageCount));
    } else {
      const tierData = currentServiceData?.tiers.find((t: any) => t.id === selectedTier);
      const base = tierData?.pricing?.base || 2;
      const multiplier = tierData?.pricing?.multiplier || 1;
      const tokenMultiplier = parseInt(maxTokens) / 1024;
      return Math.ceil(base * multiplier * tokenMultiplier);
    }
  };
  
  const estimatedCredits = calculateCategoryCredits();
  const insufficientBalance = wallet.balance < estimatedCredits;
  
  const planCheck = currentCategory === 'video' 
    ? checkPlanLimits(userPlan, selectedTier, resolution, runningJobs)
    : checkPlanLimits(userPlan, selectedTier, '720p', runningJobs);

  const handlePromptApply = (text: string) => {
    setPrompt(text);
  };

  const getPromptPlaceholder = () => {
    if (currentCategory === 'image') {
      if (selectedService === 'flux') return '생성하거나 편집할 이미지를 자세히 설명하세요...';
      if (selectedService === 'ideogram') return '텍스트가 포함된 이미지 스타일을 설명하세요...';
      return '생성하고 싶은 이미지를 설명하세요...';
    }
    if (currentCategory === 'text') {
      if (selectedService === 'gpt') return '질문이나 작업 내용을 입력하세요...';
      if (selectedService === 'claude') return '요청사항을 자세히 설명하세요...';
      return '텍스트 생성 요청을 입력하세요...';
    }
    if (selectedService === 'runway') return '시네마틱한 장면을 구체적으로 설명하세요...';
    if (selectedService === 'veo') return '정밀한 비디오 설명을 입력하세요...';
    return '생성하고 싶은 영상을 설명하세요...';
  };

  const handleModelApply = (service: string, tier: string) => {
    setSelectedService(service);
    setSelectedTier(tier);
    const selectedSvc = services.find((s: any) => s.id === service);
    const selectedTierData = selectedSvc?.tiers.find((t: any) => t.id === tier);
    setAudioOn(selectedTierData?.audioSupported || false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setNotification({ type: 'error', message: '프롬프트를 입력해주세요.' });
      return;
    }

    if (!isLoggedIn) {
      onAuthClick('login');
      return;
    }
    
    if (insufficientBalance) {
      onShowUpgradeModal({
        type: 'credits',
        message: '크레딧이 부족합니다. 플랜을 업그레이드하거나 크레딧을 충전해주세요.'
      });
      return;
    }
    
    const jobId = `job_${Date.now()}`;
    const creditsToUse = estimatedCredits;
    
    setWallet((prev: any) => ({ ...prev, balance: prev.balance - creditsToUse }));
    addLedgerEntry({
      id: Date.now(),
      type: 'reserve',
      amount: creditsToUse,
      jobId,
      createdAt: new Date().toISOString(),
      providerId: selectedService,
      tierId: selectedTier
    });
    
    setIsGenerating(true);
    setRunningJobs((prev: number) => prev + 1);
    
    const payload = {
      prompt,
      serviceId: selectedService,
      tierId: selectedTier,
      duration,
      resolution,
      audioOn
    };

    if (isSupabaseConfigured) {
      try {
        if (!user?.id) {
          throw new Error('사용자 정보가 없습니다.');
        }

        const result = await generateAI({
          userId: user.id,
          prompt,
          service: selectedService,
          tier: selectedTier,
          options: {
            duration,
            resolution,
            audioOn,
            imageSize,
            imageStyle,
            imageCount,
            maxTokens,
            temperature,
            outputFormat
          }
        });

        if (!result?.success) {
          throw new Error(result?.message || '생성 실패');
        }

        await deductCredits(user.id, creditsToUse, `${selectedService} 생성`);
        addLedgerEntry({
          id: Date.now(),
          type: 'capture',
          amount: creditsToUse,
          jobId,
          createdAt: new Date().toISOString(),
          providerId: selectedService,
          tierId: selectedTier
        });

        const service = services.find((s: any) => s.id === selectedService);
        const tier = service?.tiers.find((t: any) => t.id === selectedTier);
        const evaluation = generatePracticeEvaluation(prompt, sessionId, currentCategory);
        const resultUrl = result?.result?.url || generateImage(prompt, sessionId);

        setResults(prev => [...prev, {
          id: result?.result?.id || Date.now(),
          service: service?.name,
          tier: tier?.name,
          prompt: prompt,
          thumbnail: resultUrl,
          timestamp: new Date().toLocaleString(),
          duration,
          resolution,
          creditsUsed: creditsToUse,
          evaluation
        }]);
        
        setNotification({ type: 'success', message: `생성 완료! ${creditsToUse} 크레딧 사용` });
      } catch (error: any) {
        setWallet((prev: any) => ({ ...prev, balance: prev.balance + creditsToUse }));
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
        console.error('Generate error:', error);
      } finally {
        setIsGenerating(false);
        setRunningJobs((prev: number) => Math.max(0, prev - 1));
        setPrompt('');
        setTimeout(() => setNotification(null), 3000);
      }
      return;
    }

    await apiReserveCredits('user_mock', creditsToUse);
    await apiGenerateJob(payload);
    
    setTimeout(async () => {
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
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
        
        const service = services.find((s: any) => s.id === selectedService);
        const tier = service?.tiers.find((t: any) => t.id === selectedTier);
        
        const evaluation = generatePracticeEvaluation(prompt, sessionId, currentCategory);
        
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
        await apiRefundCredits(jobId);
        setWallet((prev: any) => ({ ...prev, balance: prev.balance + creditsToUse }));
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
      setRunningJobs((prev: number) => Math.max(0, prev - 1));
      setPrompt('');
      
      setTimeout(() => setNotification(null), 3000);
    }, 2000);
  };

  useEffect(() => {
    if (notification && notificationRef.current) {
      notificationRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [notification]);

  return (
    <div className="h-screen bg-[#F9FAFB] pt-20 overflow-hidden">
      <div className="h-full max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 pb-6">
        <div className="h-full bg-white border border-[#E5E8EB] rounded-3xl shadow-sm overflow-hidden">
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

      {isInstructor && showScheduledNoticePanel && (
        <div className="fixed top-40 right-6 z-30 w-96 bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden">
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
          
          <div className="max-h-72 overflow-y-auto">
            {scheduledNotices.sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time)).map((notice: any) => {
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
                        onClick={() => setScheduledNotices(prev => prev.map((n: any) => 
                          n.id === notice.id ? { ...n, enabled: !n.enabled } : n
                        ))}
                        className={`p-1 transition-colors ${notice.enabled ? 'text-emerald-500' : 'text-neutral-300'}`}
                      >
                        {notice.enabled ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setScheduledNotices(prev => prev.filter((n: any) => n.id !== notice.id))}
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

      {isInstructor && editingNotice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 mx-4 shadow-xl">
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
                  setScheduledNotices(prev => prev.map((n: any) => 
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

      {isInstructor && showStudentPanel && (
        <div className="fixed top-40 right-6 z-30 w-80 bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden">
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

      {receivedBroadcast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
          <div className={`text-white rounded-3xl shadow-2xl p-4 max-w-md min-w-[320px] ${
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
        <div className="flex-[6] flex min-h-0">
          <div className="w-1/2 border-r border-[#E5E8EB] bg-[#F9FAFB] overflow-y-auto">
            <div className="p-5">
              <div className="bg-[#F2F4F6] rounded-2xl mb-4 aspect-video flex items-center justify-center border border-[#E5E8EB]">
                <Play className="w-14 h-14 text-neutral-400" />
              </div>

              <h2 className="text-lg font-semibold mb-2">{sessionId}회차: {currentSession.title}</h2>
              <p className="text-neutral-600 text-sm mb-4">{currentSession.summary}</p>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-3">
                <h3 className="text-sm font-medium text-amber-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  핵심 개념
                </h3>
                <div className="space-y-1">
                  {currentSession.concepts.map((c: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                      <span className="w-5 h-5 bg-amber-200 rounded text-amber-800 text-xs font-medium flex items-center justify-center">{i + 1}</span>
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              {currentSession.examples && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-sm font-medium text-neutral-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    예시 프롬프트
                  </h3>
                  <div className="space-y-1.5">
                    {currentSession.examples.map((ex: any, i: number) => (
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

          <div className="w-1/2 flex flex-col min-h-0">
            <div className="flex-shrink-0 bg-[#F9FAFB] p-4 border-b border-[#E5E8EB]">
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
                  {results.map((r: any) => (
                    <div key={r.id}>
                    <div className="space-y-2.5">
                      <div className="flex justify-end">
                        <div className="inline-block max-w-[80%] bg-indigo-500 text-white rounded-2xl rounded-tr-sm p-3 shadow-sm">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{r.prompt}</p>
                          <div className="flex items-center justify-end gap-2 mt-2 text-xs text-indigo-200">
                            <span>{r.service} · {r.tier}</span>
                            <span>{r.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      
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
                              {r.evaluation.feedbacks.map((fb: any, idx: number) => (
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
                                {r.evaluation.matchedKeywords.map((kw: any, idx: number) => (
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

        <div className="flex-[4] flex border-t border-[#E5E8EB] min-h-0">
          <div className="w-1/2 border-r border-[#E5E8EB] bg-[#F9FAFB] overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">생성 설정</h3>

              <div className="space-y-3">
                <ModelPicker
                  service={selectedService}
                  tier={selectedTier}
                  services={services}
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

            <div className="flex-shrink-0 p-4 pt-3 border-t border-[#E5E8EB] flex justify-end">
              <button
                onClick={() => setTutorOpen(true)}
                className="px-4 py-2 bg-[#F2F4F6] text-[#6B7684] font-medium rounded-lg text-sm hover:bg-[#E5E8EB] transition-colors flex items-center gap-2"
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
        services={services}
        selectedService={selectedService}
        selectedTier={selectedTier}
        onApply={handleModelApply}
        userPlan={userPlan}
        onShowUpgradeModal={onShowUpgradeModal}
      />

      <TutorDrawer isOpen={tutorOpen} onClose={() => setTutorOpen(false)} />
        </div>
      </div>
    </div>
  );
};

export default function SessionPage() {
  const params = useParams();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const sessionId = Number(rawId);
  const { isLoggedIn, user, viewMode, currentRole, wallet, userPlan, handleAuthClick, handleLogout, setCurrentPage, handleRoleSwitch, handleShowUpgradeModal, setWallet, addLedgerEntry, currentPage } = useAuth();

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
      <SessionPageContent
        sessionId={Number.isNaN(sessionId) ? 1 : sessionId}
        wallet={wallet}
        setWallet={setWallet}
        addLedgerEntry={addLedgerEntry}
        userPlan={userPlan}
        onShowUpgradeModal={handleShowUpgradeModal}
        user={user}
        currentRole={currentRole}
        isLoggedIn={isLoggedIn}
        onAuthClick={handleAuthClick}
      />
    </>
  );
}
