'use client';

import { useParams } from 'next/navigation';
import AppV30InstitutionAdmin from '@/components/AppV30InstitutionAdmin';

export default function SessionPage() {
  const params = useParams();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const sessionId = Number(rawId);

  return (
    <AppV30InstitutionAdmin
      initialPage="session"
      initialSession={Number.isNaN(sessionId) ? 1 : sessionId}
    />
  );
}
