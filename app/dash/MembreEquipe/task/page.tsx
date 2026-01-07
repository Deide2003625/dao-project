"use client";

import { useState } from "react";
import {
  CheckCircle,
  Clock,
  FileText,
  User,
  Search,
  ChevronDown,
  Minus,
  Plus,
  MessageCircle,
  Send,
} from "lucide-react";

/* =======================
   DONNÉES
======================= */
const tasksData = [
  {
    id: 1,
    name: "Rédaction du cahier des charges",
    dao: "DAO-2025-001 - Rénovation école",
    progress: 85,
    status: "in-progress",
    assignedBy: "Jean Dupont",
  },
  {
    id: 2,
    name: "Analyse des coûts matériaux",
    dao: "DAO-2025-002 - Centre commercial",
    progress: 45,
    status: "in-progress",
    assignedBy: "Marie Lambert",
  },
  {
    id: 3,
    name: "Validation des plans architecturaux",
    dao: "DAO-2025-003 - Résidence étudiante",
    progress: 100,
    status: "completed",
    assignedBy: "Thomas Martin",
  },
];

/* =======================
   DASHBOARD
======================= */
export default function MembreEquipeDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [showComments, setShowComments] = useState<number | null>(null);

  const [taskProgress, setTaskProgress] = useState<Record<number, number>>(
    Object.fromEntries(tasksData.map((t) => [t.id, t.progress]))
  );

  // Données de commentaires simulées avec rôles et avatars
  const [comments, setComments] = useState<Record<
    number,
    { user: string; role: string; text: string; time: string; isCurrentUser: boolean }[]
  >>({
    1: [
      {
        user: "Vous",
        role: "Membre équipe",
        text: "Il faut finaliser la rédaction du cahier des charges.",
        time: "Il y a 2h",
        isCurrentUser: true,
      },
      {
        user: "Jean Dupont",
        role: "Chef de projet",
        text: "N'oubliez pas d'ajouter les références du DAO.",
        time: "Il y a 1h",
        isCurrentUser: false,
      },
    ],
  });

  const [newComment, setNewComment] = useState("");

  const filteredTasks = tasksData.filter(
    (task) =>
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.dao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateProgress = (taskId: number, value: number) => {
    if (value < 0 || value > 100) return;
    setTaskProgress((prev) => ({ ...prev, [taskId]: value }));
  };

  const addComment = (taskId: number) => {
    if (!newComment.trim()) return;

    const newEntry = {
      user: "Vous",
      role: "Membre équipe",
      text: newComment,
      time: "Maintenant",
      isCurrentUser: true,
    };

    setComments((prev) => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), newEntry],
    }));

    setNewComment("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* RECHERCHE */}
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

        {/* LISTE DES TÂCHES */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
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
                    <h3 className="text-lg font-semibold">{task.name}</h3>

                    <div className="flex gap-4 text-sm text-gray-600 mt-2">
                      <span className="flex items-center gap-1">
                        <FileText size={14} /> {task.dao}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={14} /> {task.assignedBy}
                      </span>
                    </div>

                    {/* PROGRESSION */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progression</span>
                        <span className="font-medium">
                          {taskProgress[task.id]}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded">
                        <div
                          className="h-2 bg-blue-600 rounded"
                          style={{ width: `${taskProgress[task.id]}%` }}
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
                  {/* BOUTONS (Progression / Commentaires) */}
                  {task.status !== "completed" && (
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
                        onClick={() =>
                          setShowComments(
                            showComments === task.id ? null : task.id
                          )
                        }
                        className="px-3 py-1 text-xs border rounded hover:bg-gray-100"
                      >
                        Commentaires
                      </button>
                    </div>
                  )}

                  {/* MODIFIER PROGRESSION */}
                  {editingTask === task.id && (
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between mb-2 text-sm">
                        <span>Avancement</span>
                        <span className="font-medium">
                          {taskProgress[task.id]}%
                        </span>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={taskProgress[task.id]}
                        onChange={(e) =>
                          updateProgress(task.id, Number(e.target.value))
                        }
                        className="w-full"
                      />

                      <div className="flex justify-between mt-3">
                        <button
                          onClick={() =>
                            updateProgress(task.id, taskProgress[task.id] - 5)
                          }
                          className="p-2 border rounded"
                        >
                          <Minus size={14} />
                        </button>
                        <button
                          onClick={() =>
                            updateProgress(task.id, taskProgress[task.id] + 5)
                          }
                          className="p-2 border rounded"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* COMMENTAIRES - FIL DE DISCUSSION VISUEL ANCIEN CODE */}
                  {showComments === task.id && (
                    <div className="bg-gray-50 p-4 rounded-lg border flex flex-col">
                      <div className="overflow-y-auto max-h-64 space-y-3 mb-3">
                        {(comments[task.id] || []).map((comment, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg border p-3 flex flex-col"
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
                            <p className="text-gray-700 text-sm">{comment.text}</p>
                          </div>
                        ))}

                        {(!comments[task.id] || comments[task.id].length === 0) && (
                          <p className="text-sm text-gray-500 text-center mt-2">
                            Aucun commentaire pour le moment
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Écrire un commentaire..."
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                        <button
                          onClick={() => addComment(task.id)}
                          className="p-2 bg-blue-600 text-white rounded-lg"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TERMINÉE */}
                  {task.status === "completed" && (
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
          ))}
        </div>
      </main>
    </div>
  );
}
