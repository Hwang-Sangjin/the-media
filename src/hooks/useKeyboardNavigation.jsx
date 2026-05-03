import { useEffect } from "react";
import { useSceneStore } from "../store/sceneStore";

export function useKeyboardNavigation() {
  const goToNext = useSceneStore((state) => state.goToNext);
  const goToPrev = useSceneStore((state) => state.goToPrev);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        goToNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        goToPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);
}
