import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase 클라이언트 생성 (환경변수 없으면 더미 클라이언트)
let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('⚠️ Supabase 환경변수가 설정되지 않았습니다. 데모 모드로 실행됩니다.');
  // 더미 클라이언트 - 실제 호출 시 null 반환
  supabase = {
    auth: {
      signUp: async () => ({ data: null, error: new Error('Demo mode') }),
      signInWithPassword: async () => ({ data: null, error: new Error('Demo mode') }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), order: () => ({ limit: async () => ({ data: [], error: null }) }) }), order: async () => ({ data: [], error: null }) }),
      insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }) }),
    }),
    rpc: async () => ({ data: 0, error: null }),
  } as any;
}

export { supabase };
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// ============================================
// Auth Helpers
// ============================================

export const auth = {
  async signUp(email: string, password: string, name?: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('SignUp error:', error);
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('SignIn error:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('SignOut error:', error);
      // 로그아웃은 에러가 있어도 계속 진행
    }
  },

  async getUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('GetUser error:', error);
      return null;
    }
  },

  async getProfile() {
    try {
      const user = await this.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('users_profile')
        .select('*, institution:institutions(name)')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('GetProfile error:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('GetProfile error:', error);
      return null;
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ============================================
// Credits API
// ============================================

export const credits = {
  async getBalance(userId: string) {
    const { data, error } = await supabase.rpc('get_credit_balance', {
      p_user_id: userId,
    });
    if (error) throw error;
    return data || 0;
  },

  async getAvailable(userId: string) {
    const { data, error } = await supabase.rpc('get_available_credits', {
      p_user_id: userId,
    });
    if (error) throw error;
    return data || 0;
  },

  async getHistory(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('credit_ledger')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};

// ============================================
// Courses API
// ============================================

export const courses = {
  async getAll() {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:users_profile!instructor_id(name, avatar_url),
        sessions(count)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:users_profile!instructor_id(name, avatar_url, bio),
        sessions(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getEnrollments(userId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses(
          *,
          instructor:users_profile!instructor_id(name)
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  },

  async enroll(userId: string, courseId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .insert({ user_id: userId, course_id: courseId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================
// AI Services API
// ============================================

export const aiServices = {
  async getAll() {
    const { data, error } = await supabase
      .from('ai_services')
      .select(`
        *,
        tiers:ai_service_tiers(*)
      `)
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  },

  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from('ai_services')
      .select(`
        *,
        tiers:ai_service_tiers(*)
      `)
      .eq('category', category)
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  },
};

// ============================================
// Live Classes API
// ============================================

export const liveClasses = {
  async getUpcoming() {
    const { data, error } = await supabase
      .from('live_classes')
      .select(`
        *,
        host:users_profile!host_id(name, avatar_url)
      `)
      .in('status', ['scheduled', 'live'])
      .order('scheduled_at');

    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('live_classes')
      .select(`
        *,
        host:users_profile!host_id(name, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================
// Institution API
// ============================================

export const institution = {
  async getByAdmin(adminId: string) {
    const { data: profile } = await supabase
      .from('users_profile')
      .select('institution_id')
      .eq('id', adminId)
      .single();

    if (!profile?.institution_id) return null;

    const { data, error } = await supabase
      .from('institutions')
      .select(`
        *,
        credits:institution_credits(*)
      `)
      .eq('id', profile.institution_id)
      .single();

    if (error) throw error;
    return data;
  },

  async getMembers(institutionId: string) {
    const { data, error } = await supabase
      .from('users_profile')
      .select(`
        *,
        allocation:member_credit_allocations(*)
      `)
      .eq('institution_id', institutionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getInstructors(institutionId: string) {
    const { data, error } = await supabase
      .from('users_profile')
      .select(`
        *,
        allocation:member_credit_allocations(*),
        courses(count)
      `)
      .eq('institution_id', institutionId)
      .eq('role', 'instructor')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getStudents(institutionId: string) {
    const { data, error } = await supabase
      .from('users_profile')
      .select(`
        *,
        allocation:member_credit_allocations(*),
        enrollments(count)
      `)
      .eq('institution_id', institutionId)
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getCourses(institutionId: string) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:users_profile!instructor_id(name),
        enrollments(count)
      `)
      .eq('institution_id', institutionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

// ============================================
// Media Gallery API
// ============================================

export const media = {
  async getUserMedia(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('media_gallery')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getPublicMedia(limit = 20) {
    const { data, error } = await supabase
      .from('media_gallery')
      .select(`
        *,
        user:users_profile(name, avatar_url)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async save(mediaData: {
    user_id: string;
    media_type: string;
    title?: string;
    prompt?: string;
    ai_service_id?: string;
    url: string;
    thumbnail_url?: string;
    is_public?: boolean;
  }) {
    const { data, error } = await supabase
      .from('media_gallery')
      .insert(mediaData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================
// Assessments API
// ============================================

export const assessments = {
  async getAll() {
    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        course:courses(title),
        session:sessions(title)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getSubmission(assessmentId: string, userId: string) {
    const { data, error } = await supabase
      .from('assessment_submissions')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async startSubmission(assessmentId: string, userId: string) {
    const { data, error } = await supabase
      .from('assessment_submissions')
      .insert({
        assessment_id: assessmentId,
        user_id: userId,
        status: 'in_progress',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async submitAssessment(submissionId: string, content: any) {
    const { data, error } = await supabase
      .from('assessment_submissions')
      .update({
        status: 'submitted',
        content,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default {
  supabase,
  auth,
  credits,
  courses,
  aiServices,
  liveClasses,
  institution,
  media,
  assessments,
};
