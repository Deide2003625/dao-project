"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X, Send, User } from "lucide-react";

interface Dao {
  id: number;
  numero: string;
  reference: string;
  autorite: string;
  date_depot?: string;
  statut?: string;
  chef_projet?: string;
  objet?: string;
  description?: string;
  team_id?: string;
}

interface Task {
  id: number;
  titre: string;
  description: string;
  statut: string;
  date_creation: string;
  date_echeance: string;
  priorite: string;
  assigned_to: number;
  assigned_user: { nom: string; prenom: string };
}

function calculateProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;

  const statusWeights = {
    'termine': 100,
    'en_cours': 50,
    'a_faire': 0
  };

  const totalProgress = tasks.reduce((sum, task) => {
    return sum + (statusWeights[task.statut as keyof typeof statusWeights] || 0);
  }, 0);

  return Math.round(totalProgress / tasks.length);
}

export default function DaoDetailPage() {
  const params = useParams();
  const daoId = params.id as string;

  const [dao, setDao] = useState<Dao | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");

  const loadDaoDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch DAO details
      const daoRes = await fetch(`/api/dao/${daoId}`, { cache: "no-store" });
      const daoJson = await daoRes.json().catch(() => ({}));

      if (!daoRes.ok) {
        console.error("API /api/dao/[id] error:", daoJson);
        setError(daoJson?.message || "Erreur lors du chargement du DAO");
        return;
      }

      setDao(daoJson);

      // For now, use mock tasks (to be replaced with real API)
      const mockTasks: Task[] = [
        {
          id: 1,
          titre: "Résumé sommaire DAO et Création du drive",
          description: "Créer un résumé détaillé du DAO et mettre en place l'espace de stockage partagé",
          statut: "en_cours",
          date_creation: "2024-01-15",
          date_echeance: "2024-01-20",
          priorite: "haute",
          assigned_to: 1,
          assigned_user: { nom: "Dupont", prenom: "Jean" }
        },
        {
          id: 2,
          titre: "Analyse des besoins fonctionnels",
          description: "Documenter tous les besoins fonctionnels du système DAO",
          statut: "a_faire",
          date_creation: "2024-01-16",
          date_echeance: "2024-01-25",
          priorite: "moyenne",
          assigned_to: 2,
          assigned_user: { nom: "Martin", prenom: "Marie" }
        },
        {
          id: 3,
          titre: "Conception de l'architecture",
          description: "Définir l'architecture technique et les composants du système",
          statut: "termine",
          date_creation: "2024-01-10",
          date_echeance: "2024-01-18",
          priorite: "haute",
          assigned_to: 1,
          assigned_user: { nom: "Dupont", prenom: "Jean" }
        }
      ];

      setTasks(mockTasks);

    } catch (err) {
      console.error("Error fetching DAO details:", err);
      setError("Erreur réseau lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, [daoId]);

  useEffect(() => {
    loadDaoDetails();
  }, [loadDaoDetails]);

  const selectedTask = selectedTaskId
    ? tasks.find((task) => task.id === selectedTaskId)
    : null;

  // Mock comments data
  const taskComments = selectedTaskId
    ? {
        comments: [
          {
            id: 1,
            user: "Jean Dupont",
            role: "Chef de projet",
            text: "N'oubliez pas d'ajouter les références du DCE",
            time: "Il y a 1 heure",
            isCurrentUser: false,
          },
          {
            id: 2,
            user: "Marie Lambert",
            role: "Assistant technique",
            text: "Les documents sont en cours de vérification",
            time: "Il y a 30 minutes",
            isCurrentUser: false,
          },
        ],
        noComments: false,
      }
    : null;

  const handleAddComment = () => {
    if (newComment.trim() && selectedTaskId) {
      console.log(
        "Ajout de commentaire pour la tâche",
        selectedTaskId,
        ":",
        newComment,
      );
      setNewComment("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Chargement...</span>
          </div>
          <p className="mt-2">Chargement du DAO...</p>
        </div>
      </div>
    );
  }

  if (error || !dao) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="alert alert-danger">{error || "DAO non trouvé"}</div>
          <Link href="/dash/admin/task" className="btn btn-primary mt-3">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* HEADER */}
      <header className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dash/admin/task"
            className="text-gray-600 hover:text-black"
          >
            <ArrowLeft />
          </Link>
          <div>
            <h1 className="text-lg font-bold">{dao.numero}</h1>
            <p className="text-sm text-gray-500">Détail du DAO</p>
          </div>
        </div>
        <div className="bg-white flex justify-between d-flex justify-content-end height: 220px">
          <button
            className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
            title="Supprimer le DAO"
            style={{ width: "100px", height: "36px" }}
          >
            <i className="mdi mdi-delete m-0"></i>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* INFOS DAO */}
        <section className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-3">Informations générales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Info label="Objet" value={dao.objet || dao.reference} />
            <Info label="Référence" value={dao.reference} />
            <Info label="Autorité contractante" value={dao.autorite} />
            <Info label="Date de dépôt" value={dao.date_depot || "N/A"} />
            <Info label="Chef Projet" value={dao.chef_projet || "N/A"} />
            <Info label="Statut" value={dao.statut || "EN_COURS"} />
          </div>
        </section>

        {/* PROGRESSION */}
        <section className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-3">Progression globale</h2>
          <div className="w-full bg-gray-200 h-3 rounded">
            <div
              className="h-3 bg-blue-600 rounded"
              style={{ width: `${calculateProgress(tasks)}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{calculateProgress(tasks)}% complété</p>
        </section>

        {/* TÂCHES */}
        <section className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-3">Tâches</h2>
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={{
                  id: task.id,
                  name: task.titre,
                  progress: task.statut === 'termine' ? 100 : task.statut === 'en_cours' ? 50 : 0,
                  comment: task.description
                }}
                onCommentClick={() => setSelectedTaskId(task.id)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* PANEL LATÉRAL DES COMMENTAIRES */}
      {selectedTaskId && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSelectedTaskId(null)}
          />
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="w-full h-full max-w-2xl">
              <div className="h-full bg-white shadow-xl flex flex-col">
                <div className="border-b p-4 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="font-semibold text-lg text-gray-800">
                        Commentaires
                      </h2>
                      <p className="text-sm text-gray-600 truncate max-w-xs md:max-w-md lg:max-w-lg">
                        {selectedTask?.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  <div className="space-y-6">
                    {taskComments?.comments &&
                    taskComments.comments.length > 0 ? (
                      taskComments.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="border-b pb-4 last:border-b-0"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  comment.isCurrentUser
                                    ? "bg-blue-100"
                                    : "bg-gray-100"
                                }`}
                              >
                                <User
                                  size={16}
                                  className={
                                    comment.isCurrentUser
                                      ? "text-blue-600"
                                      : "text-gray-600"
                                  }
                                />
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {comment.user}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {comment.role}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {comment.time}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            {comment.text}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 py-8">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <User size={24} className="text-gray-400" />
                          </div>
                          <p className="mb-2 font-medium text-gray-700">
                            Aucun commentaire pour le moment.
                          </p>
                          <p className="text-sm text-gray-500">
                            Soyez le premier à commenter cette tâche.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t p-4 md:p-6">
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Écrivez votre commentaire ici..."
                      className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className={`p-2 rounded-lg ${
                        newComment.trim()
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Appuyez sur Entrée pour envoyer
                  </p>
                </div>

                <div className="border-t p-4 bg-gray-50">
                  <button
                    onClick={() => setSelectedTaskId(null)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 hover:text-red-700 transition-colors shadow-sm"
                  >
                    <X size={20} />
                    <span className="font-medium">Fermer les commentaires</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function TaskItem({
  task,
  onCommentClick,
}: {
  task: { id: number; name: string; progress: number; comment: string };
  onCommentClick: () => void;
}) {
  return (
    <div className="border rounded p-3 bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-1">
            <h3 className="font-medium text-sm">{task.name}</h3>
            <div className="mt-2">
              <p className="text-xs text-gray-500">Assigné à :</p>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Avancement :</span>
                <span>{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded">
                <div
                  className="h-2 bg-blue-600 rounded transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-3">
              <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors">
                Modificateur
              </button>
              <button
                onClick={onCommentClick}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                Commentaires
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}