import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type SharedProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

type ButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type LinkProps = SharedProps & { href: string; target?: string; rel?: string };

export function Button({ children, variant = "primary", className = "", href, ...props }: ButtonProps | LinkProps) {
  const classes = `${styles.button} ${styles[variant]} ${className}`;

  if (href) {
    const { target, rel } = props as LinkProps;
    return <Link href={href} className={classes} target={target} rel={rel}>{children}</Link>;
  }

  return <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>;
}
