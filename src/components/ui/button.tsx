import * as React from "react";

type ButtonVariant = "default" | "link" | "icon";

type ButtonSize = "default" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const classes = ["button", className];

    if (variant === "icon") classes.push("button--icon");
    if (variant === "link") classes.push("button--link");
    if (size === "icon" && variant !== "icon") classes.push("button--icon");

    return (
      <button ref={ref} className={classes.join(" ")} {...props} />
    );
  }
);

Button.displayName = "Button";
