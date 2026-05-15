import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useState, useRef } from "react";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import { useSceneStore, SCENES } from "../../store/sceneStore";
import BlackHole from "./BlackHole";
import Spaceship from "./Spaceship";
// import Stars from "./Stars";
import CameraController from "./CameraController";
import Tesseract from "./Tesseract";

// 페이드인 지속시간
const FADE_IN_DURATION = 4000;

// 단계별 타이밍 (ms)
const STAGE1_DURATION = 4000; // 검은 화면 유지 (0~1초)
const STAGE2_DURATION = 8000; // Zoom out (1~5초)

// 카메라 z 위치
const CAMERA_Z_START = 1.5;
const CAMERA_Z_END = 10;

// 블랙홀 셰이더 파라미터
const BH_SCALE_START = 0.1;
const BH_SCALE_END = 1.0;
const BLOOM_START = 0.0;
const BLOOM_END = 0.08;

// Temporal AA blend weight
const BLEND_WEIGHT_STATIC = 0.95; // 정지 시 (매끄러움 최대)
const BLEND_WEIGHT_MOVING = 0.5; // 변화 중 (잔상 억제)

// easing
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * 단계별 애니메이션 컨트롤러
 */
function StageController({ bhScaleRef, bloomRef, blendWeightRef }) {
  const startTime = useRef(null);
  const prevBhScale = useRef(BH_SCALE_START);

  useFrame(({ camera }) => {
    if (startTime.current === null) {
      startTime.current = Date.now();
    }

    const elapsed = Date.now() - startTime.current;

    let progress = 0;

    if (elapsed < STAGE1_DURATION) {
      progress = 0;
    } else if (elapsed < STAGE1_DURATION + STAGE2_DURATION) {
      const t = (elapsed - STAGE1_DURATION) / STAGE2_DURATION;
      progress = easeInOutCubic(t);
    } else {
      progress = 1;
    }

    // 카메라 z 위치
    camera.position.z =
      CAMERA_Z_START + (CAMERA_Z_END - CAMERA_Z_START) * progress;

    // 블랙홀 스케일
    const newBhScale =
      BH_SCALE_START + (BH_SCALE_END - BH_SCALE_START) * progress;

    // 변화량 감지 → blendWeight 동적 조정
    const delta = Math.abs(newBhScale - prevBhScale.current);
    const isMoving = delta > 0.0001;

    if (isMoving) {
      blendWeightRef.current = BLEND_WEIGHT_MOVING;
    } else {
      // 정지 시 부드럽게 STATIC 으로 복귀
      blendWeightRef.current +=
        (BLEND_WEIGHT_STATIC - blendWeightRef.current) * 0.1;
    }

    prevBhScale.current = newBhScale;
    bhScaleRef.current = newBhScale;

    // Bloom - 빠른 곡선
    const bloomProgress = Math.min(progress * 2.5, 1);
    const bloomEased = easeInOutCubic(bloomProgress);
    bloomRef.current = BLOOM_START + (BLOOM_END - BLOOM_START) * bloomEased;
  });

  return null;
}

/**
 * BlackHole 래퍼
 */
function BlackHoleAnimated({ bhScaleRef, bloomRef, blendWeightRef }) {
  const [bhScale, setBhScale] = useState(BH_SCALE_START);
  const [bloom, setBloom] = useState(BLOOM_START);
  const [blendWeight, setBlendWeight] = useState(BLEND_WEIGHT_STATIC);

  useFrame(() => {
    if (bhScaleRef.current !== undefined) {
      setBhScale(bhScaleRef.current);
    }
    if (bloomRef.current !== undefined) {
      setBloom(bloomRef.current);
    }
    if (blendWeightRef.current !== undefined) {
      setBlendWeight(blendWeightRef.current);
    }
  });

  return (
    <BlackHole
      bhScale={bhScale}
      bloomStrength={bloom}
      blendWeight={blendWeight}
    />
  );
}

export default function Scene01_Interstellar() {
  const scrollProgress = useScrollProgress();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasEntered, setHasEntered] = useState(false);
  const stage = useSceneStore((state) => state.stage);
  const goToStage = useSceneStore((state) => state.goToStage);
  const goToScene = useSceneStore((state) => state.goToScene);
  const isTransitioning = useSceneStore((state) => state.isTransitioning);

  const bhScaleRef = useRef(BH_SCALE_START);
  const bloomRef = useRef(BLOOM_START);
  const blendWeightRef = useRef(BLEND_WEIGHT_STATIC);

  useEffect(() => {
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        setHasEntered(true);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      setMousePosition({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (stage === "main" && scrollProgress >= 0.95 && !isTransitioning) {
      goToStage("tesseract");
    }
  }, [stage, scrollProgress, isTransitioning, goToStage]);

  useEffect(() => {
    if (stage === "tesseract" && scrollProgress >= 0.95 && !isTransitioning) {
      goToScene(SCENES.SCENE_02);
    }
  }, [stage, scrollProgress, isTransitioning, goToScene]);

  return (
    <>
      <div className="fixed inset-0 bg-black">
        <div
          className="absolute inset-0 transition-opacity ease-in-out"
          style={{
            opacity: hasEntered ? 1 : 0,
            transitionDuration: `${FADE_IN_DURATION}ms`,
          }}
        >
          <Canvas
            camera={{
              position: [0, 0, CAMERA_Z_START],
              fov: stage === "tesseract" ? 80 : 60,
            }}
          >
            <ambientLight intensity={stage === "tesseract" ? 0.8 : 0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {stage === "main" && (
              <>
                {/* <Stars /> */}
                <BlackHoleAnimated
                  bhScaleRef={bhScaleRef}
                  bloomRef={bloomRef}
                  blendWeightRef={blendWeightRef}
                />
                <Spaceship mousePosition={mousePosition} />
                <StageController
                  bhScaleRef={bhScaleRef}
                  bloomRef={bloomRef}
                  blendWeightRef={blendWeightRef}
                />
                {/* <CameraController scrollProgress={scrollProgress} /> */}
              </>
            )}

            {stage === "tesseract" && (
              <Tesseract scrollProgress={scrollProgress} />
            )}
          </Canvas>
        </div>

        {/* 텍스트 - Stage 3 진입 후 페이드인 */}
        {stage === "main" && (
          <div
            className="absolute bottom-16 left-0 right-0 text-center pointer-events-none z-10 transition-opacity ease-in-out"
            style={{
              opacity: hasEntered ? 1 : 0,
              transitionDuration: "2000ms",
              transitionDelay: "5500ms",
            }}
          >
            <h2 className="font-mono text-white text-2xl tracking-[0.3em] mb-2">
              SPACE INTO STORY
            </h2>
            <p className="font-mono text-white/60 text-sm italic">
              "We will find a way, we always have"
            </p>
          </div>
        )}

        {stage === "tesseract" && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 font-mono text-white/40 text-xs tracking-widest pointer-events-none">
            TESSERACT — KEEP SCROLLING
          </div>
        )}
      </div>

      <div className="relative" style={{ height: "300vh" }} />
    </>
  );
}
