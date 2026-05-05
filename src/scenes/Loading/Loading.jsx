import { useEffect, useState } from "react";
import { useSceneStore, SCENES } from "../../store/sceneStore";
import { usePreloader } from "../../hooks/usePreloader";
import CountdownFrame from "./CountdownFrame";
import PaperTexture from "./PaperTexture";
import Crosshair from "./Crosshair";
import SweepOverlay from "./SweepOverlay";
import Vignette from "./Vignette";
import Noise from "./Noise";
import Scratches from "./Scratches";

const COUNTDOWN_START = 5;
const COUNTDOWN_INTERVAL = 1000;
const FADE_IN_DURATION = 1500;
const FADE_OUT_DURATION = 1000;

export default function Loading() {
  const [count, setCount] = useState(COUNTDOWN_START);
  const [countdownComplete, setCountdownComplete] = useState(false);
  const [fadeToBlack, setFadeToBlack] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  const { isComplete: assetsLoaded } = usePreloader();

  // 컴포넌트 마운트 직후 페이드인 시작
  useEffect(() => {
    requestAnimationFrame(() => {
      setHasEntered(true);
    });
  }, []);

  // 카운트다운 진행
  useEffect(() => {
    // 0에 도달하면 1초 후 페이드아웃 시작
    if (count <= 0) {
      const timer = setTimeout(() => {
        setCountdownComplete(true);
        setFadeToBlack(true);
      }, COUNTDOWN_INTERVAL);
      return () => clearTimeout(timer);
    }

    // 0보다 클 때는 1씩 감소
    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, COUNTDOWN_INTERVAL);

    return () => clearTimeout(timer);
  }, [count]);

  // 디버그용 (필요 시 위 코드 주석 처리하고 이거 활성화)
  // useEffect(() => {
  //   if (count <= 1) return;
  //   const timer = setTimeout(() => {
  //     setCount((prev) => prev - 1);
  //   }, COUNTDOWN_INTERVAL);
  //   return () => clearTimeout(timer);
  // }, [count]);

  // 카운트다운 + 에셋 로딩 모두 완료 시 타이틀로 이동
  useEffect(() => {
    if (countdownComplete && assetsLoaded) {
      const timer = setTimeout(() => {
        useSceneStore.setState({ currentScene: SCENES.TITLE });
      }, FADE_OUT_DURATION);
      return () => clearTimeout(timer);
    }
  }, [countdownComplete, assetsLoaded]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
      <div
        className="absolute inset-0 transition-opacity ease-in-out"
        style={{
          opacity: !hasEntered ? 0 : fadeToBlack ? 0 : 1,
          transitionDuration: !hasEntered
            ? `${FADE_IN_DURATION}ms`
            : `${FADE_OUT_DURATION}ms`,
        }}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{
            animation: "camera-shake 0.15s steps(2) infinite",
          }}
        >
          <PaperTexture />
          <Crosshair />
          <SweepOverlay />
          {/* 4. 카운트다운 */}
          <CountdownFrame number={count} />
          <Vignette />
          <Noise opacity={0.15} fps={30} resolution={200} />
          <Scratches />

          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs tracking-widest z-10"
            style={{ color: "rgba(40,20,15,0.5)" }}
          >
            FRAME {String(Math.max(count, 0)).padStart(2, "0")}
          </div>
        </div>
      </div>

      {/* 카메라 떨림 keyframe */}
      <style>{`
      @keyframes camera-shake {
        0% { transform: translate(0, 0); }
        25% { transform: translate(-1px, 1px); }
        50% { transform: translate(1px, -1px); }
        75% { transform: translate(-1px, -1px); }
        100% { transform: translate(1px, 1px); }
      }
    `}</style>
    </div>
  );
}
