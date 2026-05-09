import { Text3D, Center } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";

export default function TitleText({ hasEntered, isZooming }) {
  const groupRef = useRef();
  const { camera } = useThree();
  const [opacity, setOpacity] = useState(0);
  const zoomStartTime = useRef(null);
  const materialRef = useRef();

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

    // 머티리얼 opacity 업데이트
    if (materialRef.current) {
      materialRef.current.opacity = opacity;
    }

    // 미세한 떠다니는 움직임 (zoom 중에는 멈춤)
    if (!isZooming) {
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }

    // 카메라 zoom-in 애니메이션
    if (isZooming && zoomStartTime.current) {
      const elapsed = (Date.now() - zoomStartTime.current) / 1000;
      const duration = 3;
      const t = Math.min(elapsed / duration, 1);
      const eased = t * t * t;

      camera.position.z = 8 - eased * 11;
    }
  });

  return (
    <>
      {/* 라이팅 - 입체감을 살리기 위한 측면 조명 */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={0.8} />
      <directionalLight
        position={[-5, -3, 5]}
        intensity={0.4}
        color="#aabbff"
      />
      <pointLight position={[0, 0, 3]} intensity={0.5} />

      <group ref={groupRef}>
        <Center>
          <Text3D
            font="/fonts/BebasNeue-Regular.json"
            size={1.2}
            height={0.3}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.015}
            bevelSegments={5}
            letterSpacing={0.05}
          >
            THE MEDIA
            <meshStandardMaterial
              ref={materialRef}
              color="white"
              metalness={0.4}
              roughness={0.3}
              emissive="white"
              emissiveIntensity={0.15}
              transparent
              opacity={opacity}
            />
          </Text3D>
        </Center>
      </group>
    </>
  );
}
