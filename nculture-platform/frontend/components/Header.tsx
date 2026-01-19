'use client';

import { useState } from 'react';
import { ChevronDown, Check, Zap } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/data';

export default function Header({ currentPage, setCurrentPage, isLoggedIn, user, viewMode, currentRole, onAuthClick, onLogout, wallet, userPlan, onToggleRole, onRoleSwitch }: any) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  
  const getRoleConfig = () => {
    if (viewMode) {
      return { label: '👁️ ' + (viewMode === 'student' ? '수강생 미리보기' : viewMode === 'instructor' ? '교육자 미리보기' : '기관관리 미리보기'), color: 'bg-neutral-100 border-neutral-300 text-neutral-700' };
    }
    switch(user?.role) {
      case 'institution_admin':
        return { label: '🏢 기관 관리자', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' };
      case 'instructor':
        return user?.status === 'pending' 
          ? { label: '⏳ 승인 대기', color: 'bg-amber-50 border-amber-200 text-amber-700' }
          : { label: '👨‍🏫 교육자', color: 'bg-violet-50 border-violet-200 text-violet-700' };
      default:
        return { label: '👨‍🎓 수강생', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' };
    }
  };
  
  const roleConfig = getRoleConfig();
  
  const getRoleSwitchOptions = () => {
    const options: { id: string | null; label: string; active: boolean }[] = [];
    const baseRole = user?.role;
    
    if (baseRole === 'institution_admin') {
      if (!viewMode) options.push({ id: null, label: '🏢 기관 관리', active: true });
      else options.push({ id: null, label: '🏢 기관 관리', active: false });
      
      options.push({ id: 'instructor', label: '👨‍🏫 교육자 모드', active: viewMode === 'instructor' });
      options.push({ id: 'student', label: '👨‍🎓 수강생 모드', active: viewMode === 'student' });
    } else if (baseRole === 'instructor' && user?.status === 'approved') {
      if (!viewMode) options.push({ id: null, label: '👨‍🏫 교육자', active: true });
      else options.push({ id: null, label: '👨‍🏫 교육자', active: false });
      
      options.push({ id: 'student', label: '👨‍🎓 수강생 모드', active: viewMode === 'student' });
    }
    
    return options;
  };
  
  const roleSwitchOptions = getRoleSwitchOptions();
  const canSwitchRole = roleSwitchOptions.length > 1;
  
  return (
  <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-100">
    <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
      <div className="flex items-center gap-10">
        <div className="cursor-pointer" onClick={() => setCurrentPage('main')}>
          <span className="text-xl tracking-tight">
            <span className="font-normal text-indigo-500">n</span>
            <span className="font-medium text-indigo-500">Culture</span>
          </span>
        </div>
        <nav className="flex gap-8">
          {[
            { id: 'curriculum', label: '클래스' },
            { id: 'live', label: '라이브' },
            { id: 'assessment', label: '테스트' },
            { id: 'media', label: '갤러리' },
            ...(user?.role === 'institution_admin' && !viewMode ? [{ id: 'institution', label: '기관 관리' }] : [])
          ].map(page => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              className={`text-sm transition-colors ${
                currentPage === page.id ? 'text-neutral-900 font-medium' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {page.label}
            </button>
          ))}
        </nav>
      </div>
      
      {isLoggedIn ? (
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => canSwitchRole && setShowRoleDropdown(!showRoleDropdown)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 ${roleConfig.color} ${canSwitchRole ? 'cursor-pointer hover:opacity-80' : ''}`}
            >
              {roleConfig.label}
              {canSwitchRole && <ChevronDown className="w-3 h-3" />}
            </button>
            
            {showRoleDropdown && canSwitchRole && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-50">
                <div className="p-2">
                  <div className="text-xs text-neutral-500 px-3 py-2">역할 전환</div>
                  {roleSwitchOptions.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onRoleSwitch && onRoleSwitch(option.id);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        option.active 
                          ? 'bg-indigo-50 text-indigo-700 font-medium' 
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {option.label}
                      {option.active && <Check className="w-4 h-4 inline ml-2" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setCurrentPage('mypage')}
            className="flex items-center gap-3 px-3 py-1.5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-1.5 pr-3 border-r border-neutral-200">
              <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-neutral-800">{wallet?.balance?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                user?.role === 'institution_admin'
                  ? 'bg-gradient-to-br from-indigo-500 to-indigo-600'
                  : user?.role === 'instructor' 
                    ? 'bg-gradient-to-br from-violet-500 to-violet-600' 
                    : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              }`}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-neutral-800 leading-tight">{user?.name}</div>
                <div className="text-[10px] text-neutral-500 leading-tight">{PRICING_PLANS[userPlan]?.name || 'Free'}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
            </div>
          </button>
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
