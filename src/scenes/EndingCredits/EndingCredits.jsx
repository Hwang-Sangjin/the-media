import { useEffect, useState } from "react";
import { CREDIT_SECTIONS, CONTACT_LINKS } from "./creditsData";

export default function EndingCredits() {
  const [showTheEnd, setShowTheEnd] = useState(true);
  const [showCredits, setShowCredits] = useState(false);

  // The End → 대표 사진 + 크레딧 흐름
  useEffect(() => {
    // 2.5초 후 "The End" 사라지고 크레딧 시작
    const timer = setTimeout(() => {
      setShowTheEnd(false);
      setShowCredits(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-screen min-h-screen bg-black overflow-hidden">
      {/* The End - 처음 등장 후 페이드아웃 */}
      <div
        className={`fixed inset-0 flex items-center justify-center transition-opacity duration-1000 z-30 pointer-events-none ${
          showTheEnd ? "opacity-100" : "opacity-0"
        }`}
      >
        <h1 className="font-serif text-white text-7xl md:text-8xl italic tracking-wider">
          The End
        </h1>
      </div>

      {/* 크레딧 롤 - 위로 올라감 */}
      {showCredits && (
        <div
          className="absolute left-0 right-0 text-center"
          style={{
            animation: "creditsRoll 90s linear forwards",
            top: "100vh",
          }}
        >
          {/* 대표 사진 + Contact */}
          <div className="py-32 flex flex-col items-center">
            <div
              className="w-64 h-64 rounded-full bg-white/10 mb-8 flex items-center justify-center font-mono text-white/40 text-sm"
              style={{ border: "2px solid rgba(255,255,255,0.2)" }}
            >
              {/* 나중에 실제 사진으로 교체 */}
              YOUR PHOTO
            </div>

            <h2 className="font-serif text-white text-3xl mb-8 tracking-widest">
              Hwang Sangjin
            </h2>

            <div className="flex gap-6">
              {CONTACT_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-white/70 hover:text-white text-sm tracking-widest transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* 크레딧 섹션들 */}
          <div className="py-16">
            {CREDIT_SECTIONS.map((section) => (
              <div key={section.title} className="mb-16">
                <h3 className="font-mono text-white/40 text-xs tracking-[0.4em] mb-6">
                  {section.title}
                </h3>
                {section.items.map((item) => (
                  <p
                    key={item}
                    className="font-serif text-white text-xl md:text-2xl mb-2"
                  >
                    {item}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {/* Thanks for Watching */}
          <div className="py-32">
            <h2 className="font-serif text-white text-5xl md:text-6xl italic tracking-wider">
              Thanks for Watching
            </h2>
          </div>

          {/* 여백 */}
          <div className="h-screen" />
        </div>
      )}

      {/* 크레딧 롤 애니메이션 */}
      <style>{`
        @keyframes creditsRoll {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-100%);
          }
        }
      `}</style>
    </div>
  );
}
