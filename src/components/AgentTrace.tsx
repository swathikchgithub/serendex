"use client";

import type { AgentTrace } from "@/types";

const AGENT_ICONS: Record<string, string> = {
  orchestrator: "🧠",
  content_analysis: "⚡",
  user_profiling: "👤",
  trend_scout: "📈",
  diversity_guard: "🛡️",
  explanation: "💬",
};

const AGENT_COLORS: Record<string, string> = {
  orchestrator: "border-yellow-500/40 bg-yellow-500/5",
  content_analysis: "border-blue-500/40 bg-blue-500/5",
  user_profiling: "border-purple-500/40 bg-purple-500/5",
  trend_scout: "border-orange-500/40 bg-orange-500/5",
  diversity_guard: "border-green-500/40 bg-green-500/5",
  explanation: "border-pink-500/40 bg-pink-500/5",
};

interface Props {
  traces: AgentTrace[];
  orchestratorReasoning: string;
  totalLatency: number;
  diversityScore: number;
}

export function AgentTracePanel({ traces, orchestratorReasoning, totalLatency, diversityScore }: Props) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white/80 font-semibold text-base">SERENDEX Reasoning Trace</h3>
        <div className="flex gap-3 text-xs text-white/40">
          <span>{totalLatency}ms total</span>
          <span>diversity {Math.round(diversityScore * 100)}%</span>
        </div>
      </div>

      {/* Orchestrator reasoning */}
      <div className="border border-yellow-500/40 bg-yellow-500/5 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <span>🧠</span>
          <span className="text-yellow-300 font-semibold">Orchestrator</span>
        </div>
        <p className="text-white/50 text-xs leading-relaxed">{orchestratorReasoning}</p>
      </div>

      {/* Agent traces */}
      {traces.map((trace) => (
        <div key={trace.agent} className={`border rounded-lg p-3 ${AGENT_COLORS[trace.agent] ?? "border-white/10"}`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span>{AGENT_ICONS[trace.agent] ?? "🤖"}</span>
              <span className="text-white/80 font-semibold capitalize">{trace.agent.replace(/_/g, " ")}</span>
              <span className="text-green-400 text-xs">✓ {trace.output_count} results</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/30">
              <span>{trace.latency_ms}ms</span>
              <span>confidence {Math.round(trace.confidence * 100)}%</span>
            </div>
          </div>

          {trace.tools_called.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {trace.tools_called.map((tool, i) => (
                <span key={i} className="text-xs bg-white/5 border border-white/10 text-white/40 px-1.5 py-0.5 rounded">
                  {tool}
                </span>
              ))}
            </div>
          )}

          {trace.reasoning && (
            <p className="text-white/40 text-xs leading-relaxed">{trace.reasoning}</p>
          )}
        </div>
      ))}

      <div className="border-t border-white/10 pt-2 text-xs text-white/20 text-center">
        SERENDEX — Built to explain itself
      </div>
    </div>
  );
}
