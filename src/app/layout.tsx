import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: {
    default: "HyperPerms Editor - Visual Permission Manager",
    template: "%s | HyperPerms Editor",
  },
  description: "Self-hostable web editor for HyperPerms. Manage Hytale server permissions visually in your browser.",
  keywords: ["hytale permissions", "hytale permissions editor", "hyperperms editor", "hytale server permissions"],
  authors: [{ name: "HyperPerms Team" }],
  creator: "HyperPerms",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "HyperPerms Editor - Visual Permission Manager",
    description: "Self-hostable web editor for HyperPerms. Manage Hytale server permissions visually.",
    type: "website",
    siteName: "HyperPerms Editor",
    url: appUrl,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
