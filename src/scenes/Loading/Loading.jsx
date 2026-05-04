import { useEffect, useState } from "react";
import { useSceneStore, SCENES } from "../../store/sceneStore";
import { usePreloader } from "../../hooks/usePreloader";
import CountdownFrame from "./CountdownFrame";
import FilmPerforation from "./FilmPerforation";

import PaperTexture from "./PaperTexture";

const COUNTDOWN_START = 5;
const COUNTDOWN_INTERVAL = 1000;
const FADE_OUT_DURATION = 1000;

export default function Loading() {
  const [count, setCount] = useState(COUNTDOWN_START);
  const [countdownComplete, setCountdownComplete] = useState(false);
  const [fadeToBlack, setFadeToBlack] = useState(false);

  const { isComplete: assetsLoaded } = usePreloader();

  // 카운트다운 진행
  // useEffect(() => {
  //   if (count <= 0) {
  //     setCountdownComplete(true);
  //     setFadeToBlack(true);
  //     return;
  //   }

  //   const timer = setTimeout(() => {
  //     setCount((prev) => prev - 1);
  //   }, COUNTDOWN_INTERVAL);

  //   return () => clearTimeout(timer);
  // }, [count]);
  // 카운트다운 진행
  useEffect(() => {
    // 디버그: 1에서 멈춤
    if (count <= 1) return;

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, COUNTDOWN_INTERVAL);

    return () => clearTimeout(timer);
  }, [count]);

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
        className="absolute inset-0 transition-opacity ease-in"
        style={{
          opacity: fadeToBlack ? 0 : 1,
          transitionDuration: `${FADE_OUT_DURATION}ms`,
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* 1. 종이 텍스처 배경 */}
          <PaperTexture />

          {/* 2. 카운트다운 (가운데) */}
          <CountdownFrame number={count > 0 ? count : 1} />

          {/* 3. 그레인 + 비네팅 (위에 오버레이) */}
          {/* <FilmGrain /> */}

          {/* 4. 프레임 정보 */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs tracking-widest"
            style={{ color: "rgba(40,20,15,0.5)" }}
          >
            FRAME {String(Math.max(count, 1)).padStart(2, "0")}
          </div>
        </div>
      </div>
    </div>
  );
}
