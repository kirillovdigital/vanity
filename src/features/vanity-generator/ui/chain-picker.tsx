import { NETWORK_GROUPS } from "@entities/network/model/networks";
import type { ChainFamily, ChainId } from "@entities/network/model/types";

type ChainPickerProps = {
  value: ChainId;
  disabled?: boolean;
  onChange: (chainId: ChainId) => void;
};

const FAMILY_TITLES: Record<ChainFamily, string> = {
  evm: "EVM",
  solana: "Solana",
  bitcoin: "Bitcoin",
  ton: "TON",
  substrate: "Substrate",
};

export function ChainPicker({
  value,
  disabled = false,
  onChange,
}: ChainPickerProps) {
  return (
    <div className="chain-picker">
      {Object.entries(NETWORK_GROUPS).map(([family, networks]) => (
        <section key={family} className="chain-picker__group">
          <div className="chain-picker__title">
            {FAMILY_TITLES[family as ChainFamily]}
          </div>
          <div className="chain-picker__list">
            {networks.map((network) => (
              <button
                key={network.id}
                type="button"
                className={[
                  "chain-pill",
                  network.id === value ? "is-active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={disabled}
                onClick={() => onChange(network.id)}
              >
                <span>{network.label}</span>
                <span className="chain-pill__badge">{network.badge}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
