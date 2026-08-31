import type { Diagnosis, NamespaceNode } from './types'

const now = new Date()
const ts = (offsetMs: number) => new Date(now.getTime() - offsetMs).toISOString()

export const MOCK_DIAGNOSES: Diagnosis[] = [
  {
    id: 'diag-001',
    incident_id: 'inc-001',
    created_at: ts(2_000),
    failure_type: 'CrashLoopBackOff',
    pod_name: 'payments-service-6f8d7f',
    namespace: 'payments',
    confidence: 'high',
    llm_model: 'gemini-2.5-flash',
    root_cause:
      'The pod is crashing because it cannot connect to the PostgreSQL database. ' +
      'The connection is being refused on 10.0.15.23:5432. This is causing the ' +
      'application to exit repeatedly, triggering CrashLoopBackOff.',
    suggested_manual_command:
      'kubectl -n payments logs payments-service-6f8d7f --tail=50',
    latency_ms: 842,
    parsed_action: { action_type: 'NONE', params: null },
    log_snippet: [
      'INFO  Starting payments service...',
      'INFO  Loading configuration...',
      'INFO  Connecting to database...',
      'ERROR connect ECONNREFUSED 10.0.15.23:5432',
      'ERROR DB Connection failed',
      'ERROR Shutting down application',
      'INFO  Exit code 1',
    ],
  },
  {
    id: 'diag-002',
    incident_id: 'inc-002',
    created_at: ts(12_000),
    failure_type: 'OOMKilled',
    pod_name: 'recommendation-api-7c9b8d',
    namespace: 'recommendations',
    confidence: 'high',
    llm_model: 'llama-3.1-8b-instant',
    root_cause:
      'The recommendation-api pod was killed by the Linux OOM killer. ' +
      'Memory usage exceeded the configured limit of 512Mi. ' +
      'The model inference loop is accumulating objects without clearing the cache.',
    suggested_manual_command:
      'kubectl -n recommendations describe pod recommendation-api-7c9b8d',
    latency_ms: 756,
    parsed_action: {
      action_type: 'PATCH',
      params: { memory_request: '512Mi', memory_limit: '1Gi' },
    },
    log_snippet: [
      'INFO  Starting recommendation engine...',
      'INFO  Loading ML model weights (1.2GB)...',
      'INFO  Cache warming started...',
      'WARN  Memory usage at 90% of limit',
      'WARN  Memory usage at 95% of limit',
      'ERROR OOMKilled — container exceeded memory limit',
    ],
  },
  {
    id: 'diag-003',
    incident_id: 'inc-003',
    created_at: ts(60_000),
    failure_type: 'ImagePullBackOff',
    pod_name: 'worker-batch-9a1c2d',
    namespace: 'batch-jobs',
    confidence: 'medium',
    llm_model: 'llama-3.1-8b-instant',
    root_cause:
      'Kubernetes cannot pull the container image worker-batch:v2.3.1-rc1. ' +
      'The image tag does not exist in the registry. This is likely a mis-tagged ' +
      'release candidate that was never pushed.',
    suggested_manual_command:
      'kubectl -n batch-jobs describe pod worker-batch-9a1c2d | grep -A5 Events',
    latency_ms: 923,
    parsed_action: {
      action_type: 'REDEPLOY',
      params: { image: 'worker-batch:v2.3.0' },
    },
    log_snippet: [
      'Normal   Scheduled  default-scheduler  Successfully assigned pod',
      'Normal   Pulling    kubelet            Pulling image "worker-batch:v2.3.1-rc1"',
      'Warning  Failed     kubelet            Failed to pull image: not found',
      'Warning  Failed     kubelet            Error: ErrImagePull',
      'Warning  BackOff    kubelet            Back-off pulling image',
    ],
  },
]

export const NAMESPACE_NODES: NamespaceNode[] = [
  { name: 'payments',       podCount: 12, status: 'incident', position: [-2.5,  0,  1.5] },
  { name: 'auth',           podCount:  7, status: 'healthy',  position: [ 2.5,  0,  1.5] },
  { name: 'ingress',        podCount:  8, status: 'healthy',  position: [ 0,    0,  3.0] },
  { name: 'monitoring',     podCount:  9, status: 'healthy',  position: [-3.0,  0, -1.5] },
  { name: 'batch-jobs',     podCount:  6, status: 'warning',  position: [ 0,    0, -3.0] },
  { name: 'default',        podCount: 15, status: 'healthy',  position: [ 3.0,  0, -1.5] },
  { name: 'data',           podCount: 10, status: 'healthy',  position: [ 0,    0,  0.5] },
]

export const AUDIT_EVENTS = [
  {
    id: 'evt-001', timestamp: ts(2_000),    incident_id: 'inc-001',
    event: 'WATCHER_DETECTED',   namespace: 'payments',       action: '—',     actor: 'healmesh-watcher',
    hash: '0xa3f2b1c9d4e7', verified: true,
  },
  {
    id: 'evt-002', timestamp: ts(1_800),    incident_id: 'inc-001',
    event: 'PAYLOAD_VALIDATED',  namespace: 'payments',       action: '—',     actor: 'healmesh-core',
    hash: '0x7e1d5a2f8b3c', verified: true,
  },
  {
    id: 'evt-003', timestamp: ts(1_000),    incident_id: 'inc-001',
    event: 'GROQ_DIAGNOSED',     namespace: 'payments',       action: 'NONE',  actor: 'llama-3.1-8b-instant',
    hash: '0x2b9c4d6e1f8a', verified: true,
  },
  {
    id: 'evt-004', timestamp: ts(12_000),   incident_id: 'inc-002',
    event: 'WATCHER_DETECTED',   namespace: 'recommendations', action: '—',    actor: 'healmesh-watcher',
    hash: '0xf4a1b2c3d5e6', verified: true,
  },
  {
    id: 'evt-005', timestamp: ts(11_200),   incident_id: 'inc-002',
    event: 'GROQ_DIAGNOSED',     namespace: 'recommendations', action: 'PATCH', actor: 'llama-3.1-8b-instant',
    hash: '0x8a2c5d1e3f7b', verified: true,
  },
]
