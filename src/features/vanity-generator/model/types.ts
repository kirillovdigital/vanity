import type {
  BitcoinAddressType,
  ChainFamily,
  ChainId,
  SecretFormat,
} from "@entities/network/model/types";

export type GeneratorStatus =
  | "idle"
  | "running"
  | "found"
  | "stopped"
  | "error";

export type VanityJob = {
  chainFamily: ChainFamily;
  chainId: ChainId;
  prefix: string;
  suffix: string;
  threads: number;
  batchSize: number;
  checksumMode?: boolean;
  bitcoinAddressType?: BitcoinAddressType;
};

export type VanityResult = {
  id: string;
  chainFamily: ChainFamily;
  chainId: ChainId;
  address: string;
  secret: string;
  secretFormat: SecretFormat;
  explorerUrl: string;
  attempts: number;
  elapsedMs: number;
  addressType?: BitcoinAddressType;
};

export type WorkerStartMessage = {
  type: "start";
  job: VanityJob;
};

export type WorkerStopMessage = {
  type: "stop";
};

export type WorkerInputMessage = WorkerStartMessage | WorkerStopMessage;

export type WorkerProgressMessage = {
  type: "progress";
  attempts: number;
};

export type WorkerFoundMessage = {
  type: "found";
  address: string;
  secret: string;
  attempts: number;
};

export type WorkerStoppedMessage = {
  type: "stopped";
};

export type WorkerErrorMessage = {
  type: "error";
  error: string;
};

export type WorkerOutputMessage =
  | WorkerProgressMessage
  | WorkerFoundMessage
  | WorkerStoppedMessage
  | WorkerErrorMessage;

export type SearchMetrics = {
  attempts: number;
  speed: number;
  elapsedMs: number;
};
