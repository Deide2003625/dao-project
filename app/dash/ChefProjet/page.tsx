"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Dao {
  id: number;
  numero: string;
  reference: string;
  autorite: string;
  date_depot: string;
  chef_projet: string;
}

export default function DashboardChefEquipe() {
  const router = useRouter();
  const [daos, setDaos] = useState<Dao[]>([]);

  useEffect(() => {
    fetch('/api/dao')
      .then(res => res.json())
      .then(data => setDaos(data))
      .catch(err => console.error('Error fetching DAOs:', err));
  }, []);

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
                        <div className="d-flex flex-column">
                          <small className="text-muted">Total assignés</small>
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
                <p className="card-title">Tous mes DAO</p>
                <div className="table-responsive">
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
                      </tr>
                    </thead>
                    <tbody>
                      {daos.map(dao => (
                        <tr key={dao.id}>
                          <td>{dao.numero}</td>
                          <td>{dao.reference}</td>
                          <td>{dao.autorite}</td>
                          <td>{dao.date_depot}</td>
                        </tr>
                      ))}
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
