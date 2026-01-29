import { http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Vanity",
  projectId: "986cca552f3472159c25ac98b0540896",
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(
      "https://eth-mainnet.g.alchemy.com/v2/axeN3Bp3GCEw_afkGrphL_DiSfGMmNWn"
    ),
  },
  ssr: true,
});
