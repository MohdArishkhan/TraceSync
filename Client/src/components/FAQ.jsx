import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function FAQ({isLightMode,setisLightMode}) {
  const questions_answer = [
    {
      ques: "How CodeDoodle works?",
      ans:
        "Our code-sharing website is a real-time collaborative coding platform that allows developers to write, edit, and share code seamlessly in an interactive environment. It supports multiple programming languages, live code execution, and built-in chat for instant communication. Whether you're working on a team project, conducting coding interviews, or teaching, our platform ensures smooth collaboration with features like version control, cloud storage, and customizable themes for an enhanced coding experience.",
    },
    {
      ques: "What makes CodeDoodle different from other code-sharing tools?",
      ans:
        "Unlike traditional pastebin-style tools, CodeDoodle offers real-time collaboration, syntax highlighting, live preview support, chat integration, and project-based sharing — all in one place.",
    },
    {
      ques: "Can I use CodeDoodle for remote interviews and technical screenings?",
      ans:
        "Yes! CodeDoodle provides a live coding environment with communication tools, perfect for interviews, pair programming, and mentorship sessions.",
    },
    {
      ques: "Is my code safe and private on CodeDoodle?",
      ans:
        "Definitely. We offer password-protected rooms, role-based access control, and encryption during code transmission to keep your data secure.",
    },
    {
      ques: "Does CodeDoodle support multiple programming languages?",
      ans:
        "Yes! We support over 40 programming languages including JavaScript, Python, C++, Java, and more — each with syntax highlighting.",
    },
    {
      ques: "Do I need to install anything to use CodeDoodle?",
      ans:
        "Nope! CodeDoodle is fully web-based. Just open your browser, create or join a room, and you're good to go — no downloads needed.",
    },
  ];

  const refs = useRef([]);
  const [openStates, setOpenStates] = useState(Array(questions_answer.length).fill(false));

  useGSAP(() => {
    refs.current.forEach((ref) => {
      if (ref) gsap.set(ref, { height: 0, opacity: 0 });
    });
  }, []);

  const toggleContent = (index) => {
    const updatedStates = [...openStates];
    updatedStates[index] = !updatedStates[index];

    if (updatedStates[index]) {
      gsap.to(refs.current[index], {
        height: "auto",
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      });
    } else {
      gsap.to(refs.current[index], {
        height: 0,
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
      });
    }

    setOpenStates(updatedStates);
  };

  return (
    <div className={` ${isLightMode ? "bg-gray-100 text-gray-800" : "bg-black text-white"} flex flex-col items-center justify-center min-h-screen px-9 py-9 lg:px-12 lg:py-20 `}>
      <h1 className="text-2xl lg:text-6xl font-bold text-center mb-10 lg:mb-16">
        If you've got questions, we've got the answers.
      </h1>

      <div className="w-full max-w-5xl space-y-6">
        {questions_answer.map((item, index) => (
          <div key={index} className={`border border-gray-300 rounded-xl ${isLightMode?"bg-white":"bg-gray-950 hover:bg-gray-900 transform duration-300 transition-all"} shadow-xl`}>
            <div
              className="flex items-center gap-2 justify-between px-3 py-2 lg:px-6 lg:py-6 cursor-pointer"
              onClick={() => toggleContent(index)}
            >
              <h2 className="text-1xl lg:text-2xl font-semibold">{item.ques}</h2>
              <i
                className={`ri-${openStates[index] ? "close" : "add"}-line text-2xl lg:text-3xl hover:transform transition-all duration-300`}
              ></i>
            </div>

            <div ref={(el) => (refs.current[index] = el)} className="overflow-hidden px-4 lg:px-6">
              <p className="text-sm lg:text-lg py-4 leading-relaxed">{item.ans}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQ;
