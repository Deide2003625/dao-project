'use client';

export default function Page() {
  return (
    <>
      {/* ROW 1 - Header with breadcrumb */}
      <div className="row">
        <div className="col-12 grid-margin">
          <div className="d-flex justify-content-between flex-wrap">
              <div className="d-flex align-items-end flex-wrap">
                <div className="mr-md-3 mr-xl-5">
                  <h2>Welcome back ADMIN,</h2>
                  <div className="d-flex mt-2">
                    <i className="mdi mdi-home text-muted hover-cursor"></i>
                    <p className="text-muted mb-0 hover-cursor">&nbsp;/&nbsp;Dashboard&nbsp;/&nbsp;</p>
                    <p className="text-primary mb-0 hover-cursor">Analytics</p>
                  </div>
                </div>
              </div>

            <div className="d-flex justify-content-between align-items-end flex-wrap">
              <button className="btn btn-primary mt-2 mt-xl-0">Download report</button>
            </div>
          </div>
        </div>
      </div>

      {/* TABS SECTION */}
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body dashboard-tabs p-0">

              <div className="tab-content py-0 px-0">
                <div className="tab-pane fade show active" id="overview" role="tabpanel">
                  <div className="d-flex flex-wrap justify-content-xl-between">
                    {/* block 1 */}
                    <div className="d-none d-xl-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item" style={{background: 'linear-gradient(90deg, #f5f5f5, #e0e0e0)'}}>
                      <i className="mdi mdi-calendar icon-lg mr-3 text-secondary"></i>
                      <div className="d-flex flex-column justify-content-around">
                        <small className="mb-1 text-muted">Total DAO</small>
                        <div className="dropdown">
                        </div>
                      </div>
                    </div>

                    {/* block 2 */}
                    <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item" style={{background: 'linear-gradient(90deg, #fff9c4, #fff176)'}}>
                      <i className="mdi mdi-timer-sand mr-3 icon-lg text-warning"></i>
                      <div className="d-flex flex-column justify-content-around">
                        <small className="mb-1 text-muted">En cours</small>
                      </div>
                    </div>

                    {/* block 3 */}
                    <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item" style={{background: 'linear-gradient(90deg, #ffebee, #ef9a9a)'}}>
                      <i className="mdi mdi-alert mr-3 icon-lg text-danger"></i>
                      <div className="d-flex flex-column justify-content-around">
                        <small className="mb-1 text-muted">À risque</small>
                      </div>
                    </div>

                    {/* block 4 */}
                    <div className="d-flex py-3 border-md-right flex-grow-1 align-items-center justify-content-center p-3 item" style={{background: 'linear-gradient(90deg, #e8f5e9, #a5d6a7)'}}>
                      <i className="mdi mdi-checkbox-marked mr-3 icon-lg text-success"></i>
                      <div className="d-flex flex-column justify-content-around">
                        <small className="mb-1 text-muted">Terminées</small>
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

      {/* TABLE */}
      <div className="row">
        <div className="col-12 stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="card-title">Recent Purchases</p>
              <div className="table-responsive">
                <table id="recent-purchases-listing" className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Référence</th>
                      <th>Autorité contractante</th>
                      <th>Chef d'equipe</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Jeremy Ortega</td>
                      <td>Levelled up</td>
                      <td>Catalinaborough</td>
                    </tr>
                    <tr>
                      <td>Alvin Fisher</td>
                      <td>Ui design completed</td>
                      <td>East Mayra</td>
                    </tr>
                    <tr>
                      <td>John Doe</td>
                      <td>Project completed</td>
                      <td>New York</td>
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
