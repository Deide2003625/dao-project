"use client";

import { useState } from "react";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Calendar, 
  User, 
  Search, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus
} from "lucide-react";

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
  const [updatingProgress, setUpdatingProgress] = useState<number | null>(null);
  const [tempProgress, setTempProgress] = useState<number>(0);

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

  // Gérer le début de la mise à jour de progression
  const handleStartUpdateProgress = (taskId: number, currentProgress: number) => {
    setUpdatingProgress(taskId);
    setTempProgress(currentProgress);
  };

  // Gérer l'annulation de la mise à jour
  const handleCancelUpdate = () => {
    setUpdatingProgress(null);
    setTempProgress(0);
  };

  // Gérer la sauvegarde de la progression
  const handleSaveProgress = (taskId: number) => {
    console.log(`Progression mise à jour pour la tâche ${taskId}: ${tempProgress}%`);
    // Ici, vous enverriez normalement la mise à jour à votre API
    setUpdatingProgress(null);
    setTempProgress(0);
    alert(`Progression mise à jour à ${tempProgress}%`);
  };

  // Ajuster la progression par incrément
  const adjustProgress = (amount: number) => {
    const newProgress = tempProgress + amount;
    if (newProgress >= 0 && newProgress <= 100) {
      setTempProgress(newProgress);
    }
  };

  // Définir la progression à une valeur spécifique
  const setProgress = (value: number) => {
    if (value >= 0 && value <= 100) {
      setTempProgress(value);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Contenu vide ou logo */}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{task.dao}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">Assignée par: {task.assignedBy}</span>
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
                    <div className="flex flex-col items-center">
                      {/* Titre centré */}
                      <h3 className="text-xl font-semibold mb-6 text-center">
                        Gérer la progression de "{task.name}"
                      </h3>

                      {/* Section de mise à jour de la progression */}
                      {updatingProgress === task.id ? (
                        <div className="w-full max-w-2xl bg-white p-6 rounded-lg border shadow-sm">
                          <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-medium text-lg">Définir la progression</h4>
                              <span className="text-2xl font-bold text-blue-600">{tempProgress}%</span>
                            </div>
                            
                            {/* Barre de progression interactive */}
                            <div className="mb-6">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={tempProgress}
                                onChange={(e) => setProgress(parseInt(e.target.value))}
                                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>0%</span>
                                <span>25%</span>
                                <span>50%</span>
                                <span>75%</span>
                                <span>100%</span>
                              </div>
                            </div>
                            
                            {/* Contrôles d'ajustement */}
                            <div className="flex items-center justify-center gap-6 mb-8">
                              <button
                                onClick={() => adjustProgress(-10)}
                                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200"
                                disabled={tempProgress <= 0}
                              >
                                <Minus size={20} />
                              </button>
                              
                              <div className="flex gap-2">
                                {[0, 25, 50, 75, 100].map((value) => (
                                  <button
                                    key={value}
                                    onClick={() => setProgress(value)}
                                    className={`px-4 py-2 rounded-lg ${tempProgress === value ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                                  >
                                    {value}%
                                  </button>
                                ))}
                              </div>
                              
                              <button
                                onClick={() => adjustProgress(10)}
                                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200"
                                disabled={tempProgress >= 100}
                              >
                                <Plus size={20} />
                              </button>
                            </div>
                            
                            {/* Ajustement précis */}
                            <div className="flex items-center justify-center gap-4 mb-8">
                              <button
                                onClick={() => adjustProgress(-1)}
                                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                                disabled={tempProgress <= 0}
                              >
                                <ChevronLeft size={18} />
                              </button>
                              
                              <span className="text-lg font-medium">Ajuster par 1%</span>
                              
                              <button
                                onClick={() => adjustProgress(1)}
                                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                                disabled={tempProgress >= 100}
                              >
                                <ChevronRight size={18} />
                              </button>
                            </div>
                            
                            {/* Boutons d'action */}
                            <div className="flex justify-center gap-4">
                              <button
                                onClick={handleCancelUpdate}
                                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                Annuler
                              </button>
                              <button
                                onClick={() => handleSaveProgress(task.id)}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              >
                                Enregistrer la progression
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Actions initiales - Centrées */
                        <div className="w-full max-w-md">
                          <div className="space-y-4">
                            {task.status === "completed" ? (
                              <div className="p-6 bg-green-50 rounded-lg border border-green-200 text-center">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                  <CheckCircle className="text-green-600" size={24} />
                                  <span className="font-medium text-lg">Tâche terminée</span>
                                </div>
                                <p className="text-green-700">Cette tâche a été marquée comme terminée</p>
                                <p className="text-sm text-green-600 mt-2">
                                  Progression finale: {task.progress}%
                                </p>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartUpdateProgress(task.id, task.progress)}
                                  className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <Clock size={22} />
                                  <span className="text-lg font-medium">Mettre à jour la progression</span>
                                </button>
                                
                                {task.progress === 100 && (
                                  <button className="w-full flex items-center justify-center gap-3 py-4 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                                    <CheckCircle size={22} />
                                    <span className="text-lg font-medium">Marquer comme terminée</span>
                                  </button>
                                )}
                                
                                <button className="w-full flex items-center justify-center gap-3 py-4 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                                  <AlertCircle size={22} />
                                  <span className="text-lg font-medium">Signaler un problème</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
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