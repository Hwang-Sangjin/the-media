import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress, useGLTF, useTexture } from "@react-three/drei";
import { useSceneStore } from "../../store/sceneStore";
import {
  MODELS_TO_PRELOAD,
  TEXTURES_TO_PRELOAD,
} from "../../utils/models3DManifest";

/**
 * 진행률 추적 컴포넌트 — Canvas 내부에서 동작
 */
function ProgressTracker() {
  const { progress, active } = useProgress();
  const set3DProgress = useSceneStore((state) => state.set3DProgress);

  useEffect(() => {
    // 로드할 모델이 없으면 즉시 완료
    if (MODELS_TO_PRELOAD.length === 0 && TEXTURES_TO_PRELOAD.length === 0) {
      set3DProgress(1);
      return;
    }

    set3DProgress(progress / 100);
  }, [progress, set3DProgress]);

  useEffect(() => {
    // 로딩이 멈추고 (active === false) 진행률이 100이면 완료 처리
    if (!active && progress >= 100) {
      set3DProgress(1);
    }
  }, [active, progress, set3DProgress]);

  return null;
}

/**
 * 백그라운드 3D 에셋 프리로더
 * 화면에는 보이지 않지만 모델/텍스처 캐싱
 */
export default function Preloader3D() {
  // 컴포넌트 마운트 시 즉시 프리로드 시작 (Canvas 외부에서 호출)
  useEffect(() => {
    MODELS_TO_PRELOAD.forEach((url) => {
      useGLTF.preload(url);
    });
    TEXTURES_TO_PRELOAD.forEach((url) => {
      useTexture.preload(url);
    });
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        width: 1,
        height: 1,
        top: -10,
        left: -10,
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas frameloop="never">
        <ProgressTracker />
      </Canvas>
    </div>
  );
}
