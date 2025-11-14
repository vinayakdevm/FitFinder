import React, { useEffect, useState } from "react";
import { Save, Plus, Trash2, Download, Upload, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { CinematicBackground } from "./CinematicBackground";

type SetEntry = { id: string; reps: number | ""; weight: number | "" };
type WorkoutEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  exercise: string;
  notes?: string;
  sets: SetEntry[];
};

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const STORAGE_KEY = "fitfinder_workouts_v2";

export function WorkoutLogger({ onBack }: { onBack: () => void }): JSX.Element {
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [exercise, setExercise] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [sets, setSets] = useState<SetEntry[]>([{ id: uid("s"), reps: 8, weight: 20 }]);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);

  // load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setWorkouts(JSON.parse(raw) as WorkoutEntry[]);
    } catch (e) {
      // ignore
    }
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    } catch {}
  }, [workouts]);

  function updateSet(id: string, patch: Partial<SetEntry>) {
    setSets((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function addSet() {
    setSets((s) => [...s, { id: uid("s"), reps: "", weight: "" }]);
  }

  function removeSet(id: string) {
    setSets((s) => s.filter((x) => x.id !== id));
  }

  function resetForm() {
    setExercise("");
    setNotes("");
    setSets([{ id: uid("s"), reps: 8, weight: 20 }]);
    setDate(new Date().toISOString().slice(0, 10));
  }

  function saveWorkout() {
    if (!exercise.trim()) {
      // small validation
      window.alert("Please enter an exercise name.");
      return;
    }

    // sanitize sets
    const sanitizedSets = sets
      .filter((s) => (s.reps !== "" && s.weight !== "") || (s.reps !== "" && s.weight === "") || (s.reps === "" && s.weight !== ""))
      .map((s) => ({
        id: s.id,
        reps: typeof s.reps === "string" ? Number(s.reps || 0) : s.reps,
        weight: typeof s.weight === "string" ? Number(s.weight || 0) : s.weight,
      }));

    const entry: WorkoutEntry = {
      id: uid("w"),
      date,
      exercise: exercise.trim(),
      notes: notes.trim(),
      sets: sanitizedSets,
    };

    setWorkouts((w) => [entry, ...w].slice(0, 1000));
    resetForm();
  }

  function deleteWorkout(id: string) {
    setWorkouts((w) => w.filter((x) => x.id !== id));
  }

  function exportWorkouts() {
    const payload = { exportedAt: new Date().toISOString(), workouts };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitfinder_workouts_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }


  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Cinematic background (same as MealPlanner) */}
      <CinematicBackground />

      <div className="relative z-10 max-w-4xl mx-auto p-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-lg bg-white/6 hover:bg-white/8 transition">
              <ArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Workout Logger</h1>
              <p className="text-sm text-gray-300">Track sets, reps & weight — saved locally</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={exportWorkouts} className="px-3 py-2 bg-blue-700 rounded-lg flex items-center gap-2 hover:bg-blue-600">
              <Download /> Export
            </button>
          </div>
        </div>

        {/* Input card */}
        <div className="glass-effect bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl mb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-300">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-2 p-2 rounded-lg bg-black/30 border border-white/10"
              />
            </div>

            <div>
              <label className="text-xs text-gray-300">Exercise</label>
              <input
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                placeholder="e.g. Bench Press"
                className="w-full mt-2 p-2 rounded-lg bg-black/30 border border-white/10"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-300">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
              className="w-full mt-2 p-2 rounded-lg bg-black/30 border border-white/10"
            />
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Sets</h3>
              <button onClick={addSet} className="px-3 py-2 bg-indigo-600 rounded-lg flex items-center gap-2 hover:bg-indigo-500">
                <Plus size={16} /> Add Set
              </button>
            </div>

            <div className="space-y-3">
              {sets.map((s) => (
                <div key={s.id} className="grid grid-cols-12 gap-2 items-center bg-white/4 p-3 rounded-lg">
                  <div className="col-span-5">
                    <label className="text-xs text-gray-300">Reps</label>
                    <input
                      type="number"
                      value={s.reps}
                      onChange={(e) => updateSet(s.id, { reps: e.target.value === "" ? "" : Number(e.target.value) })}
                      className="w-full mt-1 p-2 rounded-md bg-black/30 border border-white/10"
                    />
                  </div>
                  <div className="col-span-5">
                    <label className="text-xs text-gray-300">Weight (kg)</label>
                    <input
                      type="number"
                      value={s.weight}
                      onChange={(e) => updateSet(s.id, { weight: e.target.value === "" ? "" : Number(e.target.value) })}
                      className="w-full mt-1 p-2 rounded-md bg-black/30 border border-white/10"
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <button onClick={() => removeSet(s.id)} className="p-2 rounded-md bg-red-600 hover:bg-red-500">
                      <Trash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button onClick={saveWorkout} className="px-4 py-2 bg-indigo-600 rounded-lg flex items-center gap-2 hover:bg-indigo-500">
                <Save /> Save Workout
              </button>
              <button onClick={resetForm} className="px-4 py-2 bg-white/6 rounded-lg">Reset</button>
            </div>
          </div>
        </div>

        {/* Logged workouts */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Logged Workouts</h3>
            <div className="text-xs text-gray-400">Saved locally</div>
          </div>

          {workouts.length === 0 ? (
            <div className="text-gray-400">No workouts logged yet</div>
          ) : (
            <div className="space-y-3">
              {workouts.map((w) => (
                <motion.div key={w.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white/3 p-4 rounded-xl border border-white/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{w.exercise}</div>
                      <div className="text-xs text-gray-300">{new Date(w.date).toLocaleString()} • {w.sets.length} sets</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => deleteWorkout(w.id)} className="px-3 py-1 bg-red-600 rounded-md text-sm">Delete</button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {w.sets.map((s) => (
                      <div key={s.id} className="bg-black/20 p-2 rounded-md">
                        <div className="text-sm font-medium">{s.reps} × {s.weight} kg</div>
                      </div>
                    ))}
                  </div>

                  {w.notes ? <div className="text-xs text-gray-300 mt-2">Notes: {w.notes}</div> : null}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
