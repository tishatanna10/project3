import type { Metadata } from "next";
import "./globals.css";
import { AppFrame } from "@/components/navigation/AppFrame";

export const metadata: Metadata = {
  title: "Pathwise | Career clarity for students",
  description: "Find your direction, build a plan, and become job-ready with Pathwise.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col"><AppFrame>{children}</AppFrame></body>
    </html>
  );
}
