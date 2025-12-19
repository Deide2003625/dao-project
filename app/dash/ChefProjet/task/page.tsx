"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Download,
  MoreVertical,
  Check,
  X,
  Send,
  User,
} from "lucide-react";
import Link from "next/link";

// Données statiques des tâches (simulées depuis le fichier partagé)
const daoTasks = [
  {
    id: 1,
    name: "Résumé sommaire DAO et Création du drive",
    progress: 10,
    comment: "À faire",
  },
  {
    id: 2,
    name: "Demande de caution et garanties",
    progress: 0,
    comment: "À faire",
  },
  {
    id: 3,
    name: "Identification et renseignement des profils dans le drive",
    progress: 0,
    comment: "À faire",
  },
  {
    id: 4,
    name: "Identification et renseignement des ABE dans le drive",
    progress: 0,
    comment: "À faire",
  },
  {
    id: 5,
    name: "Légalisation des ABE, diplômes, certificats, attestations et pièces administratives requis",
    progress: 0,
    comment: "À faire",
  },
  {
    id: 6,
    name: "Indication directive d'élaboration de l'offre financier",
    progress: 0,
    comment: "À faire",
  },
  {
    id: 7,
    name: "Elaboration de la méthodologie",
    progress: 0,
    comment: "À faire",
  },
  {
    id: 8,
    name: "Planification prévisionnelle",
    progress: 0,
    comment: "À faire",
  },
  {
    id: 9,
    name: "Identification des références précises des équipements et matériels",
    progress: 0,
    comment: "À faire",
  },
  { id: 10, name: "Demande de cotation", progress: 60, comment: "En cours" },
  {
    id: 11,
    name: "Elaboration du squelette des offres",
    progress: 0,
    comment: "À faire",
  },
  {
    id: 12,
    name: "Rédaction du contenu des OF et OT",
    progress: 30,
    comment: "Brouillon",
  },
  {
    id: 13,
    name: "Contrôle et validation des offres",
    progress: 0,
    comment: "À faire",
  },
  {
    id: 14,
    name: "Impression et présentation des offres (Valider l'étiquette)",
    progress: 0,
    comment: "À faire",
  },
  {
    id: 15,
    name: "Dépôt des offres et clôture",
    progress: 0,
    comment: "À faire",
  },
];

// Données de commentaires simulées
const commentsData = [
  {
    id: 1,
    taskId: 1,
    taskName: "Résumé sommaire DAO et Création du drive",
    comments: [
      {
        id: 1,
        user: "ambre",
        role: "de l'équipe",
        text: "ou une observation... (utilisez @nom pour mentionner)",
        time: "Il y a 2 heures",
        isCurrentUser: true,
      },
      {
        id: 2,
        user: "jean",
        role: "Chef de projet",
        text: "N'oubliez pas d'ajouter les références du DCE",
        time: "Il y a 1 heure",
        isCurrentUser: false,
      },
      {
        id: 3,
        user: "marie",
        role: "Assistant technique",
        text: "Les documents sont en cours de vérification",
        time: "Il y a 30 minutes",
        isCurrentUser: false,
      },
    ],
    noComments: false,
  },
];

// Calcul simple de la progression globale
const calculateProgress = (tasks: typeof daoTasks) => {
  const total = tasks.reduce((sum, t) => sum + t.progress, 0);
  return Math.round(total / tasks.length);
};

export default function DaoDetailStatic() {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");

  const dao = {
    numero: "DAO-2025-001",
    objet: "Rénovation école primaire — Lot 1",
    reference: "Appel d'offres",
    autorite: "Mairie de Cotonou",
    dateDepot: "2025-11-12",
    progress: calculateProgress(daoTasks),
    tasks: daoTasks,
  };

  const selectedTask = selectedTaskId
    ? daoTasks.find((task) => task.id === selectedTaskId)
    : null;

  const taskComments = selectedTaskId
    ? commentsData.find((c) => c.taskId === selectedTaskId)
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

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* HEADER */}
      <header className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dash/ChefProjet/MyDao"
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
            <Info label="Objet" value={dao.objet} />
            <Info label="Référence" value={dao.reference} />
            <Info label="Autorité contractante" value={dao.autorite} />
            <Info label="Date de dépôt" value={dao.dateDepot} />
            <Info label="Chef Projet" value="Users" />
            <Info label="Equipe" value="5" />
          </div>
        </section>

        {/* PROGRESSION */}
        <section className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-3">Progression globale</h2>
          <div className="w-full bg-gray-200 h-3 rounded">
            <div
              className="h-3 bg-blue-600 rounded"
              style={{ width: `${dao.progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{dao.progress}% complété</p>
        </section>

        {/* TÂCHES */}
        <section className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-3">Tâches</h2>
          <div className="space-y-3">
            {dao.tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onCommentClick={() => setSelectedTaskId(task.id)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* PANEL LATÉRAL DES COMMENTAIRES - Version complète */}
      {selectedTaskId && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSelectedTaskId(null)}
          />

          {/* Panneau des commentaires - Version complète avec bouton en bas */}
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="w-full h-full max-w-2xl">
              <div className="h-full bg-white shadow-xl flex flex-col">
                {/* En-tête du panneau - Titre seulement */}
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

                {/* Zone des commentaires - Toute la hauteur disponible */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  <div className="space-y-6">
                    {/* Tous les commentaires affichés */}
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

                {/* Zone de saisie de commentaire */}
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

                {/* Bouton fermer placé en bas sur la bordure */}
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
          {/* Détails de la tâche */}
          <div className="flex-1">
            <h3 className="font-medium text-sm">{task.name}</h3>

            {/* Assigné à section */}
            <div className="mt-2">
              <p className="text-xs text-gray-500">Assigné à :</p>
            </div>

            {/* Barre de progression */}
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

            {/* Boutons Modificateur et Commentaires */}
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
