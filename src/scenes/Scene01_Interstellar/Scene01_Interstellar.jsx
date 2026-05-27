import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSceneStore, SCENES } from "../../store/sceneStore";
import BlackHole from "./BlackHole";
import Spaceship from "./Spaceship";
import Tesseract from "./Tesseract";
import SceneAudio from "./SceneAudio";
import HtmlSection, { HTML_SECTION_HEIGHT } from "./HtmlSection";
import MillerPlanet from "./MillerPlanet";

// ═════════════════════════════════════════════
//  상수
// ═════════════════════════════════════════════
const INTRO_OVERLAY_DELAY = 500;
const INTRO_OVERLAY_DURATION = 8000;

const TITLE_FADE_IN = 800;
const TITLE_HOLD = 1400;
const TITLE_FADE_OUT = 800;
const TITLE_TOTAL = TITLE_FADE_IN + TITLE_HOLD + TITLE_FADE_OUT;

const STAGE1_DURATION = 4000;
const STAGE2_DURATION = 14000;
const INTRO_TOTAL = STAGE1_DURATION + STAGE2_DURATION;

const CAMERA_Z_START = 1.5;
const CAMERA_Z_DEFAULT = 10;
const BH_SCALE_START = 0.1;
const BH_SCALE_DEFAULT = 1.0;
const BLOOM_START = 0.0;
const BLOOM_DEFAULT = 0.02;
const BLEND_WEIGHT_STATIC = 0.95;
const BLEND_WEIGHT_MOVING = 0.5;

const TESSERACT_HEIGHT = 300; // vh

const NARRATION_LINES = [
  { time: 2.4, text: "Do not go gentle into that good night" },
  { time: 6.2, text: "Old age should burn and rave at close of day" },
  { time: 11.5, text: "Rage, rage against the dying of the light." },
  { time: 17.6, text: "Though wise men at their end know dark is right" },
  { time: 21.5, text: "Because their words had forked no lightning they" },
  { time: 24.8, text: "Do not go gentle into that good night." },
  { time: 29, text: "Rage, rage against the dying of the light." },
];

