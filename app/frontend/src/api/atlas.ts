import type { Incident, Service } from '../types/api'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`)

  if (!response.ok) {
    throw new Error(`Unable to load status data (HTTP ${response.status}).`)
  }

  return response.json() as Promise<T>
}

export async function getDashboardData(): Promise<{ incidents: Incident[]; services: Service[] }> {
  const [services, incidents] = await Promise.all([
    getJson<Service[]>('/services'),
    getJson<Incident[]>('/incidents'),
  ])

  return { incidents, services }
}
