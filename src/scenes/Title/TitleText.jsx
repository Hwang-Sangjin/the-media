import { Text3D, Center } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";

// 카메라 움직임 강도
const CAMERA_MOVE_X = 1.2;
const CAMERA_MOVE_Y = 0.6;

// 스포트라이트 움직임 강도
const SPOTLIGHT_RANGE_X = 4;
const SPOTLIGHT_RANGE_Y = 3;

// ═════════════════════════════════════════════
//  등장 애니메이션 타이밍
// ═════════════════════════════════════════════
const APPEAR_DELAY = 1000; // hasEntered 후 등장 시작까지 (ms)
const APPEAR_DURATION = 4500; // 등장 진행 시간 (ms) - 더 천천히

// 등장 시 변화 범위
const SCALE_START = 0.3; // 글자 시작 크기 (작게)
const SCALE_END = 1.0; // 글자 끝 크기 (정상)
const SPOTLIGHT_INTENSITY_END = 200.0; // 스포트라이트 최종 강도

// smoothstep easing
function smoothstep(t) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

export default function TitleText({ hasEntered, isZooming, mouseRef }) {
  const groupRef = useRef();
  const { camera } = useThree();
  const zoomStartTime = useRef(null);
  const appearStartTime = useRef(null);

  // 등장 진행도 (0~1) - state 대신 ref 로 매 프레임 업데이트
  const [appearProgress, setAppearProgress] = useState(0);

  const frontMaterialRef = useRef();
  const sideMaterialRef = useRef();
  const spotLightRef = useRef();
  const spotLightTargetRef = useRef();

  // hasEntered 가 true 가 되면 등장 시작 시간 기록
  useEffect(() => {
    if (!hasEntered) return;

    const timer = setTimeout(() => {
      appearStartTime.current = Date.now();
    }, APPEAR_DELAY);

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

    // ════ 등장 진행도 계산 ════
    let progress = 0;
    if (appearStartTime.current) {
      const elapsed = Date.now() - appearStartTime.current;
      progress = Math.min(elapsed / APPEAR_DURATION, 1);
    }
    const eased = smoothstep(progress);

    // ════ 1) Scale 변화 (작게 → 크게) ════
    const scale = SCALE_START + (SCALE_END - SCALE_START) * eased;
    groupRef.current.scale.setScalar(scale);

    // ════ 2) Opacity 페이드인 (약간 더 빠르게) ════
    const opacityEased = Math.min(eased * 1.2, 1);
    if (frontMaterialRef.current) {
      frontMaterialRef.current.opacity = opacityEased;
    }
    if (sideMaterialRef.current) {
      sideMaterialRef.current.opacity = opacityEased;
    }

    // ════ 3) Spotlight intensity 페이드인 ════
    if (spotLightRef.current) {
      spotLightRef.current.intensity = SPOTLIGHT_INTENSITY_END * eased;
    }

    // ════ 4) 떠다니는 움직임 ════
    if (!isZooming) {
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }

    // ════ 5) 마우스 기반 카메라 무빙 ════
    if (!isZooming && mouseRef?.current) {
      const targetX = mouseRef.current.x * CAMERA_MOVE_X;
      const targetY = mouseRef.current.y * CAMERA_MOVE_Y;

      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
    }

    // ════ 6) 스포트라이트가 마우스 따라 움직임 ════
    if (
      spotLightRef.current &&
      spotLightTargetRef.current &&
      mouseRef?.current
    ) {
      const lightTargetX = mouseRef.current.x * SPOTLIGHT_RANGE_X;
      const lightTargetY = mouseRef.current.y * SPOTLIGHT_RANGE_Y;

      spotLightRef.current.position.x +=
        (lightTargetX * 0.5 - spotLightRef.current.position.x) * 0.08;
      spotLightRef.current.position.y +=
        (lightTargetY * 0.5 + 2 - spotLightRef.current.position.y) * 0.08;

      spotLightTargetRef.current.position.x +=
        (lightTargetX - spotLightTargetRef.current.position.x) * 0.08;
      spotLightTargetRef.current.position.y +=
        (lightTargetY - spotLightTargetRef.current.position.y) * 0.08;
    }

    // ════ 7) 카메라 zoom-in 애니메이션 ════
    if (isZooming && zoomStartTime.current) {
      const elapsed = (Date.now() - zoomStartTime.current) / 1000;
      const duration = 3;
      const t = Math.min(elapsed / duration, 1);
      const eased = t * t * t;

      camera.position.z = 8 - eased * 11;
      camera.position.x += (0 - camera.position.x) * 0.1;
      camera.position.y += (0 - camera.position.y) * 0.1;

      if (camera.position.z > 0.5) {
        camera.lookAt(0, 0, 0);
      } else {
        camera.lookAt(
          camera.position.x,
          camera.position.y,
          camera.position.z - 1,
        );
      }
    }
  });

  return (
    <>
      {/* 마우스 따라가는 스포트라이트 — intensity 0 으로 시작 */}
      <spotLight
        ref={spotLightRef}
        position={[0, 2, 5]}
        angle={0.6}
        penumbra={0.7}
        intensity={0}
        color="#fff5d9"
        distance={15}
        decay={1.5}
        target={spotLightTargetRef.current}
      />
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
              opacity={0}
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
              opacity={0}
            />
          </Text3D>
        </Center>
      </group>
    </>
  );
}
