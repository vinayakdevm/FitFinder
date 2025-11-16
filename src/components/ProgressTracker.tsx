import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Dumbbell, Timer, BarChart3 } from "lucide-react";
import { StackedScrollBackground } from "./StackedScrollBackground";

export function ProgressTracker({ onBack }: { onBack: () => void }) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // Load all progress logs
    const rawLogs = JSON.parse(
      localStorage.getItem("fitfinder_progress_logs") || "[]"
    );

    // Load saved workouts (for cleanup)
    const savedWorkouts = JSON.parse(
      localStorage.getItem("fitfinder_custom_workouts") || "[]"
    );

    // CLEAN LOGS: only keep logs for workouts that still exist
    const clean = rawLogs.filter((log: any) =>
      savedWorkouts.some((w: any) => w.name === log.workoutName)
    );

    // Save cleaned logs back to LS
    localStorage.setItem("fitfinder_progress_logs", JSON.stringify(clean));

    // Set final logs to state
    setLogs(clean);
  }, []);

  const totalWorkouts = logs.length;
  const totalSets = logs.reduce((a, l) => a + l.totalSets, 0);
  const totalTime = logs.reduce((a, l) => a + l.totalTime, 0);

  // Last 7 days activity
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    const key = day.toISOString().split("T")[0];

    const count = logs.filter((l) => l.date.startsWith(key)).length;

    return {
      day: day.toLocaleDateString("en-US", { weekday: "short" }),
      count,
    };
  });

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <StackedScrollBackground />

      <div className="relative z-10 max-w-6xl mx-auto p-6 pt-16">

        {/* Back Button */}
        <button
  onClick={onBack}
  className="absolute top-6 left-6 px-4 py-2 bg-white/10 border border-white/20 
  rounded-xl hover:bg-white/20 backdrop-blur-xl transition flex items-center gap-2 z-20"
>
  <ArrowLeft size={18} /> Back
</button>


        <h1 className="text-4xl font-extrabold mb-10">Your Progress</h1>

        {/* ---------------- STATS ROW ---------------- */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">

          {/* Workouts */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 
          border border-white/10 shadow-xl shadow-black/40">
            <Dumbbell className="mb-4 text-cyan-400" size={32} />
            <p className="text-5xl font-bold">{totalWorkouts}</p>
            <p className="text-gray-400 mt-1">Total Workouts</p>
          </div>

          {/* Sets */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 
          border border-white/10 shadow-xl shadow-black/40">
            <BarChart3 className="mb-4 text-blue-400" size={32} />
            <p className="text-5xl font-bold">{totalSets}</p>
            <p className="text-gray-400 mt-1">Total Sets</p>
          </div>

          {/* Time */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 
          border border-white/10 shadow-xl shadow-black/40">
            <Timer className="mb-4 text-purple-400" size={32} />
            <p className="text-5xl font-bold">
              {Math.floor(totalTime / 60)}m
            </p>
            <p className="text-gray-400 mt-1">Time Trained</p>
          </div>
        </div>

        {/* ---------------- 7 DAY CHART ---------------- */}
        <h2 className="text-2xl font-bold mb-3">Last 7 Days</h2>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 
        rounded-3xl p-6 shadow-xl shadow-black/40 mb-12">

          <div className="flex items-end h-40 gap-6">
            {last7.map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: d.count * 35 }}
                  transition={{ duration: 0.5 }}
                  className="w-7 rounded-xl bg-gradient-to-b 
                  from-cyan-400 to-blue-600 shadow-md"
                ></motion.div>
                <p className="text-gray-400 text-sm mt-2">{d.day}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- HISTORY ---------------- */}
        <h2 className="text-2xl font-bold mb-3">Workout History</h2>

        {logs.length === 0 && (
          <p className="text-gray-400">No workouts logged yet.</p>
        )}

        <div className="space-y-4 mt-6">
          {logs.map((l) => (
            <div
              key={l.id}
              className="backdrop-blur-xl bg-white/5 border border-white/10 
              p-5 rounded-2xl shadow-xl flex justify-between"
            >
              <div>
                <p className="text-lg font-semibold">{l.workoutName}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(l.date).toLocaleString()}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {l.totalSets} sets • {Math.floor(l.totalTime / 60)} min
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
