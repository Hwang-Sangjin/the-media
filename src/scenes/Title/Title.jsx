import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { useSceneStore, SCENES } from "../../store/sceneStore";
import TitleText from "./TitleText";

export default function Title() {
  const [hasEntered, setHasEntered] = useState(false);
  const goToScene = useSceneStore((state) => state.goToScene);

  // 진입 페이드인 (검은 화면 → 텍스트 등장)
  useEffect(() => {
    requestAnimationFrame(() => {
      setHasEntered(true);
    });
  }, []);

  const handleStart = () => {
    goToScene(SCENES.SCENE_01);
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{
          position: [0, 0, 8],
          fov: 50,
        }}
      >
        <TitleText hasEntered={hasEntered} />
      </Canvas>

      {/* Watch 버튼 - HTML 오버레이 */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={handleStart}
          className={`group px-12 py-3 border border-white/40 font-bebas text-white text-2xl tracking-[0.4em] transition-all duration-700 hover:border-white hover:bg-white/5 ${
            hasEntered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{ transitionDelay: hasEntered ? "2000ms" : "0ms" }}
        >
          WATCH
        </button>
      </div>
    </div>
  );
}
