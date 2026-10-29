export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
  filter?: PhotoFilter;
}

export type PhotoFilter = 'normal' | 'warm' | 'pastel' | 'vivid' | 'bw' | 'soft';

export type StripLayout = 'vertical-single' | 'vertical-double' | 'grid-2x2';

export interface FrameTheme {
  id: string;
  name: string;
  category: string;
  bgGradient: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  borderStyle: string;
  doodleType: 'chick' | 'sprout' | 'star' | 'rainbow' | 'bear' | 'crayon' | 'classic' | 'party' | 'heart';
  description: string;
}

export interface PlacedSticker {
  id: string;
  emoji: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number;
  rotation: number;
}

export interface FrameConfig {
  themeId: string;
  layout: StripLayout;
  kindergartenName: string;
  className: string;
  dateText: string;
  captionText: string;
  customBgColor?: string;
  filter: PhotoFilter;
  stickers: PlacedSticker[];
  showDoubleCutCutline: boolean;
}

export interface SavedStrip {
  id: string;
  dataUrl: string;
  createdAt: number;
  kindergartenName: string;
  className: string;
}
