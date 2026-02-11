"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface Dao {
  id: number;
  numero: string;
  reference: string;
  autorite: string;
  date_depot?: string;
  chef_projet?: string | null;
  statut?: string | null;
}

export default function DashboardChefEquipe() {
  const router = useRouter();
  const [daos, setDaos] = useState<Dao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<{ username: string; id: number } | null>(null);

  async function loadDaos() {
    try {
      setLoading(true);
      setError("");

      // Récupérer l'utilisateur connecté
      const userRes = await fetch("/api/me", { cache: "no-store" });
      const userData = userRes.ok ? await userRes.json() : {};
      
      const userId = userData.user?.id;
      const userRole = userData.user?.role_id;
      const username = userData.user?.username;

      // Sauvegarder les infos de l'utilisateur connecté
      if (userId && username) {
        setCurrentUser({ username, id: userId });
      }

      console.log(`Chargement des DAO pour ${username} (role: ${userRole}, id: ${userId})`);

      const res = await fetch(`/api/dao/stats?userId=${userId}&userRole=${userRole}`, { cache: "no-store" });
      const json = await res.json().catch(() => {});

      console.log("Réponse brute de l'API /api/dao/stats:", json);
      console.log("Status de la réponse:", res.status);
      console.log("OK de la réponse:", res.ok);

      if (!res.ok) {
        console.error("API /api/dao/stats error:", json);
        setDaos([]);
        setError(json?.message || "Erreur lors du chargement des DAO");
        return;
      }

      const rows = Array.isArray(json?.data?.daos) ? (json.data.daos as Dao[]) : [];
      console.log(`DAO trouvés pour ${username}:`, rows.length);
      console.log("Détail des DAO:", rows);
      setDaos(rows);
    } catch (err) {
      console.error("Error fetching DAOs:", err);
      setDaos([]);
      setError("Erreur réseau lors du chargement des DAO");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDaos();
  }, []);

  const stats = useMemo(() => {
    const total = daos.length;
    const enCours = daos.filter((d) => d.statut === 'enCours').length;
    const aRisque = daos.filter((d) => d.statut === 'aRisque').length;
    const terminees = daos.filter((d) => d.statut === 'terminee').length;
    return { total, enCours, aRisque, terminees };
  }, [daos]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="flex items-center justify-between bg-white p-4 border-b">
        <div>
          <h1 className="text-xl font-bold">Mes DAO</h1>
          {currentUser && (
            <p className="text-sm text-gray-600">
              Connecté en tant que {currentUser.username}
            </p>
          )}
        </div>

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
        {/* TABS SECTION */}
        <div className="row mb-6">
          <div className="col-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body dashboard-tabs p-0">
                <div className="tab-content py-0 px-0">
                  {/* OVERVIEW TAB */}
                  <div
                    className="tab-pane fade show active"
                    id="overview"
                    role="tabpanel"
                  >
                    <div className="d-flex flex-wrap justify-content-xl-between">
                      {/* Block 1 */}
                      <div
                        className="d-none d-xl-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item"
                        style={{
                          background:
                            "linear-gradient(90deg, #f5f5f5, #e0e0e0)",
                        }}
                      >
                        <i className="mdi mdi-calendar icon-lg mr-3 text-secondary"></i>
                        <div className="d-flex flex-column">
                          <small className="text-muted">Total assignés</small>
                          <h4 className="mb-0">{stats.total}</h4>
                        </div>
                      </div>

                      {/* Block 2 */}
                      <div
                        className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item"
                        style={{
                          background:
                            "linear-gradient(90deg, #fff9c4, #fff176)",
                        }}
                      >
                        <i className="mdi mdi-timer-sand icon-lg mr-3 text-warning"></i>
                        <div className="d-flex flex-column">
                          <small className="text-muted">En cours</small>
                          <h4 className="mb-0">{stats.enCours}</h4>
                        </div>
                      </div>

                      {/* Block 3 */}
                      <div
                        className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item"
                        style={{
                          background:
                            "linear-gradient(90deg, #ffebee, #ef9a9a)",
                        }}
                      >
                        <i className="mdi mdi-alert icon-lg mr-3 text-danger"></i>
                        <div className="d-flex flex-column">
                          <small className="text-muted">À risque</small>
                          <h4 className="mb-0">{stats.aRisque}</h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SALES TAB */}
                  <div className="tab-pane fade" id="sales" role="tabpanel">
                    <div className="p-4">
                      <h4>Sales Data</h4>
                      <p>Sales information will be displayed here.</p>
                    </div>
                  </div>

                  {/* PURCHASES TAB */}
                  <div className="tab-pane fade" id="purchases" role="tabpanel">
                    <div className="p-4">
                      <h4>Purchases Data</h4>
                      <p>Purchases information will be displayed here.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DAO list */}
        {/* TABLE */}
        <div className="row">
          <div className="col-12 stretch-card">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <p className="card-title mb-0">Tous mes DAO</p>
                  <button className="btn btn-sm btn-outline-primary" onClick={loadDaos} disabled={loading}>
                    Rafraîchir
                  </button>
                </div>

                {error ? <div className="alert alert-danger mt-3 mb-0">{error}</div> : null}

                <div className="table-responsive mt-3">
                  <table
                    id="recent-purchases-listing"
                    className="table table-hover"
                  >
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Référence</th>
                        <th>Autorité contractante</th>
                        <th>Status</th>
                        <th>Date de clôture</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5}>Chargement...</td>
                        </tr>
                      ) : daos.length === 0 ? (
                        <tr>
                          <td colSpan={5}>Aucun DAO assigné pour le moment.</td>
                        </tr>
                      ) : (
                        daos.map((dao) => (
                          <tr key={dao.id}>
                            <td>{dao.numero}</td>
                            <td>{dao.reference}</td>
                            <td>{dao.autorite}</td>
                            <td>
                              <span className={`badge ${
                                dao.statut === 'enCours' ? 'bg-warning' : 
                                dao.statut === 'aRisque' ? 'bg-danger' : 
                                dao.statut === 'terminee' ? 'bg-success' : 'bg-secondary'
                              }`}>
                                {dao.statut === 'enCours' ? 'En cours' : 
                                 dao.statut === 'aRisque' ? 'À risque' : 
                                 dao.statut === 'terminee' ? 'Terminée' : dao.statut}
                              </span>
                            </td>
                            <td>{dao.date_depot || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
