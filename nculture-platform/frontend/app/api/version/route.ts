/**
 * 배포본이 '어느 커밋인지' 스스로 밝힌다.
 *
 * 머지했다고 배포된 게 아니다 — Actions 이벤트가 늦게 도착하는 일이 실제로 있었고,
 * 그때 "main 의 최신 실행"을 보고 성공으로 오판했다. SHA 를 배포본에 직접 물어보면
 * Actions 타이밍과 무관하게 무엇이 살아있는지 한 번에 확인된다.
 *
 * 값은 빌드 시점에 워크플로가 lib/build-info.json 에 써넣는다(런타임 env 는
 * 빌드된 코드가 아니라 프로젝트 설정을 반영하므로 이 용도엔 못 쓴다).
 */
import { NextResponse } from 'next/server';
import buildInfo from '@/lib/build-info.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    sha: buildInfo.sha,
    builtAt: buildInfo.builtAt,
  });
}
