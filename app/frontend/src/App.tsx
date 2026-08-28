import { useEffect, useState } from 'react'
import './App.css'

type Service = {
  id: number
  name: string
  description: string | null
  url: string | null
  status: string
}

type Incident = {
  id: number
  service_id: number
  created_by: number
  title: string
  description: string
  severity: string
  status: string
  created_at: string
  updated_at: string
}

function App() {
  const [services, setServices] = useState<Service[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [servicesResponse, incidentsResponse] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/incidents'),
        ])

        if (!servicesResponse.ok || !incidentsResponse.ok) {
          throw new Error('Failed to load dashboard data')
        }

        const servicesData = await servicesResponse.json()
        const incidentsData = await incidentsResponse.json()

        setServices(servicesData)
        setIncidents(incidentsData)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Something went wrong',
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Atlas</h1>
          <p>Service status & incident management</p>
        </div>

        <div className="system-status">
          <span className="status-dot" />
          Operational
        </div>
      </header>

      <main className="dashboard">
        <section className="overview">
          <div className="stat-card">
            <span className="stat-label">Services</span>
            <strong>{services.length}</strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">Active Incidents</span>
            <strong>
              {incidents.filter(
                (incident) => incident.status !== 'resolved',
              ).length}
            </strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">Incidents</span>
            <strong>{incidents.length}</strong>
          </div>
        </section>

        {loading && <p className="message">Loading Atlas...</p>}

        {error && <p className="message error">{error}</p>}

        {!loading && !error && (
          <>
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Services</h2>
                  <p>Current status of Atlas services</p>
                </div>
              </div>

              {services.length === 0 ? (
                <p className="empty">No services found.</p>
              ) : (
                <div className="service-list">
                  {services.map((service) => (
                    <div className="service-row" key={service.id}>
                      <div>
                        <h3>{service.name}</h3>
                        {service.description && (
                          <p>{service.description}</p>
                        )}
                      </div>

                      <div className="service-status">
                        <span className="status-dot" />
                        {service.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Recent Incidents</h2>
                  <p>Latest incidents reported across services</p>
                </div>
              </div>

              {incidents.length === 0 ? (
                <p className="empty">No incidents found.</p>
              ) : (
                <div className="incident-list">
                  {incidents.map((incident) => (
                    <div className="incident-row" key={incident.id}>
                      <div className="incident-main">
                        <h3>{incident.title}</h3>
                        <p>{incident.description}</p>
                      </div>

                      <div className="incident-meta">
                        <span
                          className={`badge severity-${incident.severity}`}
                        >
                          {incident.severity}
                        </span>

                        <span
                          className={`badge status-${incident.status}`}
                        >
                          {incident.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default App
