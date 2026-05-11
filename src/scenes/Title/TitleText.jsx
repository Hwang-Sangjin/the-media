import { Text3D, Center } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";

// 카메라 움직임 강도 (2배 강화)
const CAMERA_MOVE_X = 1.2;
const CAMERA_MOVE_Y = 0.6;

// 스포트라이트 움직임 강도
const SPOTLIGHT_RANGE_X = 4;
const SPOTLIGHT_RANGE_Y = 3;

export default function TitleText({ hasEntered, isZooming, mouseRef }) {
  const groupRef = useRef();
  const { camera } = useThree();
  const [opacity, setOpacity] = useState(0);
  const zoomStartTime = useRef(null);
  const frontMaterialRef = useRef();
  const sideMaterialRef = useRef();
  const spotLightRef = useRef();
  const spotLightTargetRef = useRef();

  // 페이드인
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

  // zoom 시작 시점
  useEffect(() => {
    if (isZooming) {
      zoomStartTime.current = Date.now();
    }
  }, [isZooming]);

  useFrame((state) => {
    if (!groupRef.current) return;

    // 머티리얼 opacity 업데이트
    if (frontMaterialRef.current) {
      frontMaterialRef.current.opacity = opacity;
    }
    if (sideMaterialRef.current) {
      sideMaterialRef.current.opacity = opacity;
    }

    // 떠다니는 움직임
    if (!isZooming) {
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }

    // 마우스 기반 카메라 무빙
    if (!isZooming && mouseRef?.current) {
      const targetX = mouseRef.current.x * CAMERA_MOVE_X;
      const targetY = mouseRef.current.y * CAMERA_MOVE_Y;

      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
    }

    // 스포트라이트가 마우스 따라 움직임
    if (
      spotLightRef.current &&
      spotLightTargetRef.current &&
      mouseRef?.current
    ) {
      // 스포트라이트 위치 (글자 앞쪽 + 마우스 위치)
      const lightTargetX = mouseRef.current.x * SPOTLIGHT_RANGE_X;
      const lightTargetY = mouseRef.current.y * SPOTLIGHT_RANGE_Y;

      // 라이트 자체는 글자 앞쪽 위에 고정, 타겟만 마우스 따라감
      spotLightRef.current.position.x +=
        (lightTargetX * 0.5 - spotLightRef.current.position.x) * 0.08;
      spotLightRef.current.position.y +=
        (lightTargetY * 0.5 + 2 - spotLightRef.current.position.y) * 0.08;

      // 라이트가 비추는 지점 (글자 표면 = z=0 근처)
      spotLightTargetRef.current.position.x +=
        (lightTargetX - spotLightTargetRef.current.position.x) * 0.08;
      spotLightTargetRef.current.position.y +=
        (lightTargetY - spotLightTargetRef.current.position.y) * 0.08;
    }

    // 카메라 zoom-in 애니메이션
    if (isZooming && zoomStartTime.current) {
      const elapsed = (Date.now() - zoomStartTime.current) / 1000;
      const duration = 3;
      const t = Math.min(elapsed / duration, 1);
      const eased = t * t * t;

      camera.position.z = 8 - eased * 11;
      camera.position.x += (0 - camera.position.x) * 0.1;
      camera.position.y += (0 - camera.position.y) * 0.1;
      camera.lookAt(0, 0, 0);
    }
  });

  return (
    <>
      {/* 베이스 라이팅 */}
      {/* <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={0.6} />
      <directionalLight
        position={[-5, -3, 5]}
        intensity={0.3}
        color="#aabbff"
      /> */}

      {/* 마우스 따라가는 스포트라이트 */}
      <spotLight
        ref={spotLightRef}
        position={[0, 2, 5]}
        angle={0.6}
        penumbra={0.7}
        intensity={200.0}
        color="#fff5d9"
        distance={15}
        decay={1.5}
        target={spotLightTargetRef.current}
      />
      {/* 스포트라이트 타겟 (라이트가 비추는 지점) */}
      <object3D ref={spotLightTargetRef} position={[0, 0, 0]} />

      <group ref={groupRef}>
        <Center>
          <Text3D
            font="/fonts/BebasNeue-Regular.json"
            size={1.2}
            height={0.5}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.05}
            bevelSize={0.015}
            bevelSegments={5}
            letterSpacing={0.05}
          >
            THE MEDIA
            {/* 정면 */}
            <meshStandardMaterial
              ref={frontMaterialRef}
              attach="material-0"
              color="#fff8e7"
              metalness={0.2}
              roughness={0.25}
              emissive="#fff8e7"
              emissiveIntensity={0.6}
              transparent
              opacity={opacity}
            />
            {/* 옆면 */}
            <meshStandardMaterial
              ref={sideMaterialRef}
              attach="material-1"
              color="#FF0000"
              metalness={0.5}
              roughness={0.4}
              emissive="#1a1815"
              emissiveIntensity={0.1}
              transparent
              opacity={opacity}
            />
          </Text3D>
        </Center>
      </group>
    </>
  );
}
