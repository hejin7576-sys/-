import { CapturedPhoto, FrameConfig, FrameTheme } from '../types';

interface RenderOptions {
  photos: CapturedPhoto[];
  theme: FrameTheme;
  config: FrameConfig;
  exportScale?: number; // 1 for preview, 2 or 3 for high-res download
}

export async function renderPhotoStripToCanvas(
  canvas: HTMLCanvasElement,
  options: RenderOptions
): Promise<void> {
  const { photos, theme, config, exportScale = 1 } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const layout = config.layout;

  // Base canvas dimensions (before scale)
  let baseWidth = 600;
  let baseHeight = 1800;

  if (layout === 'vertical-double') {
    baseWidth = 1240;
    baseHeight = 1800;
  } else if (layout === 'grid-2x2') {
    baseWidth = 1200;
    baseHeight = 1480;
  }

  canvas.width = baseWidth * exportScale;
  canvas.height = baseHeight * exportScale;

  // Preload custom BusanDandi font if document.fonts is supported
  try {
    if (typeof document !== 'undefined' && document.fonts) {
      await document.fonts.load('24px "BusanDandiHandwriting"');
    }
  } catch {
    // continue
  }

  // Load photo images
  const loadedImages: HTMLImageElement[] = await Promise.all(
    photos.slice(0, 4).map((p) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
        img.src = p.dataUrl;
      });
    })
  );

  ctx.save();
  ctx.scale(exportScale, exportScale);

  // Background
  const effectiveBgColor = config.customBgColor || theme.bgColor;

  if (layout === 'vertical-double') {
    // Render left strip and right strip
    const stripWidth = 600;
    const gap = 40;

    // Outer backdrop
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, baseWidth, baseHeight);

    // Left Strip
    drawSingleStrip(ctx, 0, 0, stripWidth, baseHeight, theme, config, effectiveBgColor, loadedImages);

    // Right Strip
    drawSingleStrip(ctx, stripWidth + gap, 0, stripWidth, baseHeight, theme, config, effectiveBgColor, loadedImages);

    // Center dotted scissor cutting line
    if (config.showDoubleCutCutline) {
      ctx.save();
      const cutX = stripWidth + gap / 2;
      ctx.beginPath();
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2;
      ctx.moveTo(cutX, 40);
      ctx.lineTo(cutX, baseHeight - 40);
      ctx.stroke();

      // Scissor emoji in center
      ctx.setLineDash([]);
      ctx.font = '22px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✂️', cutX, 60);
      ctx.fillText('✂️', cutX, baseHeight / 2);
      ctx.fillText('✂️', cutX, baseHeight - 60);
      ctx.restore();
    }
  } else if (layout === 'grid-2x2') {
    drawGrid2x2(ctx, baseWidth, baseHeight, theme, config, effectiveBgColor, loadedImages);
  } else {
    // Single vertical strip
    drawSingleStrip(ctx, 0, 0, baseWidth, baseHeight, theme, config, effectiveBgColor, loadedImages);
  }

  // Draw placed user stickers
  drawStickers(ctx, config.stickers, baseWidth, baseHeight);

  ctx.restore();
}

