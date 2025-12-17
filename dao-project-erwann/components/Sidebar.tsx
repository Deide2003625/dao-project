"use client";

import { useEffect, useState } from "react";

export default function Sidebar() {
  const [roleId, setRoleId] = useState<number | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setRoleId(user.role_id);
    }
  }, []);

  if (!roleId) return null; // évite le flash au chargement

  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">

        {/* DASHBOARD (tous les rôles) */}
        <li className="nav-item active">
          <a
            className="nav-link"
            href={
              roleId === 1 ? "/dash/DirecteurGeneral" :
              roleId === 2 ? "/dash/admin" :
              roleId === 3 ? "/dash/ChefProjet" :
              roleId === 4 ? "/dash/MembreEquipe" :
              "/dash/Lecteur"
            }
          >
            <i className="mdi mdi-view-dashboard menu-icon"></i>
            <span className="menu-title">Dashboard</span>
          </a>
        </li>

        {/* ADMIN SEULEMENT */}
        {roleId === 2 && (
          <>
            <li className="nav-item">
              <a className="nav-link" href="/admin/add">
                <i className="mdi mdi-account-plus menu-icon"></i>
                <span className="menu-title">Créer un utilisateur</span>
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="/dash/admin/new-dao">
                <i className="mdi mdi-folder-plus menu-icon"></i>
                <span className="menu-title">Nouveau DAO</span>
              </a>
            </li>
          </>
        )}

        {/* CHEF DE PROJET */}
        {roleId === 3 && (
          <li className="nav-item">
            <a className="nav-link" href="/dash/admin/new-dao">
              <i className="mdi mdi-folder-plus menu-icon"></i>
              <span className="menu-title">Créer un DAO</span>
            </a>
          </li>
        )}

         {/* DirecteurGeneral */}
        {roleId === 1 && (
          <li className="nav-item">
            <a className="nav-link" href="/dash/admin/new-dao">
              <i className="mdi mdi-folder-plus menu-icon"></i>
              <span className="menu-title">Créer un DAO</span>
            </a>
          </li>
        )}

         {/* MembreEquipe */}
        {roleId === 4 && (
          <li className="nav-item">
            <a className="nav-link" href="/dash/admin/new-dao">
              <i className="mdi mdi-folder-plus menu-icon"></i>
              <span className="menu-title">Créer un DAO</span>
            </a>
          </li>
        )}

          {/* Lecteur */}
        {roleId === 5 && (
          <li className="nav-item">
            <a className="nav-link" href="/dash/admin/new-dao">
              <i className="mdi mdi-folder-plus menu-icon"></i>
              <span className="menu-title">Créer un DAO</span>
            </a>
          </li>
        )}

      
            

      </ul>
    </nav>
  );
}
