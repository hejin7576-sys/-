import React, { useState } from 'react';
import { CapturedPhoto } from '../types';
import { Check, ArrowRight, RotateCcw, ArrowLeft, ArrowUpDown, Sparkles } from 'lucide-react';
import { playPopSound } from '../utils/audio';

interface PhotoSelectorProps {
  photos: CapturedPhoto[];
  onConfirmSelection: (selectedPhotos: CapturedPhoto[]) => void;
  onRetake: () => void;
}

export const PhotoSelector: React.FC<PhotoSelectorProps> = ({
  photos,
  onConfirmSelection,
  onRetake,
}) => {
  // Array of 4 photo IDs in chosen order
  // Pre-select first 4 photos by default so user can immediately proceed or customize easily!
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    return photos.slice(0, 4).map((p) => p.id);
  });

  const handleTogglePhoto = (id: string) => {
    playPopSound();
    if (selectedIds.includes(id)) {
      // Unselect
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      // Select if less than 4
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      } else {
        // If already 4 selected, replace the last one or prompt
        const next = [...selectedIds.slice(0, 3), id];
        setSelectedIds(next);
      }
    }
  };

  const handleMoveOrder = (index: number, direction: 'prev' | 'next') => {
    playPopSound();
    const newIdx = direction === 'prev' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= selectedIds.length) return;

    const copy = [...selectedIds];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;
    setSelectedIds(copy);
  };

  const selectedPhotos = selectedIds
    .map((id) => photos.find((p) => p.id === id))
    .filter(Boolean) as CapturedPhoto[];

  const isComplete = selectedIds.length === 4;

  const handleProceed = () => {
    if (!isComplete) return;
    playPopSound();
    onConfirmSelection(selectedPhotos);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Title & Guidance */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-4 py-1.5 rounded-full font-jua text-sm border border-amber-300">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>2단계: 우리반 베스트 4컷 고르기</span>
        </div>
        <h2 className="font-jua text-3xl sm:text-4xl text-amber-950">
          5장 중 가장 마음에 드는 4장을 골라주세요!
        </h2>
        <p className="text-sm sm:text-base text-stone-600 font-medium">
          사진을 클릭하여 선택하거나 순서를 바꿀 수 있어요. (선택된 순서 1, 2, 3, 4로 네컷에 들어가요)
        </p>
      </div>

      {/* 5 Photos Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {photos.map((photo, index) => {
          const selectionIndex = selectedIds.indexOf(photo.id);
          const isSelected = selectionIndex !== -1;

          return (
            <div
              key={photo.id}
              onClick={() => handleTogglePhoto(photo.id)}
              className={`relative aspect-4/3 rounded-3xl overflow-hidden cursor-pointer transition-all duration-200 select-none group ${
                isSelected
                  ? 'ring-4 ring-amber-500 scale-[1.03] shadow-lg bg-amber-50'
                  : 'opacity-75 hover:opacity-100 border-2 border-stone-200 hover:border-amber-300 shadow-sm'
              }`}
            >
              <img
                src={photo.dataUrl}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />

              {/* Original Shot Label */}
              <div className="absolute top-2.5 left-2.5 bg-black/60 text-white text-xs font-jua px-2.5 py-1 rounded-xl backdrop-blur-xs">
                촬영 #{index + 1}
              </div>

              {/* Selection Badge */}
              {isSelected ? (
                <div className="absolute top-2.5 right-2.5 w-9 h-9 rounded-2xl bg-amber-500 text-white font-jua text-lg flex items-center justify-center shadow-md border-2 border-white animate-in zoom-in-75">
                  {selectionIndex + 1}
                </div>
              ) : (
                <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-2xl bg-white/80 hover:bg-white text-stone-400 font-jua text-xs flex items-center justify-center border border-stone-300 shadow-xs">
                  선택
                </div>
              )}

              {/* Bottom tag */}
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between text-white">
                <span className="text-[11px] font-jua">
                  {isSelected ? `네컷 ${selectionIndex + 1}번째 자리` : '클릭하여 선택'}
                </span>
                {isSelected && (
                  <span className="bg-emerald-500 text-white p-0.5 rounded-full">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected 4 Slots Preview & Order Adjustment Bar */}
      <div className="bg-white p-5 rounded-3xl border-2 border-amber-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-jua text-lg text-amber-950">
              네컷 프레임 배치 순서
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                isComplete
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {selectedIds.length} / 4장 선택됨
            </span>
          </div>

          <div className="text-xs text-stone-500 font-medium">
            화살표를 눌러 사진의 상/하 순서를 손쉽게 바꿀 수 있어요!
          </div>
        </div>

        {/* 4 Preview Slots */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((slotIdx) => {
            const photo = selectedPhotos[slotIdx];

            return (
              <div
                key={slotIdx}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                  photo
                    ? 'border-amber-300 bg-amber-50/50'
                    : 'border-dashed border-stone-300 bg-stone-50 text-stone-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-jua text-xs text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                    {slotIdx + 1}번째 칸
                  </span>

                  {photo && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={slotIdx === 0}
                        onClick={() => handleMoveOrder(slotIdx, 'prev')}
                        className="p-1 rounded-md hover:bg-amber-200 disabled:opacity-30 disabled:hover:bg-transparent text-amber-900"
                        title="앞으로 이동"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={slotIdx === selectedPhotos.length - 1}
                        onClick={() => handleMoveOrder(slotIdx, 'next')}
                        className="p-1 rounded-md hover:bg-amber-200 disabled:opacity-30 disabled:hover:bg-transparent text-amber-900"
                        title="뒤로 이동"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="w-full aspect-4/3 rounded-xl overflow-hidden bg-stone-200 relative">
                  {photo ? (
                    <img
                      src={photo.dataUrl}
                      alt={`Slot ${slotIdx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-jua text-stone-400">
                      사진을 선택하세요
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            playPopSound();
            onRetake();
          }}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-jua text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-stone-200"
        >
          <RotateCcw className="w-4 h-4" />
          <span>다시 5장 촬영하기</span>
        </button>

        <button
          type="button"
          disabled={!isComplete}
          onClick={handleProceed}
          className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-jua text-xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg ${
            isComplete
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-amber-200/80 active:scale-95'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
          }`}
        >
          <span>프레임 꾸미러 가기</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
