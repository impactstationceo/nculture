// supabase/functions/ai-generate/index.ts
// AI 영상/이미지 생성 Edge Function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateRequest {
  prompt: string;
  service: string;      // 'sora', 'veo', 'dalle', 'midjourney' 등
  tier: string;         // 'standard', 'pro', 'max' 등
  duration?: string;    // '5s', '10s' 등 (영상용)
  resolution?: string;  // '720p', '1080p', '4K'
  audioOn?: boolean;
  userId: string;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { prompt, service, tier, duration, resolution, audioOn, userId }: GenerateRequest = await req.json()

    // 1. 사용자 크레딧 확인
    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select('credits, plan')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      throw new Error('User not found')
    }

    // 2. 필요 크레딧 계산
    const requiredCredits = calculateCredits(service, tier, duration, resolution, audioOn)

    if (profile.credits < requiredCredits) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits', required: requiredCredits, available: profile.credits }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. AI 서비스 호출 (실제 구현 시 각 서비스 API 호출)
    let result;
    switch (service) {
      case 'sora':
        result = await callSoraAPI(prompt, tier, duration, resolution, audioOn);
        break;
      case 'veo':
        result = await callVeoAPI(prompt, tier, duration, resolution, audioOn);
        break;
      case 'dalle':
        result = await callDalleAPI(prompt, tier, resolution);
        break;
      case 'midjourney':
        result = await callMidjourneyAPI(prompt, tier, resolution);
        break;
      default:
        throw new Error(`Unsupported service: ${service}`);
    }

    // 4. 크레딧 차감
    await supabase
      .from('users_profile')
      .update({ credits: profile.credits - requiredCredits })
      .eq('id', userId)

    // 5. 사용 기록 저장
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: -requiredCredits,
        transaction_type: 'ai_usage',
        description: `${service} ${tier} - ${prompt.substring(0, 50)}...`,
        metadata: { service, tier, duration, resolution, audioOn }
      })

    // 6. 생성 결과 저장
    const { data: media } = await supabase
      .from('media_gallery')
      .insert({
        user_id: userId,
        type: service.includes('dalle') || service.includes('midjourney') || service.includes('flux') ? 'image' : 'video',
        title: `AI Generated - ${new Date().toISOString()}`,
        url: result.url,
        thumbnail_url: result.thumbnailUrl,
        prompt,
        ai_service: service,
        ai_tier: tier,
        metadata: { duration, resolution, audioOn, credits_used: requiredCredits }
      })
      .select()
      .single()

    return new Response(
      JSON.stringify({ 
        success: true, 
        result: {
          id: media?.id,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          creditsUsed: requiredCredits,
          remainingCredits: profile.credits - requiredCredits
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('AI Generate Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// 크레딧 계산 함수
function calculateCredits(
  service: string, 
  tier: string, 
  duration?: string, 
  resolution?: string, 
  audioOn?: boolean
): number {
  const baseCost = 2;
  const durationSec = duration ? parseInt(duration) : 5;
  const durationCost = durationSec * 1;
  
  let resolutionCost = 0;
  if (resolution === '4K') resolutionCost = 6;
  else if (resolution === '1080p') resolutionCost = 2;
  
  const audioCost = audioOn ? 2 : 0;
  
  // 티어별 배율
  const tierMultipliers: Record<string, number> = {
    'standard': 1.0,
    'lite': 0.8,
    'pro': 1.5,
    'max': 2.0,
    'hd': 1.5,
    'schnell': 0.5,
  };
  
  const multiplier = tierMultipliers[tier.toLowerCase()] || 1.0;
  return Math.ceil((baseCost + durationCost + resolutionCost + audioCost) * multiplier);
}

// AI 서비스 API 호출 함수들 (실제 구현 필요)
async function callSoraAPI(prompt: string, tier: string, duration?: string, resolution?: string, audioOn?: boolean) {
  // OpenAI Sora API 호출 (실제 API 키 필요)
  // const response = await fetch('https://api.openai.com/v1/sora/generate', { ... });
  
  // 데모: Mock 응답
  return {
    url: `https://example.com/generated/sora_${Date.now()}.mp4`,
    thumbnailUrl: `https://example.com/generated/sora_${Date.now()}_thumb.jpg`
  };
}

async function callVeoAPI(prompt: string, tier: string, duration?: string, resolution?: string, audioOn?: boolean) {
  // Google Veo API 호출
  return {
    url: `https://example.com/generated/veo_${Date.now()}.mp4`,
    thumbnailUrl: `https://example.com/generated/veo_${Date.now()}_thumb.jpg`
  };
}

async function callDalleAPI(prompt: string, tier: string, resolution?: string) {
  // OpenAI DALL-E API 호출
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  
  if (OPENAI_API_KEY) {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: resolution === 'hd' ? '1792x1024' : '1024x1024',
        quality: tier === 'hd' ? 'hd' : 'standard',
      }),
    });
    
    const data = await response.json();
    return {
      url: data.data[0].url,
      thumbnailUrl: data.data[0].url
    };
  }
  
  // 데모 응답
  return {
    url: `https://example.com/generated/dalle_${Date.now()}.png`,
    thumbnailUrl: `https://example.com/generated/dalle_${Date.now()}.png`
  };
}

async function callMidjourneyAPI(prompt: string, tier: string, resolution?: string) {
  // Midjourney API 호출 (별도 서비스 필요)
  return {
    url: `https://example.com/generated/mj_${Date.now()}.png`,
    thumbnailUrl: `https://example.com/generated/mj_${Date.now()}.png`
  };
}
