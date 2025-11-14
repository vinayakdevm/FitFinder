export interface Exercise {
  id: string;
  name: string;
  bodyPart: string[];
  equipment: string[];
  goals: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  instructions: string[];
  tips: string;
  rating?: number;
  ratingDesc?: string;
  image?: string;
  video?: string;
}

export interface FilterOptions {
  bodyParts: string[];
  equipment: string[];
  goals: string[];
}

export interface RoutineExercise {
  id: string;
  name: string;
  bodyPart: string[];
  equipment: string[];
  goals: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface DayPlan {
  name: string;
  exercises: RoutineExercise[];
}

export type WeekPlan = DayPlan[];
