import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";

export default function CameraController({ scrollProgress }) {
  const { camera } = useThree();
  const targetZ = useRef(10);

  useFrame(() => {
    // 스크롤 진행에 따라 z 위치 결정
    // progress 0 → z=10 (멀리), progress 1 → z=3 (블랙홀 근처)
    targetZ.current = 10 - scrollProgress * 7;

    // 부드럽게 보간 (lerp)
    camera.position.z += (targetZ.current - camera.position.z) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return null;
}
