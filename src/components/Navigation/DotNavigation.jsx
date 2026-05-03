import { useSceneStore, SCENES, SCENE_ORDER } from "../../store/sceneStore";

// 각 씬의 표시 이름
const SCENE_LABELS = {
  [SCENES.LOADING]: "Loading",
  [SCENES.TITLE]: "The Media",
  [SCENES.SCENE_01]: "Space into Story",
  [SCENES.SCENE_02]: "With Grace",
  [SCENES.SCENE_03]: "Yours to Explore",
  [SCENES.ENDING]: "The End",
};

export default function DotNavigation() {
  const currentScene = useSceneStore((state) => state.currentScene);
  const goToScene = useSceneStore((state) => state.goToScene);

  // 로딩 화면에서는 dot 안 보이게
  if (currentScene === SCENES.LOADING) return null;

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4">
      {SCENE_ORDER.map((sceneId) => {
        // 로딩은 네비게이션에서 제외
        if (sceneId === SCENES.LOADING) return null;

        const isActive = currentScene === sceneId;
        const label = SCENE_LABELS[sceneId];

        return (
          <button
            key={sceneId}
            onClick={() => goToScene(sceneId)}
            className="group relative flex items-center justify-end"
            aria-label={`Go to ${label}`}
          >
            {/* 라벨 - hover시 등장 */}
            <span className="absolute right-6 whitespace-nowrap font-mono text-sm text-white opacity-0 group-hover:opacity-70 transition-opacity duration-300">
              {label}
            </span>

            {/* dot */}
            <span
              className={`block rounded-full transition-all duration-300 ${
                isActive
                  ? "w-3 h-3 bg-white"
                  : "w-2 h-2 bg-white/40 group-hover:bg-white/70"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
