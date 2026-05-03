import { useEffect } from "react";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import { useSceneStore, SCENES } from "../../store/sceneStore";
import DigitStage from "./DigitStage";
import ArchitectRoom from "./ArchitectRoom";

export default function Scene03_Matrix() {
  const scrollProgress = useScrollProgress();
  const stage = useSceneStore((state) => state.stage);
  const goToStage = useSceneStore((state) => state.goToStage);
  const goToScene = useSceneStore((state) => state.goToScene);
  const isTransitioning = useSceneStore((state) => state.isTransitioning);

  // architect stage에서 스크롤 끝까지 → 엔딩으로
  useEffect(() => {
    if (stage === "architect" && scrollProgress >= 0.95 && !isTransitioning) {
      goToScene(SCENES.ENDING);
    }
  }, [stage, scrollProgress, isTransitioning, goToScene]);

  const handleRabbitClick = () => {
    goToStage("architect");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black">
        {stage === "main" && <DigitStage onRabbitClick={handleRabbitClick} />}
        {stage === "architect" && (
          <ArchitectRoom scrollProgress={scrollProgress} />
        )}

        {/* 하단 Title - architect stage에서만 */}
        {stage === "architect" && (
          <div className="absolute bottom-16 left-0 right-0 text-center pointer-events-none z-10">
            <h2
              className="font-mono text-2xl tracking-[0.3em] mb-2"
              style={{ color: "#0F0", textShadow: "0 0 10px #0F0" }}
            >
              YOURS TO EXPLORE
            </h2>
          </div>
        )}
      </div>

      {/* architect stage에서만 스크롤 영역 활성화 */}
      {stage === "architect" && (
        <div className="relative" style={{ height: "200vh" }} />
      )}
    </>
  );
}
