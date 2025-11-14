import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Target,
  TrendingUp,
  Filter,
  X,
  Search,
  ChevronLeft,
  Sparkles,
  Loader2,
  Star,
} from "lucide-react";

import { Utensils } from "lucide-react";

import { Exercise, FilterOptions } from "../types/exercise";
import { exercises as rawExercises } from "../data/exercises";
import { FilterSection } from "./FilterSection";
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseModal } from "./ExerciseModal";
import { StackedScrollBackground } from "../components/StackedScrollBackground";

function AppFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 py-8 backdrop-blur-sm mt-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
    
    {/* Left */}
    <div className="flex items-center gap-3">
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
        <Dumbbell className="text-white" size={20} />
      </div>
      <span className="text-gray-400 text-sm">
        FitFinder — Smart Exercise Discovery
      </span>
    </div>

    {/* Right — Credits */}
    <p className="text-gray-500 text-sm text-center md:text-right">
      Crafted with ❤️ by <span className="text-white font-semibold">Vinayak Dev Mishra</span>
    </p>

  </div>
</footer>
  );
}




/* Utility: Safely normalize difficulty */
function normalizeDifficulty(level: any): "beginner" | "intermediate" | "advanced" {
  const clean = String(level || "").toLowerCase();
  if (clean === "beginner" || clean === "intermediate" || clean === "advanced") {
    return clean;
  }
  return "beginner";
}

/* Clean dataset */
const exercises: Exercise[] = rawExercises.map((ex) => ({
  ...ex,
  difficulty: normalizeDifficulty(ex.difficulty),
}));

// Unique filter lists
const bodyParts = [...new Set(exercises.flatMap((e) => e.bodyPart))];
const equipmentOptions = [...new Set(exercises.flatMap((e) => e.equipment))];
const goalOptions = [...new Set(exercises.flatMap((e) => e.goals))];

export function ExerciseFinder({
  onReturnHome,
  onOpenRoutine,
  onOpenMeal,
  onOpenWorkout
}: {
  onReturnHome: () => void;
  onOpenRoutine: () => void;
  onOpenMeal: () => void;
  onOpenWorkout: () => void;
})
 {

  const FAVORITES_KEY = "fitfinder_favorites_v1";

  const [suggestionList, setSuggestionList] = useState<string[]>([]);
  const placeholderPhrases = [
    "Search for dumbbells…",
    "Search for triceps…",
    "Search for cable exercises…",
    "Search for back workouts…",
    "Search for chest…",
    "Search for abs…",
    "Search for biceps…",
    "Search for legs…",
    "Search for shoulders…",
  ];
  
  const [placeholder, setPlaceholder] = useState("");
  const [pIndex, setPIndex] = useState(0);     // which phrase
  const [charIndex, setCharIndex] = useState(0); // typing position
  const [typing, setTyping] = useState(true);    // typing / deleting
  
  


  const [filters, setFilters] = useState<FilterOptions>({
    bodyParts: [],
    equipment: [],
    goals: [],
  });

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(200);
  const [loadingMore, setLoadingMore] = useState(false);

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    const current = placeholderPhrases[pIndex];
  
    let timeout;
  
    if (typing) {
      // typing forward
      if (charIndex < current.length) {
        timeout = setTimeout(() => {
          setPlaceholder(current.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 60); // typing speed
      } else {
        // wait before deleting
        timeout = setTimeout(() => setTyping(false), 1200);
      }
    } else {
      // deleting backwards
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setPlaceholder(current.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 40); // deleting speed
      } else {
        // next phrase
        timeout = setTimeout(() => {
          setTyping(true);
          setPIndex((prev) => (prev + 1) % placeholderPhrases.length);
        }, 400);
      }
    }
  
    return () => clearTimeout(timeout);
  }, [charIndex, typing, pIndex]);
  

  /* Load favorites */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  /* Save favorites */
  const saveFavorites = (setFav: Set<string>) => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...setFav]));
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveFavorites(next);
      return next;
    });
  };

  /* FULL ADVANCED SEARCH (Fixes limited results) */
