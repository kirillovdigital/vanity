import type * as React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  stretch?: boolean;
};

export function Button({
  className = "",
  type = "button",
  variant = "primary",
  stretch = false,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "ui-button",
        `ui-button--${variant}`,
        stretch ? "ui-button--stretch" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
