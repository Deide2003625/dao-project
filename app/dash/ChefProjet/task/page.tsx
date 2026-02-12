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
   DONNÉES DE BASE
====================== */

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
====================== */

export default function DaoDetailStatic() {
  const [tasks, setTasks] = useState(daoTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");

  const dao = {
    numero: "DAO-2025-001",
    objet: "Rénovation école primaire — Lot 1",
  };

  /* PROGRESSION GLOBALE */
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

  const taskComments = selectedTaskId
    ? commentsData.find((c) => c.taskId === selectedTaskId)
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dash/ChefProjet/MyDao">
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
        {/* PROGRESSION GLOBALE */}
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
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSelectedTaskId(null)}
          />

          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl flex flex-col z-50">
            <div className="border-b p-4 flex justify-between items-center">
              <p className="font-semibold">Commentaires</p>
              <button onClick={() => setSelectedTaskId(null)}>
                <X />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {taskComments && taskComments.comments.map((comment: { id: number; user: string; role: string; text: string; time: string }) => (
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
              {(!taskComments || taskComments.comments.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucun commentaire pour cette tâche
                </p>
              )}
            </div>

            <div className="border-t p-3 flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Écrire un commentaire..."
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
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
   TÂCHE
====================== */

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
          <span className="text-xs">Assigné à: Non assigné</span>
        </div>
        
        <div className="flex justify-between text-xs mb-1">
          <span>Avancement</span>
          <span>{task.progress}%</span>
        </div>
        
        <div className="w-full bg-gray-200 h-2 rounded">
          <div
            className="h-2 bg-blue-600 rounded transition-all"
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
              disabled={task.progress <= 0}
              className={`px-2 py-1 text-xs border rounded ${
                task.progress <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
            >
              <Minus size={14} />
            </button>
            <button
              onClick={() => onProgressChange(task.progress + 5)}
              disabled={task.progress >= 100}
              className={`px-2 py-1 text-xs border rounded ${
                task.progress >= 100 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}