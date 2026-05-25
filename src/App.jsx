import { useSceneStore, SCENES } from "./store/sceneStore";
import Loading from "./scenes/Loading/Loading";
import Title from "./scenes/Title/Title";
import Scene01_Interstellar from "./scenes/Scene01_Interstellar/Scene01_Interstellar";
import Scene02_GrandBudapest from "./scenes/Scene02_GrandBudapest/Scene02_GrandBudapest";
import Scene03_Matrix from "./scenes/Scene03_Matrix/Scene03_Matrix";
import EndingCredits from "./scenes/EndingCredits/EndingCredits";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import Transition from "./components/Transition/Transition";
import DotNavigation from "./components/Navigation/DotNavigation";
import Header from "./components/Navigation/Header";
import { useEffect, useRef } from "react";
import Preloader3D from "./components/Preloader3D/Preloader3D";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

function App() {
  const currentScene = useSceneStore((state) => state.currentScene);
  const lenisRef = useRef(null);

  useKeyboardNavigation();

  // ── Lenis 스무스 스크롤 초기화 ──────────────
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
      autoRaf: true, // R3F 충돌 방지 — Lenis 가 자체 RAF 관리
    });

    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // ── 씬 변경 시 스크롤 리셋 ──────────────────
  useEffect(() => {
    window.scrollTo(0, 0);

    // Lenis 도 같이 리셋
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [currentScene]);

  const renderScene = () => {
    switch (currentScene) {
      case SCENES.LOADING:
        return <Loading />;
      case SCENES.TITLE:
        return <Title />;
      case SCENES.SCENE_01:
        return <Scene01_Interstellar />;
      case SCENES.SCENE_02:
        return <Scene02_GrandBudapest />;
      case SCENES.SCENE_03:
        return <Scene03_Matrix />;
      case SCENES.ENDING:
        return <EndingCredits />;
      default:
        return <Loading />;
    }
  };

  return (
    <div className="relative w-screen min-h-screen">
      {renderScene()}
      <Header />
      <DotNavigation />
      <Transition />
      <Preloader3D />
    </div>
  );
}

export default App;
