import { SITE } from "@app/config/site";
import {
  getNetworkDefinition,
  NETWORK_LIST,
} from "@entities/network/model/networks";
import {
  getVaultRecords,
  removeVaultRecord,
  revealVaultSecret,
  saveVaultRecord,
  type VaultRecord,
} from "@features/vault/lib/store";
import {
  lazy,
  Suspense,
  startTransition,
  useEffect,
  useRef,
  useState,
} from "react";
import { runVanityJob } from "../lib/engine-manager";
import {
  copyText,
  downloadResultJson,
  formatAttempts,
  formatDifficulty,
  formatDuration,
  getSecretLabel,
} from "../lib/format";
import {
  estimateSearchSpace,
  getFixedPrefix,
  normalizeSearchInput,
  validatePatternInput,
} from "../lib/validation";
import type {
  GeneratorStatus,
  SearchMetrics,
  VanityResult,
} from "../model/types";

const WalletPanel = lazy(
  () => import("@features/wallet-connect/ui/wallet-panel"),
);

const DEFAULT_THREADS =
  typeof navigator === "undefined"
    ? 4
    : Math.max(1, Math.min(8, (navigator.hardwareConcurrency || 4) - 1));

const EMPTY_METRICS: SearchMetrics = {
  attempts: 0,
  speed: 0,
  elapsedMs: 0,
};

