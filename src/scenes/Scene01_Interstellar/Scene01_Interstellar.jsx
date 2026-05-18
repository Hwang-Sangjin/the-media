import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useState, useRef, useCallback } from "react";
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
const STAGE1_DURATION = 6000;
const STAGE2_DURATION = 16000;
const INTRO_TOTAL = STAGE1_DURATION + STAGE2_DURATION;

const OUTRO_DURATION = 8000; // ← outro 시간 기반 zoom in (8초)

// 카메라 z
const CAMERA_Z_START = 1.5;
const CAMERA_Z_DEFAULT = 10;
const CAMERA_Z_END = 0.3;

// 블랙홀 파라미터
const BH_SCALE_START = 0.1;
const BH_SCALE_DEFAULT = 1.0;
const BH_SCALE_END = 0.1;
const BLOOM_START = 0.0;
const BLOOM_DEFAULT = 0.08;

// Temporal AA blend weight
const BLEND_WEIGHT_STATIC = 0.95;
const BLEND_WEIGHT_MOVING = 0.5;

// ═════════════════════════════════════════════
//  Narration
// ═════════════════════════════════════════════
const NARRATION_LINES = [
  "Do not go gentle into that good night,",
  "Old age should burn and rave at close of day;",
  "Rage, rage against the dying of the light.",
  "Though wise men at their end know dark is right,",
  "Because their words had forked no lightning they",
  "Do not go gentle into that good night.",
  "Rage, rage against the dying of the light.",
];

const TYPE_SPEED = 60;
const LINE_HOLD = 1000;
const FADE_OUT_DURATION = 800;
const FINAL_HOLD = 2000;

// ═════════════════════════════════════════════
//  Easing
// ═════════════════════════════════════════════
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ═════════════════════════════════════════════
//  Stage Controller — Phase 별 시간 기반 애니메이션
// ═════════════════════════════════════════════
function StageController({
  phase,
  bhScaleRef,
  bloomRef,
  blendWeightRef,
  onIntroComplete,
  onOutroComplete,
}) {
  const introStartTime = useRef(null);
  const outroStartTime = useRef(null);
  const prevBhScale = useRef(BH_SCALE_START);
  const introCompleteFired = useRef(false);
  const outroCompleteFired = useRef(false);

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
      cameraZ = CAMERA_Z_DEFAULT;
      newBhScale = BH_SCALE_DEFAULT;
      newBloom = BLOOM_DEFAULT;
    } else if (phase === "outro") {
      // 시간 기반 zoom in (intro 와 같은 방식)
      if (outroStartTime.current === null) {
        outroStartTime.current = Date.now();
      }
      const elapsed = Date.now() - outroStartTime.current;

      let progress = 0;
      if (elapsed < OUTRO_DURATION) {
        progress = easeInOutCubic(elapsed / OUTRO_DURATION);
      } else {
        progress = 1;
        if (!outroCompleteFired.current) {
          outroCompleteFired.current = true;
          onOutroComplete();
        }
      }

      cameraZ = CAMERA_Z_DEFAULT + (CAMERA_Z_END - CAMERA_Z_DEFAULT) * progress;
      newBhScale =
        BH_SCALE_DEFAULT + (BH_SCALE_END - BH_SCALE_DEFAULT) * progress;
      newBloom = BLOOM_DEFAULT * (1 - progress);
    }

    camera.position.z = cameraZ;

    // blendWeight — intro / outro 시간 기반이라 매 프레임 일정한 delta
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
//  Narration
// ═════════════════════════════════════════════
function Narration({ active, onComplete }) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isFadingOut, setIsFadingOut] = useState(false);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) return;
    if (currentLineIndex >= NARRATION_LINES.length) return;

    const line = NARRATION_LINES[currentLineIndex];
    let charIndex = 0;
    let typeTimer = null;
    let holdTimer = null;
    let fadeTimer = null;

    const typeNext = () => {
      if (charIndex <= line.length) {
        setTypedText(line.slice(0, charIndex));
        charIndex++;
        typeTimer = setTimeout(typeNext, TYPE_SPEED);
      } else {
        const isLast = currentLineIndex === NARRATION_LINES.length - 1;
        const hold = isLast ? FINAL_HOLD : LINE_HOLD;

        holdTimer = setTimeout(() => {
          setIsFadingOut(true);

          fadeTimer = setTimeout(() => {
            if (isLast) {
              onCompleteRef.current();
            } else {
              setTypedText("");
              setIsFadingOut(false);
              setCurrentLineIndex((prev) => prev + 1);
            }
          }, FADE_OUT_DURATION);
        }, hold);
      }
    };

    typeNext();

    return () => {
      clearTimeout(typeTimer);
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
    };
  }, [active, currentLineIndex]);

  if (!active) return null;

  return (
    <div className="absolute bottom-16 left-16 max-w-2xl pointer-events-none z-10">
      <p
        className="font-serif text-white text-2xl leading-relaxed italic transition-opacity"
        style={{
          opacity: isFadingOut ? 0 : 1,
          transitionDuration: `${FADE_OUT_DURATION}ms`,
        }}
      >
        {typedText}
        {typedText.length < NARRATION_LINES[currentLineIndex]?.length &&
          !isFadingOut && (
            <span className="inline-block w-[2px] h-[1em] bg-white ml-1 align-middle animate-pulse" />
          )}
      </p>
    </div>
  );
}

