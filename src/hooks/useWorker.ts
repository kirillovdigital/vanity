import { useEffect, useRef, useCallback } from "react";
import { computeDifficulty, computeProbability } from "../utils/utils";
import { Context } from "../lib/context";
import { BLOCKCHAIN } from "../lib/constants";

interface WorkerData {
  error?: string;
  address?: string;
  privKey?: string;
  attempts?: number;
}

export default function useWorker() {
  const {
    selectedBlockchain,
    prefix,
    suffix,
    threads,
    running,
    setRunning,
    count,
    setCount,
    setSpeed,
    setStatus,
    isChecksum,
    startTime,
    setStartTime,
    setProbability,
    setDifficulty,
    setWallets,
  } = Context();

  const newDifficulty = computeDifficulty(prefix, suffix, isChecksum);
  const newProbability =
    Math.round(10000 * computeProbability(newDifficulty, count)) / 100;

  useEffect(() => {
    setProbability(newProbability);
    setDifficulty(newDifficulty);
  }, [newProbability, newDifficulty, setProbability, setDifficulty]);

  const workersRef = useRef<Worker[]>([]);

  const handleWorkerMessage = useCallback(
    ({ data }: { data: WorkerData }) => {
      const { error, address, privKey, attempts } = data;

      if (error) {
        console.error(error);
        setStatus("ERROR");
        setRunning(false);
      } else if (address) {
        setRunning(false);
        setStatus("DONE");
        setWallets((prevWallets) => [
          ...prevWallets,
          {
            blockchain: selectedBlockchain,
            address,
            privateKey: privKey || "",
          },
        ]);
      } else if (attempts) {
        const now = performance.now();
        const elapsedTime = now - startTime;
        if (elapsedTime > 0) {
          setCount((prevCount) => {
            const newCount = prevCount + attempts;
            setSpeed(Math.round((newCount * 1000) / elapsedTime));
            return newCount;
          });
        }
      }
    },
    [
      setCount,
      setRunning,
      setSpeed,
      setStatus,
      startTime,
      setWallets,
      selectedBlockchain,
    ]
  );

  const createWorker = useCallback(
    (handleWorkerMsg: any) => {
      const blockchain =
        BLOCKCHAIN[selectedBlockchain as keyof typeof BLOCKCHAIN];

      const worker = new Worker(blockchain.worker);
      worker.onmessage = handleWorkerMsg;
      worker.postMessage({ prefix, suffix, checksum: isChecksum });
      return worker;
    },
    [selectedBlockchain, prefix, suffix, isChecksum]
  );

  useEffect(() => {
    const initializeWorkers = async () => {
      if (running) {
        await Promise.all(
          workersRef.current.map((worker) => worker.terminate())
        );
        workersRef.current = Array.from({ length: threads }, () =>
          createWorker(handleWorkerMessage)
        );
      }
    };

    initializeWorkers();

    return () => workersRef.current.forEach((worker) => worker.terminate());
  }, [running, threads, createWorker, handleWorkerMessage]);

  const handleGenerateAddresses = () => {
    setRunning(true);
    setCount(0);
    setSpeed(0);
    setStatus("RUNNING");
    setStartTime(performance.now());
  };

  const stopGenerating = () => setRunning(false);

  return {
    handleGenerateAddresses,
    stopGenerating,
  };
}
