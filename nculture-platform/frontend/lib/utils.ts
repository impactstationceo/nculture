import { AI_SERVICES, PRICING_PLANS } from '@/lib/data';

// Duration 문자열 파싱 (예: "10s" -> 10)
export const parseDurationSec = (durationStr: string) => {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 5;
};

// Resolution에 따른 추가 비용 (내부 계산용, UI 노출 금지)
export const getResolutionFactor = (resolution: string) => {
  switch (resolution) {
    case '4K': return 6;
    case '1080p': return 2;
    case '720p': 
    default: return 0;
  }
};

// 크레딧 비용 계산 함수 (내부 계산식, UI에는 결과만 노출)
export const calculateCredits = (
  tierId: string,
  durationStr: string,
  resolution: string,
  audioOn: boolean,
  services: any[] = AI_SERVICES
) => {
  const baseCost = 2;
  const durationSec = parseDurationSec(durationStr);
  const durationCost = durationSec * 1;
  const resolutionCost = getResolutionFactor(resolution);
  const audioCost = audioOn ? 2 : 0;
  
  // 티어 찾기
  let tierMultiplier = 1.0;
  for (const service of services) {
    const tier = service.tiers.find((t: any) => t.id === tierId);
    if (tier) {
      tierMultiplier = tier.pricing?.multiplier || 1.0;
      break;
    }
  }
  
  const total = (baseCost + durationCost + resolutionCost + audioCost) * tierMultiplier;
  return Math.ceil(total);
};

// 티어 ID에서 레벨 추출
export const getTierLevel = (tierId: string) => {
  if (tierId.includes('max') || tierId.includes('ultra') || tierId.includes('opus') || tierId.includes('405b')) return 'max';
  if (tierId.includes('pro') || tierId.includes('hd') || tierId.includes('raw') || tierId.includes('large')) return 'pro';
  return 'standard';
};

// 플랜 제한 체크 함수
export const checkPlanLimits = (userPlan: string, selectedTierId: string, resolution: string, currentJobs = 0) => {
  const plan = PRICING_PLANS[userPlan] || PRICING_PLANS.free;
  const tierLevel = getTierLevel(selectedTierId);
  
  const issues: { type: string; message: string }[] = [];
  
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
export async function apiReserveCredits(userId: string, amount: number) {
  console.log(`[API Stub] Reserve credits: user=${userId}, amount=${amount}`);
  return { success: true, reservationId: `res_${Date.now()}` };
}

export async function apiGenerateJob(payload: any) {
  console.log(`[API Stub] Generate job:`, payload);
  return { success: true, jobId: `job_${Date.now()}` };
}

export async function apiPollJob(jobId: string) {
  console.log(`[API Stub] Poll job: ${jobId}`);
  return { status: 'completed', resultUrl: null };
}

export async function apiCaptureCredits(jobId: string) {
  console.log(`[API Stub] Capture credits for job: ${jobId}`);
  return { success: true };
}

export async function apiRefundCredits(jobId: string) {
  console.log(`[API Stub] Refund credits for job: ${jobId}`);
  return { success: true };
}

// 실습 평가 생성 함수 (Mock)
export const generatePracticeEvaluation = (prompt: string, sessionId: number, category = 'video') => {
  const sessionCriteria: Record<number, { focus: string; keywords: string[] }> = {
    1: { focus: '기본 프롬프트 구조', keywords: ['주체', '동작', '배경'] },
    2: { focus: '4요소 활용', keywords: ['주체', '행동', '공간', '분위기'] },
    3: { focus: '카메라 제어', keywords: ['클로즈업', '와이드', '앵글', '무브먼트', '달리', '팬', '틸트'] },
    4: { focus: '비주얼 스타일', keywords: ['시네마틱', '애니메이션', '리얼리스틱', '스타일'] },
    5: { focus: '장면 분할', keywords: ['씬', '장면', '전환', '연결'] },
    6: { focus: '동작 묘사', keywords: ['동작', '움직임', '속도', '연속'] },
  };

  const criteria = sessionCriteria[sessionId] || sessionCriteria[1];
  const promptLower = prompt.toLowerCase();
  
  let score = 60;
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  
  criteria.keywords.forEach(keyword => {
    if (promptLower.includes(keyword.toLowerCase())) {
      score += 8;
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });
  
  if (prompt.length > 50) score += 5;
  if (prompt.length > 100) score += 5;
  
  const elements = prompt.split(',').length;
  if (elements >= 3) score += 5;
  if (elements >= 5) score += 5;
  
  score = Math.min(100, score);
  
  let grade = 'D';
  let gradeColor = 'text-red-600 bg-red-50 border-red-200';
  let gradeLabel = '개선 필요';
  
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
  }

  const feedbacks: { type: string; text: string }[] = [];

  if (missingKeywords.length > 0 && missingKeywords.length <= 2) {
    feedbacks.push({
      type: 'tip',
      text: `다음 키워드를 추가해보세요: ${missingKeywords.join(', ')}`
    });
  } else if (missingKeywords.length > 2) {
    feedbacks.push({
      type: 'tip',
      text: '핵심 요소(주체, 행동, 배경 등)를 더 구체적으로 작성해보세요.'
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
