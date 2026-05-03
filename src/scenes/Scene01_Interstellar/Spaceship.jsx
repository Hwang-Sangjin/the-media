import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function Spaceship({ mousePosition }) {
  const meshRef = useRef();

  useFrame(() => {
    if (!meshRef.current) return;

    // 마우스 위치에 따라 미세하게 회전 + 위치 이동
    const targetX = 4 + mousePosition.x * 0.5;
    const targetY = mousePosition.y * 0.3;

    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.05;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.05;

    // 미세한 기울기
    meshRef.current.rotation.z = -mousePosition.x * 0.2;
    meshRef.current.rotation.x = mousePosition.y * 0.2;
  });

  return (
    <mesh ref={meshRef} position={[4, 0, 2]}>
      <boxGeometry args={[0.5, 0.2, 0.8]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}
