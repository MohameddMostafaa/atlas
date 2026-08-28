import { StatusBadge } from './StatusBadge'
import type { Incident, Service } from '../types/api'
import { formatDate } from '../utils/formatDate'

type IncidentListProps = { incidents: Incident[]; onSelect: (incidentId: number) => void; services: Service[] }

export function IncidentList({ incidents, onSelect, services }: IncidentListProps) {
  const serviceNames = new Map(services.map((service) => [service.id, service.name]))
  return (
    <section className="panel" aria-labelledby="incidents-heading">
      <div className="panel-header"><h2 id="incidents-heading" className="panel-title">Recent incidents</h2><p className="panel-description">The five most recently reported incidents</p></div>
      {incidents.length === 0 ? <p className="empty-state">No incidents have been reported.</p> : incidents.map((incident) => (
        <button className="incident-row list-button" type="button" key={incident.id} onClick={() => onSelect(incident.id)}>
          <div className="incident-topline"><h3 className="incident-title">{incident.title}</h3><span className={`severity-badge severity-${incident.severity}`}>{incident.severity}</span></div>
          {incident.description && <p className="incident-description">{incident.description}</p>}
          <div className="incident-meta"><StatusBadge status={incident.status} label={incident.status} /><span className="service-name-label">{serviceNames.get(incident.service_id) ?? 'Unknown service'}</span><time className="incident-date" dateTime={incident.created_at}>{formatDate(incident.created_at)}</time></div>
        </button>
      ))}
    </section>
  )
}
