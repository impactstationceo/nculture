/**
 * AI 튜터 — 채점 결과 기반 강의 추천 문구 생성 (Gemini).
 *
 * 설계 원칙:
 *   - 강의 '선택'은 클라이언트의 결정적 로직(약점 축 → COURSE_BY_WEAK_AXIS)이 한다.
 *     Gemini 는 이미 선택된 강의를 '문장으로 풀어내는 역할'만 한다 — 없는 강의를
 *     지어내는 환각을 원천 차단.
 *   - 이 라우트가 죽어도 기능은 죽지 않는다 — 호출부가 템플릿 문구로 폴백한다.
 *   - 서버에서 도는 이유: GEMINI_API_KEY 는 서버 전용.
 */
import { NextResponse } from 'next/server';

export const maxDuration = 60;

const GEMINI_MODEL = 'gemini-3.6-flash'; // /api/grade 와 동일 모델

const RECOMMEND_SYSTEM = `너는 AI 크리에이터 교육 플랫폼 'Coming AI'의 AI 튜터다.
학생이 방금 생성한 AI 영상의 채점 결과를 보고, 정해진 보완 강의를 자연스럽게 권유하는 짧은 메시지를 쓴다.

규칙:
- 한국어, 2~3문장, 260자 이내. 마크다운·이모지 금지.
- 반드시 채점의 실제 근거(가장 낮은 축의 점수, 코멘트 내용)를 한 가지 이상 자연스럽게 인용한다.
- 강의는 주어진 강의만 언급한다. 다른 강의를 지어내지 않는다.
- 선호 스타일이 주어지면 한 번만 가볍게 반영한다.
- 말투는 격려하는 튜터 — 지적만 하지 말고 다음 행동(강의)으로 연결한다.`;

async function callGemini(body: any): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY 미설정');
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(`Gemini 오류 ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini 응답이 비었습니다.');
  return text;
}

/** 채점 결과를 LLM 이 읽을 압축 텍스트로 — 원문 코멘트가 있어야 '내 영상 얘기'가 된다 */
function gradingBrief(evaluation: any, prompt?: string | null): string {
  if (!evaluation) return '';
  const lines: string[] = [];
  if (prompt) lines.push(`학생이 입력한 프롬프트: ${String(prompt).slice(0, 300)}`);
  if (evaluation.score != null) lines.push(`종합 점수: ${evaluation.score}점`);
  for (const c of evaluation.criteria || []) {
    lines.push(`- ${c.axis}: ${c.score}점`);
  }
  const fb = (evaluation.feedbacks || evaluation.feedback || [])
    .map((f: any) => `${f.type === 'positive' ? '[강점]' : '[개선]'} ${f.text}`)
    .slice(0, 6);
  if (fb.length) lines.push(`채점 코멘트:\n${fb.join('\n')}`);
  return lines.join('\n');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ── 1) 추천 문구 생성 — 강의는 이미 정해져서 온다 ──────────────
    if (body.mode === 'recommend') {
      const { evaluation, prompt, topStyle, course } = body;
      if (!evaluation || !course?.title) {
        return NextResponse.json({ error: 'evaluation/course 가 필요합니다.' }, { status: 400 });
      }
      const user = [
        gradingBrief(evaluation, prompt),
        `\n권유할 강의(이것만 언급): 「${course.title}」`,
        course.reason ? `이 강의가 돕는 부분: ${course.reason}` : '',
        topStyle ? `학생의 선호 스타일: ${topStyle}` : '',
        `\nJSON 으로만 답하라. 스키마: {"message": "권유 메시지"}`,
      ].filter(Boolean).join('\n');

      const raw = await callGemini({
        systemInstruction: { parts: [{ text: RECOMMEND_SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
      });
      const message = String(JSON.parse(raw)?.message || '').trim().slice(0, 300);
      if (!message) throw new Error('빈 추천 문구');
      return NextResponse.json({ message });
    }

    return NextResponse.json({ error: 'mode 는 recommend 여야 합니다.' }, { status: 400 });
  } catch (e: any) {
    console.error('[tutor] 실패:', e?.message || e);
    return NextResponse.json({ error: e?.message || '튜터 응답 실패' }, { status: 502 });
  }
}