const filteredExercises = useMemo(() => {
  let result = exercises;

  const q = searchQuery.toLowerCase().trim();

  // 🔍 1. SEARCH ACROSS MULTIPLE FIELDS
  if (q) {
    result = result.filter((ex) => {
      const nameMatch = ex.name.toLowerCase().includes(q);
      const bodyMatch = ex.bodyPart.some((bp) =>
        bp.toLowerCase().includes(q)
      );
      const eqMatch = ex.equipment.some((eq) =>
        eq.toLowerCase().includes(q)
      );
      const goalMatch = ex.goals.some((g) =>
        g.toLowerCase().includes(q)
      );
      const difficultyMatch = ex.difficulty.toLowerCase().includes(q);

      return nameMatch || bodyMatch || eqMatch || goalMatch || difficultyMatch;
    });
  }

  // 🎯 2. FILTERS
  return result.filter((exercise) => {
    const matchBP =
      filters.bodyParts.length === 0 ||
      filters.bodyParts.some((bp) =>
        exercise.bodyPart.includes(bp)
      );

    const matchEQ =
      filters.equipment.length === 0 ||
      filters.equipment.some((eq) =>
        exercise.equipment.includes(eq)
      );

    const matchGoal =
      filters.goals.length === 0 ||
      filters.goals.some((g) => exercise.goals.includes(g));

    return matchBP && matchEQ && matchGoal;
  });
}, [filters, searchQuery]);


  /* Favorites filter */
  const favoriteFilteredExercises = useMemo(() => {
    return showOnlyFavorites
      ? filteredExercises.filter((ex) => favorites.has(ex.id))
      : filteredExercises;
  }, [filteredExercises, showOnlyFavorites, favorites]);

  /* Pagination */
  const displayedExercises = favoriteFilteredExercises.slice(0, visibleCount);

  /* Filter toggle */
  const toggleFilter = (category: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value],
    }));
  };

  const clearAllFilters = () => {
    setFilters({ bodyParts: [], equipment: [], goals: [] });
    setSearchQuery("");
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 200);
      setLoadingMore(false);
    }, 700);
  };

  /* Scroll to top on filter/search */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filters, searchQuery]);

  const activeFilterCount =
    filters.bodyParts.length + filters.equipment.length + filters.goals.length;

    /* 🔍 AUTO-SUGGESTIONS (smart matching across fields) */
    useEffect(() => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) {
        setSuggestionList([]);
        return;
      }
    
      const suggestions = new Set<string>();
    
      exercises.forEach((ex) => {
        if (ex.name.toLowerCase().includes(q)) suggestions.add(ex.name);
    
        ex.bodyPart.forEach((bp) => {
          if (bp.toLowerCase().includes(q)) suggestions.add(bp);
        });
    
        ex.equipment.forEach((eq) => {
          if (eq.toLowerCase().includes(q)) suggestions.add(eq);
        });
    
        ex.goals.forEach((g) => {
          if (g.toLowerCase().includes(q)) suggestions.add(g);
        });
      });
    
      setSuggestionList(Array.from(suggestions).slice(0, 8));
    }, [searchQuery]);
    
