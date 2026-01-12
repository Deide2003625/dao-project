"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function NewDaoPage() {
  const [generatedNumber, setGeneratedNumber] = useState("");
  const [dateDepot, setDateDepot] = useState("");
  const [objet, setObjet] = useState("");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [autorite, setAutorite] = useState("");
  const [chefEquipe, setChefEquipe] = useState("");
  const [membres, setMembres] = useState<string[]>([]);
  const [users, setUsers] = useState<
    Array<{ id: number; username: string; role: string }>
  >([]);
  const [teamLeaders, setTeamLeaders] = useState<
    Array<{ id: number; username: string; role: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [membresOpen, setMembresOpen] = useState(false);
  const membresRef = useRef<HTMLDivElement | null>(null);
  const membresButtonRef = useRef<HTMLButtonElement | null>(null);
  const [membresFlipUp, setMembresFlipUp] = useState(false);

  useEffect(() => {
    // Génération basique d'un numéro séquentiel conservé en localStorage
    const year = new Date().getFullYear();
    const key = `dao-seq-${year}`;
    let seq = Number(localStorage.getItem(key) || "0");
    seq = seq + 1;
    localStorage.setItem(key, String(seq));
    const num = `DAO-${year}-${String(seq).padStart(3, "0")}`;
    setGeneratedNumber(num);

    // Charger utilisateurs (endpoint existant attendu : /api/users)
    (async () => {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) {
          console.error("Erreur lors de la récupération des utilisateurs:", await res.text());
          return;
        }
        const data = await res.json();
        console.log("Données brutes de l'API:", JSON.stringify(data, null, 2));
        
        // Vérifier la structure des données
        const usersData = Array.isArray(data) ? data : (data.users || []);
        console.log("Liste des utilisateurs (après extraction):", JSON.stringify(usersData, null, 2));
        
        // Afficher les clés du premier utilisateur (si disponible)
        if (usersData.length > 0) {
          console.log("Clés du premier utilisateur:", Object.keys(usersData[0]));
          console.log("Valeurs du premier utilisateur:", JSON.stringify(usersData[0], null, 2));
          
          // Afficher les rôles disponibles
          const roles = [...new Set(usersData.map((u: any) => ({
            role_id: u.role_id,
            roleName: u.roleName,
            role: u.role
          })))];
          console.log("Rôles trouvés dans les données:", JSON.stringify(roles, null, 2));
        }
        
        // Fonction pour obtenir le nom du rôle en fonction de l'ID
        const getRoleName = (roleId: string | number): string => {
          const id = String(roleId);
          switch (id) {
            case '1': return 'Admin';
            case '2': return 'Admin';
            case '3': return 'ChefProjet';
            case '4': return 'MembreEquipe';
            default: return 'Utilisateur';
          }
        };

        // Pour les membres d'équipe (role_id = '4' ou 4)
        const membersList = usersData
          .filter((u: any) => {
            const roleId = String(u.role_id || u.role);
            return roleId === '4';
          })
          .map((u: any) => ({
            id: u.id,
            username: u.username || u.email || `user-${u.id}`,
            role: u.roleName || getRoleName(u.role_id || u.role),
            role_id: u.role_id || u.role
          }));
        console.log("Membres d'équipe:", membersList);
        setUsers(membersList);

        // Pour les chefs d'équipe (rôles '2' ou 2, '3' ou 3)
        const teamLeadersList = usersData
          .filter((u: any) => {
            const roleId = String(u.role_id || u.role);
            return roleId === '2' || roleId === '3';
          })
          .map((u: any) => ({
            id: u.id,
            username: u.username || u.email || `user-${u.id}`,
            role: getRoleName(u.role_id || u.role),
            role_id: u.role_id || u.role
          }));
        console.log("Chefs d'équipe:", teamLeadersList);
        setTeamLeaders(teamLeadersList);
      } catch (err) {
        console.error("Erreur lors du chargement des utilisateurs:", err);
        // En cas d'erreur on laisse la liste vide
      }
    })();
  }, []);

  const toggleMembre = (id: number) => {
    const s = membres.includes(String(id))
      ? membres.filter((m) => m !== String(id))
      : [...membres, String(id)];
    setMembres(s);
  };

  // Fermer la liste des membres si clic à l'extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        membresRef.current &&
        !membresRef.current.contains(e.target as Node)
      ) {
        setMembresOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lors de l'ouverture, déterminer si on doit 'flip' le dropdown vers le haut
  const openMembres = () => {
    if (!membresButtonRef.current) {
      setMembresOpen((v) => !v);
      return;
    }
    const rect = membresButtonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const menuEstimatedHeight = 260; // correspond à maxHeight + padding
    // Si pas assez d'espace en bas mais assez en haut => ouvrir vers le haut
    if (spaceBelow < menuEstimatedHeight && spaceAbove > menuEstimatedHeight) {
      setMembresFlipUp(true);
    } else {
      setMembresFlipUp(false);
    }
    setMembresOpen((v) => !v);
  };

  const validate = () => {
    if (!dateDepot) return "La date de dépôt est requise.";
    if (!objet) return "L'objet est requis.";
    if (description.trim().length < 5)
      return "La description doit contenir au moins 5 caractères.";
    if (!reference) return "La référence est requise.";
    if (!autorite) return "L'autorité contractante est requise.";
    if (!chefEquipe) return "Le chef d'équipe doit être assigné.";
    if (membres.length === 0)
      return "Au moins un membre d'équipe doit être sélectionné.";
    return null;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    // Exemple de payload
    const payload = {
      numero: generatedNumber,
      date_depot: dateDepot,
      objet,
      description,
      reference,
      autorite,
      chefEquipe,
      membres,
    };

    try {
      const res = await fetch("/api/dao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || "Erreur lors de la création du DAO");
        return;
      }

      const data = await res.json();
      alert("DAO créé avec succès : " + data.numero);
      // Rediriger vers la liste des DAO
      window.location.href = "/dash/admin";
    } catch (err) {
      console.error("Error creating DAO:", err);
      setError("Erreur réseau lors de la création du DAO");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-body">
          <h3>Créer un nouveau DAO</h3>
          <p>Saisissez les informations du nouveau dossier d'appel d'offres</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">
                Numéro de liste (automatique)
              </label>
              <input
                className="form-control"
                value={generatedNumber}
                readOnly
              />
              <div className="form-text">
                Numéro généré automatiquement en séquence
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Date de dépôt *</label>
              <input
                type="date"
                className="form-control"
                value={dateDepot}
                onChange={(e) => setDateDepot(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Objet du dossier *</label>
              <input
                className="form-control"
                value={objet}
                onChange={(e) => setObjet(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Description détaillée du projet (minimum 5 caractères)
              </label>
              <textarea
                className="form-control"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="form-text">
                {description.length}/5 caractères minimum
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Référence *</label>
              <input
                className="form-control"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="ex: AMI-2025-SYSINFO"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Autorité contractante *</label>
              <input
                className="form-control"
                value={autorite}
                onChange={(e) => setAutorite(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Chef d'équipe *</label>
              <select
                className="form-select"
                value={chefEquipe}
                onChange={(e) => setChefEquipe(e.target.value)}
                required
              >
                <option value="">Sélectionnez un chef d'équipe</option>
                {teamLeaders.length > 0 ? (
                  teamLeaders.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.role})
                    </option>
                  ))
                ) : (
                  <option disabled>Aucun chef d'équipe disponible</option>
                )}
              </select>
            </div>

            <div
              className="mb-3"
              style={{ position: "relative" }}
              ref={membresRef}
            >
              <label className="form-label">Membres d'équipe *</label>
              <button
                ref={membresButtonRef}
                type="button"
                className="btn btn-light w-100 text-start"
                onClick={openMembres}
              >
                {membres.length > 0
                  ? `${membres.length} membre(s) sélectionné(s)`
                  : "Sélectionner des membres..."}
              </button>
              {membresOpen && (
                <div
                  className="border p-2 bg-white"
                  style={{
                    position: "absolute",
                    zIndex: 50,
                    maxHeight: 240,
                    overflow: "auto",
                    width: "100%",
                    ...(membresFlipUp
                      ? { bottom: "calc(100% + 8px)" }
                      : { top: "calc(100% + 8px)" }),
                  }}
                >
                  {users.length === 0 && (
                    <div className="text-muted">Aucun membre disponible</div>
                  )}
                  {users.map((u) => (
                    <label
                      key={u.id}
                      className="form-check d-flex align-items-center"
                      style={{
                        cursor: "pointer",
                        padding: "6px 8px",
                        gap: "8px",
                        fontSize: "0.95rem",
                      }}
                    >
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`m-${u.id}`}
                        checked={membres.includes(String(u.id))}
                        onChange={() => toggleMembre(u.id)}
                        style={{
                          width: 18,
                          height: 18,
                          minWidth: 18,
                          minHeight: 18,
                          margin: 0,
                          appearance: "checkbox",
                        }}
                      />
                      <span
                        className="form-check-label"
                        style={{
                          lineHeight: "1.2rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {u.username}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="d-flex justify-content-end gap-2">
              <Link href="/dash/admin" className="btn btn-light">
                Annuler
              </Link>
              <button type="submit" className="btn btn-primary">
                Créer le DAO
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
