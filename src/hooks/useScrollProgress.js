import { useEffect, useState } from "react";

/**
 * 화면 스크롤 진행률을 0~1 사이 값으로 반환
 * 0 = 시작, 1 = 끝
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const newProgress = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(Math.max(0, Math.min(1, newProgress)));
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // 초기값
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return progress;
}
