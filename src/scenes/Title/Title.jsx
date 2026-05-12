import { Canvas } from "@react-three/fiber";
import { useEffect, useState, useRef } from "react";
import { useSceneStore, SCENES } from "../../store/sceneStore";
import TitleText from "./TitleText";
import IntroText from "./IntroText";

import { EffectComposer, Bloom } from "@react-three/postprocessing";

// 시퀀스 타이밍 (ms)
const STUDIO_START = 1000;
const DIRECTOR_START = 6000;
const TITLE_START = 11000;
const BUTTON_START = 14000;

function WatchButton({ isVisible, onClick }) {
  const assets3DProgress = useSceneStore((state) => state.assets3DProgress);
  const assets3DLoaded = useSceneStore((state) => state.assets3DLoaded);

  const isReady = isVisible && assets3DLoaded;
  const progressPercent = Math.floor(assets3DProgress * 100);

  return (
    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10">
      <button
        onClick={isReady ? onClick : undefined}
        disabled={!isReady}
        className={`group px-12 py-3 border font-bebas text-2xl tracking-[0.4em] transition-all duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        } ${
          isReady
            ? "text-white border-white/40 hover:border-white hover:bg-white/5 cursor-pointer"
            : "text-white/40 border-white/10 cursor-default"
        }`}
      >
        {isReady ? "WATCH" : `LOADING ${progressPercent}%`}
      </button>
    </div>
  );
}

export default function Title() {
  const [elapsed, setElapsed] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const startTime = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const goToScene = useSceneStore((state) => state.goToScene);

  // 경과 시간 추적
  useEffect(() => {
    startTime.current = Date.now();

    let rafId;
    const tick = () => {
      setElapsed(Date.now() - startTime.current);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, []);

  // 마우스 위치 추적 (-1 ~ 1 범위로 정규화)
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleStart = () => {
    if (isZooming) return;
    setIsZooming(true);
  };

  // zoom 끝나면 Scene 1으로
  useEffect(() => {
    if (!isZooming) return;
    const timer = setTimeout(() => {
      useSceneStore.setState({ currentScene: SCENES.SCENE_01 });
    }, 3500);
    return () => clearTimeout(timer);
  }, [isZooming]);

  const isTitleStage = elapsed >= TITLE_START;
  const isButtonStage = elapsed >= BUTTON_START && !isZooming;

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* 1. Studio Intro */}
      <IntroText
        text="EUDAIMONIA Studios Present"
        startTime={STUDIO_START}
        elapsed={elapsed}
      />

      {/* 2. Director Intro */}
      <IntroText
        text="DIRECTED BY JIN"
        startTime={DIRECTOR_START}
        elapsed={elapsed}
      />

      {isTitleStage && (
        <Canvas
          camera={{
            position: [0, 0, 8],
            fov: 50,
          }}
        >
          <TitleText
            hasEntered={true}
            isZooming={isZooming}
            mouseRef={mouseRef}
          />

          {/* Bloom 후처리 - 글로우 효과 */}
          <EffectComposer>
            <Bloom
              intensity={0.1}
              luminanceThreshold={0.6}
              luminanceSmoothing={0.5}
              mipmapBlur
            />
          </EffectComposer>
        </Canvas>
      )}

      {/* 4. WATCH 버튼 */}
      <WatchButton
        isVisible={elapsed >= BUTTON_START && !isZooming}
        onClick={handleStart}
      />

      {/* 5. zoom 끝부분 검은 화면 페이드 */}
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
