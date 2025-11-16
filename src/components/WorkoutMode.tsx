import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Pause, Play, RotateCcw } from "lucide-react";
import { StackedScrollBackground } from "./StackedScrollBackground";

/**
 * WorkoutMode - Robust rest logic (no voice)
 * - Uses refs to read latest indices inside effects
 * - Avoids unstable objects in dependency arrays
 * - Adds tiny setTimeout when entering rest to prevent race
 * - Console logs for debugging
 */

export function WorkoutMode({ workout, onBack }: { workout: any; onBack: () => void }) {
  const [stage, setStage] = useState<"intro" | "exercise" | "rest" | "finish">("intro");
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);

  // defensive defaults
  const exercises = workout?.exercises ?? [];
  const currentExercise = exercises[exerciseIndex] ?? { name: "Exercise", sets: 1, reps: 10, rest: 30 };

  // Refs to always read latest values inside effects without adding them to deps
  const latestExerciseIndexRef = useRef<number>(exerciseIndex);
  const latestSetIndexRef = useRef<number>(setIndex);
  const latestExercisesRef = useRef<any[]>(exercises);

  useEffect(() => { latestExerciseIndexRef.current = exerciseIndex; }, [exerciseIndex]);
  useEffect(() => { latestSetIndexRef.current = setIndex; }, [setIndex]);
  useEffect(() => { latestExercisesRef.current = exercises; }, [exercises]);

  // -------------------------------
  // Set timer
  // -------------------------------
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      console.log("[timer] start");
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [running]);

  const startTimer = () => setRunning(true);
  const pauseTimer = () => setRunning(false);
  const resetTimer = () => { setRunning(false); setTimer(0); };

  // -------------------------------
  // Rest timer
  // -------------------------------
  const [restTime, setRestTime] = useState(0);
  const restRef = useRef<number | null>(null);

  // Start rest countdown when entering rest
  useEffect(() => {
    if (stage === "rest") {
      // read rest directly from the exercises array using latest index
      const idx = latestExerciseIndexRef.current;
      const r = Number((latestExercisesRef.current?.[idx]?.rest) ?? 30);
      console.log("[rest] entering rest stage, index:", idx, "rest:", r);

      setRestTime(r);

      // clear any previous interval
      if (restRef.current) {
        clearInterval(restRef.current);
        restRef.current = null;
      }

      // small micro-delay to ensure UI has updated (prevents some race conditions)
      const startTimeout = window.setTimeout(() => {
        // start interval
        restRef.current = window.setInterval(() => {
          setRestTime((t) => t - 1);
        }, 1000);
        console.log("[rest] countdown started");
      }, 10);

      // cleanup the tiny timeout if component unmounts or stage changes before it runs
      return () => {
        clearTimeout(startTimeout);
        if (restRef.current) {
          clearInterval(restRef.current);
          restRef.current = null;
        }
      };
    }

    // if not in rest, ensure no interval is active
    return () => {
      if (restRef.current) {
        clearInterval(restRef.current);
        restRef.current = null;
      }
    };
  }, [stage]); // only depend on stage and read indexes from refs

  // When rest ends -> advance to next step
  useEffect(() => {
    if (stage === "rest" && restTime <= 0) {
      console.log("[rest] restTime <= 0, finishing rest");
      if (restRef.current) {
        clearInterval(restRef.current);
        restRef.current = null;
      }

      const t = window.setTimeout(() => {
        const currIdx = latestExerciseIndexRef.current;
        const currSet = latestSetIndexRef.current;
        const exs = latestExercisesRef.current;
        const currEx = exs?.[currIdx];

        console.log("[rest] deciding next step", { currIdx, currSet, currEx });

        // Next set available?
        if (currEx && currSet + 1 < currEx.sets) {
          setSetIndex((s) => s + 1);
          resetTimer();
          setStage("exercise");
          console.log("[rest] moving to next set", currSet + 1);
          return;
        }

        // Next exercise available?
        if (currIdx + 1 < (exs?.length ?? 0)) {
          setExerciseIndex((i) => i + 1);
          setSetIndex(0);
          resetTimer();
          setStage("exercise");
          console.log("[rest] moving to next exercise", currIdx + 1);
          return;
        }

        // Finish
        setStage("finish");
        console.log("[rest] workout finished");
      }, 150);

      return () => clearTimeout(t);
    }
  }, [restTime, stage]); // only depend on restTime and stage

  // -------------------------------
  // navigation actions (user)
  // -------------------------------
  const nextSet = () => {
    // stop per-set timer and then switch to rest with tiny delay to avoid batching races
    resetTimer();
    // tiny timeout to allow reset to flush before stage change
    setTimeout(() => setStage("rest"), 10);
  };

  const goToPrevExercise = () => {
    if (exerciseIndex === 0) return;
    setExerciseIndex((i) => i - 1);
    setSetIndex(0);
    resetTimer();
    setStage("exercise");
  };

  const skipRestNow = () => {
    console.log("[rest] skipRestNow called");
    if (restRef.current) {
      clearInterval(restRef.current);
      restRef.current = null;
    }
    // perform same logic as rest end (use refs to decide)
    const currIdx = latestExerciseIndexRef.current;
    const currSet = latestSetIndexRef.current;
    const exs = latestExercisesRef.current;
    const currEx = exs?.[currIdx];

    if (currEx && currSet + 1 < currEx.sets) {
      setSetIndex((s) => s + 1);
      resetTimer();
      setStage("exercise");
      return;
    }

    if (currIdx + 1 < (exs?.length ?? 0)) {
      setExerciseIndex((i) => i + 1);
      setSetIndex(0);
      resetTimer();
      setStage("exercise");
      return;
    }

    setStage("finish");
  };

  // -------------------------------
  // total workout time
  // -------------------------------
  const [totalTime, setTotalTime] = useState(0);
  const totalRef = useRef<number | null>(null);

  useEffect(() => {
    if (stage !== "finish") {
      if (!totalRef.current) totalRef.current = window.setInterval(() => setTotalTime((t) => t + 1), 1000);
    } else {
      if (totalRef.current) {
        clearInterval(totalRef.current);
        totalRef.current = null;
      }
    }
    return () => {
      if (totalRef.current) {
        clearInterval(totalRef.current);
        totalRef.current = null;
      }
    };
  }, [stage]);

  // save progress on finish
  useEffect(() => {
    if (stage === "finish") {
      try {
        const log = {
          id: Date.now(),
          date: new Date().toISOString(),
          workoutName: workout.name,
          totalExercises: exercises.length,
          totalSets: exercises.reduce((acc: number, ex: any) => acc + ex.sets, 0),
          totalTime,
        };
        const raw = localStorage.getItem("fitfinder_progress_logs");
        const logs = raw ? JSON.parse(raw) : [];
        logs.push(log);
        localStorage.setItem("fitfinder_progress_logs", JSON.stringify(logs));
      } catch (e) {
        console.error("Failed to save progress log:", e);
      }
    }
  }, [stage]); // only depends on stage

  // -------------------------------
  // UI
  // -------------------------------
  if (stage === "intro") {
    const totalSets = exercises.reduce((acc: number, e: any) => acc + e.sets, 0);
    const estMinutes = Math.ceil(totalSets * 2.5);

    return (
      <div className="relative min-h-screen text-white overflow-hidden">
        <StackedScrollBackground />
        <div className="relative z-10 max-w-3xl mx-auto p-6 text-center pt-20">
          <button onClick={onBack} className="absolute top-6 left-6 px-3 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20">
            <ArrowLeft />
          </button>

          <h1 className="text-5xl font-extrabold mb-4 text-gradient">{workout.name}</h1>
          <p className="text-gray-300 mb-6 text-lg">
            {exercises.length} exercises • {totalSets} sets • ~{estMinutes} min
          </p>

          <div className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-2xl p-6 max-h-64 overflow-y-auto mb-8">
            {exercises.map((ex: any, i: number) => (
              <div key={i} className="flex justify-between py-2 border-b border-white/5">
                <span>{ex.name}</span>
                <span className="text-gray-300">{ex.sets} × {ex.reps}</span>
              </div>
            ))}
          </div>

          <button onClick={() => { setStage("exercise"); setExerciseIndex(0); setSetIndex(0); }} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-lg font-semibold hover:opacity-90 transition shadow-lg">
            Start Workout
          </button>
        </div>
      </div>
    );
  }

  if (stage === "exercise") {
    return (
      <div className="relative min-h-screen text-white overflow-hidden">
        <StackedScrollBackground />
        <div className="relative z-10 max-w-2xl mx-auto p-6 pt-20">
          <button onClick={onBack} className="absolute top-6 left-6 px-3 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20">
            <ArrowLeft />
          </button>

          <h1 className="text-4xl font-bold mb-4">{currentExercise.name}</h1>
          <p className="text-gray-300 mb-6">Set {setIndex + 1} of {currentExercise.sets} • {currentExercise.reps}</p>

          {/* Timer */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold mb-3">{timer}s</div>

            <div className="flex justify-center gap-3">
              {!running ? (
                <button onClick={startTimer} className="px-6 py-3 bg-green-600 rounded-xl flex items-center gap-2 hover:bg-green-500">
                  <Play size={20} /> Start
                </button>
              ) : (
                <button onClick={pauseTimer} className="px-6 py-3 bg-yellow-500 rounded-xl flex items-center gap-2 hover:bg-yellow-400">
                  <Pause size={20} /> Pause
                </button>
              )}

              <button onClick={resetTimer} className="px-6 py-3 bg-gray-600 rounded-xl flex items-center gap-2 hover:bg-gray-500">
                <RotateCcw size={18} /> Reset
              </button>
            </div>
          </div>

          {/* Next */}
          <button onClick={nextSet} className="w-full py-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 mt-8">
            {setIndex + 1 < currentExercise.sets ? "Next Set" : "Finish Exercise"}
          </button>

          {/* Prev */}
          {exerciseIndex > 0 && (
            <button onClick={goToPrevExercise} className="mt-4 text-gray-400 underline">Previous Exercise</button>
          )}
        </div>
      </div>
    );
  }

  if (stage === "rest") {
    return (
      <div className="relative min-h-screen text-white overflow-hidden">
        <StackedScrollBackground />
        <div className="relative z-10 max-w-md mx-auto p-6 pt-24 text-center">
          <h1 className="text-4xl font-bold mb-4">Rest</h1>

          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="text-7xl font-bold mb-6"
          >
            {restTime}s
          </motion.div>

          <button onClick={skipRestNow} className="w-full py-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20">
            Skip Rest
          </button>
        </div>
      </div>
    );
  }

  if (stage === "finish") {
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;

    return (
      <div className="relative min-h-screen text-white overflow-hidden">
        <StackedScrollBackground />
        <div className="relative z-10 max-w-3xl mx-auto p-6 pt-20 text-center">
          <h1 className="text-5xl font-bold mb-4">Workout Complete </h1>

          <p className="text-gray-300 text-lg mb-6">
            Total time: {minutes}m {seconds}s
          </p>

          <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl mb-10">
            <h2 className="text-2xl font-bold mb-4">{workout.name}</h2>
            {workout.exercises.map((ex: any, i: number) => (
              <div key={i} className="flex justify-between py-2 border-b border-white/5">
                <span>{ex.name}</span>
                <span className="text-gray-300">{ex.sets} × {ex.reps}</span>
              </div>
            ))}
          </div>

          <button onClick={onBack} className="px-8 py-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 text-lg font-semibold">
            Back to App
          </button>
        </div>
      </div>
    );
  }

  return null;
}
