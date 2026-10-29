// Helper to generate 5 adorable kindergarten sample photos using Canvas
// so users can test immediately even without webcam access

export function generateSamplePhotos(): string[] {
  const samples: string[] = [];
  const configs = [
    {
      bg1: '#FEF3C7',
      bg2: '#FDE68A',
      emoji: '🐥',
      characterName: '삐약이',
      pose: '꽃받침 🌸',
      accent: '#F59E0B',
    },
    {
      bg1: '#FCE7F3',
      bg2: '#FBCFE8',
      emoji: '🐰',
      characterName: '토순이',
      pose: '볼하트 ❤️',
      accent: '#EC4899',
    },
    {
      bg1: '#E0F2FE',
      bg2: '#BAE6FD',
      emoji: '🐻',
      characterName: '곰돌이',
      pose: '브이~ ✌️',
      accent: '#0284C7',
    },
    {
      bg1: '#DCFCE7',
      bg2: '#BBF7D0',
      emoji: '🐶',
      characterName: '멍멍이',
      pose: '동물 흉내 🐾',
      accent: '#16A34A',
    },
    {
      bg1: '#F3E8FF',
      bg2: '#E9D5FF',
      emoji: '🐱',
      characterName: '야옹이',
      pose: '윙크 윙크 😉',
      accent: '#9333EA',
    },
  ];

  configs.forEach((cfg, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, cfg.bg1);
      grad.addColorStop(1, cfg.bg2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      // Playful polka dots in background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let x = 30; x < 640; x += 60) {
        for (let y = 30; y < 480; y += 60) {
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Rounded photo center circle/pod
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(320, 210, 140, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 8;
      ctx.strokeStyle = cfg.accent;
      ctx.stroke();

      // Big character emoji
      ctx.font = '110px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cfg.emoji, 320, 200);

      // Pose badge pill
      ctx.fillStyle = cfg.accent;
      ctx.beginPath();
      ctx.roundRect(170, 375, 300, 50, [25]);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px "Jua", sans-serif';
      ctx.fillText(`CUT #${index + 1} ${cfg.pose}`, 320, 407);

      // Cute sparkles
      ctx.font = '36px "Segoe UI Emoji"';
      ctx.fillText('✨', 160, 140);
      ctx.fillText('✨', 480, 140);
      ctx.fillText('⭐', 460, 300);
      ctx.fillText('💖', 180, 300);

      samples.push(canvas.toDataURL('image/jpeg', 0.92));
    }
  });

  return samples;
}
