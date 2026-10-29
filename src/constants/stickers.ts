export interface StickerItem {
  id: string;
  emoji: string;
  name: string;
  category: '동물친구' | '모자/소품' | '하트/반짝이' | '유치원/자연' | '칭찬도장';
}

export const STICKER_LIST: StickerItem[] = [
  // 동물친구
  { id: 's-chick', emoji: '🐥', name: '삐약이', category: '동물친구' },
  { id: 's-bunny', emoji: '🐰', name: '토끼', category: '동물친구' },
  { id: 's-cat', emoji: '🐱', name: '야옹이', category: '동물친구' },
  { id: 's-bear', emoji: '🐻', name: '곰돌이', category: '동물친구' },
  { id: 's-puppy', emoji: '🐶', name: '멍멍이', category: '동물친구' },
  { id: 's-hamster', emoji: '🐹', name: '햄스터', category: '동물친구' },
  { id: 's-frog', emoji: '🐸', name: '개구리', category: '동물친구' },
  { id: 's-lion', emoji: '🦁', name: '아기사자', category: '동물친구' },

  // 모자/소품
  { id: 's-crown', emoji: '👑', name: '왕관', category: '모자/소품' },
  { id: 's-ribbon', emoji: '🎀', name: '리본', category: '모자/소품' },
  { id: 's-sunglasses', emoji: '🕶️', name: '선글라스', category: '모자/소품' },
  { id: 's-partyhat', emoji: '🥳', name: '파티', category: '모자/소품' },
  { id: 's-magic', emoji: '🪄', name: '요술봉', category: '모자/소품' },
  { id: 's-balloon', emoji: '🎈', name: '풍선', category: '모자/소품' },
  { id: 's-grad', emoji: '🎓', name: '졸업모자', category: '모자/소품' },
  { id: 's-camera', emoji: '📷', name: '카메라', category: '모자/소품' },

  // 하트/반짝이
  { id: 's-heart1', emoji: '💖', name: '반짝하트', category: '하트/반짝이' },
  { id: 's-heart2', emoji: '❤️', name: '빨강하트', category: '하트/반짝이' },
  { id: 's-star1', emoji: '⭐', name: '노랑별', category: '하트/반짝이' },
  { id: 's-star2', emoji: '🌟', name: '반짝별', category: '하트/반짝이' },
  { id: 's-rainbow', emoji: '🌈', name: '무지개', category: '하트/반짝이' },
  { id: 's-sparkle', emoji: '✨', name: '반짝이', category: '하트/반짝이' },
  { id: 's-candy', emoji: '🍭', name: '롤리팝', category: '하트/반짝이' },
  { id: 's-donut', emoji: '🍩', name: '도넛', category: '하트/반짝이' },

  // 유치원/자연
  { id: 's-flower1', emoji: '🌸', name: '벚꽃', category: '유치원/자연' },
  { id: 's-sunflower', emoji: '🌻', name: '해바라기', category: '유치원/자연' },
  { id: 's-tulip', emoji: '🌷', name: '튤립', category: '유치원/자연' },
  { id: 's-clover', emoji: '🍀', name: '네잎클로버', category: '유치원/자연' },
  { id: 's-sprout', emoji: '🌱', name: '새싹', category: '유치원/자연' },
  { id: 's-crayon', emoji: '🖍️', name: '크레파스', category: '유치원/자연' },
  { id: 's-palette', emoji: '🎨', name: '팔레트', category: '유치원/자연' },
  { id: 's-sun', emoji: '☀️', name: '햇님', category: '유치원/자연' },

  // 칭찬도장
  { id: 's-best', emoji: '👍', name: '최고야!', category: '칭찬도장' },
  { id: 's-peace', emoji: '✌️', name: '브이!', category: '칭찬도장' },
  { id: 's-clap', emoji: '👏', name: '짝짝짝', category: '칭찬도장' },
  { id: 's-100', emoji: '💯', name: '100점!', category: '칭찬도장' },
  { id: 's-medal', emoji: '🥇', name: '금메달', category: '칭찬도장' },
  { id: 's-love', emoji: '🥰', name: '사랑해', category: '칭찬도장' },
];
