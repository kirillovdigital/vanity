import { Card, CardContent, CardHeader } from "./ui/card";
import { Progress } from "./ui/progress";

import { HEADER } from "../lib/constants";
import { Context } from "../lib/context";

export default function PerformanceSection() {
  const { difficulty, count, speed, status, probability } = Context();

  return (
    <Card>
      <CardHeader>
        <span>{HEADER.PERFORMANCE}</span>
        <span className="text-link">⦿ {status}</span>
      </CardHeader>
      <CardContent>
        <div className="stats-row">
          <span>Difficulty: {difficulty}</span>
          <span>Generated: {count} addresses</span>
          <span>Speed: {speed} addr/s</span>
        </div>
        <div className="stats-row stats-row--progress">
          <span>Probability: {probability}%</span>
          <div style={{ flex: 1 }}>
            <Progress value={probability} max={100} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
