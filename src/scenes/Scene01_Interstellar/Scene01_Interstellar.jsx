import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useState, useRef } from "react";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import { useSceneStore, SCENES } from "../../store/sceneStore";
import BlackHole from "./BlackHole";
import Spaceship from "./Spaceship";
import Tesseract from "./Tesseract";
import SceneAudio from "./SceneAudio";

// ═════════════════════════════════════════════
//  타이밍 상수
// ═════════════════════════════════════════════
const FADE_IN_DURATION = 4000;
const STAGE1_DURATION = 6000; // 검은 화면 유지
const STAGE2_DURATION = 16000; // Zoom out 시간 (intro 내부)
const INTRO_TOTAL = STAGE1_DURATION + STAGE2_DURATION; // intro 끝나는 시점

// 카메라 z
const CAMERA_Z_START = 1.5; // Intro 시작
const CAMERA_Z_DEFAULT = 10; // Default 위치
const CAMERA_Z_END = 0.3; // Outro 끝 (블랙홀에 빨려들어감)

// 블랙홀 파라미터
const BH_SCALE_START = 0.1;
const BH_SCALE_DEFAULT = 1.0;
const BH_SCALE_END = 0.1; // Outro 끝에서 다시 작아짐
const BLOOM_START = 0.0;
const BLOOM_DEFAULT = 0.08;

// Temporal AA blend weight
const BLEND_WEIGHT_STATIC = 0.95;
const BLEND_WEIGHT_MOVING = 0.5;

// ═════════════════════════════════════════════
//  Easing
// ═════════════════════════════════════════════
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ═════════════════════════════════════════════
//  Stage Controller — Phase 별 애니메이션 제어
// ═════════════════════════════════════════════
function StageController({
  phase,
  scrollProgress,
  bhScaleRef,
  bloomRef,
  blendWeightRef,
  onIntroComplete,
}) {
  const introStartTime = useRef(null);
  const prevBhScale = useRef(BH_SCALE_START);
  const introCompleteFired = useRef(false);

  useFrame(({ camera }) => {
    let cameraZ = CAMERA_Z_DEFAULT;
    let newBhScale = BH_SCALE_DEFAULT;
    let newBloom = BLOOM_DEFAULT;

    if (phase === "intro") {
      if (introStartTime.current === null) {
        introStartTime.current = Date.now();
      }
      const elapsed = Date.now() - introStartTime.current;

      let progress = 0;
      if (elapsed < STAGE1_DURATION) {
        progress = 0;
      } else if (elapsed < INTRO_TOTAL) {
        const t = (elapsed - STAGE1_DURATION) / STAGE2_DURATION;
        progress = easeInOutCubic(t);
      } else {
        progress = 1;
        // intro 완료 신호 (한 번만)
        if (!introCompleteFired.current) {
          introCompleteFired.current = true;
          onIntroComplete();
        }
      }

      cameraZ = CAMERA_Z_START + (CAMERA_Z_DEFAULT - CAMERA_Z_START) * progress;
      newBhScale =
        BH_SCALE_START + (BH_SCALE_DEFAULT - BH_SCALE_START) * progress;

      const bloomProgress = Math.min(progress * 2.5, 1);
      const bloomEased = easeInOutCubic(bloomProgress);
      newBloom = BLOOM_START + (BLOOM_DEFAULT - BLOOM_START) * bloomEased;
    } else if (phase === "default") {
      // 정적 - 기본값 유지
      cameraZ = CAMERA_Z_DEFAULT;
      newBhScale = BH_SCALE_DEFAULT;
      newBloom = BLOOM_DEFAULT;
    } else if (phase === "outro") {
      // 스크롤 기반 zoom in
      const p = easeInOutCubic(scrollProgress);
      cameraZ = CAMERA_Z_DEFAULT + (CAMERA_Z_END - CAMERA_Z_DEFAULT) * p;
      newBhScale = BH_SCALE_DEFAULT + (BH_SCALE_END - BH_SCALE_DEFAULT) * p;
      newBloom = BLOOM_DEFAULT * (1 - p); // 페이드아웃
    }

    camera.position.z = cameraZ;

    // blendWeight 동적 조정
    const delta = Math.abs(newBhScale - prevBhScale.current);
    if (delta > 0.0001) {
      blendWeightRef.current = BLEND_WEIGHT_MOVING;
    } else {
      blendWeightRef.current +=
        (BLEND_WEIGHT_STATIC - blendWeightRef.current) * 0.1;
    }

    prevBhScale.current = newBhScale;
    bhScaleRef.current = newBhScale;
    bloomRef.current = newBloom;
  });

  return null;
}

// ═════════════════════════════════════════════
//  BlackHole 래퍼
// ═════════════════════════════════════════════
function BlackHoleAnimated({ bhScaleRef, bloomRef, blendWeightRef }) {
  const [bhScale, setBhScale] = useState(BH_SCALE_START);
  const [bloom, setBloom] = useState(BLOOM_START);
  const [blendWeight, setBlendWeight] = useState(BLEND_WEIGHT_STATIC);

  useFrame(() => {
    if (bhScaleRef.current !== undefined) setBhScale(bhScaleRef.current);
    if (bloomRef.current !== undefined) setBloom(bloomRef.current);
    if (blendWeightRef.current !== undefined)
      setBlendWeight(blendWeightRef.current);
  });

  return (
    <BlackHole
      bhScale={bhScale}
      bloomStrength={bloom}
      blendWeight={blendWeight}
    />
  );
}

