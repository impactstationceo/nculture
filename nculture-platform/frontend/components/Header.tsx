'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Check, Zap, Shield } from 'lucide-react';

interface HeaderProps {
  isLoggedIn: boolean;
  user: any;
  profile: any;
  wallet: { balance: number };
  onAuthClick: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
}

const PRICING_PLANS: Record<string, { name: string }> = {
  free: { name: 'Free' },
  basic: { name: 'Basic' },
  pro: { name: 'Pro' },
  max: { name: 'Max' },
  enterprise: { name: 'Enterprise' }
};

export default function Header({ isLoggedIn, user, profile, wallet, onAuthClick, onLogout }: HeaderProps) {
  const pathname = usePathname();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  
  const currentRole = profile?.role || 'student';
  const userPlan = profile?.plan || 'free';
  
  const getRoleConfig = () => {
    switch(currentRole) {
      case 'institution_admin':
        return { label: '🏢 기관 관리자', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' };
      case 'instructor':
        return profile?.status === 'pending' 
          ? { label: '⏳ 승인 대기', color: 'bg-amber-50 border-amber-200 text-amber-700' }
          : { label: '👨‍🏫 교육자', color: 'bg-violet-50 border-violet-200 text-violet-700' };
      default:
        return { label: '👨‍🎓 수강생', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' };
    }
  };
  
  const roleConfig = getRoleConfig();
  
  const navItems = [
    { href: '/curriculum', label: '클래스' },
    { href: '/live', label: '라이브' },
    { href: '/assessment', label: '테스트' },
    { href: '/media', label: '갤러리' },
    ...(currentRole === 'institution_admin' ? [{ href: '/institution', label: '기관 관리' }] : [])
  ];
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="cursor-pointer">
            <span className="text-xl tracking-tight">
              <span className="font-normal text-indigo-500">n</span>
              <span className="font-medium text-indigo-500">Culture</span>
            </span>
          </Link>
          <nav className="flex gap-8">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  pathname === item.href || pathname?.startsWith(item.href + '/') 
                    ? 'text-neutral-900 font-medium' 
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            {/* 역할 표시 */}
            <div className="relative">
              <button
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 ${roleConfig.color}`}
              >
                {roleConfig.label}
              </button>
            </div>
            
            {/* 프로필 버튼 */}
            <Link
              href="/mypage"
              className="flex items-center gap-3 px-3 py-1.5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-sm transition-all group"
            >
              {/* 크레딧 표시 */}
              <div className="flex items-center gap-1.5 pr-3 border-r border-neutral-200">
                <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-neutral-800">{wallet?.balance?.toLocaleString() || 0}</span>
              </div>
              {/* 프로필 */}
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                  currentRole === 'institution_admin'
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600'
                    : currentRole === 'instructor' 
                      ? 'bg-gradient-to-br from-violet-500 to-violet-600' 
                      : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                }`}>
                  {profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-neutral-800 leading-tight">{profile?.name || user?.email?.split('@')[0]}</div>
                  <div className="text-[10px] text-neutral-500 leading-tight">{PRICING_PLANS[userPlan]?.name || 'Free'}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
              </div>
            </Link>
            <button 
              onClick={onLogout}
              className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button 
            onClick={() => onAuthClick('login')}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            시작하기
          </button>
        )}
      </div>
    </header>
  );
}
