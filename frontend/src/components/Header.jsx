import React from 'react';

const Header = ({ account, balance, connectWallet }) => {
  return (
    <div className="w-full flex flex-col items-center">
      
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center mb-20 p-1 rounded-2xl bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-transparent">
        <div className="w-full bg-black/80 backdrop-blur-2xl rounded-xl px-8 py-4 flex justify-between items-center border border-white/5 shadow-2xl">
          <div className="flex items-center gap-6 font-mono text-[10px] tracking-[0.2em] text-blue-400">
      
            <div className="flex items-center gap-2 text-cyan-400">
              <span className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]"></span>
              <span>NITRO RUNTIME: ACTIVE</span>
            </div>

            {account && (
              <div className="hidden md:flex items-center gap-4 border-l border-white/10 pl-6">
                <span className="text-slate-500 uppercase">Balance:</span>
                <span className="text-white font-bold">{balance} ETH</span>
              </div>
            )}
          </div>

          <button 
            onClick={connectWallet} 
            className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all border ${
              account 
                ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400" 
                : "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:bg-white hover:text-black hover:border-white"
            }`}
          >
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}`.toUpperCase() : "CONNECT WALLET"}
          </button>
        </div>
      </div>

      <div className="text-center mb-16 px-4">
        <div className="flex justify-center items-center gap-4 mb-4">
          <h1 className="text-7xl md:text-8xl font-black text-white tracking-tighter uppercase italic">
            Ghost Tx
          </h1>
          <span className="text-6xl md:text-7xl animate-bounce">👻</span>
        </div>
        <p className="text-lg md:text-xl text-blue-400/80 font-medium tracking-tight mb-2">
          Simulating parallel universes for failed blockchain transactions.
        </p>
        <p className="text-[10px] font-mono text-blue-500/50 uppercase tracking-[0.3em] italic">
          Powered by Arbitrum Stylus
        </p>
      </div>
    </div>
  );
};

export default Header;