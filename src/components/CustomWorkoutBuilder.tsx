// ------------------------------------------------------
// CustomWorkoutBuilder — Strong App Style Drag and Drop
// ------------------------------------------------------

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  Trash2,
  Edit2,
  GripVertical,   // drag handle icon
} from "lucide-react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { exercises } from "../data/exercises";
import { StackedScrollBackground } from "../components/StackedScrollBackground";


// ----------------------------------------------
// CONSTS FOR EDIT MODAL
// ----------------------------------------------
const REP_OPTIONS = ["3–5", "5–8", "8–12", "10–15", "12–20", "15–25"];
const REST_OPTIONS = [30, 45, 60, 90, 120, 180];
const SETS_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);



// ------------------------------------------------------
// Sortable Exercise Item Component
// Strong App Style (drag handle on right side)
// ------------------------------------------------------

function SortableExerciseItem({
  exercise,
  index,
  onEdit,
  onDelete,
}: any) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 99 : "auto",
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={`
        p-3 rounded-xl bg-white/6 border border-white/10 backdrop-blur-xl
        flex items-center justify-between
        transition-all
        ${isDragging ? "shadow-2xl scale-[1.03]" : ""}
      `}
    >
      {/* Left: Name + Details */}
      <div className="flex-1">
        <div className="font-semibold">{exercise.name}</div>
        <div className="text-xs text-gray-300">
          {exercise.sets} × {exercise.reps} • {exercise.rest}s rest
        </div>
      </div>

      {/* Middle: Edit/Delete */}
      <div className="flex items-center gap-3 mr-2">
        <button
          onClick={onEdit}
          className="px-3 py-2 rounded-lg bg-white/6 border border-white/10 hover:bg-white/10 transition"
        >
          <Edit2 size={16} />
        </button>

        <button
          onClick={onDelete}
          className="px-3 py-2 rounded-lg bg-white/6 border border-white/10 hover:bg-white/10 transition text-red-400"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Drag Handle (Strong Style) */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing px-2 text-gray-300 hover:text-white"
        title="Drag to reorder"
      >
        <GripVertical size={20} />
      </button>
    </motion.div>
  );
}



// ------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------

