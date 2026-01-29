import { Icons } from "../components/ui/icons";

export const BLOCKCHAIN = {
  ethereum: {
    alt: "Ethereum",
    worker: "/workers/ethereum.worker.bundle.js",
    link: "https://etherscan.io/address/",
    icon: Icons.ethereum,
  },
  bsc: {
    alt: "Binance Smart Chain",
    worker: "/workers/bsc.worker.bundle.js",
    link: "https://bscscan.com/address/",
    icon: Icons.bsc,
  },
  polygon: {
    alt: "Polygon",
    worker: "/workers/polygon.worker.bundle.js",
    link: "https://polygonscan.com/address/",
    icon: Icons.polygon,
  },
  avalanche: {
    alt: "Avalanche",
    worker: "/workers/avalanche.worker.bundle.js",
    link: "https://cchain.explorer.avax.network/address/",
    icon: Icons.avalanche,
  },
};

export const SITE = {
  TITLE: "VANITY - the fastest vanity address generator",
  DESCRIPTION:
    "Unleash Style. Generate sleek vanity addresses with a modern twist and make your mark in the digital era.",
  OG_IMAGE: "https://vanity.ac/image/vanity.png",
};

export const HEADER = {
  BLOCKCHAIN: "//1 Choose blockchain",
  PROPERTIES: "//2 Input settings",
  PERFORMANCE: "//3 Enjoy digging",
  WALLETS: "//4 Mined wallets",
};