/* 🔥 Auto-apply filter based on suggestion type + collapse instantly */
function applySuggestion(s: string) {
  const lower = s.toLowerCase();

  // Auto-apply body part
  if (bodyParts.some(bp => bp.toLowerCase() === lower)) {
    setFilters(prev => ({
      ...prev,
      bodyParts: [...new Set([...prev.bodyParts, s])]
    }));
  }

  // Auto-apply equipment
  if (equipmentOptions.some(eq => eq.toLowerCase() === lower)) {
    setFilters(prev => ({
      ...prev,
      equipment: [...new Set([...prev.equipment, s])]
    }));
  }

  // Auto-apply goal
  if (goalOptions.some(g => g.toLowerCase() === lower)) {
    setFilters(prev => ({
      ...prev,
      goals: [...new Set([...prev.goals, s])]
    }));
  }

  // Update search bar
  setSearchQuery(s);

  // ❗ FULL FIX — collapse dropdown immediately
  setSuggestionList([]);   // <— THIS was missing

  // Smooth UX: scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

    return (
      <div className="relative min-h-screen text-white overflow-hidden">
    
        {/* Background */}
        <StackedScrollBackground />
    
        {/* Foreground UI */}
        <div className="relative z-10">
    

      {/* HEADER */}
      <header className="sticky top-0 z-40 glass-effect border-b border-white/10 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={onReturnHome}
              className="p-2 hover:bg-white/5 rounded-lg transition-all"
            >

              <ChevronLeft className="text-gray-400 hover:text-white" size={24} />
            </button>
          


            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl shadow-lg">
              <Dumbbell className="text-white" size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gradient">FitFinder</h1>
              <p className="text-sm text-gray-400">Smart Exercise Discovery</p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* Search + Filters */}
        <div className="glass-effect rounded-xl p-6 mb-6 border border-white/10">
          <div className="relative mb-4">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={20}
            />
            <div className="relative mb-4">
  <Search
    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
    size={20}
  />
  <input
  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder={placeholder}
/>


  {/* 🔽 Suggestions dropdown */}
{suggestionList.length > 0 && (
  <div className="absolute left-0 right-0 top-full mt-1 bg-black/80 backdrop-blur-xl 
                  border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">

    {suggestionList.map((s, i) => (
      <div
        key={i}
        onClick={() => applySuggestion(s)}
        className="px-4 py-2 cursor-pointer hover:bg-white/10 text-gray-300"
      >
        {s}
      </div>
    ))}

  </div>
)}

</div>

          </div>

          <div className="flex items-center gap-4">

  {/* Filters button */}
  <button
    onClick={() => setShowFilters((prev) => !prev)}
    className="px-4 py-2 bg-blue-600 rounded-lg text-white flex items-center gap-2"
  >
    <Filter size={18} /> Filters
  </button>

  {/* Favorites button */}
  <button
    onClick={() => setShowOnlyFavorites((prev) => !prev)}
    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
      showOnlyFavorites
        ? "bg-yellow-500/20 text-yellow-300"
        : "bg-white/10 text-gray-300"
    }`}
  >
    <Star size={18} />
    Favorites
  </button>

  {/* Routine Generator */}
  <button
    onClick={onOpenRoutine}
    className="px-4 py-2 rounded-lg flex items-center gap-2 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 transition"
  >
    <Sparkles size={18} />
    Routine
  </button>
{/* Meal Planner */}
<button
  onClick={onOpenMeal}
  className="px-4 py-2 rounded-lg flex items-center gap-2 bg-green-600/20 text-green-300 hover:bg-green-600/30 transition"
>
  <Utensils size={18} />
  Meal Plan
</button>

<button
  onClick={onOpenWorkout}
  className="px-4 py-2 rounded-xl 
             bg-gradient-to-r from-purple-600/20 to-fuchsia-500/20 
             backdrop-blur-xl border border-white/10 
             text-white font-semibold transition 
             flex items-center gap-2 hover:bg-white/10"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.8}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 4.5v15m10.5-15v15M3 8.25h3.75m14.25 0H17.25m-14.25 7.5h3.75m14.25 0H17.25M12 4.5v15"
    />
  </svg>
  Workout Logger
</button>

  {/* Clear filters */}
  {activeFilterCount > 0 && (
    <button
      onClick={clearAllFilters}
      className="text-red-400 underline ml-auto"
    >
      Clear All
    </button>
  )}

</div>


          {showFilters && (
            <div className="mt-6 grid sm:grid-cols-3 gap-6">
              <FilterSection
                title="Body Parts"
                options={bodyParts}
                selectedOptions={filters.bodyParts}
                onToggle={(o) => toggleFilter("bodyParts", o)}
                icon={<Target size={18} className="text-blue-400" />}
              />

              <FilterSection
                title="Equipment"
                options={equipmentOptions}
                selectedOptions={filters.equipment}
                onToggle={(o) => toggleFilter("equipment", o)}
                icon={<Dumbbell size={18} className="text-cyan-400" />}
              />

              <FilterSection
                title="Goals"
                options={goalOptions}
                selectedOptions={filters.goals}
                onToggle={(o) => toggleFilter("goals", o)}
                icon={<TrendingUp size={18} className="text-blue-400" />}
              />
            </div>
          )}
        </div>


        {/* EXERCISE CARDS */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayedExercises.map((exercise, i) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <ExerciseCard
  exercise={exercise}
  onSelect={setSelectedExercise}
  isFavorited={favorites.has(exercise.id)}
  onToggleFavorite={() => toggleFavorite(exercise.id)}
/>

            </motion.div>
          ))}
        </div>

        {/* LOAD MORE */}
        {displayedExercises.length < favoriteFilteredExercises.length && (
          <div className="text-center mt-10">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </main>

      {selectedExercise && (
        <ExerciseModal
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
        isFavorited={favorites.has(selectedExercise.id)}
        onToggleFavorite={() => toggleFavorite(selectedExercise.id)}
      />
      
      
      )}
              <AppFooter />
       </div> 
    </div>  
  );
}
