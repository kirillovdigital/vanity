/// <reference lib="webworker" />

import type { WorkerFoundMessage, WorkerOutputMessage } from "../model/types";

declare const self: DedicatedWorkerGlobalScope;

export type WasmBatchResult = {
  found: boolean;
  attempts: number;
  address?: string | null;
  secret?: string | null;
};

export function postProgress(attempts: number) {
  const message: WorkerOutputMessage = {
    type: "progress",
    attempts,
  };

  self.postMessage(message);
}

export function postFound(address: string, secret: string, attempts: number) {
  const message: WorkerFoundMessage = {
    type: "found",
    address,
    secret,
    attempts,
  };

  self.postMessage(message);
}

export function postStopped() {
  const message: WorkerOutputMessage = {
    type: "stopped",
  };

  self.postMessage(message);
}

export function postError(error: unknown) {
  const message: WorkerOutputMessage = {
    type: "error",
    error: error instanceof Error ? error.message : String(error),
  };

  self.postMessage(message);
}

export function createBatchRunner(
  searchBatch: () => Promise<WasmBatchResult> | WasmBatchResult,
) {
  let stopped = false;

  const stop = () => {
    stopped = true;
  };

  const run = async () => {
    while (!stopped) {
      const batch = await searchBatch();

      if (batch.found) {
        if (!batch.address || !batch.secret) {
          throw new Error("WASM runtime returned an incomplete vanity result.");
        }

        postFound(batch.address, batch.secret, batch.attempts);
        return;
      }

      if (batch.attempts > 0) {
        postProgress(batch.attempts);
      }
    }

    postStopped();
  };

  return {
    run,
    stop,
  };
}