const NARRATION_TOTAL_DURATION = 35000;
const TYPE_SPEED = 50;
const FADE_OUT_DURATION = 600;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ═════════════════════════════════════════════
//  Scene Title
// ═════════════════════════════════════════════
function SceneTitle({ onComplete }) {
  const [opacity, setOpacity] = useState(0);
  const [dur, setDur] = useState(TITLE_FADE_IN);
  const ref = useRef(onComplete);
  ref.current = onComplete;

  useEffect(() => {
    const t1 = setTimeout(() => {
      setDur(TITLE_FADE_IN);
      setOpacity(1);
    }, 50);
    const t2 = setTimeout(() => {
      setDur(TITLE_FADE_OUT);
      setOpacity(0);
    }, TITLE_FADE_IN + TITLE_HOLD);
    const t3 = setTimeout(() => ref.current(), TITLE_TOTAL);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
      style={{ opacity, transition: `opacity ${dur}ms ease-in-out` }}
    >
      <h1
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(3.5rem, 9vw, 9rem)",
          letterSpacing: "0.4em",
          color: "white",
          textShadow: "0 0 80px rgba(255,220,150,0.5)",
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
}) {
  const introStartTime = useRef(null);
  const prevBhScale = useRef(BH_SCALE_START);
  const introCompleteFired = useRef(false);

  useFrame(({ camera }) => {
    let cameraZ = CAMERA_Z_DEFAULT;
    let newBhScale = BH_SCALE_DEFAULT;
    let newBloom = BLOOM_DEFAULT;

    if (phase === "intro") {
      if (!introStartTime.current) introStartTime.current = Date.now();
      const elapsed = Date.now() - introStartTime.current;
      let progress = 0;

      if (elapsed >= STAGE1_DURATION && elapsed < INTRO_TOTAL) {
        progress = easeInOutCubic(
          (elapsed - STAGE1_DURATION) / STAGE2_DURATION,
        );
      } else if (elapsed >= INTRO_TOTAL) {
        progress = 1;
        if (!introCompleteFired.current) {
          introCompleteFired.current = true;
          onIntroComplete();
        }
      }

      cameraZ = CAMERA_Z_START + (CAMERA_Z_DEFAULT - CAMERA_Z_START) * progress;
      newBhScale =
        BH_SCALE_START + (BH_SCALE_DEFAULT - BH_SCALE_START) * progress;
      newBloom =
        BLOOM_START +
        (BLOOM_DEFAULT - BLOOM_START) *
          easeInOutCubic(Math.min(progress * 2.5, 1));
    }

    camera.position.z = cameraZ;
    const delta = Math.abs(newBhScale - prevBhScale.current);
    blendWeightRef.current =
      delta > 0.0001
        ? BLEND_WEIGHT_MOVING
        : blendWeightRef.current +
          (BLEND_WEIGHT_STATIC - blendWeightRef.current) * 0.1;

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
  const triggeredRef = useRef(new Set());
  const completeFiredRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    triggeredRef.current = new Set();
    completeFiredRef.current = false;

    const startTimer = setTimeout(() => {
      startTimeRef.current = Date.now();

      function tick() {
        const elapsed = Date.now() - startTimeRef.current;
        const elapsedSec = elapsed / 1000;

        NARRATION_LINES.forEach((line, i) => {
          if (elapsedSec >= line.time && !triggeredRef.current.has(i)) {
            triggeredRef.current.add(i);
            startLine(i);
          }
        });

        if (
          elapsed >= NARRATION_TOTAL_DURATION - FADE_OUT_DURATION &&
          !completeFiredRef.current
        ) {
          completeFiredRef.current = true;
          setIsFadingOut(true);
          setTimeout(() => onCompleteRef.current(), FADE_OUT_DURATION);
        }

        if (elapsed < NARRATION_TOTAL_DURATION)
          rafRef.current = requestAnimationFrame(tick);
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
    let i = 0;
    function next() {
      if (i <= line.length) {
        setTypedText(line.slice(0, i++));
        typeTimerRef.current = setTimeout(next, TYPE_SPEED);
      }
    }
    next();
  };

  if (!active || currentLineIndex < 0) return null;
  const currentLine = NARRATION_LINES[currentLineIndex]?.text || "";

  return (
    <div
      className="absolute left-12 md:left-16 pointer-events-none z-10"
      style={{ top: "28%" }}
    >
      <p
        className="font-serif text-white leading-relaxed italic"
        style={{
          fontSize: "clamp(1.2rem, 3vw, 2.1rem)",
          whiteSpace: "nowrap",
          opacity: isFadingOut ? 0 : 1,
          transition: `opacity ${FADE_OUT_DURATION}ms ease-in-out`,
          textShadow: "0 2px 12px rgba(0,0,0,0.95), 0 0 28px rgba(0,0,0,0.8)",
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
//  Tesseract Canvas 섹션
// ═════════════════════════════════════════════
function TesseractSection({ onEnd }) {
  const sectionRef = useRef(null);
  const scrollProgress = useRef(0);
  const [progress, setProgress] = useState(0);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const total = sectionRef.current.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const p = Math.min(Math.max(scrolled / total, 0), 1);
      setProgress(p);

      if (p >= 0.95) onEndRef.current();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={sectionRef}
      style={{
        height: `${TESSERACT_HEIGHT}vh`,
        position: "relative",
        background: "#000",
      }}
    >
      {/* Canvas 를 sticky 로 — 스크롤해도 화면에 고정 */}
      <div style={{ position: "sticky", top: 0, height: "100vh" }}>
        <Canvas camera={{ position: [0, 0, 0], fov: 80 }}>
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Tesseract scrollProgress={progress} />
        </Canvas>

        <div className="absolute top-8 left-1/2 -translate-x-1/2 font-mono text-white/40 text-xs tracking-widest pointer-events-none">
          TESSERACT — KEEP SCROLLING
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
//  메인
// ═════════════════════════════════════════════
export default function Scene01_Interstellar() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const [overlayMounted, setOverlayMounted] = useState(true);
  const [phase, setPhase] = useState("intro");
  const [narrationComplete, setNarrationComplete] = useState(false);

  const goToScene = useSceneStore((s) => s.goToScene);
  const isTransitioning = useSceneStore((s) => s.isTransitioning);

  const bhScaleRef = useRef(BH_SCALE_START);
  const bloomRef = useRef(BLOOM_START);
  const blendWeightRef = useRef(BLEND_WEIGHT_STATIC);

  // 진입 오버레이
  useEffect(() => {
    const t1 = setTimeout(
      () => requestAnimationFrame(() => setOverlayOpacity(0)),
      INTRO_OVERLAY_DELAY,
    );
    const t2 = setTimeout(
      () => setOverlayMounted(false),
      INTRO_OVERLAY_DELAY + INTRO_OVERLAY_DURATION,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // 마우스
  useEffect(() => {
    const fn = (e) =>
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      });
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  const handleIntroComplete = useCallback(() => setPhase("title"), []);
  const handleTitleComplete = useCallback(() => setPhase("default"), []);
  const handleNarrationComplete = useCallback(
    () => setNarrationComplete(true),
    [],
  );

  const handleTesseractEnd = useCallback(() => {
    if (!isTransitioning) goToScene(SCENES.SCENE_02);
  }, [goToScene, isTransitioning]);

  return (
    <>
      {/* 오디오 */}
      {phase === "intro" && (
        <SceneAudio src="/audio/scene01-intro.mp3" volume={0.7} />
      )}
      {phase === "default" && !narrationComplete && (
        <SceneAudio
          src="/audio/scene01-narration.mp3"
          volume={0.7}
          delay={1500}
        />
      )}

      {/* ══════════════════════════
          1. BlackHole Canvas
          sticky 로 스크롤해도 화면에 고정
      ══════════════════════════ */}
      <div
        style={{ height: "100vh", position: "relative", background: "#000" }}
      >
        <div style={{ position: "sticky", top: 0, height: "100vh" }}>
          <Canvas camera={{ position: [0, 0, CAMERA_Z_START], fov: 60 }}>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <BlackHoleAnimated
              bhScaleRef={bhScaleRef}
              bloomRef={bloomRef}
              blendWeightRef={blendWeightRef}
            />
            <Spaceship mousePosition={mousePosition} />
            <MillerPlanet />
            <StageController
              phase={phase}
              bhScaleRef={bhScaleRef}
              bloomRef={bloomRef}
              blendWeightRef={blendWeightRef}
              onIntroComplete={handleIntroComplete}
            />
          </Canvas>

          {/* 오버레이 */}
          {overlayMounted && (
            <div
              className="absolute inset-0 bg-black pointer-events-none"
              style={{
                opacity: overlayOpacity,
                transition: `opacity ${INTRO_OVERLAY_DURATION}ms ease-out`,
              }}
            />
          )}

          {phase === "title" && <SceneTitle onComplete={handleTitleComplete} />}
          {phase === "default" && (
            <Narration
              active
              onComplete={handleNarrationComplete}
              delay={1500}
            />
          )}
          {phase === "default" && <ScrollHint show={narrationComplete} />}
        </div>
      </div>

      {/* ══════════════════════════
          2. HTML 섹션
          narration 끝나면 표시
      ══════════════════════════ */}
      {narrationComplete && <HtmlSection />}

      {/* ══════════════════════════
          3. Tesseract Canvas
          narration 끝나면 표시
      ══════════════════════════ */}
      {narrationComplete && <TesseractSection onEnd={handleTesseractEnd} />}
    </>
  );
}
