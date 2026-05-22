import { useFrame } from "@react-three/fiber";
import { useTexture, Line } from "@react-three/drei";
import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import * as THREE from "three";

// ═════════════════════════════════════════════
//  이미지 4장
// ═════════════════════════════════════════════
const IMAGE_PATHS = ["/img/1.jpg", "/img/2.jpg", "/img/3.jpg", "/img/4.jpg"];

const DISTANCE = 5;

const LAYOUT = [
  { position: [0, 0, -DISTANCE], rotation: [0, 0, 0] },
  { position: [DISTANCE, 0, 0], rotation: [0, -Math.PI / 2, 0] },
  { position: [0, 0, DISTANCE], rotation: [0, Math.PI, 0] },
  { position: [-DISTANCE, 0, 0], rotation: [0, Math.PI / 2, 0] },
];

// ═════════════════════════════════════════════
//  터널 상수
// ═════════════════════════════════════════════
const FRAME_COUNT = 35;
const FRAME_SPACING = 4;
const FRAME_W = 5.5;
const FRAME_H = 3.5;
const INTRO_DURATION = 5000; // 5초

// ═════════════════════════════════════════════
//  격자 프레임 하나
// ═════════════════════════════════════════════
function TunnelFrame({ z }) {
  // 외곽 사각형
  const outer = useMemo(
    () => [
      new THREE.Vector3(-FRAME_W / 2, -FRAME_H / 2, 0),
      new THREE.Vector3(FRAME_W / 2, -FRAME_H / 2, 0),
      new THREE.Vector3(FRAME_W / 2, FRAME_H / 2, 0),
      new THREE.Vector3(-FRAME_W / 2, FRAME_H / 2, 0),
      new THREE.Vector3(-FRAME_W / 2, -FRAME_H / 2, 0),
    ],
    [],
  );

  // 수평 분할선 (1/3, 2/3)
  const h1 = useMemo(
    () => [
      new THREE.Vector3(-FRAME_W / 2, -FRAME_H / 6, 0),
      new THREE.Vector3(FRAME_W / 2, -FRAME_H / 6, 0),
    ],
    [],
  );
  const h2 = useMemo(
    () => [
      new THREE.Vector3(-FRAME_W / 2, FRAME_H / 6, 0),
      new THREE.Vector3(FRAME_W / 2, FRAME_H / 6, 0),
    ],
    [],
  );

  // 수직 분할선 (1/3, 2/3)
  const v1 = useMemo(
    () => [
      new THREE.Vector3(-FRAME_W / 6, -FRAME_H / 2, 0),
      new THREE.Vector3(-FRAME_W / 6, FRAME_H / 2, 0),
    ],
    [],
  );
  const v2 = useMemo(
    () => [
      new THREE.Vector3(FRAME_W / 6, -FRAME_H / 2, 0),
      new THREE.Vector3(FRAME_W / 6, FRAME_H / 2, 0),
    ],
    [],
  );

  return (
    <group position={[0, 0, z]}>
      {/* 외곽선 — 밝게 */}
      <Line points={outer} color="#ffffff" lineWidth={1.2} />
      {/* 분할선 — 어둡게 */}
      <Line
        points={h1}
        color="#aaaaff"
        lineWidth={0.4}
        transparent
        opacity={0.35}
      />
      <Line
        points={h2}
        color="#aaaaff"
        lineWidth={0.4}
        transparent
        opacity={0.35}
      />
      <Line
        points={v1}
        color="#aaaaff"
        lineWidth={0.4}
        transparent
        opacity={0.35}
      />
      <Line
        points={v2}
        color="#aaaaff"
        lineWidth={0.4}
        transparent
        opacity={0.35}
      />
    </group>
  );
}

