function BrandHeader() {
  return (
    <header className="topbar">
      <a className="brand" href="/preformulario" style={{ textDecoration: 'none', color: 'inherit' }}>
        <img className="brand-mark" src="/favicon.svg" alt="" width="34" height="34" />
        <span>DDA <em>motors</em></span>
      </a>
      <div className="topbar-meta">
        <span className="status-dot" /> Atención personalizada
        <a className="topbar-nav-link" href="/monitor">Health Dashboard ↗</a>
      </div>
    </header>
  )
}

export default BrandHeader
