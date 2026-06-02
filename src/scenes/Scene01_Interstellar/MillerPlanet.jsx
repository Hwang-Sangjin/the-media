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

const POS_X = -3.5;
const POS_Y = 0.8;
const POS_Z = -2.0;

export default function MillerPlanet() {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // 자전만
    groupRef.current.rotation.y = clock.elapsedTime * 0.04;
  });

  return (
    <group ref={groupRef} position={[POS_X, POS_Y, POS_Z]}>
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
