import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export const TARS_SECTION_HEIGHT = 600; // vh

// ═════════════════════════════════════════════
//  카메라 컨트롤러
// ═════════════════════════════════════════════
function CameraController({ progress }) {
  useFrame(({ camera }) => {
    let targetX, targetY, targetZ;

    if (progress < 0.3) {
      // 모니터 클로즈업
      const t = progress / 0.3;
      targetZ = 1.5 - t * 0.3;
      targetX = 0;
      targetY = 0.1;
    } else if (progress < 0.6) {
      // 줌아웃 — TARS 전체 등장
      const t = (progress - 0.3) / 0.3;
      const ease = t * t * (3 - 2 * t);
      targetZ = 1.2 + ease * 5;
      targetX = ease * 1.5;
      targetY = 0.1 - ease * 0.3;
    } else {
      // 우주 유영
      const t = (progress - 0.6) / 0.4;
      targetZ = 6.2 + Math.sin(t * Math.PI) * 0.5;
      targetX = 1.5 + Math.cos(t * Math.PI * 0.5) * 1;
      targetY = -0.2 + Math.sin(t * Math.PI * 0.3) * 0.3;
    }

    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.position.z += (targetZ - camera.position.z) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ═════════════════════════════════════════════
//  터미널 텍스트 (Html in Canvas)
// ═════════════════════════════════════════════
function TerminalText({ progress }) {
  const lines = [
    "> INITIALIZING TARS SYSTEM...",
    "> ████████████████████ 100%",
    "",
    "> SUBJECT: HWANG SANGJIN",
    "> CODENAME: JIN",
    "> ROLE: MEDIA ENGINEER",
    "> LOCATION: SEOUL, KR — 37.5665°N 126.9780°E",
    "> STATUS: ACTIVE",
    "",
    "> SCANNING CAREER LOG...",
    "> [2019] SOONGSIL UNIV — GLOBAL MEDIA",
    "> [2021] ITEMSCOUT — FRONTEND",
    "> [2022] MOBILTECH — ENGINEER",
    "> [2023] NAVER LABS — ◀ CURRENT",
    "",
    "> CORE MODULES:",
    "> ├─ REACT      ██████████ 90%",
    "> ├─ THREE.JS   ████████░░ 80%",
    "> └─ GLSL       ███████░░░ 70%",
    "",
    "> HUMOR.exe    75%",
    "> HONESTY.exe  90%",
    "",
    "> READY. _",
  ];

  const totalLines = lines.length;
  // 0~30% 구간에서 순차 등장
  const visibleCount = Math.floor(Math.min(progress / 0.28, 1) * totalLines);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.92)",
        padding: "10px 14px",
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        color: "#00ff41",
        lineHeight: "1.65",
        overflow: "hidden",
        boxSizing: "border-box",
        textShadow: "0 0 8px rgba(0,255,65,0.6)",
      }}
    >
      {lines.slice(0, visibleCount).map((line, i) => (
        <div key={i}>{line || "\u00A0"}</div>
      ))}
      {visibleCount < totalLines && (
        <span
          style={{
            animation: "none",
            opacity: Math.sin(Date.now() / 300) > 0 ? 1 : 0,
          }}
        >
          █
        </span>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════
//  TARS 3D 모델
// ═════════════════════════════════════════════
function TarsModel({ progress }) {
  const groupRef = useRef();
  const { scene } = useGLTF("/models/tars/scene.gltf");

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;

    if (progress > 0.6) {
      // 우주 유영 — 느린 회전
      const p = (progress - 0.6) / 0.4;
      groupRef.current.rotation.y = t * 0.08 * p;
      groupRef.current.position.y = Math.sin(t * 0.25) * 0.08 * p;
    } else {
      groupRef.current.rotation.y = 0;
      groupRef.current.position.y = 0;
    }
  });

  return (
    <group ref={groupRef} rotation={[0, 0.3, 0]}>
      <primitive object={scene} />

      {/* 모니터 패널 위치에 Html 터미널 부착 */}
      <Html
        position={[0, 0.15, 0.08]}
        transform
        occlude
        style={{
          width: "240px",
          height: "340px",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <TerminalText progress={progress} />
      </Html>
    </group>
  );
}

// ═════════════════════════════════════════════
//  별 배경
// ═════════════════════════════════════════════
function StarField({ progress }) {
  const opacity = Math.max(0, (progress - 0.5) / 0.2);
  const positions = useRef(
    Float32Array.from({ length: 3000 }, () => (Math.random() - 0.5) * 60),
  );

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.current, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#ffffff"
        transparent
        opacity={opacity}
        sizeAttenuation
      />
    </points>
  );
}

// ═════════════════════════════════════════════
//  TarsSection — 메인
// ═════════════════════════════════════════════
export default function TarsSection({ onEnd }) {
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
        height: `${TARS_SECTION_HEIGHT}vh`,
        position: "relative",
        background: "#000",
      }}
    >
      <div style={{ position: "sticky", top: 0, height: "100vh" }}>
        <Canvas camera={{ position: [0, 0.1, 1.5], fov: 55 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[3, 3, 3]} intensity={2} color="#ffffff" />
          <pointLight position={[-2, 1, 2]} intensity={0.8} color="#aabbff" />
          <pointLight position={[0, -2, 1]} intensity={0.3} color="#334466" />

          <CameraController progress={progress} />
          <TarsModel progress={progress} />
          <StarField progress={progress} />
        </Canvas>

        {/* 진행 안내 */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs tracking-widest pointer-events-none"
          style={{
            color: progress < 0.95 ? "rgba(0,255,65,0.4)" : "transparent",
            transition: "color 0.5s",
          }}
        >
          {progress < 0.3
            ? "> LOADING..."
            : progress < 0.6
              ? "> ESTABLISHING CONNECTION..."
              : "> TARS ONLINE — KEEP SCROLLING"}
        </div>
      </div>
    </div>
  );
}

useGLTF.preload("/models/tars/scene.gltf");
