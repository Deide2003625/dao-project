"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  FileText,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  BarChart3,
  PieChart,
  Activity,
  MessageSquare,
  User,
} from "lucide-react";

interface DAO {
  id: number;
  reference: string;
  objet: string;
  autorite?: string;
  date_depot?: string;
  statut: string;
  created_at?: string;
  updated_at?: string;
}

interface Task {
  id: number;
  titre: string;
  description: string;
  dao_id: number;
  statut: string;
  progress: number;
  date_creation: string;
  date_echeance: string;
  priorite: string;
  assigned_to: number;
}

interface User {
  id: number;
  username: string;
  role_id: string;
  url_photo: string | null;
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

export default function DirecteurGeneralDashboard() {
  const [daos, setDaos] = useState<DAO[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDAO, setSelectedDAO] = useState<DAO | null>(null);
  
  // États pour les commentaires
  const [comments, setComments] = useState<Comment[]>([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [globalComment, setGlobalComment] = useState("");
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);

  // Fetch current user
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Fetch data
  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    console.log("=== DÉBUT FETCH DATA ===");
    try {
      const [daosResponse, tasksResponse, usersResponse] = await Promise.all([
        fetch("/api/daos"),
        fetch("/api/tasks"),
        fetch("/api/users")
      ]);

      console.log("Réponses API reçues:");
      console.log("- DAOs status:", daosResponse.status);
      console.log("- Tasks status:", tasksResponse.status);
      console.log("- Users status:", usersResponse.status);

      if (daosResponse.ok) {
        const daosResult = await daosResponse.json();
        console.log("Résultat DAOs API:", daosResult);
        setDaos(daosResult.data || []);
      } else {
        console.error("Erreur DAOs:", await daosResponse.text());
      }

      if (tasksResponse.ok) {
        const tasksResult = await tasksResponse.json();
        console.log("Résultat Tasks API:", tasksResult);
        setTasks(tasksResult.data || []);
      } else {
        console.error("Erreur Tasks:", await tasksResponse.text());
      }

      if (usersResponse.ok) {
        const usersResult = await usersResponse.json();
        console.log("Résultat Users API:", usersResult);
        setUsers(usersResult.data || []);
      }

      // Charger les commentaires
      await loadComments();
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      console.log("=== FIN FETCH DATA ===");
    }
  };

  // Charger les commentaires
  const loadComments = async () => {
    try {
      const response = await fetch(`/api/messages?task_id=1`);
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
      }
    } catch (error) {
      // Erreur silencieuse
    }
  };

