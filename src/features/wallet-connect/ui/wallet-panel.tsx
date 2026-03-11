import {
  AppKitAccountButton,
  AppKitButton,
  AppKitProvider,
  useAppKitAccount,
} from "@reown/appkit/react";
import { appKitConfig } from "../lib/appkit";

const NAMESPACES = [
  { key: "eip155", label: "EVM" },
  { key: "solana", label: "Solana" },
  { key: "bip122", label: "Bitcoin" },
  { key: "ton", label: "TON" },
  { key: "polkadot", label: "Polkadot" },
] as const;

function NamespaceAccount({
  namespace,
  label,
}: {
  namespace: (typeof NAMESPACES)[number]["key"];
  label: string;
}) {
  const { address, caipAddress, isConnected } = useAppKitAccount({ namespace });

  if (!isConnected) {
    return (
      <div className="wallet-namespace">
        <span className="wallet-namespace__label">{label}</span>
        <p className="wallet-panel__hint">No active account.</p>
      </div>
    );
  }

  return (
    <div className="wallet-namespace">
      <div className="wallet-namespace__row">
        <span className="wallet-namespace__label">{label}</span>
        <AppKitAccountButton />
      </div>
      <p className="wallet-panel__hint">{address}</p>
      <p className="wallet-panel__hint">{caipAddress}</p>
    </div>
  );
}

export default function WalletPanel() {
  return (
    <AppKitProvider {...appKitConfig}>
      <div className="wallet-panel">
        <div className="wallet-panel__header">
          <div>
            <span className="panel-title">Wallet center</span>
            <p className="wallet-panel__hint">
              AppKit modal with EVM, Solana, Bitcoin, TON and Polkadot namespace
              coverage.
            </p>
          </div>
          <AppKitButton />
        </div>
        <div className="wallet-panel__grid">
          {NAMESPACES.map((entry) => (
            <NamespaceAccount
              key={entry.key}
              namespace={entry.key}
              label={entry.label}
            />
          ))}
        </div>
      </div>
    </AppKitProvider>
  );
}
