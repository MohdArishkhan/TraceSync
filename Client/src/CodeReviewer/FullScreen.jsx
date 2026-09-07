import { useState } from "react";
import { motion } from "framer-motion";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";

function FullScreen({ isLightMode, setisLightMode }) {
  const [feedback, setFeedback] = useState("Run your code to see AI analysis and optimizations here.");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`h-screen max-h-screen w-full flex flex-col md:flex-row gap-4 p-4 transition-colors duration-300 overflow-hidden ${
        isLightMode ? "bg-slate-50" : "bg-zinc-950"
      }`}
    >
      <LeftPanel
        isLightMode={isLightMode}
        setisLightMode={setisLightMode}
        feedback={feedback}
        setFeedback={setFeedback}
      />
      <RightPanel
        isLightMode={isLightMode}
        feedback={feedback}
      />
    </motion.div>
  );
}

export default FullScreen;