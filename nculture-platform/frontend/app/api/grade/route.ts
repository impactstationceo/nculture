/**
 * 생성 영상 채점 — Gemini 영상 이해로 실제 채점하고 video_gradings 에 기록한다.
 *
 * 서버에서 도는 이유 2가지:
 *   1) GEMINI_API_KEY 가 서버 전용 (브라우저에 노출하면 안 됨)
 *   2) video_gradings 는 RLS 에 쓰기 정책이 없다(015 설계) → service_role 로만 기록 가능.
 *      학생이 자기 점수를 위조할 수 없게 하려는 의도라 클라이언트 INSERT 를 열지 않는다.
 *
 * 실채점 대상은 실제로 생성된 영상(현재 MiniMax)뿐이다. 목업 영상은 채점할 실체가 없어
 * 호출부에서 기존 목업 점수를 그대로 쓴다.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 120; // Gemini 영상 채점은 수십 초 걸릴 수 있다

const GEMINI_MODEL = 'gemini-3.6-flash';
const MAX_VIDEO_BYTES = 18 * 1024 * 1024; // inline 요청 한도(20MB) 안쪽으로

const SYSTEM = `너는 AI 크리에이터 교육 플랫폼의 'AI 영상 생성물 채점관'이다.
학생이 생성한 AI 영상을 실제로 보고, 영상 생성 품질을 정량 지표로 채점한다.

채점 축(가중치):
- 프롬프트 충실도 35%: 의도한 장면/피사체/스타일이 영상에 제대로 담겼는가
- 시각적 품질 25%: 해상도·디테일·조명·구도·심미성
- 모션 자연스러움 20%: 움직임의 자연스러움, 부자연스러운 왜곡/떨림 없음
- 시간적 일관성 20%: 프레임 간 피사체·배경 일관성, 깜빡임/변형 없음

각 축 0~100점. 관찰한 실제 근거로 코멘트. 아티팩트(손가락 왜곡, 형태 붕괴, 깜빡임 등)가 보이면 명시.`;

const INSTRUCTION = `이 AI 생성 영상을 보고 채점하라. JSON으로만 답한다. 스키마:
{
  "overall_score": 0-100 정수,
  "summary": "한 줄 총평 (한국어)",
  "metrics": [
    {"axis": "프롬프트 충실도", "weight": 35, "score": N, "comment": "한국어 근거"},
    {"axis": "시각적 품질", "weight": 25, "score": N, "comment": "..."},
    {"axis": "모션 자연스러움", "weight": 20, "score": N, "comment": "..."},
    {"axis": "시간적 일관성", "weight": 20, "score": N, "comment": "..."}
  ],
  "strengths": ["강점 1~2개(한국어)"],
  "improvements": ["개선점 1~2개(한국어)"],
  "artifacts": ["감지된 아티팩트(없으면 빈 배열)"]
}`;

function gradeOf(score: number): { grade: string; gradeColor: string } {
  if (score >= 90) return { grade: 'A', gradeColor: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (score >= 80) return { grade: 'B', gradeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
  if (score >= 70) return { grade: 'C', gradeColor: 'text-amber-600 bg-amber-50 border-amber-200' };
  return { grade: 'D', gradeColor: 'text-red-600 bg-red-50 border-red-200' };
}

export async function POST(req: Request) {
  try {
    const { videoUrl, prompt, userId, aiJobId, sessionId } = await req.json();
    if (!videoUrl) return NextResponse.json({ error: 'videoUrl 이 필요합니다.' }, { status: 400 });

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) return NextResponse.json({ error: 'GEMINI_API_KEY 미설정' }, { status: 500 });

    // 1) 영상 내려받기 (학생 프롬프트로 방금 생성된 결과물)
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) {
      return NextResponse.json({ error: `영상 다운로드 실패 (${videoRes.status})` }, { status: 502 });
    }
    const buf = Buffer.from(await videoRes.arrayBuffer());
    if (buf.byteLength > MAX_VIDEO_BYTES) {
      return NextResponse.json({ error: '영상이 너무 큽니다(18MB 초과).' }, { status: 413 });
    }

    // 1-2) 결과물을 우리 스토리지로 옮긴다.
    //   생성 모델(MiniMax 등)의 추론 CDN URL 은 우리가 수명을 보장할 수 없다.
    //   채점 기록은 남는데 영상만 사라지면 반쪽이 되므로, 채점하려고 이미 받아둔
    //   버퍼를 그대로 Blob 에 올려 영구 URL 을 쓴다(추가 다운로드 없음).
    //   업로드 실패는 채점을 막지 않는다 — 원본 URL 로 폴백.
    //   @vercel/blob SDK 는 Next 14.0.4 번들러가 파싱하지 못해(빌드 실패) REST 로 직접 올린다.
    let storedUrl = videoUrl;
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken) {
      try {
        const safeId = String(aiJobId || Date.now()).replace(/[^a-zA-Z0-9_-]/g, '') || 'clip';
        const path = `generated/${(userId || 'anon').slice(0, 8)}/${safeId}.mp4`;
        const up = await fetch(`https://blob.vercel-storage.com/${path}`, {
          method: 'PUT',
          headers: {
            authorization: `Bearer ${blobToken}`,
            'x-api-version': '7',
            'x-content-type': 'video/mp4',
            'x-add-random-suffix': '1',
          },
          body: buf,
        });
        if (!up.ok) throw new Error(`blob ${up.status} ${(await up.text()).slice(0, 120)}`);
        const blob = await up.json();
        if (blob?.url) storedUrl = blob.url;
      } catch (e: any) {
        console.error('[grade] Blob 업로드 실패, 원본 URL 유지:', e?.message || e);
      }
    }

    // 2) Gemini 채점 — 학생이 입력한 프롬프트를 함께 줘서 '충실도'를 실제로 대조시킨다
    const userParts: any[] = [
      { inlineData: { mimeType: 'video/mp4', data: buf.toString('base64') }, videoMetadata: { fps: 3 } },
      { text: prompt ? `학생이 입력한 프롬프트:\n${prompt}\n\n${INSTRUCTION}` : INSTRUCTION },
    ];
    const gRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: 'user', parts: userParts }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
        }),
      },
    );
    if (!gRes.ok) {
      const detail = await gRes.text();
      return NextResponse.json({ error: `Gemini 오류 ${gRes.status}`, detail: detail.slice(0, 300) }, { status: 502 });
    }
    const gJson = await gRes.json();
    const raw = gJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) return NextResponse.json({ error: 'Gemini 응답이 비었습니다.' }, { status: 502 });
    const g = JSON.parse(raw);

    // 3) 프론트 평가 카드 스키마로 매핑 (sd2.grade.json 과 동일 형태)
    const score = Math.round(Number(g.overall_score) || 0);
    const { grade, gradeColor } = gradeOf(score);
    const metrics: any[] = Array.isArray(g.metrics) ? g.metrics : [];
    const evaluation = {
      grade,
      gradeColor,
      score,
      focus: g.summary || 'AI 영상 생성 품질 평가',
      criteria: metrics.map((m) => ({ axis: m.axis, weight: m.weight, score: Math.round(Number(m.score) || 0) })),
      feedbacks: [
        ...(g.strengths || []).map((t: string) => ({ type: 'positive', text: t })),
        ...(g.improvements || []).map((t: string) => ({ type: 'suggestion', text: t })),
        ...(g.artifacts || []).map((t: string) => ({ type: 'suggestion', text: `아티팩트: ${t}` })),
        ...(g.summary ? [{ type: 'tip', text: g.summary }] : []),
      ],
      matchedKeywords: [],
      metricComments: Object.fromEntries(metrics.map((m) => [m.axis, m.comment || ''])),
      isRealGrading: true, // 목업 점수와 구분 (UI 에서 '실채점' 배지)
    };

    // 4) video_gradings 기록 (service_role — RLS 우회). 실패해도 채점 결과는 돌려준다.
    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_COMING_ANALYTICS_URL;
    if (svcKey && url && userId) {
      try {
        const admin = createClient(url, svcKey, { auth: { persistSession: false } });
        // ai_job_id/session_id 는 UUID 컬럼이다. 형식이 안 맞는 값이 오면
        // insert 가 통째로 실패해 채점 결과가 조용히 유실된다 → null 로 떨군다.
        const asUuid = (v: any) =>
          typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
            ? v
            : null;

        const { error } = await admin.from('video_gradings').insert({
          user_id: userId,
          session_id: asUuid(sessionId),
          ai_job_id: asUuid(aiJobId),
          video_url: storedUrl,
          prompt: prompt || null,
          ai_score: score,
          ai_grade: grade,
          ai_criteria: evaluation.criteria,
          ai_feedback: evaluation.feedbacks,
          ai_model: GEMINI_MODEL,
        });
        if (error) throw error;
      } catch (e: any) {
        console.error('[grade] video_gradings 기록 실패:', e?.message || e);
      }
    }

    const usage = gJson.usageMetadata || {};
    return NextResponse.json({
      evaluation,
      videoUrl: storedUrl,
      usage: { input: usage.promptTokenCount, output: usage.candidatesTokenCount },
    });
  } catch (e: any) {
    console.error('[grade] 실패:', e);
    return NextResponse.json({ error: e?.message || '채점 중 오류' }, { status: 500 });
  }
}
