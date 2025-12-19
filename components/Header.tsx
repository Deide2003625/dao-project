"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{
    id: number;
    username: string;
    email: string;
    url_photo: string;
    role_id: number;
  } | null>(null);
  const router = useRouter();
  const menuRef = useRef<HTMLLIElement>(null);

  // Fonction pour formater correctement l'URL de la photo
  const formatPhotoUrl = (url: string | null | undefined) => {
    if (!url) return "/images/faces/face5.jpg";
    // Si l'URL commence par /uploads, on la laisse telle quelle car elle est déjà dans le dossier public
    // Sinon, on suppose que c'est un chemin relatif au dossier public
    return url.startsWith("/") ? url : `/${url}`;
  };

  // Fonction pour charger l'utilisateur depuis le localStorage
  const loadUserFromLocalStorage = () => {
    console.log("Chargement des données utilisateur depuis le localStorage...");
    const storedUser = localStorage.getItem("user");
    console.log(
      "Chargement des données utilisateur depuis le localStorage:",
      storedUser,
    );

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        const userData = {
          id: parsedUser.id,
          username:
            parsedUser.username ||
            parsedUser.email?.split("@")[0] ||
            "Utilisateur",
          email: parsedUser.email || "",
          url_photo: formatPhotoUrl(parsedUser.url_photo || ""),
          role_id: parsedUser.role_id || 0,
        };

        console.log("Données utilisateur formatées:", userData);
        setUser(userData);
      } catch (error) {
        console.error("Erreur lors du parsing des données utilisateur:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  // Charger l'utilisateur au montage et écouter les changements
  useEffect(() => {
    // Charger les données initiales
    loadUserFromLocalStorage();

    // Fonction pour gérer les changements de stockage (depuis d'autres onglets)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === null) {
        console.log(
          "Changement détecté dans le localStorage, rechargement des données utilisateur",
        );
        loadUserFromLocalStorage();
      }
    };

    // Fonction pour gérer les mises à jour de l'utilisateur (même onglet)
    const handleUserUpdated = (e: CustomEvent) => {
      console.log(
        "Événement userUpdated reçu, mise à jour des données utilisateur",
      );
      if (e.detail) {
        setUser({
          id: e.detail.id,
          username:
            e.detail.username || e.detail.email?.split("@")[0] || "Utilisateur",
          email: e.detail.email || "",
          url_photo: formatPhotoUrl(e.detail.url_photo || ""),
          role_id: e.detail.role_id || 0,
        });
      } else {
        loadUserFromLocalStorage();
      }
    };

    // Ajouter les écouteurs d'événements
    window.addEventListener("storage", handleStorageChange);
    // @ts-ignore - TypeScript ne connaît pas encore ce type d'événement personnalisé
    window.addEventListener("userUpdated", handleUserUpdated as EventListener);

    // Nettoyer les écouteurs d'événements lors du démontage
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      // @ts-ignore
      window.removeEventListener(
        "userUpdated",
        handleUserUpdated as EventListener,
      );
    };
  }, []);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      // Supprimer les données de l'utilisateur du localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      // Réinitialiser l'état utilisateur
      setUser(null);

      // Rediriger vers la page de connexion
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      // En cas d'erreur, on nettoie quand même le localStorage et on redirige
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      setUser(null);
      router.push("/login");
    }
  };

  console.log("Rendu du Header - État utilisateur:", user);

  return (
    <nav className="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
      <div className="navbar-brand-wrapper d-flex justify-content-center">
        <div className="navbar-brand-inner-wrapper d-flex justify-content-between align-items-center w-100">
          <a className="navbar-brand brand-logo" href="#">
            <Image src="/images/logo.png" width={120} height={40} alt="logo" />
          </a>
          <a className="navbar-brand brand-logo-mini" href="#">
            <Image
              src="/images/logo-mini.png"
              width={40}
              height={40}
              alt="logo mini"
            />
          </a>
          <button
            className="navbar-toggler navbar-toggler align-self-center"
            type="button"
          >
            <span className="mdi mdi-sort-variant"></span>
          </button>
        </div>
      </div>
      <div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
        <ul className="navbar-nav navbar-nav-right">
          {/* Messages Dropdown */}
          <li className="nav-item dropdown mr-1">
            <a
              className="nav-link count-indicator dropdown-toggle d-flex justify-content-center align-items-center"
              href="#"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="mdi mdi-message-text mx-0"></i>
              <span className="count"></span>
            </a>

            <div className="dropdown-menu dropdown-menu-right navbar-dropdown">
              <p className="mb-0 font-weight-normal float-left dropdown-header">
                Messages
              </p>
              <a className="dropdown-item">
                <div className="item-thumbnail">
                  <Image
                    src="/images/faces/face4.jpg"
                    width={40}
                    height={40}
                    className="profile-pic"
                    alt="profile"
                  />
                </div>
                <div className="item-content flex-grow">
                  <h6 className="ellipsis font-weight-normal">David Grey</h6>
                  <p className="font-weight-light small-text text-muted mb-0">
                    The meeting is cancelled
                  </p>
                </div>
              </a>
              <a className="dropdown-item">
                <div className="item-thumbnail">
                  <Image
                    src="/images/faces/face2.jpg"
                    width={40}
                    height={40}
                    className="profile-pic"
                    alt="profile"
                  />
                </div>
                <div className="item-content flex-grow">
                  <h6 className="ellipsis font-weight-normal">Tim Cook</h6>
                  <p className="font-weight-light small-text text-muted mb-0">
                    New product launch
                  </p>
                </div>
              </a>
              <a className="dropdown-item">
                <div className="item-thumbnail">
                  <Image
                    src="/images/faces/face3.jpg"
                    width={40}
                    height={40}
                    className="profile-pic"
                    alt="profile"
                  />
                </div>
                <div className="item-content flex-grow">
                  <h6 className="ellipsis font-weight-normal">Johnson</h6>
                  <p className="font-weight-light small-text text-muted mb-0">
                    Upcoming board meeting
                  </p>
                </div>
              </a>
            </div>
          </li>

          {/* Notifications */}
          <li className="nav-item dropdown mr-4">
            <a
              className="nav-link count-indicator dropdown-toggle d-flex align-items-center justify-content-center notification-dropdown"
              href="#"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="mdi mdi-bell mx-0"></i>
              <span className="count"></span>
            </a>
            <div className="dropdown-menu dropdown-menu-right navbar-dropdown">
              <p className="mb-0 font-weight-normal float-left dropdown-header">
                Notifications
              </p>
              <a className="dropdown-item">
                <div className="item-thumbnail">
                  <div className="item-icon bg-success">
                    <i className="mdi mdi-information mx-0"></i>
                  </div>
                </div>
                <div className="item-content">
                  <h6 className="font-weight-normal">Application Error</h6>
                  <p className="font-weight-light small-text mb-0 text-muted">
                    Just now
                  </p>
                </div>
              </a>
              <a className="dropdown-item">
                <div className="item-thumbnail">
                  <div className="item-icon bg-warning">
                    <i className="mdi mdi-settings mx-0"></i>
                  </div>
                </div>
                <div className="item-content">
                  <h6 className="font-weight-normal">Settings</h6>
                  <p className="font-weight-light small-text mb-0 text-muted">
                    Private message
                  </p>
                </div>
              </a>
              <a className="dropdown-item">
                <div className="item-thumbnail">
                  <div className="item-icon bg-info">
                    <i className="mdi mdi-account-box mx-0"></i>
                  </div>
                </div>
                <div className="item-content">
                  <h6 className="font-weight-normal">New user registration</h6>
                  <p className="font-weight-light small-text mb-0 text-muted">
                    2 days ago
                  </p>
                </div>
              </a>
            </div>
          </li>

          {/* Profile Dropdown */}
          <li
            className="nav-item nav-profile dropdown"
            ref={menuRef}
            style={{ position: "relative" }}
          >
            <a
              className="nav-link dropdown-toggle d-flex align-items-center"
              href="#"
              role="button"
              onClick={toggleMenu}
              style={{ cursor: "pointer" }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  marginRight: "8px",
                }}
              >
                <Image
                  src={user?.url_photo || "/images/faces/face5.jpg"}
                  width={40}
                  height={40}
                  alt="Profile"
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                  }}
                  onError={(e) => {
                    // En cas d'erreur de chargement, utiliser l'image par défaut
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/faces/face5.jpg";
                  }}
                />
              </div>
              <span className="nav-profile-name d-none d-sm-inline">
                {user?.username || user?.email?.split("@")[0] || "Utilisateur"}
              </span>
            </a>

            <div
              className={`dropdown-menu dropdown-menu-right navbar-dropdown${isMenuOpen ? " show" : ""}`}
              style={{
                display: isMenuOpen ? "block" : "none",
                position: "absolute",
                top: "100%",
                right: 0,
                zIndex: 1050,
                minWidth: "200px",
                padding: "0.5rem 0",
                margin: "0.125rem 0 0",
                fontSize: "0.875rem",
                color: "#212529",
                textAlign: "left",
                backgroundColor: "#fff",
                border: "1px solid rgba(0,0,0,.15)",
                borderRadius: "0.25rem",
                boxShadow: "0 0.5rem 1rem rgba(0,0,0,.175)",
              }}
            >
              <Link
                href="/profile"
                className="dropdown-item"
                onClick={closeMenu}
              >
                <i
                  className="mdi mdi-settings text-primary"
                  style={{ marginRight: "0.75rem", fontSize: "1.25rem" }}
                ></i>
                Profil
              </Link>
              <button onClick={handleLogout} className="dropdown-item">
                <i
                  className="mdi mdi-logout text-primary"
                  style={{ marginRight: "0.75rem", fontSize: "1.25rem" }}
                ></i>
                Logout
              </button>
            </div>
          </li>
        </ul>

        <button
          className="navbar-toggler navbar-toggler-right d-lg-none align-self-center"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="mdi mdi-menu"></span>
        </button>
      </div>
    </nav>
  );
}
