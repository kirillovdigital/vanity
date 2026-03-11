export const SITE = {
  name: "Vanity",
  url: "https://vanity.ac",
  title: "Vanity | Multichain vanity generator",
  description:
    "Generate vanity addresses for EVM, Solana, Bitcoin, TON, and Polkadot directly in the browser with dedicated workers.",
  ogImage: "/images/vanity.png",
  repositoryUrl: "https://github.com/kirillovdigital/vanity",
  version: "v0.2.0",
  reownProjectId:
    import.meta.env.PUBLIC_REOWN_PROJECT_ID ??
    import.meta.env.PUBLIC_WALLETCONNECT_PROJECT_ID ??
    "986cca552f3472159c25ac98b0540896",
} as const;
