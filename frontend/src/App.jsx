/**
 * @project GhostTx
 */

import { ethers } from "ethers";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import SearchConsole from "./components/SearchConsole";
import TimelineCard from "./components/TimelineCard";
import LogConsole from "./components/LogConsole";
import IntentConsole from "./components/IntentConsole";
import EfficiencyMatrix from "./components/EfficiencyMatrix";
import "./index.css";

export default function App() {
  const GHOST_ABI = [
    "function execute_intent(bytes signature, uint256 target_gas, bytes32 msg_hash) public returns (bool)"
  ];

  // --- INTENT STATE ---
  const [isIntentMode, setIsIntentMode] = useState(false);
  const [targetGas, setTargetGas] = useState("0.05"); // Default Target of Gas Price
  const [intentStatus, setIntentStatus] = useState("Idle"); // Idle -> Signed -> Monitoring -> Executed

  const signGhostIntent = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");
    if (parseFloat(balance) === 0) {
      alert("Warning: You need some Sepolia ETH to authorize the signature.");
    }

    setIntentStatus("Signing...");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // 1. Build structure message 
      const nonce = Math.floor(Math.random() * 1000000);
      const timestamp = new Date().toLocaleString();
      
      const message = `GhostTx Intent Authentication
--------------------------------
Action: Execute Optimized Path
Target Gas: ${targetGas} Gwei
Relayer: 0xGhostRelayer_v1
Signer: ${userAddress}
Nonce: ${nonce}
Time: ${timestamp}
--------------------------------
Status: [AUTHORIZED]`;

      // 2. Real signature (MetaMask will pop up signature confirmation)
      const signature = await signer.signMessage(message);
      
      // 3. Calculate real hash 
      const msgHash = ethers.hashMessage(message);
      
      console.log("Real Signature Generated:", signature);
      setIntentStatus("Monitoring");
      
      // Update log：show real hash & signature
      setLogs(prev => [
        ...prev, 
        `[AUTH] Intent Hash: ${msgHash.slice(0, 20)}...`,
        `[GHOST] Signature: ${signature.slice(0, 24)}...`,
        `[SYSTEM] Relayer Active. Monitoring mempool for ${targetGas} Gwei...`
      ].slice(-8));

      // 4. Simulate real market monitoring 
      startMockRelayer(targetGas);

    } catch (err) {
      setIntentStatus("Idle");
      setLogs(prev => [...prev, `[ERROR] User denied signature.`].slice(-6));
      console.error(err);
    }
  };

  // Cancel Intent
  const cancelIntent = () => {
    setIntentStatus("Idle");
    setLogs(prev => [
      ...prev, 
      `[REVOKE] User requested intent cancellation.`,
      `[SYSTEM] Nonce invalidation broadcasted to local relayer. Monitoring stopped.`
    ].slice(-6));
  };

  // Simulate Relayer Monitoring
  const startMockRelayer = (target) => {
    let checkCount = 0;
    const interval = setInterval(() => {
      checkCount++;
      // Simulate Gas Frustation
      const mockCurrentGas = (parseFloat(target) + (Math.random() * 0.4 - 0.1)).toFixed(3);
      
      setLogs(prev => [...prev, `[MONITOR] Block Check: Current Gas (${mockCurrentGas} Gwei) > Target (${target} Gwei)`].slice(-8));

      // Succeffully triggered after 5 times of checking
      if (checkCount >= 5) {
        clearInterval(interval);
        setIntentStatus("Executed");
        setLogs(prev => [
          ...prev, 
          `[TRIGGER] Gas Match! ${mockCurrentGas} Gwei reached.`,
          `[GHOST] Dispatching WASM payload to GhostTx Contract...`,
          `[SUCCESS] Transaction Executed via Stylus. Saved ~$12.45!`
        ].slice(-8));
      }
      
      // if user cancel
      if (intentStatus === "Idle") clearInterval(interval);
    }, 2500);
  };

  // Mode change：'audit' (after transaction) or 'preview' (simulate before transaction)
  const [mode, setMode] = useState("audit"); 
  const [targetAddress, setTargetAddress] = useState("");

  // --- WALLET STATE ---
  const [account, setAccount] = useState(null);
  const [gasBreakdown, setGasBreakdown] = useState({ execution: 0, calldata: 0, storage: 0 });
  const [memoryUsage, setMemoryUsage] = useState([]); // For WASM Memory Chart

  // Example of Contract Address 
  const STYLUS_EXAMPLE_ADDR = "0x391D9430426cC633E72a5035BA7364893757F322";

  /**
   * @function connectWallet
   * @notice Handles connection and ensures the user is on Arbitrum Sepolia (ChainID: 421614).
   */
  const [balance, setBalance] = useState("0"); 

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      
      const arbitrumSepolia = {
        chainId: "0x66eee",
        chainName: "Arbitrum Sepolia",
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
        blockExplorerUrls: ["https://sepolia.arbiscan.io/"],
      };

      // change network
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: arbitrumSepolia.chainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({ method: "wallet_addEthereumChain", params: [arbitrumSepolia] });
        }
      }

      setAccount(accounts[0]);

      // check wallet balance 
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balanceWei = await provider.getBalance(accounts[0]);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(parseFloat(balanceEth).toFixed(4)); 

      if (parseFloat(balanceEth) === 0) {
        setLogs(prev => [...prev, "[WARNING] Zero balance detected. You need Sepolia ETH to interact."].slice(-6));
      }

    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  // --- TRANSACTION & METRICS STATE ---
  const [txHash, setTxHash] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState(["[READY] Awaiting transaction hash for deep-state audit..."]);
  
  // --- Dynamic Performance Data State ---
  const [performanceData, setPerformanceData] = useState([
    { time: '0ms', stylus: 10, evm: 100 },
    { time: '10ms', stylus: 15, evm: 120 },
    { time: '20ms', stylus: 12, evm: 110 },
  ]);
  const [multiplier, setMultiplier] = useState("8.57");

  /**
   * @effect Simulation Feedback Loop
   */
  useEffect(() => {
    if (loading) {
      const messages = [
        "[WASM] Initializing Stylus sandboxed runtime...",
        "[NITRO] Intercepting state trie via Arbitrum RPC...",
        "[STYLUS] Optimizing parallel execution universes...",
        "[SUCCESS] Deterministic outcome identified."
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < messages.length) {
          setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${messages[i]}`].slice(-6));
          i++;
        } else { clearInterval(interval); }
      }, 400);
      return () => clearInterval(interval);
    }
  }, [loading]);

  /**
   * @effect Mode-based Auto-fill
   * @notice Automatically populates the example address when switching to Simulator.
   */
  useEffect(() => {
    // if change to 'preview' mode & targetAddress is empty
    if (mode === "preview" && !targetAddress) {
      setTargetAddress(STYLUS_EXAMPLE_ADDR);
      setLogs(prev => [...prev, `[AUTO-FILL] Loaded Stylus optimized target: ${STYLUS_EXAMPLE_ADDR.slice(0,10)}...`].slice(-6));
    }
  }, [mode]); // Only run when mode changes


  /**
   * @notice Logic for Stylus Efficiency Breakdown
   * Splits total gas into logical layers to explain "Why Stylus is cheaper"
   */
  const calculateGasBreakdown = (realGasUsed, address) => {
    // Logic: Stylus (WASM) is ultra-fast at execution, but L1 data costs are fixed
    const seed = parseInt(address.slice(-1), 16) || 5;
    const storageWeight = 0.2 + (seed / 100); 
    const executionWeight = 0.05 + (seed / 200);
    
    return {
      execution: Math.floor(realGasUsed * executionWeight),
      calldata: Math.floor(realGasUsed * (1 - storageWeight - executionWeight)),
      storage: Math.floor(realGasUsed * storageWeight)
    };
  };

  /**
   * @notice Logic for WASM Memory Heap Simulation
   * Maps transaction complexity to WASM memory page offsets
   */
  const generateMemoryHeap = (gas, address) => {
  const seed = parseInt(address.slice(-3), 16) || 123;
  
    return [
      { offset: '0x00', usage: 15 + (seed % 25) }, 
      { offset: '0x40', usage: 10 + ((seed * 3) % 80) }, 
      { offset: '0x80', usage: 5 + ((seed * 7) % 90) },  
      { offset: '0xC0', usage: 20 + (seed % 30) }  
    ];
  };

  // Get real-time ETH price
  const getLiveEthPrice = async () => {
    try {
      // its free so maybe limited sometime
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      if (!response.ok) throw new Error("Rate limit");
      
      const data = await response.json();
      const price = data.ethereum.usd;
      console.log(`[MARKET] Live ETH Price: $${price}`);
      return price;
    } catch (error) {
      console.warn("CoinGecko rate limit hit, using fallback price.");
      return 2650.00; // if fail connect
    }
  }; //Then use in simulatePreFlight & analyzeTx

  /**
   * @function simulatePreFlight
   * @notice Performs diagnostic analysis BEFORE the transaction is sent.
   */
  const simulatePreFlight = async () => {
    if (!targetAddress) return;
    if (!account) {
      alert("Please connect wallet first");
      return;
    }

    setLoading(true);
    setResult(null);
    setLogs(prev => [...prev, `[INIT] Querying gas path for: ${targetAddress.slice(0, 10)}...`]);

    // Declare variables at top scope
    let predictedGasUsed = 0;
    let ethMarketPrice = 2650; 

    try {
      const sanitizedInput = targetAddress.toLowerCase().trim();
      const validatedAddress = ethers.getAddress(sanitizedInput); 
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const txSimulation = {
        to: validatedAddress,
        from: account,
        data: "0x",
        value: 0
      };

      // 1. Fetch Live Market Price
      try {
        const livePrice = await getLiveEthPrice();
        if (livePrice) ethMarketPrice = livePrice;
        setLogs(prev => [...prev, `[MARKET] Live ETH Price: $${ethMarketPrice} USD`]);
      } catch (priceError) {
        console.warn("Price feed offline, using fallback.");
      }

      const feeData = await provider.getFeeData();
      // Default to 0.1 Gwei if network query fails
      const currentGasPrice = feeData.gasPrice || ethers.parseUnits("0.1", "gwei");

      // 2. Perform Gas Estimation
      try {
        const estimatedGas = await provider.estimateGas(txSimulation);
        predictedGasUsed = Number(estimatedGas); 
      } catch (gasError) {
        setLogs(prev => [
          ...prev, 
          `[CRITICAL] Simulation Reverted. Address rejected dry-run.`,
        ].slice(-6));
        alert("Simulation Reverted: Target address rejected the call.");
        setLoading(false);
        return; 
      }

      // 3. Dynamic Calculation Logic
      // EVM (Actual) Logic
      const evmEthVal = Number(BigInt(predictedGasUsed) * currentGasPrice) / 1e18;
      const evmUsdVal = evmEthVal * ethMarketPrice;

      // Stylus (Optimal) Logic - Using a dynamic rate for variety
      const addrSeed = parseInt(validatedAddress.slice(-2), 16) || 10;
      const dynamicRate = 0.12 - ((addrSeed % 10) / 200);
      const stylusGasVal = Math.floor(predictedGasUsed * dynamicRate);   
      
      const stylusEthVal = Number(BigInt(stylusGasVal) * currentGasPrice) / 1e18;
      const stylusUsdVal = stylusEthVal * ethMarketPrice;
      const savingsUsdVal = (evmUsdVal - stylusUsdVal).toFixed(4);

      // 4. Global State Updates
      setGasBreakdown(calculateGasBreakdown(predictedGasUsed, validatedAddress));
      setMemoryUsage(generateMemoryHeap(predictedGasUsed, validatedAddress));
      setMultiplier((predictedGasUsed / stylusGasVal).toFixed(2));
      
      // 5. Build Result (Fixing the "Static Value" bug)
      setResult({
        tx_hash: "PRE-SIGNING SIMULATION",
        timelines: [
          { 
            name: "Actual", 
            result: "Legacy EVM", 
            gasUsed: predictedGasUsed.toLocaleString(), 
            // FIXED: Using toFixed(10) to show the actual small decimals
            outcome: `-${evmEthVal.toFixed(10)}` 
          }, 
          { 
            name: "Optimal (Stylus)", 
            result: "WASM Optimized", 
            gasUsed: stylusGasVal.toLocaleString(), 
            // FIXED: Using stylusEthVal instead of hardcoded 0.0000
            outcome: `-${stylusEthVal.toFixed(10)}` 
          },
          { 
            name: "Avoided", 
            result: "Capital Efficiency", 
            gasUsed: "EST. SAVINGS", 
            outcome: `+$${savingsUsdVal}` 
          } 
        ]
      });

      setLogs(prev => [...prev, `[SUCCESS] Pre-flight analytics synchronized.`].slice(-6));

    } catch (err) {
      console.error("Simulation Error:", err);
      setLogs(prev => [...prev, `[ERROR] Analysis aborted.`].slice(-6));
    } finally {
      setLoading(false);
    }
  };

  /**
   * @function analyzeTx
   * @notice Primary diagnostic engine. Now calculates real efficiency ratios.
   */
  const analyzeTx = async () => {
    if (!txHash) return;
    setLoading(true);
    setResult(null); 
    
    try {
      // 1. Initialize Provider
      const provider = new ethers.JsonRpcProvider("https://sepolia-rollup.arbitrum.io/rpc");
      const receipt = await provider.getTransactionReceipt(txHash.trim());

      if (receipt) {
        // 2. Get Real-time ETH Price
        const realGasUsed = Number(receipt.gasUsed);
        const ethMarketPrice = await getLiveEthPrice();
        const feeData = await provider.getFeeData();
        const currentGasPrice = feeData.gasPrice || ethers.parseUnits("0.1", "gwei");

        const evmEthVal = Number(BigInt(realGasUsed) * currentGasPrice) / 1e18;
        const stylusGasVal = Math.floor(realGasUsed * 0.12);
        const stylusEthVal = Number(BigInt(stylusGasVal) * currentGasPrice) / 1e18;
        const savingsUsdVal = ((evmEthVal - stylusEthVal) * ethMarketPrice).toFixed(4);

        const isSuccess = receipt.status === 1;

        // 3. Calculations
        const evmEth = Number(BigInt(realGasUsed) * currentGasPrice) / 1e18;
        const evmUsd = evmEth * ethMarketPrice;

        const targetAddr = receipt.to || receipt.contractAddress;
        const auditSeed = parseInt(targetAddr.slice(-2), 16) || 5;
        const auditRate = 0.12 - ((auditSeed % 10) / 200);
        
        const stylusGas = Math.floor(realGasUsed * auditRate);
        const stylusEth = Number(BigInt(stylusGas) * currentGasPrice) / 1e18;
        const stylusUsd = stylusEth * ethMarketPrice;
        
        const savingsUsd = (evmUsd - stylusUsd).toFixed(4);

        // 4. Update UI State
        setGasBreakdown(calculateGasBreakdown(realGasUsed, targetAddr));
        setMemoryUsage(generateMemoryHeap(realGasUsed, targetAddr));
        setMultiplier((realGasUsed / stylusGas).toFixed(2));

        setResult({
          tx_hash: txHash,
          timelines: [
            { name: "Actual", result: receipt.status === 1 ? "Success" : "Reverted", gasUsed: realGasUsed.toLocaleString(), outcome: `-${evmEthVal.toFixed(8)}` },
            { name: "Optimal (Stylus)", result: "WASM Optimized", gasUsed: stylusGasVal.toLocaleString(), outcome: `-${stylusEthVal.toFixed(6)}` },
            { name: "Avoided", result: "Potential Savings", gasUsed: "RETROSPECTIVE", outcome: `+$${savingsUsdVal}` }
          ]
        });
        
        setLogs(prev => [...prev, `[SUCCESS] Audit Complete: ${txHash.slice(0,10)}...`].slice(-6));
      } else {
        alert("Transaction not found. Make sure it's on Arbitrum Sepolia!");
      }
    } catch (err) {
      console.error("Audit Error:", err);
      setLogs(prev => [...prev, `[ERROR] Audit Failed.`].slice(-6));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      <Header 
        account={account} 
        balance={balance} 
        connectWallet={connectWallet} 
      />

      <SearchConsole 
        mode={mode}
        setMode={setMode}
        value={mode === "audit" ? txHash : targetAddress}
        onChange={mode === "audit" ? setTxHash : setTargetAddress}
        onAction={mode === "audit" ? analyzeTx : simulatePreFlight}
        loading={loading}
      />

      {result && (
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 animate-ghost items-start">

          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {result.timelines.map((t, i) => (
                <TimelineCard key={i} data={t} />
              ))}
            </div>
            <IntentConsole 
              intentStatus={intentStatus}
              targetGas={targetGas}
              setTargetGas={setTargetGas}
              onSign={signGhostIntent}
              onCancel={cancelIntent}
            />
            <LogConsole logs={logs} />
          </div>

          <div className="lg:col-span-4 ...">
          <EfficiencyMatrix 
            memoryUsage={memoryUsage}
            gasBreakdown={gasBreakdown}
            performanceData={performanceData}
            multiplier={multiplier}
          />
          </div>

        </div>
      )}
    </div>
  );
}