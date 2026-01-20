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
  tier: string;         // 서비스 티어 ID
  duration?: string;    // '5s', '10s' 등 (영상용)
  resolution?: string;  // '720p', '1080p', '4K'
  audioOn?: boolean;
  options?: Record<string, unknown>;
  userId: string;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let jobId: string | null = null;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body: GenerateRequest = await req.json()
    const prompt = body.prompt
    const service = body.service
    const tier = body.tier
    const duration = body.duration ?? (body.options as any)?.duration
    const resolution = body.resolution ?? (body.options as any)?.resolution
    const audioOn = body.audioOn ?? (body.options as any)?.audioOn
    const userId = body.userId

    // 1. 사용자 크레딧 확인
    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select('credits, plan')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      throw new Error('User not found')
    }

    // 2. 필요 크레딧 계산 (티어 기준)
    const { data: tierRow, error: tierError } = await supabase
      .from('ai_service_tiers')
      .select('pricing_base, pricing_multiplier')
      .eq('id', tier)
      .single()

    if (tierError || !tierRow) {
      throw new Error('Tier not found')
    }

    const requiredCredits = calculateCredits(service, tierRow.pricing_base, tierRow.pricing_multiplier, duration, resolution, audioOn)

    const { data: availableCredits } = await supabase
      .rpc('get_available_credits', { p_user_id: userId })

    if ((availableCredits ?? profile.credits) < requiredCredits) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits', required: requiredCredits, available: availableCredits ?? profile.credits }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. 작업 기록 생성
    const { data: job, error: jobError } = await supabase
      .from('ai_jobs')
      .insert({
        user_id: userId,
        job_type: service.includes('dalle') || service.includes('midjourney') || service.includes('flux') ? 'image' : 'video',
        status: 'running',
        provider: service,
        model: tier,
        prompt,
        input_params: { duration, resolution, audioOn }
      })
      .select()
      .single()

    if (jobError || !job) {
      throw new Error('Failed to create job')
    }
    jobId = job.id;

    // 4. AI 서비스 호출
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

    // 5. 크레딧 차감 (ledger)
    await supabase.rpc('apply_credit_transaction', {
      p_user_id: userId,
      p_amount: -requiredCredits,
      p_tx_type: 'usage',
      p_description: `${service} ${tier} - ${prompt.substring(0, 50)}...`,
      p_ref_type: 'ai_job',
      p_ref_id: job.id,
      p_metadata: { service, tier, duration, resolution, audioOn }
    })

    // 6. 작업 업데이트
    await supabase
      .from('ai_jobs')
      .update({
        status: 'completed',
        output_url: result.url,
        output_metadata: { thumbnailUrl: result.thumbnailUrl },
        credits_used: requiredCredits,
        completed_at: new Date().toISOString()
      })
      .eq('id', job.id)

    // 7. 생성 결과 저장
    const { data: media } = await supabase
      .from('media_gallery')
      .insert({
        user_id: userId,
        media_type: service.includes('dalle') || service.includes('midjourney') || service.includes('flux') ? 'image' : 'video',
        title: `AI Generated - ${new Date().toISOString()}`,
        url: result.url,
        thumbnail_url: result.thumbnailUrl,
        prompt,
        ai_service_id: service,
        ai_tier_id: tier,
        metadata: { duration, resolution, audioOn, credits_used: requiredCredits, ai_job_id: job.id }
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
    if (jobId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      await supabase
        .from('ai_jobs')
        .update({ status: 'failed', error_message: error?.message })
        .eq('id', jobId);
    }
    console.error('AI Generate Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// 크레딧 계산 함수 (티어 기본값 기반)
function calculateCredits(
  service: string, 
  base: number,
  multiplier: number,
  duration?: string, 
  resolution?: string, 
  audioOn?: boolean
): number {
  const durationSec = duration ? parseInt(duration) : 5;
  const durationCost = Math.ceil(durationSec / 5);
  
  let resolutionCost = 0;
  if (resolution === '4K') resolutionCost = 6;
  else if (resolution === '1080p') resolutionCost = 2;
  
  const audioCost = audioOn ? 2 : 0;
  
  return Math.ceil((base + durationCost + resolutionCost + audioCost) * multiplier);
}

// AI 서비스 API 호출 함수들 (실제 구현 필요)
async function callSoraAPI(prompt: string, tier: string, duration?: string, resolution?: string, audioOn?: boolean) {
  const SORA_API_URL = Deno.env.get('SORA_API_URL') || '';
  const SORA_API_KEY = Deno.env.get('SORA_API_KEY') || '';
  if (!SORA_API_URL || !SORA_API_KEY) {
    throw new Error('SORA_API_URL/SORA_API_KEY not configured');
  }

  const response = await fetch(SORA_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SORA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, tier, duration, resolution, audioOn }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.message || 'Sora API failed');
  }

  const data = await response.json();
  return {
    url: data.url,
    thumbnailUrl: data.thumbnailUrl || data.thumbnail_url || data.url,
  };
}

async function callVeoAPI(prompt: string, tier: string, duration?: string, resolution?: string, audioOn?: boolean) {
  const VEO_API_URL = Deno.env.get('VEO_API_URL') || '';
  const VEO_API_KEY = Deno.env.get('VEO_API_KEY') || '';
  if (!VEO_API_URL || !VEO_API_KEY) {
    throw new Error('VEO_API_URL/VEO_API_KEY not configured');
  }

  const response = await fetch(VEO_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VEO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, tier, duration, resolution, audioOn }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.message || 'Veo API failed');
  }

  const data = await response.json();
  return {
    url: data.url,
    thumbnailUrl: data.thumbnailUrl || data.thumbnail_url || data.url,
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
  const MJ_API_URL = Deno.env.get('MIDJOURNEY_API_URL') || '';
  const MJ_API_KEY = Deno.env.get('MIDJOURNEY_API_KEY') || '';
  if (!MJ_API_URL || !MJ_API_KEY) {
    throw new Error('MIDJOURNEY_API_URL/MIDJOURNEY_API_KEY not configured');
  }

  const response = await fetch(MJ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MJ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, tier, resolution }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.message || 'Midjourney API failed');
  }

  const data = await response.json();
  return {
    url: data.url,
    thumbnailUrl: data.thumbnailUrl || data.thumbnail_url || data.url,
  };
}
