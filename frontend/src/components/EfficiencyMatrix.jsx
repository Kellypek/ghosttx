/**
 * @notice Efficiency Matrix Component for Arbitrum Stylus
 * @dev Visualizes WASM memory heap, gas breakdown, and performance latency comparison.
 */
import React from 'react';
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from "recharts";

const EfficiencyMatrix = ({ 
  memoryUsage, 
  gasBreakdown, 
  performanceData, 
  multiplier 
}) => {
  return (
    <div className="lg:col-span-4 glass-panel p-10 rounded-[3.5rem] bg-[#080808] border border-blue-500/20 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 font-black text-8xl italic select-none">WASM</div>
      <h3 className="text-xs font-black text-blue-400 mb-10 tracking-[0.3em] uppercase">Efficiency Matrix</h3>

      {/* 1. WASM Memory Heap Visualization */}
      <div className="glass-panel p-8 rounded-[2.5rem] bg-black/40 border border-cyan-500/30 mt-6 relative overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.1)]">
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>

        <h4 className="text-[11px] font-black text-cyan-400 mb-8 tracking-[0.3em] uppercase flex items-center gap-2">
          <span className="h-2 w-2 bg-cyan-400 rounded-full animate-ping"></span>
          WASM Runtime Memory Heap
        </h4>

        <div className="flex gap-4 justify-between relative z-20">
          {memoryUsage.map((m, i) => (
            <div key={i} className="flex-1 group">
              <div className="h-28 w-full bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden relative group-hover:border-cyan-500/50 transition-all duration-500">
                <div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-cyan-600 via-cyan-400 to-white transition-all duration-[1500ms] cubic-bezier(0.4, 0, 0.2, 1) shadow-[0_-5px_15px_rgba(34,211,238,0.6)]" 
                  style={{ height: `${m.usage}%` }}
                >
                  <div className="h-1 w-full bg-white opacity-80 animate-pulse"></div>
                </div>
              </div>
              <div className="text-[10px] mt-3 text-cyan-400/60 font-mono text-center group-hover:text-cyan-400 transition-colors">
                {m.offset}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Gas Breakdown Bars */}
      <div className="glass-panel p-6 rounded-3xl bg-black border border-blue-500/20 mt-6">
        <h4 className="text-[10px] font-black text-blue-400 mb-6 tracking-widest uppercase">Stylus Efficiency Breakdown</h4>
        <div className="space-y-4">
          {Object.entries(gasBreakdown).map(([key, value]) => {
            const total = Object.values(gasBreakdown).reduce((a, b) => a + b, 0);
            return (
              <div key={key}>
                <div className="flex justify-between text-[10px] mb-1 uppercase tracking-tighter">
                  <span className="text-slate-400">{key}</span>
                  <span className="text-white">{value.toLocaleString()} units</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-1000" 
                    style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
                  
      {/* 3. Performance Chart */}
      <div className="h-[220px] w-full mb-8 mt-8">
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
               <defs>
                  <linearGradient id="colorStylus" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
               </defs>
               <Tooltip 
                 contentStyle={{backgroundColor: '#000', border: '1px solid #334155', borderRadius: '8px'}} 
                 itemStyle={{fontSize: '10px'}} 
               />
               <Area type="monotone" dataKey="evm" stroke="#94a3b8" strokeWidth={2} strokeDasharray="6 6" fill="transparent" dot={false} name="Legacy EVM Overhead" />
               <Area type="monotone" dataKey="stylus" stroke="#60a5fa" fillOpacity={1} fill="url(#colorStylus)" strokeWidth={4} dot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }} name="Stylus WASM Optimization" />
            </AreaChart>
         </ResponsiveContainer>
      </div>

      {/* 4. Comparison Cards & Multiplier */}
      <div className="space-y-4">
         <div className="flex justify-between items-center p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Stylus Latency</span>
            <span className="text-blue-400 font-mono font-bold">12ms</span>
         </div>
         <div className="flex justify-between items-center p-5 rounded-2xl bg-white/5 border border-white/5 opacity-40">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Standard EVM</span>
            <span className="text-slate-400 font-mono font-bold">186ms</span>
         </div>
      </div>

      <div className="mt-12 pt-12 border-t border-white/10 text-center">
         <div className="text-5xl font-black text-blue-400 italic tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
           {multiplier}X
         </div>
         <div className="text-[10px] text-white font-black tracking-widest uppercase opacity-70">Efficiency Multiplier</div>
         <p className="text-[9px] text-slate-600 mt-6 italic leading-relaxed px-4">
           Empowering sub-millisecond transaction diagnostics via the Arbitrum Stylus Rust SDK.
         </p>
      </div>
    </div>
  );
};

export default EfficiencyMatrix;