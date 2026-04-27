import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

export function Card({ children, padded = true, className, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={clsx(
        "rounded-lg border border-slate-200 bg-white shadow-sm",
        padded && "p-3.5",
        className
      )}
    >
      {children}
    </div>
  );
}
