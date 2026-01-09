/**
 * @notice Input & Mode Selection Component for GhostTx
 * @dev Handles switching between Post-Tx Audit and Pre-Flight Simulation.
 */
import React from 'react';

const SearchConsole = ({ 
  mode, 
  setMode, 
  value, 
  onChange, 
  onAction, 
  loading 
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto mb-24 relative group px-2">
      {/* Mode Toggle Tabs */}
      <div className="flex justify-center gap-4 mb-4">
        <button 
          onClick={() => setMode("audit")}
          className={`text-[10px] px-5 py-3 rounded-full border transition-all duration-300 font-bold tracking-widest ${
            mode === 'audit' 
            ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
            : 'border-white/10 text-slate-400 hover:border-white/30'
          }`}
        >
          POST-TX AUDIT
        </button>
        <button 
          onClick={() => setMode("preview")}
          className={`text-[10px] px-5 py-3 rounded-full border transition-all duration-300 font-bold tracking-widest ${
            mode === 'preview' 
            ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]' 
            : 'border-white/10 text-slate-400 hover:border-white/30'
          }`}
        >
          PRE-FLIGHT SIMULATOR
        </button>
      </div>

      {/* Main Input Field */}
      <div className="relative glass-panel p-3 rounded-2xl flex flex-col md:flex-row gap-3 bg-[#0a0a0a] border border-white/10 shadow-2xl transition-all group-hover:border-blue-500/30">
        <input 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={mode === "audit" ? "Enter Transaction Hash" : "Enter Target Contract Address"} 
          className="flex-1 bg-transparent px-6 py-4 outline-none text-xl font-mono text-white placeholder:text-slate-700" 
        />
        
        {/* Tooltip for Simulator Mode */}
        {mode === "preview" && (
          <div className="absolute -bottom-6 left-0 text-[11px] text-blue-400/60 italic font-medium">
            * Tip: Use an EOA or Stylus contract address for pre-flight diagnostics.
          </div>
        )}

        <button 
          onClick={onAction} 
          disabled={loading}
          className={`font-black px-10 py-4 rounded-xl transition-all duration-300 ${
            loading 
            ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
            : "bg-blue-600 hover:bg-white hover:text-black text-white active:scale-95"
          }`}
        >
          {loading ? "PROCESSING..." : mode === "audit" ? "ANALYZE" : "SIMULATE"}
        </button>
      </div>
    </div>
  );
};

export default SearchConsole;