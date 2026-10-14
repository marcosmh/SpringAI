import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Activity, ArrowDown, ArrowRight, ArrowUp, Check, ChevronDown, ChevronLeft,
  ChevronRight, CircleHelp, Clock3, CloudSun, Database, MapPin, MessageCircle,
  Search, Send, Sparkles, Thermometer, Wind, X,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api';
const colors = { santiago: '#7664f5', madrid: '#5696e8', 'buenos-aires': '#32b998', 'ciudad-de-mexico': '#f0a64d' };
const number = (value, digits = 0) => new Intl.NumberFormat('es-MX', { maximumFractionDigits: digits }).format(value ?? 0);
const dateTime = (value) => new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [history, setHistory] = useState({ data: [], pagination: { page: 1, pages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cityId, setCityId] = useState('santiago');
  const [question, setQuestion] = useState('¿Qué temperatura hay y qué ropa debería usar hoy?');
  const [answer, setAnswer] = useState(null);
  const [asking, setAsking] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState('');
  const [historyCity, setHistoryCity] = useState('');
  const [notice, setNotice] = useState('');

  async function loadDashboard() {
    try {
      setError('');
      const response = await fetch(`${API}/weather/dashboard`, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('No se pudo leer la información de Spring AI Weather.');
      const data = await response.json(); setDashboard(data);
      if (data.cities?.length && !data.cities.some((city) => city.id === cityId)) setCityId(data.cities[0].id);
    } catch (e) { setError(`${e.message} Ejecuta npm run db:setup y npm run dev desde la raíz del monorepo.`); }
    finally { setLoading(false); }
  }
  async function loadHistory() {
    try {
      const params = new URLSearchParams({ page: String(historyPage), limit: '8' });
      if (historySearch.trim()) params.set('q', historySearch.trim());
      if (historyCity) params.set('cityId', historyCity);
      const response = await fetch(`${API}/weather/queries?${params}`, { signal: AbortSignal.timeout(8000) });
      if (response.ok) setHistory(await response.json());
    } catch { /* Dashboard stays usable when history is unavailable. */ }
  }
  useEffect(() => { loadDashboard(); }, []);
  useEffect(() => { loadHistory(); }, [historyPage, historySearch, historyCity]);

  const cities = dashboard?.cities || [];
  const summary = dashboard?.summary;
  const currentCity = cities.find((city) => city.id === cityId) || cities[0];
  const chartData = useMemo(() => [...cities].sort((a, b) => a.temperatureC - b.temperatureC), [cities]);
  const cityPrompt = (city) => `¿Qué temperatura hay en ${city.name} y qué ropa debería usar hoy?`;

  async function askWeather(event) {
    event.preventDefault(); if (!currentCity || !question.trim()) return;
    setAsking(true); setAnswer(null);
    try {
      const response = await fetch(`${API}/weather/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cityId: currentCity.id, question }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo enviar la consulta.');
      setAnswer(data); setHistoryPage(1); await Promise.all([loadDashboard(), loadHistory()]);
    } catch (e) { setNotice(e.message); setTimeout(() => setNotice(''), 4500); }
    finally { setAsking(false); }
  }

  return <div className="weather-app">
    <aside className="weather-sidebar">
      <a href="#inicio" className="weather-brand"><span className="brand-mark"><CloudSun size={19} /></span><span>weather<span className="brand-accent">.mcp</span></span></a>
      <div className="project-card"><span className="project-icon"><Activity size={17} /></span><div><b>Spring AI Weather</b><small>Panel de herramientas MCP</small></div><ChevronDown size={15} /></div>
      <div className="side-label">MONITOREO</div>
      <nav className="weather-nav"><a className="nav-current" href="#resumen"><Activity size={17} />Resumen</a><a href="#ciudades"><MapPin size={17} />Ciudades<span>{cities.length || '—'}</span></a><a href="#consultas"><MessageCircle size={17} />Consultas<span>{summary?.queries ?? 0}</span></a></nav>
      <div className="sidebar-spacer" />
      <div className="mcp-status"><div className="status-head"><span className="status-indicator" /><b>Catálogo MCP local</b></div><p>Datos publicados por <code>WeatherTools</code></p><div className="status-foot"><Database size={13} /> Prisma + SQLite</div></div>
      <div className="side-profile"><span className="profile-monogram">M</span><div><b>Weather workspace</b><small>Desarrollo local</small></div><CircleHelp size={16} /></div>
    </aside>

    <main className="weather-main" id="inicio">
      <header className="weather-topbar"><div className="top-crumb">MCP Workspace <span>/</span> <b>Weather analytics</b></div><div className="top-right"><span className="source-pill"><i />Fuente: Spring AI Weather MCP</span><span className="top-separator" /><span className="top-date">{new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</span></div></header>
      <div className="weather-content">
        <section className="weather-heading" id="resumen"><div><div className="weather-eyebrow"><span /> WEATHER INTELLIGENCE</div><h1>Clima de un vistazo</h1><p>Temperaturas y recomendaciones disponibles en tus herramientas Spring AI MCP.</p></div><button className="ask-button" onClick={() => { setAnswer(null); setQuestion(currentCity ? cityPrompt(currentCity) : question); document.getElementById('ask-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}><Sparkles size={16} />Preguntar al asistente <ArrowRight size={15} /></button></section>

        {error && <div className="weather-error"><b>No se pudo cargar el backend</b><span>{error}</span><button onClick={loadDashboard}>Reintentar</button></div>}

        <section className="weather-stats">
          <StatCard label="Ciudades monitoreadas" value={loading ? '—' : number(summary?.cities)} detail="Localidades disponibles en WeatherTools" icon={<MapPin size={17} />} accent="violet" />
          <StatCard label="Temperatura promedio" value={loading ? '—' : `${number(summary?.averageC, 1)}°`} detail="Promedio entre las ciudades del catálogo" icon={<Thermometer size={17} />} accent="blue" />
          <StatCard label="Más cálida" value={loading ? '—' : `${summary?.warmest?.name || '—'} · ${number(summary?.warmest?.temperatureC)}°`} detail={summary?.warmest?.country || 'Máxima temperatura reportada'} icon={<ArrowUp size={17} />} accent="orange" compact />
          <StatCard label="Más fresca" value={loading ? '—' : `${summary?.coldest?.name || '—'} · ${number(summary?.coldest?.temperatureC)}°`} detail={summary ? `Rango térmico: ${number(summary.temperatureRangeC)}° entre extremos` : 'Mínima temperatura reportada'} icon={<ArrowDown size={17} />} accent="mint" compact />
        </section>

        <section className="weather-grid">
          <article className="weather-panel comparison-panel"><div className="panel-heading"><div><div className="panel-heading-line"><h2>Comparativa de temperatura</h2><span className="chart-tag">°C</span></div><p>Comparación de las temperaturas actuales por ciudad</p></div><span className="panel-icon"><Activity size={16} /></span></div>
            <div className="temperature-chart">{loading ? <div className="weather-loading">Cargando ciudades…</div> : <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 23, left: 6, bottom: 0 }}><CartesianGrid horizontal={false} stroke="#eef0f5" /><XAxis type="number" domain={[0, 'dataMax + 8']} tickFormatter={(v) => `${v}°`} tickLine={false} axisLine={false} tick={{ fill: '#959aac', fontSize: 10 }} /><YAxis type="category" dataKey="name" width={112} tickLine={false} axisLine={false} tick={{ fill: '#666b7c', fontSize: 11, fontWeight: 600 }} /><Tooltip content={<TemperatureTooltip />} cursor={{ fill: '#f8f7fc' }} /><ReferenceLine x={summary?.averageC || 0} stroke="#b8b2ed" strokeDasharray="4 4" label={{ value: 'Promedio', fill: '#8981c1', fontSize: 9, position: 'insideTop' }} /><Bar dataKey="temperatureC" name="Temperatura" radius={[0, 6, 6, 0]} barSize={23} label={{ position: 'right', formatter: (value) => `${value}°`, fill: '#565a6d', fontSize: 10, fontWeight: 700 }}>{chartData.map((city) => <Cell key={city.id} fill={colors[city.id] || '#7664f5'} />)}</Bar></BarChart></ResponsiveContainer>}</div>
            <div className="chart-legend"><span><i className="legend-average" />Promedio del catálogo: <b>{loading ? '—' : `${number(summary?.averageC, 1)} °C`}</b></span><span>Fuente: <b>WeatherTools</b></span></div>
          </article>
          <article className="weather-panel assistant-panel" id="ask-panel"><div className="assistant-top"><span className="assistant-emblem"><Sparkles size={17} /></span><div><div className="assistant-overline">SPRING AI · MCP</div><h2>Consulta al asistente</h2></div><span className="assistant-live"><i />LISTO</span></div><p className="assistant-description">Pregunta por la temperatura o pide una recomendación de ropa. La consulta se envía al cliente Spring AI.</p>
            <form className="ask-form" onSubmit={askWeather}><label>Ciudad<select value={cityId} onChange={(e) => { setCityId(e.target.value); const city = cities.find((item) => item.id === e.target.value); if (city) setQuestion(cityPrompt(city)); }}>{cities.map((city) => <option key={city.id} value={city.id}>{city.name}, {city.country}</option>)}</select><ChevronDown size={14} /></label><label>Tu pregunta<textarea value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={500} rows={2} /></label><div className="ask-bottom"><span>{question.length}/500 · respuesta en español</span><button type="submit" disabled={asking || !currentCity}><Send size={14} />{asking ? 'Consultando…' : 'Consultar'}</button></div></form>
            {answer && <div className={`answer-box ${answer.warning ? 'answer-warning' : ''}`}><div className="answer-label"><span>{answer.success ? <Check size={13} /> : <Database size={13} />}</span>{answer.success ? 'Respuesta del asistente' : 'Referencia local guardada'}<small>{number(answer.temperatureC)} °C</small></div><p>{answer.answer}</p>{answer.warning && <small className="answer-caveat">{answer.warning}</small>}</div>}
            <div className="assistant-foot"><Clock3 size={13} />Las consultas y respuestas quedan guardadas en SQLite.</div>
          </article>
        </section>

        <section className="weather-panel cities-panel" id="ciudades"><div className="section-heading"><div><div className="panel-heading-line"><h2>Ciudades del catálogo</h2><span className="soft-count">{cities.length} ubicaciones</span></div><p>Temperatura y recomendación recuperadas de las herramientas MCP</p></div><span className="data-source"><Database size={14} />datos persistidos</span></div>
          <div className="city-cards">{cities.map((city) => <button key={city.id} className={`city-card ${city.id === cityId ? 'city-selected' : ''}`} onClick={() => { setCityId(city.id); setQuestion(cityPrompt(city)); }}><div className="city-card-top"><span className="city-pin" style={{ color: colors[city.id] }}><MapPin size={15} /></span><span className="city-temp">{number(city.temperatureC)}<small>°C</small></span></div><b>{city.name}</b><span className="city-country">{city.country}</span><div className="city-difference"><span className={city.deviationC >= 0 ? 'deviation-up' : 'deviation-down'}>{city.deviationC >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}{number(Math.abs(city.deviationC), 1)}°</span><span>vs. promedio</span></div><p>{city.recommendation}</p></button>)}</div>
        </section>

        <section className="weather-panel details-panel"><div className="section-heading"><div><h2>Detalle por ciudad</h2><p>Valores comparados contra el promedio de las localidades disponibles</p></div><span className="table-note"><Wind size={14} />Sin datos de viento o humedad en la herramienta actual</span></div><div className="weather-table-wrap"><table className="weather-table"><thead><tr><th>CIUDAD</th><th>PAÍS</th><th>TEMPERATURA</th><th>VS. PROMEDIO</th><th>RECOMENDACIÓN DE VESTIMENTA</th><th /></tr></thead><tbody>{cities.map((city) => <tr key={city.id}><td><div className="table-city"><span className="table-city-mark" style={{ background: colors[city.id] }} /><b>{city.name}</b></div></td><td>{city.country}</td><td><b className="table-temperature">{number(city.temperatureC)} °C</b></td><td><span className={`table-deviation ${city.deviationC >= 0 ? 'deviation-up' : 'deviation-down'}`}>{city.deviationC >= 0 ? '+' : ''}{number(city.deviationC, 1)} °C</span></td><td className="recommendation-cell">{city.recommendation}</td><td><button className="table-ask" onClick={() => { setCityId(city.id); setQuestion(cityPrompt(city)); document.getElementById('ask-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>Consultar <ArrowRight size={13} /></button></td></tr>)}</tbody></table></div></section>

        <section className="weather-panel history-panel" id="consultas"><div className="section-heading history-heading"><div><div className="panel-heading-line"><h2>Historial de consultas</h2><span className="soft-count">{history.pagination.total} registros</span></div><p>Preguntas, respuestas y estado de conexión con el asistente</p></div><div className="history-filters"><label className="history-search"><Search size={14} /><input value={historySearch} onChange={(e) => { setHistorySearch(e.target.value); setHistoryPage(1); }} placeholder="Filtrar pregunta" /></label><label className="history-city-filter"><select value={historyCity} onChange={(e) => { setHistoryCity(e.target.value); setHistoryPage(1); }}><option value="">Todas las ciudades</option>{cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select><ChevronDown size={13} /></label></div></div>
          <div className="weather-table-wrap"><table className="weather-table history-table"><thead><tr><th>CIUDAD</th><th>PREGUNTA</th><th>TEMPERATURA</th><th>RESULTADO</th><th>RESPUESTA</th><th>FECHA</th></tr></thead><tbody>{history.data.map((item) => <tr key={item.id}><td><b>{item.city.name}</b></td><td className="history-question">{item.question}</td><td><b className="table-temperature">{number(item.temperatureC)} °C</b></td><td><span className={`query-status ${item.success ? 'query-ok' : 'query-fallback'}`}><i />{item.success ? 'Spring AI' : 'Dato local'}</span></td><td className="history-answer" title={item.answer}>{item.answer}</td><td className="history-date">{dateTime(item.askedAt)}</td></tr>)}{!history.data.length && <tr><td colSpan="6" className="history-empty"><span className="empty-icon"><MessageCircle size={17} /></span><b>Aún no hay consultas guardadas</b><span>Pregunta al asistente para crear el primer registro.</span></td></tr>}</tbody></table></div>
          <div className="history-footer"><span>Mostrando {history.data.length ? (historyPage - 1) * 8 + 1 : 0}–{Math.min(historyPage * 8, history.pagination.total)} de {history.pagination.total}</span><div><button disabled={historyPage <= 1} onClick={() => setHistoryPage((page) => page - 1)} aria-label="Página anterior"><ChevronLeft size={15} /></button><span>Página <b>{historyPage}</b> de <b>{Math.max(history.pagination.pages, 1)}</b></span><button disabled={historyPage >= history.pagination.pages} onClick={() => setHistoryPage((page) => page + 1)} aria-label="Página siguiente"><ChevronRight size={15} /></button></div></div>
        </section>
        <footer className="weather-footer"><span>Spring AI Weather MCP · Dashboard local</span><span><i /> API Express conectada a SQLite mediante Prisma</span></footer>
      </div>
    </main>
    {notice && <div className="weather-toast">{notice}</div>}
  </div>;
}

function StatCard({ label, value, detail, icon, accent, compact }) {
  return <article className={`weather-stat stat-${accent}`}><div className="stat-heading"><span>{label}</span><i>{icon}</i></div><b className={`stat-value ${compact ? 'stat-compact' : ''}`}>{value}</b><span className="stat-detail">{detail}</span></article>;
}

function TemperatureTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const city = payload[0].payload;
  return <div className="temperature-tooltip"><b>{city.name}, {city.country}</b><span>{number(city.temperatureC)} °C</span><small>{city.deviationC >= 0 ? '+' : ''}{number(city.deviationC, 1)} °C respecto al promedio</small></div>;
}

export default App;
