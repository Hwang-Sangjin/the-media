import { useFrame } from "@react-three/fiber";
import { useTexture, OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

// ═════════════════════════════════════════════
//  실제 이미지 4장
// ═════════════════════════════════════════════
const IMAGE_PATHS = ["/img/1.jpg", "/img/2.jpg", "/img/3.jpg", "/img/4.jpg"];

// ═════════════════════════════════════════════
//  Photo Plane — plane geometry 에 이미지 텍스처
// ═════════════════════════════════════════════
function PhotoPlane({ position, rotation, scale, texture, floatOffset }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;

    // 미세한 떠다님 (각 plane 마다 다른 phase)
    const t = state.clock.elapsedTime;
    meshRef.current.position.y =
      position[1] + Math.sin(t * 0.5 + floatOffset) * 0.1;
    meshRef.current.position.x =
      position[0] + Math.cos(t * 0.4 + floatOffset) * 0.05;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[2, 1.5]} />
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

// ═════════════════════════════════════════════
//  Tesseract 메인
// ═════════════════════════════════════════════
export default function Tesseract({ scrollProgress = 0 }) {
  // 이미지 텍스처 로드
  const textures = useTexture(IMAGE_PATHS);

  // ═════════════════════════════════════════════
  //  이미지 배치 — 영화 책장 컨셉
  //  중심 빈 공간 + 사방으로 4장씩 (책장처럼)
  //  대각선 4방향에도 깊이감 있게
  // ═════════════════════════════════════════════
  const layout = [];

  // 사방 4면 (상/하/좌/우) — 각 면에 4개씩 = 16개
  // 위쪽
  for (let i = 0; i < 4; i++) {
    layout.push({
      position: [(i - 1.5) * 2.5, 4, -2 - i * 0.5],
      rotation: [Math.PI / 6, 0, 0],
      textureIndex: i % 4,
    });
  }
  // 아래쪽
  for (let i = 0; i < 4; i++) {
    layout.push({
      position: [(i - 1.5) * 2.5, -4, -2 - i * 0.5],
      rotation: [-Math.PI / 6, 0, 0],
      textureIndex: (i + 1) % 4,
    });
  }
  // 왼쪽
  for (let i = 0; i < 4; i++) {
    layout.push({
      position: [-5, (i - 1.5) * 2.5, -2 - i * 0.5],
      rotation: [0, Math.PI / 6, 0],
      textureIndex: (i + 2) % 4,
    });
  }
  // 오른쪽
  for (let i = 0; i < 4; i++) {
    layout.push({
      position: [5, (i - 1.5) * 2.5, -2 - i * 0.5],
      rotation: [0, -Math.PI / 6, 0],
      textureIndex: (i + 3) % 4,
    });
  }

  // 대각선 깊이 (4방향 — 1, 4, 7, 10시) — 각 방향 2장씩 = 8개
  const diagonals = [
    { x: 4, y: 3 }, // 1시
    { x: 4, y: -3 }, // 4시
    { x: -4, y: -3 }, // 7시
    { x: -4, y: 3 }, // 10시
  ];
  diagonals.forEach((d, i) => {
    for (let depth = 0; depth < 2; depth++) {
      layout.push({
        position: [d.x, d.y, -6 - depth * 3],
        rotation: [
          (Math.sign(d.y) * -Math.PI) / 8,
          (Math.sign(d.x) * -Math.PI) / 8,
          0,
        ],
        textureIndex: (i + depth) % 4,
      });
    }
  });

  // 안쪽 깊이감 — 카메라 정면 멀리
  for (let i = 0; i < 4; i++) {
    layout.push({
      position: [(i - 1.5) * 3, 0, -12],
      rotation: [0, 0, 0],
      textureIndex: i % 4,
    });
  }

  return (
    <>
      {/* OrbitControls — 마우스로 카메라 조작 */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={0.5}
        rotateSpeed={0.5}
      />

      {/* 라이팅 — 인터스텔라 무드 */}
      <ambientLight intensity={0.3} color="#ffeacc" />
      <pointLight position={[0, 0, 5]} intensity={0.8} color="#ffeacc" />
      <pointLight position={[0, 5, -10]} intensity={0.5} color="#ff9966" />

      {/* fog — 멀수록 어둠 속으로 사라짐 */}
      <fog attach="fog" args={["#0a0604", 10, 30]} />

      {/* 사진 plane들 */}
      <group>
        {layout.map((item, i) => (
          <PhotoPlane
            key={i}
            position={item.position}
            rotation={item.rotation}
            scale={[1, 1, 1]}
            texture={textures[item.textureIndex]}
            floatOffset={i * 0.7}
          />
        ))}
      </group>
    </>
  );
}
