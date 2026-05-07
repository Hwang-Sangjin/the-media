import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";

export default function TitleText({ hasEntered }) {
  const groupRef = useRef();
  const [opacity, setOpacity] = useState(0);

  // 진입 후 천천히 페이드인
  useEffect(() => {
    if (!hasEntered) return;

    // 1초 정도 대기 후 페이드인 시작
    const timer = setTimeout(() => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.01;
        if (progress >= 1) {
          setOpacity(1);
          clearInterval(interval);
        } else {
          setOpacity(progress);
        }
      }, 30); // 약 3초 동안 페이드인

      return () => clearInterval(interval);
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasEntered]);

  // 미세한 떠다니는 움직임
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <Text
        fontSize={1.2}
        letterSpacing={0.08}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/BebasNeue-Regular.ttf"
      >
        THE MEDIA
        <meshStandardMaterial
          color="white"
          transparent
          opacity={opacity}
          emissive="white"
          emissiveIntensity={0.3}
        />
      </Text>

      {/* 약간의 라이팅 — 텍스트가 살짝 빛나도록 */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 5]} intensity={0.5} />
    </group>
  );
}
