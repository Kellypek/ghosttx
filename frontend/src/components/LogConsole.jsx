/**
 * @notice System Trace Console for GhostTx
 * @dev Displays real-time WASM and Nitro runtime logs.
 * Includes auto-scroll functionality for a better DX (Developer Experience).
 */
import React, { useEffect, useRef } from 'react';

const LogConsole = ({ logs }) => {
  const scrollRef = useRef(null);

  // Auto-scroll to the latest log entry
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="glass-panel p-8 rounded-[2rem] bg-black border border-white/5 font-mono text-[11px] text-blue-400/60 shadow-inner h-full flex flex-col">
      {/* Console Header */}
      <div className="flex justify-between items-center mb-4 text-white/20 border-b border-white/10 pb-2">
        <span className="font-bold tracking-widest uppercase italic flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
          Stylus_Trace_Console
        </span>
        <span className="text-[9px] opacity-40 italic">Runtime: WASM-Sandboxed</span>
      </div>

      {/* Log Entries Container */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1 scrollbar-hide custom-scrollbar"
        style={{ maxHeight: '300px' }}
      >
        {logs.length > 0 ? (
          logs.map((log, i) => (
            <div key={i} className="mb-1 leading-relaxed tracking-tighter hover:text-blue-300 transition-colors">
              {log}
            </div>
          ))
        ) : (
          <div className="text-slate-700 italic">No telemetry data available...</div>
        )}
      </div>
      
      {/* Footer / Status */}
      <div className="mt-4 pt-2 border-t border-white/5 text-[9px] text-slate-600 flex justify-between uppercase tracking-widest">
        <span>Channel: 0xGhost_Sync</span>
        <span>Secure Session</span>
      </div>
    </div>
  );
};

export default LogConsole;