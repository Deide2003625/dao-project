"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

// Les 15 tâches DAO
const daoTasks = [
  { id: 1, name: "Résumé sommaire DAO et Création du drive" },
  { id: 2, name: "Demande de caution et garanties" },
  { id: 3, name: "Identification et renseignement des profils dans le drive" },
  { id: 4, name: "Identification et renseignement des ABE dans le drive" },
  { id: 5, name: "Légalisation des ABE, diplômes, certificats, attestations et pièces administratives requis" },
  { id: 6, name: "Indication directive d'élaboration de l'offre financier" },
  { id: 7, name: "Elaboration de la méthodologie" },
  { id: 8, name: "Planification prévisionnelle" },
  { id: 9, name: "Identification des références précises des équipements et matériels" },
  { id: 10, name: "Demande de cotation" },
  { id: 11, name: "Elaboration du squelette des offres" },
  { id: 12, name: "Rédaction du contenu des OF et OT" },
  { id: 13, name: "Contrôle et validation des offres" },
  { id: 14, name: "Impression et présentation des offres (Valider l'étiquette)" },
  { id: 15, name: "Dépôt des offres et clôture" }
];

// Données des DAO avec progression des tâches
const daoData = [
  {
    id: 1,
    name: "DAO-2025-001",
    reference: "Fourniture équipements",
    authority: "Ministère Éducation",
    closingDate: "10/01/2026",
    status: "en cours",
    tasksProgress: [100, 80, 60, 40, 30, 25, 20, 15, 10, 5, 0, 0, 0, 0, 0] // Exemple de progression rapide
  },
  {
    id: 2,
    name: "DAO-2025-002",
    reference: "Construction bâtiment",
    authority: "Ville de Paris",
    closingDate: "15/02/2026",
    status: "validé",
    tasksProgress: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100] // Toutes terminées
  },
  {
    id: 3,
    name: "DAO-2025-003",
    reference: "Logiciel gestion",
    authority: "Hôpital Central",
    closingDate: "20/03/2026",
    status: "rejeté",
    tasksProgress: [100, 100, 100, 100, 80, 60, 40, 20, 10, 5, 0, 0, 0, 0, 0] // Progression moyenne, bloqué
  }
];

