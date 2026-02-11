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
      objet: "Rénovation école primaire — Lot 1",
      status: "En cours",
      statusClass: "bg-yellow-100 text-yellow-800",
      date: "12/11/2025",
      progress: 60,
      team: 4,
    },
    {
      id: "dao-004",
      number: "DAO-004",
      objet: "Rénovation école primaire — Lot 1",
      status: "En cours",
      statusClass: "bg-yellow-100 text-yellow-800",
      date: "12/11/2025",
      progress: 60,
      team: 4,
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
        {/* DAO list */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">
              Cliquer sur une carte pour ouvrir le détail
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {daos.map((dao) => (
              <article
                key={dao.id}
                onClick={() => router.push(`/dash/ChefProjet/task/`)}
                className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">N° {dao.number}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {dao.objet}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${dao.statusClass}`}
                  >
                    {dao.status}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date dépôt</span>
                    <span className="font-medium">{dao.date}</span>
                  </div>

                  <div className="mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">{dao.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded mt-2">
                      <div
                        className="h-2 bg-blue-600 rounded"
                        style={{ width: `${dao.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  Équipe : {dao.team} membres
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
