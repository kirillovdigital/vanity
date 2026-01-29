import React, { createContext, useContext, useState } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";

interface Wallet {
  blockchain: string;
  address: string;
  privateKey: string;
}

interface BlockchainContextValue {
  selectedBlockchain: string;
  setSelectedBlockchain: Dispatch<SetStateAction<string>>;
  prefix: string;
  setPrefix: Dispatch<SetStateAction<string>>;
  suffix: string;
  setSuffix: Dispatch<SetStateAction<string>>;
  threads: number;
  setThreads: Dispatch<SetStateAction<number>>;
  running: boolean;
  setRunning: Dispatch<SetStateAction<boolean>>;
  count: number;
  setCount: Dispatch<SetStateAction<number>>;
  speed: number;
  setSpeed: Dispatch<SetStateAction<number>>;
  status: string;
  setStatus: Dispatch<SetStateAction<string>>;
  isChecksum: boolean;
  setIsChecksum: Dispatch<SetStateAction<boolean>>;
  startTime: number;
  setStartTime: Dispatch<SetStateAction<number>>;
  difficulty: number;
  setDifficulty: Dispatch<SetStateAction<number>>;
  probability: number;
  setProbability: Dispatch<SetStateAction<number>>;
  wallets: Wallet[];
  setWallets: Dispatch<SetStateAction<Wallet[]>>;
}

const BlockchainContext = createContext<BlockchainContextValue | undefined>(
  undefined
);

interface ContextProviderProps {
  children: ReactNode;
}

export const ContextProvider: React.FC<ContextProviderProps> = ({
  children,
}) => {
  const [selectedBlockchain, setSelectedBlockchain] = useState("ethereum");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [threads, setThreads] = useState(5);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [status, setStatus] = useState("WAITING");
  const [isChecksum, setIsChecksum] = useState(false);
  const [startTime, setStartTime] = useState(performance.now());
  const [difficulty, setDifficulty] = useState(0);
  const [probability, setProbability] = useState(0);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  const contextValue: BlockchainContextValue = {
    selectedBlockchain,
    setSelectedBlockchain,
    prefix,
    setPrefix,
    suffix,
    setSuffix,
    threads,
    setThreads,
    running,
    setRunning,
    count,
    setCount,
    speed,
    setSpeed,
    status,
    setStatus,
    isChecksum,
    setIsChecksum,
    startTime,
    setStartTime,
    difficulty,
    setDifficulty,
    probability,
    setProbability,
    wallets,
    setWallets,
  };

  return (
    <BlockchainContext.Provider value={contextValue}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const Context = (): BlockchainContextValue => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error("useBlockchain must be used within a BlockchainProvider");
  }
  return context;
};
