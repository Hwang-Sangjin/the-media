import { create } from "zustand";

// 씬 ID 정의
export const SCENES = {
  LOADING: "loading",
  TITLE: "title",
  SCENE_01: "scene01",
  SCENE_02: "scene02",
  SCENE_03: "scene03",
  ENDING: "ending",
};

// 씬 순서 (이전/다음 이동에 사용)
export const SCENE_ORDER = [
  SCENES.LOADING,
  SCENES.TITLE,
  SCENES.SCENE_01,
  SCENES.SCENE_02,
  SCENES.SCENE_03,
  SCENES.ENDING,
];

export const useSceneStore = create((set, get) => ({
  // 현재 씬
  currentScene: SCENES.LOADING,

  // 전환 중 여부 (검은 화면 페이드 중일 때 true)
  isTransitioning: false,

  // 사운드 활성화 여부
  soundEnabled: false,

  // 씬 이동 함수 (검은 화면 transition 경유)
  goToScene: (sceneId) => {
    const { currentScene, isTransitioning } = get();
    if (isTransitioning || currentScene === sceneId) return;

    // 1. 전환 시작 (검은 화면 페이드 인)
    set({ isTransitioning: true });

    // 2. 검은 화면 유지 후 씬 변경
    setTimeout(() => {
      set({ currentScene: sceneId });

      // 3. 검은 화면 페이드 아웃
      setTimeout(() => {
        set({ isTransitioning: false });
      }, 400);
    }, 600);
  },

  // 다음 씬으로 이동
  goToNext: () => {
    const { currentScene, goToScene } = get();
    const currentIndex = SCENE_ORDER.indexOf(currentScene);
    if (currentIndex < SCENE_ORDER.length - 1) {
      goToScene(SCENE_ORDER[currentIndex + 1]);
    }
  },

  // 이전 씬으로 이동
  goToPrev: () => {
    const { currentScene, goToScene } = get();
    const currentIndex = SCENE_ORDER.indexOf(currentScene);
    if (currentIndex > 0) {
      goToScene(SCENE_ORDER[currentIndex - 1]);
    }
  },

  // 사운드 토글
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
}));
