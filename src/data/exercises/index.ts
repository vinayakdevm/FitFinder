import abs from "./abs.json";
import arms from "./arms.json";
import back from "./back.json";
import cardio from "./cardio.json";
import chest from "./chest.json";
import fullbody from "./fullbody.json";
import legs from "./legs.json";
import shoulders from "./shoulders.json";
import { Exercise } from "../../types/exercise";

/* -----------------------------------------------
   🔧 Normalize Values (difficulty, rating, etc.)
------------------------------------------------ */

function normalizeDifficulty(d: any): "beginner" | "intermediate" | "advanced" {
  const c = String(d || "").toLowerCase();

  if (c.includes("begin")) return "beginner";
  if (c.includes("inter")) return "intermediate";
  if (c.includes("adv")) return "advanced";
  return "beginner";
}

function normalizeNumber(n: any): number | undefined {
  if (n === undefined || n === null) return undefined;
  const num = Number(n);
  return isNaN(num) ? undefined : num;
}

/* -----------------------------------------------
   🔥 Convert raw JSON to clean Exercise typed objects
------------------------------------------------ */
function transform(raw: any[]): Exercise[] {
  return raw.map((ex, i) => ({
    id: String(ex.id ?? ex[""] ?? `${ex.name}-${i}`),
    name: ex.name ?? ex.Title ?? "Unnamed Exercise",
    bodyPart: (ex.bodyPart || ex.BodyPart || "")
      .toString()
      .split(",")
      .map((s: string) => s.trim().toLowerCase())
      .filter((s: string) => s),

    equipment: (ex.equipment || ex.Equipment || "")
      .toString()
      .split(",")
      .map((s: string) => s.trim().toLowerCase())
      .filter((s: string) => s),

    goals: (ex.goals || ex.Type || "")
      .toString()
      .split(",")
      .map((s: string) => s.trim().toLowerCase())
      .filter((s: string) => s),

    difficulty: normalizeDifficulty(ex.difficulty || ex.Level),

    instructions: (ex.instructions ||
      ex.Desc?.split(".") ||
      ["No instructions available"]
    )
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0),

    tips: ex.tips || ex.RatingDesc || "",

    rating: normalizeNumber(ex.rating || ex.Rating),
    ratingDesc: ex.ratingDesc || ex.RatingDesc,

    image: ex.image,
    video: ex.video,
  }));
}

/* -----------------------------------------------
   🔥 Merge all muscle group files into 1 array
------------------------------------------------ */
export const exercises: Exercise[] = [
  ...transform(abs),
  ...transform(arms),
  ...transform(back),
  ...transform(cardio),
  ...transform(chest),
  ...transform(fullbody),
  ...transform(legs),
  ...transform(shoulders),
];
