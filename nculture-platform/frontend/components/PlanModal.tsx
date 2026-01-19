'use client';

import { useState } from 'react';
import { X, Check, Zap, Crown } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 50,
    features: [
      '월 50 크레딧',
      '기본 AI 모델 접근',
      '720p 영상 생성',
      '커뮤니티 지원',
    ],
    popular: false,
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 15000,
    credits: 500,
    features: [
      '월 500 크레딧',
      '모든 AI 모델 접근',
      '1080p 영상 생성',
      '라이브 클래스 참여',
      '이메일 지원',
    ],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 45000,
    credits: 2000,
    features: [
      '월 2,000 크레딧',
      '프리미엄 AI 모델',
      '4K 영상 생성',
      '오디오 생성 포함',
      '1:1 컨설팅 (월 1회)',
      '우선 지원',
    ],
    popular: true,
  },
  {
    id: 'max',
    name: 'Max',
    price: 99000,
    credits: 5000,
    features: [
      '월 5,000 크레딧',
      '전체 AI 모델 무제한',
      '8K 영상 생성',
      '커스텀 모델 학습',
      '전담 매니저',
      '24/7 프리미엄 지원',
    ],
    popular: false,
  },
];

export default function PlanModal({ isOpen, onClose }: PlanModalProps) {
  const { user, updatePlan } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(user?.plan || 'free');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleUpgrade = async () => {
    if (selectedPlan === user?.plan) {
      onClose();
      return;
    }

    setIsProcessing(true);
    
    // 실제로는 결제 프로세스 진행
    // 데모에서는 바로 플랜 변경
    setTimeout(() => {
      updatePlan(selectedPlan);
      setIsProcessing(false);
      onClose();
      alert(`${PLANS.find(p => p.id === selectedPlan)?.name} 플랜으로 변경되었습니다!`);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">요금제 선택</h2>
            <p className="text-sm text-neutral-500">더 많은 크레딧과 기능을 이용해보세요</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* 플랜 목록 */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => handleSelectPlan(plan.id)}
                className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                } ${plan.popular ? 'ring-2 ring-indigo-200' : ''}`}
              >
                {/* 인기 뱃지 */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      인기
                    </span>
                  </div>
                )}

                {/* 현재 플랜 표시 */}
                {user?.plan === plan.id && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      현재 플랜
                    </span>
                  </div>
                )}

                {/* 선택 체크 */}
                {selectedPlan === plan.id && (
                  <div className="absolute top-3 left-3">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-neutral-900">{plan.name}</h3>
                  
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-neutral-900">
                      {plan.price === 0 ? '무료' : `₩${plan.price.toLocaleString()}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm text-neutral-500">/월</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-2 text-sm text-amber-600">
                    <Zap className="w-4 h-4" />
                    <span>월 {plan.credits.toLocaleString()} 크레딧</span>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* 하단 버튼 */}
          <div className="mt-8 flex items-center justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleUpgrade}
              disabled={isProcessing || selectedPlan === user?.plan}
              className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isProcessing ? (
                '처리 중...'
              ) : selectedPlan === user?.plan ? (
                '현재 플랜입니다'
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  {PLANS.find(p => p.id === selectedPlan)?.price === 0 ? '시작하기' : '업그레이드'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
