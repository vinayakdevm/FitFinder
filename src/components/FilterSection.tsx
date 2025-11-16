import { motion } from "framer-motion";
import React from "react";
import { FilterOptions } from "../types/exercise";

interface FilterSectionProps {
  title: string;
  options: string[];
  selectedOptions: string[];
  onToggle: (option: string) => void;
  icon: React.ReactNode;
}

export function FilterSection({
  title,
  options,
  selectedOptions,
  onToggle,
  icon,
}: FilterSectionProps) {
  return (
    <div className="mb-8 last:mb-0">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
      <motion.div
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
          {icon}
        </motion.div>
        <h3 className="text-lg font-semibold text-white tracking-wide">
          {title}
        </h3>
        <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent ml-2" />
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option);
          const formatted = option.replace(/-/g, " ");

          return (
            <motion.button
              key={option}
              onClick={() => onToggle(option)}
              type="button"
              aria-pressed={isSelected}
              whileTap={{ scale: 0.9 }}
              whileHover={{
                scale: 1.07,
                boxShadow: isSelected
                  ? "0 0 18px rgba(34,211,238,0.5)"
                  : "0 0 10px rgba(59,130,246,0.3)",
              }}
              transition={{ type: "spring", stiffness: 250 }}
              className={`relative overflow-hidden px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all duration-300 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-cyan-400/40 ${
                isSelected
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-transparent shadow-lg shadow-blue-500/30"
                  : "bg-white/5 text-gray-400 border-white/10 hover:border-cyan-400/40 hover:text-white hover:bg-white/10"
              }`}
            >
              {/* Glowing background animation for selected filters */}
              {isSelected && (
                <motion.span
                  key={`${option}-glow`}
                  className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 blur-xl rounded-full"
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                />
              )}

              <span className="relative z-10 capitalize">{formatted}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
