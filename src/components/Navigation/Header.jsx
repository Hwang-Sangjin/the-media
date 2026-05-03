import { useEffect, useState } from "react";
import { useSceneStore, SCENES } from "../../store/sceneStore";

export default function Header() {
  const [isVisible, setIsVisible] = useState(false);
  const currentScene = useSceneStore((state) => state.currentScene);
  const soundEnabled = useSceneStore((state) => state.soundEnabled);
  const toggleSound = useSceneStore((state) => state.toggleSound);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // 마우스가 화면 상단 80px 이내면 헤더 등장
      if (e.clientY < 80) {
        setIsVisible(true);
      } else if (e.clientY > 120) {
        // 120px 이상 멀어지면 사라짐 (히스테리시스로 깜빡임 방지)
        setIsVisible(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 로딩 화면에서는 헤더 안 보이게
  if (currentScene === SCENES.LOADING) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-500 ease-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between px-8 py-5">
          {/* 좌측 - 로고 */}
          <div className="font-mono text-white text-lg tracking-wider">
            The Media
          </div>

          {/* 우측 - 사운드 토글 */}
          <button
            onClick={toggleSound}
            className="font-mono text-white text-sm hover:opacity-70 transition-opacity"
            aria-label="Toggle sound"
          >
            {soundEnabled ? "♪ Sound On" : "♪ Sound Off"}
          </button>
        </div>
      </div>
    </header>
  );
}