// ═════════════════════════════════════════════
//  Narration — 좌측 하단 텍스트 영역 (자리만 잡아둠)
// ═════════════════════════════════════════════
function Narration({ active, onComplete }) {
  // TODO: 추후 텍스트 시퀀스 + 타이프라이터 애니메이션 구현
  // 지금은 placeholder

  useEffect(() => {
    if (!active) return;
    // 임시: 5초 후 완료 신호 (실제로는 모든 텍스트 표시 끝나는 시점)
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);
    return () => clearTimeout(timer);
  }, [active, onComplete]);

  return (
    <div
      className="absolute bottom-16 left-16 max-w-md pointer-events-none z-10 transition-opacity duration-1000"
      style={{ opacity: active ? 1 : 0 }}
    >
      <p className="font-mono text-white text-base leading-relaxed">
        [Narration text placeholder]
      </p>
    </div>
  );
}

// ═════════════════════════════════════════════
//  Scroll Hint — 내레이션 끝난 후 표시
// ═════════════════════════════════════════════
function ScrollHint({ show }) {
  return (
    <div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-white/40 text-xs tracking-widest pointer-events-none transition-opacity duration-1000 animate-pulse"
      style={{ opacity: show ? 1 : 0 }}
    >
      ↓ SCROLL TO CONTINUE
    </div>
  );
}

// ═════════════════════════════════════════════
//  메인
// ═════════════════════════════════════════════
export default function Scene01_Interstellar() {
  const rawScrollProgress = useScrollProgress();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasEntered, setHasEntered] = useState(false);

  // Phase 상태
  const [phase, setPhase] = useState("intro");
  const [narrationComplete, setNarrationComplete] = useState(false);

  const stage = useSceneStore((state) => state.stage);
  const goToStage = useSceneStore((state) => state.goToStage);
  const goToScene = useSceneStore((state) => state.goToScene);
  const isTransitioning = useSceneStore((state) => state.isTransitioning);

  // 셰이더 파라미터 ref
  const bhScaleRef = useRef(BH_SCALE_START);
  const bloomRef = useRef(BLOOM_START);
  const blendWeightRef = useRef(BLEND_WEIGHT_STATIC);

  // 진입 페이드인
  useEffect(() => {
    const timer = setTimeout(() => {
      requestAnimationFrame(() => setHasEntered(true));
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // 마우스 추적
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      setMousePosition({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ════ Phase 전환 로직 ════

  // intro → default
  const handleIntroComplete = () => {
    setPhase("default");
  };

  // default → outro (내레이션 끝 + 스크롤 시작)
  useEffect(() => {
    if (phase !== "default") return;
    if (!narrationComplete) return;
    if (rawScrollProgress > 0.001) {
      setPhase("outro");
    }
  }, [phase, narrationComplete, rawScrollProgress]);

  // outro → tesseract stage (글로벌)
  useEffect(() => {
    if (phase !== "outro") return;
    if (rawScrollProgress >= 0.95 && !isTransitioning) {
      goToStage("tesseract");
    }
  }, [phase, rawScrollProgress, isTransitioning, goToStage]);

  // tesseract → scene 2 (글로벌)
  useEffect(() => {
    if (
      stage === "tesseract" &&
      rawScrollProgress >= 0.95 &&
      !isTransitioning
    ) {
      goToScene(SCENES.SCENE_02);
    }
  }, [stage, rawScrollProgress, isTransitioning, goToScene]);

  // ════ 스크롤 제어 ════
  // phase 가 outro 가 아닐 때는 scrollProgress 를 outro 진행도로 변환하지 않음
  // outro 일 때만 scroll → camera 진행도로 사용
  // (Stage Controller 에 그대로 rawScrollProgress 넘김. outro 진입 시점부터 0~1 로 다시 계산하려면 별도 처리 필요)
  // 일단 단순하게 rawScrollProgress 그대로 사용

  return (
    <>
      {stage === "main" && (
        <SceneAudio src="/audio/scene01-intro.mp3" volume={0.7} />
      )}
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
                <BlackHoleAnimated
                  bhScaleRef={bhScaleRef}
                  bloomRef={bloomRef}
                  blendWeightRef={blendWeightRef}
                />
                <Spaceship mousePosition={mousePosition} />
                <StageController
                  phase={phase}
                  scrollProgress={rawScrollProgress}
                  bhScaleRef={bhScaleRef}
                  bloomRef={bloomRef}
                  blendWeightRef={blendWeightRef}
                  onIntroComplete={handleIntroComplete}
                />
              </>
            )}

            {stage === "tesseract" && (
              <Tesseract scrollProgress={rawScrollProgress} />
            )}
          </Canvas>
        </div>

        {/* Default Phase — 내레이션 */}
        {stage === "main" && phase === "default" && (
          <Narration
            active={true}
            onComplete={() => setNarrationComplete(true)}
          />
        )}

        {/* Default Phase 끝 — 스크롤 안내 */}
        {stage === "main" && phase === "default" && (
          <ScrollHint show={narrationComplete} />
        )}

        {/* Tesseract 안내 */}
        {stage === "tesseract" && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 font-mono text-white/40 text-xs tracking-widest pointer-events-none">
            TESSERACT — KEEP SCROLLING
          </div>
        )}
      </div>

      {/* 스크롤 영역 — default 에서는 막혀있고 outro 에서만 활성 */}
      {/* 내레이션 끝나기 전엔 스크롤 비활성화 */}
      <div
        className="relative"
        style={{
          height:
            phase === "intro" || (phase === "default" && !narrationComplete)
              ? "100vh" // 스크롤 불가능
              : "300vh", // 스크롤 가능
        }}
      />
    </>
  );
}
