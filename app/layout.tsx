import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Freedom Hustle — Digital Nomad Guides",
  description:
    "Practical, premium digital nomad starter guides. Built by nomads, for nomads. First city: Bangkok.",
  metadataBase: new URL("https://freedomhustle.example.com")
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-sand-50 text-ink-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
