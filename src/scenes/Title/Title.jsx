import { Canvas } from "@react-three/fiber";
import { useEffect, useState, useRef } from "react";
import { useSceneStore, SCENES } from "../../store/sceneStore";
import TitleText from "./TitleText";
import IntroText from "./IntroText";

// 시퀀스 타이밍 (ms)
const STUDIO_START = 1000; // 1초 후 Studio 등장
const DIRECTOR_START = 6000; // 6초 후 Director 등장
const TITLE_START = 11000; // 11초 후 THE MEDIA 등장
const BUTTON_START = 14000; // 14초 후 WATCH 버튼 등장

export default function Title() {
  const [elapsed, setElapsed] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const startTime = useRef(null);
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

  // 타이틀 단계 체크 (THE MEDIA 등장 시점인지)
  const isTitleStage = elapsed >= TITLE_START;
  const isButtonStage = elapsed >= BUTTON_START && !isZooming;

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* 1. Studio Intro (HTML) */}
      <IntroText
        text="EUDAIMONIA Studios Present"
        startTime={STUDIO_START}
        elapsed={elapsed}
      />

      {/* 2. Director Intro (HTML) */}
      <IntroText
        text="DIRECTED BY JIN"
        startTime={DIRECTOR_START}
        elapsed={elapsed}
      />

      {/* 3. THE MEDIA (3D Canvas) - Title 단계부터 표시 */}
      {isTitleStage && (
        <Canvas
          camera={{
            position: [0, 0, 8],
            fov: 50,
          }}
        >
          <TitleText hasEntered={true} isZooming={isZooming} />
        </Canvas>
      )}

      {/* 4. WATCH 버튼 */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={handleStart}
          className={`group px-12 py-3 border border-white/40 font-bebas text-white text-2xl tracking-[0.4em] transition-all duration-1000 hover:border-white hover:bg-white/5 ${
            isButtonStage ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          WATCH
        </button>
      </div>

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
