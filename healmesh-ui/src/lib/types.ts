// ─── Core Types ──────────────────────────────────────────────────────────────

export type FailureType =
  | 'CrashLoopBackOff'
  | 'OOMKilled'
  | 'ImagePullBackOff'
  | 'FailedRollout'
  | 'ResourceQuotaExceeded'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export type ActionType = 'PATCH' | 'REDEPLOY' | 'SCALE' | 'HELM_UPGRADE' | 'NONE'

export interface ParsedAction {
  action_type: ActionType
  params: Record<string, unknown> | null
}

export interface Diagnosis {
  id: string
  incident_id: string
  created_at: string          // ISO 8601
  root_cause: string
  confidence: ConfidenceLevel
  suggested_manual_command: string | null
  latency_ms: number
  failure_type: FailureType
  pod_name: string
  namespace: string
  llm_model: string
  parsed_action: ParsedAction
  log_snippet: string[]
}

export interface HealthResponse {
  status: 'ok' | 'error'
  timestamp: string
  version?: string
}

export interface DiagnosesResponse {
  diagnoses: Diagnosis[]
}

// ─── Namespace Node (3D Topology) ────────────────────────────────────────────

export interface NamespaceNode {
  name: string
  podCount: number
  status: 'healthy' | 'incident' | 'warning'
  position: [number, number, number]
}
