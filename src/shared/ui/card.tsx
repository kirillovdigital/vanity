import type * as React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  return <section className={["ui-card", className].join(" ")} {...props} />;
}

export function CardHeader({ className = "", ...props }: CardProps) {
  return (
    <header className={["ui-card__header", className].join(" ")} {...props} />
  );
}

export function CardBody({ className = "", ...props }: CardProps) {
  return <div className={["ui-card__body", className].join(" ")} {...props} />;
}
