import { useState } from 'react'
import { createIncident } from '../api/atlas'
import type { IncidentSeverity, Service } from '../types/api'

export function CreateIncidentForm({ onCreated, services }: { onCreated: () => void; services: Service[] }) {
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [serviceId, setServiceId] = useState(services[0]?.id ?? 0)
  const [severity, setSeverity] = useState<IncidentSeverity>('medium')
  const [title, setTitle] = useState('')
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null)
    try { await createIncident({ service_id: serviceId, title, description: description || undefined, severity }); setTitle(''); setDescription(''); onCreated() } catch (caughtError) { setError(caughtError instanceof Error ? caughtError.message : 'Unable to create incident.') }
  }
  if (!services.length) return null
  return <form className="operator-form create-incident" onSubmit={(event) => void submit(event)}><h2 className="panel-title">Create incident</h2><label>Service<select value={serviceId} onChange={(event) => setServiceId(Number(event.target.value))}>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label><label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label><label>Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} /></label><label>Severity<select value={severity} onChange={(event) => setSeverity(event.target.value as IncidentSeverity)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>{error && <p className="form-error">{error}</p>}<button className="primary-button">Create incident</button></form>
}
