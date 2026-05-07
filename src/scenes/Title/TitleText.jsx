import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";

export default function TitleText({ hasEntered, isZooming }) {
  const groupRef = useRef();
  const { camera } = useThree();
  const [opacity, setOpacity] = useState(0);
  const zoomStartTime = useRef(null);

  // 진입 후 페이드인
  useEffect(() => {
    if (!hasEntered) return;

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
      }, 30);

      return () => clearInterval(interval);
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasEntered]);

  // zoom 시작 시점 기록
  useEffect(() => {
    if (isZooming) {
      zoomStartTime.current = Date.now();
    }
  }, [isZooming]);

  useFrame((state) => {
    if (!groupRef.current) return;

    // 미세한 떠다니는 움직임 (zoom 중에는 멈춤)
    if (!isZooming) {
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }

    // 카메라 zoom-in 애니메이션
    if (isZooming && zoomStartTime.current) {
      const elapsed = (Date.now() - zoomStartTime.current) / 1000; // 초 단위
      const duration = 3; // 3초 동안 zoom

      // ease-in 효과 (천천히 시작, 빠르게 가속)
      const t = Math.min(elapsed / duration, 1);
      const eased = t * t * t; // cubic ease-in

      // 카메라 z: 8 → -3 (텍스트 z=0 통과)
      camera.position.z = 8 - eased * 11;
    }
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

      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 5]} intensity={0.5} />
    </group>
  );
}
