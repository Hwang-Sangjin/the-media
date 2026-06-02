import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSceneStore, SCENES } from "../../store/sceneStore";
import BlackHole from "./BlackHole";
import Spaceship from "./Spaceship";
import Tesseract from "./Tesseract";
import SceneAudio from "./SceneAudio";
import MillerPlanet from "./MillerPlanet";
import TarsSection from "./TarsSection";

// ═════════════════════════════════════════════
//  상수
// ═════════════════════════════════════════════
const FADE_IN_DURATION = 4000; // 검은 화면 → 블랙홀 fade in (ms)
const FADE_IN_DELAY = 500;

const BH_SCALE_DEFAULT = 1.0;
const BLOOM_DEFAULT = 0.02;
const BLEND_WEIGHT_STATIC = 0.95;
const CAMERA_Z_DEFAULT = 10;

const TESSERACT_HEIGHT = 300; // vh

// ═════════════════════════════════════════════
//  BlackHole 래퍼 — 정적 (카메라 고정)
// ═════════════════════════════════════════════
function BlackHoleStatic() {
  return (
    <BlackHole
      bhScale={BH_SCALE_DEFAULT}
      bloomStrength={BLOOM_DEFAULT}
      blendWeight={BLEND_WEIGHT_STATIC}
    />
  );
}

function CameraSetup() {
  useFrame(({ camera }) => {
    camera.position.set(0, 0, CAMERA_Z_DEFAULT);
  });
  return null;
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
//  Tesseract 섹션
// ═════════════════════════════════════════════
function TesseractSection({ onEnd }) {
  const sectionRef = useRef(null);
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
//  필름 그레인 + 비네트 오버레이
// ═════════════════════════════════════════════
function CinematicOverlay() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    function drawGrain() {
      canvas.width = canvas.width; // clear
      const w = canvas.width;
      const h = canvas.height;

      // ── 필름 그레인 ──────────────────────────
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 30;
        data[i] = noise;
        data[i + 1] = noise;
        data[i + 2] = noise;
        data[i + 3] = 18; // 투명도 — 낮을수록 은은함
      }
      ctx.putImageData(imageData, 0, 0);

      // ── 비네트 ───────────────────────────────
      const gradient = ctx.createRadialGradient(
        w / 2,
        h / 2,
        h * 0.3,
        w / 2,
        h / 2,
        h * 0.85,
      );
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, "rgba(0,0,0,0.72)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(drawGrain);
    }

    drawGrain();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 20,
        mixBlendMode: "screen",
      }}
    />
  );
}

// ═════════════════════════════════════════════
//  메인
// ═════════════════════════════════════════════
export default function Scene01_Interstellar() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // fade in 오버레이
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const [overlayMounted, setOverlayMounted] = useState(true);
  const [sceneVisible, setSceneVisible] = useState(false);

  const goToScene = useSceneStore((s) => s.goToScene);
  const isTransitioning = useSceneStore((s) => s.isTransitioning);

  // ── 검은 화면 → fade in ──────────────────
  useEffect(() => {
    // 씬 마운트
    const t1 = setTimeout(() => {
      setSceneVisible(true);
    }, FADE_IN_DELAY);

    // 오버레이 fade out 시작
    const t2 = setTimeout(() => {
      requestAnimationFrame(() => setOverlayOpacity(0));
    }, FADE_IN_DELAY + 100);

    // 오버레이 unmount
    const t3 = setTimeout(() => {
      setOverlayMounted(false);
    }, FADE_IN_DELAY + FADE_IN_DURATION);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // ── 마우스 추적 ──────────────────────────
  useEffect(() => {
    const fn = (e) =>
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      });
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  const handleTesseractEnd = useCallback(() => {
    if (!isTransitioning) goToScene(SCENES.SCENE_02);
  }, [goToScene, isTransitioning]);

  return (
    <>
      {/* ══════════════════════════
          1. BlackHole Canvas — sticky
      ══════════════════════════ */}
      <div
        style={{ height: "100vh", position: "relative", background: "#000" }}
      >
        <div style={{ position: "sticky", top: 0, height: "100vh" }}>
          {sceneVisible && (
            <Canvas camera={{ position: [0, 0, CAMERA_Z_DEFAULT], fov: 60 }}>
              <ambientLight intensity={0.2} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <CameraSetup />
              <BlackHoleStatic />
              <Spaceship mousePosition={mousePosition} />
              <MillerPlanet />
            </Canvas>
          )}

          {/* 진입 fade in 오버레이 */}
          {overlayMounted && (
            <div
              className="absolute inset-0 bg-black pointer-events-none"
              style={{
                opacity: overlayOpacity,
                transition: `opacity ${FADE_IN_DURATION}ms ease-out`,
                zIndex: 15,
              }}
            />
          )}

          {/* 필름 그레인 + 비네트 */}
          <CinematicOverlay />

          {/* 스크롤 힌트 */}
          <ScrollHint show={!overlayMounted} />
        </div>
      </div>

      {/* ══════════════════════════
          2. TARS 섹션
      ══════════════════════════ */}
      <TarsSection onEnd={() => {}} />

      {/* ══════════════════════════
          3. Tesseract Canvas
      ══════════════════════════ */}
      <TesseractSection onEnd={handleTesseractEnd} />
    </>
  );
}
