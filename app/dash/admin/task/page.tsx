interface Task {
  id: number;
  dao_id: number;
  id_task: number;
  description?: string;
  progress: number;
  assigned_to: number;
  created_at: string;
  updated_at?: string;
  dao_reference?: string;
  dao_objet?: string;
}

/* =======================
   DASHBOARD
export default function MembreEquipeDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskProgress, setTaskProgress] = useState<Record<number, number>>({});

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Début du chargement des tâches...");
        
        // Récupérer l'utilisateur depuis une variable en mémoire
        // NOTE: localStorage n'est pas supporté dans les artifacts Claude.ai
        const mockUser = { id: 1 }; // Simule un utilisateur connecté
        
        const userId = mockUser.id;
        console.log("ID utilisateur:", userId);
        
        if (!userId) {
          const errorMsg = "Erreur: ID utilisateur non trouvé";
          console.error(errorMsg);
          setError(errorMsg);
          return;
        }
        
        try {
          console.log(`Envoi de la requête à /api/member-tasks?userId=${userId}`);
          const response = await fetch(`/api/member-tasks?userId=${userId}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
          }
          
          const result = await response.json();
          console.log("Réponse brute de l'API:", JSON.stringify(result, null, 2));
          
          if (result.success) {
            console.log(`${result.data?.length || 0} tâches reçues`);
            
            setTasks(result.data || []);
            
            // Initialize progress from database
            const progressMap: Record<number, number> = {};
            (result.data || []).forEach((task: Task) => {
              if (task.id === undefined) {
                console.error("Tâche sans ID détectée:", task);
              } else {
                progressMap[task.id] = task.progress || 0;
              }
            });
            
            console.log("Carte de progression initialisée:", progressMap);
            setTaskProgress(progressMap);
          } else {
            const errorMsg = result.message || 'Erreur inconnue lors du chargement des tâches';
            console.error("Erreur de l'API:", errorMsg);
            setError(errorMsg);
          }
        } catch (error) {
          const errorMsg = `Erreur lors de la récupération des tâches: ${error instanceof Error ? error.message : String(error)}`;
          console.error(errorMsg);
          setError(errorMsg);
        }
      } catch (err) {
        setError('Erreur de connexion au serveur');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(
    (task: Task) =>
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.dao_reference && task.dao_reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.dao_objet && task.dao_objet.toLowerCase().includes(searchTerm.toLowerCase())) ||
      task.id.toString().includes(searchTerm.toLowerCase())
  );

  const updateProgress = async (taskId: number, value: number) => {
    const newValue = Math.min(100, Math.max(0, value));
    
    if (!taskId || isNaN(Number(taskId))) {
      return;
    }
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return;
    }
    
    setTaskProgress((prev) => ({
      ...prev,
      [taskId]: newValue
    }));
    
    try {
      const apiUrl = `/api/tasks/${taskId}/progress`;
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress: newValue }),
      });
      
      if (!response.ok) {
        throw new Error('Échec de la mise à jour');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la mise à jour');
      }
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* LOADING / ERROR */}
        {loading && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p>Chargement des tâches...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* RECHERCHE */}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une tâche ou un DAO"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* LISTE DES TÂCHES */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-6 text-center">
                <p className="text-gray-500">
                  {searchTerm ? "Aucune tâche trouvée pour votre recherche" : "Aucune tâche assignée"}
                </p>
              </div>
            ) : (
              filteredTasks.map((task: Task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-xl border shadow-sm"
                >
                  {/* HEADER */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() =>
                      setExpandedTask(expandedTask === task.id ? null : task.id)
                    }
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">Tâche #{task.id}</h3>

                        <div className="flex gap-4 text-sm text-gray-600 mt-2">
                          <span className="flex items-center gap-1">
                            <FileText size={14} /> DAO-{task.dao_id}
                            {task.dao_reference && ` (${task.dao_reference})`}
                          </span>
                          {task.dao_objet && (
                            <span className="flex items-center gap-1">
                              <FileText size={14} /> {task.dao_objet}
                            </span>
                          )}
                        </div>

                        {/* PROGRESSION */}
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progression</span>
                            <span className="font-medium">
                              {taskProgress[task.id] || 0}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded">
                            <div
                              className="h-2 bg-blue-600 rounded transition-all"
                              style={{ width: `${taskProgress[task.id] || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <ChevronDown
                        className={`transition-transform ${
                          expandedTask === task.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* ACTIONS */}
                  {expandedTask === task.id && (
                    <div className="px-6 pb-6 space-y-4">
                      {/* DESCRIPTION */}
                      {task.description && (
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <h4 className="font-medium text-sm mb-2">Description</h4>
                          <p className="text-sm text-gray-700">{task.description}</p>
                        </div>
                      )}

                      {/* BOUTONS PROGRESSION ET COMMENTER */}
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            setEditingTask(
                              editingTask === task.id ? null : task.id
                            )
                          }
                          className="px-3 py-1 text-xs border rounded hover:bg-gray-100"
                        >
                          Progression
                        </button>
                        <button
                          className="px-3 py-1 text-xs border rounded hover:bg-gray-100"
                        >
                          Commenter
                        </button>
                      </div>

                      {/* MODIFIER PROGRESSION */}
                      {editingTask === task.id && (
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <div className="flex justify-between mb-2 text-sm">
                            <span>Avancement</span>
                            <span className="font-medium">
                              {taskProgress[task.id] || 0}%
                            </span>
                          </div>

                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={taskProgress[task.id] || 0}
                            onChange={(e) =>
                              updateProgress(task.id, Number(e.target.value))
                            }
                            className="w-full"
                          />

                          <div className="flex justify-between mt-3">
                            <button
                              onClick={() =>
                                updateProgress(task.id, (taskProgress[task.id] || 0) - 5)
                              }
                              disabled={(taskProgress[task.id] || 0) <= 0}
                              className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus size={14} />
                            </button>
                            <button
                              onClick={() =>
                                updateProgress(task.id, (taskProgress[task.id] || 0) + 5)
                              }
                              disabled={(taskProgress[task.id] || 0) >= 100}
                              className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* MESSAGE DE TÂCHE TERMINÉE */}
                      {taskProgress[task.id] === 100 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                          <CheckCircle className="mx-auto text-green-600 mb-2" />
                          <p className="font-medium text-green-700">
                            Tâche terminée à 100%
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
"use client";
 
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  X,
  Send,
  User,
  Minus,
  Plus,
} from "lucide-react";
import Link from "next/link";
 
/* ======================
   DONNÉES DE BASE (INCHANGÉES)
 
const daoTasks = [
  { id: 1, name: "Résumé sommaire DAO et Création du drive", progress: 10, comment: "À faire" },
  { id: 2, name: "Demande de caution et garanties", progress: 0, comment: "À faire" },
  { id: 3, name: "Identification et renseignement des profils dans le drive", progress: 0, comment: "À faire" },
  { id: 4, name: "Identification et renseignement des ABE dans le drive", progress: 0, comment: "À faire" },
  { id: 5, name: "Légalisation des ABE, diplômes, certificats, attestations et pièces administratives requis", progress: 0, comment: "À faire" },
  { id: 6, name: "Indication directive d'élaboration de l'offre financier", progress: 0, comment: "À faire" },
  { id: 7, name: "Elaboration de la méthodologie", progress: 0, comment: "À faire" },
  { id: 8, name: "Planification prévisionnelle", progress: 0, comment: "À faire" },
  { id: 9, name: "Identification des références précises des équipements et matériels", progress: 0, comment: "À faire" },
  { id: 10, name: "Demande de cotation", progress: 60, comment: "En cours" },
  { id: 11, name: "Elaboration du squelette des offres", progress: 0, comment: "À faire" },
  { id: 12, name: "Rédaction du contenu des OF et OT", progress: 30, comment: "Brouillon" },
  { id: 13, name: "Contrôle et validation des offres", progress: 0, comment: "À faire" },
  { id: 14, name: "Impression et présentation des offres (Valider l'étiquette)", progress: 0, comment: "À faire" },
  { id: 15, name: "Dépôt des offres et clôture", progress: 0, comment: "À faire" },
];
 
const commentsData = [
  {
    taskId: 1,
    comments: [
      {
        id: 1,
        user: "Jean",
        role: "Chef de projet",
        text: "N'oubliez pas d'ajouter les références du DCE.",
        time: "Il y a 1 heure",
      },
    ],
  },
];
 
/* ======================
   COMPOSANT PRINCIPAL
 
export default function DaoDetailStatic() {
  const [tasks, setTasks] = useState(daoTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
 
  const dao = {
    numero: "DAO-2025-001",
    objet: "Rénovation école primaire — Lot 1",
  };
 
  /* 🔢 PROGRESSION GLOBALE (LIÉE AUX 15 TÂCHES) */
  const globalProgress = useMemo(() => {
    const total = tasks.reduce((sum, t) => sum + t.progress, 0);
    return Math.round(total / tasks.length);
  }, [tasks]);
 
  const updateProgress = (id: number, value: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, progress: Math.min(100, Math.max(0, value)) }
          : t
      )
    );
  };
 
  const taskComments =
    selectedTaskId &&
    commentsData.find((c) => c.taskId === selectedTaskId);
 
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dash/admin/allDao">
              <ArrowLeft />
            </Link>
            <div className="min-w-0">
              <h1 className="font-bold truncate">{dao.numero}</h1>
              <p className="text-sm text-gray-500 truncate">{dao.objet}</p>
            </div>
          </div>
 
          <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 text-sm">
            Supprimer
          </button>
        </div>
      </header>
     
      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
 
        {/* INFOS DAO — corrigé */}
        <section className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-3">Informations générales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Info label="Objet" value={dao.objet} />
            <Info label="Référence" value={dao.reference ?? "—"} />
            <Info label="Autorité contractante" value={dao.autorite ?? "—"} />
            <Info label="Date de dépôt" value={dao.dateDepot ?? "—"} />
            <Info label="Chef Projet" value="Users" />
            <Info label="Equipe" value="5" />
          </div>
        </section>
       
        {/* 🔢 PROGRESSION GLOBALE */}
        <section className="bg-white rounded shadow p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Progression globale</span>
            <span className="font-semibold">{globalProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 h-3 rounded">
            <div
              className="h-3 bg-green-600 rounded transition-all"
              style={{ width: `${globalProgress}%` }}
            />
          </div>
        </section>
 
        {/* TÂCHES */}
        <section className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-3">Tâches</h2>
 
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onProgressChange={(v) => updateProgress(task.id, v)}
              onCommentClick={() => setSelectedTaskId(task.id)}
            />
          ))}
        </section>
      </main>
 
      {/* COMMENTAIRES */}
      {selectedTaskId && (
        <>
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSelectedTaskId(null)}
          />
 
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl flex flex-col">
            <div className="border-b p-4 flex justify-between items-center">
              <p className="font-semibold">Commentaires</p>
              <button onClick={() => setSelectedTaskId(null)}>
                <X />
              </button>
            </div>
 
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {taskComments?.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-50 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{comment.user}</p>
                        <p className="text-xs text-gray-500">{comment.role}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {comment.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
              ))}
            </div>
 
            <div className="border-t p-3 flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Écrire un commentaire..."
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <button className="bg-blue-600 text-white p-2 rounded">
                <Send size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
 
/* ======================
   TÂCHE (INCHANGÉE)
 
function TaskItem({
  task,
  onProgressChange,
  onCommentClick,
}: {
  task: { id: number; name: string; progress: number; comment: string };
  onProgressChange: (v: number) => void;
  onCommentClick: () => void;
}) {
  const [showProgress, setShowProgress] = useState(false);
 
  return (
    <div className="border rounded p-3 mb-3">
      <h3 className="text-sm font-medium">{task.name}</h3>
     
      <div className="mt-2">
 
        <div className="mb-1">
          <span className="text-xs">Assigne a: </span>
        </div>
       
        <div className="flex justify-between text-xs mb-1">
          <span>Avancement</span>
          <span>{task.progress}%</span>
        </div>
       
        <div className="w-full bg-gray-200 h-2 rounded">
          <div
            className="h-2 bg-blue-600 rounded"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>
 
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setShowProgress(!showProgress)}
          className="flex-1 text-xs border rounded py-1 hover:bg-gray-100"
        >
          Progression
        </button>
 
        <button
          onClick={onCommentClick}
          className="flex-1 text-xs border rounded py-1 hover:bg-gray-100"
        >
          Commentaires
        </button>
      </div>
 
      {showProgress && (
        <div className="mt-3 bg-gray-50 p-3 rounded">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={task.progress}
            onChange={(e) => onProgressChange(Number(e.target.value))}
            className="w-full"
          />
 
          <div className="flex justify-between mt-2">
            <button
              onClick={() => onProgressChange(task.progress - 5)}
              className="px-2 py-1 text-xs border rounded"
            >
              <Minus size={14} />
            </button>
            <button
              onClick={() => onProgressChange(task.progress + 5)}
              className="px-2 py-1 text-xs border rounded"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
 
/* ======================
   COMPOSANT INFO
 
function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
 
