// supabase/functions/payment/index.ts
// Toss Payments 결제 처리 Edge Function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TOSS_SECRET_KEY = Deno.env.get('TOSS_SECRET_KEY') || '';
const TOSS_API_URL = 'https://api.tosspayments.com/v1/payments';

interface PaymentRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
  userId: string;
  planId?: string;   // 플랜 결제인 경우
  credits?: number;  // 크레딧 충전인 경우
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { paymentKey, orderId, amount, userId, planId, credits }: PaymentRequest = await req.json()

    // 1. Toss Payments 결제 승인
    const tossResponse = await fetch(`${TOSS_API_URL}/${paymentKey}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(TOSS_SECRET_KEY + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        amount,
      }),
    })

    if (!tossResponse.ok) {
      const errorData = await tossResponse.json()
      throw new Error(errorData.message || 'Payment confirmation failed')
    }

    const paymentData = await tossResponse.json()

    // 2. 결제 기록 저장
    await supabase
      .from('payments')
      .insert({
        user_id: userId,
        payment_key: paymentKey,
        order_id: orderId,
        amount,
        status: 'completed',
        payment_method: paymentData.method,
        metadata: paymentData
      })

    // 3. 플랜 결제인 경우 플랜 업그레이드
    if (planId) {
      const planCredits: Record<string, number> = {
        'basic': 500,
        'pro': 2000,
        'max': 5000,
        'enterprise': 10000
      }

      await supabase
        .from('users_profile')
        .update({ 
          plan: planId,
          credits: planCredits[planId] || 500,
          monthly_credits_limit: planCredits[planId] || 500
        })
        .eq('id', userId)

      // 플랜 결제 기록
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: planCredits[planId] || 500,
          transaction_type: 'plan_purchase',
          description: `${planId} 플랜 결제`,
          metadata: { planId, amount }
        })
    }

    // 4. 크레딧 충전인 경우 크레딧 추가
    if (credits) {
      const { data: profile } = await supabase
        .from('users_profile')
        .select('credits')
        .eq('id', userId)
        .single()

      await supabase
        .from('users_profile')
        .update({ credits: (profile?.credits || 0) + credits })
        .eq('id', userId)

      await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: credits,
          transaction_type: 'purchase',
          description: `크레딧 ${credits}개 충전`,
          metadata: { amount }
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        orderId: paymentData.orderId,
        status: paymentData.status
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Payment Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
