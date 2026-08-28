import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser, getDashboardData, logout } from './api/atlas'
import { IncidentList } from './components/IncidentList'
import { IncidentDetail } from './components/IncidentDetail'
import { ServiceDetail } from './components/ServiceDetail'
import { ServiceList } from './components/ServiceList'
import { LoginForm } from './components/LoginForm'
import { CreateIncidentForm } from './components/CreateIncidentForm'
import { StatusBadge } from './components/StatusBadge'
import type { AuthUser, Incident, Service, SystemStatus } from './types/api'
import './App.css'

type DashboardState = { incidents: Incident[]; services: Service[] }
type View = { kind: 'dashboard' } | { kind: 'login' } | { id: number; kind: 'incident' } | { id: number; kind: 'service' }

function getSystemStatus(services: Service[]): SystemStatus {
  if (services.some((service) => service.status === 'major_outage')) return 'major_outage'
  if (services.some((service) => service.status === 'partial_outage')) return 'partial_outage'
  if (services.some((service) => service.status === 'degraded')) return 'degraded'
  return 'operational'
}

function App() {
  const [dashboard, setDashboard] = useState<DashboardState>({ incidents: [], services: [] })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>({ kind: 'dashboard' })
  const [user, setUser] = useState<AuthUser | null>(null)

  async function loadDashboard() {
    setLoading(true)
    setError(null)
    try {
      setDashboard(await getDashboardData())
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to load the Atlas status page.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    void getDashboardData()
      .then((data) => {
        if (!cancelled) setDashboard(data)
      })
      .catch((caughtError: unknown) => {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load the Atlas status page.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  function loadCurrentUser() {
    void getCurrentUser().then(setUser).catch(() => setUser(null))
  }

  useEffect(() => {
    void getCurrentUser().then(setUser).catch(() => setUser(null))
  }, [])

  const activeIncidents = useMemo(
    () => dashboard.incidents.filter((incident) => incident.status !== 'resolved'),
    [dashboard.incidents],
  )
  const systemStatus = getSystemStatus(dashboard.services)

  return (
    <div className="app-shell">
      <header className="header">
        <div className="brand"><p className="eyebrow">Atlas</p><h1>Service status</h1><p className="subtitle">Live health and incident information</p></div>
        <div className="header-actions"><StatusBadge status={systemStatus} label={systemStatus} prominent />{user ? <button className="operator-button" type="button" onClick={() => { logout(); setUser(null); setView({ kind: 'dashboard' }) }}>Sign out · {user.email}</button> : <button className="operator-button" type="button" onClick={() => setView({ kind: 'login' })}>Operator login</button>}</div>
      </header>
      <main className="dashboard">
        {view.kind === 'service' && <ServiceDetail serviceId={view.id} isOperator={Boolean(user)} onBack={() => setView({ kind: 'dashboard' })} />}
        {view.kind === 'incident' && <IncidentDetail incidentId={view.id} isOperator={Boolean(user)} onBack={() => setView({ kind: 'dashboard' })} />}
        {view.kind === 'login' && <section className="detail-view"><button className="back-link" type="button" onClick={() => setView({ kind: 'dashboard' })}>← Back to dashboard</button><LoginForm onSuccess={() => { loadCurrentUser(); setView({ kind: 'dashboard' }) }} /></section>}
        {view.kind === 'dashboard' && <>
        <section className="overview" aria-label="Status overview">
          <article className="stat-card"><span className="stat-label">Services</span><strong>{dashboard.services.length}</strong></article>
          <article className="stat-card"><span className="stat-label">Active incidents</span><strong>{activeIncidents.length}</strong></article>
          <article className="stat-card"><span className="stat-label">Total incidents</span><strong>{dashboard.incidents.length}</strong></article>
        </section>
        {loading && <p className="message" role="status">Loading Atlas status…</p>}
        {error && <div className="message error" role="alert"><p>{error}</p><button type="button" onClick={() => void loadDashboard()}>Try again</button></div>}
        {!loading && !error && <>{user && <CreateIncidentForm services={dashboard.services} onCreated={() => void loadDashboard()} />}<div className="content-grid"><ServiceList services={dashboard.services} onSelect={(id) => setView({ id, kind: 'service' })} /><IncidentList incidents={dashboard.incidents.slice(0, 5)} services={dashboard.services} onSelect={(id) => setView({ id, kind: 'incident' })} /></div></>}
        </>}
      </main>
    </div>
  )
}

export default App
