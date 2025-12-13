// app/layout.tsx
'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { useState, useEffect } from 'react';

const inter = Inter({ subsets: ["latin"] });

// Cette partie doit être dans un composant client
function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const [user, setUser] = useState<{id: number, role_id: number} | null>(null);

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me", {
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser({
              id: data.user.id,
              role_id: data.user.role_id || 0
            });
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      }
    }

    if (!isLoginPage) {
      fetchUser();
    }
  }, [isLoginPage]);

  if (isLoginPage) {
    return (
      <div className="container-scroller">
        {children}
      </div>
    );
  }

  return (
    <div className="container-scroller">
      <Header />
      <div className="container-fluid page-body-wrapper">
        <Sidebar  />
        <div className="main-panel">
          <div className="content-wrapper">
            {children}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

// Composant de mise en page racine (côté client)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        />
        {/* Remplacement du fichier manquant par Bootstrap depuis CDN */}
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
          rel="stylesheet"
          integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" 
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href="/css/style.css" />
        
        {/* Scripts critiques */}
        <Script 
          src="https://code.jquery.com/jquery-3.6.0.min.js" 
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <AppContent>
            {children}
          </AppContent>
        </SessionProvider>

        {/* Scripts non critiques */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
        <Script 
          src="/js/off-canvas.js" 
          strategy="lazyOnload" 
        />
        <Script 
          src="/js/hoverable-collapse.js" 
          strategy="lazyOnload" 
        />
        <Script 
          src="/js/template.js" 
          strategy="lazyOnload" 
        />
      </body>
    </html>
  );
}