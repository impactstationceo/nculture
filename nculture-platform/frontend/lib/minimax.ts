import 'server-only';

/**
 * MiniMax(Hailuo) 영상 생성 서버 전용 헬퍼.
 * - sk-cp(Subscription Key)는 절대 클라이언트에 노출하지 않는다 → 반드시 서버에서만 사용.
 * - 영상 생성은 비동기: (1) 태스크 생성 → (2) 상태 폴링 → (3) file_id로 다운로드 URL 조회.
 * 문서: https://platform.minimax.io/docs/guides/video-generation
 */

const BASE_URL = 'https://api.minimax.io/v1';

function getApiKey(): string {
  const key = process.env.MINIMAX_API_KEY;
  if (!key) {
    throw new Error('MINIMAX_API_KEY 가 설정되지 않았습니다 (.env 에 sk-cp 키를 넣어주세요).');
  }
  return key;
}

export type HailuoModel =
  | 'MiniMax-Hailuo-2.3-Fast'
  | 'MiniMax-Hailuo-2.3'
  | 'MiniMax-Hailuo-02';

export type Resolution = '512P' | '768P' | '1080P';
export type Duration = 6 | 10;

export interface CreateVideoInput {
  prompt: string;
  model?: HailuoModel;
  resolution?: Resolution;
  duration?: Duration;
  /** image-to-video 모드용 첫 프레임 이미지 (공개 URL 또는 data URI) */
  firstFrameImage?: string;
}

interface BaseResp {
  status_code: number;
  status_msg: string;
}

/** MiniMax API 공통 fetch — 인증 헤더 주입 + base_resp 에러 처리 */
async function mmFetch(path: string, init?: RequestInit): Promise<any> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`MiniMax HTTP ${res.status}: ${text.slice(0, 500)}`);
  }

  const json = await res.json();
  const base = json?.base_resp as BaseResp | undefined;
  // status_code 0 = 성공. 그 외에는 에러(잔액 부족, 파라미터 오류 등).
  if (base && base.status_code !== 0) {
    throw new Error(`MiniMax error ${base.status_code}: ${base.status_msg}`);
  }
  return json;
}

/** (1) 영상 생성 태스크 제출 → task_id 반환 */
export async function createVideoTask(input: CreateVideoInput): Promise<string> {
  const payload: Record<string, unknown> = {
    prompt: input.prompt,
    model: input.model ?? 'MiniMax-Hailuo-2.3-Fast',
    duration: input.duration ?? 6,
    resolution: input.resolution ?? '768P',
  };
  // Hailuo-2.3/02는 1080P에서 10초 조합을 지원하지 않음 → 1080P는 6초로 정규화
  if (payload.resolution === '1080P' && payload.duration === 10) {
    payload.duration = 6;
  }
  if (input.firstFrameImage) {
    payload.first_frame_image = input.firstFrameImage;
  }

  const json = await mmFetch('/video_generation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!json.task_id) {
    throw new Error('MiniMax 응답에 task_id 가 없습니다.');
  }
  return String(json.task_id);
}

export type TaskStatus = 'Preparing' | 'Queueing' | 'Processing' | 'Success' | 'Fail';

export interface TaskResult {
  status: TaskStatus;
  fileId?: string;
  downloadUrl?: string;
  error?: string;
}

/** (2)+(3) 상태 폴링, 성공 시 다운로드 URL까지 조회해서 반환 */
export async function queryVideoTask(taskId: string): Promise<TaskResult> {
  const json = await mmFetch(
    `/query/video_generation?task_id=${encodeURIComponent(taskId)}`,
    { method: 'GET' },
  );

  const status = json.status as TaskStatus;
  const result: TaskResult = { status };

  if (status === 'Success' && json.file_id) {
    result.fileId = String(json.file_id);
    result.downloadUrl = await retrieveVideoUrl(result.fileId);
  }
  if (status === 'Fail') {
    result.error = json.error_message || '영상 생성 실패';
  }
  return result;
}

/** (3) file_id → 실제 다운로드 URL */
export async function retrieveVideoUrl(fileId: string): Promise<string> {
  const json = await mmFetch(
    `/files/retrieve?file_id=${encodeURIComponent(fileId)}`,
    { method: 'GET' },
  );
  const url = json?.file?.download_url;
  if (!url) {
    throw new Error('MiniMax 응답에 download_url 이 없습니다.');
  }
  return String(url);
}