export function VanityWorkbench() {
  const [chainId, setChainId] =
    useState<(typeof NETWORK_LIST)[number]["id"]>("evm");
  const [bitcoinAddressType, setBitcoinAddressType] = useState<
    "taproot" | "segwit"
  >("taproot");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [threads, setThreads] = useState(DEFAULT_THREADS);
  const [batchSize, setBatchSize] = useState(
    getNetworkDefinition("evm").defaultBatchSize,
  );
  const [checksumMode, setChecksumMode] = useState(false);
  const [status, setStatus] = useState<GeneratorStatus>("idle");
  const [statusMessage, setStatusMessage] = useState(
    "Generator is idle. Choose a network and define a prefix or suffix.",
  );
  const [metrics, setMetrics] = useState<SearchMetrics>(EMPTY_METRICS);
  const [results, setResults] = useState<VanityResult[]>([]);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [vaultPassphrase, setVaultPassphrase] = useState("");
  const [vaultRecords, setVaultRecords] = useState<VaultRecord[]>([]);
  const [revealedSecrets, setRevealedSecrets] = useState<
    Record<string, string>
  >({});
  const [walletCenterOpen, setWalletCenterOpen] = useState(false);
  const [walletCenterLoaded, setWalletCenterLoaded] = useState(false);
  const controllerRef = useRef<{ stop: () => void } | null>(null);

  const network = getNetworkDefinition(chainId);
  const fixedPrefix = getFixedPrefix(chainId, bitcoinAddressType);
  const searchSpace = estimateSearchSpace(
    chainId,
    prefix,
    suffix,
    checksumMode,
    bitcoinAddressType,
  );
  const coverage =
    searchSpace > 0
      ? Math.min(100, Math.round((metrics.attempts / searchSpace) * 100))
      : 0;
  const isRunning = status === "running";

  useEffect(() => {
    setBatchSize(network.defaultBatchSize);

    if (!network.supportsChecksum) {
      setChecksumMode(false);
    }
  }, [network.defaultBatchSize, network.supportsChecksum]);

  useEffect(() => {
    void getVaultRecords().then(setVaultRecords);
  }, []);

  useEffect(() => {
    return () => {
      controllerRef.current?.stop();
    };
  }, []);

  async function handleCopy(text: string, label: string) {
    await copyText(text);
    setNotice(`${label} copied.`);
  }

  async function refreshVault(nextRecords?: VaultRecord[]) {
    if (nextRecords) {
      startTransition(() => {
        setVaultRecords(nextRecords);
      });
      return;
    }

    const records = await getVaultRecords();

    startTransition(() => {
      setVaultRecords(records);
    });
  }

  function stopSearch(nextStatus: GeneratorStatus, message: string) {
    controllerRef.current?.stop();
    controllerRef.current = null;
    setStatus(nextStatus);
    setStatusMessage(message);
  }

  function handleStart() {
    const error = validatePatternInput(
      chainId,
      prefix,
      suffix,
      bitcoinAddressType,
    );

    if (error) {
      setValidationError(error);
      setStatus("error");
      setStatusMessage(error);
      return;
    }

    const normalizedPrefix = normalizeSearchInput(
      chainId,
      prefix,
      bitcoinAddressType,
    );
    const normalizedSuffix = normalizeSearchInput(
      chainId,
      suffix,
      bitcoinAddressType,
    );
    const jobPrefix =
      network.family === "evm" && !checksumMode
        ? normalizedPrefix.toLowerCase()
        : normalizedPrefix;
    const jobSuffix =
      network.family === "evm" && !checksumMode
        ? normalizedSuffix.toLowerCase()
        : normalizedSuffix;

    controllerRef.current?.stop();
    setValidationError(null);
    setNotice(null);
    setMetrics(EMPTY_METRICS);
    setStatus("running");
    setStatusMessage(`Searching on ${network.label}...`);

    controllerRef.current = runVanityJob(
      {
        chainFamily: network.family,
        chainId,
        prefix: jobPrefix,
        suffix: jobSuffix,
        threads: Math.max(1, threads),
        batchSize: Math.max(32, batchSize),
        checksumMode,
        bitcoinAddressType,
      },
      {
        onStatus: (message) => {
          setStatusMessage(message);
        },
        onProgress: (nextMetrics) => {
          setMetrics(nextMetrics);
        },
        onFound: (result) => {
          startTransition(() => {
            setResults((current) => [result, ...current].slice(0, 12));
            setActiveResultId(result.id);
          });

          setMetrics({
            attempts: result.attempts,
            elapsedMs: result.elapsedMs,
            speed:
              result.elapsedMs > 0
                ? Math.round((result.attempts * 1000) / result.elapsedMs)
                : 0,
          });
          setStatus("found");
          setStatusMessage(`Match found on ${network.label}.`);
          controllerRef.current = null;
        },
        onError: (message) => {
          setStatus("error");
          setStatusMessage(message);
          setValidationError(message);
          controllerRef.current = null;
        },
      },
    );
  }

  async function handleSaveToVault(result: VanityResult) {
    if (!vaultPassphrase.trim()) {
      setNotice("Enter a vault passphrase before saving.");
      return;
    }

    const nextRecords = await saveVaultRecord(
      {
        id: result.id,
        createdAt: new Date().toISOString(),
        chainFamily: result.chainFamily,
        chainId: result.chainId,
        address: result.address,
        secret: result.secret,
        secretFormat: result.secretFormat,
        explorerUrl: result.explorerUrl,
        metadata: {
          addressType: result.addressType,
        },
      },
      vaultPassphrase,
    );

    await refreshVault(nextRecords);
    setNotice("Wallet saved to vault.");
  }

  async function handleReveal(record: VaultRecord) {
    if (!vaultPassphrase.trim()) {
      setNotice("Enter the vault passphrase to reveal a secret.");
      return;
    }

    try {
      const secret = await revealVaultSecret(record, vaultPassphrase);

      setRevealedSecrets((current) => ({
        ...current,
        [record.id]: secret,
      }));
      setNotice("Vault secret revealed locally.");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Failed to decrypt vault secret.",
      );
    }
  }

  async function handleRemoveVaultRecord(id: string) {
    const nextRecords = await removeVaultRecord(id);

    setRevealedSecrets((current) => {
      const nextSecrets = { ...current };
      delete nextSecrets[id];
      return nextSecrets;
    });

    await refreshVault(nextRecords);
    setNotice("Vault record removed.");
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <h1 className="hero__title">THE FASTEST VANITY ADDRESS GENERATOR</h1>
        <p className="hero__subtitle">
          Generate vanity addresses locally with a Rust/WASM core across EVM,
          Solana, Bitcoin, TON and Polkadot.
        </p>
        <div className="hero__stats">
          <div className="hero__stat">
            <p className="hero__stat-value">WASM</p>
            <p className="hero__stat-label">RUST CORE</p>
          </div>
          <div className="hero__stat">
            <p className="hero__stat-value">{NETWORK_LIST.length}+</p>
            <p className="hero__stat-label">BLOCKCHAINS</p>
          </div>
          <div className="hero__stat">
            <p className="hero__stat-value">LOCAL</p>
            <p className="hero__stat-label">IN BROWSER</p>
          </div>
          <img
            className="hero__image"
            src="/images/dog.gif"
            alt="Dog animation demonstrating happiness"
            width={150}
            height={150}
          />
        </div>
      </header>

      <header className="subheader">
        <h2 className="subheader__brand custom-text-shadow">VANITY.AC</h2>
        <div className="subheader__meta">
          <a
            href={SITE.repositoryUrl}
            className="text-oranges"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <span className="subheader__meta-text">
            {SITE.version} / MULTICHAIN
          </span>
        </div>
        <nav className="subheader__actions">
          <button
            type="button"
            className="button"
            onClick={() => {
              setWalletCenterLoaded(true);
              setWalletCenterOpen((current) => !current);
            }}
          >
            {walletCenterOpen ? "HIDE WALLET CENTER" : "LOAD WALLET CENTER"}
          </button>
        </nav>
      </header>

      <section className="section-stack">
        {walletCenterLoaded && walletCenterOpen ? (
          <section className="card">
            <div className="card__header">WALLET CENTER</div>
            <div className="card__content">
              <Suspense
                fallback={<div className="notice">Loading wallet center…</div>}
              >
                <WalletPanel />
              </Suspense>
            </div>
          </section>
        ) : null}

        <section className="card">
          <div className="card__header">BLOCKCHAIN</div>
          <div className="card__content">
            <div className="form-row">
              {NETWORK_LIST.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className="button"
                  disabled={entry.id === chainId || isRunning}
                  onClick={() => {
                    setChainId(entry.id);
                    setValidationError(null);
                    setNotice(null);
                  }}
                >
                  {entry.label.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="helper-text">
              Active target: {network.label}. Search alphabet:{" "}
              {network.alphabet.replace("-", " ")}.
            </p>
          </div>
        </section>

        <section className="card">
          <div className="card__header">PROPERTIES</div>
          <div className="card__content">
            <div className="form-row">
              <input
                className="input"
                placeholder={network.placeholderPrefix.toUpperCase()}
                value={prefix}
                disabled={isRunning}
                onChange={(event) => setPrefix(event.target.value)}
              />
              <input
                className="input"
                placeholder={network.placeholderSuffix.toUpperCase()}
                value={suffix}
                disabled={isRunning}
                onChange={(event) => setSuffix(event.target.value)}
              />
            </div>

            <div className="form-row form-row--secondary">
              <div className="readonly-field">
                <span className="readonly-field__label">FIXED PREFIX</span>
                <span className="readonly-field__value">
                  {fixedPrefix || "NONE"}
                </span>
              </div>
              <input
                className="input input--compact"
                type="number"
                min={32}
                max={8192}
                value={batchSize}
                disabled={isRunning}
                onChange={(event) =>
                  setBatchSize(Math.max(32, Number(event.target.value) || 32))
                }
              />
            </div>
            <p className="helper-text">
              {network.searchTarget === "body-after-prefix"
                ? `Matching starts after the fixed ${fixedPrefix} prefix.`
                : network.prefixHint}
            </p>

            <div className="settings-row">
              <div className="thread-control">
                <button
                  type="button"
                  className="button button--icon"
                  onClick={() =>
                    setThreads((current) => Math.max(1, current - 1))
                  }
                  disabled={isRunning || threads <= 1}
                  aria-label="Decrease worker count"
                >
                  -
                </button>
                <div className="thread-count">
                  <div className="thread-count__value">{threads}</div>
                  <div className="thread-count__label">Threads</div>
                </div>
                <button
                  type="button"
                  className="button button--icon"
                  onClick={() =>
                    setThreads((current) => Math.min(32, current + 1))
                  }
                  disabled={isRunning}
                  aria-label="Increase worker count"
                >
                  +
                </button>
              </div>

              {network.supportsBitcoinAddressType ? (
                <div className="toggle-group">
                  <button
                    type="button"
                    className={[
                      "button",
                      bitcoinAddressType === "taproot" ? "button--active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={isRunning}
                    onClick={() => setBitcoinAddressType("taproot")}
                  >
                    TAPROOT
                  </button>
                  <button
                    type="button"
                    className={[
                      "button",
                      bitcoinAddressType === "segwit" ? "button--active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={isRunning}
                    onClick={() => setBitcoinAddressType("segwit")}
                  >
                    SEGWIT
                  </button>
                </div>
              ) : null}

              <div className="toggle-row">
                <button
                  type="button"
                  className={["switch", checksumMode ? "is-checked" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={!network.supportsChecksum || isRunning}
                  onClick={() => setChecksumMode((current) => !current)}
                  aria-pressed={checksumMode}
                  aria-label="Toggle case-sensitive matching"
                >
                  <span className="switch__thumb" />
                </button>
                <span>CASE-SENSITIVE</span>
              </div>

              <div className="action-buttons">
                <button
                  type="button"
                  className="button"
                  disabled={isRunning}
                  onClick={handleStart}
                >
                  GENERATE
                </button>
                <button
                  type="button"
                  className="button"
                  disabled={!isRunning}
                  onClick={() =>
                    stopSearch("stopped", "Search stopped by the user.")
                  }
                >
                  STOP
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card__header">
            <span>PERFORMANCE</span>
            <span className="text-link">⦿ {status.toUpperCase()}</span>
          </div>
          <div className="card__content">
            <div className="stats-row">
              <span>Difficulty: {formatDifficulty(searchSpace)}</span>
              <span>Generated: {formatAttempts(metrics.attempts)} tries</span>
              <span>Speed: {formatAttempts(metrics.speed)} addr/s</span>
              <span>Elapsed: {formatDuration(metrics.elapsedMs)}</span>
            </div>
            <div className="stats-row stats-row--progress">
              <span>Probability: {coverage}%</span>
              <div className="progress-wrap">
                <div className="progress">
                  <div
                    className="progress__bar"
                    style={{ width: `${coverage}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="helper-text">{statusMessage}</p>
            {validationError ? (
              <div className="notice notice--danger">{validationError}</div>
            ) : null}
            {notice ? <div className="notice">{notice}</div> : null}
          </div>
        </section>

        <section className="card">
          <div className="card__header">SESSION RESULTS</div>
          <div className="card__content">
            {results.length === 0 ? (
              <div className="notice">
                Session results stay in memory only. Save explicitly to the
                vault if you want persistence.
              </div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <caption>
                    Latest generated matches. Secrets remain client-side until
                    you save them.
                  </caption>
                  <tbody>
                    {results.map((result) => {
                      const resultNetwork = getNetworkDefinition(
                        result.chainId,
                      );

                      return (
                        <tr
                          key={result.id}
                          className={
                            activeResultId === result.id
                              ? "table-row--active"
                              : ""
                          }
                        >
                          <td className="table-cell--compact">
                            <span className="table-badge">
                              {resultNetwork.badge}
                            </span>
                          </td>
                          <td>
                            <div className="table-title">
                              {resultNetwork.label}
                            </div>
                            <code className="table-code">{result.address}</code>
                            <div className="table-meta">
                              {formatAttempts(result.attempts)} tries /{" "}
                              {formatDuration(result.elapsedMs)}
                              {result.addressType
                                ? ` / ${result.addressType}`
                                : ""}
                            </div>
                          </td>
                          <td>
                            <div className="table-title">
                              {getSecretLabel(result.chainId)}
                            </div>
                            <code className="table-code">{result.secret}</code>
                          </td>
                          <td className="table-cell--actions">
                            <div className="table-actions">
                              <button
                                type="button"
                                className="button button--link"
                                onClick={() =>
                                  void handleCopy(result.address, "Address")
                                }
                              >
                                COPY ADDRESS
                              </button>
                              <button
                                type="button"
                                className="button button--link"
                                onClick={() =>
                                  void handleCopy(
                                    result.secret,
                                    getSecretLabel(result.chainId),
                                  )
                                }
                              >
                                COPY SECRET
                              </button>
                              <button
                                type="button"
                                className="button button--link"
                                onClick={() => downloadResultJson(result)}
                              >
                                EXPORT JSON
                              </button>
                              <button
                                type="button"
                                className="button button--link"
                                onClick={() => void handleSaveToVault(result)}
                              >
                                SAVE TO VAULT
                              </button>
                              <a
                                className="button button--link"
                                href={result.explorerUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                OPEN IN{" "}
                                {resultNetwork.explorerLabel.toUpperCase()}
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="card">
          <div className="card__header">VAULT</div>
          <div className="card__content">
            <div className="form-row form-row--vault">
              <input
                className="input"
                type="password"
                value={vaultPassphrase}
                placeholder="VAULT PASSPHRASE"
                onChange={(event) => setVaultPassphrase(event.target.value)}
              />
            </div>
            <p className="helper-text">
              IndexedDB storage encrypted with PBKDF2-derived AES-GCM keys.
            </p>
            {vaultRecords.length === 0 ? (
              <div className="notice">
                Vault is empty. Generated wallets remain ephemeral until saved.
              </div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <caption>
                    Encrypted wallets saved locally in this browser.
                  </caption>
                  <tbody>
                    {vaultRecords.map((record) => {
                      const resultNetwork = getNetworkDefinition(
                        record.chainId,
                      );
                      const revealedSecret = revealedSecrets[record.id];

                      return (
                        <tr key={record.id}>
                          <td className="table-cell--compact">
                            <span className="table-badge">
                              {resultNetwork.badge}
                            </span>
                          </td>
                          <td>
                            <div className="table-title">
                              {resultNetwork.label}
                            </div>
                            <code className="table-code">{record.address}</code>
                            <div className="table-meta">
                              {new Date(record.createdAt).toLocaleString()}
                            </div>
                          </td>
                          <td>
                            <div className="table-title">
                              {getSecretLabel(record.chainId)}
                            </div>
                            <code className="table-code">
                              {revealedSecret ??
                                "Encrypted. Reveal with your passphrase."}
                            </code>
                          </td>
                          <td className="table-cell--actions">
                            <div className="table-actions">
                              <button
                                type="button"
                                className="button button--link"
                                onClick={() => void handleReveal(record)}
                              >
                                REVEAL
                              </button>
                              {revealedSecret ? (
                                <button
                                  type="button"
                                  className="button button--link"
                                  onClick={() =>
                                    void handleCopy(
                                      revealedSecret,
                                      getSecretLabel(record.chainId),
                                    )
                                  }
                                >
                                  COPY SECRET
                                </button>
                              ) : null}
                              <button
                                type="button"
                                className="button button--link button--danger"
                                onClick={() =>
                                  void handleRemoveVaultRecord(record.id)
                                }
                              >
                                DELETE
                              </button>
                              <a
                                className="button button--link"
                                href={record.explorerUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                OPEN IN{" "}
                                {resultNetwork.explorerLabel.toUpperCase()}
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
