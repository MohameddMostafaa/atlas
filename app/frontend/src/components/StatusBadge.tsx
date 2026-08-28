type StatusBadgeProps = {
  label: string
  prominent?: boolean
  status: string
}

const labels: Record<string, string> = {
  degraded: 'Degraded performance', identified: 'Identified', investigating: 'Investigating',
  major_outage: 'Major outage', monitoring: 'Monitoring', operational: 'All systems operational',
  partial_outage: 'Partial outage', resolved: 'Resolved',
}

export function StatusBadge({ label, prominent = false, status }: StatusBadgeProps) {
  const displayLabel = labels[label] ?? label.replaceAll('_', ' ')
  const className = `status-badge status-${status}${prominent ? ' status-badge--prominent' : ''}`

  return <span className={className}><span className="status-dot" aria-hidden="true" />{displayLabel}</span>
}
