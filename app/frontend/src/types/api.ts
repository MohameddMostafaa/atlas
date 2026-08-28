export type ServiceStatus = 'operational' | 'degraded' | 'partial_outage' | 'major_outage'
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved'
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
export type SystemStatus = ServiceStatus

export type Service = {
  id: number
  name: string
  description: string | null
  url: string | null
  status: ServiceStatus
  created_at: string
  updated_at: string
}

export type Incident = {
  id: number
  service_id: number
  created_by: number
  title: string
  description: string | null
  severity: IncidentSeverity
  status: IncidentStatus
  created_at: string
  updated_at: string
  resolved_at: string | null
}
