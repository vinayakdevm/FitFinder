import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function StackedScrollBackground() {
  const images = [
    "/assets/gym1.jpg",
    "/assets/gym2.jpg",
    "/assets/gym3.jpg",
    "/assets/gym4.jpg",
    "/assets/gym5.jpg",
    "/assets/gym6.jpg",
    "/assets/gym7.jpg",
    "/assets/gym8.jpg",
    "/assets/gym9.jpg",
    "/assets/gym10.jpg",
    "/assets/gym11.jpg",
    "/assets/gym12.jpg",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((prev) => Math.floor(Math.random() * images.length));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="
    fixed top-0 left-0
    w-screen h-screen
    min-w-[100vw] min-h-[100vh]
    object-cover
    pointer-events-none
  "
  >
      <AnimatePresence>
        <motion.img
          key={index}
          src={images[index]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
  );
}
