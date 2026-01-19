'use client';

import { useState } from 'react';
import { AlertCircle, Check, ChevronLeft, Shield, Users, Activity, Zap, X } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/data';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  onUpgrade: (planId: string, tier?: any) => void;
  triggerReason?: any;
}

export default function PlanModal({ isOpen, onClose, currentPlan, onUpgrade, triggerReason }: PlanModalProps) {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showEnterpriseTiers, setShowEnterpriseTiers] = useState(false);
  const [selectedEnterpriseTier, setSelectedEnterpriseTier] = useState<any>(null);
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
  
  const formatPrice = (price: any) => {
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

  const handleEnterpriseTierSelect = (tier: any) => {
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
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="px-6 py-5 border-b border-[#E5E8EB]">
          <div className="flex items-center justify-between">
            <div>
              {showEnterpriseTiers ? (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowEnterpriseTiers(false)}
                    className="p-1 hover:bg-[#F2F4F6] rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#6B7684]" />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-[#191F28]">Enterprise 플랜 선택</h2>
                    <p className="text-sm text-[#6B7684] mt-0.5">비즈니스 규모에 맞는 플랜을 선택하세요</p>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-[#191F28]">플랜 업그레이드</h2>
                  {triggerReason && (
                    <p className="text-sm text-[#FF9100] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {triggerReason.message}
                    </p>
                  )}
                </>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#F2F4F6] rounded-lg transition-colors">
              <X className="w-5 h-5 text-[#6B7684]" />
            </button>
          </div>
        </div>

        {/* 결제 주기 토글 */}
        <div className="px-6 py-4 bg-[#F9FAFB] border-b border-[#E5E8EB]">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingCycle === 'monthly' 
                  ? 'bg-[#3182F6] text-white'
                  : 'bg-white text-[#6B7684] border border-[#E5E8EB]'
              }`}
            >
              월간 결제
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingCycle === 'yearly' 
                  ? 'bg-[#3182F6] text-white' 
                  : 'bg-white text-[#6B7684] border border-[#E5E8EB]'
              }`}
            >
              연간 결제 <span className="text-xs ml-1 text-[#00C853]">20% 할인</span>
            </button>
          </div>
        </div>

        {/* 플랜 카드 그리드 */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-5 gap-3">
            {plans.map((planId) => {
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
                      ? 'border-[#E5E8EB] bg-[#F9FAFB]'
                      : isRecommended 
                        ? 'border-[#3182F6] ring-2 ring-[#E8F3FF]' 
                        : 'border-[#E5E8EB] hover:border-[#3182F6]'
                  }`}
                >
                  {isRecommended && !isEnterprise && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#3182F6] text-white text-xs font-medium rounded-full">
                      추천
                    </div>
                  )}
                  {isEnterprise && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#333D4B] text-white text-xs font-medium rounded-full">
                      기업용
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-[#191F28]">{plan.name}</h3>
                    <p className="text-xs mt-1 text-[#6B7684]">{plan.description}</p>
                  </div>
                  
                  <div className="text-center mb-4">
                    {isEnterprise ? (
                      <>
                        <div className="text-2xl font-bold text-[#191F28]">
                          {billingCycle === 'yearly' 
                            ? `₩${(2880000/10000).toFixed(0)}만~${(5760000/10000).toFixed(0)}만`
                            : `₩${(299000/10000).toFixed(0)}만~${(599000/10000).toFixed(0)}만`
                          }
                        </div>
                        <div className="text-xs text-[#6B7684]">
                          {billingCycle === 'yearly' ? '/ 년' : '/ 월'}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-[#191F28]">
                          {formatPrice(price)}
                        </div>
                        <div className="text-xs text-[#6B7684]">
                          {billingCycle === 'yearly' ? '/ 년' : '/ 월'}
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 flex-shrink-0 text-[#3182F6]" />
                      <span className="text-[#333D4B]">
                        월 {typeof plan.monthlyCredits === 'number' ? plan.monthlyCredits.toLocaleString() : plan.monthlyCredits}+ 크레딧
                      </span>
                    </div>
                    {plan.detailedFeatures?.slice(0, 4).map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        {feature.includes('불가') ? (
                          <X className="w-4 h-4 flex-shrink-0 text-[#8B95A1]" />
                        ) : (
                          <Check className="w-4 h-4 flex-shrink-0 text-[#00C853]" />
                        )}
                        <span className={feature.includes('불가') ? 'text-[#8B95A1]' : 'text-[#333D4B]'}>
                          {feature}
                        </span>
                      </div>
                    ))}
                    {isEnterprise && (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4 flex-shrink-0 text-[#3182F6]" />
                        <span className="text-[#3182F6]">전담 매니저 · 우선 지원</span>
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
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors mt-5 ${
                      isCurrentPlan 
                        ? 'bg-[#E5E8EB] text-[#8B95A1] cursor-not-allowed'
                        : isEnterprise || isRecommended
                          ? 'bg-[#3182F6] text-white hover:bg-[#1B64DA]'
                          : 'bg-[#F2F4F6] text-[#333D4B] hover:bg-[#E5E8EB]'
                    }`}
                  >
                    {isCurrentPlan ? '현재 플랜' : isEnterprise ? '플랜 선택하기 →' : '업그레이드'}
                  </button>
                </div>
              );
            })}
          </div>
          
          {/* 크레딧 소비 안내 */}
          <div className="mt-6 p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E8EB]">
            <h4 className="text-sm font-semibold text-[#191F28] mb-3">💡 크레딧 소비 안내</h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="font-medium text-[#333D4B] mb-1">📚 클래스</div>
                <div className="text-[#6B7684]">강의 수강: 1,500~3,000</div>
              </div>
              <div>
                <div className="font-medium text-[#333D4B] mb-1">🎬 라이브</div>
                <div className="text-[#6B7684]">참여: 800~1,500</div>
                <div className="text-[#6B7684]">다시보기: 600~1,200</div>
              </div>
              <div>
                <div className="font-medium text-[#333D4B] mb-1">🤖 AI 생성</div>
                <div className="text-[#6B7684]">영상: 15~80</div>
                <div className="text-[#6B7684]">이미지: 8~25</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise 티어 선택 오버레이 */}
      {showEnterpriseTiers && (
        <div className="absolute inset-0 bg-white rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#E5E8EB] bg-[#F9FAFB]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowEnterpriseTiers(false)}
                  className="p-2 hover:bg-[#F2F4F6] rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#6B7684]" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-[#191F28]">Enterprise 플랜 선택</h2>
                  <p className="text-sm text-[#6B7684] mt-0.5">비즈니스 규모에 맞는 플랜을 선택하세요</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[#F2F4F6] rounded-lg transition-colors">
                <X className="w-5 h-5 text-[#6B7684]" />
              </button>
            </div>
          </div>

          <div className="px-6 py-4 bg-[#F9FAFB] border-b border-[#E5E8EB]">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  billingCycle === 'monthly' 
                    ? 'bg-[#3182F6] text-white' 
                    : 'bg-white text-[#6B7684] border border-[#E5E8EB]'
                }`}
              >
                월간 결제
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  billingCycle === 'yearly' 
                    ? 'bg-[#3182F6] text-white' 
                    : 'bg-white text-[#6B7684] border border-[#E5E8EB]'
                }`}
              >
                연간 결제 <span className="text-xs ml-1 text-[#00C853]">20% 할인</span>
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-4 gap-4">
              {enterpriseTiers.map((tier: any) => {
                const price = billingCycle === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice;
                const isUnlimited = tier.id === 'enterprise-unlimited';
                
                return (
                  <div 
                    key={tier.id}
                    className={`relative border rounded-2xl p-5 transition-all flex flex-col h-full ${
                      tier.popular 
                        ? 'border-[#3182F6] ring-2 ring-[#E8F3FF] bg-white' 
                        : isUnlimited
                          ? 'border-[#FFE1B5] bg-[#FFF4E5]'
                          : 'border-[#E5E8EB] hover:border-[#3182F6] bg-white'
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#3182F6] text-white text-xs font-medium rounded-full">
                        추천
                      </div>
                    )}
                    {isUnlimited && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#FF9100] text-white text-xs font-medium rounded-full">
                        대기업
                      </div>
                    )}
                    
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-[#191F28]">{tier.name}</h3>
                      <p className="text-xs text-[#6B7684] mt-1 h-8">{tier.description}</p>
                    </div>
                    
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-[#191F28]">
                        {formatPrice(price)}
                      </div>
                      <div className="text-xs text-[#6B7684]">
                        {isUnlimited ? '맞춤 견적' : billingCycle === 'yearly' ? '/ 년' : '/ 월'}
                      </div>
                    </div>
                    
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className={`w-4 h-4 ${isUnlimited ? 'text-[#FF9100]' : 'text-[#3182F6]'}`} />
                        <span className={isUnlimited ? 'text-[#FF9100]' : 'text-[#333D4B]'}>
                          {tier.monthlyCredits ? `월 ✨ ${tier.monthlyCredits.toLocaleString()}` : '무제한 크레딧'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className={`w-4 h-4 ${isUnlimited ? 'text-[#FF9100]' : 'text-[#3182F6]'}`} />
                        <span className={isUnlimited ? 'text-[#FF9100]' : 'text-[#333D4B]'}>
                          팀 시트 {tier.teamSeats === 'unlimited' ? '무제한' : `${tier.teamSeats}석`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className={`w-4 h-4 ${isUnlimited ? 'text-[#FF9100]' : 'text-[#3182F6]'}`} />
                        <span className={isUnlimited ? 'text-[#FF9100]' : 'text-[#333D4B]'}>
                          동시생성 {tier.concurrentJobs === 'unlimited' ? '무제한' : `${tier.concurrentJobs}개`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className={`w-4 h-4 ${isUnlimited ? 'text-[#FF9100]' : 'text-[#3182F6]'}`} />
                        <span className={isUnlimited ? 'text-[#FF9100]' : 'text-[#333D4B]'}>SLA {tier.sla}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleEnterpriseTierSelect(tier)}
                      className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors mt-5 ${
                        isUnlimited
                          ? 'bg-[#FF9100] text-white hover:bg-[#F57C00]'
                          : tier.popular
                            ? 'bg-[#3182F6] text-white hover:bg-[#1B64DA]'
                            : 'bg-[#F2F4F6] text-[#333D4B] hover:bg-[#E5E8EB]'
                      }`}
                    >
                      {isUnlimited ? '견적 문의하기' : '이 플랜 선택'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 bg-[#F9FAFB] rounded-xl p-5 border border-[#E5E8EB]">
              <h4 className="font-semibold text-[#191F28] mb-3">모든 Enterprise 플랜 공통 혜택</h4>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-[#333D4B]">
                  <Check className="w-4 h-4 text-[#00C853]" />
                  전담 계정 매니저
                </div>
                <div className="flex items-center gap-2 text-[#333D4B]">
                  <Check className="w-4 h-4 text-[#00C853]" />
                  우선 기술 지원
                </div>
                <div className="flex items-center gap-2 text-[#333D4B]">
                  <Check className="w-4 h-4 text-[#00C853]" />
                  API 액세스
                </div>
                <div className="flex items-center gap-2 text-[#333D4B]">
                  <Check className="w-4 h-4 text-[#00C853]" />
                  맞춤형 교육 세션
                </div>
                <div className="flex items-center gap-2 text-[#333D4B]">
                  <Check className="w-4 h-4 text-[#00C853]" />
                  월간 사용량 리포트
                </div>
                <div className="flex items-center gap-2 text-[#333D4B]">
                  <Check className="w-4 h-4 text-[#00C853]" />
                  4K+ 해상도 지원
                </div>
                <div className="flex items-center gap-2 text-[#333D4B]">
                  <Check className="w-4 h-4 text-[#00C853]" />
                  모든 AI 모델 액세스
                </div>
                <div className="flex items-center gap-2 text-[#333D4B]">
                  <Check className="w-4 h-4 text-[#00C853]" />
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
          <div className="px-6 py-5 border-b border-[#E5E8EB] bg-[#F9FAFB]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowQuoteForm(false)}
                  className="p-2 hover:bg-[#F2F4F6] rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#6B7684]" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-[#191F28]">Enterprise Unlimited</h2>
                  <p className="text-sm text-[#6B7684] mt-0.5">맞춤 견적을 위한 정보를 입력해주세요</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[#F2F4F6] rounded-lg transition-colors">
                <X className="w-5 h-5 text-[#6B7684]" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {quoteStep === 'form' && (
              <>
                <div className="max-w-lg mx-auto space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#333D4B] mb-1.5">회사명 *</label>
                      <input
                        type="text"
                        value={quoteForm.companyName}
                        onChange={(e) => setQuoteForm({...quoteForm, companyName: e.target.value})}
                        placeholder="(주)회사이름"
                        className="w-full bg-[#F2F4F6] border-none rounded-xl py-3 px-4 text-[15px] text-[#191F28] placeholder-[#8B95A1] focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#333D4B] mb-1.5">담당자명 *</label>
                      <input
                        type="text"
                        value={quoteForm.contactName}
                        onChange={(e) => setQuoteForm({...quoteForm, contactName: e.target.value})}
                        placeholder="홍길동"
                        className="w-full bg-[#F2F4F6] border-none rounded-xl py-3 px-4 text-[15px] text-[#191F28] placeholder-[#8B95A1] focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#333D4B] mb-1.5">이메일 *</label>
                      <input
                        type="email"
                        value={quoteForm.email}
                        onChange={(e) => setQuoteForm({...quoteForm, email: e.target.value})}
                        placeholder="contact@company.com"
                        className="w-full bg-[#F2F4F6] border-none rounded-xl py-3 px-4 text-[15px] text-[#191F28] placeholder-[#8B95A1] focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#333D4B] mb-1.5">연락처 *</label>
                      <input
                        type="tel"
                        value={quoteForm.phone}
                        onChange={(e) => setQuoteForm({...quoteForm, phone: e.target.value})}
                        placeholder="010-1234-5678"
                        className="w-full bg-[#F2F4F6] border-none rounded-xl py-3 px-4 text-[15px] text-[#191F28] placeholder-[#8B95A1] focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#333D4B] mb-1.5">예상 사용 인원</label>
                      <select
                        value={quoteForm.teamSize}
                        onChange={(e) => setQuoteForm({...quoteForm, teamSize: e.target.value})}
                        className="w-full bg-[#F2F4F6] border-none rounded-xl py-3 px-4 text-[15px] text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition-all"
                      >
                        <option value="">선택해주세요</option>
                        <option value="100-200">100~200명</option>
                        <option value="200-500">200~500명</option>
                        <option value="500-1000">500~1,000명</option>
                        <option value="1000+">1,000명 이상</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#333D4B] mb-1.5">예상 월 사용량</label>
                      <select
                        value={quoteForm.expectedUsage}
                        onChange={(e) => setQuoteForm({...quoteForm, expectedUsage: e.target.value})}
                        className="w-full bg-[#F2F4F6] border-none rounded-xl py-3 px-4 text-[15px] text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition-all"
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
                    <label className="block text-sm font-medium text-[#333D4B] mb-1.5">추가 요청사항</label>
                    <textarea
                      value={quoteForm.message}
                      onChange={(e) => setQuoteForm({...quoteForm, message: e.target.value})}
                      placeholder="특별히 필요한 기능이나 요구사항이 있으시면 알려주세요"
                      rows={3}
                      className="w-full bg-[#F2F4F6] border-none rounded-xl py-3 px-4 text-[15px] text-[#191F28] placeholder-[#8B95A1] focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition-all resize-none"
                    />
                  </div>

                  <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E8EB]">
                    <h4 className="text-sm font-semibold text-[#191F28] mb-2">Unlimited 플랜 혜택</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-[#333D4B]">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#00C853]" />
                        무제한 크레딧
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#00C853]" />
                        무제한 팀 시트
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#00C853]" />
                        SLA 99.99% 보장
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#00C853]" />
                        전용 인프라 제공
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowQuoteForm(false)}
                      className="flex-1 py-3 bg-[#F2F4F6] text-[#333D4B] font-medium rounded-xl hover:bg-[#E5E8EB] transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleQuoteSubmit}
                      disabled={!quoteForm.companyName || !quoteForm.contactName || !quoteForm.email || !quoteForm.phone}
                      className="flex-1 py-3 bg-[#3182F6] text-white font-semibold rounded-xl hover:bg-[#1B64DA] transition-colors disabled:bg-[#E5E8EB] disabled:text-[#8B95A1] disabled:cursor-not-allowed"
                    >
                      견적 요청하기
                    </button>
                  </div>
                </div>
              </>
            )}

            {quoteStep === 'complete' && (
              <div className="max-w-md mx-auto text-center py-12">
                <div className="w-20 h-20 bg-[#E8F3FF] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-[#3182F6]" />
                </div>
                <h3 className="text-2xl font-bold text-[#191F28] mb-3">견적 요청 완료!</h3>
                <p className="text-[#6B7684] mb-8">
                  담당자가 확인 후 영업일 기준 1~2일 내에<br />
                  입력하신 연락처로 연락드리겠습니다.
                </p>
                <button
                  onClick={() => {
                    handleQuoteClose();
                    onClose();
                  }}
                  className="px-8 py-3 bg-[#3182F6] text-white font-semibold rounded-xl hover:bg-[#1B64DA] transition-colors"
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
}
