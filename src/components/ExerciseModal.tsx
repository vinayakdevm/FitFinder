import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Dumbbell, Star } from "lucide-react";
import { useEffect } from "react";
import { Exercise } from "../types/exercise";

interface ExerciseModalProps {
  exercise: Exercise;
  onClose: () => void;

  // ⭐ NEW props
  isFavorited: boolean;
  onToggleFavorite: () => void;
}

export function ExerciseModal({
  exercise,
  onClose,
  isFavorited,
  onToggleFavorite,
}: ExerciseModalProps) {
  // 🔒 Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative glass-effect border border-white/20 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(0,180,255,0.25)]"
        >
          {/* ===== HEADER IMAGE ===== */}
          <div className="relative flex-shrink-0">
            {exercise.image ? (
              <img
                src={exercise.image}
                alt={exercise.name}
                className="w-full h-56 sm:h-72 object-cover brightness-[0.7] rounded-t-3xl"
              />
            ) : (
              <div className="w-full h-56 sm:h-72 bg-gradient-to-br from-blue-900/30 to-cyan-900/20 rounded-t-3xl flex items-center justify-center">
                <Dumbbell className="text-cyan-400" size={48} />
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/60 to-black/90 rounded-t-3xl" />

            {/* Title + Close + ⭐ Favorite */}
            <div className="absolute bottom-4 left-6 right-6 flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-white mb-2">
                  {exercise.name}
                </h2>

                {/* Difficulty + Rating */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                      exercise.difficulty === "beginner"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : exercise.difficulty === "intermediate"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}
                  >
                    {exercise.difficulty}
                  </span>

                  {typeof exercise.rating === "number" ? (
  <div className="flex items-center gap-1 text-yellow-400 text-sm">
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i}>
        {i < Math.round(exercise.rating ?? 0) ? "★" : "☆"}
      </span>
    ))}

    <span className="ml-1 text-gray-300">
      {(exercise.rating ?? 0).toFixed(1)}
    </span>
  </div>
) : null}

                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* ⭐ Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                  className="p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors border border-white/10"
                >
                  <Star
                    size={22}
                    className={`transition ${
                      isFavorited
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-300"
                    }`}
                  />
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors border border-white/10"
                >
                  <X className="text-white" size={22} />
                </button>
              </div>
            </div>
          </div>

          {/* ===== SCROLLABLE BODY ===== */}
          <div className="overflow-y-auto p-6 space-y-8 flex-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {/* Info Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <InfoCard title="Body Parts" color="blue" items={exercise.bodyPart} />
              <InfoCard title="Equipment" color="cyan" items={exercise.equipment} />
              <InfoCard title="Goals" color="blue" items={exercise.goals} />
            </div>

            {/* Video */}
            {exercise.video && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(59,130,246,0.3)]"
              >
                <div className="aspect-video">
                  <iframe
                    src={exercise.video}
                    title={exercise.name}
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </motion.div>
            )}

            {/* Instructions */}
            {exercise.instructions?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="text-emerald-400" size={22} />
                  <h3 className="text-2xl font-bold text-white">
                    Step-by-Step Guide
                  </h3>
                </div>
                <ol className="space-y-3">
                  {exercise.instructions.map((instruction, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      viewport={{ once: true }}
                      className="flex gap-3"
                    >
                      <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                        {index + 1}
                      </span>
                      <span className="text-gray-300 pt-1 leading-relaxed">
                        {instruction}
                      </span>
                    </motion.li>
                  ))}
                </ol>
              </motion.div>
            )}

            {/* Pro Tip */}
            {exercise.tips && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-5 rounded-2xl border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.15)]"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={22} />
                  <div>
                    <h4 className="font-semibold text-amber-400 mb-1">Pro Tip</h4>
                    <p className="text-gray-300 leading-relaxed">{exercise.tips}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Trainer Insight */}
            {exercise.ratingDesc && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-5 rounded-2xl border border-blue-500/30 shadow-[0_0_25px_rgba(34,211,238,0.15)]"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-cyan-400 flex-shrink-0 mt-0.5" size={22} />
                  <div>
                    <h4 className="font-semibold text-cyan-400 mb-1">
                      Trainer Insight
                    </h4>
                    <p className="text-gray-300 leading-relaxed">
                      {exercise.ratingDesc}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ===== Info Card Component ===== */
function InfoCard({
  title,
  color,
  items,
}: {
  title: string;
  color: "blue" | "cyan";
  items: string[];
}) {
  const baseColor =
    color === "blue"
      ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
      : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";

  return (
    <motion.div whileHover={{ scale: 1.03 }} className={`p-4 rounded-xl border ${baseColor}`}>
      <h4 className="text-sm font-semibold mb-2">{title}</h4>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <span key={item} className={`text-xs px-2 py-1 rounded border ${baseColor}`}>
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
