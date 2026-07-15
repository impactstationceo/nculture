'use client';

import { useState } from 'react';
import { ChevronDown, Check, Zap } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/data';

export default function Header({ currentPage, setCurrentPage, isLoggedIn, user, viewMode, currentRole, onAuthClick, onLogout, wallet, userPlan, onToggleRole, onRoleSwitch }: any) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  
  const getRoleConfig = () => {
    if (viewMode) {
      return { label: '👁️ ' + (viewMode === 'student' ? '수강생 미리보기' : viewMode === 'instructor' ? '교육자 미리보기' : '기관관리 미리보기'), color: 'bg-[#F2F4F6] border-[#E5E8EB] text-[#333D4B]' };
    }
    switch(user?.role) {
      case 'institution_admin':
        return { label: '🏢 기관 관리자', color: 'bg-[#E8F3FF] border-[#E8F3FF] text-[#3182F6]' };
      case 'instructor':
        return user?.status === 'pending' 
          ? { label: '⏳ 승인 대기', color: 'bg-[#F2F4F6] border-[#E5E8EB] text-[#FF9100]' }
          : { label: '👨‍🏫 교육자', color: 'bg-[#F2F4F6] border-[#E5E8EB] text-[#333D4B]' };
      default:
        return { label: '👨‍🎓 수강생', color: 'bg-[#E8F9EF] border-[#E8F9EF] text-[#00C853]' };
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
  <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 backdrop-blur border-b border-[#E5E8EB] shadow-sm">
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 h-full flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="cursor-pointer" onClick={() => setCurrentPage('main')}>
          <span className="text-xl tracking-tight font-bold text-[#191F28]">
            <span className="text-[#3182F6]">Coming</span>
            <span className="text-[#191F28]"> AI</span>
          </span>
        </div>
        <nav className="flex gap-6">
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
              className={`text-[15px] font-medium transition-colors ${
                currentPage === page.id ? 'text-[#191F28] font-semibold' : 'text-[#6B7684] hover:text-[#191F28]'
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
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[#E5E8EB] rounded-xl shadow-sm overflow-hidden z-50">
                <div className="p-2">
                  <div className="text-xs text-[#8B95A1] px-3 py-2">역할 전환</div>
                  {roleSwitchOptions.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onRoleSwitch && onRoleSwitch(option.id);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        option.active 
                          ? 'bg-[#E8F3FF] text-[#3182F6] font-medium' 
                          : 'text-[#333D4B] hover:bg-[#F2F4F6]'
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
            className="flex items-center gap-3 px-3 py-1.5 bg-[#F2F4F6] border border-[#E5E8EB] rounded-full hover:bg-[#E8F3FF] transition-colors group"
          >
            <div className="flex items-center gap-1.5 pr-3 border-r border-[#E5E8EB]">
              <div className="w-6 h-6 bg-[#3182F6] rounded-full flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-[#191F28]">{wallet?.balance?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                user?.role === 'institution_admin'
                  ? 'bg-gradient-to-br from-[#3182F6] to-[#1B64DA]'
                  : user?.role === 'instructor' 
                    ? 'bg-gradient-to-br from-[#6B7684] to-[#333D4B]' 
                    : 'bg-gradient-to-br from-[#00C853] to-[#009E45]'
              }`}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-[#191F28] leading-tight">{user?.name}</div>
                <div className="text-[11px] text-[#8B95A1] leading-tight">{PRICING_PLANS[userPlan]?.name || 'Free'}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-[#8B95A1] group-hover:text-[#333D4B] transition-colors" />
            </div>
          </button>
          <button 
            onClick={onLogout}
            className="px-3 py-1.5 text-sm text-[#6B7684] hover:text-[#191F28] hover:bg-[#F2F4F6] rounded-lg transition-colors"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <button 
          onClick={() => onAuthClick('login')}
          className="px-6 py-2.5 bg-[#3182F6] text-white text-sm font-semibold rounded-xl hover:bg-[#1B64DA] transition-colors"
        >
          시작하기
        </button>
      )}
    </div>
  </header>
  );
}
