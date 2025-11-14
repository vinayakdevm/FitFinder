import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Target, Zap, TrendingUp, ArrowRight, Star } from "lucide-react";


interface LandingPageProps {
  onEnter: () => void;
}


export function LandingPage({ onEnter }: LandingPageProps) {
  // Inside your component
const backgrounds = [
  "/assets/gym1.jpg",
  "/assets/gym8.jpg",
  "/assets/gym3.jpg",
  "/assets/gym4.jpg",
  "/assets/gym5.jpg"
];
const [index, setIndex] = useState(0);

// Auto shuffle every 3 seconds
useEffect(() => {
  const timer = setInterval(() => {
    setIndex((prev) => (prev + 1) % backgrounds.length);
  }, 3000);
  return () => clearInterval(timer);
}, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden text-white font-sans">

      {/* ===== Dynamic Cinematic Background ===== */}
<div className="absolute inset-0 overflow-hidden">
  {/* Smooth crossfade transition using AnimatePresence */}
  <AnimatePresence>
    <motion.img
      key={backgrounds[index]}
      src={backgrounds[index]}
      alt="FitFinder background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: "easeInOut" }}
      className="absolute w-full h-full object-cover brightness-[1.5] scale-60"
    />
  </AnimatePresence>

  {/* Animated glowing halo */}
  <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-r from-blue-500/30 via-cyan-500/10 to-transparent blur-[150px] animate-pulse-slow"></div>

  {/* Depth overlays for cinematic lighting */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black/95" />
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/40 to-black/80" />
</div>

{/* Subtle animated grid pattern */}
<div className="gym-pattern fixed inset-0 opacity-20"></div>

      

      {/* ===== Navbar ===== */}
      <nav className="relative z-10 glass-effect border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 rounded-xl shadow-lg shadow-blue-500/50">
                <Dumbbell className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">FitFinder</h1>
                <p className="text-xs text-gray-400">Elite Training Platform</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <main className="relative z-10">
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-8 border border-blue-500/30">
            <Star className="text-yellow-400" size={16} fill="currentColor" />
            <span className="text-sm text-gray-300">Trusted by Elite Athletes</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            <span className="text-white">Find Your Perfect</span>
            <br />
            <span className="text-gradient animate-float inline-block">Workout</span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover personalized exercise recommendations tailored to your goals, equipment, and target muscles. Transform your training today.
          </p>

          <button
            onClick={onEnter}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-lg font-bold rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105"
          >
            Start Training Now
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </button>

          {/* ===== Features Section ===== */}
          <div className="grid md:grid-cols-3 gap-8 mt-32">
            {[
              {
                icon: <Target className="text-white" size={28} />,
                title: "Precision Targeting",
                desc: "Filter exercises by specific muscle groups to hit your target areas with surgical precision."
              },
              {
                icon: <Dumbbell className="text-white" size={28} />,
                title: "Any Equipment",
                desc: "From bodyweight to barbells, find exercises that match your available equipment perfectly."
              },
              {
                icon: <TrendingUp className="text-white" size={28} />,
                title: "Goal Oriented",
                desc: "Whether building strength, endurance, or power, get exercises aligned with your goals."
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="glass-effect p-8 rounded-3xl border border-white/10 hover:border-cyan-400/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all duration-500 group cursor-pointer backdrop-blur-xl"
              >
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg shadow-blue-500/50">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ===== Smart Discovery Section ===== */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="relative py-20 border-y border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-6 border border-blue-500/30">
                <Zap className="text-blue-400" size={16} />
                <span className="text-sm text-gray-300">Advanced Filtering</span>
              </div>
              <h2 className="text-4xl font-black text-white mb-6">
                Smart Exercise Discovery
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Our intelligent filtering system helps you find the perfect exercises in seconds. Combine multiple filters to get laser-focused recommendations that match your exact needs.
              </p>
              <ul className="space-y-4">
                {[
                  '20+ exercises covering all muscle groups',
                  'Beginner to advanced difficulty levels',
                  'Detailed step-by-step instructions',
                  'Pro tips from expert trainers'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-effect p-8 rounded-3xl border-2 border-blue-500/30 shadow-[0_0_40px_rgba(34,211,238,0.1)]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-blue-500/20">
                    <span className="text-gray-300 font-medium">Body Parts</span>
                    <span className="text-blue-400 font-bold">9 Options</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-blue-500/20">
                    <span className="text-gray-300 font-medium">Equipment</span>
                    <span className="text-cyan-400 font-bold">10 Options</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-blue-500/20">
                    <span className="text-gray-300 font-medium">Goals</span>
                    <span className="text-blue-400 font-bold">9 Options</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </motion.section>

        {/* ===== CTA Section ===== */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="py-20 text-center"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black text-white mb-6">
              Ready to Transform Your Training?
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Join thousands of athletes who have optimized their workouts with FitFinder.
            </p>
            <button
              onClick={onEnter}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-lg font-bold rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </div>
        </motion.section>
      </main>

      {/* ===== FOOTER ===== */}
<footer className="relative z-10 border-t border-white/10 py-8 backdrop-blur-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">

    {/* Left Section */}
    <div className="flex items-center gap-3">
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
        <Dumbbell className="text-white" size={20} />
      </div>

      <div className="text-gray-400 text-sm">
        <span className="font-semibold text-white">FitFinder</span> — Elite Training Platform  
      </div>
    </div>

    {/* Right Section (Your Credit) */}
    <p className="text-gray-500 text-sm text-center md:text-right">
      Crafted with ❤️ by <span className="text-white font-semibold">Vinayak Dev Mishra</span>
    </p>
  </div>
</footer>

    </div>
  );
}
