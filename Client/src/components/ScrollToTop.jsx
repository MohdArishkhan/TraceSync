import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

function ScrollToTop({isLightMode, setisLightMode}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300);
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

  return (
    visible && (
      <button
        onClick={scrollToTop}
        className={`fixed bottom-10 left-10 p-4 lg:p-6 rounded-full ${isLightMode ? "bg-[#4831D4] hover:bg-[#2f1a8d]":"bg-green-600 hover:bg-green-700"} text-white shadow-2xl shadow-black  z-50 hover:scale-90 transform duration-300 transition-all`}
      >
        <FaArrowUp className="w-5 h-5"/>
      </button>
    )
  );
}

export default ScrollToTop;