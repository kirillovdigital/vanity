import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";

import { BLOCKCHAIN, HEADER } from "../lib/constants";
import { Context } from "../lib/context";

export default function BlockchainSection() {
  const { selectedBlockchain, setSelectedBlockchain, running } = Context();

  return (
    <Card>
      <CardHeader>{HEADER.BLOCKCHAIN}</CardHeader>
      <CardContent>
        <div className="form-row">
          {Object.entries(BLOCKCHAIN).map(([key]) => (
            <Button
              key={key}
              id={key}
              onClick={() => setSelectedBlockchain(key)}
              disabled={selectedBlockchain === key || running}
            >
              {key.toUpperCase()}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
