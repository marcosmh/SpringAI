import React, { useEffect, useMemo, useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Activity, ArrowDownRight, ArrowDownUp, ArrowRight, ArrowUpRight, Bell,
  CalendarDays, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Download,
  Filter, LayoutDashboard, LifeBuoy, MoreHorizontal, Plus, Search, Settings2,
  ShoppingBag, Sparkles, Target, TrendingUp, Users, Wallet, X,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api';
const colors = ['#705cf5', '#36b99a', '#f2a74b', '#5896e9', '#e78398'];
const money = (value, compact = false) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: compact ? 1 : 0, notation: compact ? 'compact' : 'standard' }).format(value || 0);
const exactMoney = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(value || 0);
const dateLabel = (value) => new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short' }).format(new Date(`${value}T12:00:00`)).replace('.', '');
const fullDate = (value) => new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
const initials = (name) => name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const categoryIcon = { Tecnología: '⌘', Hogar: '⌂', Moda: '◈', Deportes: '↗', Otros: '✳' };

function App() {
  const [period, setPeriod] = useState('30d');
  const [dashboard, setDashboard] = useState(null);
  const [sales, setSales] = useState({ data: [], pagination: { page: 1, pages: 1, total: 0 } });
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [activeNav, setActiveNav] = useState('Resumen');

  async function loadDashboard(selected = period) {
    try { setError(''); const response = await fetch(`${API}/dashboard?period=${selected}`); if (!response.ok) throw new Error('No se pudo conectar con el servidor.'); setDashboard(await response.json()); }
    catch (e) { setError(`${e.message} Ejecuta npm run db:setup y npm run dev en la raíz del monorepo.`); }
    finally { setLoading(false); }
  }
  async function loadSales() {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '8' });
      if (query.trim()) params.set('q', query.trim()); if (category) params.set('category', category); if (status) params.set('status', status);
      const response = await fetch(`${API}/sales?${params}`); if (!response.ok) throw new Error('Error al consultar las ventas.');
      setSales(await response.json());
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { setLoading(true); loadDashboard(period); }, [period]);
  useEffect(() => { loadSales(); }, [page, query, category, status]);

  const summary = dashboard?.summary;
  const categoryTotal = useMemo(() => dashboard?.categories.reduce((sum, item) => sum + item.revenue, 0) || 0, [dashboard]);
  const periodText = period === '30d' ? 'vs. periodo anterior' : period === '90d' ? 'vs. 90 días anteriores' : 'vs. 12 meses anteriores';
  const showToast = (message) => { setToast(message); setTimeout(() => setToast(''), 3200); };

  function exportCsv() {
    const rows = [['Fecha', 'Cliente', 'Producto', 'Categoría', 'Canal', 'Importe', 'Estado'], ...sales.data.map((s) => [fullDate(s.date), s.customer, s.product, s.category, s.channel, s.amount, s.status])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })); link.download = 'nexo-ventas.csv'; link.click(); URL.revokeObjectURL(link.href);
    showToast('Archivo CSV descargado');
  }

  async function createSale(event) {
    event.preventDefault(); setSaving(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const data = Object.fromEntries(form.entries()); data.amount = Number(data.amount);
    try {
      const response = await fetch(`${API}/sales`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!response.ok) { const body = await response.json(); throw new Error(body.error || 'No se pudo guardar.'); }
      setModal(false); formElement.reset(); showToast('Venta guardada en la base de datos'); loadDashboard(); loadSales();
    } catch (e) { showToast(e.message); }
    finally { setSaving(false); }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#inicio"><span className="brand-symbol"><span /></span><span className="brand-name">nexo<span>.</span></span></a>
      <div className="workspace-switch"><div className="workspace-icon">A</div><div className="workspace-copy"><b>Acme Studio</b><span>Plan profesional</span></div><ChevronDown size={15} /></div>
      <div className="nav-label">ESPACIO DE TRABAJO</div>
      <nav className="main-nav">
        <button className={activeNav === 'Resumen' ? 'nav-item selected' : 'nav-item'} onClick={() => setActiveNav('Resumen')}><LayoutDashboard size={18} />Resumen</button>
        <button className={activeNav === 'Ventas' ? 'nav-item selected' : 'nav-item'} onClick={() => { setActiveNav('Ventas'); document.getElementById('ventas')?.scrollIntoView({ behavior: 'smooth' }); }}><ShoppingBag size={18} />Ventas<span className="nav-count">{sales.pagination.total || '—'}</span></button>
        <button className="nav-item" onClick={() => showToast('El análisis de clientes estará disponible próximamente')}><Users size={18} />Clientes</button>
        <button className="nav-item" onClick={() => showToast('El análisis de metas estará disponible próximamente')}><Target size={18} />Metas<span className="nav-dot" /></button>
      </nav>
      <div className="nav-label insights-label">ANÁLISIS</div>
      <nav className="main-nav">
        <button className="nav-item" onClick={() => showToast('La sección de informes estará disponible próximamente')}><Activity size={18} />Informes</button>
        <button className="nav-item" onClick={() => showToast('La sección de productos estará disponible próximamente')}><Wallet size={18} />Productos</button>
      </nav>
      <div className="sidebar-spacer" />
      <div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={16} /></div><b>Haz crecer tu negocio</b><p>Descubre todo lo que puedes lograr con Nexo Pro.</p><button onClick={() => showToast('Ya estás usando el plan profesional')}>Explorar plan <ArrowRight size={14} /></button></div>
      <div className="sidebar-bottom"><button className="nav-item" onClick={() => showToast('Centro de ayuda próximamente')}><CircleHelp size={18} />Centro de ayuda</button><button className="nav-item" onClick={() => showToast('Configuración próximamente')}><Settings2 size={18} />Configuración</button>
        <div className="profile"><div className="avatar user-avatar">LM</div><div className="profile-copy"><b>Laura Méndez</b><span>Administradora</span></div><MoreHorizontal size={19} /></div>
      </div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="breadcrumbs"><span>Espacio de trabajo</span><span className="crumb-slash">/</span><b>Resumen</b></div><div className="top-actions"><div className="live-status"><span />Datos actualizados</div><button className="icon-button" aria-label="Notificaciones" onClick={() => showToast('No tienes notificaciones nuevas')}><Bell size={18} /><i /></button><div className="top-divider" /><div className="avatar top-avatar">LM</div></div></header>
      <section className="page-wrap">
        <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" />CENTRO DE CONTROL</div><h1>Buenos días, Laura <span className="wave">✳</span></h1><p>Aquí tienes lo que está pasando con tu negocio.</p></div><div className="heading-actions"><button className="button button-secondary" onClick={exportCsv}><Download size={16} />Exportar</button><button className="button button-primary" onClick={() => setModal(true)}><Plus size={16} />Nueva venta</button></div></div>

        {error && <div className="error-banner"><div><b>No se pudo cargar la información</b><span>{error}</span></div><button onClick={() => { loadDashboard(); loadSales(); }}>Reintentar</button></div>}
        <div className="period-row"><div className="period-tabs" role="tablist"><button className={period === '30d' ? 'active' : ''} onClick={() => setPeriod('30d')}>30 días</button><button className={period === '90d' ? 'active' : ''} onClick={() => setPeriod('90d')}>90 días</button><button className={period === '12m' ? 'active' : ''} onClick={() => setPeriod('12m')}>12 meses</button></div><div className="date-caption"><CalendarDays size={15} /><span>{period === '30d' ? 'Últimos 30 días' : period === '90d' ? 'Últimos 90 días' : 'Últimos 12 meses'}</span><ChevronDown size={14} /></div></div>

        <section className="metric-grid">
          <Metric title="Ingresos totales" value={summary ? money(summary.revenue, true) : '—'} change={summary?.revenueChange} caption={periodText} icon={<Wallet size={17} />} loading={loading} featured />
          <Metric title="Ventas realizadas" value={summary ? summary.orders.toLocaleString('es-MX') : '—'} change={summary?.ordersChange} caption={periodText} icon={<ShoppingBag size={17} />} loading={loading} />
          <Metric title="Ticket promedio" value={summary ? money(summary.averageOrder, true) : '—'} change={summary?.averageChange} caption={periodText} icon={<TrendingUp size={17} />} loading={loading} />
          <div className="metric-card conversion-card"><div className="metric-head"><span>Tasa de conversión</span><span className="metric-icon"><Target size={17} /></span></div><div className="metric-value">{summary ? `${summary.conversion.toFixed(2)}%` : '—'}</div><div className="metric-footer"><span className="conversion-note"><span className="conversion-dot" />Tráfico saludable</span><button className="tiny-info" title="Porcentaje de sesiones que terminan en compra">i</button></div><div className="conversion-track"><span /></div></div>
        </section>

        <section className="charts-grid">
          <article className="panel revenue-panel"><div className="panel-head"><div><div className="panel-title-line"><h2>Ingresos en el tiempo</h2><span className="live-pill"><span /> EN VIVO</span></div><p>Rendimiento de ventas a lo largo del periodo</p></div><button className="icon-button panel-menu" onClick={() => showToast('El gráfico muestra ventas no canceladas')} aria-label="Más información"><MoreHorizontal size={20} /></button></div>
            <div className="chart-legend"><span><i className="legend-dot purple-dot" />Este periodo</span><span><i className="legend-line" />Periodo anterior</span></div>
            <div className="revenue-chart">{loading ? <div className="chart-loading">Cargando datos…</div> : <ResponsiveContainer width="100%" height="100%"><AreaChart data={dashboard?.series || []} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}><defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7664f5" stopOpacity={0.18} /><stop offset="98%" stopColor="#7664f5" stopOpacity={0.005} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#eef0f5" strokeDasharray="3 5" /><XAxis dataKey="date" tickFormatter={dateLabel} tickLine={false} axisLine={false} tick={{ fill: '#9aa0b0', fontSize: 11 }} minTickGap={28} /><YAxis tickFormatter={(v) => money(v, true)} tickLine={false} axisLine={false} tick={{ fill: '#9aa0b0', fontSize: 11 }} width={64} /><Tooltip content={<RevenueTooltip />} /><Area type="monotone" dataKey="previousRevenue" name="Periodo anterior" stroke="#b9bdca" strokeWidth={1.5} strokeDasharray="4 4" fill="transparent" dot={false} activeDot={false} /><Area type="monotone" dataKey="revenue" name="Ingresos" stroke="#7562f4" strokeWidth={2.5} fill="url(#revenueFill)" activeDot={{ r: 5, fill: '#fff', stroke: '#7562f4', strokeWidth: 2.5 }} /></AreaChart></ResponsiveContainer>}</div>
            <div className="chart-footnote"><span><i className="footnote-dot" />Se excluyen ventas canceladas</span><span>Importes en MXN</span></div>
          </article>
          <article className="panel category-panel"><div className="panel-head"><div><h2>Ventas por categoría</h2><p>Distribución de ingresos</p></div><button className="link-button" onClick={() => { document.getElementById('ventas')?.scrollIntoView({ behavior: 'smooth' }); setCategory(''); }}>Ver todas <ArrowRight size={14} /></button></div>
            <div className="category-chart-wrap">{loading ? <div className="chart-loading">Cargando datos…</div> : <><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={dashboard?.categories || []} dataKey="revenue" nameKey="name" innerRadius={57} outerRadius={77} paddingAngle={3} stroke="none" cornerRadius={4}>{dashboard?.categories.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip formatter={(v) => exactMoney(v)} /></PieChart></ResponsiveContainer><div className="donut-label"><b>{money(categoryTotal, true)}</b><span>Ingresos</span></div></div><div className="category-legend">{dashboard?.categories.map((item, i) => <div className="category-legend-row" key={item.name}><span className="category-name"><i style={{ background: colors[i % colors.length] }} />{item.name}</span><b>{categoryTotal ? Math.round(item.revenue / categoryTotal * 100) : 0}%</b></div>)}</div></>}</div>
            <div className="category-bottom"><span>Más ingresos</span><b>{dashboard?.categories[0]?.name || '—'}</b><span className="category-bottom-icon">↗</span></div>
          </article>
        </section>

        <section className="lower-grid"><article className="panel channels-panel"><div className="panel-head"><div><h2>Rendimiento por canal</h2><p>Ingresos y volumen de pedidos</p></div><button className="icon-button panel-menu" onClick={() => showToast('Ventas agregadas por canal de origen')} aria-label="Más información"><MoreHorizontal size={20} /></button></div>
            <div className="channels-chart">{loading ? <div className="chart-loading">Cargando datos…</div> : <ResponsiveContainer width="100%" height="100%"><BarChart data={dashboard?.channels || []} barSize={34} margin={{ top: 8, right: 0, left: -14, bottom: 0 }}><CartesianGrid vertical={false} stroke="#eef0f5" strokeDasharray="3 5" /><XAxis dataKey="channel" tickLine={false} axisLine={false} tick={{ fill: '#7e8495', fontSize: 12, fontWeight: 600 }} /><YAxis tickFormatter={(v) => money(v, true)} tickLine={false} axisLine={false} tick={{ fill: '#9aa0b0', fontSize: 10 }} width={62} /><Tooltip formatter={(v) => exactMoney(v)} /><Bar dataKey="revenue" name="Ingresos" radius={[6, 6, 0, 0]}>{dashboard?.channels.map((item, i) => <Cell key={item.channel} fill={i === 0 ? '#7664f5' : i === 1 ? '#a398f8' : '#d4cef9'} />)}</Bar></BarChart></ResponsiveContainer>}</div>
            <div className="channel-stats">{dashboard?.channels.map((item, i) => <div key={item.channel}><i style={{ background: i === 0 ? '#7664f5' : i === 1 ? '#a398f8' : '#d4cef9' }} /><span>{item.channel}</span><b>{item.orders} pedidos</b></div>)}</div>
          </article>
          <article className="panel insights-panel"><div className="panel-head"><div><div className="insight-kicker"><Sparkles size={13} />NEXO INSIGHTS</div><h2>Tu negocio, en perspectiva</h2></div><span className="insight-sparkle">✦</span></div><p className="insights-copy">{summary?.revenueChange >= 0 ? 'Tu facturación mantiene un ritmo positivo.' : 'La facturación bajó en este periodo.'} Has registrado <b>{summary?.orders ?? '—'} ventas</b> y el ticket promedio es de <b>{summary ? money(summary.averageOrder) : '—'}</b>.</p><div className="insight-callout"><span className="insight-callout-icon"><TrendingUp size={16} /></span><div><b>Tu categoría estrella</b><span>{dashboard?.categories[0]?.name || '—'} aporta <strong>{categoryTotal ? Math.round((dashboard?.categories[0]?.revenue || 0) / categoryTotal * 100) : 0}%</strong> de los ingresos del periodo.</span></div></div><button className="insight-link" onClick={() => showToast('Informe detallado próximamente')}>Ver análisis completo <ArrowRight size={14} /></button></article>
        </section>

        <section className="panel sales-panel" id="ventas"><div className="sales-heading"><div><div className="table-title-line"><h2>Ventas recientes</h2><span className="result-count">{sales.pagination.total.toLocaleString('es-MX')} registros</span></div><p>Consulta y administra tus transacciones</p></div><div className="sales-controls"><label className="search-box"><Search size={15} /><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Buscar venta..." /></label><label className="select-wrap"><Filter size={14} /><select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}><option value="">Categoría</option>{['Tecnología', 'Hogar', 'Moda', 'Deportes', 'Otros'].map((c) => <option key={c}>{c}</option>)}</select><ChevronDown size={13} /></label><label className="select-wrap status-select"><select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">Estado</option><option>Completada</option><option>Pendiente</option><option>Cancelada</option></select><ChevronDown size={13} /></label></div></div>
          <div className="table-scroll"><table><thead><tr><th>CLIENTE</th><th>PRODUCTO</th><th>CATEGORÍA</th><th>FECHA</th><th>CANAL</th><th>IMPORTE</th><th>ESTADO</th><th /></tr></thead><tbody>{sales.data.map((sale, i) => <tr key={sale.id}><td><div className="customer-cell"><span className={`avatar customer-avatar avatar-${i % 5}`}>{initials(sale.customer)}</span><span>{sale.customer}</span></div></td><td className="product-cell">{sale.product}</td><td><span className="category-chip"><i style={{ color: colors[['Tecnología', 'Hogar', 'Moda', 'Deportes', 'Otros'].indexOf(sale.category) % colors.length] }}>{categoryIcon[sale.category] || '◈'}</i>{sale.category}</span></td><td className="date-cell">{fullDate(sale.date)}</td><td><span className="channel-chip">{sale.channel === 'Web' ? <span className="web-channel">⌘</span> : sale.channel === 'Tienda' ? <span className="store-channel">⌂</span> : <span className="market-channel">◈</span>}{sale.channel}</span></td><td className="amount-cell">{exactMoney(sale.amount)}</td><td><StatusBadge status={sale.status} /></td><td><button className="row-more" aria-label="Opciones" onClick={() => showToast(`Venta #${sale.id} · ${sale.customer}`)}><MoreHorizontal size={17} /></button></td></tr>)}{!sales.data.length && <tr><td colSpan="8" className="empty-row">No hay ventas que coincidan con tu búsqueda.</td></tr>}</tbody></table></div>
          <div className="table-footer"><span>Mostrando <b>{sales.data.length ? (page - 1) * 8 + 1 : 0}–{Math.min(page * 8, sales.pagination.total)}</b> de <b>{sales.pagination.total}</b> ventas</span><div className="pagination"><button aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft size={15} /></button><span>Página <b>{page}</b> de <b>{Math.max(sales.pagination.pages, 1)}</b></span><button aria-label="Página siguiente" disabled={page >= sales.pagination.pages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={15} /></button></div></div>
        </section>
        <footer className="page-footer"><span>© 2026 Nexo Analytics</span><span><span className="footer-dot" /> Todos los sistemas operativos</span></footer>
      </section>
    </main>

    {modal && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(false); }}><form className="sale-modal" onSubmit={createSale}><div className="modal-head"><div><div className="eyebrow"><span className="eyebrow-line" />NUEVO REGISTRO</div><h2>Agregar venta</h2><p>La venta quedará guardada en SQLite.</p></div><button type="button" className="icon-button" onClick={() => setModal(false)}><X size={19} /></button></div><label>Nombre del cliente<input name="customer" required placeholder="Ej. Ana García" /></label><label>Producto<input name="product" required placeholder="Ej. Auriculares Pro" /></label><div className="form-row"><label>Categoría<select name="category" required defaultValue=""><option value="" disabled>Selecciona</option>{['Tecnología', 'Hogar', 'Moda', 'Deportes', 'Otros'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Canal<select name="channel" required defaultValue="Web"><option>Web</option><option>Tienda</option><option>Marketplace</option></select></label></div><div className="form-row"><label>Importe (MXN)<input name="amount" type="number" min="1" step="0.01" required placeholder="0.00" /></label><label>Estado<select name="status" defaultValue="Completada"><option>Completada</option><option>Pendiente</option><option>Cancelada</option></select></label></div><label>Fecha<input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setModal(false)}>Cancelar</button><button className="button button-primary" disabled={saving}>{saving ? 'Guardando…' : <><Plus size={16} />Guardar venta</>}</button></div></form></div>}
    {toast && <div className="toast"><span className="toast-check">✓</span>{toast}</div>}
  </div>;
}

function Metric({ title, value, change, caption, icon, loading, featured }) {
  const positive = Number(change) >= 0;
  return <div className={`metric-card ${featured ? 'featured-metric' : ''}`}><div className="metric-head"><span>{title}</span><span className="metric-icon">{icon}</span></div><div className="metric-value">{loading ? <span className="skeleton" /> : value}</div><div className="metric-footer">{loading ? <span className="skeleton small" /> : <span className={`change-pill ${positive ? 'positive' : 'negative'}`}>{positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{Math.abs(change || 0).toFixed(1)}%</span>}<span className="metric-caption">{caption}</span></div><div className={`metric-decoration ${featured ? 'decoration-bright' : ''}`}><span /><span /><span /></div></div>;
}
function StatusBadge({ status }) { return <span className={`status-badge ${status === 'Completada' ? 'status-complete' : status === 'Pendiente' ? 'status-pending' : 'status-cancelled'}`}><i />{status}</span>; }
function RevenueTooltip({ active, payload, label }) { if (!active || !payload?.length) return null; const current = payload.find((entry) => entry.dataKey === 'revenue'); const previous = payload.find((entry) => entry.dataKey === 'previousRevenue'); return <div className="chart-tooltip"><span>{label ? new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long' }).format(new Date(`${label}T12:00:00`)) : ''}</span>{current && <><b>{exactMoney(current.value)}</b><small>Este periodo</small></>}{previous && <small>Periodo anterior: {exactMoney(previous.value)}</small>}</div>; }

export default App;
