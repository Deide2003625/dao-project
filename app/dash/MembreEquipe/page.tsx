"use client";

import { useState } from "react";
import { CheckCircle, Clock, AlertCircle, FileText, Calendar, User, Filter, Search, ChevronDown } from "lucide-react";

// Données simulées des tâches pour un membre d'équipe
const tasksData = [
  {
    id: 1,
    name: "Rédaction du cahier des charges",
    dao: "DAO-2025-001 - Rénovation école",
    progress: 85,
    status: "in-progress",
    deadline: "2025-04-15",
    priority: "medium",
    assignedBy: "Jean Dupont (Chef Projet)",
    estimatedTime: "3 jours",
    description: "Rédaction complète du cahier des charges technique"
  },
  {
    id: 2,
    name: "Analyse des coûts matériaux",
    dao: "DAO-2025-002 - Construction centre commercial",
    progress: 45,
    status: "in-progress",
    deadline: "2025-04-20",
    priority: "high",
    assignedBy: "Marie Lambert (Chef Projet)",
    estimatedTime: "5 jours",
    description: "Analyse détaillée des coûts des matériaux de construction"
  },
  {
    id: 3,
    name: "Validation des plans architecturaux",
    dao: "DAO-2025-003 - Résidence étudiante",
    progress: 100,
    status: "completed",
    deadline: "2025-04-10",
    priority: "low",
    assignedBy: "Thomas Martin (Chef Projet)",
    estimatedTime: "2 jours",
    description: "Validation finale des plans avec l'architecte"
  },
  {
    id: 4,
    name: "Préparation de la documentation technique",
    dao: "DAO-2025-001 - Rénovation école",
    progress: 30,
    status: "pending",
    deadline: "2025-04-25",
    priority: "medium",
    assignedBy: "Jean Dupont (Chef Projet)",
    estimatedTime: "4 jours",
    description: "Préparation de la documentation technique complète"
  },
  {
    id: 5,
    name: "Contrôle qualité des matériaux",
    dao: "DAO-2025-004 - Hôpital régional",
    progress: 0,
    status: "not-started",
    deadline: "2025-05-01",
    priority: "high",
    assignedBy: "Sophie Bernard (Chef Projet)",
    estimatedTime: "6 jours",
    description: "Contrôle qualité des matériaux de construction"
  }
];

// Calcul des statistiques
const stats = {
  totalTasks: tasksData.length,
  inProgress: tasksData.filter(t => t.status === "in-progress").length,
  completed: tasksData.filter(t => t.status === "completed").length,
  pending: tasksData.filter(t => t.status === "pending" || t.status === "not-started").length,
  urgentTasks: tasksData.filter(t => t.priority === "high" && t.progress < 50).length
};

export default function MembreEquipeDashboard() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTask, setExpandedTask] = useState<number | null>(null);

  // Filtrer les tâches
  const filteredTasks = tasksData.filter(task => {
    const matchesSearch = 
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.dao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "in-progress" && task.status === "in-progress") ||
      (filterStatus === "completed" && task.status === "completed") ||
      (filterStatus === "pending" && (task.status === "pending" || task.status === "not-started"));
    
    return matchesSearch && matchesStatus;
  });

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Bienvenue dans votre espace,</h1>
              <p className="text-gray-600 mt-2">Voici l'état de vos tâches assignées</p>
            </div>
            <div className="flex items-center gap-3">
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Tâches Totales"
            value={stats.totalTasks}
            icon={<FileText className="text-blue-600" />}
            color="blue"
            description="15"
          />
          <StatCard
            title="En Cours"
            value={stats.inProgress}
            icon={<Clock className="text-yellow-600" />}
            color="yellow"
            description="7"
          />
          <StatCard
            title="Terminées"
            value={stats.completed}
            icon={<CheckCircle className="text-green-600" />}
            color="green"
            description="9"
          />
        </div>

        {/* BARRE DE RECHERCHE ET FILTRES */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher une tâche, un DAO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="in-progress">En cours</option>
                <option value="completed">Terminées</option>
              </select>
            </div>
          </div>
        </div>

        {/* LISTE DES TÂCHES */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Mes Tâches</h2>
            <p className="text-sm text-gray-500 mt-1">{filteredTasks.length} tâche(s) trouvée(s)</p>
          </div>
          
          <div className="divide-y">
            {filteredTasks.map((task) => (
              <div key={task.id} className="hover:bg-gray-50 transition-colors">
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Indicateur de priorité */}
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        task.priority === "high" ? "bg-red-500" :
                        task.priority === "medium" ? "bg-yellow-500" :
                        "bg-green-500"
                      }`} />
                      
                      {/* Informations principales */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{task.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === "completed" ? "bg-green-100 text-green-800" :
                            task.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {task.status === "completed" ? "Terminée" :
                             task.status === "in-progress" ? "En cours" :
                             "En attente"}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{task.dao}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">Assignée par: {task.assignedBy}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">Échéance: {formatDate(task.deadline)}</span>
                          </div>
                        </div>
                        
                        {/* Barre de progression */}
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progression</span>
                            <span className="font-medium">{task.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded">
                            <div 
                              className={`h-2 rounded ${
                                task.progress < 30 ? "bg-red-500" :
                                task.progress < 70 ? "bg-yellow-500" :
                                "bg-green-500"
                              }`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bouton d'expansion */}
                    <ChevronDown 
                      className={`transform transition-transform ${expandedTask === task.id ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>
                
                {/* DÉTAILS EXPANDUS */}
                {expandedTask === task.id && (
                  <div className="px-6 pb-6 pt-2 border-t bg-gray-50 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Description détaillée</h4>
                        <p className="text-gray-700">{task.description}</p>
                        
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Information complémentaire</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Temps estimé:</span>
                              <span className="font-medium">{task.estimatedTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Priorité:</span>
                              <span className={`font-medium ${
                                task.priority === "high" ? "text-red-600" :
                                task.priority === "medium" ? "text-yellow-600" :
                                "text-green-600"
                              }`}>
                                {task.priority === "high" ? "Haute" :
                                 task.priority === "medium" ? "Moyenne" :
                                 "Basse"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Actions</h4>
                        <div className="space-y-3">
                          {task.status === "completed" ? (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="text-green-600" />
                                <span className="font-medium">Tâche terminée</span>
                              </div>
                              <p className="text-sm text-green-700">Cette tâche a été marquée comme terminée le {formatDate(task.deadline)}</p>
                            </div>
                          ) : (
                            <>
                              <button className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <Clock size={18} />
                                Mettre à jour la progression
                              </button>
                              
                              <button className="w-full flex items-center justify-center gap-2 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                                <AlertCircle size={18} />
                                Signaler un problème
                              </button>
                              
                              {task.progress === 100 && (
                                <button className="w-full flex items-center justify-center gap-2 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                                  <CheckCircle size={18} />
                                  Marquer comme terminée
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
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
  description 
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  color: string;
  description: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-100",
    yellow: "bg-yellow-50 border-yellow-100",
    green: "bg-green-50 border-green-100",
    orange: "bg-orange-50 border-orange-100",
    red: "bg-red-50 border-red-100"
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-xl p-4 hover:shadow-sm transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-white">
          {icon}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
      <div>
        <p className="font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}