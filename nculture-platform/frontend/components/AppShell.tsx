'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';
import PlanModal from '@/components/PlanModal';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
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

  const legacyPages: string[] = [];
  const isLegacyRoute = legacyPages.some((prefix) => pathname.startsWith(prefix));

  return (
    <>
      {children}
      {!isLegacyRoute && (
        <>
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
      )}
    </>
  );
}
