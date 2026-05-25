import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useRef, useState, useMemo } from "react";
import * as THREE from "three";

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
      <Line points={outer} color="#ffffff" lineWidth={1.2} />
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
//  인트로 터널 — 무한 반복
// ═════════════════════════════════════════════
function IntroTunnel() {
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

    // ─── 가속 커브 ───────────────────────────
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
    } else {
      setInternalFlash(0);
    }

    // ✨ 완료 → 처음부터 다시 (무한 반복)
    if (rawT >= 1 && !completeFiredRef.current) {
      completeFiredRef.current = true;
      setTimeout(() => {
        startTimeRef.current = Date.now();
        completeFiredRef.current = false;
        setInternalFlash(0);
      }, 150); // 플래시 잠깐 유지 후 리셋
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

      {/* 플래시 */}
      <CameraFlash opacity={internalFlash} />
    </>
  );
}

// ═════════════════════════════════════════════
//  메인 — intro 만 무한 재생
// ═════════════════════════════════════════════
export default function Tesseract({ scrollProgress = 0 }) {
  return <IntroTunnel />;
}
