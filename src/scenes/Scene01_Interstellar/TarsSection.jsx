import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";

// ═════════════════════════════════════════════
//  TARS 섹션 높이
// ═════════════════════════════════════════════
export const TARS_SECTION_HEIGHT = 600; // vh

// ═════════════════════════════════════════════
//  카메라 컨트롤러 — 스크롤 진행에 따라 이동
// ═════════════════════════════════════════════
function CameraController({ progress }) {
  useFrame(({ camera }) => {
    // 0~30%: 클로즈업 (모니터 정면)
    // 30~60%: 줌아웃 (TARS 전체)
    // 60~100%: 옆/위로 이동 (우주 유영)

    let targetZ, targetX, targetY;

    if (progress < 0.3) {
      // 모니터 클로즈업
      const t = progress / 0.3;
      targetZ = 2 - t * 0.5;
      targetX = 0;
      targetY = 0;
    } else if (progress < 0.6) {
      // 줌아웃
      const t = (progress - 0.3) / 0.3;
      targetZ = 1.5 + t * 6;
      targetX = t * 2;
      targetY = t * 0.5;
    } else {
      // 우주 유영 — 카메라가 천천히 공전
      const t = (progress - 0.6) / 0.4;
      targetZ = 7.5 + Math.sin(t * Math.PI) * 1;
      targetX = 2 + Math.cos(t * Math.PI * 0.5) * 1.5;
      targetY = 0.5 + Math.sin(t * Math.PI * 0.3) * 0.5;
    }

    // 부드러운 lerp
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ═════════════════════════════════════════════
//  TARS Placeholder — 추후 3D 모델로 교체
// ═════════════════════════════════════════════
function TarsModel({ progress }) {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    // 우주 유영 — 60% 이후 천천히 회전
    if (progress > 0.6) {
      const t = (progress - 0.6) / 0.4;
      groupRef.current.rotation.y = clock.elapsedTime * 0.1 * t;
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.3) * 0.1 * t;
    } else {
      groupRef.current.rotation.y = 0;
      groupRef.current.position.y = 0;
    }
  });

  return (
    <group ref={groupRef}>
      {/* TARS 본체 placeholder — 직사각형 패널 */}
      <mesh>
        <boxGeometry args={[0.8, 2.0, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 모니터 패널 — 앞면 */}
      <mesh position={[0, 0.3, 0.08]}>
        <planeGeometry args={[0.7, 0.9]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* 하단 패널 */}
      <mesh position={[0, -0.55, 0.08]}>
        <planeGeometry args={[0.7, 0.7]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>

      {/* TARS 로고 (점 패턴) */}
      {[
        [-0.15, -0.45],
        [-0.05, -0.45],
        [0.05, -0.45],
        [-0.15, -0.55],
        [0.05, -0.55],
        [-0.15, -0.65],
        [-0.05, -0.65],
        [0.05, -0.65],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.09]}>
          <circleGeometry args={[0.025, 8]} />
          <meshBasicMaterial color="#8B4513" />
        </mesh>
      ))}

      {/* ── HTML 터미널 텍스트 — 모니터 위치 ── */}
      <Html
        position={[0, 0.3, 0.09]}
        transform
        occlude
        style={{ width: "280px", height: "360px", overflow: "hidden" }}
      >
        <TerminalText progress={progress} />
      </Html>
    </group>
  );
}

// ═════════════════════════════════════════════
//  터미널 텍스트 — HTML in Canvas
// ═════════════════════════════════════════════
function TerminalText({ progress }) {
  const lines = [
    "> INITIALIZING TARS SYSTEM...",
    "> ████████████████████ 100%",
    "",
    "> SUBJECT: HWANG SANGJIN",
    "> CODENAME: JIN",
    "> ROLE: MEDIA ENGINEER",
    "> LOCATION: SEOUL, KR",
    "> STATUS: ACTIVE",
    "",
    "> SCANNING CAREER LOG...",
    "> [2019] SOONGSIL UNIV",
    "> [2021] ITEMSCOUT",
    "> [2022] MOBILTECH",
    "> [2023] NAVER LABS ◀ CURRENT",
    "",
    "> CORE MODULES:",
    "> ├─ REACT      ██████████ 90%",
    "> ├─ THREE.JS   ████████░░ 80%",
    "> └─ GLSL       ███████░░░ 70%",
    "",
    "> READY. _",
  ];

  // 0~30% 구간에서 순차적으로 줄 표시
  const totalLines = lines.length;
  const visibleCount = Math.floor(Math.min(progress / 0.3, 1) * totalLines);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#000",
        padding: "12px",
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#00ff41",
        lineHeight: "1.6",
        overflow: "hidden",
      }}
    >
      {lines.slice(0, visibleCount).map((line, i) => (
        <div key={i}>{line || "\u00A0"}</div>
      ))}
      {/* 커서 */}
      {visibleCount < totalLines && <div style={{ display: "inline" }}>█</div>}
    </div>
  );
}

// ═════════════════════════════════════════════
//  별 배경 — 60% 이후 등장
// ═════════════════════════════════════════════
function StarField({ progress }) {
  const starsRef = useRef();
  const opacity = Math.max(0, (progress - 0.5) / 0.2);

  // 별 1000개 랜덤 위치
  const positions = useRef(
    Float32Array.from({ length: 3000 }, () => (Math.random() - 0.5) * 50),
  );

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.current, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={opacity}
        sizeAttenuation
      />
    </points>
  );
}

// ═════════════════════════════════════════════
//  TarsScene — Canvas 내부
// ═════════════════════════════════════════════
function TarsScene({ progress }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-3, 2, 2]} intensity={0.5} color="#aabbff" />

      <CameraController progress={progress} />
      <TarsModel progress={progress} />
      <StarField progress={progress} />
    </>
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
        <Canvas camera={{ position: [0, 0, 2], fov: 60 }}>
          <TarsScene progress={progress} />
        </Canvas>

        {/* 진행도 힌트 */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-white/30 text-xs tracking-widest pointer-events-none"
          style={{ opacity: progress < 0.95 ? 1 : 0 }}
        >
          {progress < 0.3
            ? "LOADING TARS DATA..."
            : progress < 0.6
              ? "ESTABLISHING CONNECTION..."
              : "TARS ONLINE"}
        </div>
      </div>
    </div>
  );
}