function drawSingleStrip(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  width: number,
  height: number,
  theme: FrameTheme,
  config: FrameConfig,
  bgColor: string,
  images: HTMLImageElement[]
) {
  ctx.save();
  ctx.translate(startX, startY);

  // Background fill
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Subtle border
  ctx.strokeStyle = theme.accentColor + '55';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, width - 8, height - 8);

  // Decorative themed doodles / background motifs
  drawThemedDecorations(ctx, theme, width, height, 'vertical');

  // Top Title Area (Height ~ 140)
  const headerHeight = 135;
  ctx.fillStyle = theme.textColor;
  ctx.textAlign = 'center';

  // Kindergarten Badge / Subtitle
  ctx.font = 'bold 22px "BusanDandiHandwriting", "Jua", sans-serif';
  const kgName = config.kindergartenName || '우리 유치원';
  ctx.fillText(`✨ ${kgName} ✨`, width / 2, 45);

  // Class Name Title
  ctx.font = 'bold 36px "BusanDandiHandwriting", "Jua", sans-serif';
  const className = config.className || '우리반 네컷';
  ctx.fillText(className, width / 2, 88);

  // Tiny cute divider line
  ctx.beginPath();
  ctx.strokeStyle = theme.accentColor;
  ctx.lineWidth = 3;
  ctx.moveTo(width / 2 - 60, 105);
  ctx.lineTo(width / 2 + 60, 105);
  ctx.stroke();

  // Photo slots area: 4 photos stacked vertically
  const photoMarginX = 35;
  const photoWidth = width - photoMarginX * 2; // 530
  const photoHeight = 330;
  const gap = 24;
  const photosStartY = 135;

  for (let i = 0; i < 4; i++) {
    const slotY = photosStartY + i * (photoHeight + gap);
    const img = images[i];

    // Card shadow / border
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    ctx.beginPath();
    ctx.roundRect(photoMarginX, slotY, photoWidth, photoHeight, [16]);
    ctx.fill();
    ctx.restore();

    // Inner photo clip
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoMarginX + 6, slotY + 6, photoWidth - 12, photoHeight - 12, [12]);
    ctx.clip();

    if (img && img.complete && img.naturalWidth > 0) {
      // Apply filter
      applyCanvasFilter(ctx, config.filter);

      // Center crop cover fit
      drawImageCover(ctx, img, photoMarginX + 6, slotY + 6, photoWidth - 12, photoHeight - 12);
    } else {
      // Placeholder if missing
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(photoMarginX + 6, slotY + 6, photoWidth - 12, photoHeight - 12);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '28px "Jua", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`사진 ${i + 1}`, photoMarginX + photoWidth / 2, slotY + photoHeight / 2);
    }
    ctx.restore();

    // Photo slot number stamp badge
    ctx.save();
    ctx.fillStyle = theme.accentColor;
    ctx.beginPath();
    ctx.arc(photoMarginX + 26, slotY + 26, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px "Jua", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${i + 1}`, photoMarginX + 26, slotY + 26);
    ctx.restore();
  }

  // Bottom Footer Area (Y ~ 1580 to 1800)
  const footerStartY = photosStartY + 4 * (photoHeight + gap) + 10;
  ctx.fillStyle = theme.textColor;
  ctx.textAlign = 'center';

  // Caption memo
  const caption = config.captionText || '오늘도 반짝반짝 빛나는 우리들 💖';
  ctx.font = '28px "BusanDandiHandwriting", "Gaegu", cursive, sans-serif';
  ctx.fillText(caption, width / 2, footerStartY + 35);

  // Date and Brand Logo
  const dateStr = config.dateText || new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  ctx.font = 'bold 20px "BusanDandiHandwriting", "Jua", sans-serif';
  ctx.fillStyle = theme.textColor;
  ctx.fillText(dateStr, width / 2, footerStartY + 70);

  // Decorative mini barcode / brand stamp
  ctx.save();
  ctx.fillStyle = theme.textColor;
  ctx.font = '13px "Jua", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('★ OUR CLASS 4-CUTS ★', width / 2, footerStartY + 98);
  ctx.restore();

  ctx.restore();
}

function drawGrid2x2(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: FrameTheme,
  config: FrameConfig,
  bgColor: string,
  images: HTMLImageElement[]
) {
  ctx.save();

  // Background fill
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = theme.accentColor + '55';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, width - 12, height - 12);

  drawThemedDecorations(ctx, theme, width, height, 'grid');

  // Header
  ctx.fillStyle = theme.textColor;
  ctx.textAlign = 'center';

  const kgName = config.kindergartenName || '우리 유치원';
  ctx.font = 'bold 26px "BusanDandiHandwriting", "Jua", sans-serif';
  ctx.fillText(`✨ ${kgName} ✨`, width / 2, 60);

  const className = config.className || '우리반 네컷';
  ctx.font = 'bold 44px "BusanDandiHandwriting", "Jua", sans-serif';
  ctx.fillText(className, width / 2, 115);

  // 2x2 grid layout
  const marginX = 50;
  const gridStartY = 150;
  const gap = 24;
  const photoW = (width - marginX * 2 - gap) / 2; // ~538
  const photoH = 500;

  const positions = [
    { x: marginX, y: gridStartY },
    { x: marginX + photoW + gap, y: gridStartY },
    { x: marginX, y: gridStartY + photoH + gap },
    { x: marginX + photoW + gap, y: gridStartY + photoH + gap },
  ];

  for (let i = 0; i < 4; i++) {
    const pos = positions[i];
    const img = images[i];

    // Card container
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, photoW, photoH, [18]);
    ctx.fill();
    ctx.restore();

    // Image
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pos.x + 8, pos.y + 8, photoW - 16, photoH - 16, [14]);
    ctx.clip();

    if (img && img.complete && img.naturalWidth > 0) {
      applyCanvasFilter(ctx, config.filter);
      drawImageCover(ctx, img, pos.x + 8, pos.y + 8, photoW - 16, photoH - 16);
    } else {
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(pos.x + 8, pos.y + 8, photoW - 16, photoH - 16);
    }
    ctx.restore();

    // Badge
    ctx.save();
    ctx.fillStyle = theme.accentColor;
    ctx.beginPath();
    ctx.arc(pos.x + 30, pos.y + 30, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px "Jua", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${i + 1}`, pos.x + 30, pos.y + 30);
    ctx.restore();
  }

  // Footer
  const footerY = gridStartY + (photoH * 2) + gap + 35;
  ctx.fillStyle = theme.textColor;
  ctx.textAlign = 'center';

  const caption = config.captionText || '소중하고 특별한 우리들의 추억 🌟';
  ctx.font = '34px "BusanDandiHandwriting", "Gaegu", cursive, sans-serif';
  ctx.fillText(caption, width / 2, footerY + 25);

  const dateStr = config.dateText || new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  ctx.font = 'bold 22px "BusanDandiHandwriting", "Jua", sans-serif';
  ctx.fillText(`${dateStr} • OUR CLASS 4-CUTS`, width / 2, footerY + 65);

  ctx.restore();
}

