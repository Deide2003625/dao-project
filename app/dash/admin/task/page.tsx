"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, MoreVertical, Check, X, Send, User } from "lucide-react";

interface Dao {
  id: number;
  numero: string;
  reference: string;
  autorite: string;
  date_depot?: string;
  statut?: string;
  chef_projet?: string;
  chef_id?: number;
  team_id?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  role_id: string;
}

export default function DaoListPage() {
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

      // Filter DAOs based on user role
      let filteredDaos = allDaos;
      const userRole = userJson.user.role_id;

      if (userRole === "2") {
        // Admin - voit tous les DAOs
        filteredDaos = allDaos;
      } else if (userRole === "3") {
        // ChefProjet - voit ses DAOs
        filteredDaos = allDaos.filter((dao) => dao.chef_id === userJson.user.id);
      } else if (userRole === "4") {
        // MembreEquipe - voit les DAOs de son équipe
        // Pour cela, il faudrait récupérer les équipes de l'utilisateur
        // Pour l'instant, on laisse tous les DAOs (à améliorer)
        filteredDaos = allDaos;
      }

      setDaos(filteredDaos);
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
          <p className="mt-2">Chargement des DAO...</p>
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
        <div className="flex items-center gap-3">
          <Link
            href="/dash/admin"
            className="text-gray-600 hover:text-black"
          >
            <ArrowLeft />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Gestion des DAO</h1>
            <p className="text-sm text-gray-500">Tous les DAO accessibles</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            placeholder="Rechercher (n°, référence, autorité...)"
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
              Cliquez sur un DAO pour voir les détails et tâches
            </span>
            <span className="text-sm text-gray-500">
              {daos.length} DAO{daos.length > 1 ? 's' : ''} trouvé{daos.length > 1 ? 's' : ''}
            </span>
          </div>

          {daos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun DAO trouvé pour votre rôle.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {daos.map((dao) => (
                <article
                  key={dao.id}
                  onClick={() => router.push(`/dash/admin/task/${dao.id}`)}
                  className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">N° {dao.numero}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {dao.reference} - {dao.autorite}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        dao.statut === "EN_COURS"
                          ? "bg-yellow-100 text-yellow-800"
                          : dao.statut === "TERMINE"
                          ? "bg-green-100 text-green-800"
                          : dao.statut === "ANNULE"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {dao.statut || "EN_COURS"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Date dépôt</span>
                      <span className="font-medium">
                        {dao.date_depot || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Chef projet</span>
                      <span className="font-medium">
                        {dao.chef_projet || "N/A"}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Progression</span>
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

                  <div className="mt-4 flex justify-end">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Voir détails →
                    </button>
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
