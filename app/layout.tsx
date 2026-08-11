import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// const materialIcons = MaterialIcons({
//   variable: "--font-material-icons",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Business Hub",
  description: "A platform for managing your business",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
