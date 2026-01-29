import Header from "./Header";
import SubHeader from "./SubHeader";
import BlockchainSection from "./section-blockchain";
import InputSettingSection from "./section-properties";
import PerformanceSection from "./section-performance";
import WalletsSection from "./section-wallets";
import { ContextProvider } from "../lib/context";
import AppProviders from "./AppProviders";

export default function App() {
  return (
    <ContextProvider>
      <AppProviders>
        <main className="app-shell">
          <Header />
          <SubHeader />
          <section className="section-stack">
            <BlockchainSection />
            <InputSettingSection />
            <PerformanceSection />
            <WalletsSection />
          </section>
        </main>
      </AppProviders>
    </ContextProvider>
  );
}
