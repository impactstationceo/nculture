'use client';

import { useParams } from 'next/navigation';
import AppV30InstitutionAdmin from '@/components/AppV30InstitutionAdmin';

export default function LiveRoomPage() {
  const params = useParams();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const classId = Number(rawId);

  return (
    <AppV30InstitutionAdmin
      initialPage="liveroom"
      initialLiveClass={Number.isNaN(classId) ? null : classId}
    />
  );
}
