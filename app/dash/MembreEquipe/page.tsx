"use client";

import { useState } from "react";
import {
  CheckCircle,
  Clock,
  FileText,
  User,
  Search,
  ChevronDown,
} from "lucide-react";

/* =======================
   DONNÉES DES TÂCHES
======================= */
const tasksData = [
  {
    id: 1,
    name: "Rédaction du cahier des charges",
    dao: "DAO-2025-001 - Rénovation école",
    progress: 85,
    status: "in-progress",
    priority: "medium",
    assignedBy: "Jean Dupont (Chef Projet)",
  },
  {
    id: 2,
    name: "Analyse des coûts matériaux",
    dao: "DAO-2025-002 - Construction centre commercial",
    progress: 45,
    status: "in-progress",
    priority: "high",
    assignedBy: "Marie Lambert (Chef Projet)",
  },
  {
    id: 3,
    name: "Validation des plans architecturaux",
    dao: "DAO-2025-003 - Résidence étudiante",
    progress: 100,
    status: "completed",
    priority: "low",
    assignedBy: "Thomas Martin (Chef Projet)",
  },
  {
    id: 4,
    name: "Préparation de la documentation technique",
    dao: "DAO-2025-001 - Rénovation école",
    progress: 30,
    status: "pending",
    priority: "medium",
    assignedBy: "Jean Dupont (Chef Projet)",
  },
];

/* =======================
   STATISTIQUES
======================= */
const stats = {
  totalTasks: tasksData.length,
  inProgress: tasksData.filter(t => t.status === "in-progress").length,
  completed: tasksData.filter(t => t.status === "completed").length,
};

/* =======================
   COMPOSANT PRINCIPAL
======================= */
export default function MembreEquipeDashboard() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTask, setExpandedTask] = useState<number | null>(null);

  /* Progression modifiable */
  const [taskProgress, setTaskProgress] = useState<Record<number, number>>(
    Object.fromEntries(tasksData.map(t => [t.id, t.progress]))
  );

  /* Filtrage */
  const filteredTasks = tasksData.filter(task => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.dao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "in-progress" && task.status === "in-progress") ||
      (filterStatus === "completed" && task.status === "completed");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================= HEADER ================= */}
      <header className="bg-white border-b p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">
            Bienvenue dans votre espace
          </h1>
          <p className="text-gray-600 mt-1">
            Suivi de vos tâches assignées
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* ================= STAT CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Tâches Totales"
            value={stats.totalTasks}
            icon={<FileText className="text-blue-600" />}
            color="blue"
          />
          <StatCard
            title="En cours"
            value={stats.inProgress}
            icon={<Clock className="text-yellow-600" />}
            color="yellow"
          />
          <StatCard
            title="Terminées"
            value={stats.completed}
            icon={<CheckCircle className="text-green-600" />}
            color="green"
          />
        </div>

        {/* ================= RECHERCHE ================= */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher une tâche ou un DAO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Tous</option>
              <option value="in-progress">En cours</option>
              <option value="completed">Terminées</option>
            </select>
          </div>
        </div>

        {/* ================= LISTE DES TÂCHES ================= */}
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className="bg-white rounded-xl border shadow-sm hover:shadow-md transition"
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() =>
                  setExpandedTask(expandedTask === task.id ? null : task.id)
                }
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{task.name}</h3>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <span>{task.dao}</span>
                      <span className="flex items-center gap-1">
                        <User size={14} /> {task.assignedBy}
                      </span>
                    </div>

                    {/* Progression */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progression</span>
                        <span className="font-medium">
                          {taskProgress[task.id]}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded">
                        <div
                          className={`h-2 rounded ${
                            taskProgress[task.id] < 30
                              ? "bg-red-500"
                              : taskProgress[task.id] < 70
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${taskProgress[task.id]}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* =======================
   STAT CARD
======================= */
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "yellow" | "green";
}) {
  const colors = {
    blue: "bg-blue-50 border-blue-200",
    yellow: "bg-yellow-50 border-yellow-200",
    green: "bg-green-50 border-green-200",
  };

  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 bg-white rounded-lg">{icon}</div>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="font-medium text-gray-800">{title}</p>
    </div>
  );
}
