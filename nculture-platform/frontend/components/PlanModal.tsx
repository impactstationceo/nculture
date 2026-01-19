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
                        <div className="text-3xl font-bold text-neutral-900">
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
                    {plan.detailedFeatures?.slice(0, 4).map((feature: string, idx: number) => (
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
                    
                    <div className="text-center mb-4">
                      <h3 className={`text-lg font-bold ${isUnlimited ? 'text-amber-900' : 'text-violet-900'}`}>{tier.name}</h3>
                      <p className="text-xs text-violet-600 mt-1 h-8">{tier.description}</p>
                    </div>
                    
                    <div className="text-center mb-4">
                      <div className={`text-3xl font-bold ${isUnlimited ? 'text-amber-900' : 'text-violet-900'}`}>
                        {formatPrice(price)}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {isUnlimited ? '맞춤 견적' : billingCycle === 'yearly' ? '/ 년' : '/ 월'}
                      </div>
                    </div>
                    
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
}
