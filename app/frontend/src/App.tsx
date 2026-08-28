import { useEffect, useMemo, useState } from 'react'
import { getDashboardData } from './api/atlas'
import { IncidentList } from './components/IncidentList'
import { ServiceList } from './components/ServiceList'
import { StatusBadge } from './components/StatusBadge'
import type { Incident, Service, SystemStatus } from './types/api'
import './App.css'

type DashboardState = { incidents: Incident[]; services: Service[] }

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

  const activeIncidents = useMemo(
    () => dashboard.incidents.filter((incident) => incident.status !== 'resolved'),
    [dashboard.incidents],
  )
  const systemStatus = getSystemStatus(dashboard.services)

  return (
    <div className="app-shell">
      <header className="header">
        <div className="brand"><p className="eyebrow">Atlas</p><h1>Service status</h1><p className="subtitle">Live health and incident information</p></div>
        <StatusBadge status={systemStatus} label={systemStatus} prominent />
      </header>
      <main className="dashboard">
        <section className="overview" aria-label="Status overview">
          <article className="stat-card"><span className="stat-label">Services</span><strong>{dashboard.services.length}</strong></article>
          <article className="stat-card"><span className="stat-label">Active incidents</span><strong>{activeIncidents.length}</strong></article>
          <article className="stat-card"><span className="stat-label">Total incidents</span><strong>{dashboard.incidents.length}</strong></article>
        </section>
        {loading && <p className="message" role="status">Loading Atlas status…</p>}
        {error && <div className="message error" role="alert"><p>{error}</p><button type="button" onClick={() => void loadDashboard()}>Try again</button></div>}
        {!loading && !error && <div className="content-grid"><ServiceList services={dashboard.services} /><IncidentList incidents={dashboard.incidents.slice(0, 5)} services={dashboard.services} /></div>}
      </main>
    </div>
  )
}

export default App
