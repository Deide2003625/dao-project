"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Dao {
  id: number;
  numero: string;
  reference: string;
  autorite: string;
  date_depot?: string;
  statut?: string;
  chef_projet?: string;
  chef_id?: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export default function MyDaoPage() {
  const router = useRouter();
  const [daos, setDaos] = useState<Dao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    loadUserAndDaos();
  }, []);

  async function loadUserAndDaos() {
    try {
      setLoading(true);
      setError("");

      // Fetch current user
      const userRes = await fetch("/api/me", { cache: "no-store" });
      const userJson = await userRes.json().catch(() => ({}));
      if (!userRes.ok || !userJson.user) {
        setError("Utilisateur non authentifié");
        return;
      }
      setCurrentUser(userJson.user);

      // Fetch all DAOs
      const daoRes = await fetch("/api/dao", { cache: "no-store" });
      const daoJson = await daoRes.json().catch(() => ({}));

      if (!daoRes.ok) {
        console.error("API /api/dao error:", daoJson);
        setDaos([]);
        setError(daoJson?.message || "Erreur lors du chargement des DAO");
        return;
      }

      // API renvoie { success: true, data: [...] }
      const allDaos = Array.isArray(daoJson?.data) ? (daoJson.data as Dao[]) : [];

      // Filter DAOs where current user is the chef
      const myDaos = allDaos.filter((dao) => dao.chef_id === userJson.user.id);
      setDaos(myDaos);
    } catch (err) {
      console.error("Error fetching data:", err);
      setDaos([]);
      setError("Erreur réseau lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Chargement...</span>
          </div>
          <p className="mt-2">Chargement de mes DAO...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="alert alert-danger">{error}</div>
          <button className="btn btn-primary mt-3" onClick={loadUserAndDaos}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="flex items-center justify-between bg-white p-4 border-b">
        <h1 className="text-xl font-bold">Mes DAO</h1>

        <div className="flex items-center gap-3">
          <input
            placeholder="Rechercher (n°, objet, équipe...)"
            className="px-3 py-2 border rounded w-72 text-sm"
          />
          <button className="px-3 py-2 bg-blue-600 text-white rounded text-sm">
            Filtrer
          </button>
        </div>
      </header>

      <main className="p-6">
        {/* DAO list */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">
              Cliquer sur une carte pour ouvrir le détail
            </span>
          </div>

          {daos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun DAO trouvé.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {daos.map((dao) => (
                <article
                  key={dao.id}
                  onClick={() => router.push(`/dash/ChefProjet/task/`)}
                  className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">N° {dao.numero}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {dao.reference} - {dao.autorite}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        dao.statut === "EN_COURS"
                          ? "bg-yellow-100 text-yellow-800"
                          : dao.statut === "TERMINE"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {dao.statut || "EN_COURS"}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Date dépôt</span>
                      <span className="font-medium">
                        {dao.date_depot || "N/A"}
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium">0%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded mt-2">
                        <div
                          className="h-2 bg-blue-600 rounded"
                          style={{ width: "0%" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-500">
                    Chef: {dao.chef_projet || "N/A"}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