export default function Page() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [selectedDao, setSelectedDao] = useState(daoData[0]);
  const [speedFilter, setSpeedFilter] = useState("all"); // "all", "fast", "slow", "notStarted"

  useEffect(() => {
    if (chartRef.current) {
      // Détruire l'ancien graphique s'il existe
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        // Filtrer les tâches selon la vitesse
        const filteredTasks = filterTasksBySpeed(selectedDao.tasksProgress);
        
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: filteredTasks.map(task => `T${task.id}`),
            datasets: [
              {
                label: 'Progression (%)',
                data: filteredTasks.map(task => task.progress),
                backgroundColor: filteredTasks.map(task => getProgressColor(task.progress)),
                borderColor: filteredTasks.map(task => getBorderColor(task.progress)),
                borderWidth: 1,
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // Graphique horizontal pour mieux voir les 15 tâches
            scales: {
              x: {
                beginAtZero: true,
                max: 100,
                grid: {
                  color: 'rgba(0,0,0,0.05)'
                },
                title: {
                  display: true,
                  text: 'Progression (%)'
                }
              },
              y: {
                grid: {
                  display: false
                },
                ticks: {
                  callback: function(value, index) {
                    // Afficher les noms des tâches tronqués
                    const taskName = filteredTasks[index]?.name || '';
                    return taskName.length > 30 ? taskName.substring(0, 30) + '...' : taskName;
                  }
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  boxWidth: 12,
                  padding: 20
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const taskIndex = context.dataIndex;
                    const task = filteredTasks[taskIndex];
                    const progress = context.parsed.x;
                    return [
                      `Tâche ${task.id + 1}: ${task.name}`,
                      `Progression: ${progress}%`,
                      `Statut: ${getProgressStatus(progress)}`
                    ];
                  }
                }
              },
              title: {
                display: true,
                text: `Progression des 15 tâches - ${selectedDao.name}`,
                font: {
                  size: 16
                }
              }
            }
          }
        });
      }
    }
  }, [selectedDao, speedFilter]);

  // Filtrer les tâches selon la vitesse de progression
  const filterTasksBySpeed = (progressArray: number[]) => {
    return daoTasks.map((task, index) => ({
      ...task,
      progress: progressArray[index] || 0,
      speed: getTaskSpeed(progressArray[index] || 0)
    })).filter(task => {
      if (speedFilter === "all") return true;
      if (speedFilter === "fast") return task.speed === "fast";
      if (speedFilter === "slow") return task.speed === "slow";
      if (speedFilter === "notStarted") return task.speed === "notStarted";
      return true;
    });
  };

  // Déterminer la vitesse d'une tâche
  const getTaskSpeed = (progress: number) => {
    if (progress === 0) return "notStarted";
    if (progress === 100) return "fast";
    if (progress >= 70) return "fast";
    if (progress >= 30) return "slow";
    return "verySlow";
  };

  // Couleur selon la progression
  const getProgressColor = (progress: number) => {
    if (progress === 100) return '#28a745'; // Vert - Terminé
    if (progress >= 70) return '#20c997'; // Vert clair - Bien avancé
    if (progress >= 40) return '#ffc107'; // Jaune - En cours
    if (progress >= 10) return '#fd7e14'; // Orange - Débuté
    return '#dc3545'; // Rouge - Non commencé
  };

  const getBorderColor = (progress: number) => {
    if (progress === 100) return '#218838';
    if (progress >= 70) return '#1ba87e';
    if (progress >= 40) return '#e0a800';
    if (progress >= 10) return '#e06c14';
    return '#c82333';
  };

  const getProgressStatus = (progress: number) => {
    if (progress === 100) return "Terminé";
    if (progress >= 70) return "Bien avancé";
    if (progress >= 40) return "En bonne voie";
    if (progress >= 10) return "Débuté";
    return "Non commencé";
  };

  // Calculer la vitesse moyenne du DAO
  const calculateAverageSpeed = (progressArray: number[]) => {
    const startedTasks = progressArray.filter(p => p > 0);
    if (startedTasks.length === 0) return 0;
    return startedTasks.reduce((a, b) => a + b, 0) / startedTasks.length;
  };

  // Pourcentage de tâches terminées
  const getCompletedPercentage = (progressArray: number[]) => {
    const completed = progressArray.filter(p => p === 100).length;
    return Math.round((completed / progressArray.length) * 100);
  };

  const handleDaoSelect = (daoId: number) => {
    const dao = daoData.find(d => d.id === daoId);
    if (dao) {
      setSelectedDao(dao);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validé':
        return <span className="badge badge-success">Validé</span>;
      case 'en cours':
        return <span className="badge badge-warning">En cours</span>;
      case 'rejeté':
        return <span className="badge badge-danger">A risque</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="row">
        <div className="col-12 grid-margin">
          <div className="d-flex justify-content-between flex-wrap">
            <div className="d-flex align-items-end flex-wrap">
              <div className="mr-md-3 mr-xl-5">
                <h2>Direction Générale</h2>
                <p className="mb-md-0">
                  Tableau de bord
                </p>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-end flex-wrap">
              <button className="btn btn-primary">
                Exporter le rapport des DAO
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* ================= TABS ================= */}
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body dashboard-tabs p-0">
              <ul className="nav nav-tabs px-4" role="tablist">
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    data-bs-toggle="tab"
                    href="#overview"
                  >
                    Vue générale
                  </a>
                </li>
              </ul>

              <div className="tab-content py-0 px-0">
                {/* ================= OVERVIEW ================= */}
                <div
                  className="tab-pane fade show active"
                  id="overview"
                >
                  <div className="d-flex flex-wrap justify-content-xl-between">
                    <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3">
                      <i className="mdi mdi-folder-multiple icon-lg mr-3 text-primary"></i>
                      <div>
                        <small className="text-muted">Total DAO</small>
                        <h5 className="mb-0">3</h5>
                      </div>
                    </div>

                    <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3">
                      <i className="mdi mdi-progress-clock icon-lg mr-3 text-warning"></i>
                      <div>
                        <small className="text-muted">DAO en cours</small>
                        <h5 className="mb-0">1</h5>
                      </div>
                    </div>

                    <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3">
                      <i className="mdi mdi-alert mr-3 icon-lg text-danger"></i>
                      <div>
                        <small className="text-muted">DAO à risque</small>
                        <h5 className="mb-0">1</h5>
                      </div>
                    </div>

                    <div className="d-flex flex-grow-1 align-items-center justify-content-center p-3">
                      <i className="mdi mdi-check-circle icon-lg mr-3 text-success"></i>
                      <div>
                        <small className="text-muted">DAO terminés</small>
                        <h5 className="mb-0">1</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ================= GRAPHIQUE DES TÂCHES ================= */}
      <div className="row">
        <div className="col-md-8 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="card-title mb-0">Progression des tâches</h4>
                <div className="btn-group">
                  <button 
                    className={`btn btn-sm ${selectedDao.id === 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleDaoSelect(1)}
                  >
                    DAO-001
                  </button>
                  <button 
                    className={`btn btn-sm ${selectedDao.id === 2 ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleDaoSelect(2)}
                  >
                    DAO-002
                  </button>
                  <button 
                    className={`btn btn-sm ${selectedDao.id === 3 ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleDaoSelect(3)}
                  >
                    DAO-003
                  </button>
                </div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <p className="text-muted mb-0">
                  Suivi du <strong>{selectedDao.name}</strong> : {selectedDao.reference}
                </p>
              </div>
              <div className="chart-container" style={{ height: "500px", position: "relative" }}>
                <canvas ref={chartRef} id="daoBarChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABLE DAO ================= */}
      <div className="row">
        <div className="col-12 stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <p className="card-title mb-0">Liste des DAO</p>
                <small className="text-muted">Cliquez sur "Sélectionner" pour voir le détail des tâches</small>
              </div>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Référence</th>
                      <th>Autorité contractante</th>
                      <th>Date de clôture</th>
                      <th>Status</th>
                      <th>Tâches terminées</th>
                      <th>Progression moyenne</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daoData.map((dao) => (
                      <tr 
                        key={dao.id} 
                        className={selectedDao.id === dao.id ? 'table-primary' : ''}
                      >
                        <td>{dao.name}</td>
                        <td>{dao.reference}</td>
                        <td>{dao.authority}</td>
                        <td>{dao.closingDate}</td>
                        <td>{getStatusBadge(dao.status)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="text-success mr-1">
                              {dao.tasksProgress.filter(p => p === 100).length}
                            </span>
                            <span>/15</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 mr-2" style={{ height: "8px" }}>
                              <div
                                className="progress-bar bg-primary"
                                role="progressbar"
                                style={{ width: `${calculateAverageSpeed(dao.tasksProgress)}%` }}
                              ></div>
                            </div>
                            <span>{Math.round(calculateAverageSpeed(dao.tasksProgress))}%</span>
                          </div>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-info ml-2">
                            <a href="/dash/DirecteurGeneral/task">Détails</a>
                          </button>
                        </td>
                      </tr>
                    ))}
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
