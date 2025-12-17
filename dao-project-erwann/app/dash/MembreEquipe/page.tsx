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
                <h2>Welcome back,</h2>
                <p className="mb-md-0">Your analytics dashboard template.</p>
              </div>
              <div className="d-flex">
                <i className="mdi mdi-home text-muted hover-cursor"></i>
                <p className="text-muted mb-0 hover-cursor">&nbsp;/&nbsp;Dashboard&nbsp;/&nbsp;</p>
                <p className="text-primary mb-0 hover-cursor">Analytics</p>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-end flex-wrap">
              <button type="button" className="btn btn-light bg-white btn-icon mr-3 d-none d-md-block">
                <i className="mdi mdi-download text-muted"></i>
              </button>
              <button type="button" className="btn btn-light bg-white btn-icon mr-3 mt-2 mt-xl-0">
                <i className="mdi mdi-clock-outline text-muted"></i>
              </button>
              <button type="button" className="btn btn-light bg-white btn-icon mr-3 mt-2 mt-xl-0">
                <i className="mdi mdi-plus text-muted"></i>
              </button>
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
              <ul className="nav nav-tabs px-4" role="tablist">
                <li className="nav-item">
                  <a className="nav-link active" id="overview-tab" data-bs-toggle="tab" href="#overview" role="tab">Overview</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" id="sales-tab" data-bs-toggle="tab" href="#sales" role="tab">Sales</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" id="purchases-tab" data-bs-toggle="tab" href="#purchases" role="tab">Purchases</a>
                </li>
              </ul>

              <div className="tab-content py-0 px-0">
                <div className="tab-pane fade show active" id="overview" role="tabpanel">
                  <div className="d-flex flex-wrap justify-content-xl-between">
                    {/* block 1 */}
                    <div className="d-none d-xl-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                      <i className="mdi mdi-calendar-heart icon-lg mr-3 text-primary"></i>
                      <div className="d-flex flex-column justify-content-around">
                        <small className="mb-1 text-muted">Start date</small>
                        <div className="dropdown">
                          <a className="btn btn-secondary dropdown-toggle p-0 bg-transparent border-0 text-dark shadow-none font-weight-medium" href="#" id="dropdownMenuLinkA" data-bs-toggle="dropdown">
                            <h5 className="mb-0 d-inline-block">26 Jul 2018</h5>
                          </a>
                          <ul className="dropdown-menu" aria-labelledby="dropdownMenuLinkA">
                            <li><a className="dropdown-item" href="#">12 Aug 2018</a></li>
                            <li><a className="dropdown-item" href="#">22 Sep 2018</a></li>
                            <li><a className="dropdown-item" href="#">21 Oct 2018</a></li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* block 2 */}
                    <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                      <i className="mdi mdi-currency-usd mr-3 icon-lg text-danger"></i>
                      <div className="d-flex flex-column justify-content-around">
                        <small className="mb-1 text-muted">Revenue</small>
                        <h5 className="mr-2 mb-0">$577545</h5>
                      </div>
                    </div>

                    {/* block 3 */}
                    <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                      <i className="mdi mdi-eye mr-3 icon-lg text-success"></i>
                      <div className="d-flex flex-column justify-content-around">
                        <small className="mb-1 text-muted">Total views</small>
                        <h5 className="mr-2 mb-0">9833550</h5>
                      </div>
                    </div>

                    {/* block 4 */}
                    <div className="d-flex border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                      <i className="mdi mdi-download mr-3 icon-lg text-warning"></i>
                      <div className="d-flex flex-column justify-content-around">
                        <small className="mb-1 text-muted">Downloads</small>
                        <h5 className="mr-2 mb-0">2233783</h5>
                      </div>
                    </div>

                    {/* block 5 */}
                    <div className="d-flex py-3 border-md-right flex-grow-1 align-items-center justify-content-center p-3 item">
                      <i className="mdi mdi-flag mr-3 icon-lg text-danger"></i>
                      <div className="d-flex flex-column justify-content-around">
                        <small className="mb-1 text-muted">Flagged</small>
                        <h5 className="mr-2 mb-0">3497843</h5>
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

      {/* CHARTS */}
      <div className="row">
        <div className="col-lg-7 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="card-title">Cash deposits</p>
              <p className="mb-4">To start a blog, think of a topic about...</p>
              <div id="cash-deposits-chart-legend" className="d-flex justify-content-center pt-3"></div>
              <canvas id="cash-deposits-chart"></canvas>
            </div>
          </div>
        </div>

        <div className="col-lg-5 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="card-title">Total sales</p>
              <h1>$ 28835</h1>
              <h4>Gross sales over the years</h4>
              <p className="text-muted">Today, many people rely on computers...</p>
              <div id="total-sales-chart-legend"></div>
            </div>
            <canvas id="total-sales-chart"></canvas>
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
                      <th>Name</th>
                      <th>Status report</th>
                      <th>Office</th>
                      <th>Price</th>
                      <th>Date</th>
                      <th>Gross amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Jeremy Ortega</td>
                      <td>Levelled up</td>
                      <td>Catalinaborough</td>
                      <td>$790</td>
                      <td>06 Jan 2018</td>
                      <td>$2,274,253</td>
                    </tr>
                    <tr>
                      <td>Alvin Fisher</td>
                      <td>Ui design completed</td>
                      <td>East Mayra</td>
                      <td>$23,230</td>
                      <td>18 Jul 2018</td>
                      <td>$83,127</td>
                    </tr>
                    <tr>
                      <td>John Doe</td>
                      <td>Project completed</td>
                      <td>New York</td>
                      <td>$12,450</td>
                      <td>15 Mar 2018</td>
                      <td>$145,200</td>
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
