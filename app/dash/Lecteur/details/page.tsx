"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectToDaoDetails() {
  const router = useRouter();
  
  useEffect(() => {
    // Rediriger vers la page de liste des DAOs
    router.replace("/dash/Lecteur/allDao");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection vers la liste des DAOs...</p>
      </div>
    </div>
  );
}
