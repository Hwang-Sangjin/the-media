import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const VERT = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vNormal;

  void main() {
    vec3 lightDir = normalize(vec3(2.0, 0.5, 1.0));
    float diff = max(dot(vNormal, lightDir), 0.0);

    vec3 baseColor = vec3(0.03, 0.04, 0.06);
    vec3 litColor  = vec3(0.35, 0.28, 0.18);
    vec3 color = mix(baseColor, litColor, pow(diff, 1.5) * 0.7);

    float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
    color += vec3(0.02, 0.04, 0.08) * pow(rim, 3.0);

    gl_FragColor = vec4(color, 1.0);
  }
`;

// 최종 목표 위치
const TARGET_X = -3.5;
const TARGET_Y = 0.8;
const TARGET_Z = -2.0;

// 시작 위치 — 화면 왼쪽 밖
const START_X = -10.0;
const START_Y = 0.8;
const START_Z = -2.0;

// 이동 시작 딜레이 (ms) — intro 검은 화면 지나고 나서
const MOVE_DELAY = 8000; // 10초 후 이동 시작
const MOVE_DURATION = 8000; // 8초 동안 이동

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function MillerPlanet() {
  const groupRef = useRef();
  const startTime = useRef(null);
  const moveStarted = useRef(false);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    // 자전
    groupRef.current.rotation.y = clock.elapsedTime * 0.04;

    // 이동 딜레이 체크
    if (!moveStarted.current) {
      if (!startTime.current) startTime.current = Date.now();
      const elapsed = Date.now() - startTime.current;

      if (elapsed < MOVE_DELAY) {
        // 아직 대기 — 화면 밖 왼쪽에 위치
        groupRef.current.position.set(START_X, START_Y, START_Z);
        return;
      }
      moveStarted.current = true;
      startTime.current = Date.now(); // 이동 시작 시간 재설정
    }

    // 이동 진행
    const elapsed = Date.now() - startTime.current;
    const progress = Math.min(elapsed / MOVE_DURATION, 1);
    const eased = easeOutCubic(progress);

    const x = START_X + (TARGET_X - START_X) * eased;
    const y = START_Y + (TARGET_Y - START_Y) * eased;
    const z = START_Z + (TARGET_Z - START_Z) * eased;

    groupRef.current.position.set(x, y, z);
  });

  return (
    <group ref={groupRef} position={[START_X, START_Y, START_Z]}>
      {/* 행성 본체 */}
      <mesh renderOrder={10000} frustumCulled={false}>
        <sphereGeometry args={[0.18, 64, 64]} />
        <shaderMaterial
          vertexShader={VERT}
          fragmentShader={FRAG}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {/* 대기권 */}
      <mesh renderOrder={10001} frustumCulled={false}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial
          color="#0a2040"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
