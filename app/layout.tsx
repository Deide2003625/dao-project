import { Inter } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import ClientLayout from "./layout-client";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Récupérer le nonce depuis les headers du middleware
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || "";

  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Polices et styles globaux */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css"
          integrity="sha384-WKL5jx7Jp5xCgVpuz3AQtH37JBIDSgiCawKkzMQrYsWX1sjlIqJUlmCZuDgExIbE"
          crossOrigin="anonymous"
        />
        {/* Remplacement du fichier manquant par Bootstrap depuis CDN */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="stylesheet" href="/css/custom.css" />

        {/* Scripts critiques avec nonce et SRI */}
        <script
          src="https://code.jquery.com/jquery-3.6.0.min.js"
          integrity="sha384-vtXRMe3mGCbOeY7l30aIg8H9p3GdeSe4IFlP6G8JMa7o7lXvnz3GFKzPxzJdPfGK"
          crossOrigin="anonymous"
          nonce={nonce}
        />
      </head>
      <body className={inter.className}>
        <ClientLayout nonce={nonce}>
          {children}
        </ClientLayout>

        {/* Scripts non critiques avec nonce et SRI */}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
          crossOrigin="anonymous"
          nonce={nonce}
        />
        <script src="/js/off-canvas.js" nonce={nonce} />
        <script src="/js/hoverable-collapse.js" nonce={nonce} />
        <script src="/js/template.js" nonce={nonce} />
      </body>
    </html>
  );
}
