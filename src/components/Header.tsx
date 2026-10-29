import React from 'react';
import { Camera, Volume2, VolumeX, Sparkles, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { playPopSound } from '../utils/audio';

interface HeaderProps {
  currentStep: 'shoot' | 'select' | 'frame' | 'result';
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenGallery: () => void;
  onReset: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  soundEnabled,
  onToggleSound,
  onOpenGallery,
  onReset,
  savedCount,
}) => {
  const steps = [
    { key: 'shoot', label: '1. 사진 촬영', icon: '📸', subtitle: '5장 찍기' },
    { key: 'select', label: '2. 4장 선택', icon: '✨', subtitle: '베스트 컷' },
    { key: 'frame', label: '3. 프레임 꾸미기', icon: '🎨', subtitle: '테마&스티커' },
    { key: 'result', label: '4. 완성 & 인쇄', icon: '🖨️', subtitle: '저장하기' },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b-2 border-amber-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <div
              onClick={() => {
                playPopSound();
                onReset();
              }}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-md shadow-amber-200/60 group-hover:scale-105 transition-transform text-2xl">
                🐥
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-jua text-2xl text-amber-900 tracking-tight flex items-center gap-1">
                    우리반 네컷
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                      유치원 포토부스
                    </span>
                  </h1>
                </div>
                <p className="font-dandi text-sm sm:text-base text-amber-800/90 font-bold tracking-tight whitespace-nowrap -mt-0.5">
                  아이들과 함께 만드는 세상에서 제일 귀여운 네컷 사진관 ✨
                </p>
              </div>
            </div>

            {/* Quick action buttons for mobile */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  onToggleSound();
                }}
                className="p-2 rounded-xl bg-amber-100/80 text-amber-900 hover:bg-amber-200 transition-colors"
                title={soundEnabled ? '소리 끄기' : '소리 켜기'}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Stepper indicator */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto py-1">
            {steps.map((st, idx) => {
              const isActive = currentStep === st.key;
              const isPast =
                (currentStep === 'select' && idx === 0) ||
                (currentStep === 'frame' && idx <= 1) ||
                (currentStep === 'result' && idx <= 2);

              return (
                <div
                  key={st.key}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-jua transition-all select-none ${
                    isActive
                      ? 'bg-amber-400 text-amber-950 shadow-xs ring-2 ring-amber-300 scale-105'
                      : isPast
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  <span className="text-base">{st.icon}</span>
                  <span className="hidden sm:inline">{st.label}</span>
                  <span className="sm:hidden">{st.label.replace(/^[0-9]\.\s*/, '')}</span>
                </div>
              );
            })}
          </div>

          {/* Controls: Sound, Gallery, Reset */}
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playPopSound();
                onToggleSound();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                soundEnabled
                  ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                  : 'bg-stone-100 border-stone-200 text-stone-400'
              }`}
              title={soundEnabled ? '효과음 켜짐' : '효과음 꺼짐'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? '효과음 ON' : '효과음 OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playPopSound();
                onOpenGallery();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 transition-all shadow-2xs"
            >
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <span>우리반 앨범</span>
              {savedCount > 0 && (
                <span className="bg-amber-500 text-white rounded-full px-1.5 py-0.2 text-[10px] font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            {currentStep !== 'shoot' && (
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  if (confirm('처음부터 다시 촬영하시겠습니까?')) {
                    onReset();
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-stone-600 hover:text-red-600 hover:bg-red-50 border border-stone-200 transition-colors"
                title="다시 처음으로"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>처음으로</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
