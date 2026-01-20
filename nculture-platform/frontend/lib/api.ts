import { supabase, isSupabaseConfigured } from './supabase';
import { AI_SERVICES, CURRICULUM, LIVE_CLASSES, createPlaceholder } from './data';

const mapCourseListItem = (course: any) => {
  const sessionsCount =
    course?.sessions?.[0]?.count ??
    course?.total_sessions ??
    course?.totalSessions ??
    course?.session_count ??
    0;

  return {
    ...course,
    id: course?.id,
    title: course?.title,
    description: course?.description,
    instructor: course?.instructor?.name || course?.instructor_name || course?.instructor || 'nCulture',
    totalSessions: sessionsCount,
    thumbnail: course?.thumbnail_url || course?.thumbnail || createPlaceholder('video', '#6366f1'),
    sessions: course?.sessions || []
  };
};

const mapCourseDetail = (course: any) => {
  const sessions = (course?.sessions || []).map((session: any, index: number) => ({
    ...session,
    id: session?.id ?? index + 1,
    title: session?.title || `세션 ${index + 1}`,
    summary: session?.summary || session?.description || '',
    concepts: session?.concepts || [],
    examples: session?.examples || []
  }));

  return {
    ...course,
    id: course?.id,
    title: course?.title,
    description: course?.description,
    instructor: course?.instructor?.name || course?.instructor_name || course?.instructor || 'nCulture',
    totalSessions: sessions.length,
    thumbnail: course?.thumbnail_url || course?.thumbnail || createPlaceholder('video', '#6366f1'),
    sessions
  };
};

// 클래스 목록 가져오기
export const getCourses = async () => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('courses')
      .select('*, instructor:users_profile(name), sessions:sessions(count)')
      .eq('status', 'published');
    if (error) throw error;
    return (data || []).map(mapCourseListItem);
  }
  return Object.values(CURRICULUM);
};

// 클래스 상세 가져오기
export const getCourse = async (id: string) => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('courses')
      .select('*, sessions:sessions(*), instructor:users_profile(name)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return mapCourseDetail(data);
  }
  return (CURRICULUM as any)[id];
};

// 라이브 클래스 목록
export const getLiveClasses = async () => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('live_classes')
      .select('*, host:users_profile(name)')
      .order('scheduled_at', { ascending: true });
    if (error) throw error;
    return (data || []).map((item: any) => ({
      ...item,
      id: item?.id,
      title: item?.title,
      instructor: item?.host?.name || item?.instructor || 'nCulture',
      status: item?.status || 'upcoming',
      participants: item?.participant_count || 0,
      thumbnail: item?.thumbnail_url || item?.thumbnail || createPlaceholder('live', '#dc2626'),
      startTime: item?.scheduled_at || '',
      duration: item?.duration_minutes ? `${item.duration_minutes}분` : item?.duration || ''
    }));
  }
  return LIVE_CLASSES;
};

// AI 서비스 목록
export const getAIServices = async () => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('ai_services')
      .select('*, tiers:ai_service_tiers(*)')
      .eq('is_active', true);
    if (error) throw error;
    return (data || []).map((service: any) => ({
      ...service,
      tiers: service?.tiers || []
    }));
  }
  return AI_SERVICES;
};

// 크레딧 차감
export const deductCredits = async (userId: string, amount: number, description: string) => {
  if (isSupabaseConfigured) {
    await supabase
      .rpc('apply_credit_transaction', {
        p_user_id: userId,
        p_amount: -amount,
        p_tx_type: 'usage',
        p_description: description,
        p_ref_type: 'ai_job'
      });
  }
};

// AI 생성 요청
export const generateAI = async (params: {
  userId: string;
  prompt: string;
  service: string;
  tier: string;
  options: any;
}) => {
  if (isSupabaseConfigured) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(params)
      }
    );
    return response.json();
  }
  await new Promise(resolve => setTimeout(resolve, 3000));
  return { success: true, result: { id: Date.now(), url: 'demo_url' } };
};

// 사용자 프로필 업데이트
export const updateProfile = async (userId: string, updates: any) => {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('users_profile')
      .update(updates)
      .eq('id', userId);
    if (error) throw error;
  }
};

// 플랜 업그레이드
export const upgradePlan = async (userId: string, plan: string) => {
  const planCredits: Record<string, number> = {
    free: 50,
    basic: 500,
    pro: 2000,
    max: 5000,
    enterprise: 10000
  };

  if (isSupabaseConfigured) {
    const targetCredits = planCredits[plan] ?? 50;
    const { data: profile } = await supabase
      .from('users_profile')
      .select('credits')
      .eq('id', userId)
      .single();

    const delta = targetCredits - (profile?.credits || 0);
    if (delta !== 0) {
      await supabase.rpc('apply_credit_transaction', {
        p_user_id: userId,
        p_amount: delta,
        p_tx_type: 'recharge',
        p_description: `${plan} 플랜 적용`,
        p_ref_type: 'plan'
      });
    }

    await supabase
      .from('users_profile')
      .update({ plan, monthly_credits_limit: targetCredits })
      .eq('id', userId);
  }
};

// 미디어 갤러리 가져오기
export const getMediaGallery = async (userId?: string) => {
  if (isSupabaseConfigured) {
    let query = supabase.from('media_gallery').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
  return [];
};

// 미디어 저장
export const saveMedia = async (media: {
  user_id: string;
  type: 'video' | 'image';
  title: string;
  url: string;
  prompt: string;
  ai_service: string;
}) => {
  if (isSupabaseConfigured) {
    const payload = {
      user_id: media.user_id,
      media_type: media.type,
      title: media.title,
      url: media.url,
      prompt: media.prompt,
      ai_service_id: media.ai_service
    };
    const { data, error } = await supabase
      .from('media_gallery')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  return { id: Date.now(), ...media };
};
