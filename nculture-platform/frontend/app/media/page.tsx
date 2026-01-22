'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/components/AuthProvider';
import { getMediaGallery } from '@/lib/api';
import { MOCK_THUMBNAILS } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Play, ChevronDown, X, Sparkles } from 'lucide-react';

const MediaGalleryPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStyle, setActiveStyle] = useState<string | null>(null);
  const [selectedWork, setSelectedWork] = useState<any>(null);

  const categories = [
    { id: 'all', label: '전체' },
    { id: 'video', label: '영상' },
    { id: 'image', label: '이미지' },
    { id: 'featured', label: '추천' },
  ];

  const styles = [
    { id: 'cinematic', label: 'Cinematic', color: 'from-amber-500 to-orange-600' },
    { id: 'anime', label: 'Anime', color: 'from-pink-500 to-purple-600' },
    { id: 'realistic', label: 'Realistic', color: 'from-emerald-500 to-teal-600' },
    { id: 'abstract', label: 'Abstract', color: 'from-indigo-500 to-purple-600' },
    { id: 'vintage', label: 'Vintage', color: 'from-amber-600 to-yellow-500' },
    { id: 'noir', label: 'Noir', color: 'from-neutral-600 to-neutral-800' },
    { id: 'sketch', label: 'Sketch', color: 'from-neutral-400 to-neutral-600' },
    { id: 'comic', label: 'Comic', color: 'from-red-500 to-pink-500' },
    { id: 'surreal', label: 'Surreal', color: 'from-violet-500 to-fuchsia-500' },
    { id: 'minimalist', label: 'Minimalist', color: 'from-slate-400 to-slate-600' },
  ];

  const demoWorks = [
    { id: 1, title: '도시의 밤', creator: '김민준', course: 'AI 영상 생성', style: 'cinematic', type: 'video', likes: 234, thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400', featured: true, prompt: '네온 불빛이 반짝이는 밤의 도시 거리, 비 온 뒤 젖은 아스팔트에 반사되는 조명들, 시네마틱한 분위기, 4K', model: 'Sora Pro', createdAt: '2025-01-15', creditsUsed: 12 },
    { id: 2, title: '꿈의 정원', creator: '이서연', course: 'AI 이미지 생성', style: 'surreal', type: 'image', likes: 189, thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400', featured: true, prompt: '공중에 떠 있는 섬 위의 환상적인 정원, 거대한 꽃들과 빛나는 나비들, 초현실적인 분위기', model: 'Midjourney', createdAt: '2025-01-14', creditsUsed: 8 },
    { id: 3, title: '미래 도시', creator: '박지호', course: 'AI 영상 생성', style: 'cinematic', type: 'video', likes: 312, thumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400', featured: false, prompt: '2150년의 서울, 하늘을 나는 자동차들과 홀로그램 광고판, 미래지향적인 건축물', model: 'Runway Gen-3', createdAt: '2025-01-13', creditsUsed: 15 },
    { id: 4, title: '고양이의 하루', creator: '최수아', course: 'AI 영상 생성', style: 'anime', type: 'video', likes: 456, thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', featured: true, prompt: '귀여운 고양이가 창가에서 햇살을 받으며 낮잠 자는 모습, 지브리 스타일 애니메이션', model: 'Kling Pro', createdAt: '2025-01-12', creditsUsed: 10 },
    { id: 5, title: '추상적 감정', creator: '정예준', course: 'AI 이미지 생성', style: 'abstract', type: 'image', likes: 145, thumbnail: 'https://images.unsplash.com/photo-1541356665065-22676f35dd40?w=400', featured: false, prompt: '기쁨과 슬픔이 혼합된 감정을 색상과 형태로 표현, 추상 표현주의', model: 'DALL-E 3', createdAt: '2025-01-11', creditsUsed: 6 },
    { id: 6, title: '빈티지 카페', creator: '한소희', course: 'AI 이미지 생성', style: 'vintage', type: 'image', likes: 278, thumbnail: 'https://images.unsplash.com/photo-1453614512568-c4024d13bc1b?w=400', featured: true, prompt: '1950년대 파리의 작은 카페, 따뜻한 조명과 빈티지 가구, 필름 그레인 효과', model: 'Midjourney', createdAt: '2025-01-10', creditsUsed: 8 },
    { id: 7, title: '도시 탐정', creator: '윤도현', course: 'AI 영상 생성', style: 'noir', type: 'video', likes: 198, thumbnail: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400', featured: false, prompt: '비 내리는 밤, 가로등 아래 서 있는 트렌치코트를 입은 탐정, 흑백 필름 누아르', model: 'Sora Standard', createdAt: '2025-01-09', creditsUsed: 10 },
    { id: 8, title: '봄의 스케치', creator: '김나영', course: 'AI 이미지 생성', style: 'sketch', type: 'image', likes: 167, thumbnail: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400', featured: false, prompt: '연필 스케치 스타일의 벚꽃 나무와 그 아래 벤치, 부드러운 선과 음영', model: 'Stable Diffusion', createdAt: '2025-01-08', creditsUsed: 5 },
    { id: 9, title: '슈퍼히어로', creator: '이준호', course: 'AI 영상 생성', style: 'comic', type: 'video', likes: 389, thumbnail: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400', featured: true, prompt: '마블 코믹스 스타일의 슈퍼히어로가 도시를 지키는 장면, 역동적인 액션', model: 'Runway Gen-3', createdAt: '2025-01-07', creditsUsed: 18 },
    { id: 10, title: '우주 여행', creator: '박서연', course: 'AI 영상 생성', style: 'cinematic', type: 'video', likes: 421, thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400', featured: true, prompt: '우주선이 토성의 고리를 지나가는 장면, 인터스텔라 스타일의 시네마틱 샷', model: 'Sora Pro', createdAt: '2025-01-06', creditsUsed: 20 },
    { id: 11, title: '일본 거리', creator: '최민수', course: 'AI 이미지 생성', style: 'anime', type: 'image', likes: 234, thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400', featured: false, prompt: '비 오는 도쿄의 골목길, 네온사인과 우산을 쓴 사람들, 신카이 마코토 스타일', model: 'Midjourney', createdAt: '2025-01-05', creditsUsed: 8 },
    { id: 12, title: '미니멀 공간', creator: '정다은', course: 'AI 이미지 생성', style: 'minimalist', type: 'image', likes: 156, thumbnail: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400', featured: false, prompt: '순백의 공간에 놓인 단 하나의 의자, 극도로 단순한 구성과 빛의 그라데이션', model: 'DALL-E 3', createdAt: '2025-01-04', creditsUsed: 6 },
    { id: 13, title: '산속의 오두막', creator: '김태현', course: 'AI 이미지 생성', style: 'realistic', type: 'image', likes: 342, thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400', featured: true, prompt: '안개 낀 산속의 작은 통나무 오두막, 굴뚝에서 피어오르는 연기, 포토리얼리스틱', model: 'Midjourney', createdAt: '2025-01-03', creditsUsed: 8 },
    { id: 14, title: '바다 위의 일출', creator: '이하늘', course: 'AI 영상 생성', style: 'realistic', type: 'video', likes: 287, thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', featured: false, prompt: '고요한 바다 위로 떠오르는 태양, 수평선에 반사되는 황금빛, 드론 촬영 스타일', model: 'Sora Standard', createdAt: '2025-01-02', creditsUsed: 12 },
    { id: 15, title: '도심 속 자연', creator: '박준영', course: 'AI 이미지 생성', style: 'realistic', type: 'image', likes: 198, thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', featured: true, prompt: '고층 빌딩 사이로 자란 거대한 나무, 도시와 자연의 공존, 하이퍼리얼리즘', model: 'Stable Diffusion', createdAt: '2025-01-01', creditsUsed: 7 },
    { id: 16, title: '색의 흐름', creator: '최예린', course: 'AI 영상 생성', style: 'abstract', type: 'video', likes: 267, thumbnail: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400', featured: true, prompt: '액체처럼 흐르는 색상들의 춤, 음악에 맞춰 변화하는 추상적 형태', model: 'Runway Gen-3', createdAt: '2024-12-31', creditsUsed: 14 },
    { id: 17, title: '기하학적 꿈', creator: '정민서', course: 'AI 이미지 생성', style: 'abstract', type: 'image', likes: 189, thumbnail: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400', featured: false, prompt: '삼각형과 원이 조화를 이루는 기하학적 패턴, 칸딘스키 스타일', model: 'DALL-E 3', createdAt: '2024-12-30', creditsUsed: 6 },
    { id: 18, title: '옛날 사진관', creator: '윤서현', course: 'AI 이미지 생성', style: 'vintage', type: 'image', likes: 312, thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', featured: false, prompt: '1920년대 사진관의 내부, 대형 카메라와 빈티지 소품들, 세피아 톤', model: 'Midjourney', createdAt: '2024-12-29', creditsUsed: 8 },
    { id: 19, title: '1960년대 거리', creator: '한지우', course: 'AI 영상 생성', style: 'vintage', type: 'video', likes: 234, thumbnail: 'https://images.unsplash.com/photo-1531219432768-9f540ce91ef3?w=400', featured: true, prompt: '1960년대 뉴욕 거리, 클래식 자동차들과 빈티지 패션의 사람들', model: 'Sora Standard', createdAt: '2024-12-28', creditsUsed: 11 },
    { id: 20, title: '비 오는 골목', creator: '김도윤', course: 'AI 이미지 생성', style: 'noir', type: 'image', likes: 276, thumbnail: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=400', featured: true, prompt: '어두운 골목에 비가 내리고, 단 하나의 가로등이 빛을 비추는 장면, 필름 누아르', model: 'Midjourney', createdAt: '2024-12-27', creditsUsed: 8 },
    { id: 21, title: '그림자 속의 남자', creator: '이승우', course: 'AI 영상 생성', style: 'noir', type: 'video', likes: 198, thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400', featured: false, prompt: '그림자 속에서 담배 연기를 내뿜는 남자, 흑백 영화 느낌', model: 'Runway Gen-3', createdAt: '2024-12-26', creditsUsed: 13 },
    { id: 22, title: '연필로 그린 풍경', creator: '박소율', course: 'AI 이미지 생성', style: 'sketch', type: 'image', likes: 145, thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400', featured: false, prompt: '연필 스케치로 그린 프랑스 시골 마을 풍경, 섬세한 선과 음영', model: 'Stable Diffusion', createdAt: '2024-12-25', creditsUsed: 5 },
    { id: 23, title: '스케치북 여행', creator: '최유진', course: 'AI 영상 생성', style: 'sketch', type: 'video', likes: 234, thumbnail: 'https://images.unsplash.com/photo-1502657877623-f66bf489d236?w=400', featured: true, prompt: '스케치북에 그림이 그려지는 과정, 여행지의 풍경들이 차례로 완성되는 영상', model: 'Kling Standard', createdAt: '2024-12-24', creditsUsed: 9 },
    { id: 24, title: '만화 속 세상', creator: '정하준', course: 'AI 이미지 생성', style: 'comic', type: 'image', likes: 367, thumbnail: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400', featured: false, prompt: '리히텐슈타인 스타일의 팝아트, 말풍선과 벤데이 도트 패턴', model: 'DALL-E 3', createdAt: '2024-12-23', creditsUsed: 6 },
    { id: 25, title: '팝 아트 초상화', creator: '윤지아', course: 'AI 이미지 생성', style: 'comic', type: 'image', likes: 289, thumbnail: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400', featured: true, prompt: '앤디 워홀 스타일의 4분할 초상화, 각각 다른 색상 조합', model: 'Midjourney', createdAt: '2024-12-22', creditsUsed: 8 },
    { id: 26, title: '녹아내리는 시계', creator: '한서윤', course: 'AI 이미지 생성', style: 'surreal', type: 'image', likes: 412, thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400', featured: true, prompt: '달리의 기억의 지속성에서 영감받은 녹아내리는 시계들, 초현실적 사막 풍경', model: 'Midjourney', createdAt: '2024-12-21', creditsUsed: 8 },
    { id: 27, title: '하늘을 나는 물고기', creator: '김지원', course: 'AI 영상 생성', style: 'surreal', type: 'video', likes: 356, thumbnail: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=400', featured: false, prompt: '도시 하늘을 유영하는 거대한 금붕어들, 꿈같은 초현실적 장면', model: 'Sora Pro', createdAt: '2024-12-20', creditsUsed: 16 },
    { id: 28, title: '빈 공간의 미학', creator: '이도현', course: 'AI 이미지 생성', style: 'minimalist', type: 'image', likes: 178, thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', featured: false, prompt: '넓은 흰 벽과 작은 창문 하나, 극도로 미니멀한 공간 구성', model: 'DALL-E 3', createdAt: '2024-12-19', creditsUsed: 6 },
    { id: 29, title: '선과 여백', creator: '박채원', course: 'AI 영상 생성', style: 'minimalist', type: 'video', likes: 203, thumbnail: 'https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=400', featured: true, prompt: '단순한 선들이 천천히 그려지며 형태를 만들어가는 미니멀 애니메이션', model: 'Runway Gen-3', createdAt: '2024-12-18', creditsUsed: 10 },
    { id: 30, title: '벚꽃 아래', creator: '최서아', course: 'AI 이미지 생성', style: 'anime', type: 'image', likes: 523, thumbnail: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400', featured: true, prompt: '벚꽃이 흩날리는 학교 운동장, 교복 입은 소녀가 서 있는 장면, 애니메이션 스타일', model: 'Midjourney', createdAt: '2024-12-17', creditsUsed: 8 },
    { id: 31, title: '사이버펑크 도쿄', creator: '정유나', course: 'AI 영상 생성', style: 'anime', type: 'video', likes: 445, thumbnail: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400', featured: true, prompt: '네온 불빛이 가득한 미래의 도쿄 거리, 사이버펑크 애니메이션 스타일', model: 'Kling Pro', createdAt: '2024-12-16', creditsUsed: 12 },
  ].map((work, index) => ({
    ...work,
    thumbnail: MOCK_THUMBNAILS[index % MOCK_THUMBNAILS.length]
  }));

  const [works, setWorks] = useState(demoWorks);

  const mapMediaItem = (item: any) => ({
    id: item?.id,
    title: item?.title || '작품',
    creator: item?.creator || item?.user_name || item?.user?.name || '익명',
    course: item?.course || item?.course_title || 'AI 생성',
    style: item?.style || 'cinematic',
    type: item?.type || item?.media_type || 'image',
    likes: item?.likes || 0,
    thumbnail: item?.thumbnail_url || item?.url || item?.thumbnail || '',
    featured: !!item?.featured,
    prompt: item?.prompt || '',
    model: item?.ai_service || item?.ai_service_name || '',
    createdAt: item?.created_at ? new Date(item.created_at).toISOString().slice(0, 10) : item?.createdAt || '',
    creditsUsed: item?.credits_used || item?.creditsUsed || 0
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let isActive = true;

    getMediaGallery()
      .then((data) => {
        if (!isActive) return;
        if (Array.isArray(data) && data.length > 0) {
          setWorks(data.map(mapMediaItem));
        }
      })
      .catch((error) => {
        console.error('Failed to load media gallery:', error);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const filteredWorks = works.filter(work => {
    if (activeCategory === 'featured') return work.featured;
    if (activeCategory === 'video') return work.type === 'video';
    if (activeCategory === 'image') return work.type === 'image';
    if (activeStyle) return work.style === activeStyle;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#E8F3FF] to-[#F9FAFB]" />
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 py-12 relative">
          <div className="bg-white/90 backdrop-blur-md border border-[#E5E8EB] rounded-3xl p-8 md:p-10 shadow-sm">
            <h1 className="text-3xl md:text-4xl font-bold text-[#191F28] mb-2 tracking-tight">갤러리</h1>
            <p className="text-[#6B7684] text-base md:text-lg">수강생들이 만든 우수 작품을 만나보세요</p>
          </div>
        </div>
      </div>

      <div className="border-b border-[#E5E8EB] bg-white/95 backdrop-blur-sm sticky top-16 z-10 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-[#6B7684] text-sm font-medium flex-shrink-0">Style</span>
            <div className="h-4 w-px bg-[#E5E8EB] flex-shrink-0" />
            {styles.map(style => (
              <button
                key={style.id}
                onClick={() => setActiveStyle(activeStyle === style.id ? null : style.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeStyle === style.id
                    ? `bg-gradient-to-r ${style.color} text-white shadow-lg`
                    : 'bg-[#F2F4F6] text-[#6B7684] hover:bg-[#E5E8EB]'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-[#3182F6] text-white'
                    : 'bg-[#F2F4F6] text-[#6B7684] hover:bg-[#E5E8EB]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="text-sm text-[#6B7684]">
            {filteredWorks.length}개의 작품
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredWorks.map((work, index) => (
            <div
              key={work.id}
              onClick={() => setSelectedWork(work)}
              className={`group relative rounded-2xl overflow-hidden bg-white border border-[#E5E8EB] cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
                index % 5 === 0 ? 'row-span-2' : ''
              }`}
            >
              <div className={`relative ${index % 5 === 0 ? 'aspect-[3/4]' : 'aspect-video'}`}>
                <img
                  src={work.thumbnail}
                  alt={work.title}
                  className="w-full h-full object-cover"
                />
                {work.type === 'video' && (
                  <div className="absolute top-3 left-3 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                )}
                {work.featured && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-[#E8F3FF] rounded-full">
                    <span className="text-xs font-medium text-[#3182F6]">추천</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <h3 className="text-white font-semibold mb-1">{work.title}</h3>
                  <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#3182F6] rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">{work.creator.charAt(0)}</span>
                    </div>
                    <span className="text-sm text-white/80">{work.creator}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/70">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                      <span className="text-sm">{work.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <button className="px-8 py-3 bg-[#3182F6] text-white rounded-xl hover:bg-[#1B64DA] transition-colors flex items-center gap-2">
            더 많은 작품 보기
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {selectedWork && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-8" onClick={() => setSelectedWork(null)}>
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex border border-[#E5E8EB] shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="w-1/2 bg-[#191F28] relative">
              <img 
                src={selectedWork.thumbnail} 
                alt={selectedWork.title}
                className="w-full h-full object-cover"
              />
              {selectedWork.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="w-1/2 p-6 overflow-y-auto">
              <div className="flex justify-end mb-4">
                <button 
                  onClick={() => setSelectedWork(null)}
                  className="p-2 hover:bg-[#F2F4F6] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#6B7684]" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${
                    styles.find(s => s.id === selectedWork.style)?.color || 'from-neutral-500 to-neutral-600'
                  } text-white`}>
                    {styles.find(s => s.id === selectedWork.style)?.label || selectedWork.style}
                  </span>
                  <span className="px-2 py-1 bg-[#F2F4F6] text-[#6B7684] text-xs rounded-full">
                    {selectedWork.type === 'video' ? '영상' : '이미지'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-[#191F28]">{selectedWork.title}</h2>
              </div>
              
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#E5E8EB]">
                <div className="w-12 h-12 bg-[#3182F6] rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-white">{selectedWork.creator.charAt(0)}</span>
                </div>
                <div>
                  <div className="font-medium text-[#191F28]">{selectedWork.creator}</div>
                  <div className="text-sm text-[#6B7684]">{selectedWork.course}</div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#191F28] mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#3182F6]" />
                  사용된 프롬프트
                </h3>
                <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E8EB]">
                  <p className="text-sm text-[#333D4B] leading-relaxed">{selectedWork.prompt}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E8EB]">
                  <div className="text-xs text-[#8B95A1] mb-1">사용 모델</div>
                  <div className="font-medium text-[#191F28]">{selectedWork.model}</div>
                </div>
                <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E8EB]">
                  <div className="text-xs text-[#8B95A1] mb-1">사용 크레딧</div>
                  <div className="font-medium text-[#FF9100]">{selectedWork.creditsUsed} 크레딧</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-4 border-t border-[#E5E8EB]">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-[#6B7684]">
                    <svg className="w-5 h-5 text-[#F44336]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                    </svg>
                    <span className="font-medium">{selectedWork.likes}</span>
                  </div>
                  <div className="text-sm text-[#6B7684]">{selectedWork.createdAt}</div>
                </div>
                <button className="px-4 py-2 bg-[#3182F6] text-white text-sm font-semibold rounded-lg hover:bg-[#1B64DA] transition-colors">
                  이 스타일로 만들기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function MediaPage() {
  const { isLoggedIn, user, viewMode, currentRole, wallet, userPlan, handleAuthClick, handleLogout, setCurrentPage, handleRoleSwitch, currentPage } = useAuth();

  return (
    <>
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isLoggedIn={isLoggedIn}
        user={user}
        viewMode={viewMode}
        currentRole={currentRole}
        onAuthClick={handleAuthClick}
        onLogout={handleLogout}
        wallet={wallet}
        userPlan={userPlan}
        onRoleSwitch={handleRoleSwitch}
      />
      <MediaGalleryPage />
    </>
  );
}
