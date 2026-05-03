import { create } from "zustand";

export const SCENES = {
  LOADING: "loading",
  TITLE: "title",
  SCENE_01: "scene01",
  SCENE_02: "scene02",
  SCENE_03: "scene03",
  ENDING: "ending",
};

export const SCENE_ORDER = [
  SCENES.LOADING,
  SCENES.TITLE,
  SCENES.SCENE_01,
  SCENES.SCENE_02,
  SCENES.SCENE_03,
  SCENES.ENDING,
];

export const useSceneStore = create((set, get) => ({
  currentScene: SCENES.LOADING,
  isTransitioning: false,
  soundEnabled: false,

  // 씬 내부 stage (씬 1: 'space' → 'tesseract', 씬 3: 'digit' → 'architect')
  stage: "main",

  goToScene: (sceneId) => {
    const { currentScene, isTransitioning } = get();
    if (isTransitioning || currentScene === sceneId) return;

    set({ isTransitioning: true });

    setTimeout(() => {
      set({ currentScene: sceneId, stage: "main" }); // 씬 변경 시 stage 리셋
      setTimeout(() => {
        set({ isTransitioning: false });
      }, 400);
    }, 600);
  },

  // 같은 씬 내에서 stage만 전환 (검은 화면 경유)
  goToStage: (newStage) => {
    const { stage, isTransitioning } = get();
    if (isTransitioning || stage === newStage) return;

    set({ isTransitioning: true });

    setTimeout(() => {
      set({ stage: newStage });
      window.scrollTo(0, 0); // 새 stage에서 스크롤 리셋
      setTimeout(() => {
        set({ isTransitioning: false });
      }, 400);
    }, 600);
  },

  goToNext: () => {
    const { currentScene, goToScene } = get();
    const currentIndex = SCENE_ORDER.indexOf(currentScene);
    if (currentIndex < SCENE_ORDER.length - 1) {
      goToScene(SCENE_ORDER[currentIndex + 1]);
    }
  },

  goToPrev: () => {
    const { currentScene, goToScene } = get();
    const currentIndex = SCENE_ORDER.indexOf(currentScene);
    if (currentIndex > 0) {
      goToScene(SCENE_ORDER[currentIndex - 1]);
    }
  },

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
}));
