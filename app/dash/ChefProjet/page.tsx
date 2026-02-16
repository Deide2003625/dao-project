"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Dao {
  id: number;
  numero: string;
  reference: string;
  autorite: string;
  date_depot?: string;
  chef_projet?: string | null;
  statut?: string | null;
  groupement?: string | null;
  nom_partenaire?: string | null;
}

export default function DashboardChefEquipe() {
  const router = useRouter();
  const [daos, setDaos] = useState<Dao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Calculer les statistiques
  const stats = {
    total: daos.length,
    enCours: daos.filter(d => {
      const status = String(d.statut || "").toLowerCase();
      return status === "encours" || status === "en cours";
    }).length,
    aRisque: daos.filter(d => {
      const status = String(d.statut || "").toLowerCase();
      return status === "arisque" || status === "à risque";
    }).length,
    terminees: daos.filter(d => {
      const status = String(d.statut || "").toLowerCase();
      return status === "termine" || status === "terminée";
    }).length,
  };

  useEffect(() => {
    loadDaos();
  }, []);

  async function loadDaos() {
    try {
      setLoading(true);
      setError("");

      // Récupérer l'utilisateur connecté depuis localStorage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setError("Utilisateur non connecté");
        return;
      }

      const user = JSON.parse(storedUser);
      
      const res = await fetch(`/api/dao?chefId=${user.id}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("API /api/dao error:", json);
        setDaos([]);
        setError(json?.message || "Erreur lors du chargement des DAO");
        return;
      }

      const rows = Array.isArray(json?.data) ? (json.data as Dao[]) : [];
      setDaos(rows);
    } catch (err) {
      console.error("Error fetching DAOs:", err);
      setDaos([]);
      setError("Erreur réseau lors du chargement des DAO");
    } finally {
      setLoading(false);
    }
  }

  const computeStatus = (dao: Dao): { label: string; className: string } => {
    const today = new Date();
    const rawStatut = String(dao.statut || "").toLowerCase();

    // Si terminé => vert
    if (rawStatut === "termine" || rawStatut === "terminée") {
      return {
        label: "Terminée",
        className: "badge bg-success text-white",
      };
    }

    // Si à risque => rouge
    if (rawStatut === "arisque" || rawStatut === "à risque") {
      return {
        label: "À risque",
        className: "badge bg-danger text-white",
      };
    }

    // Sinon, en cours => jaune
    return {
      label: "En cours",
      className: "badge bg-warning text-dark",
    };
  };

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
                        <div className="d-flex flex-column justify-content-around">
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
                        <div className="d-flex flex-column justify-content-around">
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
                        <div className="d-flex flex-column justify-content-around">
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
                        <th>Date de clôture</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="text-center">Chargement...</td>
                        </tr>
                      ) : daos.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center">Aucun DAO assigné.</td>
                        </tr>
                      ) : (
                        daos.map((dao) => (
                          <tr key={dao.id}>
                            <td>{dao.numero}</td>
                            <td>{dao.reference}</td>
                            <td>{dao.autorite}</td>
                            <td>
                              {dao.date_depot 
                                ? new Date(dao.date_depot).toLocaleDateString('fr-FR')
                                : '-'
                              }
                            </td>
                            <td>
                              {(() => {
                                const s = computeStatus(dao);
                                return <span className={s.className}>{s.label}</span>;
                              })()}
                            </td>
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
