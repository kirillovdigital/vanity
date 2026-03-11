import { getNetworkDefinition } from "@entities/network/model/networks";
import type { ChainFamily } from "@entities/network/model/types";
import type {
  SearchMetrics,
  VanityJob,
  VanityResult,
  WorkerFoundMessage,
  WorkerInputMessage,
  WorkerOutputMessage,
} from "../model/types";

type EngineCallbacks = {
  onStatus: (status: string) => void;
  onProgress: (metrics: SearchMetrics) => void;
  onFound: (result: VanityResult) => void;
  onError: (message: string) => void;
};

const WORKERS: Record<ChainFamily, () => URL> = {
  evm: () => new URL("../workers/evm.worker.ts", import.meta.url),
  solana: () => new URL("../workers/solana.worker.ts", import.meta.url),
  bitcoin: () => new URL("../workers/bitcoin.worker.ts", import.meta.url),
  ton: () => new URL("../workers/ton.worker.ts", import.meta.url),
  substrate: () => new URL("../workers/substrate.worker.ts", import.meta.url),
};

function createWorker(family: ChainFamily) {
  return new Worker(WORKERS[family](), { type: "module" });
}

export function runVanityJob(job: VanityJob, callbacks: EngineCallbacks) {
  const threadCount = Math.max(
    1,
    Math.min(job.threads, navigator.hardwareConcurrency || job.threads),
  );
  const network = getNetworkDefinition(job.chainId);
  const workers = Array.from({ length: threadCount }, () =>
    createWorker(job.chainFamily),
  );
  const startedAt = performance.now();
  let attempts = 0;
  let active = true;

  const stop = () => {
    if (!active) {
      return;
    }

    active = false;
    const message: WorkerInputMessage = { type: "stop" };

    workers.forEach((worker) => {
      worker.postMessage(message);
      worker.terminate();
    });
  };

  callbacks.onStatus(
    threadCount > 1
      ? `Running ${threadCount} workers for ${network.label}`
      : `Running 1 worker for ${network.label}`,
  );

  workers.forEach((worker) => {
    worker.onmessage = (event: MessageEvent<WorkerOutputMessage>) => {
      if (!active) {
        return;
      }

      const data = event.data;

      if (data.type === "progress") {
        attempts += data.attempts;
        const elapsedMs = performance.now() - startedAt;
        const speed =
          elapsedMs > 0 ? Math.round((attempts * 1000) / elapsedMs) : 0;

        callbacks.onProgress({
          attempts,
          speed,
          elapsedMs,
        });

        return;
      }

      if (data.type === "found") {
        attempts += data.attempts;

        const payload = data as WorkerFoundMessage;
        const elapsedMs = performance.now() - startedAt;

        callbacks.onFound({
          id: `${payload.address}-${Date.now()}`,
          chainFamily: job.chainFamily,
          chainId: job.chainId,
          address: payload.address,
          secret: payload.secret,
          secretFormat: network.secretFormat,
          explorerUrl: `${network.explorerUrl}${payload.address}`,
          attempts,
          elapsedMs,
          addressType: job.bitcoinAddressType,
        });

        stop();
        return;
      }

      if (data.type === "error") {
        callbacks.onError(data.error);
        stop();
      }
    };

    worker.onerror = (event) => {
      callbacks.onError(event.message || "Worker crashed.");
      stop();
    };

    const message: WorkerInputMessage = { type: "start", job };
    worker.postMessage(message);
  });

  return { stop };
}
