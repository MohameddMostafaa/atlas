import { useEffect, useState } from 'react'
import { createIncidentUpdate, getIncident, getIncidentUpdates, getService } from '../api/atlas'
import type { Incident, IncidentStatus, IncidentUpdate, Service } from '../types/api'
import { formatDate } from '../utils/formatDate'
import { StatusBadge } from './StatusBadge'

type IncidentDetailProps = { incidentId: number; isOperator: boolean; onBack: () => void }
type IncidentDetailData = { incident: Incident; service: Service; updates: IncidentUpdate[] }

export function IncidentDetail({ incidentId, isOperator, onBack }: IncidentDetailProps) {
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
      {data && !loading && !error && <IncidentDetailContent data={data} isOperator={isOperator} onChange={setData} />}
    </section>
  )
}

function IncidentDetailContent({ data, isOperator, onChange }: { data: IncidentDetailData; isOperator: boolean; onChange: (data: IncidentDetailData) => void }) {
  const { incident, service, updates } = data
  const [message, setMessage] = useState('')
  const [nextStatus, setNextStatus] = useState<IncidentStatus>(() => ({ investigating: 'identified', identified: 'monitoring', monitoring: 'resolved', resolved: 'resolved' } as Record<IncidentStatus, IncidentStatus>)[incident.status])
  const nextStatuses: Record<IncidentStatus, IncidentStatus[]> = { investigating: ['identified'], identified: ['monitoring'], monitoring: ['resolved'], resolved: [] }
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
        {isOperator && nextStatuses[incident.status].length > 0 && <form className="operator-form update-form" onSubmit={(event) => { event.preventDefault(); void createIncidentUpdate(incident.id, { message, status: nextStatus }).then((update) => { onChange({ ...data, incident: { ...incident, status: nextStatus }, updates: [...updates, update] }); setMessage('') }) }}><h3 className="panel-title">Post update</h3><label>Status<select value={nextStatus} onChange={(event) => setNextStatus(event.target.value as IncidentStatus)}>{nextStatuses[incident.status].map((status) => <option key={status} value={status}>{status}</option>)}</select></label><label>Message<textarea value={message} onChange={(event) => setMessage(event.target.value)} required rows={3} /></label><button className="primary-button">Post update</button></form>}
      </section>
    </>
  )
}
