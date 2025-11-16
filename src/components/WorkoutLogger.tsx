import React, { useEffect, useState } from "react";
import { Save, Plus, Trash2, Download, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { CinematicBackground } from "./CinematicBackground";

type SetEntry = { id: string; reps: number | ""; weight: number | "" };
type WorkoutEntry = {
  id: string;
  date: string;
  exercise: string;
  notes?: string;
  sets: SetEntry[];
};

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const STORAGE_KEY = "fitfinder_workouts_v2";

export function WorkoutLogger({ onBack }: { onBack: () => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [exercise, setExercise] = useState("");
  const [notes, setNotes] = useState("");
  const [sets, setSets] = useState<SetEntry[]>([
    { id: uid("set"), reps: 8, weight: 20 },
  ]);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);

  // LOAD WORKOUTS
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setWorkouts(JSON.parse(raw));
    } catch {}
  }, []);

  // SAVE WORKOUTS
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    } catch {}
  }, [workouts]);

  function updateSet(id: string, patch: Partial<SetEntry>) {
    setSets((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addSet() {
    setSets((prev) => [...prev, { id: uid("set"), reps: "", weight: "" }]);
  }

  function removeSet(id: string) {
    setSets((prev) => prev.filter((s) => s.id !== id));
  }

  function resetForm() {
    setExercise("");
    setNotes("");
    setDate(new Date().toISOString().slice(0, 10));
    setSets([{ id: uid("set"), reps: 8, weight: 20 }]);
  }

  function saveWorkout() {
    if (!exercise.trim()) {
      alert("Enter an exercise name");
      return;
    }

    const entry: WorkoutEntry = {
      id: uid("workout"),
      date,
      exercise: exercise.trim(),
      notes: notes.trim(),
      sets: sets.filter(
        (s) => s.reps !== "" || s.weight !== ""
      ),
    };

    setWorkouts((prev) => [entry, ...prev]);
    resetForm();
  }

  function deleteWorkout(id: string) {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }

  function exportWorkouts() {
    const blob = new Blob(
      [JSON.stringify({ workouts }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fitfinder_workouts_export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <CinematicBackground />

      <div className="relative z-10 max-w-4xl mx-auto p-6 pb-24">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl 
            hover:bg-white/20 backdrop-blur-xl transition flex items-center gap-2"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-3xl font-extrabold">Workout Logger</h1>
            <p className="text-gray-400 text-sm">
              Track reps, weights & progress (saved locally)
            </p>
          </div>

          <div className="ml-auto">
            <button
              onClick={exportWorkouts}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl 
              hover:bg-white/20 backdrop-blur-xl transition flex items-center gap-2"
            >
              <Download size={18} /> Export
            </button>
          </div>
        </div>

        {/* FORM CARD */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">

          {/* Date + Exercise */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-300">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-2 p-3 rounded-xl bg-black/20 border border-white/10 
                text-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-300">Exercise</label>
              <input
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                placeholder="e.g. Bench Press"
                className="w-full mt-2 p-3 rounded-xl bg-black/20 border border-white/10 
                text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-gray-300">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
              className="w-full mt-2 p-3 rounded-xl bg-black/20 border border-white/10 
              text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* SETS SECTION */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Sets</h3>
              <button
                onClick={addSet}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl 
                hover:bg-white/20 backdrop-blur-xl transition flex items-center gap-2"
              >
                <Plus size={16} /> Add Set
              </button>
            </div>

            <div className="space-y-3">
              {sets.map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-12 gap-3 items-center 
                  bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-xl"
                >
                  <div className="col-span-5">
                    <label className="text-xs text-gray-300">Reps</label>
                    <input
                      type="number"
                      value={s.reps}
                      onChange={(e) =>
                        updateSet(s.id, {
                          reps: e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="w-full mt-1 p-2 bg-black/20 border border-white/10 rounded-lg"
                    />
                  </div>

                  <div className="col-span-5">
                    <label className="text-xs text-gray-300">Weight (kg)</label>
                    <input
                      type="number"
                      value={s.weight}
                      onChange={(e) =>
                        updateSet(s.id, {
                          weight: e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="w-full mt-1 p-2 bg-black/20 border border-white/10 rounded-lg"
                    />
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => removeSet(s.id)}
                      className="px-3 py-2 bg-red-600/40 border border-red-400/40 
                      hover:bg-red-600/60 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={saveWorkout}
                className="flex-1 py-3 rounded-xl bg-white/10 border border-white/20 
                hover:bg-white/20 backdrop-blur-xl transition flex items-center justify-center gap-2 font-semibold"
              >
                <Save size={18} /> Save Workout
              </button>

              <button
                onClick={resetForm}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-xl transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* LOGGED WORKOUTS */}
        <div className="mt-10 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl shadow-xl">
          <h3 className="font-semibold text-xl mb-4">Logged Workouts</h3>

          {workouts.length === 0 ? (
            <div className="text-gray-400">No workouts logged yet.</div>
          ) : (
            <div className="space-y-4">
              {workouts.map((w) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-lg">{w.exercise}</div>
                      <div className="text-xs text-gray-300">
                        {new Date(w.date).toLocaleDateString()} • {w.sets.length} sets
                      </div>
                    </div>

                    <button
                      onClick={() => deleteWorkout(w.id)}
                      className="px-3 py-2 bg-red-600/40 border border-red-400/40 
                      hover:bg-red-600/60 rounded-lg transition text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {w.sets.map((s) => (
                      <div
                        key={s.id}
                        className="bg-black/20 p-2 rounded-lg border border-white/5"
                      >
                        <div className="text-sm font-medium">
                          {s.reps} × {s.weight} kg
                        </div>
                      </div>
                    ))}
                  </div>

                  {w.notes && (
                    <div className="text-xs text-gray-300 mt-2">
                      Notes: {w.notes}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
