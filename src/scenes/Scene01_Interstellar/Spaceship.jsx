import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

const SCALE = 0.003;
const POS = [-2.5, 0.8, -5];

export default function Spaceship({ mousePosition = { x: 0, y: 0 } }) {
  const groupRef = useRef();
  const targetRot = useRef({ x: 0, y: 0 });
  const targetPos = useRef({ x: POS[0], y: POS[1] });
  const { scene } = useGLTF("/models/endurance/scene.gltf");

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;

    // ── 마우스 → 목표 회전값 ──────────────────
    targetRot.current.y = mousePosition.x * 0.15;
    targetRot.current.x = mousePosition.y * 0.08;

    // ── 마우스 → 목표 위치 (살짝 이동) ─────────
    targetPos.current.x = POS[0] + mousePosition.x * 0.3;
    targetPos.current.y = POS[1] + mousePosition.y * 0.15;

    // ── 부드러운 lerp ────────────────────────
    groupRef.current.rotation.y +=
      (targetRot.current.y - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x +=
      (targetRot.current.x - groupRef.current.rotation.x) * 0.05;

    groupRef.current.position.x +=
      (targetPos.current.x - groupRef.current.position.x) * 0.04;
    groupRef.current.position.y +=
      (targetPos.current.y - groupRef.current.position.y) * 0.04;

    // ── 자체 Y축 회전 (링 구조) ──────────────
    groupRef.current.rotation.y += 0.001;

    // ── 미세 부유 ────────────────────────────
    groupRef.current.position.z = POS[2] + Math.sin(t * 0.4) * 0.05;
  });

  return (
    <group ref={groupRef} position={POS} scale={SCALE}>
      <primitive object={scene} renderOrder={10000} />
    </group>
  );
}

useGLTF.preload("/models/endurance/scene.gltf");
