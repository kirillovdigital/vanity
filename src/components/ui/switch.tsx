import * as React from "react";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, onCheckedChange, disabled }, ref) => {
    const toggle = () => {
      if (disabled) return;
      onCheckedChange?.(!checked);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        toggle();
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        className={`switch ${checked ? "is-checked" : ""}`.trim()}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      >
        <span className="switch__thumb" />
      </button>
    );
  }
);

Switch.displayName = "Switch";
