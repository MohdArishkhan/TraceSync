import React, { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

function Brands({isLightMode,setisLightMode}) {
  const brandsRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      brandsRef.current,
      { x: 1000, scale: 0.5, opacity: 0 },
      {
        x: 0,
        scale: 1,
        opacity: 1,
        duration: 2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: brandsRef.current,
          start: "top 85%",
          end: "top 40%",
          scrub: 1.5,
        },
      }
    );
  }, []);

  const image_src = [
    "https://pngimg.com/uploads/amazon/amazon_PNG6.png",
    "https://www.pngplay.com/wp-content/uploads/9/Adidas-Logo-Transparent-Background.png",
    "https://www.freepnglogos.com/uploads/logo-myntra-png/myntra-logo-m-png-3.png",
    "https://theme.zdassets.com/theme_assets/773432/97100a5c5e27966c5d5b8132a3f41a81ee66c621.png",
    "https://static.vecteezy.com/system/resources/previews/027/127/440/large_2x/nba-logo-nba-icon-transparent-free-png.png",
  ];

  return (
    <div className={`pt-12 h-[50vh] overflow-x-hidden flex justify-center ${isLightMode?"bg-white":"bg-black"} items-center`}>
      <div
        ref={brandsRef}
        className="flex items-center justify-center gap-x-16 px-6"
      >
        {image_src.map((link, index) => (
          <img
            key={index}
            src={link}
            alt={`brand-${index}`}
            className="h-[10vw] w-[10vw] object-contain transition-transform duration-300 ease-in-out hover:scale-110 hover:cursor-pointer"
          />
        ))}
      </div>
    </div>
  );
}

export default Brands;
