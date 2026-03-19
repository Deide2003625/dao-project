import { Inter, Roboto } from "next/font/google";
import "../globals.css";
import Script from "next/script";
import ClientLoginLayout from "./layout-client";

const inter = Inter({ subsets: ["latin"] });

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} ${roboto.variable}`}>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css"
        integrity="sha384-WKL5jx7Jp5xCgVpuz3AQtH37JBIDSgiCawKkzMQrYsWX1sjlIqJUlmCZuDgExIbE"
        crossOrigin="anonymous"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
        crossOrigin="anonymous"
      />
      <link rel="stylesheet" href="/css/style.css" />
      <ClientLoginLayout>
        {children}
      </ClientLoginLayout>
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
