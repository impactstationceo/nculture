// ============= Placeholder 이미지 생성 함수 =============
export const createPlaceholder = (type: string, bgColor = '#6366f1') => {
  const icons: Record<string, string> = {
    video: `<circle cx="200" cy="100" r="40" fill="rgba(255,255,255,0.2)"/><polygon points="190,85 220,100 190,115" fill="white"/>`,
    ai: `<circle cx="200" cy="90" r="35" fill="rgba(255,255,255,0.15)"/><circle cx="200" cy="90" r="20" fill="rgba(255,255,255,0.2)"/><circle cx="200" cy="90" r="8" fill="white"/><path d="M165 130 Q200 160 235 130" stroke="rgba(255,255,255,0.3)" stroke-width="3" fill="none"/><circle cx="170" cy="140" r="5" fill="rgba(255,255,255,0.2)"/><circle cx="230" cy="140" r="5" fill="rgba(255,255,255,0.2)"/><circle cx="200" cy="155" r="4" fill="rgba(255,255,255,0.2)"/>`,
    business: `<rect x="160" y="80" width="80" height="60" rx="4" fill="rgba(255,255,255,0.2)"/><line x1="175" y1="95" x2="225" y2="95" stroke="white" stroke-width="2"/><line x1="175" y1="108" x2="210" y2="108" stroke="rgba(255,255,255,0.5)" stroke-width="2"/><line x1="175" y1="121" x2="220" y2="121" stroke="rgba(255,255,255,0.5)" stroke-width="2"/><path d="M250 140 L270 100 L290 120 L310 80" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="310" cy="80" r="5" fill="white"/>`,
    creative: `<circle cx="160" cy="100" r="30" fill="rgba(255,255,255,0.2)"/><circle cx="200" cy="85" r="25" fill="rgba(255,255,255,0.25)"/><circle cx="240" cy="105" r="28" fill="rgba(255,255,255,0.15)"/><path d="M180 130 Q200 150 220 130" stroke="white" stroke-width="2" fill="none"/><polygon points="200,60 205,75 220,75 208,85 213,100 200,90 187,100 192,85 180,75 195,75" fill="white"/>`,
    robot: `<rect x="170" y="70" width="60" height="50" rx="8" fill="rgba(255,255,255,0.25)"/><circle cx="185" cy="90" r="6" fill="white"/><circle cx="215" cy="90" r="6" fill="white"/><rect x="190" y="105" width="20" height="4" rx="2" fill="white"/><rect x="175" y="125" width="50" height="25" rx="4" fill="rgba(255,255,255,0.2)"/><line x1="185" y1="135" x2="215" y2="135" stroke="rgba(255,255,255,0.5)" stroke-width="2"/><line x1="185" y1="142" x2="205" y2="142" stroke="rgba(255,255,255,0.5)" stroke-width="2"/><rect x="165" y="80" width="5" height="15" rx="2" fill="rgba(255,255,255,0.3)"/><rect x="230" y="80" width="5" height="15" rx="2" fill="rgba(255,255,255,0.3)"/>`,
    live: `<circle cx="200" cy="100" r="45" fill="rgba(255,255,255,0.1)"/><circle cx="200" cy="100" r="30" fill="rgba(255,255,255,0.15)"/><circle cx="200" cy="100" r="15" fill="rgba(255,255,255,0.2)"/><circle cx="200" cy="100" r="6" fill="white"/><circle cx="260" cy="70" r="8" fill="white" opacity="0.8"/><circle cx="270" cy="90" r="5" fill="white" opacity="0.5"/><circle cx="255" cy="55" r="4" fill="white" opacity="0.3"/>`,
    code: `<rect x="150" y="70" width="100" height="70" rx="6" fill="rgba(255,255,255,0.15)"/><text x="160" y="95" font-family="monospace" font-size="12" fill="rgba(255,255,255,0.7)">&lt;/&gt;</text><line x1="160" y1="108" x2="220" y2="108" stroke="rgba(255,255,255,0.4)" stroke-width="2"/><line x1="160" y1="120" x2="200" y2="120" stroke="rgba(255,255,255,0.4)" stroke-width="2"/><circle cx="235" cy="125" r="3" fill="rgba(255,255,255,0.6)"/>`,
  };
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${bgColor}dd;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="225" fill="url(#grad)"/>
    ${icons[type] || icons.video}
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const createAvatar = (name: string, bgColor = '#6366f1') => {
  const initial = name.charAt(0);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${bgColor}bb;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="url(#avatarGrad)"/>
    <circle cx="50" cy="35" r="18" fill="rgba(255,255,255,0.9)"/>
    <ellipse cx="50" cy="75" rx="28" ry="20" fill="rgba(255,255,255,0.9)"/>
    <text x="50" y="55" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="${bgColor}" text-anchor="middle" dominant-baseline="central">${initial}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const createScreen = (status = 'active', bgColor = '#1e293b') => {
  const statusIcons: Record<string, string> = {
    active: `<rect x="100" y="60" width="200" height="120" rx="8" fill="#334155"/>
      <rect x="115" y="75" width="80" height="10" rx="2" fill="#6366f1"/>
      <rect x="115" y="95" width="170" height="6" rx="2" fill="#475569"/>
      <rect x="115" y="110" width="140" height="6" rx="2" fill="#475569"/>
      <rect x="115" y="125" width="160" height="6" rx="2" fill="#475569"/>
      <rect x="115" y="145" width="60" height="20" rx="4" fill="#6366f1"/>
      <circle cx="350" cy="190" r="20" fill="#22c55e" opacity="0.2"/>
      <circle cx="350" cy="190" r="10" fill="#22c55e"/>`,
    away: `<rect x="100" y="60" width="200" height="120" rx="8" fill="#334155"/>
      <circle cx="200" cy="120" r="25" fill="#475569"/>
      <rect x="195" y="105" width="10" height="20" rx="2" fill="#64748b"/>
      <circle cx="200" cy="140" r="4" fill="#64748b"/>
      <circle cx="350" cy="190" r="20" fill="#f59e0b" opacity="0.2"/>
      <circle cx="350" cy="190" r="10" fill="#f59e0b"/>`,
  };
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="${bgColor}"/>
    ${statusIcons[status] || statusIcons.active}
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const createResult = (index = 0) => {
  const colors = ['#6366f1', '#0891b2', '#7c3aed', '#059669', '#dc2626'];
  const bgColor = colors[index % colors.length];
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="338" viewBox="0 0 600 338">
    <defs>
      <linearGradient id="resultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${bgColor}cc;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="600" height="338" fill="url(#resultGrad)"/>
    <rect x="50" y="50" width="200" height="120" rx="12" fill="rgba(255,255,255,0.1)"/>
    <circle cx="150" cy="110" r="30" fill="rgba(255,255,255,0.2)"/>
    <polygon points="140,95 170,110 140,125" fill="white"/>
    <rect x="280" y="60" width="270" height="12" rx="4" fill="rgba(255,255,255,0.3)"/>
    <rect x="280" y="85" width="220" height="8" rx="3" fill="rgba(255,255,255,0.2)"/>
    <rect x="280" y="105" width="240" height="8" rx="3" fill="rgba(255,255,255,0.2)"/>
    <rect x="280" y="140" width="100" height="30" rx="6" fill="rgba(255,255,255,0.25)"/>
    <circle cx="100" cy="250" r="40" fill="rgba(255,255,255,0.08)"/>
    <circle cx="500" cy="280" r="50" fill="rgba(255,255,255,0.05)"/>
    <text x="300" y="300" font-family="system-ui" font-size="14" fill="rgba(255,255,255,0.4)" text-anchor="middle">AI Generated</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

// ============= Mock 커리큘럼 데이터 =============
export const CURRICULUM: Record<string, any> = {
  course1: {
    id: 'course1',
    title: "프롬프트로 AI 영상 만들기",
    instructor: "nCulture",
    totalSessions: 6,
    thumbnail: createPlaceholder('video', '#6366f1'),
    description: "텍스트 프롬프트로 AI 영상을 생성하는 기초부터 고급 테크닉까지",
    sessions: [
      { id: 1, title: "첫 영상 AI 경험", summary: "텍스트로 영상 생성의 기본 원리 이해", concepts: ["간단한 프롬프트로 시작", "같은 프롬프트 다른 결과", "AI 생성의 확률성 이해"], examples: [{ label: "기본", prompt: "창가에 앉아 있는 고양이" }, { label: "변형", prompt: "비 오는 날 창가에 앉아 있는 고양이, 유리창에 빗방울이 맺혀 있다" }] },
      { id: 2, title: "프롬프트 4요소", summary: "주체·행동·공간·분위기 구조화 학습", concepts: ["주체(Subject) 명확히", "행동(Action) 구체화", "공간(Space)과 분위기(Mood)"], examples: [{ label: "4요소 적용", prompt: "젊은 여성이 공원을 조깅하고 있다, 아침 햇살, 활기찬 분위기" }, { label: "분위기 변경", prompt: "젊은 여성이 공원을 조깅하고 있다, 노을, 평화롭고 차분한 분위기" }] },
      { id: 3, title: "카메라 제어", summary: "샷 크기, 앵글, 무브먼트 설정", concepts: ["Close-up, Medium, Wide shot", "High angle, Low angle", "Pan, Tilt, Dolly"], examples: [{ label: "클로즈업", prompt: "김이 모락모락 나는 커피잔을 잡고 있는 손, 익스트림 클로즈업, 얕은 심도, 피어오르는 수증기" }, { label: "와이드+무브먼트", prompt: "황금빛 시간대의 도시 스카이라인, 와이드샷, 드론이 천천히 전진하며 항구를 드러낸다" }] },
      { id: 4, title: "비주얼 스타일", summary: "리얼리즘, 시네마틱, 애니메이션 스타일", concepts: ["Photorealistic vs Stylized", "Cinematic lighting", "Animation styles"], examples: [{ label: "시네마틱", prompt: "네온 불빛 아래를 걷는 남자, 시네마틱 룩, 아나모픽 렌즈 플레어, 필름 그레인, 블레이드 러너 스타일" }, { label: "애니메이션", prompt: "마법의 숲을 달리는 여우, 지브리 스타일, 손으로 그린 애니메이션, 반짝이는 마법 입자" }] },
      { id: 5, title: "장면 분할 설계", summary: "멀티 씬 구성과 장면 전환", concepts: ["씬 단위로 생각하기", "장면 간 연결성", "전환 설계"], examples: [{ label: "씬1", prompt: "침대에서 일어나는 남자, 커튼 사이로 부드러운 아침 햇살, 천천히 기지개를 편다" }, { label: "씬2", prompt: "같은 남자가 주방에서 커피를 따르고 있다, 자연스러운 연속 동작, 따뜻한 실내 조명" }] },
      { id: 6, title: "행동과 동작 지시", summary: "캐릭터 행동의 구체화", concepts: ["동작 중심 동사 사용", "속도·강도·연속성 묘사", "모호함 vs 명확함"], examples: [{ label: "동작 묘사", prompt: "발레리나가 천천히 우아한 피루엣을 돌고 있다, 우아한 팔 동작, 부드러운 스포트라이트, 슬로우 모션" }, { label: "연속 동작", prompt: "농구 선수가 전력 질주하여 높이 점프한 뒤 강력한 덩크슛을 꽂는다, 역동적인 카메라가 동작을 따라간다" }] }
    ]
  },
  course2: {
    id: 'course2',
    title: "AI 콘텐츠 창작 입문 A to Z",
    instructor: "이승정 강사",
    totalSessions: 10,
    thumbnail: createPlaceholder('creative', '#7c3aed'),
    description: "이미지, 영상, 음성까지 AI 창작 도구 완전 정복",
    sessions: [
      { id: 7, title: "AI 콘텐츠 창작 개론", summary: "AI 창작 도구의 이해와 활용 범위", concepts: ["생성형 AI의 종류", "창작 도구 비교", "활용 사례 분석"], examples: [{ label: "이미지 기초", prompt: "일출 시간의 고요한 산속 호수, 수정처럼 맑은 반영, 소나무 숲, 4K 포토리얼리스틱 품질" }, { label: "스타일 탐색", prompt: "밤의 미래형 도쿄 도시 풍경, 사이버펑크 네온 미학, 날아다니는 자동차, 비에 젖은 거리" }] },
      { id: 8, title: "이미지 생성 AI 마스터", summary: "Midjourney, DALL-E, Stable Diffusion", concepts: ["프롬프트 엔지니어링", "스타일 제어", "고급 파라미터 활용"], examples: [{ label: "Midjourney", prompt: "절벽 위의 고대 판타지 성, 극적인 폭풍 구름, 번개, 웅장한 스케일, --ar 16:9 --v 6 --style raw" }, { label: "포토리얼", prompt: "현대적인 북유럽 스타일 카페 인테리어, 자연 원목과 식물, 큰 창문으로 들어오는 아침 햇살, 건축 사진" }] },
      { id: 9, title: "영상 생성 AI 활용", summary: "SORA, Runway, Pika Labs 실습", concepts: ["텍스트 to 비디오", "이미지 to 비디오", "영상 편집 AI"], examples: [{ label: "텍스트 to 비디오", prompt: "일몰 시간에 바위 해안에 부딪히는 파도, 부드러운 달리 무브먼트, 날아가는 바닷새들, 골든아워 촬영" }, { label: "이미지 to 비디오", prompt: "이 풍경 사진을 애니메이션으로: 잔디 사이로 부는 부드러운 바람, 천천히 흘러가는 구름, 멀리서 나는 새들" }] },
      { id: 10, title: "음성 및 음악 AI", summary: "AI 보이스와 음악 생성", concepts: ["TTS 기술", "음악 생성 AI", "사운드 디자인"], examples: [{ label: "나레이션", prompt: "깊고 따뜻한 남성 목소리, 다큐멘터리 내레이터 스타일, 차분하고 권위 있는 톤, 명확한 발음, 약간의 리버브" }, { label: "배경음악", prompt: "로파이 힙합 인스트루멘탈, 부드러운 피아노 코드, 바이닐 잡음, 여유로운 오후 공부 분위기, 90 BPM" }] },
      { id: 11, title: "AI 콘텐츠 통합 제작", summary: "멀티모달 AI 활용 프로젝트", concepts: ["워크플로우 설계", "도구 간 연동", "최종 아웃풋 완성"], examples: [{ label: "통합 프로젝트", prompt: "30초 친환경 브랜드 영상: 자연 이미지 + 부드러운 전환 + 밝은 어쿠스틱 음악 + 은은한 텍스트 오버레이" }, { label: "숏폼 광고", prompt: "15초 세로형 인스타그램 스킨케어 광고, ASMR 텍스처 샷, 부드러운 파스텔 색상, 트렌디한 전자음악" }] }
    ]
  },
  course3: {
    id: 'course3',
    title: "디지털 휴먼 올인원 활용백서",
    instructor: "임재호 강사",
    totalSessions: 21,
    thumbnail: createPlaceholder('robot', '#059669'),
    description: "AI 아바타부터 버추얼 인플루언서까지 디지털 휴먼의 모든 것",
    sessions: [
      { id: 12, title: "디지털 휴먼 개론", summary: "디지털 휴먼의 이해와 활용 분야", concepts: ["디지털 휴먼 정의", "기술 발전 역사", "산업별 활용 사례"], examples: [{ label: "친근한 아바타", prompt: "친근한 젊은 아시아 여성 아바타, 다가가기 쉬운 미소, 캐주얼한 현대적 의상, 중립적인 스튜디오 배경, 고객 서비스 스타일" }, { label: "전문가 아바타", prompt: "네이비 정장을 입은 전문직 남성 아바타, 자신감 있는 자세, 단정한 외모, 기업 프레젠테이션 세팅" }] },
      { id: 13, title: "AI 아바타 제작", summary: "나만의 디지털 휴먼 만들기", concepts: ["외형 디자인", "음성 설정", "개성 부여하기"], examples: [{ label: "외형 설정", prompt: "한국인 여성 아바타, 어깨 길이 검은 머리, 자연스러운 화장, 따뜻한 갈색 눈, 25-30세, 친근한 인플루언서 룩" }, { label: "음성 페르소나", prompt: "밝고 에너지 넘치는 여성 목소리, 20대 초반 한국어 억양, 친근한 대화체, 명확한 발음, 목소리에 미소가 담긴" }] },
      { id: 14, title: "디지털 휴먼 애니메이션", summary: "자연스러운 움직임과 표정", concepts: ["모션 캡처 기술", "표정 애니메이션", "립싱크 기술"], examples: [{ label: "설명 제스처", prompt: "자연스러운 손동작으로 설명하는 아바타, 열린 손바닥 움직임, 가끔 끄덕임, 카메라와 시선 유지" }, { label: "감정 전환", prompt: "따뜻한 환영 미소에서 진지한 사려 깊은 표정으로 전환하는 아바타, 미묘한 눈썹 움직임, 현실적인 타이밍" }] },
      { id: 15, title: "실시간 디지털 휴먼", summary: "라이브 스트리밍과 인터랙션", concepts: ["실시간 렌더링", "인터랙티브 대화", "방송 활용"], examples: [{ label: "라이브 호스트", prompt: "실시간 채팅에 반응하는 버추얼 호스트, 댓글을 소리 내어 읽고, 놀람과 웃음으로 반응, 시청자와 적극적인 소통" }, { label: "실시간 반응", prompt: "후원 알림에 흥분된 표정으로 반응하는 아바타, 박수치며, 진심 어린 감사 인사" }] },
      { id: 16, title: "디지털 휴먼 비즈니스", summary: "상업적 활용과 미래 전망", concepts: ["마케팅 활용", "버추얼 인플루언서", "메타버스 연계"], examples: [{ label: "인플루언서 콘텐츠", prompt: "새 테크 제품을 언박싱하는 버추얼 인플루언서, 진정한 호기심 표현, 기능 시연, 라이프스타일 브랜드 통합" }, { label: "AI 상담원", prompt: "친근한 디지털 휴먼 고객 서비스 상담원, 경청하는 자세, 이해한다는 듯이 끄덕임, 전문적이고 도움이 되는 태도" }] }
    ]
  }
};

// ============= AI 서비스 Mock 데이터 =============
export const AI_SERVICES: any[] = [
  // ============= 영상 생성 서비스 =============
  {
    id: 'sora',
    name: 'OpenAI Sora',
    category: 'video',
    description: '사운드 포함 멀티샷 영상 생성',
    icon: '🎵',
    tiers: [
      { id: 'sora-2', name: 'Sora 2', description: '표준 품질', specs: { resolution: '720p', duration: '5-10초', audio: true }, pricing: { multiplier: 1.0 }, maxResolution: '720p', maxDurationSec: 10, audioSupported: true },
      { id: 'sora-2-pro', name: 'Sora 2 Pro', description: '고품질', specs: { resolution: '1080p', duration: '5-15초', audio: true }, pricing: { multiplier: 1.5 }, maxResolution: '1080p', maxDurationSec: 15, audioSupported: true },
      { id: 'sora-2-max', name: 'Sora 2 Max', description: '최고 품질', specs: { resolution: '4K', duration: '5-20초', audio: true }, pricing: { multiplier: 2.0 }, maxResolution: '4K', maxDurationSec: 20, audioSupported: true }
    ]
  },
  {
    id: 'veo',
    name: 'Google Veo',
    category: 'video',
    description: '정밀한 사운드 제어 영상',
    icon: '🎯',
    tiers: [
      { id: 'veo-lite', name: 'Veo Lite', description: '빠른 생성', specs: { resolution: '720p', duration: '3-8초', audio: false }, pricing: { multiplier: 0.8 }, maxResolution: '720p', maxDurationSec: 8, audioSupported: false },
      { id: 'veo-standard', name: 'Veo Standard', description: '균형 잡힌 품질', specs: { resolution: '1080p', duration: '4-12초', audio: true }, pricing: { multiplier: 1.2 }, maxResolution: '1080p', maxDurationSec: 12, audioSupported: true }
    ]
  },
  {
    id: 'kling',
    name: 'Kling',
    category: 'video',
    description: '완벽한 모션과 고급 영상 제어',
    icon: '⚡',
    tiers: [
      { id: 'kling-v1', name: 'Kling v1.0', description: '표준 모션', specs: { resolution: '1080p', duration: '5-10초', audio: false }, pricing: { multiplier: 1.0 }, maxResolution: '1080p', maxDurationSec: 10, audioSupported: false },
      { id: 'kling-v2', name: 'Kling v2.0', description: '향상된 모션', specs: { resolution: '1080p', duration: '5-15초', audio: true }, pricing: { multiplier: 1.3 }, maxResolution: '1080p', maxDurationSec: 15, audioSupported: true }
    ]
  },
  {
    id: 'minimax',
    name: 'Minimax Hailuo',
    category: 'video',
    description: '고다이나믹, VFX 지원, 가장 빠르고 저렴함',
    icon: '🚀',
    tiers: [
      { id: 'minimax-fast', name: '패스트', description: '빠른 생성', specs: { resolution: '720p', duration: '3-6초', audio: false }, pricing: { multiplier: 0.7 }, maxResolution: '720p', maxDurationSec: 6, audioSupported: false },
      { id: 'minimax-quality', name: '퀄리티', description: '최고 품질', specs: { resolution: '1080p', duration: '5-12초', audio: true }, pricing: { multiplier: 1.0 }, maxResolution: '1080p', maxDurationSec: 12, audioSupported: true }
    ]
  },
  // ============= 이미지 생성 서비스 =============
  {
    id: 'dalle',
    name: 'DALL·E 3',
    category: 'image',
    description: '자연어 이해력이 뛰어난 이미지 생성',
    icon: '🎨',
    tiers: [
      { id: 'dalle-standard', name: '스탠다드', description: '표준 품질', specs: { resolution: '1024x1024', style: '자연스러운' }, pricing: { multiplier: 1.0, base: 8 } },
      { id: 'dalle-hd', name: 'HD', description: '고해상도', specs: { resolution: '1792x1024', style: '선명한' }, pricing: { multiplier: 1.5, base: 12 } }
    ]
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    category: 'image',
    description: '예술적이고 창의적인 이미지 생성',
    icon: '✨',
    tiers: [
      { id: 'mj-v6', name: 'v6.0', description: '최신 버전', specs: { resolution: '1024x1024', style: '예술적' }, pricing: { multiplier: 1.2, base: 10 } },
      { id: 'mj-v6-raw', name: 'v6.0 RAW', description: '사실적 스타일', specs: { resolution: '1024x1024', style: '사실적' }, pricing: { multiplier: 1.3, base: 11 } }
    ]
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion 3',
    category: 'image',
    description: '빠르고 다양한 스타일 지원',
    icon: '🖼️',
    tiers: [
      { id: 'sd3-turbo', name: 'Turbo', description: '빠른 생성', specs: { resolution: '1024x1024', style: '다양함' }, pricing: { multiplier: 0.6, base: 5 } },
      { id: 'sd3-ultra', name: 'Ultra', description: '최고 품질', specs: { resolution: '2048x2048', style: '정교함' }, pricing: { multiplier: 1.0, base: 8 } }
    ]
  },
  {
    id: 'flux',
    name: 'Flux',
    category: 'image',
    description: '텍스트 렌더링과 구도에 강점',
    icon: '⚡',
    tiers: [
      { id: 'flux-schnell', name: 'Schnell', description: '초고속 생성', specs: { resolution: '1024x1024', style: '빠른' }, pricing: { multiplier: 0.5, base: 4 } },
      { id: 'flux-pro', name: 'Pro', description: '프로페셔널', specs: { resolution: '1440x1440', style: '전문가용' }, pricing: { multiplier: 1.2, base: 10 } }
    ]
  },
  {
    id: 'ideogram',
    name: 'Ideogram',
    category: 'image',
    description: '텍스트가 포함된 이미지에 특화',
    icon: '📝',
    tiers: [
      { id: 'ideogram-v2', name: 'v2.0', description: '텍스트 특화', specs: { resolution: '1024x1024', style: '타이포그래피' }, pricing: { multiplier: 0.8, base: 7 } },
      { id: 'ideogram-v2-turbo', name: 'v2.0 Turbo', description: '빠른 텍스트', specs: { resolution: '1024x1024', style: '빠른 타이포' }, pricing: { multiplier: 0.6, base: 5 } }
    ]
  },
  // ============= 텍스트 생성 서비스 =============
  {
    id: 'gpt4',
    name: 'GPT-4o',
    category: 'text',
    description: '가장 강력한 멀티모달 언어 모델',
    icon: '🧠',
    tiers: [
      { id: 'gpt4o', name: 'GPT-4o', description: '최신 모델', specs: { context: '128K', speed: '빠름' }, pricing: { multiplier: 1.0, base: 3 } },
      { id: 'gpt4o-mini', name: 'GPT-4o Mini', description: '경량 모델', specs: { context: '128K', speed: '매우 빠름' }, pricing: { multiplier: 0.3, base: 1 } }
    ]
  },
  {
    id: 'claude',
    name: 'Claude 3.5',
    category: 'text',
    description: '안전하고 유용한 AI 어시스턴트',
    icon: '🤖',
    tiers: [
      { id: 'claude-sonnet', name: 'Sonnet', description: '균형 잡힌 성능', specs: { context: '200K', speed: '빠름' }, pricing: { multiplier: 0.8, base: 2 } },
      { id: 'claude-opus', name: 'Opus', description: '최고 성능', specs: { context: '200K', speed: '보통' }, pricing: { multiplier: 1.5, base: 5 } }
    ]
  },
  {
    id: 'gemini',
    name: 'Gemini Pro',
    category: 'text',
    description: '구글의 최신 멀티모달 AI',
    icon: '💎',
    tiers: [
      { id: 'gemini-pro', name: 'Pro', description: '표준 모델', specs: { context: '1M', speed: '빠름' }, pricing: { multiplier: 0.7, base: 2 } },
      { id: 'gemini-ultra', name: 'Ultra', description: '최고 성능', specs: { context: '1M', speed: '보통' }, pricing: { multiplier: 1.2, base: 4 } }
    ]
  },
  {
    id: 'llama',
    name: 'Llama 3.1',
    category: 'text',
    description: '오픈소스 기반 강력한 모델',
    icon: '🦙',
    tiers: [
      { id: 'llama-70b', name: '70B', description: '대형 모델', specs: { context: '128K', speed: '보통' }, pricing: { multiplier: 0.5, base: 2 } },
      { id: 'llama-405b', name: '405B', description: '초대형 모델', specs: { context: '128K', speed: '느림' }, pricing: { multiplier: 1.0, base: 3 } }
    ]
  },
  {
    id: 'mistral',
    name: 'Mistral Large',
    category: 'text',
    description: '유럽 기반 고성능 모델',
    icon: '🌬️',
    tiers: [
      { id: 'mistral-medium', name: 'Medium', description: '중형 모델', specs: { context: '32K', speed: '빠름' }, pricing: { multiplier: 0.4, base: 1 } },
      { id: 'mistral-large', name: 'Large', description: '대형 모델', specs: { context: '128K', speed: '보통' }, pricing: { multiplier: 0.8, base: 3 } }
    ]
  }
];

// ============= 라이브 클래스 Mock 데이터 =============
export const LIVE_CLASSES = [
  {
    id: 1,
    title: "SORA로 시네마틱 영상 만들기 - 실시간 실습",
    instructor: "김민수 강사",
    status: "live",
    participants: 42,
    thumbnail: createPlaceholder('live', '#dc2626'),
    startTime: "14:00",
    duration: "2시간"
  },
  {
    id: 2,
    title: "VEO 고급 테크닉 - 리얼리즘 극대화",
    instructor: "박지영 강사",
    status: "upcoming",
    participants: 0,
    thumbnail: createPlaceholder('video', '#6366f1'),
    startTime: "16:00",
    duration: "1.5시간"
  },
  {
    id: 3,
    title: "멀티 AI 활용 워크플로우 - 지난 세션",
    instructor: "이준호 강사",
    status: "replay",
    participants: 38,
    thumbnail: createPlaceholder('ai', '#64748b'),
    startTime: "완료",
    duration: "2시간"
  }
];

export const LIVE_CHAT_MESSAGES = [
  { id: 1, user: "강사", message: "안녕하세요! 오늘은 SORA를 활용한 시네마틱 영상 제작을 배워보겠습니다.", isInstructor: true, time: "14:02" },
  { id: 2, user: "학습자42", message: "질문있습니다! 프롬프트 길이는 어느정도가 적당한가요?", isInstructor: false, time: "14:05" },
  { id: 3, user: "강사", message: "좋은 질문입니다. 50-100 단어 정도가 적당합니다.", isInstructor: true, time: "14:06" }
];

// ============= 기관 Mock 데이터 =============
export const INSTITUTION_DATA = {
  id: 'inst_001',
  name: '서울디지털대학교',
  logo: null,
  adminId: 'user_admin_001',
  creditPool: 50000,
  usedCredits: 12450,
  settings: {
    requireClassApproval: true,
    defaultMemberCredits: 100,
    monthlyLimitPerMember: 500
  },
  createdAt: '2024-01-01',
  stats: {
    totalRevenue: 5200000,
    totalClasses: 12,
    completionRate: 78
  }
};

export const INSTITUTION_INSTRUCTORS = [
  { id: 'inst_001', name: '김민수', email: 'minsu@sdu.ac.kr', status: 'active', classCount: 3, studentCount: 85, creditsUsed: 3200, creditsAllocated: 5000, joinDate: '2024-03-15', avatar: '#6366f1' },
  { id: 'inst_002', name: '박지영', email: 'jiyoung@sdu.ac.kr', status: 'active', classCount: 4, studentCount: 102, creditsUsed: 4100, creditsAllocated: 5000, joinDate: '2024-02-20', avatar: '#0891b2' },
  { id: 'inst_003', name: '이준호', email: 'junho@sdu.ac.kr', status: 'active', classCount: 2, studentCount: 28, creditsUsed: 1850, creditsAllocated: 3000, joinDate: '2024-05-10', avatar: '#7c3aed' },
  { id: 'inst_004', name: '최서연', email: 'seoyeon@sdu.ac.kr', status: 'pending', classCount: 0, studentCount: 0, creditsUsed: 0, creditsAllocated: 0, joinDate: '2024-06-01', avatar: '#059669' },
  { id: 'inst_005', name: '정하은', email: 'haeun@sdu.ac.kr', status: 'active', classCount: 3, studentCount: 67, creditsUsed: 3300, creditsAllocated: 4000, joinDate: '2024-04-05', avatar: '#dc2626' }
];

export const INSTITUTION_STUDENTS = [
  { id: 'std_001', name: '홍길동', email: 'hong@sdu.ac.kr', status: 'active', enrolledClasses: 3, completedClasses: 2, creditsUsed: 450, creditsAllocated: 500, progress: 85, joinDate: '2024-03-20' },
  { id: 'std_002', name: '김서현', email: 'seohyun@sdu.ac.kr', status: 'active', enrolledClasses: 2, completedClasses: 1, creditsUsed: 280, creditsAllocated: 500, progress: 62, joinDate: '2024-04-01' },
  { id: 'std_003', name: '이도윤', email: 'doyun@sdu.ac.kr', status: 'active', enrolledClasses: 4, completedClasses: 3, creditsUsed: 520, creditsAllocated: 600, progress: 91, joinDate: '2024-02-15' },
  { id: 'std_004', name: '박민서', email: 'minseo@sdu.ac.kr', status: 'inactive', enrolledClasses: 1, completedClasses: 0, creditsUsed: 50, creditsAllocated: 500, progress: 12, joinDate: '2024-05-20' },
  { id: 'std_005', name: '최예은', email: 'yeeun@sdu.ac.kr', status: 'active', enrolledClasses: 2, completedClasses: 2, creditsUsed: 400, creditsAllocated: 500, progress: 100, joinDate: '2024-03-10' },
  { id: 'std_006', name: '정우진', email: 'woojin@sdu.ac.kr', status: 'active', enrolledClasses: 3, completedClasses: 1, creditsUsed: 310, creditsAllocated: 500, progress: 45, joinDate: '2024-04-15' },
  { id: 'std_007', name: '강수아', email: 'sua@sdu.ac.kr', status: 'active', enrolledClasses: 2, completedClasses: 2, creditsUsed: 480, creditsAllocated: 500, progress: 100, joinDate: '2024-02-28' },
  { id: 'std_008', name: '윤지호', email: 'jiho@sdu.ac.kr', status: 'active', enrolledClasses: 1, completedClasses: 0, creditsUsed: 120, creditsAllocated: 300, progress: 35, joinDate: '2024-05-25' }
];

export const INSTITUTION_CLASSES = [
  { id: 'cls_001', title: 'SORA 영상 제작 마스터', instructor: '김민수', instructorId: 'inst_001', students: 32, status: 'active', approvalStatus: 'approved', revenue: 480000, startDate: '2024-04-01' },
  { id: 'cls_002', title: 'VEO 고급 테크닉', instructor: '박지영', instructorId: 'inst_002', students: 28, status: 'active', approvalStatus: 'approved', revenue: 420000, startDate: '2024-04-15' },
  { id: 'cls_003', title: 'AI 콘텐츠 창작 입문', instructor: '이준호', instructorId: 'inst_003', students: 45, status: 'active', approvalStatus: 'approved', revenue: 675000, startDate: '2024-03-20' },
  { id: 'cls_004', title: '디지털 휴먼 활용법', instructor: '정하은', instructorId: 'inst_005', students: 38, status: 'active', approvalStatus: 'approved', revenue: 570000, startDate: '2024-05-01' },
  { id: 'cls_005', title: 'Kling 실전 워크숍', instructor: '박지영', instructorId: 'inst_002', students: 22, status: 'scheduled', approvalStatus: 'pending', revenue: 0, startDate: '2024-07-01' },
  { id: 'cls_006', title: 'Midjourney 마스터클래스', instructor: '김민수', instructorId: 'inst_001', students: 0, status: 'draft', approvalStatus: 'pending', revenue: 0, startDate: null }
];

export const CREDIT_DISTRIBUTION_HISTORY = [
  { id: 1, date: '2024-06-15', type: 'allocate', target: '김민수 (교육자)', amount: 2000, note: '6월 추가 배정', admin: '기관관리자' },
  { id: 2, date: '2024-06-14', type: 'allocate', target: '신규 수강생 15명', amount: 7500, note: '신규 가입 기본 배정', admin: '시스템' },
  { id: 3, date: '2024-06-10', type: 'recharge', target: '기관 크레딧 풀', amount: 30000, note: '월간 충전', admin: '기관관리자' },
  { id: 4, date: '2024-06-05', type: 'allocate', target: '박지영 (교육자)', amount: 1500, note: '워크숍 준비', admin: '기관관리자' },
  { id: 5, date: '2024-06-01', type: 'recall', target: '비활성 수강생 3명', amount: -600, note: '미사용 크레딧 회수', admin: '기관관리자' }
];

// ============= 요금제 정의 =============
export const PRICING_PLANS: any = {
  free: {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyCredits: 50,
    features: {
      maxResolution: '720p',
      allowedTiers: ['standard'],
      concurrentJobs: 1,
      classAccess: 'sample',
      liveAccess: false,
    },
    description: '서비스 체험용',
    detailedFeatures: [
      '클래스 샘플 1회차',
      '라이브 참여 불가',
      'AI 생성 720p',
      '동시생성 1개'
    ]
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 15000,
    yearlyPrice: 144000,
    monthlyCredits: 500,
    features: {
      maxResolution: '720p',
      allowedTiers: ['standard'],
      concurrentJobs: 2,
      classAccess: 'credit',
      liveAccess: false,
    },
    description: '개인 학습자용',
    detailedFeatures: [
      '클래스 수강',
      '라이브 참여 불가',
      'AI 생성 720p',
      '동시생성 2개'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 45000,
    yearlyPrice: 432000,
    monthlyCredits: 2000,
    features: {
      maxResolution: '1080p',
      allowedTiers: ['standard', 'pro'],
      concurrentJobs: 5,
      classAccess: 'credit',
      liveAccess: 'credit',
    },
    description: '크리에이터용',
    popular: true,
    detailedFeatures: [
      '클래스 수강',
      '라이브 참여',
      'AI 생성 1080p',
      '동시생성 5개'
    ]
  },
  max: {
    id: 'max',
    name: 'Max',
    monthlyPrice: 99000,
    yearlyPrice: 948000,
    monthlyCredits: 5000,
    features: {
      maxResolution: '1080p',
      allowedTiers: ['standard', 'pro', 'max'],
      concurrentJobs: 8,
      classAccess: 'credit',
      liveAccess: 'credit',
    },
    description: '전문가용',
    detailedFeatures: [
      '클래스 수강',
      '라이브 참여',
      'AI 생성 1080p',
      '동시생성 8개'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 299000,
    yearlyPrice: 2880000,
    monthlyCredits: 10000,
    features: {
      maxResolution: '1080p',
      allowedTiers: ['standard', 'pro', 'max'],
      concurrentJobs: 8,
      classAccess: 'credit',
      liveAccess: 'credit',
      prioritySupport: true,
      dedicatedManager: true,
      customAPI: true,
    },
    description: '기업/기관용',
    detailedFeatures: [
      '클래스 수강',
      '라이브 참여',
      'AI 생성 1080p',
      '동시생성 8개',
    ],
    enterpriseFeatures: [
      '전담 계정 매니저',
      '우선 기술 지원 (24시간 이내 응답)',
      'SLA 99.9% 가동률 보장',
      '팀 시트 협의',
      'API 액세스 및 커스텀 통합',
      '월간 사용량 리포트',
      '볼륨 디스카운트 협의 가능'
    ],
    tiers: [
      {
        id: 'enterprise-team',
        name: 'Team',
        monthlyPrice: 299000,
        yearlyPrice: 2880000,
        monthlyCredits: 10000,
        teamSeats: 5,
        concurrentJobs: 10,
        description: '소규모 팀용'
      },
      {
        id: 'enterprise-business',
        name: 'Business',
        monthlyPrice: 599000,
        yearlyPrice: 5760000,
        monthlyCredits: 25000,
        teamSeats: 15,
        concurrentJobs: 20,
        description: '성장하는 비즈니스용',
        popular: true
      },
      {
        id: 'enterprise-scale',
        name: 'Scale',
        monthlyPrice: 1190000,
        yearlyPrice: 11400000,
        monthlyCredits: 60000,
        teamSeats: 50,
        concurrentJobs: 50,
        description: '대규모 조직용'
      },
      {
        id: 'enterprise-unlimited',
        name: 'Unlimited',
        monthlyPrice: null,
        yearlyPrice: null,
        monthlyCredits: 'unlimited',
        teamSeats: 'unlimited',
        concurrentJobs: 100,
        description: '맞춤 견적'
      }
    ]
  }
};

// 크레딧 소모 정책
export const CREDIT_COSTS: any = {
  class: {
    range: { min: 1500, max: 3000 },
  },
  live: {
    participation: { min: 800, max: 1500 },
    replay: { min: 600, max: 1200 },
    replayParticipant: 0
  },
  ai: {
    video: { min: 15, max: 80 },
    image: { min: 8, max: 25 },
    text: { min: 2, max: 10 }
  }
};

// 티어 레벨 매핑 (standard < pro < max)
export const TIER_LEVELS: Record<string, number> = {
  standard: 1,
  pro: 2,
  max: 3
};

// ============= 평가·모니터링 Mock 데이터 =============
export const ASSESSMENT_PARTICIPANTS = [
  {
    id: 1,
    name: "김민준",
    status: "active",
    lastActivity: "2분 전",
    promptCount: 8,
    generationCount: 5,
    submitted: false,
    anomaly: null,
    avatar: createAvatar("김", "#6366f1")
  },
  {
    id: 2,
    name: "이서연",
    status: "active",
    lastActivity: "방금",
    promptCount: 12,
    generationCount: 9,
    submitted: true,
    anomaly: null,
    avatar: createAvatar("이", "#0891b2")
  },
  {
    id: 3,
    name: "박지호",
    status: "idle",
    lastActivity: "8분 전",
    promptCount: 3,
    generationCount: 2,
    submitted: false,
    anomaly: "long_idle",
    avatar: createAvatar("박", "#7c3aed")
  },
  {
    id: 4,
    name: "최수아",
    status: "active",
    lastActivity: "1분 전",
    promptCount: 15,
    generationCount: 14,
    submitted: false,
    anomaly: "rapid_submit",
    avatar: createAvatar("최", "#059669")
  },
  {
    id: 5,
    name: "정예준",
    status: "away",
    lastActivity: "15분 전",
    promptCount: 1,
    generationCount: 0,
    submitted: false,
    anomaly: "away",
    avatar: createAvatar("정", "#dc2626")
  },
  {
    id: 6,
    name: "강하은",
    status: "active",
    lastActivity: "30초 전",
    promptCount: 6,
    generationCount: 4,
    submitted: false,
    anomaly: null,
    avatar: createAvatar("강", "#ea580c")
  }
];

export const SESSION_TIMELINE = [
  { id: 1, time: "14:00:00", action: "session_start", description: "평가 세션 시작" },
  { id: 2, time: "14:02:15", action: "prompt_write", description: "프롬프트 작성: '해변을 걷는 여성...'" },
  { id: 3, time: "14:03:30", action: "prompt_edit", description: "프롬프트 수정: 조명 키워드 추가" },
  { id: 4, time: "14:04:00", action: "generation", description: "영상 생성 요청 (Sora 2 Pro)" },
  { id: 5, time: "14:06:45", action: "generation_complete", description: "영상 생성 완료" },
  { id: 6, time: "14:07:20", action: "prompt_write", description: "프롬프트 작성: '도시의 야경...'" },
  { id: 7, time: "14:08:10", action: "generation", description: "영상 생성 요청 (Veo Standard)" },
  { id: 8, time: "14:10:30", action: "generation_complete", description: "영상 생성 완료" },
  { id: 9, time: "14:11:00", action: "save", description: "결과물 저장" }
];

export const EVALUATION_RESULTS = [
  { id: 1, name: "김민준", submitted: true, generationCount: 5, editCount: 12, score: 85, status: "graded" },
  { id: 2, name: "이서연", submitted: true, generationCount: 9, editCount: 18, score: 92, status: "graded" },
  { id: 3, name: "박지호", submitted: true, generationCount: 2, editCount: 5, score: 68, status: "graded" },
  { id: 4, name: "최수아", submitted: true, generationCount: 14, editCount: 8, score: null, status: "review" },
  { id: 5, name: "정예준", submitted: false, generationCount: 0, editCount: 1, score: null, status: "pending" },
  { id: 6, name: "강하은", submitted: true, generationCount: 4, editCount: 9, score: 78, status: "graded" }
];

export const ASSESSMENTS_LIST = [
  { id: 1, title: "1회차 실습 평가", date: "2025-01-15", participants: 24, status: "completed" },
  { id: 2, title: "2회차 프롬프트 테스트", date: "2025-01-17", participants: 22, status: "ongoing" },
  { id: 3, title: "중간 프로젝트", date: "2025-01-20", participants: 0, status: "scheduled" }
];

// 카테고리별 서비스 필터링
export const getServicesByCategory = (category: string) => AI_SERVICES.filter(s => s.category === category);
export const VIDEO_SERVICES = AI_SERVICES.filter(s => s.category === 'video');
export const IMAGE_SERVICES = AI_SERVICES.filter(s => s.category === 'image');
export const TEXT_SERVICES = AI_SERVICES.filter(s => s.category === 'text');
