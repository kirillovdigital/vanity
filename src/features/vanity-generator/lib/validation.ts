import { getNetworkDefinition } from "@entities/network/model/networks";
import type {
  BitcoinAddressType,
  ChainId,
  SearchAlphabet,
} from "@entities/network/model/types";

const BASE58_PATTERN = /^[1-9A-HJ-NP-Za-km-z]*$/;
const HEX_PATTERN = /^[0-9a-fA-F]*$/;
const BECH32_BODY_PATTERN = /^[023456789acdefghjklmnpqrstuvwxyz]*$/;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]*$/;

function getPattern(alphabet: SearchAlphabet) {
  switch (alphabet) {
    case "hex":
      return HEX_PATTERN;
    case "base58":
      return BASE58_PATTERN;
    case "bech32-body":
      return BECH32_BODY_PATTERN;
    case "base64url":
      return BASE64URL_PATTERN;
  }
}

export function normalizeSearchInput(
  chainId: ChainId,
  value: string,
  bitcoinAddressType: BitcoinAddressType,
) {
  const network = getNetworkDefinition(chainId);
  const nextValue = value.trim();

  if (network.family === "bitcoin") {
    return nextValue.toLowerCase().replace(/^bc1[pq]/, "");
  }

  if (network.family === "ton") {
    return nextValue.replace(/^EQ/, "");
  }

  if (network.family === "evm") {
    return nextValue.replace(/^0x/i, "");
  }

  void bitcoinAddressType;

  return nextValue;
}

export function getFixedPrefix(
  chainId: ChainId,
  bitcoinAddressType: BitcoinAddressType,
) {
  const network = getNetworkDefinition(chainId);

  if (network.family === "bitcoin") {
    return bitcoinAddressType === "segwit" ? "bc1q" : "bc1p";
  }

  return network.fixedPrefix ?? "";
}

export function validatePatternInput(
  chainId: ChainId,
  prefix: string,
  suffix: string,
  bitcoinAddressType: BitcoinAddressType,
) {
  const network = getNetworkDefinition(chainId);
  const normalizedPrefix = normalizeSearchInput(
    chainId,
    prefix,
    bitcoinAddressType,
  );
  const normalizedSuffix = normalizeSearchInput(
    chainId,
    suffix,
    bitcoinAddressType,
  );
  const pattern = getPattern(network.alphabet);

  if (!normalizedPrefix && !normalizedSuffix) {
    return "Enter a prefix or suffix to start the search.";
  }

  if (!pattern.test(normalizedPrefix) || !pattern.test(normalizedSuffix)) {
    switch (network.alphabet) {
      case "hex":
        return "Only hex characters are allowed for EVM vanity patterns.";
      case "base58":
        return "Only Base58 characters are allowed for this network.";
      case "bech32-body":
        return "Only lowercase Bech32 body characters are allowed for Bitcoin.";
      case "base64url":
        return "Only URL-safe Base64 characters are allowed for TON.";
    }
  }

  return null;
}

export function estimateSearchSpace(
  chainId: ChainId,
  prefix: string,
  suffix: string,
  checksumMode: boolean,
  bitcoinAddressType: BitcoinAddressType,
) {
  const network = getNetworkDefinition(chainId);
  const normalizedPrefix = normalizeSearchInput(
    chainId,
    prefix,
    bitcoinAddressType,
  );
  const normalizedSuffix = normalizeSearchInput(
    chainId,
    suffix,
    bitcoinAddressType,
  );
  const pattern = normalizedPrefix + normalizedSuffix;

  if (!pattern.length) {
    return 1;
  }

  const alphabetSize =
    network.alphabet === "hex"
      ? 16
      : network.alphabet === "bech32-body"
        ? 32
        : network.alphabet === "base64url"
          ? 64
          : 58;

  let difficulty = alphabetSize ** pattern.length;

  if (network.family === "evm" && checksumMode) {
    const checksumLetters = pattern.replace(/[^a-f]/gi, "").length;
    difficulty *= 2 ** checksumLetters;
  }

  return difficulty;
}
