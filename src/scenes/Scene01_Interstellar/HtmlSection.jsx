import { useEffect, useRef } from "react";

export const HTML_SECTION_HEIGHT = 200; // vh

export default function HtmlSection() {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !lineRef.current || !dotRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;

      const scrollInSection = window.scrollY - sectionTop;
      const progress = Math.min(
        Math.max(scrollInSection / window.innerHeight, 0),
        1,
      );
      const pct = progress * 100;

      lineRef.current.style.height = `${pct}%`;
      dotRef.current.style.top = `${pct}%`;
      dotRef.current.style.opacity = pct > 1 && pct < 99 ? "1" : "0";
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={sectionRef}
      style={{
        background: "#000",
        minHeight: `${HTML_SECTION_HEIGHT}vh`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 상단 그라데이션 */}
      <div
        className="absolute top-0 left-0 w-full pointer-events-none"
        style={{
          height: "30vh",
          background: "linear-gradient(to bottom, transparent, #000)",
          zIndex: 1,
        }}
      />

      {/* ── Story in Space 타이틀 ── */}
      <div
        className="flex flex-col items-center justify-center"
        style={{ minHeight: "80vh", position: "relative", zIndex: 2 }}
      >
        <p
          className="font-mono uppercase mb-6"
          style={{
            fontSize: "clamp(0.6rem, 1.2vw, 0.85rem)",
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.4em",
          }}
        >
          — A personal journey —
        </p>

        <h2
          className="text-white text-center uppercase"
          style={{
            fontFamily: "'Bebas Neue', 'Arial Narrow', sans-serif",
            fontSize: "clamp(4rem, 14vw, 13rem)",
            letterSpacing: "0.05em",
            lineHeight: 0.9,
            textShadow:
              "0 0 120px rgba(255,200,100,0.08), 0 0 40px rgba(255,255,255,0.04)",
          }}
        >
          <span style={{ display: "block" }}>Story</span>
          <span
            style={{
              display: "block",
              WebkitTextStroke: "1px rgba(255,255,255,0.5)",
              color: "transparent",
            }}
          >
            in Space
          </span>
        </h2>

        <div
          style={{
            width: "60px",
            height: "1px",
            background:
              "linear-gradient(to right, transparent, rgba(255,255,255,0.35), transparent)",
            margin: "3rem auto",
          }}
        />
      </div>

      {/* ── 스크롤 선 구간 ── */}
      <div
        style={{
          height: "100vh",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        {/* 선 트랙 배경 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "1px",
            height: "100%",
            background: "rgba(255,255,255,0.06)",
          }}
        />

        {/* 실제 선 */}
        <div
          ref={lineRef}
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "1px",
            height: "0%",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,200,100,0.4))",
            boxShadow: "0 0 8px rgba(255,255,255,0.3)",
          }}
        />

        {/* 끝 점 */}
        <div
          ref={dotRef}
          style={{
            position: "absolute",
            top: "0%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "white",
            boxShadow:
              "0 0 12px rgba(255,255,255,0.9), 0 0 24px rgba(255,200,100,0.5)",
            opacity: 0,
            transition: "opacity 0.2s",
          }}
        />
      </div>

      {/* 다음 컨텐츠 자리 */}
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "20vh", position: "relative", zIndex: 2 }}
      >
        <p
          className="font-mono"
          style={{
            fontSize: "0.65rem",
            color: "rgba(255,255,255,0.08)",
            letterSpacing: "0.35em",
          }}
        >
          ↓ MORE COMING
        </p>
      </div>
    </div>
  );
}
