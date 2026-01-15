"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

export default function AppClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [user, setUser] = useState<{ id: number; role_id: number } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser({
              id: data.user.id,
              role_id: data.user.role_id || 0,
            });
          }
        }
      } catch {}
    }

    if (!isLoginPage) fetchUser();
  }, [isLoginPage]);

  if (isLoginPage) {
    return <div className="auth">{children}</div>;
  }

  return (
    <div className="container-scroller">
      <Header />
      <div className="container-fluid page-body-wrapper">
        <Sidebar />
        <div className="main-panel">
          <div className="content-wrapper">{children}</div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
