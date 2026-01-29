import * as React from "react";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className = "", value = 0, max = 100, ...props }, ref) => {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div ref={ref} className={`progress ${className}`.trim()} {...props}>
        <div className="progress__bar" style={{ width: `${percent}%` }} />
      </div>
    );
  }
);

Progress.displayName = "Progress";
