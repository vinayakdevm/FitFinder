import { Dumbbell, Target, TrendingUp, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Exercise } from "../types/exercise";

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect: (exercise: Exercise) => void;

  // NEW → added to support favorites
  isFavorited: boolean;
  onToggleFavorite: () => void;
}

export function ExerciseCard({
  exercise,
  onSelect,
  isFavorited,
  onToggleFavorite,
}: ExerciseCardProps) {
  const difficultyColors = {
    beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    advanced: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
    >

      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />

      {/* Card Container */}
      <div
        onClick={() => onSelect(exercise)}
        className="relative z-10 glass-effect rounded-2xl border border-white/10 hover:border-cyan-400/40 p-6 flex flex-col justify-between h-full shadow-lg shadow-blue-500/5 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white group-hover:text-gradient transition-all duration-300">
            {exercise.name}
          </h3>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${difficultyColors[exercise.difficulty]}`}
          >
            {exercise.difficulty}
          </span>
        </div>

        {/* Image */}
        <div className="w-full h-40 bg-gradient-to-br from-blue-900/30 to-cyan-900/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden group-hover:shadow-[0_0_25px_rgba(34,211,238,0.25)] transition-all duration-500">
          {exercise.image ? (
            <img
              src={exercise.image}
              alt={exercise.name}
              className="w-full h-full object-cover rounded-lg opacity-90 group-hover:opacity-100 transition-all duration-500"
            />
          ) : (
            <Dumbbell className="text-cyan-400/60" size={48} />
          )}
        </div>

        {/* Info */}
        <div className="space-y-3 text-sm">
          {/* Body Parts */}
          {/* TARGETS + FAVORITE STAR ROW */}
<div className="flex items-start justify-between">
  <div className="flex items-start gap-2">
    <Target size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
    <div>
      <span className="font-medium text-gray-400">Targets:</span>
      <div className="flex flex-wrap gap-1 mt-1">
        {exercise.bodyPart.slice(0, 3).map((part) => (
          <span
            key={part}
            className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-500/30"
          >
            {part}
          </span>
        ))}
        {exercise.bodyPart.length > 3 && (
          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-500/30">
            +{exercise.bodyPart.length - 3}
          </span>
        )}
      </div>
    </div>
  </div>

  {/* ⭐ FAVORITE BUTTON */}
  <button
    onClick={(e) => {
      e.stopPropagation();  // prevent opening modal
      onToggleFavorite();
    }}
    className="p-1 rounded-full hover:scale-110 transition-transform"
  >
    {isFavorited ? (
      <Star className="text-yellow-400 fill-yellow-400" size={20} />
    ) : (
      <Star className="text-gray-400 hover:text-yellow-400" size={20} />
    )}
  </button>
</div>


          {/* Equipment */}
          <div className="flex items-start gap-2">
            <Dumbbell size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-gray-400">Equipment:</span>
              <p className="text-gray-300 mt-0.5 leading-snug">
                {exercise.equipment.join(", ")}
              </p>
            </div>
          </div>

          {/* Goals */}
          <div className="flex items-start gap-2">
            <TrendingUp
              size={16}
              className="text-blue-400 mt-0.5 flex-shrink-0"
            />
            <div>
              <span className="font-medium text-gray-400">Goals:</span>
              <p className="text-gray-300 mt-0.5 leading-snug">
                {exercise.goals.slice(0, 3).join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-white/10">
          <p className="text-sm text-cyan-400 font-medium group-hover:text-blue-400 transition-colors flex items-center gap-2">
            View full details
            <span className="group-hover:translate-x-1 transition-transform duration-300">
              →
            </span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
