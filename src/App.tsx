import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { LandingPage } from "./components/LandingPage";
import { ExerciseFinder } from "./components/ExerciseFinder";
import { RoutineGenerator } from "./components/RoutineGenerator";

import { GlobalBackground } from "./components/GlobalBackground";
import MealPlanner from "./components/MealPlanner";
import { WorkoutLogger } from "./components/WorkoutLogger";



type Page = "landing" | "finder" | "routine" | "meal" | "workout";



function App() {
  const [page, setPage] = useState<Page>("landing");

  return (
    <div className="bg-black text-white min-h-screen overflow-hidden relative">

      {/* 🔥 Global BG that never unmounts */}
      <GlobalBackground page={page} />

      {/* 🔥 Animated Page System */}
      <AnimatePresence mode="wait">
        {page === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <LandingPage onEnter={() => setPage("finder")} />
          </motion.div>
        )}

        {page === "finder" && (
          <motion.div
            key="finder"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <ExerciseFinder
  onReturnHome={() => setPage("landing")}
  onOpenRoutine={() => setPage("routine")}
  onOpenMeal={() => setPage("meal")}
  onOpenWorkout={() => setPage("workout")}
/>


          </motion.div>
        )}

        {page === "routine" && (
          <motion.div
            key="routine"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <RoutineGenerator onBack={() => setPage("finder")} />
          </motion.div>
        )}

{page === "meal" && (
  <motion.div
    key="meal"
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -40 }}
    transition={{ duration: 0.8 }}
    className="relative z-10"
  >
    <MealPlanner onBack={() => setPage("finder")} />
  </motion.div>
)}

{page === "workout" && (
  <motion.div
    key="workout"
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -40 }}
    transition={{ duration: 0.8 }}
    className="relative z-10"
  >
    <WorkoutLogger onBack={() => setPage("finder")} />
  </motion.div>
)}



      </AnimatePresence>

 

    </div>
  );
}

export default App;
