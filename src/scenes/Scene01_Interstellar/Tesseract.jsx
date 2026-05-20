import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useRef, useEffect } from "react";
import * as THREE from "three";

// ═════════════════════════════════════════════
//  실제 이미지 4장 — 앞/뒤/좌/우
// ═════════════════════════════════════════════
const IMAGE_PATHS = ["/img/1.jpg", "/img/2.jpg", "/img/3.jpg", "/img/4.jpg"];

const DISTANCE = 5;

// ═════════════════════════════════════════════
//  4면 배치 — 정면 / 오른쪽 / 뒤 / 왼쪽
// ═════════════════════════════════════════════
const LAYOUT = [
  {
    // 0번째 — 앞 (정면, scroll 0 일 때)
    position: [0, 0, -DISTANCE],
    rotation: [0, 0, 0],
  },
  {
    // 1번째 — 오른쪽 (scroll 0.25 일 때)
    position: [DISTANCE, 0, 0],
    rotation: [0, -Math.PI / 2, 0],
  },
  {
    // 2번째 — 뒤 (scroll 0.5 일 때)
    position: [0, 0, DISTANCE],
    rotation: [0, Math.PI, 0],
  },
  {
    // 3번째 — 왼쪽 (scroll 0.75 일 때)
    position: [-DISTANCE, 0, 0],
    rotation: [0, Math.PI / 2, 0],
  },
];

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
//  카메라 회전 컨트롤러 — 스크롤에 따라 자동 회전
// ═════════════════════════════════════════════
function CameraRotator({ scrollProgress }) {
  const targetRotationY = useRef(0);

  useFrame(({ camera }) => {
    // 스크롤 0~1 을 0~2π 로 변환 (한 바퀴)
    const target = scrollProgress * Math.PI * 2;

    // 부드러운 lerp
    targetRotationY.current += (target - targetRotationY.current) * 0.05;

    // 카메라 위치 원점 고정, 회전만
    camera.position.set(0, 0, 0);
    camera.rotation.set(0, targetRotationY.current, 0);

    // 디버그 로그 (가끔만)
    if (Math.random() < 0.02) {
      console.log(
        "🎥 rotY:",
        targetRotationY.current.toFixed(2),
        "scroll:",
        scrollProgress.toFixed(2),
      );
    }
  });

  return null;
}

// ═════════════════════════════════════════════
//  Tesseract 메인
// ═════════════════════════════════════════════
export default function Tesseract({ scrollProgress = 0 }) {
  const textures = useTexture(IMAGE_PATHS);

  useEffect(() => {
    console.log("🌌 Tesseract mounted");
    return () => console.log("🌌 Tesseract unmounted");
  }, []);

  console.log("🌌 Tesseract render, scrollProgress:", scrollProgress);

  return (
    <>
      {/* 라이팅 */}
      <ambientLight intensity={0.5} color="#ffeacc" />
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#ffeacc" />

      {/* 카메라 회전 컨트롤러 */}
      <CameraRotator scrollProgress={scrollProgress} />

      {/* 4면 사진 */}
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
  );
}
