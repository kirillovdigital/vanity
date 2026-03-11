import { Button } from "@shared/ui/button";
import { lazy, Suspense, useState } from "react";

const WalletPanel = lazy(() => import("./wallet-panel"));

export function WalletLauncher() {
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className="wallet-launcher">
      <Button
        variant="ghost"
        onClick={() => {
          setLoaded(true);
          setOpen((current) => !current);
        }}
      >
        {open ? "Hide Wallet Center" : "Load Wallet Center"}
      </Button>
      {loaded ? (
        <Suspense
          fallback={<div className="notice">Loading wallet center…</div>}
        >
          <div className={open ? "" : "is-hidden"}>
            <WalletPanel />
          </div>
        </Suspense>
      ) : null}
    </div>
  );
}
