import { ConnectButton } from "@rainbow-me/rainbowkit";

export const ConnectWalletButton = () => {
  return (
    <ConnectButton
      label="Connect"
      accountStatus="address"
      chainStatus="none"
      showBalance={false}
    />
  );
};
