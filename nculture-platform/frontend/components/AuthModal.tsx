'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { auth, isSupabaseConfigured } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onLogin: (userData: any) => void;
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onLogin }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'student' | 'instructor' | null>(null);
  const [signupStep, setSignupStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setName('');
      setAgreeTerms(false);
      setSelectedRole(null);
      setSignupStep(1);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Supabase가 설정되어 있으면 실제 로그인 시도
      if (isSupabaseConfigured) {
        try {
          const result = await auth.signIn(email, password);
          if (result?.user) {
            // 실제 Supabase 로그인 성공
            const profile = await auth.getProfile();
            onLogin({
              id: result.user.id,
              email: result.user.email,
              name: profile?.name || result.user.email?.split('@')[0],
              role: profile?.role || 'student',
              status: profile?.status || 'approved',
              isSupabaseUser: true,
            });
            return;
          }
        } catch (supabaseError: any) {
          console.log('Supabase login failed, trying demo mode:', supabaseError.message);
          // Supabase 실패 시 데모 모드로 진행
        }
      }

      // 2. 데모 모드 (Supabase 미설정 또는 로그인 실패 시)
      const isTestInstructor = email.toLowerCase() === 'test@test.com';
      const isTestAdmin = email.toLowerCase() === 'admin@test.com';
      
      onLogin({ 
        id: `demo_${Date.now()}`,
        email, 
        name: email.split('@')[0],
        role: isTestAdmin ? 'institution_admin' : isTestInstructor ? 'instructor' : 'student',
        status: 'approved',
        isSupabaseUser: false,
      });
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !name || !agreeTerms) {
      setError('모든 필드를 입력하고 이용약관에 동의해주세요');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Supabase가 설정되어 있으면 실제 회원가입 시도
      if (isSupabaseConfigured) {
        try {
          const result = await auth.signUp(email, password, name);
          if (result?.user) {
            // 이메일 인증이 필요할 수 있음
            if (result.user.identities?.length === 0) {
              setError('이미 가입된 이메일입니다. 로그인해주세요.');
              return;
            }
            
            onLogin({
              id: result.user.id,
              email: result.user.email,
              name,
              role: selectedRole || 'student',
              status: selectedRole === 'instructor' ? 'pending' : 'approved',
              isSupabaseUser: true,
              needsEmailVerification: !result.session,
            });
            return;
          }
        } catch (supabaseError: any) {
          console.log('Supabase signup failed, using demo mode:', supabaseError.message);
          // 이미 가입된 이메일인 경우 명확히 표시
          if (supabaseError.message?.includes('already registered')) {
            setError('이미 가입된 이메일입니다. 로그인해주세요.');
            return;
          }
        }
      }

      // 2. 데모 모드
      onLogin({ 
        id: `demo_${Date.now()}`,
        email, 
        name,
        role: selectedRole || 'student',
        status: selectedRole === 'instructor' ? 'pending' : 'approved',
        isSupabaseUser: false,
      });
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 역할 선택 화면
  const renderRoleSelection = () => (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">어떤 목적으로 가입하시나요?</h3>
      <p className="text-sm text-neutral-500 mb-6">가입 후에도 설정에서 변경할 수 있습니다.</p>
      
      <div className="space-y-3">
        <button
          onClick={() => {
            setSelectedRole('student');
            setSignupStep(2);
          }}
          className="w-full p-4 border-2 border-neutral-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl group-hover:bg-emerald-200 transition-colors">
              👨‍🎓
            </div>
            <div>
              <div className="font-semibold text-neutral-900">수강생으로 가입</div>
              <div className="text-sm text-neutral-500">AI 클래스를 수강하고 실습하고 싶어요</div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => {
            setSelectedRole('instructor');
            setSignupStep(2);
          }}
          className="w-full p-4 border-2 border-neutral-200 rounded-xl hover:border-violet-400 hover:bg-violet-50 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-2xl group-hover:bg-violet-200 transition-colors">
              👨‍🏫
            </div>
            <div>
              <div className="font-semibold text-neutral-900">교육자로 가입</div>
              <div className="text-sm text-neutral-500">강의를 만들고 학생들을 관리하고 싶어요</div>
            </div>
          </div>
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <button
          onClick={() => setMode('login')}
          className="text-sm text-neutral-500 hover:text-neutral-700"
        >
          이미 계정이 있으신가요? <span className="text-indigo-600 font-medium">로그인</span>
        </button>
      </div>
    </div>
  );

  // 회원가입 폼
  const renderSignupForm = () => (
    <div className="p-6">
      <button
        onClick={() => setSignupStep(1)}
        className="mb-4 text-sm text-neutral-500 hover:text-neutral-700 flex items-center gap-1"
      >
        ← 역할 다시 선택
      </button>
      
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium mb-4 ${
        selectedRole === 'instructor' 
          ? 'bg-violet-50 text-violet-700' 
          : 'bg-emerald-50 text-emerald-700'
      }`}>
        {selectedRole === 'instructor' ? '👨‍🏫 교육자' : '👨‍🎓 수강생'}으로 가입
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="홍길동"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="hello@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="8자 이상"
            minLength={8}
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-5 h-5 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
          />
          <span className="text-sm text-neutral-600">
            <span className="text-indigo-600 hover:underline cursor-pointer">이용약관</span> 및{' '}
            <span className="text-indigo-600 hover:underline cursor-pointer">개인정보처리방침</span>에 동의합니다
          </span>
        </label>

        {selectedRole === 'instructor' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              ⚠️ 교육자 계정은 관리자 승인 후 이용 가능합니다.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSignup}
          disabled={loading || !email || !password || !name || !agreeTerms}
          className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '처리 중...' : '가입하기'}
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <button
          onClick={() => setMode('login')}
          className="text-sm text-neutral-500 hover:text-neutral-700"
        >
          이미 계정이 있으신가요? <span className="text-indigo-600 font-medium">로그인</span>
        </button>
      </div>
    </div>
  );

  // 로그인 폼
  const renderLoginForm = () => (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-6">로그인</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="hello@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setMode('signup');
            setSignupStep(1);
          }}
          className="text-sm text-neutral-500 hover:text-neutral-700"
        >
          계정이 없으신가요? <span className="text-indigo-600 font-medium">회원가입</span>
        </button>
      </div>

      {/* 테스트 계정 안내 */}
      <div className="mt-6 p-4 bg-neutral-50 rounded-xl">
        <p className="text-xs text-neutral-500 mb-2">🧪 테스트 계정 (데모 모드)</p>
        <div className="text-xs text-neutral-600 space-y-1">
          <p>• 기관관리자: admin@test.com / 아무 비밀번호</p>
          <p>• 교육자: test@test.com / 아무 비밀번호</p>
          <p>• 수강생: 아무 이메일 / 아무 비밀번호</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {mode === 'login' && renderLoginForm()}
        {mode === 'signup' && signupStep === 1 && renderRoleSelection()}
        {mode === 'signup' && signupStep === 2 && renderSignupForm()}
      </div>
    </div>
  );
}
