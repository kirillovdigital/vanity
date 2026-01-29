import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Icons } from "./ui/icons";

import { HEADER } from "../lib/constants";
import { Context } from "../lib/context";

import useWorker from "../hooks/useWorker";

export default function InputSettingSection() {
  const {
    prefix,
    setPrefix,
    suffix,
    setSuffix,
    threads,
    setThreads,
    isChecksum,
    setIsChecksum,
    running,
  } = Context();

  const { handleGenerateAddresses, stopGenerating } = useWorker();

  return (
    <Card>
      <CardHeader>{HEADER.PROPERTIES}</CardHeader>
      <CardContent>
        <div className="form-row">
          <Input
            placeholder="PREFIX"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            disabled={running}
          />
          <Input
            placeholder="SUFFIX"
            value={suffix}
            onChange={(e) => setSuffix(e.target.value)}
            disabled={running}
          />
        </div>
        <div className="settings-row">
          <div className="thread-control">
            <Button
              variant="icon"
              size="icon"
              onClick={() => setThreads(threads - 1)}
              disabled={running || threads <= 1}
            >
              <Icons.minus />
            </Button>
            <div className="thread-count">
              <div className="thread-count__value">{threads}</div>
              <div className="thread-count__label">Threads</div>
            </div>
            <Button
              variant="icon"
              size="icon"
              onClick={() => setThreads(threads + 1)}
              disabled={running}
            >
              <Icons.plus />
            </Button>
          </div>
          <div className="toggle-row">
            <Switch
              checked={isChecksum}
              onCheckedChange={setIsChecksum}
              disabled={running}
            />
            <span>CASE-SENSITIVE</span>
          </div>
          <div className="action-buttons">
            <Button onClick={handleGenerateAddresses} disabled={running}>
              GENERATE
            </Button>
            <Button onClick={stopGenerating} disabled={!running}>
              STOP
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
