import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Sparkles, Upload, VideoOff, Check, Heart, Smile, Play, Pause } from 'lucide-react';
import { CapturedPhoto } from '../types';
import { POSE_GUIDES } from '../constants/poses';
import { playCountdownBeep, playShutterSound, playSuccessFanfare, playPopSound } from '../utils/audio';
import { generateSamplePhotos } from '../utils/sampleGenerator';

interface CameraCaptureProps {
  onPhotosComplete: (photos: CapturedPhoto[]) => void;
  onUseSamplePhotos: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onPhotosComplete,
  onUseSamplePhotos,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMirrored, setIsMirrored] = useState<boolean>(true);

  // Shooting state
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0); // 0 to 4 (5 photos total)
  const [countdown, setCountdown] = useState<number | null>(null); // 3, 2, 1, or null
  const [isShootingSession, setIsShootingSession] = useState<boolean>(false);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [autoContinuous, setAutoContinuous] = useState<boolean>(true); // automatically take all 5 with interval
  const [intervalCountdown, setIntervalCountdown] = useState<number | null>(null);

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
      }
      setHasCamera(true);
    } catch (err: unknown) {
      console.warn('Camera access failed or unavailable:', err);
      setHasCamera(false);
      setCameraError('카메라를 찾을 수 없거나 권한이 필요합니다. 아래의 샘플 사진 또는 파일 업로드를 이용하실 수 있어요!');
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  // Flip camera
  const toggleFacingMode = () => {
    playPopSound();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture current frame from video
  const captureFrame = useCallback((): string => {
    const video = videoRef.current;
    if (!video) return '';

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    if (isMirrored && facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.95);
  }, [isMirrored, facingMode]);

  // Single shot execution with 3, 2, 1 countdown
  const takeSingleShot = useCallback((shotIdx: number): Promise<CapturedPhoto> => {
    return new Promise((resolve) => {
      let count = 3;
      setCountdown(count);
      playCountdownBeep(count);

      const timer = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
          playCountdownBeep(count);
        } else {
          clearInterval(timer);
          setCountdown(0); // "치~즈!"

          // Flash & shutter click
          setIsFlashing(true);
          playShutterSound();

          setTimeout(() => {
            const dataUrl = captureFrame();
            setIsFlashing(false);
            setCountdown(null);

            const newPhoto: CapturedPhoto = {
              id: `photo-${Date.now()}-${shotIdx}`,
              dataUrl,
              timestamp: Date.now(),
            };
            resolve(newPhoto);
          }, 350);
        }
      }, 1000);
    });
  }, [captureFrame]);

  // Run full 5-photo session or single shot
  const startFullPhotoshoot = async () => {
    playPopSound();
    setIsShootingSession(true);
    setCapturedPhotos([]);
    setCurrentShotIndex(0);

    const photosList: CapturedPhoto[] = [];

    for (let i = 0; i < 5; i++) {
      setCurrentShotIndex(i);

      // Interval notice if not first shot
      if (i > 0 && autoContinuous) {
        for (let prep = 3; prep > 0; prep--) {
          setIntervalCountdown(prep);
          await new Promise((r) => setTimeout(r, 1000));
        }
        setIntervalCountdown(null);
      }

      const photo = await takeSingleShot(i);
      photosList.push(photo);
      setCapturedPhotos([...photosList]);
    }

    setIsShootingSession(false);
    playSuccessFanfare();

    // Transition to photo selector
    setTimeout(() => {
      onPhotosComplete(photosList);
    }, 1200);
  };

  // Teacher manual upload of 5 photos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).slice(0, 5);
    const readPromises = fileList.map((file, idx) => {
      return new Promise<CapturedPhoto>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            id: `upload-${Date.now()}-${idx}`,
            dataUrl: event.target?.result as string,
            timestamp: Date.now(),
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then((results) => {
      if (results.length > 0) {
        // If fewer than 5 uploaded, fill with samples
        if (results.length < 5) {
          const sampleUrls = generateSamplePhotos();
          for (let i = results.length; i < 5; i++) {
            results.push({
              id: `fill-sample-${i}`,
              dataUrl: sampleUrls[i % sampleUrls.length],
              timestamp: Date.now(),
            });
          }
        }
        playSuccessFanfare();
        onPhotosComplete(results);
      }
    });
  };

  const currentPose = POSE_GUIDES[currentShotIndex] || POSE_GUIDES[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
      {/* Top Banner Guide */}
      <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200 p-4 rounded-3xl border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-xs flex items-center justify-center text-3xl shrink-0">
            {currentPose.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="bg-amber-500 text-white text-xs font-jua px-2.5 py-0.5 rounded-full">
                {currentShotIndex + 1}번째 컷 추천 포즈
              </span>
              <span className="text-xs text-amber-800 font-bold">
                (총 5장 중 {currentShotIndex + 1}번째)
              </span>
            </div>
            <h2 className="font-jua text-xl text-amber-950 mt-0.5">
              {currentPose.title}
            </h2>
            <p className="text-xs text-amber-900/80 font-medium">
              {currentPose.description} • <span className="font-bold text-amber-800">{currentPose.tip}</span>
            </p>
          </div>
        </div>

        {/* Shoot Mode Toggle */}
        <div className="flex items-center gap-2 bg-white/80 p-1.5 rounded-2xl border border-amber-300/80 shrink-0 text-xs font-jua">
          <button
            type="button"
            onClick={() => {
              playPopSound();
              setAutoContinuous(true);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              autoContinuous
                ? 'bg-amber-400 text-amber-950 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            연속 5장 자동
          </button>
          <button
            type="button"
            onClick={() => {
              playPopSound();
              setAutoContinuous(false);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              !autoContinuous
                ? 'bg-amber-400 text-amber-950 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            한 장씩 천천히
          </button>
        </div>
      </div>

      {/* Camera Viewfinder Box */}
      <div className="relative aspect-4/3 w-full max-h-[540px] bg-stone-900 rounded-3xl overflow-hidden shadow-xl border-4 border-amber-300 flex items-center justify-center">
        {/* Video stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-transform duration-200 ${
            isMirrored && facingMode === 'user' ? 'scale-x-[-1]' : ''
          } ${hasCamera === false ? 'hidden' : 'block'}`}
        />

        {/* Camera flash overlay */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-20 camera-flash pointer-events-none" />
        )}

        {/* Viewfinder guides */}
        <div className="absolute inset-4 border-2 border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
          <div className="flex justify-between items-start">
            <span className="bg-black/40 backdrop-blur-md text-white text-xs font-jua px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              우리반 네컷 LIVE
            </span>
            <span className="bg-black/40 backdrop-blur-md text-amber-200 text-xs font-jua px-3 py-1 rounded-full border border-white/20">
              📸 5장 촬영 중 4장 선택
            </span>
          </div>
        </div>

        {/* Huge Countdown Display (3, 2, 1, 치즈!) */}
        {countdown !== null && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-[2px] select-none">
            <div className="flex flex-col items-center justify-center">
              {countdown > 0 ? (
                <div className="animate-bounce">
                  <div className="w-36 h-36 rounded-full bg-amber-400/90 border-8 border-white text-white font-jua text-7xl flex items-center justify-center shadow-2xl ring-8 ring-amber-300/50">
                    {countdown}
                  </div>
                  <p className="text-center font-jua text-white text-2xl drop-shadow-md mt-4">
                    준비하세요~!
                  </p>
                </div>
              ) : (
                <div className="animate-ping text-center">
                  <div className="px-8 py-4 rounded-3xl bg-pink-500 text-white font-jua text-5xl shadow-2xl border-4 border-white">
                    치~즈! 찰칵! 📸
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interval countdown between shots */}
        {intervalCountdown !== null && countdown === null && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-25 bg-amber-500/90 text-white px-5 py-2.5 rounded-2xl font-jua text-lg shadow-lg border-2 border-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>다음 컷 준비! {intervalCountdown}초 뒤 시작 ✌️</span>
          </div>
        )}

        {/* Camera Fallback if no camera */}
        {hasCamera === false && (
          <div className="absolute inset-0 bg-amber-50/95 flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-20 h-20 rounded-3xl bg-amber-200 flex items-center justify-center text-4xl mb-3 shadow-inner">
              🐥
            </div>
            <h3 className="font-jua text-2xl text-amber-950 mb-2">
              카메라가 연결되지 않았나요?
            </h3>
            <p className="text-sm text-stone-600 max-w-md mb-6 leading-relaxed">
              카메라 권한이 없거나 웹캠이 없어도 걱정 마세요!<br />
              <strong className="text-amber-800 font-bold">귀여운 우리반 캐릭터 샘플 사진</strong>으로 바로 체험하시거나, 컴퓨터에 있는 사진을 불러올 수 있어요.
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  onUseSamplePhotos();
                }}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-jua text-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                귀여운 샘플 캐릭터로 시작하기!
              </button>

              <label className="px-5 py-3 rounded-2xl bg-white border-2 border-amber-300 text-amber-900 font-jua text-base shadow-sm hover:bg-amber-50 cursor-pointer transition-all flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-600" />
                사진 파일 5장 불러오기
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* In-viewfinder quick controls */}
        {hasCamera && !isShootingSession && (
          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playPopSound();
                setIsMirrored(!isMirrored);
              }}
              className={`p-2.5 rounded-xl backdrop-blur-md border text-xs font-jua flex items-center gap-1.5 transition-all ${
                isMirrored
                  ? 'bg-white/80 border-white text-stone-900 shadow-sm'
                  : 'bg-black/50 border-white/20 text-white'
              }`}
              title="거울 모드 (좌우 반전)"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isMirrored ? '거울모드 ON' : '거울모드 OFF'}</span>
            </button>

            <button
              type="button"
              onClick={toggleFacingMode}
              className="p-2.5 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-jua flex items-center gap-1.5 transition-all"
              title="카메라 전/후면 전환"
            >
              <Camera className="w-4 h-4" />
              <span>전환</span>
            </button>
          </div>
        )}
      </div>

      {/* 5-Photo Progress Indicator & Action Area */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-amber-200 shadow-sm space-y-4">
        {/* Five Photo Slots Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-jua text-sm text-stone-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              촬영 진행 상황 ({capturedPhotos.length} / 5장)
            </span>
            <span className="text-xs text-stone-500 font-medium">
              5장을 모두 찍은 후 마음에 드는 4장을 골라요!
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {[0, 1, 2, 3, 4].map((idx) => {
              const photo = capturedPhotos[idx];
              const isCurrent = isShootingSession && currentShotIndex === idx;

              return (
                <div
                  key={idx}
                  className={`aspect-4/3 rounded-2xl border-2 overflow-hidden relative flex flex-col items-center justify-center transition-all ${
                    photo
                      ? 'border-emerald-400 bg-emerald-50 shadow-xs ring-2 ring-emerald-300'
                      : isCurrent
                      ? 'border-amber-400 bg-amber-50 animate-pulse ring-2 ring-amber-300'
                      : 'border-dashed border-stone-300 bg-stone-50 text-stone-400'
                  }`}
                >
                  {photo ? (
                    <>
                      <img
                        src={photo.dataUrl}
                        alt={`Shot ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] font-jua px-1.5 py-0.2 rounded-md">
                        #{idx + 1}
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-1">
                      <span className="text-base sm:text-xl">
                        {POSE_GUIDES[idx].emoji}
                      </span>
                      <p className="text-[10px] sm:text-xs font-jua text-stone-600 mt-0.5">
                        #{idx + 1}컷
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Big Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {!isShootingSession ? (
            <>
              <button
                type="button"
                onClick={startFullPhotoshoot}
                disabled={hasCamera === false}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-jua text-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ring-4 ring-amber-200"
              >
                <Camera className="w-7 h-7" />
                <span>3, 2, 1 찰칵! 5장 촬영 시작하기</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  onUseSamplePhotos();
                }}
                className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-stone-100 hover:bg-amber-100 text-amber-900 font-jua text-base border-2 border-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="카메라 대신 샘플 캐릭터 5장으로 즉시 테스트"
              >
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>샘플 캐릭터 5장으로 체험</span>
              </button>
            </>
          ) : (
            <div className="w-full py-3 px-6 rounded-2xl bg-amber-100 border-2 border-amber-400 text-amber-950 font-jua text-lg flex items-center justify-center gap-3 animate-pulse">
              <Camera className="w-6 h-6 text-amber-600" />
              <span>
                {currentShotIndex + 1}번째 사진 찍는 중입니다... 포즈를 취해주세요!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