// ═════════════════════════════════════════════
//  카메라 앞에 붙어다니는 화이트 플래시
// ═════════════════════════════════════════════
function CameraFlash({ opacity }) {
  const meshRef = useRef();

  useFrame(({ camera }) => {
    if (!meshRef.current) return;
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    meshRef.current.position.copy(camera.position).addScaledVector(dir, 0.5);
    meshRef.current.quaternion.copy(camera.quaternion);
  });

  if (opacity <= 0) return null;

  return (
    <mesh ref={meshRef} renderOrder={10000} frustumCulled={false}>
      <planeGeometry args={[500, 500]} />
      <meshBasicMaterial
        color="white"
        transparent
        opacity={opacity}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

// ═════════════════════════════════════════════
//  인트로 터널
// ═════════════════════════════════════════════
function IntroTunnel({ onComplete }) {
  const startTimeRef = useRef(null);
  const completeFiredRef = useRef(false);
  const [internalFlash, setInternalFlash] = useState(0);

  const framePositions = useMemo(
    () =>
      Array.from({ length: FRAME_COUNT }, (_, i) => -(i + 1) * FRAME_SPACING),
    [],
  );

  useFrame(({ camera }) => {
    if (!startTimeRef.current) startTimeRef.current = Date.now();

    const elapsed = Date.now() - startTimeRef.current;
    const rawT = Math.min(elapsed / INTRO_DURATION, 1);

    // ─── 가속 커브 ─────────────────────────────
    // 0~60%: 천천히 시작
    // 60~100%: 매우 빠르게 가속
    let t;
    if (rawT < 0.6) {
      const r = rawT / 0.6;
      t = r * r * r * 0.15; // 0 → 0.15
    } else {
      const r = (rawT - 0.6) / 0.4;
      t = 0.15 + r * r * r * 0.85; // 0.15 → 1.0
    }

    const totalDist = FRAME_COUNT * FRAME_SPACING;
    const cameraZ = -t * totalDist;

    // 카메라 정면 고정, 앞으로 돌진
    camera.position.set(0, 0, cameraZ);
    camera.rotation.set(0, 0, 0);

    // 80% 이후 플래시 빌드업
    if (rawT > 0.8) {
      const ft = (rawT - 0.8) / 0.2;
      setInternalFlash(Math.pow(ft, 1.5));
    }

    // 완료
    if (rawT >= 1 && !completeFiredRef.current) {
      completeFiredRef.current = true;
      onComplete();
    }
  });

  return (
    <>
      {/* 터널 안쪽으로 갈수록 어둠 */}
      <fog
        attach="fog"
        args={["#000000", 6, FRAME_COUNT * FRAME_SPACING * 0.55]}
      />

      {/* 터널 끝 수렴 빛 — 블루 화이트 */}
      <pointLight
        position={[0, 0, -(FRAME_COUNT * FRAME_SPACING * 0.8)]}
        intensity={8}
        color="#aabbff"
        distance={FRAME_COUNT * FRAME_SPACING * 1.2}
        decay={1.5}
      />

      {/* 격자 프레임들 */}
      {framePositions.map((z, i) => (
        <TunnelFrame key={i} z={z} />
      ))}

      {/* 내부 플래시 */}
      <CameraFlash opacity={internalFlash} />
    </>
  );
}

// ═════════════════════════════════════════════
//  Photo Plane
// ═════════════════════════════════════════════
function PhotoPlane({ position, rotation, texture, floatOffset }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.position.y =
      position[1] + Math.sin(t * 0.5 + floatOffset) * 0.1;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[3, 2.25]} />
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

// ═════════════════════════════════════════════
//  카메라 회전 (default phase)
// ═════════════════════════════════════════════
function CameraRotator({ scrollProgress }) {
  const targetRotationY = useRef(0);

  useFrame(({ camera }) => {
    const target = scrollProgress * Math.PI * 2;
    targetRotationY.current += (target - targetRotationY.current) * 0.05;
    camera.position.set(0, 0, 0);
    camera.rotation.set(0, targetRotationY.current, 0);
  });

  return null;
}

// ═════════════════════════════════════════════
//  메인
// ═════════════════════════════════════════════
export default function Tesseract({ scrollProgress = 0 }) {
  const [tessPhase, setTessPhase] = useState("intro");
  const [transFlash, setTransFlash] = useState(0);
  const textures = useTexture(IMAGE_PATHS);

  const handleIntroComplete = useCallback(() => {
    // 즉시 최대 밝기로 전환
    setTransFlash(1);
    setTessPhase("default");

    // 서서히 페이드아웃
    const startTime = Date.now();
    function fade() {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / 800, 1);
      const eased = 1 - t * t;
      setTransFlash(eased);
      if (t < 1) requestAnimationFrame(fade);
      else setTransFlash(0);
    }
    requestAnimationFrame(fade);
  }, []);

  return (
    <>
      {/* ── intro phase ── */}
      {tessPhase === "intro" && (
        <IntroTunnel onComplete={handleIntroComplete} />
      )}

      {/* ── 전환 플래시 — phase 바뀌어도 유지 ── */}
      <CameraFlash opacity={transFlash} />

      {/* ── default phase ── */}
      {tessPhase === "default" && (
        <>
          <ambientLight intensity={0.5} color="#ffeacc" />
          <pointLight position={[0, 0, 0]} intensity={1.5} color="#ffeacc" />

          <CameraRotator scrollProgress={scrollProgress} />

          {LAYOUT.map((item, i) => (
            <PhotoPlane
              key={i}
              position={item.position}
              rotation={item.rotation}
              texture={textures[i]}
              floatOffset={i * 0.7}
            />
          ))}
        </>
      )}
    </>
  );
}
