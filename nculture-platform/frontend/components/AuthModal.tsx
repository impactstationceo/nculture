'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'institution_login' | 'institution_signup';
  onLogin: (userData: any) => Promise<void> | void;
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onLogin }: AuthModalProps) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  
  const [selectedRole, setSelectedRole] = useState<null | 'student' | 'instructor'>(null);
  const [signupStep, setSignupStep] = useState(1);
  const [authMethod, setAuthMethod] = useState<null | 'email' | 'code' | 'none'>(null);
  const [institutionEmail, setInstitutionEmail] = useState('');
  const [institutionCode, setInstitutionCode] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  
  const [instRegStep, setInstRegStep] = useState(1);
  const [instRegData, setInstRegData] = useState({
    institutionName: '',
    businessNumber: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    expectedUsers: '',
    purpose: ''
  });

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('nculture_saved_email');
      const savedRemember = localStorage.getItem('nculture_remember_email');
      if (savedEmail && savedRemember === 'true') {
        setEmail(savedEmail);
        setRememberEmail(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    setMode(initialMode);
    if (initialMode === 'institution_login' || initialMode === 'institution_signup') {
      setInstRegStep(1);
    }
  }, [initialMode]);

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setName('');
      setAgreeTerms(false);
      setSelectedRole(null);
      setSignupStep(1);
      setAuthMethod(null);
      setInstitutionEmail('');
      setInstitutionCode('');
      setInstitutionName('');
      setInstRegStep(1);
      setInstRegData({
        institutionName: '',
        businessNumber: '',
        adminName: '',
        adminEmail: '',
        adminPhone: '',
        expectedUsers: '',
        purpose: ''
      });
      if (!rememberEmail) {
        setEmail('');
      }
    }
  }, [isOpen, rememberEmail]);

  if (!isOpen) return null;

  const isInstitutionMode = mode === 'institution_login' || mode === 'institution_signup';

  const handleSaveEmail = (shouldSave: boolean, emailValue: string) => {
    try {
      if (shouldSave && emailValue) {
        localStorage.setItem('nculture_saved_email', emailValue);
        localStorage.setItem('nculture_remember_email', 'true');
      } else {
        localStorage.removeItem('nculture_saved_email');
        localStorage.removeItem('nculture_remember_email');
      }
    } catch (e) {
      // ignore
    }
  };

  const isInstitutionEmail = (emailValue: string) => {
    const institutionDomains = ['ac.kr', 'edu', 'edu.kr', 'school.kr', 'university.edu'];
    return institutionDomains.some(domain => emailValue.toLowerCase().endsWith(domain));
  };

  const isValidInstitutionCode = (code: string) => {
    return code.startsWith('NC-') || code.startsWith('EDU-');
  };

  const determineApprovalStatus = () => {
    if (selectedRole === 'student') return 'approved';
    if (authMethod === 'email' && isInstitutionEmail(institutionEmail)) return 'approved';
    if (authMethod === 'code' && isValidInstitutionCode(institutionCode)) return 'approved';
    return 'pending';
  };

  const handleLogin = async () => {
    if (mode === 'login') {
      if (email && password) {
        handleSaveEmail(rememberEmail, email);
        const isTestInstructor = email.toLowerCase() === 'test@test.com';
        await onLogin({ 
          action: 'login',
          email, 
          password,
          name: email.split('@')[0],
          role: isTestInstructor ? 'instructor' : 'student',
          status: 'approved'
        });
      }
    } else if (mode === 'institution_login') {
      if (email && password) {
        handleSaveEmail(rememberEmail, email);
        await onLogin({ 
          action: 'login',
          email, 
          password,
          name: email.split('@')[0],
          role: 'institution_admin',
          status: 'approved',
          institutionId: 'inst_001'
        });
      }
    } else {
      if (email && password && name && agreeTerms) {
        const status = determineApprovalStatus();
        await onLogin({ 
          action: 'signup',
          email, 
          password,
          name,
          role: selectedRole,
          status,
          institution: institutionName || null
        });
      }
    }
  };
  
  const handleInstitutionRegister = () => {
    setInstRegStep(2);
  };

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

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          가입하기
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

        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            checked={rememberEmail}
            onChange={(e) => setRememberEmail(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
          />
          아이디 저장
        </label>

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          로그인
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
