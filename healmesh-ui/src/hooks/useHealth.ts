import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { HealthResponse } from '../lib/types'

async function fetchHealth(): Promise<HealthResponse> {
  const res = await api.get<HealthResponse>('/health')
  return res.data
}

export function useHealth() {
  return useQuery<HealthResponse, Error>({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
    retry: 1,
  })
}
