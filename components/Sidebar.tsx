"use client"

export default function Sidebar() {
  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        <li className="nav-item active">
          <a className="nav-link" href="/dash/admin">
            <i className="mdi mdi-view-dashboard menu-icon"></i>
            <span className="menu-title">Dashboard</span>
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link" href="/admin/add">
            <i className="mdi mdi-account-plus menu-icon"></i>
            <span className="menu-title">Creer un utilisateur</span>
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link" href="/dash/admin/new-dao">
            <i className="mdi mdi-folder-plus menu-icon"></i>
            <span className="menu-title">Nouveau DAO</span>
          </a>
        </li>


        <li className="nav-item">
          <a className="nav-link" data-bs-toggle="collapse" href="#auth">
            <i className="mdi mdi-account menu-icon"></i>
            <span className="menu-title">User Pages</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="auth">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item"><a className="nav-link" href="#">Login</a></li>
            </ul>
          </div>
        </li>
      </ul>
    </nav>
  )
}
