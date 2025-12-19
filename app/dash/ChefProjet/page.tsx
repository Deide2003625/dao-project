"use client";

import { useRouter } from "next/navigation";

export default function DashboardChefEquipe() {
  const router = useRouter();

  const daos = [
    {
      id: "dao-001",
      number: "DAO-001",
      objet: "Rénovation école primaire — Lot 1",
      status: "En cours",
      statusClass: "bg-yellow-100 text-yellow-800",
      date: "12/11/2025",
      progress: 60,
      team: 4,
    },
    {
      id: "dao-002",
      number: "DAO-002",
      objet: "Fourniture matériel informatique",
      status: "À risque",
      statusClass: "bg-red-100 text-red-800",
      date: "04/11/2025",
      progress: 30,
      team: 3,
    },
    {
      id: "dao-003",
      number: "DAO-003",
      objet: "Fourniture matériel informatique",
      status: "À risque",
      statusClass: "bg-red-100 text-red-800",
      date: "04/11/2025",
      progress: 30,
      team: 3,
    },
    {
      id: "dao-004",
      number: "DAO-004",
      objet: "Fourniture matériel informatique",
      status: "À risque",
      statusClass: "bg-red-100 text-red-800",
      date: "04/11/2025",
      progress: 30,
      team: 3,
    },
  ];

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
                      <tr>
                        <td>Jeremy Ortega</td>
                        <td>Levelled up</td>
                        <td>Catalinaborough</td>
                        <td>12/11/2025</td>
                      </tr>
                      <tr>
                        <td>Alvin Fisher</td>
                        <td>Ui design completed</td>
                        <td>East Mayra</td>
                        <td>04/11/2025</td>
                      </tr>
                      <tr>
                        <td>John Doe</td>
                        <td>Project completed</td>
                        <td>New York</td>
                        <td>01/12/2025</td>
                      </tr>
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
