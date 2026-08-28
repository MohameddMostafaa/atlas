import { StatusBadge } from './StatusBadge'
import type { Service } from '../types/api'

type ServiceListProps = { onSelect: (serviceId: number) => void; services: Service[] }

export function ServiceList({ onSelect, services }: ServiceListProps) {
  return (
    <section className="panel" aria-labelledby="services-heading">
      <div className="panel-header"><h2 id="services-heading" className="panel-title">Services</h2><p className="panel-description">Current status of Atlas services</p></div>
      {services.length === 0 ? <p className="empty-state">No services have been added yet.</p> : services.map((service) => (
        <button className="service-row list-button" type="button" key={service.id} onClick={() => onSelect(service.id)}>
          <span><span className="service-name">{service.name}</span>{service.description && <span className="service-description">{service.description}</span>}</span>
          <StatusBadge status={service.status} label={service.status} />
        </button>
      ))}
    </section>
  )
}
