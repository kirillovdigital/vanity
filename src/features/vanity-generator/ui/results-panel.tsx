import { getNetworkDefinition } from "@entities/network/model/networks";
import { formatAttempts, formatDuration, getSecretLabel } from "../lib/format";
import type { VanityResult } from "../model/types";

type ResultsPanelProps = {
  results: VanityResult[];
  activeResultId: string | null;
  onCopy: (text: string, label: string) => void;
  onExport: (result: VanityResult) => void;
  onSave: (result: VanityResult) => void;
};

export function ResultsPanel({
  results,
  activeResultId,
  onCopy,
  onExport,
  onSave,
}: ResultsPanelProps) {
  if (results.length === 0) {
    return (
      <div className="empty-state">
        Session results stay in memory only. Save to the vault explicitly if you
        want to persist a wallet.
      </div>
    );
  }

  return (
    <div className="result-list">
      {results.map((result) => {
        const network = getNetworkDefinition(result.chainId);

        return (
          <article
            key={result.id}
            className={[
              "result-item",
              activeResultId === result.id ? "is-active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="result-item__meta">
              <span>{network.label}</span>
              <span>{formatAttempts(result.attempts)} tries</span>
              <span>{formatDuration(result.elapsedMs)}</span>
              {result.addressType ? <span>{result.addressType}</span> : null}
            </div>

            <div className="result-item__field">
              <span>Address</span>
              <code>{result.address}</code>
            </div>

            <div className="result-item__field">
              <span>{getSecretLabel(result.chainId)}</span>
              <code>{result.secret}</code>
            </div>

            <div className="result-item__actions">
              <button
                type="button"
                className="text-action"
                onClick={() => onCopy(result.address, "Address")}
              >
                Copy address
              </button>
              <button
                type="button"
                className="text-action"
                onClick={() =>
                  onCopy(result.secret, getSecretLabel(result.chainId))
                }
              >
                Copy secret
              </button>
              <button
                type="button"
                className="text-action"
                onClick={() => onExport(result)}
              >
                Export JSON
              </button>
              <button
                type="button"
                className="text-action"
                onClick={() => onSave(result)}
              >
                Save to vault
              </button>
              <a
                className="text-action"
                href={result.explorerUrl}
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
  );
}
