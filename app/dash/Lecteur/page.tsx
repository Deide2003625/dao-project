"use client";

import { useEffect, useMemo, useState } from "react";

interface Dao {
  id: number;
  numero: string;
  reference: string;
  autorite: string;
  date_depot?: string;
  chef_projet?: string | null;
  statut?: string | null; // optionnel si ajouter plus tard dans la DB
}

export default function Page() {
  const [daos, setDaos] = useState<Dao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const computeStatus = (dao: Dao): { label: string; className: string } => {
    const today = new Date();
    const rawStatut = String(dao.statut || "").toUpperCase();

    // Si terminé (équivalent à 100% d'avancement) => vert
    if (rawStatut === "TERMINEE" || rawStatut === "TERMINE") {
      return {
        label: "Terminée",
        className: "badge bg-success text-white",
      };
    }

    // Sinon, appliquer les règles sur la date de dépôt
    if (!dao.date_depot) {
      return {
        label: "En cours",
        className: "badge bg-warning text-dark",
      };
    }

    const dateDepot = new Date(dao.date_depot);
    // Nombre de jours restants : date_depot - aujourd'hui
    const diffMs = dateDepot.getTime() - today.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // ≥ 5 jours (ou 4) => En cours (jaune)
    if (diffDays >= 5 || diffDays === 4) {
      return {
        label: "EN COURS",
        className: "badge bg-warning text-dark",
      };
    }

    // ≤ 3 jours ou passé => À risque (rouge)
    if (diffDays <= 3) {
      return {
        label: "À risque",
        className: "badge bg-danger text-white",
      };
    }

    return {
      label: "En cours",
      className: "badge bg-warning text-dark",
    };
  };

  async function loadDaos() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/dao", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("API /api/dao error:", json);
        setDaos([]);
        setError(json?.message || "Erreur lors du chargement des DAO");
        return;
      }

      // API renvoie { success: true, data: [...] }
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

  async function handleDeleteDao(daoId: number) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce DAO ?")) return;

    try {
      const res = await fetch(`/api/dao/${daoId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");

      // Recharger les DAOs
      await loadDaos();
    } catch (err) {
      console.error("Error deleting DAO:", err);
      alert("Erreur lors de la suppression du DAO");
    }
  }

  async function handleUpdateStatut(daoId: number, statut: string) {
    try {
      const res = await fetch(`/api/dao/${daoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour");

      // Recharger les DAOs
      await loadDaos();
    } catch (err) {
      console.error("Error updating DAO statut:", err);
      alert("Erreur lors de la mise à jour du statut");
    }
  }

  useEffect(() => {
    loadDaos();
  }, []);

  const stats = useMemo(() => {
    const total = daos.length;

    let enCours = 0;
    let aRisque = 0;
    let terminees = 0;

    const today = new Date();

    daos.forEach((d) => {
      const statut = String(d.statut || "").toUpperCase();

      // 1) Si terminé (équivalent à 100% d'avancement) => carte verte
      if (statut === "TERMINEE") {
        terminees += 1;
        return;
      }

      // 2) Sinon, appliquer les règles sur la date de dépôt
      if (!d.date_depot) {
        // Pas de date => considérer comme en cours
        enCours += 1;
        return;
      }

      const dateDepot = new Date(d.date_depot);
      // Nombre de jours restants avant la date de dépôt : date_depot - aujourd'hui
      const diffMs = dateDepot.getTime() - today.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // Si Date dépôt - Date aujourd'hui ≥ 5 jours => En cours (jaune)
      if (diffDays >= 5) {
        enCours += 1;
        return;
      }

      // Si Date dépôt - Date aujourd'hui ≤ 3 jours => À risque (rouge)
      if (diffDays <= 3) {
        aRisque += 1;
        return;
      }

      // Cas intermédiaire (par ex. 4 jours) => En cours par défaut
      enCours += 1;
    });

    return { total, enCours, aRisque, terminees };
  }, [daos]);

  return (
    <>
      {/* ROW 1 - Header with breadcrumb */}
      <div className="row">
        <div className="col-12 grid-margin">
          <div className="d-flex justify-content-between flex-wrap">
            <div className="d-flex align-items-end flex-wrap">
              <div className="mr-md-3 mr-xl-5">
                <h2>Bienvenue Lecteur</h2>
                <p className="mb-md-0">Voici les statistiques des DAO.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="row">
        <div className="col-12 stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <p className="card-title mb-0">Tous les DAO</p>
                <div>
                  <button className="btn btn-sm btn-outline-primary mr-2" onClick={loadDaos} disabled={loading}>
                    Rafraîchir
                  </button>
                </div>
              </div>

              {error ? <div className="alert alert-danger mt-3 mb-0">{error}</div> : null}

              <div className="table-responsive mt-3">
                <table id="recent-purchases-listing" className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Référence</th>
                      <th>Autorité contractante</th>
                      <th>Chef Projet</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5}>Chargement...</td>
                      </tr>
                    ) : daos.length === 0 ? (
                      <tr>
                        <td colSpan={5}>Aucun DAO pour le moment.</td>
                      </tr>
                    ) : (
                      daos.map((dao) => (
                        <tr key={dao.id}>
                          {/* "Nom" : numero, sinon on peux mettre objet si on le renvoies */}
                          <td>{dao.numero}</td>
                          <td>{dao.reference}</td>
                          <td>{dao.autorite}</td>
                          <td>{dao.chef_projet ?? "-"}</td>
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
    </>
  );
}
