"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

const links = [
  ["Dashboard", "/dashboard"],
  ["Resume", "/resume"],
  ["Interview", "/interview"],
  ["Career chat", "/chat"],
] as const;

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href="/dashboard" className={styles.brand}>path<span>wise</span></Link>
        <div className={styles.links}>
          {links.map(([label, href]) => (
            <Link key={href} href={href} className={pathname === href ? styles.active : styles.link}>
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
