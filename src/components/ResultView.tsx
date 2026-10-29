import React, { useRef, useEffect, useState } from 'react';
import { CapturedPhoto, FrameConfig, FrameTheme, SavedStrip } from '../types';
import { FRAME_THEMES } from '../constants/frames';
import { renderPhotoStripToCanvas } from '../utils/canvasRenderer';
import { playPopSound, playSuccessFanfare } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Download,
  Printer,
  Sparkles,
  RotateCcw,
  Palette,
  Heart,
  Share2,
  Check,
  Bookmark,
} from 'lucide-react';

interface ResultViewProps {
  selectedPhotos: CapturedPhoto[];
  config: FrameConfig;
  onEditFrame: () => void;
  onRestart: () => void;
  onSaveToGallery: (strip: SavedStrip) => void;
  isAlreadySaved: boolean;
}

export const ResultView: React.FC<ResultViewProps> = ({
  selectedPhotos,
  config,
  onEditFrame,
  onRestart,
  onSaveToGallery,
  isAlreadySaved,
}) => {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const printCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isSaved, setIsSaved] = useState<boolean>(isAlreadySaved);
  const [downloading, setDownloading] = useState<boolean>(false);

  const currentTheme = FRAME_THEMES.find((t) => t.id === config.themeId) || FRAME_THEMES[0];

  // Confetti on load
  useEffect(() => {
    playSuccessFanfare();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EC4899', '#10B981', '#3B82F6', '#8B5CF6'],
      });
    } catch {
      // ignore
    }
  }, []);

  // Render preview canvas
  useEffect(() => {
    if (previewCanvasRef.current) {
      renderPhotoStripToCanvas(previewCanvasRef.current, {
        photos: selectedPhotos,
        theme: currentTheme,
        config: config,
        exportScale: 1.5,
      });
    }
  }, [selectedPhotos, currentTheme, config]);

  // Handle Download High-Res
  const handleDownload = async () => {
    playPopSound();
    setDownloading(true);

    try {
      // Render to offscreen canvas with 2.5x high-res
      const exportCanvas = document.createElement('canvas');
      await renderPhotoStripToCanvas(exportCanvas, {
        photos: selectedPhotos,
        theme: currentTheme,
        config: config,
        exportScale: 2.5,
      });

      const dataUrl = exportCanvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const filename = `${config.kindergartenName || '우리반'}_${config.className || '네컷'}_${new Date()
        .toISOString()
        .slice(0, 10)}.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();

      // Confetti burst on successful download
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  // Handle Save to Local Album
  const handleSaveToAlbum = async () => {
    playPopSound();
    if (isSaved) return;

    const exportCanvas = document.createElement('canvas');
    await renderPhotoStripToCanvas(exportCanvas, {
      photos: selectedPhotos,
      theme: currentTheme,
      config: config,
      exportScale: 1.5,
    });

    const dataUrl = exportCanvas.toDataURL('image/jpeg', 0.9);
    const newStrip: SavedStrip = {
      id: `strip-${Date.now()}`,
      dataUrl,
      createdAt: Date.now(),
      kindergartenName: config.kindergartenName || '우리 유치원',
      className: config.className || '우리반 네컷',
    };

    onSaveToGallery(newStrip);
    setIsSaved(true);
  };

  // Handle Print
  const handlePrint = () => {
    playPopSound();
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-4 py-1.5 rounded-full font-jua text-sm border border-amber-300">
          <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
          <span>4단계: 우리반 네컷이 완성되었어요! 🎉</span>
        </div>
        <h2 className="font-jua text-3xl sm:text-4xl text-amber-950">
          세상에서 가장 특별한 우리들의 추억 💖
        </h2>
        <p className="text-sm sm:text-base text-stone-600 font-medium">
          완성된 네컷 사진을 다운로드하거나 유치원 프린터로 바로 인쇄할 수 있어요.
        </p>
      </div>

      {/* Main Preview Container */}
      <div className="flex flex-col items-center">
        <div
          id="printable-photo-strip"
          className="bg-stone-800 p-4 sm:p-6 rounded-3xl shadow-2xl border-4 border-amber-300 flex flex-col items-center max-w-full overflow-hidden"
        >
          <canvas
            ref={previewCanvasRef}
            className="max-h-[640px] w-auto h-auto object-contain rounded-2xl shadow-xl transition-all"
          />
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="bg-white p-5 rounded-3xl border-2 border-amber-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Download High Res PNG */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-jua text-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer ring-2 ring-amber-300"
          >
            <Download className="w-6 h-6" />
            <span>{downloading ? '저장하는 중...' : '고화질 사진 다운로드'}</span>
          </button>

          {/* Direct Print */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-jua text-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer ring-2 ring-emerald-300"
          >
            <Printer className="w-6 h-6" />
            <span>프린터로 바로 인쇄하기</span>
          </button>

          {/* Save to Local Album */}
          <button
            type="button"
            onClick={handleSaveToAlbum}
            className={`px-6 py-4 rounded-2xl font-jua text-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer border-2 ${
              isSaved
                ? 'bg-amber-100 border-amber-300 text-amber-900 cursor-default'
                : 'bg-white hover:bg-amber-50 border-amber-400 text-amber-900 shadow-sm'
            }`}
          >
            {isSaved ? <Check className="w-6 h-6 text-emerald-600" /> : <Bookmark className="w-6 h-6 text-amber-600" />}
            <span>{isSaved ? '우리반 앨범에 보관됨' : '우리반 앨범에 저장'}</span>
          </button>
        </div>

        {/* Secondary options */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-stone-200">
          <button
            type="button"
            onClick={() => {
              playPopSound();
              onEditFrame();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-jua text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Palette className="w-4 h-4 text-amber-600" />
            <span>프레임 / 문구 다시 수정하기</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playPopSound();
              if (confirm('새로운 네컷 촬영을 시작하시겠어요?')) {
                onRestart();
              }
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 font-jua text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors border border-amber-300"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>다음 친구들 촬영하러 가기 📸</span>
          </button>
        </div>
      </div>
    </div>
  );
};
