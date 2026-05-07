import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { useSceneStore, SCENES } from "../../store/sceneStore";
import TitleText from "./TitleText";

export default function Title() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const goToScene = useSceneStore((state) => state.goToScene);

  // 진입 페이드인
  useEffect(() => {
    requestAnimationFrame(() => {
      setHasEntered(true);
    });
  }, []);

  // zoom-in 시작
  const handleStart = () => {
    if (isZooming) return;
    setIsZooming(true);
  };

  // zoom 애니메이션 끝나면 Scene 1으로 (3.5초 후)
  useEffect(() => {
    if (!isZooming) return;
    const timer = setTimeout(() => {
      // 검은 화면 transition 거치지 않고 바로 Scene 1으로
      // (이미 검은 화면 상태이니까)
      useSceneStore.setState({ currentScene: SCENES.SCENE_01 });
    }, 3500);
    return () => clearTimeout(timer);
  }, [isZooming]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{
          position: [0, 0, 8],
          fov: 50,
        }}
      >
        <TitleText hasEntered={hasEntered} isZooming={isZooming} />
      </Canvas>

      {/* Watch 버튼 - zoom 시작하면 사라짐 */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={handleStart}
          className={`group px-12 py-3 border border-white/40 font-bebas text-white text-2xl tracking-[0.4em] transition-all duration-700 hover:border-white hover:bg-white/5 ${
            hasEntered && !isZooming
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
          style={{
            transitionDelay: hasEntered && !isZooming ? "2000ms" : "0ms",
          }}
        >
          WATCH
        </button>
      </div>

      {/* 마지막에 검은 화면으로 페이드 (zoom 끝날 때) */}
      <div
        className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-1000"
        style={{
          opacity: isZooming ? 1 : 0,
          transitionDelay: isZooming ? "2500ms" : "0ms",
        }}
      />
    </div>
  );
}
