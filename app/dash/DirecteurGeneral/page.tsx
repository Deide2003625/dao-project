"use client";

export default function Page() {
  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="row">
        <div className="col-12 grid-margin">
          <div className="d-flex justify-content-between flex-wrap">
            <div className="d-flex align-items-end flex-wrap">
              <div className="mr-md-3 mr-xl-5">
                <h2>Direction Générale</h2>
                <p className="mb-md-0">
                  Tableau de bord – Suivi des Dossiers d’Appel d’Offres (DAO)
                </p>
              </div>
              <div className="d-flex">
                <i className="mdi mdi-home text-muted hover-cursor"></i>
                <p className="text-muted mb-0 hover-cursor">
                  &nbsp;/&nbsp;Dashboard&nbsp;/&nbsp;
                </p>
                <p className="text-primary mb-0 hover-cursor">DAO</p>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-end flex-wrap">
              <button className="btn btn-primary">
                Exporter le rapport des DAO
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body dashboard-tabs p-0">
              <ul className="nav nav-tabs px-4" role="tablist">
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    data-bs-toggle="tab"
                    href="#overview"
                  >
                    Vue générale
                  </a>
                </li>
              </ul>

              <div className="tab-content py-0 px-0">
                {/* ================= OVERVIEW ================= */}
                <div
                  className="tab-pane fade show active"
                  id="overview"
                >
                  <div className="d-flex flex-wrap justify-content-xl-between">

                    <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3">
                      <i className="mdi mdi-folder-multiple icon-lg mr-3 text-primary"></i>
                      <div>
                        <small className="text-muted">Total DAO</small>
                        <h5 className="mb-0">28</h5>
                      </div>
                    </div>

                    <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3">
                      <i className="mdi mdi-progress-clock icon-lg mr-3 text-warning"></i>
                      <div>
                        <small className="text-muted">DAO en cours</small>
                        <h5 className="mb-0">12</h5>
                      </div>
                    </div>

                    <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3">
                      <i className="mdi mdi-alert mr-3 icon-lg text-danger"></i>
                      <div>
                        <small className="text-muted">DAO a risque</small>
                        <h5 className="mb-0">9</h5>
                      </div>
                    </div>

                    <div className="d-flex flex-grow-1 align-items-center justify-content-center p-3">
                      <i className="mdi mdi-check-circle icon-lg mr-3 text-success"></i>
                      <div>
                        <small className="text-muted">DAO terminés</small>
                        <h5 className="mb-0">7</h5>
                      </div>
                    </div>

                  </div>
                </div>

                {/* ================= DAO TAB ================= */}
                <div className="tab-pane fade" id="dao">
                  <div className="p-4">
                    <h4>Suivi détaillé des DAO</h4>
                    <p className="text-muted">
                      Consultation des dossiers soumis à validation.
                    </p>
                  </div>
                </div>

                {/* ================= COMMENTS ================= */}
                <div className="tab-pane fade" id="comments">
                  <div className="p-4">
                    <h4>Observations du Directeur Général</h4>
                    <textarea
                      className="form-control"
                      rows="5"
                      placeholder="Saisir un commentaire ou une instruction..."
                    ></textarea>
                    <button className="btn btn-primary mt-3">
                      Enregistrer le commentaire
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABLE DAO ================= */}
      <div className="row">
        <div className="col-12 stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="card-title">Liste des DAO</p>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Objet</th>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>DAO-001</td>
                      <td>Fourniture équipements</td>
                      <td>12/01/2026</td>
                      <td>
                        <span className="badge badge-warning">
                          En cours
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary">
                          <a href="/dash/DirecteurGeneral/task">Voir</a>
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td>DAO-002</td>
                      <td>Travaux de réhabilitation</td>
                      <td>08/01/2026</td>
                      <td>
                        <span className="badge badge-success">
                          Validé
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary">
                          <a href="/dash/DirecteurGeneral/task">Voir</a>
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td>DAO-003</td>
                      <td>Prestations informatiques</td>
                      <td>05/01/2026</td>
                      <td>
                        <span className="badge badge-danger">
                          Rejeté
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary">
                          <a href="/dash/DirecteurGeneral/task">Voir</a>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
