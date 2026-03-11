import { getNetworkDefinition } from "@entities/network/model/networks";
import type { ChainId } from "@entities/network/model/types";
import type { VanityResult } from "../model/types";

export function formatAttempts(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value);
}

export function formatDuration(elapsedMs: number) {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export function formatDifficulty(space: number) {
  if (!Number.isFinite(space) || space <= 0) {
    return "n/a";
  }

  if (space >= 1_000_000_000_000) {
    return `${(space / 1_000_000_000_000).toFixed(1)}T`;
  }

  if (space >= 1_000_000_000) {
    return `${(space / 1_000_000_000).toFixed(1)}B`;
  }

  if (space >= 1_000_000) {
    return `${(space / 1_000_000).toFixed(1)}M`;
  }

  if (space >= 1_000) {
    return `${(space / 1_000).toFixed(1)}K`;
  }

  return Math.round(space).toString();
}

export function getSecretLabel(chainId: ChainId) {
  const network = getNetworkDefinition(chainId);

  switch (network.secretFormat) {
    case "hex-private-key":
      return "Private key";
    case "base58-secret-key":
      return "Secret key";
    case "wif":
      return "WIF";
    case "hex-seed":
      return "Seed";
  }
}

export function downloadResultJson(result: VanityResult) {
  const fileName = `${result.chainId}-${result.address.slice(0, 10)}.json`;
  const content = JSON.stringify(result, null, 2);
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}
