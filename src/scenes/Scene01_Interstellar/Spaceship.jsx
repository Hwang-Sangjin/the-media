import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// ═════════════════════════════════════════════
//  상수
// ═════════════════════════════════════════════
// 카메라 Z 값과 맞춰서 크기 계산
// intro 시작: cameraZ=1.5 → 크게 보임
// default: cameraZ=10 → 작게 보임
const SCALE_INTRO = 0.008; // intro 때 크기
const SCALE_DEFAULT = 0.002; // default 때 크기 (zoom out 완료)

const POS_INTRO = [0.8, 0.3, -0.5]; // intro — 화면 중앙 약간 우상단
const POS_DEFAULT = [3.5, 1.2, -8]; // default — 블랙홀 왼쪽 위 멀리

export default function Spaceship({
  mousePosition = { x: 0, y: 0 },
  bhScaleRef,
  cameraZRef,
}) {
  const groupRef = useRef();
  const { scene } = useGLTF("/models/endurance/scene.gltf");

  useFrame(({ camera, clock }) => {
    if (!groupRef.current) return;

    const t = clock.elapsedTime;

    // 카메라 Z 위치로 intro → default 진행도 계산
    // cameraZ: 1.5(intro) → 10(default)
    const camZ = camera.position.z;
    const progress = Math.min(Math.max((camZ - 1.5) / (10 - 1.5), 0), 1);

    // 크기 — intro 크게, zoom out 되면서 작아짐
    const scale = SCALE_INTRO + (SCALE_DEFAULT - SCALE_INTRO) * progress;
    groupRef.current.scale.setScalar(scale);

    // 위치 — intro 중앙에서 zoom out 되면서 왼쪽 위로 이동
    const px = POS_INTRO[0] + (POS_DEFAULT[0] - POS_INTRO[0]) * progress;
    const py = POS_INTRO[1] + (POS_DEFAULT[1] - POS_INTRO[1]) * progress;
    const pz = POS_INTRO[2] + (POS_DEFAULT[2] - POS_INTRO[2]) * progress;
    groupRef.current.position.set(px, py, pz);

    // 엔듀런스 호 자체 회전 (링 구조가 돌아가는 느낌)
    groupRef.current.rotation.z += 0.002;

    // 마우스에 살짝 반응
    groupRef.current.rotation.x +=
      (mousePosition.y * 0.05 - groupRef.current.rotation.x) * 0.02;
    groupRef.current.rotation.y +=
      (mousePosition.x * 0.05 - groupRef.current.rotation.y) * 0.02;

    // 미세 떠있는 효과
    groupRef.current.position.y += Math.sin(t * 0.4) * 0.002 * (1 - progress);
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} renderOrder={10000} />
    </group>
  );
}

useGLTF.preload("/models/endurance/scene.gltf");
