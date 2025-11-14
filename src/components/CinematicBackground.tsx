import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function CinematicBackground() {
  const images = [
    "/assets/gym1.jpg",
    "/assets/gym2.jpg",
    "/assets/gym3.jpg",
    "/assets/gym4.jpg",
    "/assets/gym5.jpg",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">

      <AnimatePresence>
      <motion.img
  key={images[index]}
  src={images[index]}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 2 }}
  className="
    fixed top-0 left-0
    w-screen h-screen 
    min-w-[100vw] min-h-[100vh]
    object-cover
    bg-black
  "
/>
      </AnimatePresence>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/90"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/40"></div>
    </div>
  );
}
