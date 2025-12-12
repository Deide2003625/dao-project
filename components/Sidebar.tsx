"use client"

export default function Sidebar() {
  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        <li className="nav-item active">
          <a className="nav-link" href="/">
            <i className="mdi mdi-view-dashboard menu-icon"></i>
            <span className="menu-title">Dashboard</span>
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link" href="/admin/add">
            <i className="mdi mdi-account-plus menu-icon"></i>
            <span className="menu-title">Ajouter un utilisateur</span>
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link" href="#">
            <i className="mdi mdi-view-headline menu-icon"></i>
            <span className="menu-title">Form elements</span>
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link" href="#">
            <i className="mdi mdi-chart-pie menu-icon"></i>
            <span className="menu-title">Charts</span>
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link" href="#">
            <i className="mdi mdi-grid-large menu-icon"></i>
            <span className="menu-title">Tables</span>
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link" href="#">
            <i className="mdi mdi-emoticon menu-icon"></i>
            <span className="menu-title">Icons</span>
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
              <li className="nav-item"><a className="nav-link" href="#">Login 2</a></li>
              <li className="nav-item"><a className="nav-link" href="#">Register</a></li>
              <li className="nav-item"><a className="nav-link" href="#">Register 2</a></li>
              <li className="nav-item"><a className="nav-link" href="#">Lockscreen</a></li>
            </ul>
          </div>
        </li>

        <li className="nav-item">
          <a className="nav-link" href="#">
            <i className="mdi mdi-file-document-box-outline menu-icon"></i>
            <span className="menu-title">Documentation</span>
          </a>
        </li>

      </ul>
    </nav>
  )
}
