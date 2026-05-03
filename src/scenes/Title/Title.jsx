import { useEffect, useState } from "react";
import { useSceneStore, SCENES } from "../../store/sceneStore";

const TITLE_TEXT = "The Media";
const TYPING_SPEED = 200; // ms per character
const PAUSE_AFTER_TYPING = 800; // 타이핑 끝나고 버튼 등장까지 대기

export default function Title() {
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const goToScene = useSceneStore((state) => state.goToScene);

  // 타이핑 효과
  useEffect(() => {
    if (typedText.length < TITLE_TEXT.length) {
      const timer = setTimeout(() => {
        setTypedText(TITLE_TEXT.slice(0, typedText.length + 1));
      }, TYPING_SPEED);
      return () => clearTimeout(timer);
    } else {
      // 타이핑 끝나면 버튼 등장
      const timer = setTimeout(() => {
        setShowButton(true);
      }, PAUSE_AFTER_TYPING);
      return () => clearTimeout(timer);
    }
  }, [typedText]);

  // 커서 깜빡임
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    goToScene(SCENES.SCENE_01);
  };

  return (
    <div className="relative w-screen h-screen bg-black flex flex-col items-center justify-center">
      {/* 타이틀 텍스트 */}
      <h1 className="font-mono text-white text-6xl md:text-7xl tracking-widest">
        {typedText}
        <span
          className={`inline-block w-[0.6em] ml-1 transition-opacity duration-100 ${
            showCursor ? "opacity-100" : "opacity-0"
          }`}
        >
          █
        </span>
      </h1>

      {/* Enter 버튼 */}
      <button
        onClick={handleStart}
        className={`mt-16 px-8 py-3 border border-white/40 font-mono text-white text-sm tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-500 ${
          showButton ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        START THE FILM
      </button>
    </div>
  );
}
