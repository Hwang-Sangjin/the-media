import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useState, useRef, useCallback } from "react";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import { useSceneStore, SCENES } from "../../store/sceneStore";
import BlackHole from "./BlackHole";
import Spaceship from "./Spaceship";
import Tesseract from "./Tesseract";
import SceneAudio from "./SceneAudio";

// ═════════════════════════════════════════════
//  진입 / 종료 오버레이 타이밍
// ═════════════════════════════════════════════
const INTRO_OVERLAY_DELAY = 500;
const INTRO_OVERLAY_DURATION = 8000;

const OUTRO_OVERLAY_DELAY = 4000;
const OUTRO_OVERLAY_DURATION = 4000;
const OUTRO_OVERLAY_FADE_OUT_DURATION = 2000;

// ═════════════════════════════════════════════
//  Title Phase 타이밍
// ═════════════════════════════════════════════
const TITLE_FADE_IN = 800; // 페이드인 (ms)
const TITLE_HOLD = 1400; // 유지 (ms)
const TITLE_FADE_OUT = 800; // 페이드아웃 (ms)
const TITLE_TOTAL = TITLE_FADE_IN + TITLE_HOLD + TITLE_FADE_OUT; // 3000ms

// ═════════════════════════════════════════════
//  Phase 타이밍 상수
// ═════════════════════════════════════════════
const STAGE1_DURATION = 4000;
const STAGE2_DURATION = 14000;
const INTRO_TOTAL = STAGE1_DURATION + STAGE2_DURATION;

const OUTRO_DURATION = 8000;

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
//  Narration
// ═════════════════════════════════════════════
const NARRATION_LINES = [
  { time: 3, text: "Do not go gentle into that good night" },
  { time: 6, text: "Old age should burn and rave at close of day" },
  { time: 12, text: "Rage, rage against the dying of the light." },
  { time: 18, text: "Though wise men at their end know dark is right" },
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
//  Scene Title — "INTERSTELLAR" 3초 표시
// ═════════════════════════════════════════════
function SceneTitle({ onComplete }) {
  const [opacity, setOpacity] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(TITLE_FADE_IN);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // 페이드인 시작
    const fadeInTimer = setTimeout(() => {
      setTransitionDuration(TITLE_FADE_IN);
      setOpacity(1);
    }, 50);

    // 페이드아웃 시작
    const fadeOutTimer = setTimeout(() => {
      setTransitionDuration(TITLE_FADE_OUT);
      setOpacity(0);
    }, TITLE_FADE_IN + TITLE_HOLD);

    // 완료 → default phase 전환
    const completeTimer = setTimeout(() => {
      onCompleteRef.current();
    }, TITLE_TOTAL);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
      style={{
        opacity,
        transition: `opacity ${transitionDuration}ms ease-in-out`,
      }}
    >
      <h1
        className="text-white tracking-[0.4em] uppercase text-center"
        style={{
          fontFamily: "'Bebas Neue', 'Arial Narrow', sans-serif",
          fontSize: "clamp(3.5rem, 9vw, 9rem)",
          letterSpacing: "0.4em",
          textShadow:
            "0 0 80px rgba(255,220,150,0.5), 0 0 30px rgba(255,255,255,0.3), 0 2px 12px rgba(0,0,0,0.9)",
        }}
      >
        INTERSTELLAR
      </h1>
    </div>
  );
}

