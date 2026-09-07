import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

function ScrollToTop({ isLightMode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-8 left-8 p-3 rounded-tech-lg border backdrop-blur-md z-40 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl ${
        isLightMode
          ? "bg-white/90 border-gray-200 text-gray-800 hover:text-accent-violet hover:border-accent-violet shadow-purple-500/10"
          : "bg-dark-surface/90 border-dark-border text-gray-200 hover:text-white hover:border-accent-violet shadow-black/80"
      }`}
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}

export default ScrollToTop;
