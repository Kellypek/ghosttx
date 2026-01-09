/**
 * @notice Professional Timeline Component for Arbitrum Stylus Analytics
 * @dev Optimized for dynamic strings (ETH/USD) and visual clarity.
 */
import React from 'react';

const TimelineCard = ({ data }) => {
  const isActual = data.name === "Actual";
  const isAvoided = data.name === "Avoided";
  
  // 1. Automatic Color：check first word
  // "+" / green card = show green；"-" = show red
  const isPositive = data.outcome.toString().startsWith('+');
  const isNegative = data.outcome.toString().startsWith('-');
  
  const statusColor = isNegative ? "text-red-500" : (isPositive ? "text-green-400" : "text-white");
  const glowColor = isNegative ? "bg-red-500" : "bg-green-500";

  return (
    <div className="glass-panel p-6 rounded-[2rem] transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/30 group relative overflow-hidden h-full flex flex-col">

      <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full blur-3xl -mr-16 -mt-16 ${glowColor}`}></div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`w-3 h-3 rounded-full ${isNegative ? 'bg-red-500 shadow-[0_0_12px_#ef4444]' : 'bg-green-500 shadow-[0_0_12px_#22c55e]'}`} />
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
          GAS: {data.gasUsed}
        </span>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">{data.name}</h3>
      <p className="text-slate-400 text-[11px] mb-6 leading-relaxed italic h-8 opacity-80">
        "{data.result}"
      </p>
      
      <div className="mt-auto relative z-10 pt-4 border-t border-white/5">
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter block mb-1">Est. Net Outcome</span>
        <div className="flex items-baseline flex-wrap gap-1">
          <span className={`text-2xl font-mono font-black tracking-tighter ${statusColor}`}>
            {data.outcome}
          </span>
          <span className="text-[10px] text-slate-500 font-black uppercase">
            {isAvoided ? "" : "ETH"} 
          </span>
        </div>
      </div>

      {data.name.includes("Optimal") }
    </div>
  );
};

export default TimelineCard;