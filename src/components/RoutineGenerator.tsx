import React, { useMemo, useState } from "react";
import type { Exercise } from "../types/exercise";
import { exercises as rawExercises } from "../data/exercises";
import { CinematicBackground } from "../components/CinematicBackground";







function normalizeDifficulty(level: any): "beginner" | "intermediate" | "advanced" {
    const clean = String(level || "").trim().toLowerCase();
    if (clean === "beginner" || clean === "intermediate" || clean === "advanced") {
      return clean;
    }
    return "beginner";
  }

const exercises: Exercise[] = rawExercises.map((ex) => ({
  ...ex,
  difficulty: normalizeDifficulty(ex.difficulty),
}));



/**
 * RoutineGenerator
 * - Goal-based routine generator (fat-loss / muscle-gain / strength / endurance)
 * - Duration in weeks (4/8/12)
 * - Days per week (3-6)
 *
 * Output: structured routine (weeks -> days -> exercises with sets/reps/rest)
 */

/* ---------- Types ---------- */
type Goal = "muscle-gain" | "strength" | "endurance" | "fat-loss";

type RoutineExercise = {
  id: string;
  name: string;
  bodyPart: string[];
  equipment: string[];
  sets: number;
  reps: string; // could be "8-12" or "3-5"
  restSeconds: number;
};

type DayPlan = {
  name: string; // e.g. "Push" or "Full Body"
  exercises: RoutineExercise[];
};

type WeekPlan = DayPlan[]; // days per week
type Routine = {
  goal: Goal;
  weeks: WeekPlan[];
  daysPerWeek: number;
  durationWeeks: number;
  createdAt: string;
};

/* ---------- Helpers ---------- */
const shuffle = <T,>(arr: T[]) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pickUnique = <T,>(pool: T[], n: number) => shuffle(pool).slice(0, n);

/* Map goal -> sets/reps/rest presets */
function getPresetForGoal(goal: Goal) {
  switch (goal) {
    case "muscle-gain":
      return { sets: [3, 4], reps: "8-12", rest: 60 }; // seconds
    case "strength":
      return { sets: [3, 5], reps: "3-6", rest: 150 };
    case "endurance":
      return { sets: [2, 3], reps: "15-25", rest: 45 };
    case "fat-loss":
      return { sets: [3], reps: "10-15", rest: 30 };
    default:
      return { sets: [3], reps: "8-12", rest: 60 };
  }
}

/* Splits for days per week */
function getSplitForDays(days: number) {
  // return array of day names length = days
  if (days === 3) return ["Full Body", "Full Body", "Full Body"];
  if (days === 4) return ["Upper", "Lower", "Upper", "Lower"];
  if (days === 5) return ["Push", "Pull", "Legs", "Push", "Pull"];
  if (days === 6) return ["Push", "Pull", "Legs", "Push", "Pull", "Legs"];
  // fallback
  return Array.from({ length: days }).map((_, i) => `Day ${i + 1}`);
}

/* Map day name to primary body parts */
const dayTargets: Record<string, string[]> = {
  "Full Body": ["fullbody", "chest", "back", "legs", "shoulders", "arms", "abs"],
  Upper: ["chest", "back", "shoulders", "arms"],
  Lower: ["legs", "glutes", "calves", "hamstrings", "quads"],
  Push: ["chest", "shoulders", "triceps"],
  Pull: ["back", "biceps", "rear delts", "lats", "upper back"],
  Legs: ["quads", "hamstrings", "glutes", "calves"],
};

/* Find exercises matching bodyPart (loose match) */
function findExercisesForTargets(
  targets: string[],
  options: { equipment?: string[] } = {}
) {
  const userEq = options.equipment?.map((e) => e.toLowerCase()) ?? [];

  // helper: partial match
  const matchesEq = (exerciseEq: string[]) => {
    if (userEq.length === 0) return true; // no input = allow all (default)
    return exerciseEq.some((exEq) =>
      userEq.some((u) => exEq.includes(u) || u.includes(exEq))
    );
  };

  const pool = exercises.filter((ex) => {
    const exParts = ex.bodyPart.map((p) => p.toLowerCase());
    const matchesBody = targets.some((t) => exParts.includes(t.toLowerCase()));

    if (!matchesBody) return false;

    // equipment logic
    if (matchesEq(ex.equipment)) return true;

    // allow bodyweight ONLY IF user typed nothing
    if (userEq.length === 0 && ex.equipment.includes("bodyweight")) return true;

    return false;
  });

  // fallback: if no matches, expand to any body-part match ignoring equipment
  if (pool.length === 0) {
    return exercises.filter((ex) => {
      const exParts = ex.bodyPart.map((p) => p.toLowerCase());
      return targets.some((t) => exParts.includes(t.toLowerCase()));
    });
  }

  return pool;
}


/* Build a day's exercise list */
function buildDayExercises(dayName: string, goal: Goal, equipment: string[] = [], countOverride?: number) {
  const targets = dayTargets[dayName] || [dayName.toLowerCase()];
  const preset = getPresetForGoal(goal);

  // decide how many exercises for the day by goal
  let targetCount = countOverride ?? (goal === "muscle-gain" ? 5 : goal === "fat-loss" ? 6 : goal === "strength" ? 4 : 5);
  // full body days slightly larger
  if (dayName === "Full Body" && targetCount < 5) targetCount = 5;

  const pool = findExercisesForTargets(targets, { equipment });

  const chosen = pickUnique(pool, Math.min(targetCount, pool.length));

  return chosen.map((ex) => {
    // choose sets randomly between presets range
    const sets = preset.sets.length === 1 ? preset.sets[0] : preset.sets[Math.floor(Math.random() * preset.sets.length)];
    return {
      id: ex.id,
      name: ex.name,
      bodyPart: ex.bodyPart,
      equipment: ex.equipment,
      sets,
      reps: preset.reps,
      restSeconds: preset.rest,
    } as RoutineExercise;
  });
}

