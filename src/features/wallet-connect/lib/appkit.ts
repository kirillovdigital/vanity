import { SITE } from "@app/config/site";
import { POLKADOT_NETWORK } from "@entities/network/model/networks";
import {
  avalanche,
  bitcoin,
  bsc,
  mainnet,
  polygon,
  solana,
  ton,
} from "@reown/appkit/networks";
import type { CreateAppKit } from "@reown/appkit/react";
import { BitcoinAdapter } from "@reown/appkit-adapter-bitcoin";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";
import { TonAdapter } from "@reown/appkit-adapter-ton";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { http } from "@wagmi/core";

const evmNetworks = [mainnet, bsc, polygon, avalanche] as const;

const wagmiAdapter = new WagmiAdapter({
  projectId: SITE.reownProjectId,
  networks: [...evmNetworks],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
    [avalanche.id]: http(),
  },
});

const solanaAdapter = new SolanaAdapter();
const bitcoinAdapter = new BitcoinAdapter();
const tonAdapter = new TonAdapter();

export const appKitConfig: CreateAppKit = {
  projectId: SITE.reownProjectId,
  metadata: {
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    icons: [`${SITE.url}/favicon.svg`],
  },
  adapters: [wagmiAdapter, solanaAdapter, bitcoinAdapter, tonAdapter],
  networks: [
    mainnet,
    bsc,
    polygon,
    avalanche,
    solana,
    bitcoin,
    ton,
    POLKADOT_NETWORK,
  ],
  defaultNetwork: mainnet,
  defaultAccountTypes: {
    eip155: "eoa",
    solana: "eoa",
    bip122: "payment",
    ton: "eoa",
    polkadot: "eoa",
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#ff8700",
    "--w3m-color-mix": "#0b0d0c",
    "--w3m-color-mix-strength": 25,
  },
  allowUnsupportedChain: true,
};
