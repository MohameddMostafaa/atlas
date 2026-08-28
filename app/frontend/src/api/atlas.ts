import type { AuthUser, CreateIncidentRequest, CreateIncidentUpdateRequest, Incident, IncidentUpdate, LoginRequest, LoginResponse, Service, UpdateIncidentRequest, UpdateServiceRequest } from '../types/api'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

const tokenKey = 'atlas-access-token'
export function getAccessToken(): string | null { return localStorage.getItem(tokenKey) }
export function logout(): void { localStorage.removeItem(tokenKey) }

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } })

  if (response.status === 401) logout()
  if (!response.ok) {
    if (path === '/auth/login' && response.status === 401) {
      throw new Error('Invalid email or password. Please try again.')
    }

    throw new Error(`Unable to load status data (HTTP ${response.status}).`)
  }

  return response.json() as Promise<T>
}
async function getJson<T>(path: string): Promise<T> { return requestJson<T>(path) }

export async function getDashboardData(): Promise<{ incidents: Incident[]; services: Service[] }> {
  const [services, incidents] = await Promise.all([
    getJson<Service[]>('/services'),
    getJson<Incident[]>('/incidents'),
  ])

  return { incidents, services }
}

export function getService(serviceId: number): Promise<Service> {
  return getJson<Service>(`/services/${serviceId}`)
}

export function getIncident(incidentId: number): Promise<Incident> {
  return getJson<Incident>(`/incidents/${incidentId}`)
}

export function getIncidentUpdates(incidentId: number): Promise<IncidentUpdate[]> {
  return getJson<IncidentUpdate[]>(`/incidents/${incidentId}/updates`)
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> { const result = await requestJson<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }); localStorage.setItem(tokenKey, result.access_token); return result }
export function getCurrentUser(): Promise<AuthUser> { return getJson<AuthUser>('/auth/me') }
export function createIncident(data: CreateIncidentRequest): Promise<Incident> { return requestJson<Incident>('/incidents', { method: 'POST', body: JSON.stringify(data) }) }
export function updateIncident(id: number, data: UpdateIncidentRequest): Promise<Incident> { return requestJson<Incident>(`/incidents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }) }
export function createIncidentUpdate(id: number, data: CreateIncidentUpdateRequest): Promise<IncidentUpdate> { return requestJson<IncidentUpdate>(`/incidents/${id}/updates`, { method: 'POST', body: JSON.stringify(data) }) }
export function updateService(id: number, data: UpdateServiceRequest): Promise<Service> { return requestJson<Service>(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(data) }) }
