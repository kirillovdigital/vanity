/// <reference lib="webworker" />

import init, {
  search_substrate_batch,
} from "../../../generated/wasm/substrate/index.js";
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
    const message = event.data;

    if (message.type === "stop") {
      stopCurrentRun?.();
      postStopped();
      return;
    }

    const { job } = message;

    await ensureRuntime();

    const runner = createBatchRunner(() =>
      search_substrate_batch(job.prefix, job.suffix, job.batchSize),
    );

    stopCurrentRun = runner.stop;
    await runner.run();
  } catch (error) {
    postError(error);
  }
};
