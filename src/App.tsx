/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CapturedPhoto, FrameConfig, SavedStrip } from './types';
import { FRAME_THEMES } from './constants/frames';
import { Header } from './components/Header';
import { CameraCapture } from './components/CameraCapture';
import { PhotoSelector } from './components/PhotoSelector';
import { FrameCustomizer } from './components/FrameCustomizer';
import { ResultView } from './components/ResultView';
import { GalleryModal } from './components/GalleryModal';
import { toggleSound, isSoundEnabled, playPopSound } from './utils/audio';
import { generateSamplePhotos } from './utils/sampleGenerator';

export default function App() {
  const [currentStep, setCurrentStep] = useState<'shoot' | 'select' | 'frame' | 'result'>('shoot');

  // Step 1: 5 photos taken
  const [allCapturedPhotos, setAllCapturedPhotos] = useState<CapturedPhoto[]>([]);

  // Step 2: 4 photos selected out of 5
  const [selectedPhotos, setSelectedPhotos] = useState<CapturedPhoto[]>([]);

  // Sound state
  const [soundOn, setSoundOn] = useState<boolean>(() => {
    return isSoundEnabled();
  });

  // Gallery state
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [savedStrips, setSavedStrips] = useState<SavedStrip[]>(() => {
    try {
      const stored = localStorage.getItem('our_class_4cuts_gallery');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Today's date formatted
  const todayStr = (() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  })();

  // Frame Config state
  const [frameConfig, setFrameConfig] = useState<FrameConfig>({
    themeId: 'chick-yellow',
    layout: 'vertical-single',
    kindergartenName: '병아리어린이집',
    className: '햇살반 네컷 🐥',
    dateText: todayStr,
    captionText: '오늘도 반짝반짝 빛나는 우리들 💖',
    filter: 'normal',
    stickers: [],
    showDoubleCutCutline: true,
  });

  // Save gallery to localStorage
  const handleSaveToGallery = (strip: SavedStrip) => {
    setSavedStrips((prev) => {
      const next = [strip, ...prev];
      try {
        localStorage.setItem('our_class_4cuts_gallery', JSON.stringify(next));
      } catch (e) {
        console.warn('Storage limit reached:', e);
      }
      return next;
    });
  };

  const handleDeleteFromGallery = (id: string) => {
    setSavedStrips((prev) => {
      const next = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem('our_class_4cuts_gallery', JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  // Step 1 -> Step 2
  const handlePhotosCaptured = (photos: CapturedPhoto[]) => {
    setAllCapturedPhotos(photos);
    setCurrentStep('select');
  };

  // Instant Sample Photos
  const handleUseSamplePhotos = () => {
    const samples = generateSamplePhotos();
    const photoObjs: CapturedPhoto[] = samples.map((url, i) => ({
      id: `sample-${Date.now()}-${i}`,
      dataUrl: url,
      timestamp: Date.now(),
    }));
    setAllCapturedPhotos(photoObjs);
    setCurrentStep('select');
  };

  // Step 2 -> Step 3
  const handleSelectionConfirmed = (chosen4: CapturedPhoto[]) => {
    setSelectedPhotos(chosen4);
    setCurrentStep('frame');
  };

  // Step 3 -> Step 4
  const handleFrameConfirmed = (newConfig: FrameConfig) => {
    setFrameConfig(newConfig);
    setCurrentStep('result');
  };

  // Reset photoshoot
  const handleReset = () => {
    setAllCapturedPhotos([]);
    setSelectedPhotos([]);
    setCurrentStep('shoot');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-yellow-50/40 to-orange-50/60 flex flex-col font-sans">
      {/* Top Kindergarten Header */}
      <Header
        currentStep={currentStep}
        soundEnabled={soundOn}
        onToggleSound={handleToggleSound}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onReset={handleReset}
        savedCount={savedStrips.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Step 1: Camera capture (5 shots with 3, 2, 1 countdown) */}
        {currentStep === 'shoot' && (
          <CameraCapture
            onPhotosComplete={handlePhotosCaptured}
            onUseSamplePhotos={handleUseSamplePhotos}
          />
        )}

        {/* Step 2: Choose 4 out of 5 photos */}
        {currentStep === 'select' && (
          <PhotoSelector
            photos={allCapturedPhotos}
            onConfirmSelection={handleSelectionConfirmed}
            onRetake={() => setCurrentStep('shoot')}
          />
        )}

        {/* Step 3: Kindergarten Frame & Stickers Customizer */}
        {currentStep === 'frame' && (
          <FrameCustomizer
            selectedPhotos={selectedPhotos}
            initialConfig={frameConfig}
            onConfirm={handleFrameConfirmed}
            onBack={() => setCurrentStep('select')}
          />
        )}

        {/* Step 4: Final Result & Print/Download */}
        {currentStep === 'result' && (
          <ResultView
            selectedPhotos={selectedPhotos}
            config={frameConfig}
            onEditFrame={() => setCurrentStep('frame')}
            onRestart={handleReset}
            onSaveToGallery={handleSaveToGallery}
            isAlreadySaved={savedStrips.some(
              (s) =>
                s.className === frameConfig.className &&
                Math.abs(s.createdAt - Date.now()) < 10000
            )}
          />
        )}
      </main>

      {/* Kindergarten Classroom Footer */}
      <footer className="py-4 border-t border-amber-200/80 text-center text-xs text-amber-800/80 font-jua">
        <p>우리들의 즐거운 유치원 생활 • 우리반 네컷 포토부스 🐥🌱</p>
      </footer>

      {/* Saved Strips Gallery Modal */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        savedStrips={savedStrips}
        onDeleteStrip={handleDeleteFromGallery}
      />
    </div>
  );
}
