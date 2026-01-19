'use client';

import { useState } from 'react';
import { Search, Filter, Grid, List, Heart, Eye, Download, Play, Image as ImageIcon } from 'lucide-react';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/components/AuthProvider';
import { createResult } from '@/lib/data';

// Mock 갤러리 데이터
const GALLERY_ITEMS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  type: i % 3 === 0 ? 'video' : 'image',
  title: `AI 생성 작품 #${i + 1}`,
  prompt: '시네마틱한 일몰 풍경, 해변가에서 바라본 황금빛 하늘, 드라마틱한 구름',
  thumbnail: createResult(i),
  author: ['김민준', '이서연', '박지호', '최수아'][i % 4],
  authorAvatar: ['#6366f1', '#0891b2', '#7c3aed', '#059669'][i % 4],
  likes: Math.floor(Math.random() * 100) + 10,
  views: Math.floor(Math.random() * 500) + 50,
  createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR'),
  aiService: ['Sora', 'Midjourney', 'DALL-E', 'Flux'][i % 4],
}));

const GalleryCard = ({ item, onClick }: { item: any; onClick: () => void }) => (
  <div 
    className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
    onClick={onClick}
  >
    <div className="relative aspect-video">
      <img 
        src={item.thumbnail}
        alt={item.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          {item.type === 'video' ? (
            <Play className="w-12 h-12 text-white" />
          ) : (
            <Eye className="w-8 h-8 text-white" />
          )}
        </div>
      </div>
      <div className="absolute top-3 left-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.type === 'video' ? 'bg-red-500 text-white' : 'bg-indigo-500 text-white'
        }`}>
          {item.type === 'video' ? '영상' : '이미지'}
        </span>
      </div>
      <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
        {item.aiService}
      </div>
    </div>
    
    <div className="p-4">
      <h3 className="font-medium text-neutral-900 mb-2 line-clamp-1">{item.title}</h3>
      <p className="text-sm text-neutral-500 mb-3 line-clamp-2">{item.prompt}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: item.authorAvatar }}
          >
            {item.author.charAt(0)}
          </div>
          <span className="text-sm text-neutral-600">{item.author}</span>
        </div>
        
        <div className="flex items-center gap-3 text-neutral-400 text-sm">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{item.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{item.views}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function MediaGalleryPage() {
  const { user, profile, isLoggedIn, wallet, login, logout, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogin = (userData: any) => {
    login(userData);
    setShowAuthModal(false);
  };

  // 필터링된 아이템
  const filteredItems = GALLERY_ITEMS.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-24">
      <Header 
        isLoggedIn={isLoggedIn}
        user={user}
        profile={profile}
        wallet={wallet}
        onAuthClick={handleAuthClick}
        onLogout={logout}
      />

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">갤러리</h1>
          <p className="text-neutral-600">AI로 생성된 작품들을 둘러보세요</p>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="작품 검색..."
                className="pl-12 pr-4 py-3 w-80 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilterType('video')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'video' ? 'bg-indigo-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                영상
              </button>
              <button
                onClick={() => setFilterType('image')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'image' ? 'bg-indigo-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                이미지
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-neutral-400'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-neutral-400'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 갤러리 그리드 */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
        }`}>
          {filteredItems.map(item => (
            <GalleryCard
              key={item.id}
              item={item}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16 text-neutral-500">
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedItem.thumbnail}
              alt={selectedItem.title}
              className="w-full aspect-video object-cover"
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-neutral-900">{selectedItem.title}</h2>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-neutral-100 rounded-lg">
                    <Heart className="w-5 h-5 text-neutral-600" />
                  </button>
                  <button className="p-2 hover:bg-neutral-100 rounded-lg">
                    <Download className="w-5 h-5 text-neutral-600" />
                  </button>
                </div>
              </div>
              
              <div className="bg-neutral-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-neutral-500 mb-1">프롬프트</p>
                <p className="text-neutral-700">{selectedItem.prompt}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: selectedItem.authorAvatar }}
                  >
                    {selectedItem.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{selectedItem.author}</p>
                    <p className="text-sm text-neutral-500">{selectedItem.createdAt}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" /> {selectedItem.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {selectedItem.views}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onLogin={handleLogin}
      />
    </div>
  );
}
