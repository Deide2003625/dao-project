"use client";

import { useState } from "react";
import {
  Users,
  Search,
  ChevronRight,
  User,
} from "lucide-react";
import Link from "next/link";

// Données simulées des équipes
const teamsData = [
  {
    id: 1,
    name: "Équipe Technique",
    leader: "Jean Dupont",
    memberCount: 8,
    daoCount: 5,
    status: "active",
    members: [
      {
        id: 1,
        name: "Marie Curie",
        role: "Ingénieur Structure",
        status: "available",
      },
      { id: 2, name: "Pierre Martin", role: "Architecte", status: "busy" },
      {
        id: 3,
        name: "Sophie Bernard",
        role: "Spécialiste Électricité",
        status: "available",
      },
      {
        id: 4,
        name: "Thomas Leroy",
        role: "Spécialiste Plomberie",
        status: "offline",
      },
    ],
    daos: [
      { id: 1, name: "DAO-2025-001", progress: 65 },
      { id: 2, name: "DAO-2025-003", progress: 30 },
      { id: 3, name: "DAO-2025-005", progress: 85 },
    ],
  },
  {
    id: 2,
    name: "Équipe Administrative",
    leader: "Élise Lambert",
    memberCount: 6,
    daoCount: 3,
    status: "active",
    members: [
      {
        id: 1,
        name: "Paul Durand",
        role: "Gestionnaire de contrat",
        status: "available",
      },
      {
        id: 2,
        name: "Catherine Moreau",
        role: "Comptable",
        status: "available",
      },
    ],
    daos: [
      { id: 1, name: "DAO-2025-002", progress: 45 },
      { id: 2, name: "DAO-2025-004", progress: 20 },
    ],
  },
  {
    id: 3,
    name: "Équipe Achats",
    leader: "Marc Dubois",
    memberCount: 7,
    daoCount: 4,
    status: "active",
    members: [
      {
        id: 1,
        name: "Nicolas Petit",
        role: "Responsable Achats",
        status: "busy",
      },
      {
        id: 2,
        name: "Isabelle Blanc",
        role: "Assistant Achats",
        status: "available",
      },
    ],
    daos: [
      { id: 1, name: "DAO-2025-006", progress: 75 },
      { id: 2, name: "DAO-2025-007", progress: 90 },
    ],
  },
  {
    id: 4,
    name: "Équipe Qualité",
    leader: "Lucie Petit",
    memberCount: 5,
    daoCount: 2,
    status: "inactive",
    members: [
      {
        id: 1,
        name: "Antoine Gauthier",
        role: "Auditeur Qualité",
        status: "offline",
      },
      {
        id: 2,
        name: "Julie Lefevre",
        role: "Contrôleur Qualité",
        status: "offline",
      },
    ],
    daos: [{ id: 1, name: "DAO-2025-008", progress: 15 }],
  },
];

// Tous les DAOs pour le résumé
const allDaos = [
  {
    id: 1,
    name: "DAO-2025-001",
    team: "Équipe Technique",
    progress: 65,
    deadline: "2025-04-15",
  },
  {
    id: 2,
    name: "DAO-2025-002",
    team: "Équipe Administrative",
    progress: 45,
    deadline: "2025-04-20",
  },
  {
    id: 3,
    name: "DAO-2025-003",
    team: "Équipe Technique",
    progress: 30,
    deadline: "2025-04-25",
  },
  {
    id: 4,
    name: "DAO-2025-004",
    team: "Équipe Administrative",
    progress: 20,
    deadline: "2025-05-01",
  },
  {
    id: 5,
    name: "DAO-2025-005",
    team: "Équipe Technique",
    progress: 85,
    deadline: "2025-04-10",
  },
  {
    id: 6,
    name: "DAO-2025-006",
    team: "Équipe Achats",
    progress: 75,
    deadline: "2025-04-18",
  },
  {
    id: 7,
    name: "DAO-2025-007",
    team: "Équipe Achats",
    progress: 90,
    deadline: "2025-04-12",
  },
  {
    id: 8,
    name: "DAO-2025-008",
    team: "Équipe Qualité",
    progress: 15,
    deadline: "2025-05-05",
  },
];

