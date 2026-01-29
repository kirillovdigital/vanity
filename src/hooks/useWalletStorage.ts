import { useEffect } from "react";
import { Context } from "../lib/context";
import CryptoJS from "crypto-js";
import { useAccount } from "wagmi";

export const useWalletStorage = () => {
  const { wallets, setWallets } = Context();
  const { isConnected, address } = useAccount();
  const storageKey = (walletAddress: string) => `wallet_${walletAddress}`;
  const encryptionKey = address!;

  useEffect(() => {
    if (isConnected && address) {
      const savedWallets = localStorage.getItem(storageKey(address));
      if (savedWallets) {
        try {
          const decryptedWallets = CryptoJS.AES.decrypt(
            savedWallets,
            encryptionKey
          ).toString(CryptoJS.enc.Utf8);
          const parsedWallets = JSON.parse(decryptedWallets);
          if (parsedWallets && parsedWallets.length > 0) {
            setWallets(parsedWallets);
          } else {
            setWallets([]);
          }
        } catch (error) {
          console.error("Failed to decrypt wallets:", error);
          setWallets([]);
        }
      } else {
        setWallets([]);
      }
    } else {
      setWallets([]);
    }
  }, [isConnected, address, setWallets, encryptionKey]);

  useEffect(() => {
    if (wallets.length > 0 && address) {
      const encryptedWallets = CryptoJS.AES.encrypt(
        JSON.stringify(wallets),
        encryptionKey
      ).toString();
      localStorage.setItem(storageKey(address), encryptedWallets);
    }
  }, [wallets, address, encryptionKey]);

  const clearWallets = () => {
    if (address) {
      localStorage.removeItem(storageKey(address));
      setWallets([]);
    }
  };

  const removeWalletByIndex = (index: number) => {
    if (index >= 0 && index < wallets.length) {
      const updatedWallets = [...wallets];
      updatedWallets.splice(index, 1);
      setWallets(updatedWallets);
    }
  };

  return { clearWallets, removeWalletByIndex };
};
