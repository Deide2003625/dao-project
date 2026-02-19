"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { User, AtSign, MessageSquare } from "lucide-react";

interface Dao {
  id: number;
  numero: string;
  reference: string;
  autorite: string;
  date_depot?: string;
  chef_projet?: string | null;
  statut?: string | null;
  groupement?: string | null;
  nom_partenaire?: string | null;
}

interface Comment {
  id: number;
  user: string;
  role: string;
  text: string;
  time: string;
  task_id: number;
  user_id?: number;
  mentioned_user_id?: number;
  mentioned_user_name?: string;
  is_public?: boolean;
}

interface User {
  id: number;
  name: string;
}

export default function DashboardChefEquipe() {
  const router = useRouter();
  const [daos, setDaos] = useState<Dao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  
  // États pour les commentaires
  const [comments, setComments] = useState<Comment[]>([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [globalComment, setGlobalComment] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Calculer les statistiques
  const stats = {
    total: daos.length,
    enCours: daos.filter(d => {
      const status = String(d.statut || "").toLowerCase();
      return status === "encours" || status === "en cours";
    }).length,
    aRisque: daos.filter(d => {
      const status = String(d.statut || "").toLowerCase();
      return status === "arisque" || status === "à risque";
    }).length,
    terminees: daos.filter(d => {
      const status = String(d.statut || "").toLowerCase();
      return status === "termine" || status === "terminée";
    }).length,
  };

  useEffect(() => {
    loadDaos();
  }, []);

  // Charger les commentaires
  const loadComments = async (taskId: number) => {
    try {
      const response = await fetch(`/api/messages?task_id=${taskId}`);
      const result = await response.json();

      if (result.success && result.data) {
        // Adapter les données de la base au format attendu
        const adaptedComments = result.data.map((msg: any) => ({
          id: msg.id,
          user: msg.user_name || 'Utilisateur',
          role: 'Utilisateur',
          text: msg.content,
          time: new Date(msg.created_at).toLocaleString('fr-FR'),
          task_id: msg.task_id,
          user_id: msg.user_id,
          mentioned_user_id: msg.mentioned_user_id,
          mentioned_user_name: msg.mentioned_user_name,
          is_public: msg.is_public
        }));
        
        setComments(adaptedComments);
        console.log(` ${adaptedComments.length} commentaires chargés depuis la base`);
      } else {
        console.log(' Erreur lors du chargement des commentaires:', result.message);
      }
    } catch (error) {
      console.error(' Erreur réseau lors du chargement des commentaires:', error);
    }
  };

  // Charger les utilisateurs pour les mentions
  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error(' Erreur lors du chargement des utilisateurs:', error);
    }
  };

  // Filtrer les commentaires pour la tâche sélectionnée avec logique de visibilité
  const getFilteredComments = (taskId: number) => {
    const taskComments = comments.filter(c => c.task_id === taskId);
    return taskComments.filter(comment => {
      // Exclure les messages de l'utilisateur lui-même
      if (comment.user_id === currentUser?.id) return false;
      
      // Toujours afficher les commentaires publics des autres utilisateurs
      if (comment.is_public) return true;
      
      // Afficher les mentions privées uniquement au destinataire
      return comment.mentioned_user_id === currentUser?.id;
    });
  };

  // Gérer les changements dans le textarea
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setGlobalComment(value);

    // Détecter si l'utilisateur tape @ pour les mentions
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = value.substring(lastAtIndex + 1);
      const spaceIndex = textAfterAt.indexOf(' ');
      
      if (spaceIndex === -1) {
        // L'utilisateur est en train de taper une mention
        setMentionSearch(textAfterAt);
        setShowMentionSuggestions(true);
      } else {
        setShowMentionSuggestions(false);
      }
    } else {
      setShowMentionSuggestions(false);
    }
  };

  // Insérer une mention
  const insertMention = (user: User) => {
    const lastAtIndex = globalComment.lastIndexOf('@');
    const newText = globalComment.substring(0, lastAtIndex) + `@${user.name} `;
    setGlobalComment(newText);
    setShowMentionSuggestions(false);
    commentInputRef.current?.focus();
  };

  // Ajouter un commentaire global
  const addGlobalComment = async () => {
    if (!globalComment.trim()) return;

    let mentionedUserId: number | undefined;
    let isPublic = true;

    // Vérifier s'il y a une mention @
    const mentionMatch = globalComment.match(/@(\w+)/);
    if (mentionMatch) {
      const mentionedUserName = mentionMatch[1].toLowerCase();
      const mentionedUser = users.find(u => u.name.toLowerCase() === mentionedUserName);
      
      if (mentionedUser) {
        mentionedUserId = mentionedUser.id;
        isPublic = false; // Si mention, c'est un message privé
      }
    }

    try {
      // Sauvegarder le commentaire en base de données
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: 1, // Utiliser une tâche par défaut pour le dashboard
          user_id: currentUser?.id || 43,
          content: globalComment.trim(),
          mentioned_user_id: mentionedUserId,
          mentioned_user_name: mentionedUserId ? users.find(u => u.id === mentionedUserId)?.name : undefined,
          is_public: isPublic
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Rafraîchir les commentaires
        await loadComments(1);
        setGlobalComment('');
        setShowMentionSuggestions(false);
      }
    } catch (error) {
      // Erreur silencieuse
    }
    
    // Ne pas fermer automatiquement le modal - laisser l'utilisateur décider
  };

  // Ouvrir le modal de commentaire
  const openCommentModal = () => {
    setShowCommentModal(true);
  };

  async function loadDaos() {
    try {
      setLoading(true);
      setError("");

      // Récupérer l'utilisateur connecté depuis localStorage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setError("Utilisateur non connecté");
        return;
      }

      const user = JSON.parse(storedUser);
      
      const res = await fetch(`/api/dao?chefId=${user.id}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("API /api/dao error:", json);
        setDaos([]);
        setError(json?.message || "Erreur lors du chargement des DAO");
        return;
      }

      const rows = Array.isArray(json?.data) ? (json.data as Dao[]) : [];
      setDaos(rows);
      
      // Charger l'utilisateur courant depuis le localStorage
      const userFromStorage = localStorage.getItem('user');
      if (userFromStorage) {
        const userData = JSON.parse(userFromStorage);
        setCurrentUser({
          id: userData.id,
          name: userData.username || userData.email?.split('@')[0] || 'Utilisateur'
        });
        console.log(' Utilisateur chargé depuis localStorage:', userData);
      } else {
        // Fallback si pas d'utilisateur dans localStorage
        setCurrentUser({ id: 43, name: "lio" });
        console.log(' Aucun utilisateur dans localStorage, utilisation du fallback lio');
      }
      
      // Charger les utilisateurs pour les mentions
      await loadUsers();
      
      // Charger les commentaires
      await loadComments(1);
    } catch (err) {
      console.error("Error fetching DAOs:", err);
      setDaos([]);
      setError("Erreur réseau lors du chargement des DAO");
    } finally {
      setLoading(false);
    }
  }

  const computeStatus = (dao: Dao): { label: string; className: string } => {
    const today = new Date();
    const rawStatut = String(dao.statut || "").toLowerCase();

    // Si terminé => vert
    if (rawStatut === "termine" || rawStatut === "terminée") {
      return {
        label: "Terminée",
        className: "badge bg-success text-white",
      };
    }

    // Si à risque => rouge
    if (rawStatut === "arisque" || rawStatut === "à risque") {
      return {
        label: "À risque",
        className: "badge bg-danger text-white",
      };
    }

    // Sinon, en cours => jaune
    return {
      label: "En cours",
      className: "badge bg-warning text-dark",
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-gray-50 p-6 no-print">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-gray-900">Mes DAO</h3>

              <div className="flex items-center gap-3">
                <input
                  placeholder="Rechercher (n°, objet, équipe...)"
                  className="px-3 py-2 border rounded w-72 text-sm"
                />
                <button className="px-3 py-2 bg-blue-600 text-white rounded text-sm">
                  Filtrer
                </button>
                
                {/* Icône de commentaire */}
                <button
                  onClick={openCommentModal}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  title="Ajouter un commentaire"
                >
                  <MessageSquare size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* TABS SECTION */}
        <div className="row mb-6">
          <div className="col-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body dashboard-tabs p-0">
                <div className="tab-content py-0 px-0">
                  {/* OVERVIEW TAB */}
                  <div
                    className="tab-pane fade show active"
                    id="overview"
                    role="tabpanel"
                  >
                    <div className="d-flex flex-wrap justify-content-xl-between">
                      {/* Block 1 */}
                      <div
                        className="d-none d-xl-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item"
                        style={{
                          background:
                            "linear-gradient(90deg, #f5f5f5, #e0e0e0)",
                        }}
                      >
                        <i className="mdi mdi-calendar icon-lg mr-3 text-secondary"></i>
                        <div className="d-flex flex-column justify-content-around">
                          <small className="text-muted">Total assignés</small>
                          <h4 className="mb-0">{stats.total}</h4>
                        </div>
                      </div>

                      {/* Block 2 */}
                      <div
                        className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item"
                        style={{
                          background:
                            "linear-gradient(90deg, #fff9c4, #fff176)",
                        }}
                      >
                        <i className="mdi mdi-timer-sand icon-lg mr-3 text-warning"></i>
                        <div className="d-flex flex-column justify-content-around">
                          <small className="text-muted">En cours</small>
                          <h4 className="mb-0">{stats.enCours}</h4>
                        </div>
                      </div>

                      {/* Block 3 */}
                      <div
                        className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item"
                        style={{
                          background:
                            "linear-gradient(90deg, #ffebee, #ef9a9a)",
                        }}
                      >
                        <i className="mdi mdi-alert icon-lg mr-3 text-danger"></i>
                        <div className="d-flex flex-column justify-content-around">
                          <small className="text-muted">À risque</small>
                          <h4 className="mb-0">{stats.aRisque}</h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SALES TAB */}
                  <div className="tab-pane fade" id="sales" role="tabpanel">
                    <div className="p-4">
                      <h4>Sales Data</h4>
                      <p>Sales information will be displayed here.</p>
                    </div>
                  </div>

                  {/* PURCHASES TAB */}
                  <div className="tab-pane fade" id="purchases" role="tabpanel">
                    <div className="p-4">
                      <h4>Purchases Data</h4>
                      <p>Purchases information will be displayed here.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DAO list */}
        {/* TABLE */}
        <div className="row">
          <div className="col-12 stretch-card">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <p className="card-title mb-0">Tous mes DAO</p>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={loadDaos} disabled={loading}>
                      Rafraîchir
                    </button>
                   
                    
                  </div>
                </div>

                {error ? <div className="alert alert-danger mt-3 mb-0">{error}</div> : null}

                <div className="table-responsive mt-3">
                  <table
                    id="recent-purchases-listing"
                    className="table table-hover"
                  >
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Référence</th>
                        <th>Autorité contractante</th>
                        <th>Date de clôture</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="text-center">Chargement...</td>
                        </tr>
                      ) : daos.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center">Aucun DAO assigné.</td>
                        </tr>
                      ) : (
                        daos.map((dao) => (
                          <tr key={dao.id}>
                            <td>{dao.numero}</td>
                            <td>{dao.reference}</td>
                            <td>{dao.autorite}</td>
                            <td>
                              {dao.date_depot 
                                ? new Date(dao.date_depot).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit', 
                                    year: 'numeric'
                                  })
                                : '-'
                              }
                            </td>
                            <td>
                              {(() => {
                                const s = computeStatus(dao);
                                return <span className={s.className}>{s.label}</span>;
                              })()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de commentaire */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Commentaires globaux</h2>
              <button
                onClick={() => setShowCommentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            
           

            {/* Formulaire d'ajout de commentaire */}
            <div className="border-t pt-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <textarea
                    ref={commentInputRef}
                    value={globalComment}
                    onChange={handleCommentChange}
                    placeholder="Ajouter un commentaire global..."
                    className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  
                  {/* Suggestions de mentions */}
                  {showMentionSuggestions && (
                    <div className="mt-2 p-2 bg-white border rounded-lg shadow-lg max-h-32 overflow-y-auto">
                      {users
                        .filter(u => u.name.toLowerCase().includes(mentionSearch.toLowerCase()))
                        .map((user) => (
                          <div
                            key={user.id}
                            onClick={() => insertMention(user)}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded"
                          >
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-xs font-bold">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm">{user.name}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end mt-3">
                <button
                  onClick={addGlobalComment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
