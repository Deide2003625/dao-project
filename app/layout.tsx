import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import SessionWrapper from "@/components/SessionWrapper";
import AppClientWrapper from "@/components/AppClientWrapper";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Material Design Icons (CDN avec SRI) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css"
          integrity="sha384-7V2Z9d7Ew0y7Y6JzqkA5B5YvL0xF+8Z7KJ0LxVn9EJ5L9dQm5yY5GkM4XJ4nZ0+"
          crossOrigin="anonymous"
        />

        {/* Bootstrap CSS (CDN + SRI) */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
          crossOrigin="anonymous"
        />

        {/* CSS local (sécurisé) */}
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="stylesheet" href="/css/custom.css" />
      </head>

      <body className={inter.className}>
        {/* jQuery chargé avant tous les scripts dépendants */}
        <Script
          src="https://code.jquery.com/jquery-3.6.0.min.js"
          integrity="sha256-/xUj+3OJ+Y3yX2a5p5c5Ny8JD7BqXc9Ejo4kKDAdAm8="
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />

        {/* Session + contexte app */}
        <SessionWrapper>
          <AppClientWrapper>{children}</AppClientWrapper>
        </SessionWrapper>

        {/* Bootstrap JS bundle (dépend de jQuery) */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Scripts locaux Majestic dépendants de jQuery */}
        <Script src="/js/off-canvas.js" strategy="afterInteractive" />
        <Script src="/js/hoverable-collapse.js" strategy="afterInteractive" />
        <Script src="/js/template.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
