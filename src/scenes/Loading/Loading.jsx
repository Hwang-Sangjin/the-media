import { useEffect, useState } from "react";
import { useSceneStore, SCENES } from "../../store/sceneStore";
import CountdownFrame from "./CountdownFrame";
import FilmPerforation from "./FilmPerforation";
import FilmGrain from "./FilmGrain";

export default function Loading() {
  const [count, setCount] = useState(5);
  const goToScene = useSceneStore((state) => state.goToScene);

  useEffect(() => {
    if (count <= 0) {
      goToScene(SCENES.TITLE);
      return;
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, goToScene]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
      <FilmPerforation />
      <CountdownFrame number={count} />
      <FilmGrain />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-white/40 text-xs tracking-widest">
        FRAME {String(count).padStart(2, "0")}
      </div>
    </div>
  );
}
