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

    const planCredits: Record<string, number> = {
      'basic': 500,
      'pro': 2000,
      'max': 5000,
      'enterprise': 10000
    }

    const creditsToApply = credits ?? (planId ? planCredits[planId] || 0 : 0);

    // 2. 결제 기록 저장
    const { data: payment } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        amount,
        credits: creditsToApply,
        status: 'completed',
        provider: 'toss',
        provider_payment_key: paymentKey,
        provider_order_id: orderId,
        method: paymentData.method,
        card_company: paymentData.card?.company,
        receipt_url: paymentData.receipt?.url,
        metadata: paymentData,
        paid_at: paymentData.approvedAt || new Date().toISOString()
      })
      .select()
      .single()

    // 3. 플랜 결제인 경우 플랜 업그레이드
    if (planId) {
      const { data: profile } = await supabase
        .from('users_profile')
        .select('credits')
        .eq('id', userId)
        .single()

      const targetCredits = planCredits[planId] || 500
      const delta = targetCredits - (profile?.credits || 0)

      if (delta !== 0) {
        await supabase.rpc('apply_credit_transaction', {
          p_user_id: userId,
          p_amount: delta,
          p_tx_type: 'recharge',
          p_description: `${planId} 플랜 결제`,
          p_ref_type: 'payment',
          p_ref_id: payment?.id,
          p_metadata: { planId, amount }
        })
      }

      await supabase
        .from('users_profile')
        .update({
          plan: planId,
          monthly_credits_limit: targetCredits
        })
        .eq('id', userId)
    }

    // 4. 크레딧 충전인 경우 크레딧 추가
    if (credits) {
      await supabase.rpc('apply_credit_transaction', {
        p_user_id: userId,
        p_amount: credits,
        p_tx_type: 'recharge',
        p_description: `크레딧 ${credits}개 충전`,
        p_ref_type: 'payment',
        p_ref_id: payment?.id,
        p_metadata: { amount }
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
