import { Inter } from "next/font/google";
import "../globals.css";
import Script from "next/script";
import ClientLoginLayout from "./layout-client";

const inter = Inter({ subsets: ["latin"] });

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note : le nonce CSP est géré dans le middleware (next.config.js).
  // On ne le récupère plus ici car les <Script> next/script
  // n'acceptent pas de nonce en Server Component de cette façon.

  return (
    <div className={inter.className}>
      {/* ── CSS externe ─────────────────────────────────────────────────────
          Les <link> sont autorisés dans les composants React (pas les <script>).
          Ils sont injectés dans le <head> par Next.js automatiquement.         */}
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
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
        crossOrigin="anonymous"
      />
      <link rel="stylesheet" href="/css/style.css" />

      {/* ── Contenu de la page ───────────────────────────────────────────── */}
      <ClientLoginLayout>
        {children}
      </ClientLoginLayout>

      {/* ── Scripts JS externes ──────────────────────────────────────────────
          Utiliser next/script au lieu de <script> brut.
          React ignore et avertit sur les <script> dans les composants.

          strategy="afterInteractive" = chargé après hydratation de la page,
          équivalent à defer. C'est le bon choix pour jQuery et Bootstrap.      */}
      <Script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        integrity="sha384-vtXRMe3mGCbOeY7l30aIg8H9p3GdeSe4IFlP6G8JMa7o7lXvnz3GFKzPxzJdPfGK"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </div>
  );
}
