import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CapturedPhoto, FrameConfig, FrameTheme, PlacedSticker, PhotoFilter, StripLayout } from '../types';
import { FRAME_THEMES } from '../constants/frames';
import { STICKER_LIST, StickerItem } from '../constants/stickers';
import { renderPhotoStripToCanvas } from '../utils/canvasRenderer';
import { playPopSound } from '../utils/audio';
import {
  Palette,
  Sparkles,
  Type,
  LayoutGrid,
  Smile,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Scissors,
  Check,
  RotateCw,
  Plus,
  Minus,
} from 'lucide-react';

interface FrameCustomizerProps {
  selectedPhotos: CapturedPhoto[];
  initialConfig: FrameConfig;
  onConfirm: (config: FrameConfig) => void;
  onBack: () => void;
}

export const FrameCustomizer: React.FC<FrameCustomizerProps> = ({
  selectedPhotos,
  initialConfig,
  onConfirm,
  onBack,
}) => {
  const [config, setConfig] = useState<FrameConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<'theme' | 'layout' | 'text' | 'filter' | 'sticker'>('theme');
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentTheme = FRAME_THEMES.find((t) => t.id === config.themeId) || FRAME_THEMES[0];

  // Render canvas preview whenever config or photos change
  const updateCanvasPreview = useCallback(async () => {
    if (!canvasRef.current) return;
    await renderPhotoStripToCanvas(canvasRef.current, {
      photos: selectedPhotos,
      theme: currentTheme,
      config: config,
      exportScale: 1, // preview scale
    });
  }, [selectedPhotos, currentTheme, config]);

  useEffect(() => {
    updateCanvasPreview();
  }, [updateCanvasPreview]);

  // Handle adding a sticker
  const handleAddSticker = (stickerItem: StickerItem) => {
    playPopSound();
    const newSticker: PlacedSticker = {
      id: `sticker-${Date.now()}`,
      emoji: stickerItem.emoji,
      x: 35 + Math.random() * 30, // center-ish percentage
      y: 30 + Math.random() * 40,
      scale: 1.2,
      rotation: Math.floor(Math.random() * 30) - 15,
    };
    setConfig((prev) => ({
      ...prev,
      stickers: [...prev.stickers, newSticker],
    }));
    setSelectedStickerId(newSticker.id);
  };

  const handleUpdateSticker = (id: string, updates: Partial<PlacedSticker>) => {
    setConfig((prev) => ({
      ...prev,
      stickers: prev.stickers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const handleRemoveSticker = (id: string) => {
    playPopSound();
    setConfig((prev) => ({
      ...prev,
      stickers: prev.stickers.filter((s) => s.id !== id),
    }));
    if (selectedStickerId === id) {
      setSelectedStickerId(null);
    }
  };

  const handleClearAllStickers = () => {
    playPopSound();
    setConfig((prev) => ({
      ...prev,
      stickers: [],
    }));
    setSelectedStickerId(null);
  };

  const filters: { id: PhotoFilter; label: string; icon: string }[] = [
    { id: 'normal', label: '기본 원본', icon: '✨' },
    { id: 'pastel', label: '화사한 파스텔', icon: '🌸' },
    { id: 'warm', label: '따뜻한 햇살', icon: '☀️' },
    { id: 'vivid', label: '생생한 비비드', icon: '🎨' },
    { id: 'soft', label: '뽀샤시 소프트', icon: '☁️' },
    { id: 'bw', label: '감성 흑백', icon: '🎞️' },
  ];

  const layouts: { id: StripLayout; label: string; desc: string; icon: string }[] = [
    { id: 'vertical-single', label: '세로 1줄 네컷', desc: '클래식 인생네컷 스타일', icon: '📱' },
    { id: 'vertical-double', label: '세로 2줄 (1+1)', desc: '자르면 2장이 되는 인쇄용!', icon: '✂️' },
    { id: 'grid-2x2', label: '2x2 바둑판 그리드', desc: '엽서 / 액자형 포스터', icon: '🖼️' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-amber-100/70 p-3.5 rounded-2xl border border-amber-300 text-center sm:text-left">
        <div>
          <h2 className="font-jua text-2xl text-amber-950 flex items-center gap-2 justify-center sm:justify-start">
            <span>🎨 3단계: 우리반 프레임 & 스티커 꾸미기</span>
          </h2>
          <p className="text-xs text-amber-900/80 font-medium">
            반 이름과 테마 프레임을 선택하고, 스티커로 아기자기하게 꾸며보세요!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playPopSound();
              onBack();
            }}
            className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 font-jua text-xs hover:bg-stone-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>사진 다시 고르기</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playPopSound();
              onConfirm(config);
            }}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-jua text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span>완성 및 인쇄하러 가기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Controls, Right Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Customization Controls (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-amber-200 shadow-sm p-4 sm:p-5 space-y-5">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-2xl overflow-x-auto text-xs font-jua">
            <button
              type="button"
              onClick={() => {
                playPopSound();
                setActiveTab('theme');
              }}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'theme'
                  ? 'bg-amber-400 text-amber-950 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>테마 프레임</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playPopSound();
                setActiveTab('layout');
              }}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'layout'
                  ? 'bg-amber-400 text-amber-950 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>레이아웃</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playPopSound();
                setActiveTab('text');
              }}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-amber-400 text-amber-950 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>문구 & 반 이름</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playPopSound();
                setActiveTab('filter');
              }}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'filter'
                  ? 'bg-amber-400 text-amber-950 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>사진 필터</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playPopSound();
                setActiveTab('sticker');
              }}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'sticker'
                  ? 'bg-amber-400 text-amber-950 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              <span>스티커 꾸미기 ({config.stickers.length})</span>
            </button>
          </div>

          {/* TAB 1: THEME SELECTION */}
          {activeTab === 'theme' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-jua text-sm text-stone-700">
                  원하는 유치원 테마 프레임을 선택하세요:
                </span>
                <span className="text-xs text-amber-700 font-bold">
                  현재: {currentTheme.name}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FRAME_THEMES.map((th) => {
                  const isSelected = config.themeId === th.id;
                  return (
                    <div
                      key={th.id}
                      onClick={() => {
                        playPopSound();
                        setConfig((prev) => ({
                          ...prev,
                          themeId: th.id,
                          customBgColor: undefined, // reset custom override
                        }));
                      }}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 shadow-sm ring-2 ring-amber-300'
                          : 'border-stone-200 hover:border-amber-300 bg-stone-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">
                          {th.doodleType === 'chick' && '🐥'}
                          {th.doodleType === 'sprout' && '🌱'}
                          {th.doodleType === 'rainbow' && '🌈'}
                          {th.doodleType === 'heart' && '🍓'}
                          {th.doodleType === 'star' && '⭐'}
                          {th.doodleType === 'bear' && '🐻'}
                          {th.doodleType === 'crayon' && '🖍️'}
                          {th.doodleType === 'party' && '🎈'}
                          {th.doodleType === 'classic' && '📷'}
                        </span>
                        {isSelected && (
                          <span className="bg-amber-500 text-white rounded-full p-0.5">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-jua text-sm text-stone-900">
                          {th.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 truncate">
                          {th.description}
                        </p>
                      </div>

                      {/* Color Preview Swatch */}
                      <div
                        className="h-2 rounded-full w-full border border-black/10"
                        style={{ backgroundColor: th.bgColor }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LAYOUT SELECTION */}
          {activeTab === 'layout' && (
            <div className="space-y-4">
              <span className="font-jua text-sm text-stone-700 block">
                네컷 사진 레이아웃을 선택하세요:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {layouts.map((ly) => {
                  const isSelected = config.layout === ly.id;
                  return (
                    <div
                      key={ly.id}
                      onClick={() => {
                        playPopSound();
                        setConfig((prev) => ({ ...prev, layout: ly.id }));
                      }}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 shadow-sm ring-2 ring-amber-300'
                          : 'border-stone-200 hover:border-amber-300 bg-white'
                      }`}
                    >
                      <span className="text-3xl">{ly.icon}</span>
                      <h4 className="font-jua text-base text-stone-900">
                        {ly.label}
                      </h4>
                      <p className="text-xs text-stone-500 leading-tight">
                        {ly.desc}
                      </p>
                      {isSelected && (
                        <span className="mt-1 text-xs font-jua text-amber-700 bg-amber-200/80 px-2 py-0.5 rounded-full">
                          선택됨
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {config.layout === 'vertical-double' && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Scissors className="w-4 h-4 text-amber-600" />
                    가운데 가위 절취선 표시하기
                  </span>
                  <input
                    type="checkbox"
                    checked={config.showDoubleCutCutline}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        showDoubleCutCutline: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TEXT & NAMES */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block font-jua text-xs text-stone-700 mb-1">
                  유치원 / 어린이집 이름
                </label>
                <input
                  type="text"
                  value={config.kindergartenName}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, kindergartenName: e.target.value }))
                  }
                  placeholder="예: 햇살어린이집, 꿈나무유치원"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none font-dandi text-base"
                />
              </div>

              <div>
                <label className="block font-jua text-xs text-stone-700 mb-1">
                  우리 반 이름 (상단 타이틀)
                </label>
                <input
                  type="text"
                  value={config.className}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, className: e.target.value }))
                  }
                  placeholder="예: 개나리반 네컷, 사랑반 포토존"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none font-dandi text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-jua text-xs text-stone-700 mb-1">
                    촬영 날짜
                  </label>
                  <input
                    type="text"
                    value={config.dateText}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, dateText: e.target.value }))
                    }
                    placeholder="2026.10.29"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none font-dandi text-base"
                  />
                </div>

                <div>
                  <label className="block font-jua text-xs text-stone-700 mb-1">
                    하단 기념 문구 / 캡션
                  </label>
                  <input
                    type="text"
                    value={config.captionText}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, captionText: e.target.value }))
                    }
                    placeholder="오늘도 반짝반짝 빛나는 우리반 💖"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none font-dandi text-base"
                  />
                </div>
              </div>

              {/* Quick Preset Subtitles */}
              <div>
                <span className="text-[11px] font-jua text-stone-500 block mb-1.5">
                  자주 쓰는 추천 문구:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '오늘도 반짝반짝 빛나는 우리들 💖',
                    '선생님이 세상에서 제일 사랑해 🥰',
                    '함께해서 더욱 행복한 우리반 🌟',
                    '무럭무럭 건강하게 자라나요 🌱',
                    '오늘 우리반 최고였어요! 👍',
                    '우리들의 소중한 유치원 추억 📸',
                  ].map((phrase) => (
                    <button
                      key={phrase}
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setConfig((prev) => ({ ...prev, captionText: phrase }));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-xs font-dandi text-stone-800 transition-colors cursor-pointer"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PHOTO FILTERS */}
          {activeTab === 'filter' && (
            <div className="space-y-3">
              <span className="font-jua text-sm text-stone-700 block">
                사진 색감 필터를 선택하세요:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filters.map((fl) => {
                  const isSelected = config.filter === fl.id;
                  return (
                    <div
                      key={fl.id}
                      onClick={() => {
                        playPopSound();
                        setConfig((prev) => ({ ...prev, filter: fl.id }));
                      }}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 shadow-sm ring-2 ring-amber-300'
                          : 'border-stone-200 hover:border-amber-300 bg-stone-50/50'
                      }`}
                    >
                      <span className="text-2xl">{fl.icon}</span>
                      <div className="flex-1">
                        <span className="font-jua text-xs text-stone-900 block">
                          {fl.label}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="bg-amber-500 text-white rounded-full p-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: STICKERS */}
          {activeTab === 'sticker' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-jua text-sm text-stone-700 block">
                    원하는 스티커를 클릭하여 네컷에 붙여보세요!
                  </span>
                  <span className="text-xs text-stone-500">
                    붙인 스티커는 아래 컨트롤로 크기/각도를 조절할 수 있어요.
                  </span>
                </div>

                {config.stickers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllStickers}
                    className="text-xs text-red-600 hover:text-red-700 font-jua flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>스티커 모두 지우기</span>
                  </button>
                )}
              </div>

              {/* Sticker list */}
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200 max-h-56 overflow-y-auto">
                {STICKER_LIST.map((stk) => (
                  <button
                    key={stk.id}
                    type="button"
                    onClick={() => handleAddSticker(stk)}
                    className="h-12 rounded-xl bg-white hover:bg-amber-100 border border-stone-200 text-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-90 shadow-2xs cursor-pointer"
                    title={stk.name}
                  >
                    {stk.emoji}
                  </button>
                ))}
              </div>

              {/* Active Sticker Adjustments */}
              {selectedStickerId && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 space-y-2">
                  <div className="flex items-center justify-between text-xs font-jua text-amber-900">
                    <span>선택된 스티커 위치/크기 조절</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSticker(selectedStickerId)}
                      className="text-red-600 hover:text-red-700 flex items-center gap-1 font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> 이 스티커 삭제
                    </button>
                  </div>

                  {(() => {
                    const activeSticker = config.stickers.find((s) => s.id === selectedStickerId);
                    if (!activeSticker) return null;

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="font-jua text-stone-600">크기:</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSticker(selectedStickerId, {
                                scale: Math.max(0.6, activeSticker.scale - 0.2),
                              })
                            }
                            className="p-1 rounded bg-white border border-stone-300 hover:bg-amber-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSticker(selectedStickerId, {
                                scale: Math.min(2.5, activeSticker.scale + 0.2),
                              })
                            }
                            className="p-1 rounded bg-white border border-stone-300 hover:bg-amber-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="font-jua text-stone-600">회전:</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSticker(selectedStickerId, {
                                rotation: (activeSticker.rotation + 15) % 360,
                              })
                            }
                            className="px-2 py-1 rounded bg-white border border-stone-300 hover:bg-amber-100 flex items-center gap-1 font-jua"
                          >
                            <RotateCw className="w-3 h-3" /> +15°
                          </button>
                        </div>

                        <div className="col-span-2 flex items-center gap-2">
                          <span className="font-jua text-stone-600">상하 위치:</span>
                          <input
                            type="range"
                            min="5"
                            max="90"
                            value={activeSticker.y}
                            onChange={(e) =>
                              handleUpdateSticker(selectedStickerId, {
                                y: Number(e.target.value),
                              })
                            }
                            className="flex-1 accent-amber-500"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Real-time Live Canvas Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full bg-stone-800/90 p-4 rounded-3xl shadow-xl border-4 border-amber-300 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-white/80 text-xs font-jua mb-3 px-1">
              <span>미리보기</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px]">
                {config.layout === 'vertical-double'
                  ? '세로 2줄 1+1'
                  : config.layout === 'grid-2x2'
                  ? '2x2 그리드'
                  : '세로 1줄'}
              </span>
            </div>

            {/* Canvas Container with responsive height */}
            <div className="w-full flex justify-center overflow-hidden rounded-2xl max-h-[620px] bg-stone-900/50 p-2">
              <canvas
                ref={canvasRef}
                className="max-h-[600px] w-auto h-auto object-contain rounded-xl shadow-2xl transition-all"
              />
            </div>

            <p className="text-[11px] text-stone-300 text-center font-jua mt-3">
              💡 다음 단계에서 고화질 이미지 다운로드 및 프린트 출력이 가능해요!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
