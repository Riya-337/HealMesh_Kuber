import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { MOCK_DIAGNOSES } from '../lib/mockData'
import { isToday } from '../lib/utils'
import type { Diagnosis, DiagnosesResponse } from '../lib/types'
import { useMemo } from 'react'

async function fetchDiagnoses(): Promise<Diagnosis[]> {
  const res = await api.get<DiagnosesResponse>('/diagnoses')
  return res.data.diagnoses
}

export function useDiagnoses() {
  const query = useQuery<Diagnosis[], Error>({
    queryKey: ['diagnoses'],
    queryFn: fetchDiagnoses,
    refetchInterval: 30_000,
    retry: 1,
    // Fall back to mock data when backend is not available
    placeholderData: MOCK_DIAGNOSES,
  })

  const diagnoses = query.data ?? MOCK_DIAGNOSES

  const stats = useMemo(() => {
    const activeCount   = diagnoses.filter(
      (d) => d.parsed_action.action_type !== 'NONE'
    ).length

    const todayCount    = diagnoses.filter((d) => isToday(d.created_at)).length

    const avgLatency    = diagnoses.length > 0
      ? diagnoses.reduce((sum, d) => sum + d.latency_ms, 0) / diagnoses.length
      : 0

    return { activeCount, todayCount, avgLatency: Math.round(avgLatency) }
  }, [diagnoses])

  return { ...query, diagnoses, stats }
}
