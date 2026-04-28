"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { id: "orch", label: "Initializing Orchestrator", icon: "🧠" },
  { id: "prof", label: "Profiling User Taste", icon: "👤" },
  { id: "cont", label: "Analyzing Content Candidates", icon: "⚡" },
  { id: "trend", label: "Scouting Global Trends", icon: "📈" },
  { id: "div", label: "Guarding Discovery Diversity", icon: "🛡️" },
  { id: "expl", label: "Generating Agent Reasoning", icon: "💬" },
];

export function AgentDiscoveryProgress() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-32 w-full max-w-md mx-auto">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/5 rounded-full mb-12 overflow-hidden relative">
        <div 
          className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-1000 ease-out"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="space-y-6 w-full">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentStep;
          const isActive = i === currentStep;
          const isPending = i > currentStep;

          return (
            <div 
              key={step.id}
              className={`flex items-center gap-4 transition-all duration-500 ${
                isActive ? "scale-105" : "opacity-40 grayscale"
              } ${isCompleted ? "opacity-20 grayscale-0" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border transition-all ${
                isActive ? "border-violet-500 bg-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.3)]" : 
                isCompleted ? "border-green-500/50 bg-green-500/10" : "border-white/10"
              }`}>
                {isCompleted ? "✓" : step.icon}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isActive ? "text-white" : "text-white/60"}`}>
                  {step.label}
                </p>
                {isActive && (
                  <p className="text-[10px] text-violet-400/70 animate-pulse uppercase tracking-widest font-bold mt-0.5">
                    Agent processing...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
