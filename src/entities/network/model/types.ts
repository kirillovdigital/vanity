export type ChainFamily = "evm" | "solana" | "bitcoin" | "ton" | "substrate";

export type ChainId = "evm" | "solana" | "bitcoin" | "ton" | "polkadot";

export type WalletNamespace =
  | "eip155"
  | "solana"
  | "bip122"
  | "ton"
  | "polkadot";

export type BitcoinAddressType = "taproot" | "segwit";

export type TonAddressFormat = "bounceable-mainnet";

export type SubstrateKeyType = "sr25519";

export type SearchAlphabet = "hex" | "base58" | "bech32-body" | "base64url";

export type SearchTarget = "full-address" | "body-after-prefix";

export type SecretFormat =
  | "hex-private-key"
  | "base58-secret-key"
  | "wif"
  | "hex-seed";

export type AppKitNetworkConfig =
  | AppKitNetwork
  | CustomCaipNetwork<WalletNamespace>;

export type NetworkDefinition = {
  id: ChainId;
  family: ChainFamily;
  namespace: WalletNamespace;
  label: string;
  badge: string;
  explorerUrl: string;
  explorerLabel: string;
  appKitNetwork: AppKitNetworkConfig;
  alphabet: SearchAlphabet;
  searchTarget: SearchTarget;
  fixedPrefix?: string;
  placeholderPrefix: string;
  placeholderSuffix: string;
  prefixHint: string;
  suffixHint: string;
  secretFormat: SecretFormat;
  supportsChecksum: boolean;
  supportsBitcoinAddressType: boolean;
  defaultBatchSize: number;
};

import type { AppKitNetwork, CustomCaipNetwork } from "@reown/appkit-common";
