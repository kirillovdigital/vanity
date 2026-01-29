import { Icons } from "./ui/icons";
import { ConnectWalletButton } from "./ui/connect-button";

export default function SubHeader() {
  return (
    <header className="subheader">
      <h1 className="subheader__brand custom-text-shadow">VANITY.AC</h1>
      <div className="subheader__meta">
        <a
          href="https://github.com/LaitmanX/vanity"
          className="text-oranges"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icons.github />
        </a>
        <span className="subheader__meta-text">BETA v0.2.0</span>
      </div>
      <nav className="subheader__actions">
        <ConnectWalletButton />
      </nav>
    </header>
  );
}
