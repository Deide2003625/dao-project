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

      // Créer un conteneur temporaire pour le PDF
      const pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        width: 210mm;
        background: white;
        padding: 20px;
        font-family: Arial, sans-serif;
      `;

      // En-tête professionnel pour le DG
      pdfContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1e40af; padding-bottom: 15px;">
          <h1 style="color: #1f2937; margin: 0; font-size: 28px; font-weight: bold;">RAPPORT DE SYNTHÈSE DES DAO</h1>
          <h2 style="color: #3b82f6; margin: 5px 0 0 0; font-size: 18px;">Direction Générale</h2>
          <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;">Généré le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <!-- Section Synthèse Exécutive -->
        <div style="margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 5px solid #3b82f6;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">SYNTHÈSE EXÉCUTIVE</h3>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
            <div style="text-align: center; background: white; padding: 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="font-size: 32px; font-weight: bold; color: #3b82f6;">${stats.totalDaos}</div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">DAO Total</div>
            </div>
            <div style="text-align: center; background: white; padding: 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="font-size: 32px; font-weight: bold; color: #ef4444;">${stats.atRiskDaos}</div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">À Risque</div>
            </div>
            <div style="text-align: center; background: white; padding: 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="font-size: 32px; font-weight: bold; color: #22c55e;">${stats.inProgressDaos}</div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">En Cours</div>
            </div>
          </div>
        </div>
      `;

      // Section Graphiques et Analyse
      pdfContainer.innerHTML += `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px; font-weight: bold; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">ANALYSE GRAPHIQUE</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      `;

      // Ajouter les graphiques en capturant les canvas
      if (chartRef.current) {
        const chartCanvas = await html2canvas(chartRef.current, {
          scale: 1.5,
          backgroundColor: '#ffffff',
          logging: false
        });
        pdfContainer.innerHTML += `
          <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h4 style="color: #374151; margin: 0 0 10px 0; font-size: 14px; text-align: center;">Progression des DAO</h4>
            <img src="${chartCanvas.toDataURL()}" style="width: 100%; height: auto; border-radius: 4px;" />
          </div>
        `;
      }

      if (pieChartRef.current) {
        const pieCanvas = await html2canvas(pieChartRef.current, {
          scale: 1.5,
          backgroundColor: '#ffffff',
          logging: false
        });
        pdfContainer.innerHTML += `
          <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h4 style="color: #374151; margin: 0 0 10px 0; font-size: 14px; text-align: center;">Répartition des Statuts</h4>
            <img src="${pieCanvas.toDataURL()}" style="width: 100%; height: auto; border-radius: 4px;" />
          </div>
        `;
      }

      pdfContainer.innerHTML += `
          </div>
        </div>
      `;

      
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

      // Capturer le conteneur complet
      const canvas = await html2canvas(pdfContainer, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Créer le PDF
      const imgData = canvas.toDataURL('image/png', 0.9);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`rapport-dao-${new Date().toISOString().split('T')[0]}.pdf`);

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
