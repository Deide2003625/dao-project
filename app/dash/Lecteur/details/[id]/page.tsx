"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  X,
  Send,
  User,
  Minus,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface DAO {
  id: number;
  reference?: string;
  numero?: string;
  objet?: string;
  description?: string;
  statut?: string;
  date_depot?: string;
  chef_id?: number;
  team_id?: string;
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

interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  user_name?: string;
  text: string;
  created_at?: string;
}

export default function DaoDetailDynamic() {
  const params = useParams();
  const daoId = params.id as string;
  
  const [dao, setDao] = useState<DAO | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les données du DAO et des tâches
  useEffect(() => {
    const fetchDaoData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer le DAO spécifique
        const daoResponse = await fetch(`http://localhost:3000/api/daos/${daoId}`);
        if (!daoResponse.ok) {
          throw new Error('DAO non trouvé');
        }
        const daoData = await daoResponse.json();
        setDao(daoData.data);

        // Récupérer les tâches du DAO
        const tasksResponse = await fetch(`http://localhost:3000/api/tasks?daoId=${daoId}`);
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData.data || []);
        }

        // Récupérer les commentaires des tâches
        const commentsResponse = await fetch(`http://localhost:3000/api/tasks/${daoId}/comments`);
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setComments(commentsData.data || []);
        }

      } catch (err) {
        console.error('Erreur:', err);
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    if (daoId) {
      fetchDaoData();
    }
  }, [daoId]);

  // Calcul de la progression globale
  const globalProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const total = tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
    return Math.round(total / tasks.length);
  }, [tasks]);

  // Mise à jour de la progression d'une tâche
  const updateProgress = async (taskId: number, value: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress: Math.min(100, Math.max(0, value)) }),
      });

      if (response.ok) {
        setTasks(prev => 
          prev.map(t => 
            t.id === taskId 
              ? { ...t, progress: Math.min(100, Math.max(0, value)) }
              : t
          )
        );
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
    }
  };

  // Ajout d'un commentaire
  const addComment = async () => {
    if (!selectedTaskId || !newComment.trim()) return;

    try {
      const response = await fetch(`http://localhost:3000/api/tasks/${selectedTaskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: newComment.trim(),
          task_id: selectedTaskId
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prev => [...prev, newCommentData.data]);
        setNewComment("");
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout du commentaire:', err);
    }
  };

  // Commentaires pour la tâche sélectionnée
  const taskComments = selectedTaskId 
    ? comments.filter(c => c.task_id === selectedTaskId)
    : [];

  // Tâche sélectionnée
  const selectedTask = selectedTaskId 
    ? tasks.find(t => t.id === selectedTaskId)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des détails du DAO...</p>
        </div>
      </div>
    );
  }

  if (error || !dao) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">Erreur</p>
            <p className="text-sm">{error || 'DAO non trouvé'}</p>
          </div>
          <Link href="/dash/Lecteur" className="text-blue-600 hover:underline">
            Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dash/Lecteur">
              <ArrowLeft />
            </Link>
            <div className="min-w-0">
              <h1 className="font-bold truncate">
                {dao.reference || dao.numero || `DAO-${dao.id}`}
              </h1>
              <p className="text-sm text-gray-500 truncate">
                {dao.objet || dao.description || 'Aucun objet'}
              </p>
            </div>
          </div>

          {/* PROGRESSION GLOBALE */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Progression globale</span>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${globalProgress}%` }}
              />
            </div>
            <span className="font-medium">{globalProgress}%</span>
          </div>
        </div>
      </header>

      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* LISTE DES TÂCHES */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-semibold text-gray-800 mb-3">Tâches du DAO</h2>
            
            {tasks.length === 0 ? (
              <div className="bg-white rounded-lg p-4 text-center text-gray-500">
                Aucune tâche trouvée pour ce DAO
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTaskId === task.id
                      ? "ring-2 ring-blue-500"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 truncate">
                        {task.titre || `Tâche ${task.id_task}`}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {task.priorite && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.priorite === 'haute' ? 'bg-red-100 text-red-800' :
                            task.priorite === 'moyenne' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priorite}
                          </span>
                        )}
                        {task.statut && (
                          <span className="text-xs text-gray-500">
                            {task.statut}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateProgress(task.id, (task.progress || 0) - 10);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus size={16} />
                      </button>
                      <div className="w-16 text-center">
                        <div className="text-lg font-bold">{task.progress || 0}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateProgress(task.id, (task.progress || 0) + 10);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PANNEAU DE COMMENTAIRES */}
          <div className="lg:col-span-1">
            {selectedTask ? (
              <div className="bg-white rounded-lg p-4 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">
                    {selectedTask.titre || `Tâche ${selectedTask.id_task}`}
                  </h3>
                  <button
                    onClick={() => setSelectedTaskId(null)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* LISTE DES COMMENTAIRES */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {taskComments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      Aucun commentaire pour cette tâche
                    </p>
                  ) : (
                    taskComments.map((comment) => (
                      <div key={comment.id} className="border-b pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <User size={16} className="text-gray-400" />
                          <span className="font-medium text-sm">
                            {comment.user_name || 'Utilisateur'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {comment.created_at 
                              ? new Date(comment.created_at).toLocaleDateString()
                              : 'Date inconnue'
                            }
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* AJOUT DE COMMENTAIRE */}
                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ajouter un commentaire..."
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && addComment()}
                    />
                    <button
                      onClick={addComment}
                      disabled={!newComment.trim()}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 text-center text-gray-500">
                <User size={32} className="mx-auto mb-2 opacity-50" />
                <p>Sélectionnez une tâche pour voir les commentaires</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
