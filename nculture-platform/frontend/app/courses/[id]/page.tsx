'use client';

import { useParams } from 'next/navigation';
import AppV30InstitutionAdmin from '@/components/AppV30InstitutionAdmin';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;

  return <AppV30InstitutionAdmin initialPage="courseDetail" initialCourse={courseId} />;
}
