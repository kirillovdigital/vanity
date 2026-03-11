import type {
  ChainFamily,
  ChainId,
  SecretFormat,
} from "@entities/network/model/types";
import { get, set } from "idb-keyval";
import { decryptSecret, encryptSecret } from "./crypto";

const VAULT_KEY = "vanity-vault-v2";

export type VaultRecord = {
  id: string;
  createdAt: string;
  chainFamily: ChainFamily;
  chainId: ChainId;
  address: string;
  secretFormat: SecretFormat;
  explorerUrl: string;
  metadata: {
    addressType?: string;
  };
  encrypted: {
    ciphertext: string;
    iv: string;
    salt: string;
  };
};

export type VaultPreview = Omit<VaultRecord, "encrypted">;

export async function getVaultRecords() {
  return (await get<VaultRecord[]>(VAULT_KEY)) ?? [];
}

export async function saveVaultRecord(
  record: Omit<VaultRecord, "encrypted"> & { secret: string },
  passphrase: string,
) {
  const currentRecords = await getVaultRecords();
  const encrypted = await encryptSecret(record.secret, passphrase);
  const nextRecords: VaultRecord[] = [
    {
      id: record.id,
      createdAt: record.createdAt,
      chainFamily: record.chainFamily,
      chainId: record.chainId,
      address: record.address,
      secretFormat: record.secretFormat,
      explorerUrl: record.explorerUrl,
      metadata: record.metadata,
      encrypted,
    },
    ...currentRecords.filter((currentRecord) => currentRecord.id !== record.id),
  ];

  await set(VAULT_KEY, nextRecords);

  return nextRecords;
}

export async function removeVaultRecord(id: string) {
  const currentRecords = await getVaultRecords();
  const nextRecords = currentRecords.filter((record) => record.id !== id);

  await set(VAULT_KEY, nextRecords);

  return nextRecords;
}

export async function revealVaultSecret(
  record: VaultRecord,
  passphrase: string,
) {
  return decryptSecret(record.encrypted, passphrase);
}
