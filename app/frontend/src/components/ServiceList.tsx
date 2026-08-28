import { StatusBadge } from './StatusBadge'
import type { Service } from '../types/api'

type ServiceListProps = { services: Service[] }

export function ServiceList({ services }: ServiceListProps) {
  return (
    <section className="panel" aria-labelledby="services-heading">
      <div className="panel-header"><h2 id="services-heading" className="panel-title">Services</h2><p className="panel-description">Current status of Atlas services</p></div>
      {services.length === 0 ? <p className="empty-state">No services have been added yet.</p> : services.map((service) => (
        <article className="service-row" key={service.id}>
          <div><h3 className="service-name">{service.name}</h3>{service.description && <p className="service-description">{service.description}</p>}</div>
          <StatusBadge status={service.status} label={service.status} />
        </article>
      ))}
    </section>
  )
}
