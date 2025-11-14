import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function AppBackground() {
  const backgrounds = [
    "/assets/gym1.jpg",
    "/assets/gym2.jpg",
    "/assets/gym3.jpg",
    "/assets/gym4.jpg",
    "/assets/gym5.jpg",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % backgrounds.length);
    }, 7000);

    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">

      {/* Smooth fading slideshow */}
      <AnimatePresence>
        <motion.img
          key={backgrounds[index]}
          src={backgrounds[index]}
          alt="background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </AnimatePresence>

      {/* Soft glow halo */}
      <div className="
        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        w-[600px] h-[600px] rounded-full 
        bg-blue-500/20 blur-[150px] pointer-events-none
      "></div>

      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/30 to-black/60"></div>

    </div>
  );
}