/* ---------- Component ---------- */
export function RoutineGenerator({ onBack }: { onBack: () => void }) {
  const [goal, setGoal] = useState<Goal>("muscle-gain");
  const [durationWeeks, setDurationWeeks] = useState<number>(4);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [equipmentInput, setEquipmentInput] = useState<string>(""); // comma-separated optional
  const [routine, setRoutine] = useState<Routine | null>(null);

  const equipment = useMemo(
    () => equipmentInput.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
    [equipmentInput]
  );

  function generate() {
    const split = getSplitForDays(daysPerWeek);
    const weeks: WeekPlan[] = [];

    for (let w = 0; w < durationWeeks; w++) {
        const week: WeekPlan = split.map((day) => ({
            name: day,
            exercises: buildDayExercises(day, goal, equipment),
          }));
          
      weeks.push(week);
    }

    const r: Routine = {
      goal,
      weeks,
      daysPerWeek,
      durationWeeks,
      createdAt: new Date().toISOString(),
    };

    setRoutine(r);
    // Also save in localStorage quick-save
    try {
      localStorage.setItem("fitfinder_last_routine", JSON.stringify(r));
    } catch (e) {
      // ignore
    }
  }

  function exportJSON() {
    if (!routine) return;
    const blob = new Blob([JSON.stringify(routine, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitfinder_routine_${routine.goal}_${routine.durationWeeks}w.json`;
    a.click();
    URL.revokeObjectURL(url);
  }


  return (
    <div className="relative min-h-screen text-white overflow-hidden">
  
  <CinematicBackground />

  
      <div className="relative z-10 p-6 max-w-6xl mx-auto">
  
  
      {/* Actual Page Content */}
      <div className="relative z-10 p-6 max-w-6xl mx-auto">
  
  
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 transition"
        >
          ← Back
        </button>
  
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
            Personalized Workout Routine
          </h1>
          <p className="text-gray-400 mt-2 text-sm tracking-wide">
            Tailored to your equipment, weekly frequency, and fitness goals.
          </p>
        </div>
  
        {/* Input Card */}
        <div className="glass-effect bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl mb-10">
  
          {/* Inputs Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
  
            <div>
              <label className="text-gray-300 text-sm mb-1 block">Training Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as Goal)}
                className="w-full bg-white/10 border border-white/10 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="muscle-gain">Muscle Gain</option>
                <option value="strength">Strength</option>
                <option value="endurance">Endurance</option>
                <option value="fat-loss">Fat Loss</option>
              </select>
            </div>
  
            <div>
              <label className="text-gray-300 text-sm mb-1 block">Duration (weeks)</label>
              <select
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/10 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={4}>4 Weeks</option>
                <option value={8}>8 Weeks</option>
                <option value={12}>12 Weeks</option>
              </select>
            </div>
  
            <div>
              <label className="text-gray-300 text-sm mb-1 block">Weekly Frequency</label>
              <select
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/10 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={3}>3 Days</option>
                <option value={4}>4 Days</option>
                <option value={5}>5 Days</option>
                <option value={6}>6 Days</option>
              </select>
            </div>
  
            <div>
              <label className="text-gray-300 text-sm mb-1 block">Equipment Available</label>
              <input
                value={equipmentInput}
                onChange={(e) => setEquipmentInput(e.target.value)}
                className="w-full bg-white/10 border border-white/10 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. dumbbells, barbell, cables"
              />
            </div>
          </div>
  
          {/* Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={generate}
              className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500
              hover:opacity-90 transition font-semibold shadow-lg hover:shadow-cyan-500/30"
            >
              Generate Routine
            </button>
  
            <button
              onClick={exportJSON}
              disabled={!routine}
              className="px-4 py-3 bg-green-600 rounded-lg hover:bg-green-500 disabled:opacity-40 transition shadow-md"
            >
              Export
            </button>
  
            <button
              onClick={() => {
                localStorage.removeItem('fitfinder_last_routine');
                setRoutine(null);
              }}
              className="px-4 py-3 bg-red-600 rounded-lg hover:bg-red-500 transition shadow-md"
            >
              Clear
            </button>
          </div>
  
        </div>
  
        {/* No Routine */}
        {!routine && (
          <p className="text-center text-gray-500">Generate your routine to get started.</p>
        )}
  
        {/* Routine Results */}
        {routine && (
          <div className="space-y-10">
  
            {/* Summary */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl">
              <div className="text-lg font-bold mb-1">
                Summary — {routine.goal.replace("-", " ")}
              </div>
              <p className="text-gray-400 text-sm">
                {routine.durationWeeks} Weeks • {routine.daysPerWeek} Days/week
              </p>
            </div>


  
            {/* Week 1 */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Week 1 Overview</h3>
  
              <div className="grid md:grid-cols-2 gap-6">
                {routine.weeks[0].map((day) => (
                  <div
                    key={day.name}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg hover:border-cyan-400/40 transition"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-lg">{day.name}</h4>
                      <span className="text-gray-400 text-sm">
                        {day.exercises.length} exercises
                      </span>
                    </div>
  
                    <ol className="space-y-4">
                      {day.exercises.map((ex, idx) => (
                        <li key={ex.id} className="flex gap-3">
                          <div className="text-gray-500 w-6">{idx + 1}.</div>
                          <div>
                            <div className="font-semibold">{ex.name}</div>
                            <div className="text-xs text-gray-400">
                              {ex.sets} × {ex.reps} • {ex.restSeconds}s rest
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
  
          </div>
        )}
  
      </div>
      </div> 
    </div> 
  );
}

