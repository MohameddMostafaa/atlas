import { useEffect, useState } from 'react'
import { getService } from '../api/atlas'
import type { Service } from '../types/api'
import { formatDate } from '../utils/formatDate'
import { StatusBadge } from './StatusBadge'

type ServiceDetailProps = {
  onBack: () => void
  serviceId: number
}

export function ServiceDetail({ onBack, serviceId }: ServiceDetailProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [service, setService] = useState<Service | null>(null)

  useEffect(() => {
    let cancelled = false
    void getService(serviceId)
      .then((data) => { if (!cancelled) setService(data) })
      .catch((caughtError: unknown) => {
        if (!cancelled) setError(caughtError instanceof Error ? caughtError.message : 'Unable to load this service.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [serviceId])

  return (
    <section className="detail-view" aria-labelledby="service-detail-heading">
      <button className="back-link" type="button" onClick={onBack}>← Back to dashboard</button>
      {loading && <p className="message" role="status">Loading service…</p>}
      {error && <p className="message error" role="alert">{error}</p>}
      {service && !loading && !error && (
        <article className="detail-card">
          <div className="detail-heading"><div><p className="eyebrow">Service</p><h2 id="service-detail-heading">{service.name}</h2></div><StatusBadge status={service.status} label={service.status} /></div>
          <p className="detail-description">{service.description ?? 'No description has been provided for this service.'}</p>
          <dl className="detail-facts">
            <div><dt>Service URL</dt><dd>{service.url ? <a href={service.url} target="_blank" rel="noreferrer">{service.url}</a> : 'Not provided'}</dd></div>
            <div><dt>Created</dt><dd>{formatDate(service.created_at)}</dd></div>
            <div><dt>Last updated</dt><dd>{formatDate(service.updated_at)}</dd></div>
          </dl>
        </article>
      )}
    </section>
  )
}
