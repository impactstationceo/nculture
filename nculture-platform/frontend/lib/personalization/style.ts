/**
 * 생성 프롬프트 텍스트 → 스타일 선호 추출.
 *
 * 온보딩 선언(seed.visualStyles)만으로는 '실제로 무엇을 만드는지'를 못 잡는다.
 * 선언은 한 번뿐이고 바뀌지 않지만, 프롬프트는 매번 쓰이며 취향이 그대로 드러난다.
 * 온보딩과 같은 어휘(cinematic/anime/photoreal/minimal/experimental/vintage)로 맞춰
 * 시드와 행동을 같은 축에서 합칠 수 있게 한다.
 *
 * 형태소 분석 없이 부분 문자열 매칭이다. 프롬프트가 짧고 스타일어가 관용적이라
 * 이 정도로 충분하고, 오탐이 나도 정규화 과정에서 희석된다.
 */

/** 스타일 토큰 → 프롬프트에 등장할 법한 표현들 (소문자 비교) */
const STYLE_KEYWORDS: Record<string, string[]> = {
  cinematic: [
    '시네마틱', '영화적', '영화 같', '드라마틱', '무비',
    'cinematic', 'filmic', 'movie', 'dramatic',
    '로우앵글', '와이드샷', '심도', 'bokeh', '보케', '조명',
  ],
  anime: [
    '애니', '애니메이션', '일러스트', '그림체', '만화', '작화', '2d',
    'anime', 'illustration', 'cartoon', 'manga', 'cel shad',
  ],
  photoreal: [
    '포토리얼', '실사', '사진 같', '사실적', '리얼리스틱', '초현실적 디테일',
    'photoreal', 'photorealistic', 'realistic', 'lifelike', '4k', '8k',
  ],
  minimal: [
    '미니멀', '심플', '깔끔', '절제', '모던', '여백',
    'minimal', 'minimalist', 'clean', 'simple', 'modern',
  ],
  experimental: [
    '실험적', '추상', '아방가르드', '초현실', '기괴', '왜곡',
    'experimental', 'abstract', 'avant', 'surreal', 'glitch',
  ],
  vintage: [
    '빈티지', '레트로', '필름 그레인', '그레인', '8mm', '16mm', '아날로그',
    '세피아', '색바랜', '앰버 색보정',
    'vintage', 'retro', 'film grain', 'grain', 'analog', 'sepia', 'polaroid',
  ],
};

export const STYLE_TOKENS = Object.keys(STYLE_KEYWORDS);

/**
 * 프롬프트 한 건에서 감지된 스타일 토큰들.
 * 한 프롬프트가 여러 스타일을 담을 수 있어 배열로 돌려준다(중복 없음).
 */
export function detectStyles(prompt: string | null | undefined): string[] {
  if (!prompt) return [];
  const text = prompt.toLowerCase();
  const hits: string[] = [];
  for (const token of STYLE_TOKENS) {
    if (STYLE_KEYWORDS[token].some((kw) => text.includes(kw))) hits.push(token);
  }
  return hits;
}
