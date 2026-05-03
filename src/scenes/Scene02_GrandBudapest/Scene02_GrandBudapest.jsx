import { useEffect } from "react";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import { useSceneStore, SCENES } from "../../store/sceneStore";
import HotelExterior from "./spaces/HotelExterior";
import Concierge from "./spaces/Concierge";
import Train from "./spaces/Train";
import Mendls2D from "./spaces/Mendls2D";

// 4개 공간을 스크롤 0~1 범위에 배치
const SPACES = [
  { component: HotelExterior, key: "hotel" },
  { component: Concierge, key: "concierge" },
  { component: Train, key: "train" },
  { component: Mendls2D, key: "mendls" },
];

export default function Scene02_GrandBudapest() {
  const scrollProgress = useScrollProgress();
  const goToScene = useSceneStore((state) => state.goToScene);
  const isTransitioning = useSceneStore((state) => state.isTransitioning);

  // 스크롤 끝나면 씬 3으로
  useEffect(() => {
    if (scrollProgress >= 0.97 && !isTransitioning) {
      goToScene(SCENES.SCENE_03);
    }
  }, [scrollProgress, isTransitioning, goToScene]);

  // 현재 어느 공간을 보여줄지 (0~3)
  const spaceIndex = Math.min(
    Math.floor(scrollProgress * SPACES.length),
    SPACES.length - 1,
  );

  // 현재 공간 내에서의 진행률 (0~1)
  const localProgress = scrollProgress * SPACES.length - spaceIndex;

  return (
    <>
      <div className="fixed inset-0 overflow-hidden">
        {SPACES.map((space, index) => {
          const Component = space.component;
          const isActive = index === spaceIndex;
          const isPrev = index < spaceIndex;
          const isNext = index > spaceIndex;

          return (
            <div
              key={space.key}
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                opacity: isActive ? 1 : 0,
                pointerEvents: isActive ? "auto" : "none",
                transform: isActive
                  ? "translateX(0)"
                  : isPrev
                    ? "translateX(-30%)"
                    : "translateX(30%)",
                transition: "opacity 700ms, transform 700ms",
              }}
            >
              <Component localProgress={localProgress} />
            </div>
          );
        })}

        {/* 하단 Title + Quote */}
        <div className="absolute bottom-16 left-0 right-0 text-center pointer-events-none z-10">
          <h2
            className="font-serif text-white text-2xl tracking-[0.3em] mb-2"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
          >
            WITH GRACE
          </h2>
          <p
            className="font-serif text-white/80 text-sm italic"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
          >
            "He certainly sustained the illusion with a marvelous grace"
          </p>
        </div>

        {/* 진행률 표시 (4개 점) */}
        <div className="absolute top-1/2 -translate-y-1/2 left-8 flex flex-col gap-3 z-10">
          {SPACES.map((space, index) => (
            <div
              key={space.key}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === spaceIndex
                  ? "bg-white w-3 h-3"
                  : index < spaceIndex
                    ? "bg-white/60"
                    : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* 스크롤 안내 */}
        {scrollProgress < 0.05 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-32 font-mono text-white/60 text-xs tracking-widest pointer-events-none animate-pulse z-10">
            ↓ SCROLL TO EXPLORE
          </div>
        )}
      </div>

      {/* 보이지 않는 스크롤 영역 - 4공간 = 400vh */}
      <div className="relative" style={{ height: "400vh" }} />
    </>
  );
}
