import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://freedomhustleguide.com"),
  title: {
    default: "Freedom Hustle — Real guides for working abroad",
    template: "%s | Freedom Hustle"
  },
  description:
    "Personal nomad playbooks from years of living it. Cafes, coworking, neighbourhoods, gyms — skip to the life you came for.",
  applicationName: "Freedom Hustle",
  authors: [{ name: "Arni & Valeria" }],
  keywords: [
    "digital nomad",
    "Bangkok",
    "remote work",
    "Thailand",
    "nomad guide",
    "working abroad",
    "coworking",
    "Southeast Asia"
  ],
  openGraph: {
    type: "website",
    url: "https://freedomhustleguide.com",
    siteName: "Freedom Hustle",
    title: "Freedom Hustle — Real guides for working abroad",
    description:
      "Personal nomad playbooks from years of living it. Cafes, coworking, neighbourhoods, gyms — skip to the life you came for.",
    locale: "en_GB"
  },
  twitter: {
    card: "summary_large_image",
    title: "Freedom Hustle — Real guides for working abroad",
    description:
      "Personal nomad playbooks. Skip to the life you came for."
  }
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
