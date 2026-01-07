import Script from "next/script";

export default function Scripts() {
  return (
    <>
      {/* jQuery doit être chargé EN PREMIER */}
      <Script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="beforeInteractive"
      />

      {/* DataTables (dépend de jQuery) */}
      <Script src="/js/jquery.dataTables.js" strategy="afterInteractive" />

      {/* Autres scripts */}
      <Script src="/js/Chart.min.js" strategy="afterInteractive" />
      <Script src="/js/off-canvas.js" strategy="lazyOnload" />
      <Script src="/js/hoverable-collapse.js" strategy="lazyOnload" />
      <Script src="/js/template.js" strategy="lazyOnload" />
      <Script src="/js/dashboard.js" strategy="lazyOnload" />
      <Script src="/js/data-table.js" strategy="lazyOnload" />
      <Script src="/js/dataTables.bootstrap4.js" strategy="lazyOnload" />
      <Script src="/js/chart.js" strategy="lazyOnload" />
    </>
  );
}
