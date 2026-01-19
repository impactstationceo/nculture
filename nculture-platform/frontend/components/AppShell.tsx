'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';
import PlanModal from '@/components/PlanModal';

export default function AppShell({ children }: { children: ReactNode }) {
  const {
    showAuthModal,
    setShowAuthModal,
    authMode,
    handleLogin,
    showUpgradeModal,
    setShowUpgradeModal,
    upgradeReason,
    setUpgradeReason,
    userPlan,
    handlePlanUpgrade,
    clearPendingAction,
  } = useAuth();

  return (
    <>
      {children}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          clearPendingAction();
        }}
        initialMode={authMode}
        onLogin={handleLogin}
      />
      <PlanModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          setUpgradeReason(null);
        }}
        currentPlan={userPlan}
        onUpgrade={handlePlanUpgrade}
        triggerReason={upgradeReason}
      />
    </>
  );
}
