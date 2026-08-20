"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Navbar } from "./Navbar";

const publicRoutes = new Set(["/", "/login", "/signup"]);

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <>{publicRoutes.has(pathname) ? null : <Navbar />}{children}</>;
}
