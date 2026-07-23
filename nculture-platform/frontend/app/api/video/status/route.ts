import { NextRequest, NextResponse } from 'next/server';
import { queryVideoTask } from '@/lib/minimax';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/video/status?taskId=xxx — 태스크 상태(+성공 시 downloadUrl) 반환 */
export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get('taskId');
  if (!taskId) {
    return NextResponse.json({ error: 'taskId 가 필요합니다.' }, { status: 400 });
  }

  try {
    const result = await queryVideoTask(taskId);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || '상태 조회에 실패했습니다.' },
      { status: 500 },
    );
  }
}