export default function ChefProjetDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Filtrer les équipes
  const filteredTeams = teamsData.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leader.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || team.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calcul des statistiques
  const stats = {
    totalTeams: teamsData.length,
    activeTeams: teamsData.filter((t) => t.status === "active").length,
    totalMembers: teamsData.reduce((sum, team) => sum + team.memberCount, 0),
    totalDaos: teamsData.reduce((sum, team) => sum + team.daoCount, 0),
    averageProgress: Math.round(
      allDaos.reduce((sum, dao) => sum + dao.progress, 0) / allDaos.length,
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Dashboard Chef de Projet
              </h1>
              <p className="text-gray-600">Gestion des équipes</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Équipes Totales"
            value={stats.totalTeams}
            icon={<Users className="text-blue-600" />}
            color="blue"
          />
          <StatCard
            title="Membres Totaux"
            value={stats.totalMembers}
            icon={<Users className="text-purple-600" />}
            color="purple"
          />
          <StatCard
            title="DAOs Assignés"
            value={stats.totalDaos}
            icon={<Users className="text-orange-600" />}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* SECTION GAUCHE - LISTE DES ÉQUIPES */}
          <div className="space-y-6">
            {/* BARRE DE RECHERCHE ET FILTRES */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Rechercher une équipe ou un membre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterStatus("all")}
                    className={`px-4 py-2 rounded-lg ${filterStatus === "all" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                  >
                    Filtrer
                  </button>
                </div>
              </div>
            </div>

            {/* LISTE DES ÉQUIPES */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Équipes</h2>
              </div>
              <div className="divide-y">
                {filteredTeams.map((team) => (
                  <div
                    key={team.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedTeam === team.id ? "bg-blue-50" : ""}`}
                    onClick={() =>
                      setSelectedTeam(selectedTeam === team.id ? null : team.id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            team.status === "active"
                              ? "bg-green-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <Users
                            className={
                              team.status === "active"
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold">{team.name}</h3>
                          <p className="text-sm text-gray-500">
                            Chef d'équipe: {team.leader}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {team.memberCount} membres
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          className={`transform transition-transform ${selectedTeam === team.id ? "rotate-90" : ""}`}
                        />
                      </div>
                    </div>

                    {/* DÉTAILS DE L'ÉQUIPE (DÉPLIÉ) */}
                    {selectedTeam === team.id && (
                      <div className="mt-4 pt-4 border-t animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* MEMBRES */}
                          <div>
                            <h4 className="font-medium mb-3">
                              Membres de l'équipe
                            </h4>
                            <div className="space-y-3">
                              {team.members.map((member) => (
                                <div
                                  key={member.id}
                                  className="flex items-center justify-between p-2 hover:bg-gray-100 rounded"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        member.status === "available"
                                          ? "bg-green-100"
                                          : member.status === "busy"
                                            ? "bg-yellow-100"
                                            : "bg-gray-100"
                                      }`}
                                    >
                                      <User
                                        size={16}
                                        className={
                                          member.status === "available"
                                            ? "text-green-600"
                                            : member.status === "busy"
                                              ? "text-yellow-600"
                                              : "text-gray-400"
                                        }
                                      />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">
                                        {member.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {member.role}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* DAOS */}
                          <div>
                            <h4 className="font-medium mb-3">
                              Tâches Assignées
                            </h4>
                            <div className="space-y-3">
                              {team.daos.map((dao) => (
                                <Link
                                  key={dao.id}
                                  href={`/dash/ChefProjet/Mes-DAO/${dao.id}`}
                                  className="block p-3 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-sm">
                                      {dao.name}
                                    </span>
                                    <span className="text-sm font-semibold">
                                      {dao.progress}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 h-2 rounded">
                                    <div
                                      className="h-2 bg-blue-600 rounded"
                                      style={{ width: `${dao.progress}%` }}
                                    />
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-100",
    purple: "bg-purple-50 border-purple-100",
    orange: "bg-orange-50 border-orange-100",
  };

  return (
    <div
      className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-xl p-4`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-white">{icon}</div>
      </div>
    </div>
  );
}