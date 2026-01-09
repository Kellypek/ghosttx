/**
 * @notice Ghost-Intent Automation Console
 * @dev Handles user intent signing, target gas monitoring, and automated execution UI.
 */
import React from 'react';

const IntentConsole = ({ 
  intentStatus, 
  targetGas, 
  setTargetGas, 
  onSign, 
  onCancel 
}) => {
  // Utility for conditional styles
  const isMonitoring = intentStatus === "Monitoring";
  const isExecuted = intentStatus === "Executed";
  const isSigning = intentStatus === "Signing...";
  const isIdle = intentStatus === "Idle";

  return (
    <div 
      className="mt-8 p-6 rounded-2xl transition-all duration-500 relative overflow-hidden"
      style={{ 
        background: 'rgba(0, 255, 163, 0.05)', 
        border: `1px solid ${isMonitoring ? "#ff4d4d" : "#00ffa3"}`, 
        boxShadow: `0 0 20px ${isMonitoring ? "rgba(255, 77, 77, 0.1)" : "rgba(0, 255, 163, 0.1)"}`
      }}
    >
      {/* Header Section */}
      <h3 className={`text-sm font-bold mb-3 flex items-center gap-3 ${isMonitoring ? "text-red-500" : "text-[#00ffa3]"}`}>
        <span>{isMonitoring ? "📡" : "👻"}</span> 
        {isMonitoring ? "GHOST-INTENT: ACTIVE MONITORING" : "GHOST-INTENT AUTOMATION"}
      </h3>
      
      <p className="text-[12px] text-slate-400 mb-6 leading-relaxed italic">
        {isMonitoring 
          ? "Your intent is locked and signed. The relayer is waiting for the target gas price to trigger the Stylus path."
          : "The Stylus path is ready. Set your target gas price, and our WASM-powered router will execute automatically."}
      </p>

      {/* Control Row */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">
            Target Gas (Gwei)
          </label>
          <input 
            type="number" 
            disabled={!isIdle} 
            value={targetGas} 
            onChange={(e) => setTargetGas(e.target.value)}
            className={`w-full bg-black border border-white/10 p-3 rounded-xl font-mono text-xl outline-none transition-all ${
              isIdle ? "text-white focus:border-[#00ffa3]/50" : "text-slate-600 cursor-not-allowed"
            }`}
          />
        </div>
        
        {isMonitoring ? (
          <button 
            onClick={onCancel}
            className="w-full md:w-auto px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-[11px] tracking-widest transition-all active:scale-95"
          >
            CANCEL INTENT
          </button>
        ) : (
          <button 
            onClick={onSign}
            disabled={isExecuted || isSigning}
            className={`w-full md:w-auto px-8 py-4 rounded-xl font-black text-[11px] tracking-widest transition-all ${
              isExecuted 
                ? "bg-slate-800 text-slate-500" 
                : "bg-[#00ffa3] text-black hover:shadow-[0_0_20px_#00ffa3] active:scale-95"
            }`}
          >
            {isIdle ? "SIGN & ENABLE" : isSigning ? "CHECK WALLET..." : "EXECUTED"}
          </button>
        )}
      </div>

      {/* Active Animation Footer */}
      {isMonitoring && (
        <div className="mt-6 pt-4 border-t border-red-500/20 text-center">
          <div className="flex justify-center gap-1 mb-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
            ))}
          </div>
          <p className="text-[9px] text-red-500 font-mono tracking-[0.3em] uppercase animate-pulse">
            [SYSTEM] Agent is watching the mempool...
          </p>
        </div>
      )}
    </div>
  );
};

export default IntentConsole;