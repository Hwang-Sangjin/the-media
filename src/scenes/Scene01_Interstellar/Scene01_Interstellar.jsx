import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import { useSceneStore, SCENES } from "../../store/sceneStore";
import BlackHole from "./BlackHole";
import Spaceship from "./Spaceship";
import Stars from "./Stars";
import CameraController from "./CameraController";
import Tesseract from "./Tesseract";

export default function Scene01_Interstellar() {
  const scrollProgress = useScrollProgress();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const stage = useSceneStore((state) => state.stage);
  const goToStage = useSceneStore((state) => state.goToStage);
  const goToScene = useSceneStore((state) => state.goToScene);
  const isTransitioning = useSceneStore((state) => state.isTransitioning);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      setMousePosition({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 'main' stage에서 스크롤 95% 이상 → 'tesseract'로 전환
  useEffect(() => {
    if (stage === "main" && scrollProgress >= 0.95 && !isTransitioning) {
      goToStage("tesseract");
    }
  }, [stage, scrollProgress, isTransitioning, goToStage]);

  // 'tesseract' stage에서 스크롤 95% 이상 → 다음 씬으로 전환
  useEffect(() => {
    if (stage === "tesseract" && scrollProgress >= 0.95 && !isTransitioning) {
      goToScene(SCENES.SCENE_02);
    }
  }, [stage, scrollProgress, isTransitioning, goToScene]);

  return (
    <>
      <div className="fixed inset-0 bg-black">
        <Canvas
          camera={{
            position: [0, 0, 10],
            fov: stage === "tesseract" ? 80 : 60,
          }}
        >
          <ambientLight intensity={stage === "tesseract" ? 0.8 : 0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} />

          {stage === "main" && (
            <>
              <Stars />
              <BlackHole />
              <Spaceship mousePosition={mousePosition} />
              <CameraController scrollProgress={scrollProgress} />
            </>
          )}

          {stage === "tesseract" && (
            <Tesseract scrollProgress={scrollProgress} />
          )}
        </Canvas>

        {/* 하단 텍스트 - main stage에서만 */}
        {stage === "main" && (
          <div className="absolute bottom-16 left-0 right-0 text-center pointer-events-none z-10">
            <h2 className="font-mono text-white text-2xl tracking-[0.3em] mb-2">
              SPACE INTO STORY
            </h2>
            <p className="font-mono text-white/60 text-sm italic">
              "We will find a way, we always have"
            </p>
          </div>
        )}

        {/* tesseract 안내 */}
        {stage === "tesseract" && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 font-mono text-white/40 text-xs tracking-widest pointer-events-none">
            TESSERACT — KEEP SCROLLING
          </div>
        )}

        {/* 스크롤 안내 */}
        {stage === "main" && scrollProgress < 0.05 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-32 font-mono text-white/40 text-xs tracking-widest pointer-events-none animate-pulse">
            ↓ SCROLL TO APPROACH
          </div>
        )}
      </div>

      {/* 보이지 않는 스크롤 영역 */}
      <div className="relative" style={{ height: "300vh" }} />
    </>
  );
}