// ═════════════════════════════════════════════
//  Scroll Hint
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

  const [phase, setPhase] = useState("intro");
  const [narrationComplete, setNarrationComplete] = useState(false);

  const stage = useSceneStore((state) => state.stage);
  const goToStage = useSceneStore((state) => state.goToStage);
  const goToScene = useSceneStore((state) => state.goToScene);
  const isTransitioning = useSceneStore((state) => state.isTransitioning);

  const bhScaleRef = useRef(BH_SCALE_START);
  const bloomRef = useRef(BLOOM_START);
  const blendWeightRef = useRef(BLEND_WEIGHT_STATIC);

  useEffect(() => {
    const timer = setTimeout(() => {
      requestAnimationFrame(() => setHasEntered(true));
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

  // intro → default
  const handleIntroComplete = useCallback(() => {
    setPhase("default");
  }, []);

  const handleNarrationComplete = useCallback(() => {
    setNarrationComplete(true);
  }, []);

  // outro 끝나면 tesseract 로
  const handleOutroComplete = useCallback(() => {
    if (!isTransitioning) {
      goToStage("tesseract");
    }
  }, [goToStage, isTransitioning]);

  // default → outro (내레이션 끝 + 스크롤 시작 = 트리거)
  useEffect(() => {
    if (phase !== "default") return;
    if (!narrationComplete) return;
    if (rawScrollProgress > 0.001) {
      setPhase("outro");
      // 스크롤은 트리거로만 사용 → outro 진입 즉시 스크롤 위치 초기화
      window.scrollTo(0, 0);
    }
  }, [phase, narrationComplete, rawScrollProgress]);

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
                  bhScaleRef={bhScaleRef}
                  bloomRef={bloomRef}
                  blendWeightRef={blendWeightRef}
                  onIntroComplete={handleIntroComplete}
                  onOutroComplete={handleOutroComplete}
                />
              </>
            )}

            {stage === "tesseract" && (
              <Tesseract scrollProgress={rawScrollProgress} />
            )}
          </Canvas>
        </div>

        {stage === "main" && phase === "default" && (
          <Narration active={true} onComplete={handleNarrationComplete} />
        )}

        {stage === "main" && phase === "default" && (
          <ScrollHint show={narrationComplete} />
        )}

        {stage === "tesseract" && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 font-mono text-white/40 text-xs tracking-widest pointer-events-none">
            TESSERACT — KEEP SCROLLING
          </div>
        )}
      </div>

      {/* 스크롤 영역 — default 일 때만 활성. outro 진입하면 시간 기반이라 스크롤 불필요 */}
      <div
        className="relative"
        style={{
          height:
            phase === "default" && narrationComplete
              ? "300vh" // 스크롤 가능 (트리거 역할)
              : "100vh", // 스크롤 비활성화 (intro, narration 중, outro)
        }}
      />
    </>
  );
}
