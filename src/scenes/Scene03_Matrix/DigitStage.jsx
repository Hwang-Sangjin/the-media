import { useEffect, useState } from "react";
import DigitRain from "./DigitRain";

export default function DigitStage({ onRabbitClick }) {
  const [showContent, setShowContent] = useState(false);

  // 진입 후 1초 뒤에 quote + 토끼 등장
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 bg-black">
      <DigitRain />

      {/* Quote */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
      >
        <p
          className="font-mono text-3xl md:text-4xl tracking-wider text-center px-8"
          style={{
            color: "#0F0",
            textShadow: "0 0 20px #0F0, 0 0 40px #0F0",
          }}
        >
          "I can only show you the door"
        </p>

        {/* 토끼 아이콘 */}
        <button
          onClick={onRabbitClick}
          className="mt-16 group transition-transform hover:scale-110"
          aria-label="Follow the white rabbit"
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            style={{
              filter: "drop-shadow(0 0 10px #0F0)",
            }}
          >
            {/* 간단한 토끼 실루엣 */}
            <ellipse cx="32" cy="42" rx="14" ry="16" fill="#0F0" />
            <ellipse
              cx="22"
              cy="20"
              rx="4"
              ry="14"
              fill="#0F0"
              transform="rotate(-15 22 20)"
            />
            <ellipse
              cx="42"
              cy="20"
              rx="4"
              ry="14"
              fill="#0F0"
              transform="rotate(15 42 20)"
            />
            <circle cx="27" cy="38" r="2" fill="#000" />
            <circle cx="37" cy="38" r="2" fill="#000" />
            <ellipse cx="32" cy="44" rx="2" ry="1" fill="#000" />
          </svg>
          <p
            className="mt-3 font-mono text-xs tracking-widest text-center"
            style={{ color: "#0F0" }}
          >
            FOLLOW
          </p>
        </button>
      </div>
    </div>
  );
}
