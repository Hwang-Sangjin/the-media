import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";

function TV({ position, isOn, isClickable, onClick }) {
  return (
    <mesh position={position} onClick={onClick}>
      <boxGeometry args={[1.2, 0.8, 0.2]} />
      <meshStandardMaterial
        color={isOn ? (isClickable ? "#88ff88" : "#aaaaaa") : "#222222"}
        emissive={isOn ? (isClickable ? "#44ff44" : "#666666") : "#000000"}
        emissiveIntensity={isOn ? 0.6 : 0}
      />
    </mesh>
  );
}

export default function ArchitectRoom({ scrollProgress }) {
  const [tvsOn, setTvsOn] = useState(false);

  // 진입 후 1.5초 뒤 TV 켜짐
  useEffect(() => {
    const timer = setTimeout(() => setTvsOn(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // TV 격자 - 5x4 = 20개
  const tvs = [];
  for (let x = -3; x <= 3; x++) {
    for (let y = -1.5; y <= 1.5; y++) {
      // 일부만 클릭 가능 (placeholder - 무작위)
      const isClickable = Math.random() > 0.7;
      tvs.push({
        position: [x * 1.5, y * 1.2, -2],
        isClickable,
      });
    }
  }

  return (
    <div className="absolute inset-0 bg-black">
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 5]} intensity={0.5} />

        {tvs.map((tv, i) => (
          <TV
            key={i}
            position={tv.position}
            isOn={tvsOn}
            isClickable={tv.isClickable}
            onClick={() => {
              if (tv.isClickable) {
                console.log("TV clicked:", i);
                // 나중에 모달이나 확대 로직
              }
            }}
          />
        ))}
      </Canvas>

      {/* 안내 텍스트 */}
      {tvsOn && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 font-mono text-green-400 text-xs tracking-widest pointer-events-none animate-pulse">
          CLICK GREEN TVS TO EXPLORE
        </div>
      )}
    </div>
  );
}
