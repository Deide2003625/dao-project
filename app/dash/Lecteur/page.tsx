"use client";

import { useEffect, useState, useMemo } from "react";
import Chart from "chart.js/auto";

interface DAO {
  id: number;
  reference?: string;
  objet?: string;
  autorite?: string;
  date_depot?: string;
  statut?: string;
  created_at?: string;
  numero?: string;
  description?: string;
  chef_id?: number;
  team_id?: string;
  groupement?: string;
  nom_partenaire?: string;
}

interface Task {
  id: number;
  dao_id: number;
  id_task: number;
  titre?: string;
  description?: string;
  statut?: string;
  progress?: number;
  date_creation?: string;
  date_echeance?: string;
  priorite?: string;
  assigned_to?: number;
}

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  url_photo: string;
  role_id: number;
  roleName: string;
  roleLabel: string;
}

export default function LecteurDashboard() {
  const [daos, setDaos] = useState<DAO[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDao, setSelectedDao] = useState<DAO | null>(null);
  const [chartsReady, setChartsReady] = useState(false);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch DAOs
        const daosResponse = await fetch('/api/daos');
        if (daosResponse.ok) {
          const daosData = await daosResponse.json();
          setDaos(daosData.success ? daosData.data : []);
        }

        // Fetch Tasks
        const tasksResponse = await fetch('/api/tasks');
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData.success ? tasksData.data : []);
        }

        // Fetch Users
        const usersResponse = await fetch('/api/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.success ? usersData.data : []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set first DAO as selected when data is loaded
  useEffect(() => {
    if (daos.length > 0 && !selectedDao) {
      setSelectedDao(daos[0]);
    }
  }, [daos, selectedDao]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalDaos: daos.length,
      completedDaos: daos.filter(d => {
        const statut = String(d.statut || "").toUpperCase();
        return statut === "TERMINEE" || statut === "TERMINE";
      }).length,
      inProgressDaos: daos.filter(d => {
        const statut = String(d.statut || "").toUpperCase();
        if (statut === "TERMINEE" || statut === "TERMINE") {
          return false;
        }
        if (!d.date_depot) {
          return true;
        }
        const dateDepot = new Date(d.date_depot);
        const today = new Date();
        const diffMs = dateDepot.getTime() - today.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return diffDays >= 4; // Changé de 5 à 4 pour inclure le cas 4 jours
      }).length,
      atRiskDaos: daos.filter(d => {
        const statut = String(d.statut || "").toUpperCase();
        if (statut === "TERMINEE" || statut === "TERMINE") {
          return false;
        }
        if (!d.date_depot) {
          return false;
        }
        const dateDepot = new Date(d.date_depot);
        const today = new Date();
        const diffMs = dateDepot.getTime() - today.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
      }).length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.progress === 100).length,
      totalUsers: users.length,
    };
  }, [daos, tasks, users]);

  // Get tasks for selected DAO
  const selectedDaoTasks = useMemo(() => {
    if (!selectedDao) return [];
    return tasks.filter(task => task.dao_id === selectedDao.id);
  }, [selectedDao, tasks]);

  // Calculate DAO status
  const getDAOStatus = (dao: DAO) => {
    const statut = String(dao.statut || "").toUpperCase();
    
    if (statut === "TERMINEE" || statut === "TERMINE") {
      return { label: "Terminée", className: "px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800" };
    }
    
    if (!dao.date_depot) {
      return { label: "En cours", className: "px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800" };
    }
    
    const dateDepot = new Date(dao.date_depot);
    const today = new Date();
    const diffMs = dateDepot.getTime() - today.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 4) { // Changé de 5 à 4 pour cohérence
      return { label: "En cours", className: "px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800" };
    }
    
    if (diffDays <= 3) {
      return { label: "À risque", className: "px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800" };
    }
    
    // Ce cas ne devrait plus arriver avec la correction, mais on le garde pour sécurité
    return { label: "En cours", className: "px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800" };
  };

  // Initialize charts - Only create once, then update data
  useEffect(() => {
    // Wait for data to be loaded and selected DAO to be set
    if (!selectedDao || selectedDaoTasks.length === 0) return;

    // Create charts only once
    const timer = setTimeout(() => {
      const progressCtx = document.getElementById('progressChart') as HTMLCanvasElement;
      const statusCtx = document.getElementById('statusChart') as HTMLCanvasElement;
      
      if (progressCtx && statusCtx) {
        // Check if charts already exist
        const existingProgressChart = Chart.getChart('progressChart');
        const existingStatusChart = Chart.getChart('statusChart');
        
        if (!existingProgressChart) {
          // Create progress chart
          new Chart(progressCtx, {
            type: 'bar',
            data: {
              labels: selectedDaoTasks.sort((a, b) => a.id_task - b.id_task).map(t => t.id_task.toString()),
              datasets: [{
                label: 'Progression (%)',
                data: selectedDaoTasks.sort((a, b) => a.id_task - b.id_task).map(t => t.progress || 0),
                backgroundColor: selectedDaoTasks.sort((a, b) => a.id_task - b.id_task).map(t => {
                  const progress = t.progress || 0;
                  if (progress === 100) return 'rgba(34, 197, 94, 0.8)';
                  if (progress >= 75) return 'rgba(59, 130, 246, 0.8)';
                  if (progress >= 50) return 'rgba(251, 146, 60, 0.8)';
                  if (progress >= 25) return 'rgba(250, 204, 21, 0.8)';
                  return 'rgba(239, 68, 68, 0.8)';
                }),
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              },
              animation: {
                duration: 0 // Disable animation for faster updates
              }
            }
          });
        } else {
          // Update existing progress chart data
          const sortedTasks = selectedDaoTasks.sort((a, b) => a.id_task - b.id_task);
          existingProgressChart.data.labels = sortedTasks.map(t => t.id_task.toString());
          existingProgressChart.data.datasets[0].data = sortedTasks.map(t => t.progress || 0);
          existingProgressChart.data.datasets[0].backgroundColor = sortedTasks.map(t => {
            const progress = t.progress || 0;
            if (progress === 100) return 'rgba(34, 197, 94, 0.8)';
            if (progress >= 75) return 'rgba(59, 130, 246, 0.8)';
            if (progress >= 50) return 'rgba(251, 146, 60, 0.8)';
            if (progress >= 25) return 'rgba(250, 204, 21, 0.8)';
            return 'rgba(239, 68, 68, 0.8)';
          });
          existingProgressChart.update('none'); // Update without animation
        }
        
        if (!existingStatusChart) {
          // Create status chart
          const statusCounts = {
            completed: selectedDaoTasks.filter(t => (t.progress || 0) === 100).length,
            inProgress: selectedDaoTasks.filter(t => (t.progress || 0) > 0 && (t.progress || 0) < 100).length,
            notStarted: selectedDaoTasks.filter(t => (t.progress || 0) === 0).length,
          };

          new Chart(statusCtx, {
            type: 'doughnut',
            data: {
              labels: ['Terminées', 'En cours', 'Non démarrées'],
              datasets: [{
                data: [statusCounts.completed, statusCounts.inProgress, statusCounts.notStarted],
                backgroundColor: [
                  'rgba(34, 197, 94, 0.8)',
                  'rgba(251, 146, 60, 0.8)',
                  'rgba(239, 68, 68, 0.8)'
                ]
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              animation: {
                duration: 0 // Disable animation for faster updates
              }
            }
          });
        } else {
          // Update existing status chart data
          const statusCounts = {
            completed: selectedDaoTasks.filter(t => (t.progress || 0) === 100).length,
            inProgress: selectedDaoTasks.filter(t => (t.progress || 0) > 0 && (t.progress || 0) < 100).length,
            notStarted: selectedDaoTasks.filter(t => (t.progress || 0) === 0).length,
          };
          
          existingStatusChart.data.datasets[0].data = [
            statusCounts.completed, 
            statusCounts.inProgress, 
            statusCounts.notStarted
          ];
          existingStatusChart.update('none'); // Update without animation
        }
        
        setChartsReady(true);
      }
    }, 100); // Increased delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, [selectedDao, selectedDaoTasks]);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      const progressChart = Chart.getChart('progressChart');
      if (progressChart) {
        progressChart.destroy();
      }
      
      const statusChart = Chart.getChart('statusChart');
      if (statusChart) {
        statusChart.destroy();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard Lecteur...</p>
          <p className="text-sm text-gray-500 mt-2">Récupération des DAOs et tâches</p>
        </div>
      </div>
    );
  }

  if (daos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">Aucun DAO disponible</p>
            <p className="text-sm mt-1">Veuillez contacter l'administrateur pour ajouter des DAOs</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Lecteur</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble des DAO et tâches</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total DAOs</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalDaos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Terminées</p>
              <p className="text-2xl font-bold text-gray-800">{stats.completedDaos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-gray-800">{stats.inProgressDaos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">À risque</p>
              <p className="text-2xl font-bold text-gray-800">{stats.atRiskDaos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* DAO Selection and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* DAO Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sélectionner un DAO</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {daos.map(dao => {
              const status = getDAOStatus(dao);
              return (
                <div
                  key={dao.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedDao?.id === dao.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDao(dao)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{dao.reference || `DAO-${dao.id}`}</p>
                      <p className="text-sm text-gray-600">{dao.objet || 'Sans objet'}</p>
                    </div>
                    <span className={status.className}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Progression des tâches {selectedDao ? `- ${selectedDao.reference}` : ''}
          </h2>
          <div className="h-64">
            {selectedDaoTasks.length > 0 ? (
              <canvas id="progressChart"></canvas>
            ) : loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Chargement du graphique...</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-500">Aucune tâche pour ce DAO</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Chart and Task List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribution des statuts</h2>
          <div className="h-64">
            {selectedDaoTasks.length > 0 ? (
              <canvas id="statusChart"></canvas>
            ) : loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Chargement du graphique...</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-500">Aucune tâche pour ce DAO</p>
              </div>
            )}
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Liste des tâches {selectedDao ? `- ${selectedDao.reference}` : ''}
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedDaoTasks.length > 0 ? (
              selectedDaoTasks.map(task => (
                <div key={task.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-gray-800">{task.titre || `Tâche ${task.id}`}</p>
                    <span className="text-sm text-gray-600">{task.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Chargement des tâches...</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48">
                <p className="text-sm text-gray-500">Aucune tâche pour ce DAO</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
