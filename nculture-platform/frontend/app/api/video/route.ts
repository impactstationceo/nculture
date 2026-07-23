import { NextRequest, NextResponse } from 'next/server';
import {
  createVideoTask,
  type HailuoModel,
  type Resolution,
  type Duration,
} from '@/lib/minimax';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODELS: HailuoModel[] = [
  'MiniMax-Hailuo-2.3-Fast',
  'MiniMax-Hailuo-2.3',
  'MiniMax-Hailuo-02',
];
const RESOLUTIONS: Resolution[] = ['512P', '768P', '1080P'];

/** POST /api/video — 영상 생성 태스크 제출, { taskId } 반환 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    if (!prompt) {
      return NextResponse.json({ error: '프롬프트를 입력해주세요.' }, { status: 400 });
    }

    const model: HailuoModel = MODELS.includes(body.model)
      ? body.model
      : 'MiniMax-Hailuo-2.3-Fast';
    const resolution: Resolution = RESOLUTIONS.includes(body.resolution)
      ? body.resolution
      : '768P';
    const duration: Duration = body.duration === 10 ? 10 : 6;

    const taskId = await createVideoTask({
      prompt,
      model,
      resolution,
      duration,
      firstFrameImage:
        typeof body.firstFrameImage === 'string' ? body.firstFrameImage : undefined,
    });

    return NextResponse.json({ taskId });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || '영상 생성 요청에 실패했습니다.' },
      { status: 500 },
    );
  }
}
