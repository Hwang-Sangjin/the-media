import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

// placeholder 사진 박스들 - 격자형 배치
function PhotoBox({ position, color }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    // 천천히 회전
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1.5, 1.5, 0.05]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

export default function Tesseract({ scrollProgress }) {
  // 격자 위치 생성 (5x5x10 = 250개)
  const photos = [];
  const colors = [
    "#88aaff",
    "#ffaa88",
    "#aaffaa",
    "#ffffaa",
    "#ff88ff",
    "#88ffff",
  ];

  for (let x = -2; x <= 2; x++) {
    for (let y = -2; y <= 2; y++) {
      for (let z = 0; z < 10; z++) {
        photos.push({
          position: [x * 3, y * 3, -z * 3],
          color: colors[(x + y + z + 6) % colors.length],
        });
      }
    }
  }

  return (
    <group position={[0, 0, scrollProgress * 25]}>
      {photos.map((photo, i) => (
        <PhotoBox key={i} position={photo.position} color={photo.color} />
      ))}
    </group>
  );
}
