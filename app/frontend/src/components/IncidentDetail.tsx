import { useEffect, useState } from 'react'
import { getIncident, getIncidentUpdates, getService } from '../api/atlas'
import type { Incident, IncidentUpdate, Service } from '../types/api'
import { formatDate } from '../utils/formatDate'
import { StatusBadge } from './StatusBadge'

type IncidentDetailProps = { incidentId: number; onBack: () => void }
type IncidentDetailData = { incident: Incident; service: Service; updates: IncidentUpdate[] }

export function IncidentDetail({ incidentId, onBack }: IncidentDetailProps) {
  const [data, setData] = useState<IncidentDetailData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void Promise.all([getIncident(incidentId), getIncidentUpdates(incidentId)])
      .then(async ([incident, updates]) => ({ incident, updates, service: await getService(incident.service_id) }))
      .then((detail) => { if (!cancelled) setData(detail) })
      .catch((caughtError: unknown) => {
        if (!cancelled) setError(caughtError instanceof Error ? caughtError.message : 'Unable to load this incident.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [incidentId])

  return (
    <section className="detail-view" aria-labelledby="incident-detail-heading">
      <button className="back-link" type="button" onClick={onBack}>← Back to dashboard</button>
      {loading && <p className="message" role="status">Loading incident…</p>}
      {error && <p className="message error" role="alert">{error}</p>}
      {data && !loading && !error && <IncidentDetailContent data={data} />}
    </section>
  )
}

function IncidentDetailContent({ data }: { data: IncidentDetailData }) {
  const { incident, service, updates } = data
  return (
    <>
      <article className="detail-card">
        <div className="detail-heading"><div><p className="eyebrow">Incident · {service.name}</p><h2 id="incident-detail-heading">{incident.title}</h2></div><StatusBadge status={incident.status} label={incident.status} /></div>
        <p className="detail-description">{incident.description ?? 'No description has been provided for this incident.'}</p>
        <dl className="detail-facts">
          <div><dt>Service</dt><dd>{service.name}</dd></div><div><dt>Severity</dt><dd><span className={`severity-badge severity-${incident.severity}`}>{incident.severity}</span></dd></div><div><dt>Reported</dt><dd>{formatDate(incident.created_at)}</dd></div><div><dt>Last updated</dt><dd>{formatDate(incident.updated_at)}</dd></div><div><dt>Resolved</dt><dd>{incident.resolved_at ? formatDate(incident.resolved_at) : 'Not resolved'}</dd></div>
        </dl>
      </article>
      <section className="panel update-panel" aria-labelledby="updates-heading">
        <div className="panel-header"><h2 id="updates-heading" className="panel-title">Update history</h2><p className="panel-description">Status changes and incident communications</p></div>
        {updates.length === 0 ? <p className="empty-state">No updates have been posted yet.</p> : updates.map((update) => <article className="update-row" key={update.id}><div className="update-heading"><StatusBadge status={update.status} label={update.status} /><time className="incident-date" dateTime={update.created_at}>{formatDate(update.created_at)}</time></div><p className="update-message">{update.message}</p></article>)}
      </section>
    </>
  )
}
