import React, { useEffect, useMemo, useState } from "react";
import { CinematicBackground } from "./CinematicBackground";
import { ArrowLeft, Utensils, Download, Save, RefreshCw } from "lucide-react";

/**
 * MealPlanner.tsx
 * Polished vertical layout, TypeScript-clean, bug fixes, blue/indigo accent
 * Stores plans in localStorage under `fitfinder_mealplans_v2`.
 */

type Gender = "male" | "female";
type Goal = "lose" | "maintain" | "gain";
type Diet = "veg" | "nonveg" | "both";
type Cuisine = "indian" | "western" | "any";

type FoodItem = {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  portionLabel: string;
  tags?: string[];
};

const FOODS: FoodItem[] = [
  { id: "oats", name: "Rolled Oats (60g)", kcal: 230, protein: 8, fat: 4, carbs: 39, portionLabel: "60 g", tags: ["veg","western","breakfast"] },
  { id: "eggs2", name: "Eggs (2)", kcal: 156, protein: 13, fat: 11, carbs: 1, portionLabel: "2 pcs", tags: ["nonveg","western","breakfast"] },
  { id: "poha", name: "Poha (250g)", kcal: 280, protein: 6, fat: 8, carbs: 45, portionLabel: "250 g", tags: ["veg","indian","breakfast"] },
  { id: "dosa", name: "Dosa + Sambar", kcal: 300, protein: 7, fat: 7, carbs: 50, portionLabel: "2 dosa", tags: ["veg","indian","breakfast"] },
  { id: "banana", name: "Banana (1)", kcal: 105, protein: 1.3, fat: 0.4, carbs: 27, portionLabel: "1 pc", tags: ["veg","western","snack"] },

  { id: "chicken150", name: "Grilled Chicken (150g)", kcal: 275, protein: 45, fat: 6, carbs: 0, portionLabel: "150 g", tags: ["nonveg","western","lunch","dinner"] },
  { id: "salmon120", name: "Salmon (120g)", kcal: 240, protein: 24, fat: 15, carbs: 0, portionLabel: "120 g", tags: ["nonveg","western","lunch","dinner"] },
  { id: "paneer100", name: "Paneer (100g)", kcal: 265, protein: 18, fat: 20, carbs: 3, portionLabel: "100 g", tags: ["veg","indian","lunch","dinner"] },
  { id: "dal", name: "Dal (200g)", kcal: 180, protein: 9, fat: 4, carbs: 26, portionLabel: "200 g", tags: ["veg","indian","lunch","dinner"] },

  { id: "rice200", name: "Cooked Rice (200g)", kcal: 260, protein: 5, fat: 1, carbs: 57, portionLabel: "200 g", tags: ["veg","western","indian","lunch","dinner"] },
  { id: "roti2", name: "Roti (2)", kcal: 200, protein: 6, fat: 4, carbs: 34, portionLabel: "2 rotis", tags: ["veg","indian","lunch","dinner"] },
  { id: "salad", name: "Mixed Salad (100g)", kcal: 30, protein: 1.5, fat: 0.5, carbs: 5, portionLabel: "100 g", tags: ["veg","western","indian","lunch","dinner"] },

  { id: "almonds30", name: "Almonds (30g)", kcal: 174, protein: 6, fat: 15, carbs: 6, portionLabel: "30 g", tags: ["veg","western","snack"] },
  { id: "greek150", name: "Greek Yogurt (150g)", kcal: 140, protein: 12, fat: 5, carbs: 10, portionLabel: "150 g", tags: ["veg","western","snack"] },
  { id: "samosa", name: "Samosa (1)", kcal: 250, protein: 6, fat: 12, carbs: 30, portionLabel: "1 pc", tags: ["veg","indian","snack"] },

  { id: "chickpea", name: "Chickpea Salad (200g)", kcal: 220, protein: 12, fat: 6, carbs: 26, portionLabel: "200 g", tags: ["veg","indian","lunch","snack"] },
];

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export default function MealPlanner({ onBack }: { onBack: () => void }) {
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<Gender>("male");
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(175);
  const [activity, setActivity] = useState<"sedentary" | "light" | "moderate" | "active" | "very_active">("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [diet, setDiet] = useState<Diet>("both");
  const [cuisine, setCuisine] = useState<Cuisine>("any");

  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, { mealName: string; items: { food: FoodItem; portions: number }[]; kcal: number }[]>>({});
  const [planName, setPlanName] = useState<string>("My Weekly Plan");
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState<number>(() => Date.now());

  const BMR = useMemo(() => {
    if (gender === "male") return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }, [gender, weight, height, age]);

  const activityFactor = useMemo(() => {
    switch (activity) {
      case "sedentary": return 1.2;
      case "light": return 1.375;
      case "moderate": return 1.55;
      case "active": return 1.725;
      case "very_active": return 1.9;
      default: return 1.55;
    }
  }, [activity]);

  const TDEE = Math.round(BMR * activityFactor);

  const calorieTarget = useMemo(() => {
    if (goal === "lose") return Math.round(TDEE * 0.82);
    if (goal === "gain") return Math.round(TDEE * 1.12);
    return TDEE;
  }, [TDEE, goal]);

  const mealDistribution = useMemo(() => {
    if (goal === "gain") return { breakfast: 0.25, lunch: 0.34, dinner: 0.30, snacks: 0.11 };
    if (goal === "lose") return { breakfast: 0.20, lunch: 0.38, dinner: 0.32, snacks: 0.10 };
    return { breakfast: 0.24, lunch: 0.36, dinner: 0.30, snacks: 0.10 };
  }, [goal]);

  const foodPool = useMemo(() => {
    return FOODS.filter((f) => {
      if (diet === "veg" && f.tags?.includes("nonveg")) return false;
      // nonveg users can eat veg items, so no exclusion for nonveg
      if (cuisine !== "any" && f.tags && !f.tags.includes(cuisine)) return false;
      return true;
    });
  }, [diet, cuisine]);

  // simple deterministic PRNG generator using seed and index
  function prng(seedVal: number, idx: number) {
    const x = Math.sin(seedVal + idx) * 10000;
    return x - Math.floor(x);
  }

  function buildWeekly(seedArg = seed) {
    setLoading(true);

    const pools = {
      breakfast: foodPool.filter((f) => f.tags?.includes("breakfast") || f.tags?.includes("snack")),
      lunch: foodPool.filter((f) => f.tags?.includes("lunch") || f.tags?.includes("dinner")),
      dinner: foodPool.filter((f) => f.tags?.includes("dinner") || f.tags?.includes("lunch")),
      snacks: foodPool.filter((f) => f.tags?.includes("snack") || f.tags?.includes("breakfast")),
    };

    // fallback to whole pool when specific pool empty
    Object.keys(pools).forEach((k) => {
      const key = k as keyof typeof pools;
      if (pools[key].length === 0) pools[key] = [...foodPool];
    });

    const used = new Set<string>();
    const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const result: Record<string, { mealName: string; items: { food: FoodItem; portions: number }[]; kcal: number }[]> = {};

    days.forEach((day, di) => {
      result[day] = [];

      ( ["breakfast","lunch","dinner","snacks"] as const ).forEach((mealType) => {
        const targetKcal = Math.round(calorieTarget * (mealDistribution as any)[mealType]);
        const pool = pools[mealType].slice().filter((f) => !used.has(f.id));
        const available = pool.length > 0 ? pool : pools[mealType].slice();

        const scored = available
          .map((f) => ({ f, score: f.protein * 3 + f.kcal * 0.01 + prng(seedArg, di + f.id.length) * 0.5 }))
          .sort((a, b) => b.score - a.score)
          .map((x) => x.f);

        const chosen: { food: FoodItem; portions: number }[] = [];
        let total = 0;

        const mainCandidates = scored.filter((s) => s.protein >= 8);
        const main = mainCandidates[0] || scored[0];
        if (main) {
          chosen.push({ food: main, portions: 1 });
          total += main.kcal;
          used.add(main.id);
        }

        let idx = 0;
        while (total < targetKcal * 0.95 && idx < scored.length) {
          const c = scored[idx];
          if (!chosen.find((x) => x.food.id === c.id)) {
            chosen.push({ food: c, portions: 1 });
            total += c.kcal;
            used.add(c.id);
          }
          idx++;
          if (idx > scored.length * 2) break;
        }

        if (total > targetKcal * 1.2 && chosen.length) {
          const largest = chosen.reduce((a, b) => (a.food.kcal * a.portions > b.food.kcal * b.portions ? a : b));
          if (largest.portions > 1) {
            largest.portions = Math.max(1, largest.portions - 1);
            total = chosen.reduce((s, c) => s + c.food.kcal * c.portions, 0);
          }
        }

        if (total < targetKcal * 0.9 && chosen.length) {
          for (let k = 0; k < chosen.length && total < targetKcal * 0.95; k++) {
            chosen[k].portions += 1;
            total += chosen[k].food.kcal;
          }
        }

        result[day].push({ mealName: mealType, items: chosen, kcal: Math.round(total) });
      });
    });

    setWeeklyPlan(result);
    setLoading(false);
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fitfinder_mealplans_v2");
      if (raw) setSavedPlans(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
    // initial build
    buildWeekly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveCurrentPlan() {
    if (!weeklyPlan || Object.keys(weeklyPlan).length === 0) return;
    const entry = {
      id: Date.now().toString(),
      name: planName || `Plan ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      inputs: { age, gender, weight, height, activity, goal, diet, cuisine },
      calorieTarget,
      weeklyPlan,
    };
    const next = [entry, ...savedPlans].slice(0, 12);
    setSavedPlans(next);
    localStorage.setItem("fitfinder_mealplans_v2", JSON.stringify(next));
  }

  function loadPlan(id: string) {
    const entry = savedPlans.find((s) => s.id === id);
    if (!entry) return;
    setPlanName(entry.name);
    setWeeklyPlan(entry.weeklyPlan);
  }

  function deletePlan(id: string) {
    const next = savedPlans.filter((s) => s.id !== id);
    setSavedPlans(next);
    localStorage.setItem("fitfinder_mealplans_v2", JSON.stringify(next));
  }

  function exportPlan() {
    const payload = { name: planName, inputs: { age, gender, weight, height, activity, goal, diet, cuisine }, calorieTarget, weeklyPlan };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(planName || "mealplan").replace(/\s+/g, "_").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const groceryList = useMemo(() => {
    const map = new Map<string, { name: string; portion: string; qty: number }>();
    Object.values(weeklyPlan).flat().forEach((mealDay) => {
      mealDay.items.forEach((it) => {
        const key = it.food.name;
        if (!map.has(key)) map.set(key, { name: it.food.name, portion: it.food.portionLabel, qty: it.portions });
        else {
          const entry = map.get(key)!;
          entry.qty += it.portions;
          map.set(key, entry);
        }
      });
    });
    return Array.from(map.values());
  }, [weeklyPlan]);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
  <div className="fixed inset-0 -z-10">
    <CinematicBackground />
  </div>

  <div className="relative z-10 max-w-6xl mx-auto p-6 pb-24">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-lg bg-white/6 hover:bg-white/8 transition">
              <ArrowLeft />
            </button>

            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-400 p-2 rounded-lg shadow-lg">
                <Utensils className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Meal Planner — Weekly</h1>
                <p className="text-sm text-gray-300">Calorie target: <span className="font-semibold">{calorieTarget} kcal</span> • TDEE: {TDEE} kcal</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => { const s = Date.now(); setSeed(s); buildWeekly(s); }} className="px-3 py-2 bg-white/6 rounded-lg flex items-center gap-2 hover:bg-white/8">
              <RefreshCw /> Regenerate
            </button>
            <button onClick={saveCurrentPlan} className="px-3 py-2 bg-indigo-600 rounded-lg flex items-center gap-2">
              <Save /> Save
            </button>
            <button onClick={exportPlan} className="px-3 py-2 bg-blue-700 rounded-lg flex items-center gap-2">
              <Download /> Export
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="glass-effect p-4 rounded-2xl border border-white/10">
            <label className="text-xs text-gray-300">Plan name</label>
            <input value={planName} onChange={(e) => setPlanName(e.target.value)} className="w-full mt-2 p-2 rounded-lg bg-black/30 border border-white/10" />
          </div>

          <div className="glass-effect p-4 rounded-2xl border border-white/10">
            <label className="text-xs text-gray-300">Diet</label>
            <select value={diet} onChange={(e) => setDiet(e.target.value as Diet)} className="w-full mt-2 p-2 rounded-lg bg-black/30 border border-white/10">
              <option value="both">Both (Veg + NonVeg)</option>
              <option value="veg">Vegetarian</option>
              <option value="nonveg">Non-Veg</option>
            </select>

            <label className="text-xs text-gray-300 mt-3 block">Cuisine</label>
            <select value={cuisine} onChange={(e) => setCuisine(e.target.value as Cuisine)} className="w-full mt-2 p-2 rounded-lg bg-black/30 border border-white/10">
              <option value="any">Any</option>
              <option value="indian">Indian</option>
              <option value="western">Western</option>
            </select>
          </div>

          <div className="glass-effect p-4 rounded-2xl border border-white/10">
            <label className="text-xs text-gray-300">Goal</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value as Goal)} className="w-full mt-2 p-2 rounded-lg bg-black/30 border border-white/10">
              <option value="lose">Lose Weight</option>
              <option value="maintain">Maintain</option>
              <option value="gain">Gain Muscle</option>
            </select>

            <label className="text-xs text-gray-300 mt-3 block">Activity</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value as any)} className="w-full mt-2 p-2 rounded-lg bg-black/30 border border-white/10">
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very active</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="glass-effect p-4 rounded-2xl border border-white/10">
            <label className="text-xs text-gray-300">Age</label>
            <input value={age} onChange={(e) => setAge(Number(e.target.value))} type="number" className="w-full mt-2 p-2 rounded-lg bg-black/30 border border-white/10" />
          </div>
          <div className="glass-effect p-4 rounded-2xl border border-white/10">
            <label className="text-xs text-gray-300">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className="w-full mt-2 p-2 rounded-lg bg-black/30 border border-white/10">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="glass-effect p-4 rounded-2xl border border-white/10">
            <label className="text-xs text-gray-300">Weight (kg)</label>
            <input value={weight} onChange={(e) => setWeight(Number(e.target.value))} type="number" className="w-full mt-2 p-2 rounded-lg bg-black/30 border border-white/10" />
          </div>
          <div className="glass-effect p-4 rounded-2xl border border-white/10">
            <label className="text-xs text-gray-300">Height (cm)</label>
            <input value={height} onChange={(e) => setHeight(Number(e.target.value))} type="number" className="w-full mt-2 p-2 rounded-lg bg-black/30 border border-white/10" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {Object.keys(weeklyPlan).length === 0 && (
            <div className="text-center py-12 text-gray-400">No plan generated yet</div>
          )}

          {Object.entries(weeklyPlan).map(([day, meals]) => (
            <div key={day} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-lg">{day}</div>
                <div className="text-xs text-gray-300">{meals.reduce((s, m) => s + m.kcal, 0)} kcal</div>
              </div>

              <div className="space-y-4">
                {meals.map((m) => (
                  <div key={m.mealName} className="p-3 bg-white/3 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium capitalize text-indigo-200">{m.mealName}</div>
                      <div className="text-xs text-gray-300">{m.kcal} kcal</div>
                    </div>

                    <ul className="text-sm text-gray-300 space-y-2">
                      {m.items.map((it, i) => (
                        <li key={it.food.id + i} className="flex justify-between">
                          <div>
                            <div className="font-medium">{it.food.name}</div>
                            <div className="text-xs text-gray-400">{it.food.portionLabel}{it.portions > 1 ? ` × ${it.portions}` : ""}</div>
                          </div>
                          <div className="text-sm text-gray-300">{Math.round(it.food.kcal * it.portions)} kcal</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Grocery List</h3>
              <div className="text-xs text-gray-400">Aggregated for week</div>
            </div>
            {groceryList.length === 0 ? (
              <div className="text-gray-400">No items</div>
            ) : (
              <ul className="space-y-2">
                {groceryList.map((g) => (
                  <li key={g.name} className="flex justify-between">
                    <div>
                      <div className="font-medium">{g.name}</div>
                      <div className="text-xs text-gray-400">{g.portion}</div>
                    </div>
                    <div className="text-sm text-gray-300">x{g.qty}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Saved Plans</h3>
              <div className="text-xs text-gray-400">Local</div>
            </div>

            {savedPlans.length === 0 && <div className="text-gray-400">No saved plans</div>}

            <ul className="space-y-3">
              {savedPlans.map((s) => (
                <li key={s.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => loadPlan(s.id)} className="px-3 py-1 bg-blue-700 rounded-md text-sm">Load</button>
                    <button onClick={() => deletePlan(s.id)} className="px-3 py-1 bg-red-600 rounded-md text-sm">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-400">
          <div>BMR: {BMR} kcal • TDEE: {TDEE} kcal • Target: <strong>{calorieTarget} kcal</strong></div>
        </div>
      </div>
    </div>
  );
}
