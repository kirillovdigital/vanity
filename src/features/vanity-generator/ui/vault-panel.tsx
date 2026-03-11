import { getNetworkDefinition } from "@entities/network/model/networks";
import type { VaultRecord } from "@features/vault/lib/store";
import { getSecretLabel } from "../lib/format";

type VaultPanelProps = {
  records: VaultRecord[];
  passphrase: string;
  revealedSecrets: Record<string, string>;
  onPassphraseChange: (value: string) => void;
  onReveal: (record: VaultRecord) => void;
  onRemove: (id: string) => void;
  onCopy: (text: string, label: string) => void;
};

export function VaultPanel({
  records,
  passphrase,
  revealedSecrets,
  onPassphraseChange,
  onReveal,
  onRemove,
  onCopy,
}: VaultPanelProps) {
  return (
    <div className="vault-panel">
      <div className="vault-panel__toolbar">
        <label className="field">
          <span>Vault passphrase</span>
          <input
            className="ui-input"
            type="password"
            value={passphrase}
            placeholder="Used for AES-GCM encryption and reveal"
            onChange={(event) => onPassphraseChange(event.target.value)}
          />
        </label>
      </div>

      {records.length === 0 ? (
        <div className="empty-state">
          Vault is empty. Generated wallets are ephemeral until you save them.
        </div>
      ) : (
        <div className="vault-list">
          {records.map((record) => {
            const network = getNetworkDefinition(record.chainId);
            const revealedSecret = revealedSecrets[record.id];

            return (
              <article key={record.id} className="vault-item">
                <div className="vault-item__meta">
                  <span>{network.label}</span>
                  <span>{new Date(record.createdAt).toLocaleString()}</span>
                </div>

                <div className="result-item__field">
                  <span>Address</span>
                  <code>{record.address}</code>
                </div>

                <div className="result-item__field">
                  <span>{getSecretLabel(record.chainId)}</span>
                  <code>
                    {revealedSecret ??
                      "Encrypted. Reveal with your passphrase."}
                  </code>
                </div>

                <div className="result-item__actions">
                  <button
                    type="button"
                    className="text-action"
                    onClick={() => onReveal(record)}
                  >
                    Reveal secret
                  </button>
                  {revealedSecret ? (
                    <button
                      type="button"
                      className="text-action"
                      onClick={() =>
                        onCopy(revealedSecret, getSecretLabel(record.chainId))
                      }
                    >
                      Copy secret
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="text-action text-action--danger"
                    onClick={() => onRemove(record.id)}
                  >
                    Delete
                  </button>
                  <a
                    className="text-action"
                    href={record.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in {network.explorerLabel}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
