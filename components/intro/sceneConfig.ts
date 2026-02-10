// ============================================
// SCENE CONFIGURATION - Easy to customize
// ============================================

import { SceneConfig } from './types';

export const SCENE_CONFIGS: SceneConfig[] = [
  // Scene 1 (0s–3s) – Awakening
  {
    id: 1,
    duration: 3,
    component: 'Awakening',
    title: 'Bạn đang đứng trước một điều mới mẻ…',
  },
  
  // Scene 2 (3s–6s) – Logo reveal
  {
    id: 2,
    duration: 3,
    component: 'LogoReveal',
    title: 'Bơ Review',
    subtitle: 'Một thế giới khám phá tri thức',
  },
  
  // Scene 3 (6s–9s) – Identity
  {
    id: 3,
    duration: 3,
    component: 'Identity',
    texts: [
      'Đây không chỉ là một website.',
      'Đây là một cộng đồng.',
    ],
  },
  
  // Scene 4 (9s–13s) – Gamification
  {
    id: 4,
    duration: 4,
    component: 'Gamification',
    icons: [
      { icon: '⭐', label: 'XP' },
      { icon: '🔥', label: 'Streak' },
      { icon: '🏆', label: 'Badge' },
      { icon: '📊', label: 'Ranking' },
    ],
    title: 'Mỗi hành động của bạn đều tạo ra sức mạnh.',
  },
  
  // Scene 5 (13s–17s) – XP gain
  {
    id: 5,
    duration: 4,
    component: 'XPGain',
    texts: [
      'Đọc bài → Tích XP',
      'Bình luận → Lên cấp',
    ],
  },
  
  // Scene 6 (17s–21s) – Community
  {
    id: 6,
    duration: 4,
    component: 'Community',
    texts: [
      'Hay quá!',
      'Mình cũng nghĩ vậy!',
      'Chia sẻ thêm nhé!',
    ],
    title: 'Bạn không đi một mình.',
  },
  
  // Scene 7 (21s–25s) – Vision
  {
    id: 7,
    duration: 4,
    component: 'Vision',
    texts: [
      'Chia sẻ.',
      'Khám phá.',
      'Kết nối.',
    ],
  },
  
  // Scene 8 (25s–30s) – Future self
  {
    id: 8,
    duration: 5,
    component: 'FutureSelf',
    title: 'Phiên bản tốt hơn của bạn đang chờ phía trước.',
  },
  
  // Scene 9 (30s–35s) – Call to action
  {
    id: 9,
    duration: 5,
    component: 'CallToAction',
    title: 'Sẵn sàng bước vào Bơ Review?',
  },
  
  // Scene 10 (35s–40s) – Reward
  {
    id: 10,
    duration: 5,
    component: 'Reward',
    title: '🎉 Bạn nhận được 10 XP cho lần tham gia đầu tiên!',
    subtitle: 'Hẹn gặp bạn bên trong nhé!',
  },
];

// Total duration calculation
export const TOTAL_DURATION = SCENE_CONFIGS.reduce((acc, scene) => acc + scene.duration, 0);

// Get cumulative time for each scene
export const getSceneStartTime = (sceneIndex: number): number => {
  return SCENE_CONFIGS.slice(0, sceneIndex).reduce((acc, scene) => acc + scene.duration, 0);
};

