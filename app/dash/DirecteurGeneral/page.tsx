"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import {
  FileText,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";

interface DAO {
  id: number;
  reference: string;
  objet: string;
  autorite?: string;
  date_depot?: string;
  statut: string;
  created_at?: string;
  updated_at?: string;
}

interface Task {
  id: number;
  titre: string;
  description: string;
  dao_id: number;
  statut: string;
  progress: number;
  date_creation: string;
  date_echeance: string;
  priorite: string;
  assigned_to: number;
}

interface User {
  id: number;
  username: string;
  role_id: string;
  url_photo: string | null;
}

export default function DirecteurGeneralDashboard() {
  const [daos, setDaos] = useState<DAO[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDAO, setSelectedDAO] = useState<DAO | null>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);

  // Fetch current user
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Fetch data
  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    console.log("=== DÉBUT FETCH DATA ===");
    try {
      const [daosResponse, tasksResponse, usersResponse] = await Promise.all([
        fetch("/api/daos"),
        fetch("/api/tasks"),
        fetch("/api/users")
      ]);

      console.log("Réponses API reçues:");
      console.log("- DAOs status:", daosResponse.status);
      console.log("- Tasks status:", tasksResponse.status);
      console.log("- Users status:", usersResponse.status);

      if (daosResponse.ok) {
        const daosResult = await daosResponse.json();
        console.log("Résultat DAOs API:", daosResult);
        setDaos(daosResult.data || []);
      } else {
        console.error("Erreur DAOs:", await daosResponse.text());
      }

      if (tasksResponse.ok) {
        const tasksResult = await tasksResponse.json();
        console.log("Résultat Tasks API:", tasksResult);
        setTasks(tasksResult.data || []);
      } else {
        console.error("Erreur Tasks:", await tasksResponse.text());
      }

      if (usersResponse.ok) {
        const usersResult = await usersResponse.json();
        console.log("Résultat Users API:", usersResult);
        setUsers(usersResult.data || []);
      } else {
        console.error("Erreur Users:", await usersResponse.text());
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      console.log("=== FIN FETCH DATA ===");
    }
  };

  // Initialize charts
  useEffect(() => {
    if (!loading && daos.length > 0) {
      initializeCharts();
    }
  }, [loading, daos, tasks, selectedDAO]);

  const initializeCharts = () => {
    console.log("Initialisation des graphiques...");
    console.log("Nombre de DAO:", daos.length);
    console.log("Nombre de tâches:", tasks.length);

    // Global DAO Progress Chart
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        const daoProgressData = daos.map(dao => {
          const daoTasks = tasks.filter(task => task.dao_id === dao.id);
          console.log(`DAO ${dao.id} (${dao.reference}): ${daoTasks.length} tâches`);
          
          if (daoTasks.length === 0) return 0;
          const avgProgress = daoTasks.reduce((sum, task) => sum + (task.progress || 0), 0) / daoTasks.length;
          console.log(`Progression moyenne: ${avgProgress}%`);
          return Math.round(avgProgress);
        });

        console.log("Données de progression DAO:", daoProgressData);

        new Chart(ctx, {
          type: "line",
          data: {
            labels: daos.map(dao => dao.reference),
            datasets: [
              {
                label: "Progression globale (%)",
                data: daoProgressData,
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.4,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "top",
              },
              title: {
                display: true,
                text: "Progression des DAO",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
              },
            },
          },
        });
      }
    }

    // Status Distribution Pie Chart
    if (pieChartRef.current) {
      const ctx = pieChartRef.current.getContext("2d");
      if (ctx) {
        const statusCounts = {
          "en cours": daos.filter(d => d.statut === "en cours").length,
          "validé": daos.filter(d => d.statut === "validé").length,
          "terminé": daos.filter(d => d.statut === "terminé").length,
          "annulé": daos.filter(d => d.statut === "annulé").length,
        };

        console.log("Répartition des statuts DAO:", statusCounts);

        new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: Object.keys(statusCounts),
            datasets: [
              {
                data: Object.values(statusCounts),
                backgroundColor: [
                  "rgba(59, 130, 246, 0.8)",
                  "rgba(34, 197, 94, 0.8)",
                  "rgba(168, 85, 247, 0.8)",
                  "rgba(239, 68, 68, 0.8)",
                ],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "bottom",
              },
              title: {
                display: true,
                text: "Répartition des statuts DAO",
              },
            },
          },
        });
      }
    }

    // Tasks Priority Bar Chart
    if (barChartRef.current) {
      const ctx = barChartRef.current.getContext("2d");
      if (ctx) {
        const priorityCounts = {
          "haute": tasks.filter(t => t.priorite === "haute").length,
          "moyenne": tasks.filter(t => t.priorite === "moyenne").length,
          "basse": tasks.filter(t => t.priorite === "basse").length,
        };

        console.log("Répartition des priorités tâches:", priorityCounts);

        new Chart(ctx, {
          type: "bar",
          data: {
            labels: Object.keys(priorityCounts),
            datasets: [
              {
                label: "Nombre de tâches",
                data: Object.values(priorityCounts),
                backgroundColor: [
                  "rgba(239, 68, 68, 0.8)",
                  "rgba(245, 158, 11, 0.8)",
                  "rgba(34, 197, 94, 0.8)",
                ],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: true,
                text: "Répartition des priorités",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    }
  };

  const stats = {
    totalDaos: daos.length,
    atRiskDaos: daos.filter(d => {
      // Même logique que l'admin pour "À risque"
      const statut = String(d.statut || "").toUpperCase();
      
      // Si terminé, pas à risque
      if (statut === "TERMINEE" || statut === "TERMINE") {
        return false;
      }
      
      // Si pas de date_depot, considérer comme en cours (pas à risque)
      if (!d.date_depot) {
        return false;
      }
      
      const dateDepot = new Date(d.date_depot);
      const today = new Date();
      // Nombre de jours restants : date_depot - aujourd'hui
      const diffMs = dateDepot.getTime() - today.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      // À risque si ≤ 3 jours (même logique que admin)
      return diffDays <= 3;
    }).length,
    inProgressDaos: daos.filter(d => {
      // Même logique que l'admin pour "En cours"
      const statut = String(d.statut || "").toUpperCase();
      
      // Si terminé, pas en cours
      if (statut === "TERMINEE" || statut === "TERMINE") {
        return false;
      }
      
      // Si pas de date_depot, considérer comme en cours
      if (!d.date_depot) {
        return true;
      }
      
      const dateDepot = new Date(d.date_depot);
      const today = new Date();
      // Nombre de jours restants : date_depot - aujourd'hui
      const diffMs = dateDepot.getTime() - today.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      // En cours si ≥ 5 jours (même logique que admin)
      return diffDays >= 5;
    }).length,
    totalUsers: users.length,
  };

  // Logs pour déboguer
  console.log("=== STATISTIQUES DASHBOARD ===");
  console.log("DAOs récupérés:", daos.length);
  console.log("Tâches récupérées:", tasks.length);
  console.log("Utilisateurs récupérés:", users.length);
  console.log("Statuts DAO:", daos.map(d => ({ id: d.id, statut: d.statut, date_depot: d.date_depot })));
  console.log("Statuts tâches:", tasks.map(t => ({ id: t.id, statut: t.statut, progress: t.progress })));
  console.log("Stats calculées:", stats);
  
  // Logs détaillés pour les DAO à risque (même logique que admin)
  const today = new Date();
  const atRiskDaos = daos.filter(d => {
    const statut = String(d.statut || "").toUpperCase();
    
    if (statut === "TERMINEE" || statut === "TERMINE") {
      return false;
    }
    
    if (!d.date_depot) {
      return false;
    }
    
    const dateDepot = new Date(d.date_depot);
    const diffMs = dateDepot.getTime() - today.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays <= 3;
  });
  
  const inProgressDaos = daos.filter(d => {
    const statut = String(d.statut || "").toUpperCase();
    
    if (statut === "TERMINEE" || statut === "TERMINE") {
      return false;
    }
    
    if (!d.date_depot) {
      return true;
    }
    
    const dateDepot = new Date(d.date_depot);
    const diffMs = dateDepot.getTime() - today.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays >= 5;
  });
  
  console.log("DAOs à risque (≤ 3 jours):", atRiskDaos.map(d => ({ 
    id: d.id, 
    reference: d.reference, 
    date_depot: d.date_depot,
    jours_restants: d.date_depot ? Math.floor((new Date(d.date_depot).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'
  })));
  
  console.log("DAOs en cours (≥ 5 jours):", inProgressDaos.map(d => ({ 
    id: d.id, 
    reference: d.reference, 
    date_depot: d.date_depot,
    jours_restants: d.date_depot ? Math.floor((new Date(d.date_depot).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'
  })));

  const getDAOStatusColor = (status: string) => {
    switch (status) {
      case "en cours": return "text-blue-600 bg-blue-100";
      case "validé": return "text-green-600 bg-green-100";
      case "terminé": return "text-purple-600 bg-purple-100";
      case "annulé": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "haute": return "text-red-600 bg-red-100";
      case "moyenne": return "text-orange-600 bg-orange-100";
      case "basse": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Directeur Général</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{currentUser?.username || "Directeur Général"}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total DAO"
            value={stats.totalDaos}
            icon={<FileText className="w-6 h-6 text-blue-600" />}
            color="blue"
          />
          <StatCard
            title="À risque"
            value={stats.atRiskDaos}
            icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
            color="yellow"
          />
          <StatCard
            title="En cours"
            value={stats.inProgressDaos}
            icon={<Activity className="w-6 h-6 text-green-600" />}
            color="green"
          />
          <StatCard
            title="Utilisateurs"
            value={stats.totalUsers}
            icon={<Users className="w-6 h-6 text-purple-600" />}
            color="purple"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Progression des DAO</h3>
            <canvas ref={chartRef}></canvas>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Répartition des statuts</h3>
            <canvas ref={pieChartRef}></canvas>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h3 className="text-lg font-semibold mb-4">Répartition des priorités</h3>
          <canvas ref={barChartRef}></canvas>
        </div>

        {/* DAOs List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Liste des DAO</h3>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => window.location.reload()}
              >
                Rafraîchir
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Objet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Autorité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de dépôt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progression
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                        Chargement...
                      </div>
                    </td>
                  </tr>
                ) : daos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Aucun DAO trouvé
                    </td>
                  </tr>
                ) : (
                  daos.map((dao) => {
                    const daoTasks = tasks.filter(task => task.dao_id === dao.id);
                    const avgProgress = daoTasks.length > 0 
                      ? Math.round(daoTasks.reduce((sum, task) => sum + (task.progress || 0), 0) / daoTasks.length)
                      : 0;

                    // Calcul du statut comme l'admin
                    const computeStatus = () => {
                      const statut = String(dao.statut || "").toUpperCase();
                      
                      if (statut === "TERMINEE" || statut === "TERMINE") {
                        return {
                          label: "Terminée",
                          className: "px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
                        };
                      }
                      
                      if (!dao.date_depot) {
                        return {
                          label: "En cours",
                          className: "px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800"
                        };
                      }
                      
                      const dateDepot = new Date(dao.date_depot);
                      const today = new Date();
                      const diffMs = dateDepot.getTime() - today.getTime();
                      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                      
                      if (diffDays >= 5) {
                        return {
                          label: "En cours",
                          className: "px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800"
                        };
                      }
                      
                      if (diffDays <= 3) {
                        return {
                          label: "À risque",
                          className: "px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800"
                        };
                      }
                      
                      return {
                        label: "En cours",
                        className: "px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800"
                      };
                    };

                    const status = computeStatus();

                    return (
                      <tr key={dao.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {dao.reference}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {dao.objet}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {dao.autorite || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dao.date_depot ? new Date(dao.date_depot).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={status.className}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 mr-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${avgProgress}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-600">{avgProgress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            onClick={() => {
                              // Rediriger vers les détails du DAO
                              window.location.href = `/dash/DirecteurGeneral/task?id=${dao.id}`;
                            }}
                          >
                            Détails
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
  color: "blue" | "green" | "yellow" | "purple";
}) {
  const colors = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    yellow: "bg-yellow-50 border-yellow-200",
    purple: "bg-purple-50 border-purple-200",
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
