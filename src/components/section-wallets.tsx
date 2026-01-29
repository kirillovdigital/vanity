import { Copy } from "./ui/copy";
import { Card, CardHeader } from "./ui/card";
import { Delete } from "./ui/delete";
import { Button } from "./ui/button";
import {
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableCaption,
} from "./ui/table";

import { BLOCKCHAIN, HEADER } from "../lib/constants";
import { Context } from "../lib/context";

import { useWalletStorage } from "../hooks/useWalletStorage";
import { useAccount } from "wagmi";

export default function WalletsSection() {
  const { wallets } = Context();
  const { isConnected } = useAccount();
  const { clearWallets, removeWalletByIndex } = useWalletStorage();

  if (!isConnected) {
    return (
      <div className="notice">
        Please connect your wallet to view the stored wallets.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <span>{HEADER.WALLETS}</span>
        <Button onClick={clearWallets} variant="link">
          CLEAR ALL
        </Button>
      </CardHeader>
      <Table>
        <TableCaption>
          A list of your recent wallets. Always clear them after use.
        </TableCaption>
        <TableBody>
          {wallets.map(({ blockchain, address, privateKey }, index) => {
            const blockchainData =
              BLOCKCHAIN[blockchain as keyof typeof BLOCKCHAIN];
            const IconComponent = blockchainData?.icon;

            return (
              <TableRow key={`${address}-${index}`}>
                <TableCell className="table-cell--icon">
                  <a
                    href={blockchainData?.link + address}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {IconComponent && <IconComponent />}
                  </a>
                </TableCell>
                <TableCell>{address}</TableCell>
                <TableCell>
                  <Copy text={privateKey} />
                </TableCell>
                <TableCell>
                  <Delete onWalletDelete={() => removeWalletByIndex(index)} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
