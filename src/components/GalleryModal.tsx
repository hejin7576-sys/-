import React from 'react';
import { SavedStrip } from '../types';
import { X, Download, Trash2, Calendar, Sparkles } from 'lucide-react';
import { playPopSound } from '../utils/audio';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedStrips: SavedStrip[];
  onDeleteStrip: (id: string) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  savedStrips,
  onDeleteStrip,
}) => {
  if (!isOpen) return null;

  const handleDownloadSingle = (strip: SavedStrip) => {
    playPopSound();
    const link = document.createElement('a');
    link.download = `${strip.kindergartenName}_${strip.className}_${new Date(strip.createdAt)
      .toISOString()
      .slice(0, 10)}.jpg`;
    link.href = strip.dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border-4 border-amber-300 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200 border-b-2 border-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-xl shadow-xs">
              📸
            </div>
            <div>
              <h3 className="font-jua text-2xl text-amber-950 flex items-center gap-2">
                <span>우리반 네컷 사진첩</span>
                <span className="text-xs bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">
                  {savedStrips.length}장
                </span>
              </h3>
              <p className="text-xs text-amber-900/80">
                오늘 찍은 소중한 네컷 사진들을 모아볼 수 있어요
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="p-2 rounded-2xl bg-white/80 hover:bg-white text-stone-500 hover:text-stone-900 transition-colors shadow-2xs"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Strips List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {savedStrips.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="text-5xl">🐥</div>
              <h4 className="font-jua text-xl text-stone-700">
                아직 저장된 네컷 사진이 없어요!
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                아이들과 신나게 5장을 촬영하고 마음에 드는 4장을 골라 네컷을 완성해 보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedStrips.map((strip) => {
                const dateStr = new Date(strip.createdAt).toLocaleDateString('ko-KR', {
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={strip.id}
                    className="bg-stone-50 rounded-2xl border-2 border-stone-200 overflow-hidden hover:border-amber-400 transition-all flex flex-col group shadow-xs"
                  >
                    <div className="aspect-[3/5] bg-stone-900 flex items-center justify-center p-2 relative overflow-hidden">
                      <img
                        src={strip.dataUrl}
                        alt="Saved Strip"
                        className="max-h-full w-auto object-contain rounded-lg transition-transform group-hover:scale-105"
                      />
                    </div>

                    <div className="p-3 bg-white flex-1 flex flex-col justify-between gap-2 border-t border-stone-100">
                      <div>
                        <h5 className="font-jua text-sm text-stone-900 truncate">
                          {strip.className}
                        </h5>
                        <p className="text-[11px] text-stone-500 truncate flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => handleDownloadSingle(strip)}
                          className="flex-1 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-jua text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>저장</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            playPopSound();
                            if (confirm('이 사진을 앨범에서 삭제하시겠습니까?')) {
                              onDeleteStrip(strip.id);
                            }
                          }}
                          className="p-1.5 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-jua text-sm transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
