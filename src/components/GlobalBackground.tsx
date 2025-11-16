import { AppBackground } from "./AppBackground";
import { CinematicBackground } from "./CinematicBackground";
import { StackedScrollBackground } from "./StackedScrollBackground";
import { motion } from "framer-motion";

export function GlobalBackground({ page }: { page: string }) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">

      {/* Landing + Meal → Cinematic */}
      <motion.div
        style={{ pointerEvents: "none" }}
        className="absolute inset-0"
        animate={{ opacity: page === "landing" || page === "meal" ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        <CinematicBackground />
      </motion.div>

      {/* Finder → Stacked Scroll */}
      <motion.div
        style={{ pointerEvents: "none" }}
        className="absolute inset-0"
        animate={{ opacity: page === "finder" ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        <StackedScrollBackground />
      </motion.div>

      {/* Routine → App Background */}
      <motion.div
        style={{ pointerEvents: "none" }}
        className="absolute inset-0"
        animate={{ opacity: page === "routine" ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        <AppBackground />
      </motion.div>

    </div>
  );
}
