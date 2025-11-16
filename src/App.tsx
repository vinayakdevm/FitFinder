import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { LandingPage } from "./components/LandingPage";
import { ExerciseFinder } from "./components/ExerciseFinder";
import { RoutineGenerator } from "./components/RoutineGenerator";
import { GlobalBackground } from "./components/GlobalBackground";
import MealPlanner from "./components/MealPlanner";
import { WorkoutLogger } from "./components/WorkoutLogger";
import { CustomWorkoutBuilder } from "./components/CustomWorkoutBuilder";
import { WorkoutMode } from "./components/WorkoutMode";   // <-- IMPORTANT
import { ProgressTracker } from "./components/ProgressTracker";



type Page =
  | "landing"
  | "finder"
  | "routine"
  | "meal"
  | "workout"
  | "custom"
  | "workoutMode"
  | "progress";   // ⬅ NEW



function App() {
  const [page, setPage] = useState<Page>("landing");
  const [activeWorkout, setActiveWorkout] = useState<any>(null);

  return (
    <div className="bg-black text-white min-h-screen overflow-hidden relative">
      <GlobalBackground page={page} />

      <AnimatePresence mode="wait">
        
        {/* LANDING */}
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

        {/* FINDER */}
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
  onOpenCustomWorkout={() => setPage("custom")}
  onOpenProgress={() => setPage("progress")}   // 🚀 ADD THIS
/>

          </motion.div>
        )}

        {/* ROUTINE GENERATOR */}
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

        {/* MEAL PLANNER */}
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

        {/* WORKOUT LOGGER */}
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

        {/* CUSTOM WORKOUT BUILDER */}
        {page === "custom" && (
          <motion.div
            key="custom"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <CustomWorkoutBuilder
              onBack={() => setPage("finder")}
              onStartWorkout={(workout) => {
                setActiveWorkout(workout);
                setPage("workoutMode");
              }}
            />
          </motion.div>
        )}

        {/* WORKOUT MODE (FULL SCREEN TRAINER) */}
        {page === "workoutMode" && activeWorkout && (
          <motion.div
            key="workoutMode"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <WorkoutMode
              workout={activeWorkout}
              onBack={() => setPage("custom")}
            />
          </motion.div>
        )}

{page === "progress" && (
  <motion.div
    key="progress"
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -40 }}
    transition={{ duration: 0.8 }}
    className="relative z-10"
  >
    <ProgressTracker onBack={() => setPage("finder")} />
  </motion.div>
)}



      </AnimatePresence>
    </div>
  );
}

export default App;
