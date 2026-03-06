import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cristina & Andrei — 26 Septembrie 2026",
  description: "Vă invităm să ne fiți alături în ziua nunții noastre!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
