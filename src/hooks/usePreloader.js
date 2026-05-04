import { useEffect, useState } from "react";
import { preloadAssets } from "../utils/preloader";
import { PRELOAD_ASSETS } from "../utils/assetManifest";

/**
 * 일반 에셋 (이미지, 오디오) 프리로딩 진행률을 추적
 *
 * 나중에 3D 에셋 추가 시:
 *   const { progress: r3fProgress } = useProgress()
 *   const totalProgress = (assetProgress + r3fProgress / 100) / 2
 */
export function usePreloader() {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let isMounted = true;

    preloadAssets(PRELOAD_ASSETS, (p) => {
      if (isMounted) setProgress(p);
    }).then(() => {
      if (isMounted) setIsComplete(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return { progress, isComplete };
}
