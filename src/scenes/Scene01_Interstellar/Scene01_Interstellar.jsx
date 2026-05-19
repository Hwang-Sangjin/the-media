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

const OUTRO_DURATION = 8000; // outro 시간 기반 zoom in

// 카메라 z
const CAMERA_Z_START = 1.5;
const CAMERA_Z_DEFAULT = 10;
const CAMERA_Z_END = 0.3;

// 블랙홀 파라미터
const BH_SCALE_START = 0.1;
const BH_SCALE_DEFAULT = 1.0;
const BH_SCALE_END = 0.1;
const BLOOM_START = 0.0;
const BLOOM_DEFAULT = 0.02;

// Temporal AA blend weight
const BLEND_WEIGHT_STATIC = 0.95;
const BLEND_WEIGHT_MOVING = 0.5;

// ═════════════════════════════════════════════
//  Narration — 음악 큐포인트 기반
// ═════════════════════════════════════════════
const NARRATION_LINES = [
  { time: 3, text: "Do not go gentle into that good night," },
  { time: 6, text: "Old age should burn and rave at close of day;" },
  { time: 12, text: "Rage, rage against the dying of the light." },
  { time: 18, text: "Though wise men at their end know dark is right," },
  { time: 21, text: "Because their words had forked no lightning they" },
  { time: 24, text: "Do not go gentle into that good night." },
  { time: 29, text: "Rage, rage against the dying of the light." },
];

const NARRATION_TOTAL_DURATION = 35000;
const TYPE_SPEED = 50;
const FADE_OUT_DURATION = 600;

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
//  Narration — 음악 큐포인트와 동기화
// ═════════════════════════════════════════════
function Narration({ active, onComplete }) {
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [typedText, setTypedText] = useState("");
  const [isFadingOut, setIsFadingOut] = useState(false);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const startTimeRef = useRef(null);
  const rafRef = useRef(null);
  const typeTimerRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const triggeredLinesRef = useRef(new Set());
  const completeFiredRef = useRef(false);

  useEffect(() => {
    if (!active) return;

    startTimeRef.current = Date.now();
    triggeredLinesRef.current = new Set();
    completeFiredRef.current = false;

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const elapsedSec = elapsed / 1000;

      // 큐포인트 도달 체크
      NARRATION_LINES.forEach((line, index) => {
        if (elapsedSec >= line.time && !triggeredLinesRef.current.has(index)) {
          triggeredLinesRef.current.add(index);
          startLine(index);
        }
      });

      // 끝에 가까워지면 마지막 페이드아웃 + 완료
      if (
        elapsed >= NARRATION_TOTAL_DURATION - FADE_OUT_DURATION &&
        !completeFiredRef.current
      ) {
        completeFiredRef.current = true;
        setIsFadingOut(true);

        setTimeout(() => {
          onCompleteRef.current();
        }, FADE_OUT_DURATION);
      }

      if (elapsed < NARRATION_TOTAL_DURATION) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [active]);

  const startLine = (index) => {
    if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

    if (currentLineIndex >= 0 || typedText !== "") {
      setIsFadingOut(true);

      fadeTimerRef.current = setTimeout(() => {
        setIsFadingOut(false);
        setTypedText("");
        setCurrentLineIndex(index);
        typeLine(NARRATION_LINES[index].text);
      }, FADE_OUT_DURATION);
    } else {
      setCurrentLineIndex(index);
      typeLine(NARRATION_LINES[index].text);
    }
  };

  const typeLine = (line) => {
    let charIndex = 0;

    const typeNext = () => {
      if (charIndex <= line.length) {
        setTypedText(line.slice(0, charIndex));
        charIndex++;
        typeTimerRef.current = setTimeout(typeNext, TYPE_SPEED);
      }
    };

    typeNext();
  };

  if (!active) return null;
  if (currentLineIndex < 0) return null;

  const currentLine = NARRATION_LINES[currentLineIndex]?.text || "";

  return (
    <div className="absolute top-1/2 left-16 -translate-y-1/2 max-w-4xl pointer-events-none z-10">
      <p
        className="font-serif text-white text-4xl leading-relaxed italic transition-opacity"
        style={{
          opacity: isFadingOut ? 0 : 1,
          transitionDuration: `${FADE_OUT_DURATION}ms`,
        }}
      >
        {typedText}
        {typedText.length < currentLine.length && !isFadingOut && (
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
      window.scrollTo(0, 0);
    }
  }, [phase, narrationComplete, rawScrollProgress]);

  // tesseract → scene 2
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
      {/* 인트로 음악 — intro phase 동안만 */}
      {stage === "main" && phase === "intro" && (
        <SceneAudio src="/audio/scene01-intro.mp3" volume={0.7} />
      )}

      {/* 내레이션 음악 — default phase + 내레이션 진행 중 */}
      {stage === "main" && phase === "default" && !narrationComplete && (
        <SceneAudio src="/audio/scene01-narration.mp3" volume={0.7} />
      )}

      {/* 분위기 음악 — 내레이션 끝난 후 default phase 동안 */}
      {stage === "main" && phase === "default" && narrationComplete && (
        <SceneAudio src="/audio/scene01-default.mp3" volume={0.7} />
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

        {/* Default Phase — 내레이션 */}
        {stage === "main" && phase === "default" && (
          <Narration active={true} onComplete={handleNarrationComplete} />
        )}

        {/* 스크롤 안내 */}
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

      {/* 스크롤 영역 */}
      <div
        className="relative"
        style={{
          height: phase === "default" && narrationComplete ? "300vh" : "100vh",
        }}
      />
    </>
  );
}