function drawThemedDecorations(
  ctx: CanvasRenderingContext2D,
  theme: FrameTheme,
  width: number,
  height: number,
  type: 'vertical' | 'grid'
) {
  ctx.save();
  ctx.font = '32px "Segoe UI Emoji", sans-serif';

  if (theme.doodleType === 'chick') {
    ctx.fillText('🐥', 20, 60);
    ctx.fillText('🌻', width - 50, 60);
    ctx.fillText('🌱', 20, height - 40);
    ctx.fillText('🐥', width - 50, height - 40);
  } else if (theme.doodleType === 'sprout') {
    ctx.fillText('🌱', 20, 60);
    ctx.fillText('🍀', width - 50, 60);
    ctx.fillText('🌿', 20, height - 40);
    ctx.fillText('🍀', width - 50, height - 40);
  } else if (theme.doodleType === 'rainbow') {
    ctx.fillText('🌈', 20, 60);
    ctx.fillText('☁️', width - 50, 60);
    ctx.fillText('☀️', 20, height - 40);
    ctx.fillText('🌈', width - 50, height - 40);
  } else if (theme.doodleType === 'heart') {
    ctx.fillText('🍓', 20, 60);
    ctx.fillText('🐰', width - 50, 60);
    ctx.fillText('💖', 20, height - 40);
    ctx.fillText('🍓', width - 50, height - 40);
  } else if (theme.doodleType === 'star') {
    ctx.fillText('⭐', 20, 60);
    ctx.fillText('🚀', width - 50, 60);
    ctx.fillText('🌙', 20, height - 40);
    ctx.fillText('✨', width - 50, height - 40);
  } else if (theme.doodleType === 'bear') {
    ctx.fillText('🐻', 20, 60);
    ctx.fillText('🍯', width - 50, 60);
    ctx.fillText('🌰', 20, height - 40);
    ctx.fillText('🐾', width - 50, height - 40);
  } else if (theme.doodleType === 'party') {
    ctx.fillText('🎈', 20, 60);
    ctx.fillText('🎉', width - 50, 60);
    ctx.fillText('🎂', 20, height - 40);
    ctx.fillText('🥳', width - 50, height - 40);
  } else if (theme.doodleType === 'crayon') {
    ctx.fillText('🖍️', 20, 60);
    ctx.fillText('🎨', width - 50, 60);
    ctx.fillText('✏️', 20, height - 40);
    ctx.fillText('🖍️', width - 50, height - 40);
  } else {
    // classic
    ctx.fillText('📷', 20, 60);
    ctx.fillText('🎞️', width - 50, 60);
    ctx.fillText('✨', 20, height - 40);
    ctx.fillText('🖤', width - 50, height - 40);
  }

  ctx.restore();
}

function drawStickers(
  ctx: CanvasRenderingContext2D,
  stickers: FrameConfig['stickers'],
  width: number,
  height: number
) {
  if (!stickers || stickers.length === 0) return;

  stickers.forEach((s) => {
    ctx.save();
    const posX = (s.x / 100) * width;
    const posY = (s.y / 100) * height;

    ctx.translate(posX, posY);
    ctx.rotate((s.rotation * Math.PI) / 180);

    const fontSize = 48 * (s.scale || 1);
    ctx.font = `${fontSize}px "Segoe UI Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.emoji, 0, 0);

    ctx.restore();
  });
}

function applyCanvasFilter(ctx: CanvasRenderingContext2D, filter: string) {
  switch (filter) {
    case 'warm':
      ctx.filter = 'sepia(0.2) saturate(1.2) brightness(1.04)';
      break;
    case 'pastel':
      ctx.filter = 'brightness(1.1) saturate(1.15) contrast(0.95)';
      break;
    case 'vivid':
      ctx.filter = 'saturate(1.35) contrast(1.1) brightness(1.02)';
      break;
    case 'bw':
      ctx.filter = 'grayscale(1) contrast(1.15)';
      break;
    case 'soft':
      ctx.filter = 'contrast(0.92) brightness(1.08) blur(0.3px)';
      break;
    default:
      ctx.filter = 'none';
  }
}

// Center crop image cover draw
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = w / h;

  let sWidth = img.naturalWidth;
  let sHeight = img.naturalHeight;
  let sx = 0;
  let sy = 0;

  if (imgRatio > targetRatio) {
    // image is wider than target
    sWidth = img.naturalHeight * targetRatio;
    sx = (img.naturalWidth - sWidth) / 2;
  } else {
    // image is taller than target
    sHeight = img.naturalWidth / targetRatio;
    sy = (img.naturalHeight - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}
