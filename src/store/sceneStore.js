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
  stage: "main",

  // 3D 에셋 로딩 상태
  assets3DProgress: 0, // 0~1
  assets3DLoaded: false,

  set3DProgress: (progress) => {
    set({
      assets3DProgress: progress,
      assets3DLoaded: progress >= 1,
    });
  },

  goToScene: (sceneId) => {
    const { currentScene, isTransitioning } = get();
    if (isTransitioning || currentScene === sceneId) return;

    set({ isTransitioning: true });

    setTimeout(() => {
      set({ currentScene: sceneId, stage: "main" });
      setTimeout(() => {
        set({ isTransitioning: false });
      }, 400);
    }, 600);
  },

  goToStage: (newStage) => {
    const { stage, isTransitioning } = get();
    if (isTransitioning || stage === newStage) return;

    set({ isTransitioning: true });

    setTimeout(() => {
      set({ stage: newStage });
      window.scrollTo(0, 0);
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
