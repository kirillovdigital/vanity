/// <reference lib="webworker" />

import init, {
  search_bitcoin_batch,
} from "../../../generated/wasm/bitcoin/index.js";
import type { WorkerInputMessage } from "../model/types";
import { createBatchRunner, postError, postStopped } from "./shared";

declare const self: DedicatedWorkerGlobalScope;

let stopCurrentRun: (() => void) | null = null;
let runtimePromise: Promise<void> | null = null;

function ensureRuntime() {
  if (!runtimePromise) {
    runtimePromise = init().then(() => undefined);
  }

  return runtimePromise;
}

self.onmessage = async (event: MessageEvent<WorkerInputMessage>) => {
  try {
    if (event.data.type === "stop") {
      stopCurrentRun?.();
      postStopped();
      return;
    }

    const { job } = event.data;
    await ensureRuntime();

    const runner = createBatchRunner(() =>
      search_bitcoin_batch(
        job.prefix,
        job.suffix,
        job.batchSize,
        job.bitcoinAddressType ?? "taproot",
      ),
    );

    stopCurrentRun = runner.stop;
    await runner.run();
  } catch (error) {
    postError(error);
  }
};