  // Filtrer les commentaires pour la tâche sélectionnée avec logique de visibilité
  const getFilteredComments = () => {
    const taskComments = comments.filter(c => c.task_id === 1);
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
    const newText = globalComment.substring(0, lastAtIndex) + `@${user.username} `;
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
      const mentionedUser = users.find(u => u.username.toLowerCase() === mentionedUserName);
      
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
          mentioned_user_name: mentionedUserId ? users.find(u => u.id === mentionedUserId)?.username : undefined,
          is_public: isPublic
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Rafraîchir les commentaires
        await loadComments();
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

  // Fonction pour télécharger en PDF complet adapté au Directeur Général
  const downloadDGComprehensivePDF = async () => {
    try {
      // Afficher un indicateur de chargement
      const loadingIndicator = document.createElement('div');
      loadingIndicator.innerHTML = 'Génération du rapport DG complet...';
      loadingIndicator.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px;
        border-radius: 8px;
        z-index: 9999;
        font-size: 16px;
      `;
      document.body.appendChild(loadingIndicator);

      // Attendre que les graphiques soient complètement rendus
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Créer un conteneur temporaire pour le PDF optimisé A4
      const pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        width: 210mm;
        min-height: 297mm;
        background: white;
        padding: 15mm;
        font-family: 'Roboto', Arial, sans-serif;
        box-sizing: border-box;
        font-size: 12px;
        line-height: 1.4;
      `;

      // En-tête professionnel avec couleurs entreprise optimisé A4
      pdfContainer.innerHTML = `
        <div style="background: linear-gradient(135deg, #4d83ff, #843cf6); color: white; text-align: center; padding: 20px 10px; margin: -15mm -15mm 20mm -15mm;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">Rapport de Synthèse des DAO</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Généré le ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <!-- Section Synthèse optimisée A4 avec couleurs entreprise -->
        <div style="margin-bottom: 20mm; background: linear-gradient(135deg, #f8f9fa, #e8eff4); padding: 18px; border-radius: 10px; border-left: 4px solid #4d83ff; box-shadow: 0 3px 5px rgba(0,0,0,0.1);">
          <h3 style="color: #4d83ff; margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">SYNTHÈSE</h3>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
            <div style="text-align: center; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); border-top: 3px solid #4d83ff;">
              <div style="font-size: 32px; font-weight: bold; color: #4d83ff; margin-bottom: 6px;">${stats.totalDaos}</div>
              <div style="font-size: 12px; color: #6b7280; font-weight: 600;">DAO Total</div>
            </div>
            <div style="text-align: center; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); border-top: 3px solid #dc3545;">
              <div style="font-size: 32px; font-weight: bold; color: #dc3545; margin-bottom: 6px;">${stats.atRiskDaos}</div>
              <div style="font-size: 12px; color: #6b7280; font-weight: 600;">À Risque</div>
            </div>
            <div style="text-align: center; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); border-top: 3px solid #71c016;">
              <div style="font-size: 32px; font-weight: bold; color: #71c016; margin-bottom: 6px;">${stats.inProgressDaos}</div>
              <div style="font-size: 12px; color: #6b7280; font-weight: 600;">En Cours</div>
            </div>
          </div>
        </div>
      `;

      // Sections individuelles pour chaque DAO avec un seul graphique
      pdfContainer.innerHTML += daos.map((dao, daoIndex) => {
        const daoTasks = tasks.filter(task => task.dao_id === dao.id);
        const avgProgress = daoTasks.length > 0 
          ? Math.round(daoTasks.reduce((sum, task) => sum + (task.progress || 0), 0) / daoTasks.length)
          : 0;
        
        const completedTasks = daoTasks.filter(t => t.progress === 100).length;
        const totalTasks = daoTasks.length;
        
        const performance = avgProgress > 70 ? 'HIGH' : avgProgress > 40 ? 'MEDIUM' : 'LOW';
        const performanceColor = avgProgress > 70 ? '#22c55e' : avgProgress > 40 ? '#eab308' : '#ef4444';
        
        // Créer un graphique de progression comme dans le dashboard
        const chartData = daoTasks.map((task, index) => ({
          label: `Tâche ${index + 1}`,
          progress: task.progress || 0
        }));
        
        return `
          <!-- Section individuelle pour ${dao.reference} optimisée A4 avec couleurs entreprise -->
          <div style="margin-bottom: 25mm; page-break-inside: avoid;">
            <div style="background: linear-gradient(135deg, #4d83ff, #843cf6); color: white; padding: 15px 10px; border-radius: 10px 10px 0 0; text-align: center;">
              <h2 style="margin: 0; font-size: 20px; font-weight: bold;">${dao.reference}</h2>
              <p style="margin: 6px 0 0 0; font-size: 12px; opacity: 0.9;">${dao.objet}</p>
            </div>
            
            <div style="background: white; border: 1px solid #e8eff4; border-top: none; border-radius: 0 0 10px 10px; padding: 18px;">
              
              <!-- KPIs principaux optimisés A4 avec couleurs entreprise -->
              <div style="margin-bottom: 20mm;">
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
                  <div style="text-align: center; background: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 3px solid #4d83ff;">
                    <div style="font-size: 24px; font-weight: bold; color: #4d83ff;">${avgProgress}%</div>
                    <div style="font-size: 10px; color: #6b7280; margin-top: 3px;">Progression</div>
                  </div>
                  <div style="text-align: center; background: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 3px solid ${performanceColor};">
                    <div style="font-size: 24px; font-weight: bold; color: ${performanceColor};">${performance}</div>
                    <div style="font-size: 10px; color: #6b7280; margin-top: 3px;">Performance</div>
                  </div>
                  <div style="text-align: center; background: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 3px solid #71c016;">
                    <div style="font-size: 24px; font-weight: bold; color: #71c016;">${completedTasks}</div>
                    <div style="font-size: 10px; color: #6b7280; margin-top: 3px;">Tâches Complétées</div>
                  </div>
                  <div style="text-align: center; background: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 3px solid #686868;">
                    <div style="font-size: 24px; font-weight: bold; color: #686868;">${totalTasks}</div>
                    <div style="font-size: 10px; color: #6b7280; margin-top: 3px;">Total Tâches</div>
                  </div>
                </div>
              </div>

              <!-- Graphique unique optimisé A4 avec couleurs entreprise -->
              <div style="margin-bottom: 20mm;">
                <h3 style="color: #4d83ff; margin: 0 0 15px 0; font-size: 16px; font-weight: bold; border-bottom: 2px solid #4d83ff; padding-bottom: 6px;">PROGRESSION DES TÂCHES</h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border: 1px solid #e8eff4;">
                  <!-- Graphique optimisé A4 -->
                  <div style="height: 220px; position: relative; background: white; border-radius: 4px; padding: 15px;">
                    <!-- Axe Y -->
                    <div style="position: absolute; left: 30px; top: 15px; bottom: 30px; width: 1px; background: #e8eff4;"></div>
                    <!-- Labels Y -->
                    <div style="position: absolute; left: 3px; top: 15px; font-size: 9px; color: #686868;">100%</div>
                    <div style="position: absolute; left: 3px; top: 65px; font-size: 9px; color: #686868;">75%</div>
                    <div style="position: absolute; left: 3px; top: 115px; font-size: 9px; color: #686868;">50%</div>
                    <div style="position: absolute; left: 3px; top: 165px; font-size: 9px; color: #686868;">25%</div>
                    <div style="position: absolute; left: 5px; bottom: 25px; font-size: 9px; color: #686868;">0%</div>
                    
                    <!-- Axe X -->
                    <div style="position: absolute; left: 30px; bottom: 30px; right: 15px; height: 1px; background: #e8eff4;"></div>
                    
                    <!-- Barres de progression optimisées A4 avec couleurs entreprise -->
                    <div style="position: absolute; left: 35px; bottom: 30px; right: 20px; top: 15px; display: flex; align-items: flex-end; justify-content: space-around; padding: 0 5px;">
                      ${chartData.map((data, index) => {
                        const barHeight = (data.progress / 100) * 160; // 160px est la hauteur disponible
                        const barColor = data.progress === 100 ? '#71c016' : data.progress >= 50 ? '#4d83ff' : '#7859df';
                        return `
                          <div style="display: flex; flex-direction: column; align-items: center; flex: 1; max-width: 45px;">
                            <div style="width: 20px; height: ${barHeight}px; background: ${barColor}; border-radius: 2px 2px 0 0; margin-bottom: 6px; position: relative;">
                              ${data.progress > 0 ? `<div style="position: absolute; top: -18px; left: 50%; transform: translateX(-50%); font-size: 8px; font-weight: bold; color: #2a2a2a;">${data.progress}%</div>` : ''}
                            </div>
                            <div style="font-size: 7px; color: #686868; text-align: center; max-width: 40px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${data.label}</div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                    
                    <!-- Ligne de moyenne optimisée A4 -->
                    <div style="position: absolute; left: 35px; right: 20px; bottom: ${30 + (160 - (avgProgress / 100) * 160)}px; height: 1px; background: #dc3545; border-top: 1px dashed #dc3545;">
                      <div style="position: absolute; right: -35px; top: -8px; font-size: 8px; color: #dc3545; font-weight: bold;">Moy: ${avgProgress}%</div>
                    </div>
                  </div>
                  
                  <!-- Légende optimisée A4 avec couleurs entreprise -->
                  <div style="display: flex; justify-content: center; gap: 15px; margin-top: 12px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <div style="width: 10px; height: 10px; background: #71c016; border-radius: 2px;"></div>
                      <span style="font-size: 9px; color: #686868;">Complété</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <div style="width: 10px; height: 10px; background: #4d83ff; border-radius: 2px;"></div>
                      <span style="font-size: 9px; color: #686868;">En cours</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <div style="width: 10px; height: 10px; background: #7859df; border-radius: 2px;"></div>
                      <span style="font-size: 9px; color: #686868;">Démarré</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Détails supplémentaires optimisés A4 -->
              <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; border: 1px solid #e8eff4;">
                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 12px; align-items: center;">
                  <div>
                    <div style="font-size: 11px; color: #686868; margin-bottom: 3px;">Autorité</div>
                    <div style="font-size: 12px; font-weight: 600; color: #2a2a2a;">${dao.autorite || 'N/A'}</div>
                  </div>
                  <div>
                    <div style="font-size: 11px; color: #686868; margin-bottom: 3px;">Date Dépôt</div>
                    <div style="font-size: 12px; font-weight: 600; color: #2a2a2a;">${dao.date_depot ? new Date(dao.date_depot).toLocaleDateString('fr-FR') : 'N/A'}</div>
                  </div>
                  <div>
                    <div style="font-size: 11px; color: #686868; margin-bottom: 3px;">Statut</div>
                    <span style="background: #dbe6ff; color: #4d83ff; padding: 3px 8px; border-radius: 8px; font-size: 10px; font-weight: 600;">
                      ${dao.statut || 'EN COURS'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        `;
      }).join('');

      
      // Section Détails par DAO avec informations complètes
      pdfContainer.innerHTML += `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px; font-weight: bold; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">DÉTAILS DES DAO</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; background: white;">
            <thead>
              <tr style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white;">
                <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-weight: 600;">Référence</th>
                <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-weight: 600;">Objet</th>
                <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-weight: 600;">Autorité</th>
                <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-weight: 600;">Date Dépôt</th>
                <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: center; font-weight: 600;">Statut</th>
                <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: center; font-weight: 600;">Progression</th>
                <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: center; font-weight: 600;">Tâches</th>
                <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: center; font-weight: 600;">Risque</th>
              </tr>
            </thead>
            <tbody>
              ${daos.map((dao, index) => {
                const daoTasks = tasks.filter(task => task.dao_id === dao.id);
                const avgProgress = daoTasks.length > 0 
                  ? Math.round(daoTasks.reduce((sum, task) => sum + (task.progress || 0), 0) / daoTasks.length)
                  : 0;
                
                const completedTasks = daoTasks.filter(t => t.progress === 100).length;
                const totalTasks = daoTasks.length;
                
                const computeStatus = () => {
                  const statut = String(dao.statut || "").toUpperCase();
                  if (statut === "TERMINEE" || statut === "TERMINE") {
                    return { label: "Terminée", color: "#22c55e", bgColor: "#f0fdf4" };
                  }
                  if (!dao.date_depot) {
                    return { label: "En cours", color: "#eab308", bgColor: "#fefce8" };
                  }
                  const dateDepot = new Date(dao.date_depot);
                  const today = new Date();
                  const diffDays = Math.floor((dateDepot.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  if (diffDays >= 5) {
                    return { label: "En cours", color: "#eab308", bgColor: "#fefce8" };
                  }
                  if (diffDays <= 3) {
                    return { label: "À risque", color: "#ef4444", bgColor: "#fef2f2" };
                  }
                  return { label: "En cours", color: "#eab308", bgColor: "#fefce8" };
                };

                const status = computeStatus();
                const rowColor = index % 2 === 0 ? '#f9fafb' : 'white';
                
                return `
                  <tr style="background: ${rowColor};">
                    <td style="border: 1px solid #e5e7eb; padding: 8px; font-weight: 600;">${dao.reference}</td>
                    <td style="border: 1px solid #e5e7eb; padding: 8px;">${dao.objet}</td>
                    <td style="border: 1px solid #e5e7eb; padding: 8px;">${dao.autorite || 'N/A'}</td>
                    <td style="border: 1px solid #e5e7eb; padding: 8px;">${dao.date_depot ? new Date(dao.date_depot).toLocaleDateString('fr-FR') : 'N/A'}</td>
                    <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">
                      <span style="background: ${status.bgColor}; color: ${status.color}; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">
                        ${status.label}
                      </span>
                    </td>
                    <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">
                      <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                        <div style="width: 30px; height: 6px; background: #e5e7eb; border-radius: 3px;">
                          <div style="background: ${avgProgress > 70 ? '#22c55e' : avgProgress > 40 ? '#eab308' : '#ef4444'}; height: 6px; border-radius: 3px; width: ${avgProgress}%;"></div>
                        </div>
                        <span style="font-size: 10px; font-weight: 600; color: #374151;">${avgProgress}%</span>
                      </div>
                    </td>
                    <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">
                      <span style="color: #374151; font-weight: 600;">${completedTasks}/${totalTasks}</span>
                    </td>
                    <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">
                      ${status.label === 'À risque' ? '<span style="color: #ef4444; font-weight: bold;">ÉLEVÉ</span>' : 
                        status.label === 'En cours' ? '<span style="color: #eab308; font-weight: bold;">MODÉRÉ</span>' : 
                        '<span style="color: #22c55e; font-weight: bold;">FAIBLE</span>'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;

      // Section Recommandations et Conclusions
      const riskDaosCount = daos.filter(d => {
        const statut = String(d.statut || "").toUpperCase();
        if (statut === "TERMINEE" || statut === "TERMINE") return false;
        if (!d.date_depot) return false;
        const diffDays = Math.floor((new Date(d.date_depot).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
      }).length;

      pdfContainer.innerHTML += `
        <div style="margin-bottom: 30px; background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 5px solid #f59e0b;">
          <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">POINTS D'ATTENTION</h3>
          <ul style="margin: 0; padding-left: 20px; color: #78350f;">
            <li style="margin-bottom: 8px;"><strong>${riskDaosCount} DAO</strong> présentent un risque critique nécessitant une attention immédiate</li>
            <li style="margin-bottom: 8px;">Taux de progression moyen : <strong>${Math.round(daos.reduce((sum, dao) => {
              const daoTasks = tasks.filter(task => task.dao_id === dao.id);
              return sum + (daoTasks.length > 0 ? Math.round(daoTasks.reduce((s, t) => s + (t.progress || 0), 0) / daoTasks.length) : 0);
            }, 0) / daos.length)}%</strong></li>
            <li style="margin-bottom: 8px;">Recommandation : Organiser une revue hebdomadaire pour les DAO à risque</li>
            <li style="margin-bottom: 8px;">Action requise : Mobiliser les ressources nécessaires pour les projets en retard</li>
          </ul>
        </div>

        <!-- Pied de page -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">Rapport généré automatiquement par le système de gestion des DAO</p>
          <p style="margin: 5px 0 0 0;">Direction Générale - ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      `;

      document.body.appendChild(pdfContainer);

      // Capturer le conteneur complet avec optimisation poids et résolution
      const canvas = await html2canvas(pdfContainer, {
        scale: 2, // Réduit de 1.5 à 2 pour optimiser le poids
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: pdfContainer.scrollWidth,
        height: pdfContainer.scrollHeight,
        windowWidth: pdfContainer.scrollWidth,
        windowHeight: pdfContainer.scrollHeight
      });

      // Créer le PDF avec optimisation
      const imgData = canvas.toDataURL('image/jpeg', 0.8); // JPEG avec 80% de qualité pour réduire le poids
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true // Activer la compression PDF
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculer les dimensions pour remplir la page A4 sans marges excessives
      const imgWidth = pdfWidth - 10; // 5mm de marge de chaque côté
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 5; // 5mm du haut

      // Ajouter la première page
      pdf.addImage(imgData, 'JPEG', 5, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Gérer les pages multiples
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 5;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 5, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // Sauvegarder avec nom optimisé
      pdf.save(`dao-report-${new Date().toISOString().split('T')[0]}.pdf`);

      // Nettoyer
      document.body.removeChild(pdfContainer);
      document.body.removeChild(loadingIndicator);

      console.log('PDF complet généré avec succès');

    } catch (error) {
      console.error('Erreur lors de la génération du PDF complet:', error);
      
      // Supprimer l'indicateur en cas d'erreur
      const loadingIndicator = document.querySelector('div[style*="position: fixed"]');
      if (loadingIndicator && loadingIndicator.parentNode) {
        loadingIndicator.parentNode.removeChild(loadingIndicator);
      }

      // Afficher un message d'erreur
      const errorMessage = document.createElement('div');
      errorMessage.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">Erreur PDF</div>
        <div style="font-size: 12px;">La génération du PDF a échoué. Veuillez réessayer.</div>
      `;
      errorMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 300px;
      `;
      document.body.appendChild(errorMessage);

      setTimeout(() => {
        if (document.body.contains(errorMessage)) {
          document.body.removeChild(errorMessage);
        }
      }, 5000);
    }
  };

  // Initialize charts
  useEffect(() => {
    if (!loading && daos.length > 0) {
      initializeCharts();
    }
  }, [loading, daos, tasks, selectedDAO]);

  const initializeCharts = () => {
    console.log("Initialisation des graphiques...");
    console.log("Nombre de DAO:", daos.length);
    console.log("Nombre de tâches:", tasks.length);

    // Global DAO Progress Chart
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        const daoProgressData = daos.map(dao => {
          const daoTasks = tasks.filter(task => task.dao_id === dao.id);
          console.log(`DAO ${dao.id} (${dao.reference}): ${daoTasks.length} tâches`);
          
          if (daoTasks.length === 0) return 0;
          const avgProgress = daoTasks.reduce((sum, task) => sum + (task.progress || 0), 0) / daoTasks.length;
          console.log(`Progression moyenne: ${avgProgress}%`);
          return Math.round(avgProgress);
        });

        console.log("Données de progression DAO:", daoProgressData);

        new Chart(ctx, {
          type: "line",
          data: {
            labels: daos.map(dao => dao.reference),
            datasets: [
              {
                label: "Progression globale (%)",
                data: daoProgressData,
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.4,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "top",
              },
              title: {
                display: true,
                text: "Progression des DAO",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
              },
            },
          },
        });
      }
    }

    // Status Distribution Pie Chart
    if (pieChartRef.current) {
      const ctx = pieChartRef.current.getContext("2d");
      if (ctx) {
        const statusCounts = {
          "en cours": daos.filter(d => d.statut === "en cours").length,
          "validé": daos.filter(d => d.statut === "validé").length,
          "terminé": daos.filter(d => d.statut === "terminé").length,
          "annulé": daos.filter(d => d.statut === "annulé").length,
        };

        console.log("Répartition des statuts DAO:", statusCounts);

        new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: Object.keys(statusCounts),
            datasets: [
              {
                data: Object.values(statusCounts),
                backgroundColor: [
                  "rgba(59, 130, 246, 0.8)",
                  "rgba(34, 197, 94, 0.8)",
                  "rgba(168, 85, 247, 0.8)",
                  "rgba(239, 68, 68, 0.8)",
                ],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "bottom",
              },
              title: {
                display: true,
                text: "Répartition des statuts DAO",
              },
            },
          },
        });
      }
    }

    // Tasks Priority Bar Chart
    if (barChartRef.current) {
      const ctx = barChartRef.current.getContext("2d");
      if (ctx) {
        const priorityCounts = {
          
        };

        

       
      }
    }
  };

  const stats = {
    totalDaos: daos.length,
    atRiskDaos: daos.filter(d => {
      // Même logique que l'admin pour "À risque"
      const statut = String(d.statut || "").toUpperCase();
      
      // Si terminé, pas à risque
      if (statut === "TERMINEE" || statut === "TERMINE") {
        return false;
      }
      
      // Si pas de date_depot, considérer comme en cours (pas à risque)
      if (!d.date_depot) {
        return false;
      }
      
      const dateDepot = new Date(d.date_depot);
      const today = new Date();
      // Nombre de jours restants : date_depot - aujourd'hui
      const diffMs = dateDepot.getTime() - today.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      // À risque si ≤ 3 jours (même logique que admin)
      return diffDays <= 3;
    }).length,
    inProgressDaos: daos.filter(d => {
      // Même logique que l'admin pour "En cours"
      const statut = String(d.statut || "").toUpperCase();
      
      // Si terminé, pas en cours
      if (statut === "TERMINEE" || statut === "TERMINE") {
        return false;
      }
      
      // Si pas de date_depot, considérer comme en cours
      if (!d.date_depot) {
        return true;
      }
      
      const dateDepot = new Date(d.date_depot);
      const today = new Date();
      // Nombre de jours restants : date_depot - aujourd'hui
      const diffMs = dateDepot.getTime() - today.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      // En cours si ≥ 5 jours (même logique que admin)
      return diffDays >= 5;
    }).length,
    totalUsers: users.length,
  };

  // Logs pour déboguer
  console.log("=== STATISTIQUES DASHBOARD ===");
  console.log("DAOs récupérés:", daos.length);
  console.log("Tâches récupérées:", tasks.length);
  console.log("Utilisateurs récupérés:", users.length);
  console.log("Statuts DAO:", daos.map(d => ({ id: d.id, statut: d.statut, date_depot: d.date_depot })));
  console.log("Statuts tâches:", tasks.map(t => ({ id: t.id, statut: t.statut, progress: t.progress })));
  console.log("Stats calculées:", stats);
  
  // Logs détaillés pour les DAO à risque (même logique que admin)
  const today = new Date();
  const atRiskDaos = daos.filter(d => {
    const statut = String(d.statut || "").toUpperCase();
    
    if (statut === "TERMINEE" || statut === "TERMINE") {
      return false;
    }
    
    if (!d.date_depot) {
      return false;
    }
    
    const dateDepot = new Date(d.date_depot);
    const diffMs = dateDepot.getTime() - today.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays <= 3;
  });
  
  const inProgressDaos = daos.filter(d => {
    const statut = String(d.statut || "").toUpperCase();
    
    if (statut === "TERMINEE" || statut === "TERMINE") {
      return false;
    }
    
    if (!d.date_depot) {
      return true;
    }
    
    const dateDepot = new Date(d.date_depot);
    const diffMs = dateDepot.getTime() - today.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays >= 5;
  });
  
  console.log("DAOs à risque (≤ 3 jours):", atRiskDaos.map(d => ({ 
    id: d.id, 
    reference: d.reference, 
    date_depot: d.date_depot,
    jours_restants: d.date_depot ? Math.floor((new Date(d.date_depot).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'
  })));
  
  console.log("DAOs en cours (≥ 5 jours):", inProgressDaos.map(d => ({ 
    id: d.id, 
    reference: d.reference, 
    date_depot: d.date_depot,
    jours_restants: d.date_depot ? Math.floor((new Date(d.date_depot).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'
  })));

  const getDAOStatusColor = (status: string) => {
    switch (status) {
      case "en cours": return "text-blue-600 bg-blue-100";
      case "validé": return "text-green-600 bg-green-100";
      case "terminé": return "text-purple-600 bg-purple-100";
      case "annulé": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "haute": return "text-red-600 bg-red-100";
      case "moyenne": return "text-orange-600 bg-orange-100";
      case "basse": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-50 p-6 no-print">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <h3 className="text-2xl font-bold text-gray-900">Dashboard Directeur Général</h3>
              </div>
              <div className="flex items-center space-x-4">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total DAO"
            value={stats.totalDaos}
            icon={<FileText className="w-6 h-6 text-blue-600" />}
            color="blue"
          />
          <StatCard
            title="À risque"
            value={stats.atRiskDaos}
            icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
            color="yellow"
          />
          <StatCard
            title="En cours"
            value={stats.inProgressDaos}
            icon={<Activity className="w-6 h-6 text-green-600" />}
            color="green"
          />
          
        </div>

        {/* Charts Section */}
       <div className="w-full mb-8">
  <div id="progression-chart" className="bg-white p-6 rounded-lg shadow-sm w-full">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">
        Progression des DAO
      </h3>
      <button
        onClick={downloadDGComprehensivePDF}
        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
        title="Télécharger le rapport DG complet"
      >
        <FileText size={16} />
      </button>
    </div>
    <div className="w-full h-[500px]">
      <canvas ref={chartRef} className="w-full h-full"></canvas>
    </div>
  </div>
</div>
        

        {/* DAOs List */}
        <div id="daos-list" className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Liste des DAO</h3>
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setSelectedDAO(null)}
                >
                  Voir tout
                </button>
                <button
                  onClick={downloadDGComprehensivePDF}
                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                  title="Télécharger le rapport DG complet"
                >
                  <FileText size={16} />
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Objet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Autorité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de dépôt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progression
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                        Chargement...
                      </div>
                    </td>
                  </tr>
                ) : daos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Aucun DAO trouvé
                    </td>
                  </tr>
                ) : (
                  daos.map((dao) => {
                    const daoTasks = tasks.filter(task => task.dao_id === dao.id);
                    const avgProgress = daoTasks.length > 0 
                      ? Math.round(daoTasks.reduce((sum, task) => sum + (task.progress || 0), 0) / daoTasks.length)
                      : 0;

                    // Calcul du statut comme l'admin
                    const computeStatus = () => {
                      const statut = String(dao.statut || "").toUpperCase();
                      
                      if (statut === "TERMINEE" || statut === "TERMINE") {
                        return {
                          label: "Terminée",
                          className: "px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
                        };
                      }
                      
                      if (!dao.date_depot) {
                        return {
                          label: "En cours",
                          className: "px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800"
                        };
                      }
                      
                      const dateDepot = new Date(dao.date_depot);
                      const today = new Date();
                      const diffMs = dateDepot.getTime() - today.getTime();
                      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                      
                      if (diffDays >= 5) {
                        return {
                          label: "En cours",
                          className: "px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800"
                        };
                      }
                      
                      if (diffDays <= 3) {
                        return {
                          label: "À risque",
                          className: "px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800"
                        };
                      }
                      
                      return {
                        label: "En cours",
                        className: "px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800"
                      };
                    };

                    const status = computeStatus();

                    return (
                      <tr key={dao.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {dao.reference}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {dao.objet}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {dao.autorite || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dao.date_depot ? new Date(dao.date_depot).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit', 
                            year: 'numeric'
                          }) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={status.className}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 mr-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${avgProgress}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-600">{avgProgress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            onClick={() => {
                              // Rediriger vers les détails du DAO
                              window.location.href = `/dash/DirecteurGeneral/task?id=${dao.id}`;
                            }}
                          >
                            Détails
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal de commentaire */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Commentaires</h2>
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
            <div className="bg-gray-50 rounded-xl p-4 mt-4">
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
                        .filter(u => u.username.toLowerCase().includes(mentionSearch.toLowerCase()))
                        .map((user) => (
                          <div
                            key={user.id}
                            onClick={() => insertMention(user)}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded"
                          >
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-xs font-bold">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm">{user.username}</span>
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

/* =======================
   STAT CARD
======================= */
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "yellow" | "purple";
}) {
  const colors = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    yellow: "bg-yellow-50 border-yellow-200",
    purple: "bg-purple-50 border-purple-200",
  };

  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 bg-white rounded-lg">{icon}</div>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="font-medium text-gray-800">{title}</p>
    </div>
  );
}
