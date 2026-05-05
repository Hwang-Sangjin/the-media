import { useEffect, useRef } from "react";

/**
 * Canvas 2D 동적 노이즈 (지지직 효과)
 *
 * @param {number} opacity - 노이즈 강도 (0 ~ 1)
 * @param {number} fps - 노이즈 갱신 속도 (기본 30)
 * @param {number} resolution - 노이즈 텍스처 해상도. 작을수록 거친 노이즈, 가벼움
 */
export default function Noise({ opacity = 0.15, fps = 30, resolution = 200 }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastFrameTime = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // 저해상도 노이즈 텍스처 생성
    canvas.width = resolution;
    canvas.height = resolution;

    const frameInterval = 1000 / fps;

    const drawNoise = (timestamp) => {
      // FPS 제한
      if (timestamp - lastFrameTime.current < frameInterval) {
        animationRef.current = requestAnimationFrame(drawNoise);
        return;
      }
      lastFrameTime.current = timestamp;

      // 픽셀 데이터 생성
      const imageData = ctx.createImageData(resolution, resolution);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // 무작위 회색 값 (0 ~ 255)
        const value = Math.random() * 255;
        data[i] = value; // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
        data[i + 3] = 255; // A (불투명)
      }

      ctx.putImageData(imageData, 0, 0);

      animationRef.current = requestAnimationFrame(drawNoise);
    };

    animationRef.current = requestAnimationFrame(drawNoise);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [fps, resolution]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        opacity,
        mixBlendMode: "multiply",
        // CSS로 저해상도 노이즈를 화면 전체로 늘림 (픽셀 큐빅하게)
        imageRendering: "pixelated",
      }}
    />
  );
}
