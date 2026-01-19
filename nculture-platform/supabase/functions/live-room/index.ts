// supabase/functions/live-room/index.ts
// Daily.co 라이브 룸 생성/관리 Edge Function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY') || '';
const DAILY_API_URL = 'https://api.daily.co/v1';

interface RoomRequest {
  action: 'create' | 'join' | 'end';
  liveClassId: string;
  userId: string;
  isHost?: boolean;
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

    const { action, liveClassId, userId, isHost }: RoomRequest = await req.json()

    // 라이브 클래스 정보 조회
    const { data: liveClass, error: liveError } = await supabase
      .from('live_classes')
      .select('*, host:users_profile!host_id(name)')
      .eq('id', liveClassId)
      .single()

    if (liveError || !liveClass) {
      throw new Error('Live class not found')
    }

    switch (action) {
      case 'create': {
        // 호스트만 룸 생성 가능
        if (liveClass.host_id !== userId) {
          throw new Error('Only host can create room')
        }

        // Daily.co 룸 생성
        const roomResponse = await fetch(`${DAILY_API_URL}/rooms`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DAILY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `nculture-${liveClassId}`,
            privacy: 'public',
            properties: {
              enable_chat: true,
              enable_screenshare: true,
              max_participants: 100,
              exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60), // 4시간 후 만료
            }
          }),
        })

        const roomData = await roomResponse.json()

        // 호스트 토큰 생성
        const tokenResponse = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DAILY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: {
              room_name: roomData.name,
              is_owner: true,
              user_name: liveClass.host.name,
            }
          }),
        })

        const tokenData = await tokenResponse.json()

        // DB 업데이트
        await supabase
          .from('live_classes')
          .update({ 
            room_url: roomData.url,
            status: 'live',
            started_at: new Date().toISOString()
          })
          .eq('id', liveClassId)

        return new Response(
          JSON.stringify({ 
            roomUrl: roomData.url,
            token: tokenData.token,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'join': {
        if (!liveClass.room_url) {
          throw new Error('Room not started yet')
        }

        // 사용자 정보 조회
        const { data: user } = await supabase
          .from('users_profile')
          .select('name')
          .eq('id', userId)
          .single()

        // 참가자 토큰 생성
        const tokenResponse = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DAILY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: {
              room_name: `nculture-${liveClassId}`,
              is_owner: false,
              user_name: user?.name || 'Anonymous',
            }
          }),
        })

        const tokenData = await tokenResponse.json()

        // 참가자 수 증가
        await supabase
          .from('live_classes')
          .update({ participant_count: (liveClass.participant_count || 0) + 1 })
          .eq('id', liveClassId)

        // 참가 기록
        await supabase
          .from('live_class_participants')
          .upsert({
            live_class_id: liveClassId,
            user_id: userId,
            joined_at: new Date().toISOString()
          })

        return new Response(
          JSON.stringify({ 
            roomUrl: liveClass.room_url,
            token: tokenData.token,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'end': {
        // 호스트만 종료 가능
        if (liveClass.host_id !== userId) {
          throw new Error('Only host can end room')
        }

        // Daily.co 룸 삭제
        await fetch(`${DAILY_API_URL}/rooms/nculture-${liveClassId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${DAILY_API_KEY}`,
          },
        })

        // DB 업데이트
        await supabase
          .from('live_classes')
          .update({ 
            status: 'ended',
            ended_at: new Date().toISOString()
          })
          .eq('id', liveClassId)

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error('Invalid action')
    }

  } catch (error: any) {
    console.error('Live Room Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