// ═════════════════════════════════════════════
//  Stage Controller
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
    } else if (phase === "title") {
      // title phase — 카메라 / 블랙홀 정적 유지
      cameraZ = CAMERA_Z_DEFAULT;
      newBhScale = BH_SCALE_DEFAULT;
      newBloom = BLOOM_DEFAULT;
    } else if (phase === "default") {
      cameraZ = CAMERA_Z_DEFAULT;
      newBhScale = BH_SCALE_DEFAULT;
      newBloom = BLOOM_DEFAULT;
    } else if (phase === "outro") {
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
function Narration({ active, onComplete, delay = 0 }) {
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

    triggeredLinesRef.current = new Set();
    completeFiredRef.current = false;

    const startTimer = setTimeout(() => {
      startTimeRef.current = Date.now();

      // ✨ function 선언 — 호이스팅 되어서 재귀 호출 가능
      function tick() {
        const elapsed = Date.now() - startTimeRef.current;
        const elapsedSec = elapsed / 1000;

        NARRATION_LINES.forEach((line, index) => {
          if (
            elapsedSec >= line.time &&
            !triggeredLinesRef.current.has(index)
          ) {
            triggeredLinesRef.current.add(index);
            startLine(index);
          }
        });

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
      }

      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [active, delay]);

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
    <div
      className="absolute left-12 md:left-16 pointer-events-none z-10"
      style={{ top: "28%" }}
    >
      <p
        className="font-serif text-white leading-relaxed italic transition-opacity"
        style={{
          fontSize: "clamp(1.2rem, 3vw, 2.1rem)",
          whiteSpace: "nowrap",
          opacity: isFadingOut ? 0 : 1,
          transitionDuration: `${FADE_OUT_DURATION}ms`,
          textShadow:
            "0 2px 12px rgba(0,0,0,0.95), 0 0 28px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.6)",
        }}
      >
        {typedText}
        {typedText.length < currentLine.length && !isFadingOut && (
          <span
            className="inline-block w-[2px] h-[1em] bg-white ml-1 align-middle animate-pulse"
            style={{ boxShadow: "0 0 8px rgba(0,0,0,0.9)" }}
          />
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

  // 진입 검은 오버레이
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const [overlayMounted, setOverlayMounted] = useState(true);

  // 종료 검은 오버레이
  const [outroOverlayOpacity, setOutroOverlayOpacity] = useState(0);
  const [outroOverlayMounted, setOutroOverlayMounted] = useState(false);

  // ✨ phase: "intro" → "title" → "default" → "outro"
  const [phase, setPhase] = useState("intro");
  const [narrationComplete, setNarrationComplete] = useState(false);

  const stage = useSceneStore((state) => state.stage);
  const goToStage = useSceneStore((state) => state.goToStage);
  const goToScene = useSceneStore((state) => state.goToScene);
  const isTransitioning = useSceneStore((state) => state.isTransitioning);

  const bhScaleRef = useRef(BH_SCALE_START);
  const bloomRef = useRef(BLOOM_START);
  const blendWeightRef = useRef(BLEND_WEIGHT_STATIC);

  // 진입 오버레이 페이드아웃
  useEffect(() => {
    const fadeStartTimer = setTimeout(() => {
      requestAnimationFrame(() => {
        setOverlayOpacity(0);
      });
    }, INTRO_OVERLAY_DELAY);

    const unmountTimer = setTimeout(() => {
      setOverlayMounted(false);
    }, INTRO_OVERLAY_DELAY + INTRO_OVERLAY_DURATION);

    return () => {
      clearTimeout(fadeStartTimer);
      clearTimeout(unmountTimer);
    };
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

  // ✨ intro → title
  const handleIntroComplete = useCallback(() => {
    setPhase("title");
  }, []);

  // ✨ title → default
  const handleTitleComplete = useCallback(() => {
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

  // default → outro
  useEffect(() => {
    if (phase !== "default") return;
    if (!narrationComplete) return;
    if (rawScrollProgress > 0.001) {
      setPhase("outro");
      window.scrollTo(0, 0);
    }
  }, [phase, narrationComplete, rawScrollProgress]);

  // outro 시작 → 종료 오버레이 페이드인
  useEffect(() => {
    if (phase !== "outro") return;

    setOutroOverlayMounted(true);

    const fadeInTimer = setTimeout(() => {
      requestAnimationFrame(() => {
        setOutroOverlayOpacity(1);
      });
    }, OUTRO_OVERLAY_DELAY);

    return () => {
      clearTimeout(fadeInTimer);
    };
  }, [phase]);

  // tesseract 진입 → 종료 오버레이 페이드아웃
  useEffect(() => {
    if (stage !== "tesseract") return;
    if (!outroOverlayMounted) return;

    const fadeOutTimer = setTimeout(() => {
      requestAnimationFrame(() => {
        setOutroOverlayOpacity(0);
      });
    }, 100);

    const unmountTimer = setTimeout(() => {
      setOutroOverlayMounted(false);
    }, 100 + OUTRO_OVERLAY_FADE_OUT_DURATION);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(unmountTimer);
    };
  }, [stage, outroOverlayMounted]);

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
      {/* 인트로 음악 — intro phase */}
      {stage === "main" && phase === "intro" && (
        <SceneAudio src="/audio/scene01-intro.mp3" volume={0.7} />
      )}
      {/* title phase — 무음 (잠깐 정적) */}

      {/* 내레이션 음악 — default phase, narration 진행 중 */}
      {stage === "main" && phase === "default" && !narrationComplete && (
        <SceneAudio src="/audio/scene01-narration.mp3" volume={0.7} />
      )}

      {/* 분위기 음악 — narration 끝난 후 */}
      {stage === "main" && phase === "default" && narrationComplete && (
        <SceneAudio src="/audio/scene01-default.mp3" volume={0.7} />
      )}

      <div className="fixed inset-0 bg-black">
        {/* 3D Canvas */}
        <div className="absolute inset-0">
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

        {/* 진입 검은 오버레이 */}
        {overlayMounted && (
          <div
            className="absolute inset-0 bg-black pointer-events-none"
            style={{
              opacity: overlayOpacity,
              transition: `opacity ${INTRO_OVERLAY_DURATION}ms ease-out`,
            }}
          />
        )}

        {/* 종료 검은 오버레이 */}
        {outroOverlayMounted && (
          <div
            className="absolute inset-0 bg-black pointer-events-none"
            style={{
              opacity: outroOverlayOpacity,
              transition: `opacity ${
                stage === "tesseract"
                  ? OUTRO_OVERLAY_FADE_OUT_DURATION
                  : OUTRO_OVERLAY_DURATION
              }ms ${stage === "tesseract" ? "ease-out" : "ease-in"}`,
            }}
          />
        )}

        {/* ✨ Title Phase — "INTERSTELLAR" */}
        {stage === "main" && phase === "title" && (
          <SceneTitle onComplete={handleTitleComplete} />
        )}

        {/* Narration */}
        {stage === "main" && phase === "default" && (
          <Narration
            active={true}
            onComplete={handleNarrationComplete}
            delay={1500} // ← SceneAudio delay 랑 같은 값
          />
        )}

        {/* Scroll Hint */}
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
          height:
            (phase === "default" && narrationComplete) || stage === "tesseract"
              ? "300vh"
              : "100vh",
        }}
      />
    </>
  );
}
