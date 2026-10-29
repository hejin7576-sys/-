export interface PoseGuide {
  step: number;
  title: string;
  emoji: string;
  description: string;
  tip: string;
}

export const POSE_GUIDES: PoseGuide[] = [
  {
    step: 1,
    title: '꽃받침 미소 활짝!',
    emoji: '🌸',
    description: '양손을 턱 아래에 대고 예쁜 꽃받침 만들기',
    tip: '치즈~ 하고 활짝 웃어보아요!',
  },
  {
    step: 2,
    title: '볼하트 뿅뿅!',
    emoji: '💖',
    description: '볼 옆에 손가락 하트 또는 반쪽 하트 콕!',
    tip: '친구에게 하트를 보내요!',
  },
  {
    step: 3,
    title: '귀여운 동물 흉내!',
    emoji: '🐰',
    description: '토끼 귀 쫑긋 또는 냐옹이 냥냥 발바닥!',
    tip: '제일 좋아하는 동물이 되어볼까요?',
  },
  {
    step: 4,
    title: '브이~ 최고 포즈!',
    emoji: '✌️',
    description: '신나게 브이를 하거나 엄지 척!',
    tip: '우리반이 세상에서 최고!',
  },
  {
    step: 5,
    title: '자유 깜찍 포즈!',
    emoji: '⭐',
    description: '윙크, 뽀뽀 입술, 만세! 나만의 개구쟁이 표정',
    tip: '마지막 컷이니까 제일 신나게 찰칵!',
  },
];
