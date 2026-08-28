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

export type IncidentUpdate = {
  id: number
  incident_id: number
  author_id: number
  message: string
  status: IncidentStatus
  created_at: string
}

export type AuthUser = { id: number; email: string }
export type LoginResponse = { access_token: string; token_type: 'bearer' }
export type LoginRequest = { email: string; password: string }
export type CreateIncidentRequest = { service_id: number; title: string; description?: string; severity: IncidentSeverity }
export type UpdateIncidentRequest = { status?: IncidentStatus }
export type CreateIncidentUpdateRequest = { message: string; status: IncidentStatus }
export type UpdateServiceRequest = { status: ServiceStatus }