export function CustomWorkoutBuilder({
  onBack,
  onStartWorkout,
}: {
  onBack: () => void;
  onStartWorkout: (workout: any) => void;
}) {

  const [workoutName, setWorkoutName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [savedWorkouts, setSavedWorkouts] = useState<any[]>([]);
  const [viewingWorkout, setViewingWorkout] = useState<any | null>(null);

  // EDIT MODAL STATE
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [pickerSets, setPickerSets] = useState<number>(3);
  const [pickerReps, setPickerReps] = useState<string>("8–12");
  const [pickerRest, setPickerRest] = useState<number>(60);


  // Load saved workouts
  useEffect(() => {
    try {
      const data = localStorage.getItem("fitfinder_custom_workouts");
      if (data) setSavedWorkouts(JSON.parse(data));
    } catch {}
  }, []);

  // Save to LS
  const saveWorkoutsToLS = (arr: any[]) => {
    setSavedWorkouts(arr);
    localStorage.setItem("fitfinder_custom_workouts", JSON.stringify(arr));
  };

  // Add exercise
  const addExercise = (ex: any) => {
    const item = {
      key: ex.id + "-" + Date.now(),
      id: ex.id,
      name: ex.name,
      bodyPart: ex.bodyPart,
      sets: 3,
      reps: "8–12",
      rest: 60,
    };
    setSelectedExercises((prev) => [...prev, item]);
  };

  // Delete exercise
  const removeExercise = (key: string) => {
    setSelectedExercises((prev) => prev.filter((e) => e.key !== key));
  };

  // Save workout
  const saveRoutine = () => {
    if (!workoutName.trim()) return alert("Enter a name");
    if (selectedExercises.length === 0) return alert("Add exercises!");

    const workout = {
      id: Date.now(),
      name: workoutName,
      exercises: selectedExercises,
    };

    const updated = [...savedWorkouts, workout];
    saveWorkoutsToLS(updated);

    setWorkoutName("");
    setSelectedExercises([]);
    alert("Workout saved!");
  };

  // Delete saved workout
  const deleteWorkout = (id: number) => {
    const workoutToDelete = savedWorkouts.find((w) => w.id === id);
    if (!workoutToDelete) return;
  
    // 1️⃣ Delete from saved workouts
    const updated = savedWorkouts.filter((w) => w.id !== id);
    saveWorkoutsToLS(updated);
  
    // 2️⃣ Delete all progress logs linked to this workout
    try {
      const raw = localStorage.getItem("fitfinder_progress_logs");
      const logs = raw ? JSON.parse(raw) : [];
  
      const filteredLogs = logs.filter(
        (log: any) => log.workoutName !== workoutToDelete.name
      );
  
      localStorage.setItem(
        "fitfinder_progress_logs",
        JSON.stringify(filteredLogs)
      );
    } catch (err) {
      console.error("Failed to delete linked history:", err);
    }
  
    alert("Workout deleted along with its history!");
  };


  // --------------------------------------------
  // DRAG & DROP (Strong App Style)
  // --------------------------------------------
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    })
  );

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = selectedExercises.findIndex((i) => i.key === active.id);
      const newIndex = selectedExercises.findIndex((i) => i.key === over.id);

      setSelectedExercises((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };



  // --------------------------------------------
  // OPEN EDIT MODAL
  // --------------------------------------------
  const openEditModal = (index: number) => {
    const ex = selectedExercises[index];
    setEditingIndex(index);
    setPickerSets(ex.sets);
    setPickerReps(ex.reps);
    setPickerRest(ex.rest);
  };

  const applyEdit = () => {
    if (editingIndex == null) return;

    setSelectedExercises((prev) => {
      const arr = [...prev];
      arr[editingIndex] = {
        ...arr[editingIndex],
        sets: pickerSets,
        reps: pickerReps,
        rest: pickerRest,
      };
      return arr;
    });

    setEditingIndex(null);
  };



  // --------------------------------------------
  // UI: Wheel Picker Component
  // --------------------------------------------
  function PickerBox({ title, options, value, onChange }: any) {
    return (
      <div className="flex-1 text-center">
        <div className="mb-2 text-sm text-gray-300">{title}</div>
        <div className="rounded-xl bg-white/10 border border-white/20 p-3 max-h-40 overflow-y-auto">
          {options.map((o: any, i: number) => (
            <div
              key={i}
              onClick={() => onChange(o)}
              className={`
                py-1 cursor-pointer select-none transition-all
                ${
                  o === value
                    ? "text-white font-bold text-lg"
                    : "text-gray-400"
                }
              `}
            >
              {o}
            </div>
          ))}
        </div>
      </div>
    );
  }




  // -------------------------------------------------------
  // RENDER UI
  // -------------------------------------------------------

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <StackedScrollBackground />

      <div className="relative z-10 max-w-6xl mx-auto p-6">

        {/* Back */}
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-white/10 border border-white/20 rounded-xl 
            hover:bg-white/20 backdrop-blur-xl transition flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <h1 className="text-4xl font-extrabold mb-2">Custom Workout Builder</h1>
        <p className="text-gray-400 mb-8">
          Drag to reorder • Edit sets/reps/rest • Save routines
        </p>



        {/* ------------------------------------------------ */}
        {/* INPUT AREA */}
        {/* ------------------------------------------------ */}

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">

          <input
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="Workout Name (e.g. Push Day)"
            className="w-full bg-white/10 border border-white/20 px-4 py-3 rounded-xl mb-6 
                       focus:ring-2 focus:ring-cyan-500 outline-none text-gray-100 placeholder-gray-400"
          />

          <h3 className="text-lg font-bold mb-3">Select Exercises</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 max-h-64 overflow-y-auto pr-2">
            {exercises.map((ex: any) => (
              <div
                key={ex.id}
                onClick={() => addExercise(ex)}
                className="bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-xl cursor-pointer hover:border-white/20"
              >
                <div className="font-semibold">{ex.name}</div>
                <div className="text-xs text-gray-400">
                  {ex.bodyPart.join(", ")}
                </div>
              </div>
            ))}
          </div>



          {/* ------------------------------------------------ */}
          {/* SELECTED EXERCISES (DRAGGABLE LIST) */}
          {/* ------------------------------------------------ */}

          <h3 className="text-lg font-bold mb-3">Your Workout</h3>

          {selectedExercises.length === 0 && (
            <p className="text-gray-500 mb-3">No exercises added.</p>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext
              items={selectedExercises.map((e) => e.key)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {selectedExercises.map((ex, i) => (
                  <SortableExerciseItem
                    key={ex.key}
                    exercise={ex}
                    index={i}
                    onEdit={() => openEditModal(i)}
                    onDelete={() => removeExercise(ex.key)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>



          {/* Save and Clear */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={saveRoutine}
              className="flex-1 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition font-semibold"
            >
              Save Workout
            </button>

            <button
              onClick={() => setSelectedExercises([])}
              className="px-4 py-3 rounded-xl bg-white/6 border border-white/10 hover:bg-white/10 transition"
            >
              Clear
            </button>
          </div>
        </div>



        {/* ------------------------------------------------ */}
        {/* SAVED WORKOUTS */}
        {/* ------------------------------------------------ */}

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Saved Workouts</h2>

          {savedWorkouts.length === 0 && (
            <p className="text-gray-500">No saved workouts yet.</p>
          )}

          <div className="space-y-3 mt-4">
            {savedWorkouts.map((w) => (
              <div
                key={w.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold">{w.name}</div>
                  <div className="text-sm text-gray-300">
                    {w.exercises.length} exercises
                  </div>
                </div>

                <div className="flex items-center gap-3">
                <button
  className="text-cyan-400 hover:text-cyan-300"
  onClick={() => onStartWorkout(w)}
>
  Start Workout
</button>


                  <button
                    onClick={() =>
                      confirm("Delete workout?") && deleteWorkout(w.id)
                    }
                    className="px-3 py-2 rounded-lg bg-white/6 border border-white/10 hover:bg-white/10 transition text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>



      {/* ------------------------------------------------ */}
      {/* VIEW WORKOUT MODAL */}
      {/* ------------------------------------------------ */}
      {viewingWorkout && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-[9999] p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/6 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 max-w-lg w-full"
          >
            <h3 className="text-xl font-bold mb-4">{viewingWorkout.name}</h3>

            <div className="max-h-72 overflow-y-auto space-y-3 pr-2">
              {viewingWorkout.exercises.map((ex: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl"
                >
                  <div className="font-semibold">{ex.name}</div>
                  <div className="text-sm text-gray-300">
                    {ex.sets} × {ex.reps} • {ex.rest}s rest
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setViewingWorkout(null)}
              className="mt-4 w-full py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}



      {/* ------------------------------------------------ */}
      {/* EDIT MODAL */}
      {/* ------------------------------------------------ */}

      {editingIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-[9999] p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/6 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 max-w-2xl w-full"
          >
            <h3 className="text-2xl font-bold mb-4">
              Edit {selectedExercises[editingIndex].name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PickerBox
                title="Sets"
                options={SETS_OPTIONS}
                value={pickerSets}
                onChange={setPickerSets}
              />

              <PickerBox
                title="Reps"
                options={REP_OPTIONS}
                value={pickerReps}
                onChange={setPickerReps}
              />

              <PickerBox
                title="Rest (s)"
                options={REST_OPTIONS}
                value={pickerRest}
                onChange={setPickerRest}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={applyEdit}
                className="flex-1 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20"
              >
                Apply
              </button>

              <button
                onClick={() => setEditingIndex(null)}
                className="px-4 py-3 rounded-xl bg-white/6 border border-white/10 hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

    </div>
  );
}
