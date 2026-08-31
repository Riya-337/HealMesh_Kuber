export type NodeKind = "core" | "agent" | "service";

export interface MeshNode {
  id: string;
  label: string;
  kind: NodeKind;
  x: number;
  y: number;
  r: number;
}

export interface MeshEdge {
  from: string;
  to: string;
}

/** Layout for the signature HealMesh sphere: core, agent ring, service shell. */
export const meshNodes: MeshNode[] = [
  { id: "core", label: "AI CORE", kind: "core", x: 200, y: 200, r: 22 },

  { id: "agent-1", label: "AGENT 01", kind: "agent", x: 200, y: 118, r: 11 },
  { id: "agent-2", label: "AGENT 02", kind: "agent", x: 271, y: 241, r: 11 },
  { id: "agent-3", label: "AGENT 03", kind: "agent", x: 129, y: 241, r: 11 },

  { id: "api", label: "API", kind: "service", x: 200, y: 42, r: 8 },
  { id: "auth", label: "AUTH", kind: "service", x: 322, y: 108, r: 8 },
  { id: "payments", label: "PAYMENTS", kind: "service", x: 352, y: 236, r: 8 },
  { id: "workers", label: "WORKERS", kind: "service", x: 272, y: 340, r: 8 },
  { id: "database", label: "DATABASE", kind: "service", x: 128, y: 340, r: 8 },
  { id: "redis", label: "REDIS", kind: "service", x: 48, y: 236, r: 8 },
  { id: "k8s", label: "KUBERNETES", kind: "service", x: 78, y: 108, r: 8 },
];

export const meshEdges: MeshEdge[] = [
  { from: "core", to: "agent-1" },
  { from: "core", to: "agent-2" },
  { from: "core", to: "agent-3" },
  { from: "agent-1", to: "api" },
  { from: "agent-1", to: "auth" },
  { from: "agent-1", to: "k8s" },
  { from: "agent-2", to: "payments" },
  { from: "agent-2", to: "workers" },
  { from: "agent-2", to: "auth" },
  { from: "agent-3", to: "database" },
  { from: "agent-3", to: "redis" },
  { from: "agent-3", to: "k8s" },
  { from: "api", to: "auth" },
  { from: "auth", to: "payments" },
  { from: "payments", to: "workers" },
  { from: "workers", to: "database" },
  { from: "database", to: "redis" },
  { from: "redis", to: "k8s" },
  { from: "k8s", to: "api" },
];

export const nodeById = (id: string) => meshNodes.find((n) => n.id === id)!;

/** Phases of the self-healing story the mesh tells everywhere in the product. */
export const healPhases = [
  "calm",
  "detect",
  "decide",
  "remediate",
  "verified",
] as const;

export type HealPhase = (typeof healPhases)[number];

export const phaseCopy: Record<HealPhase, string> = {
  calm: "MESH STABLE",
  detect: "ANOMALY DETECTED",
  decide: "AGENT INVESTIGATING",
  remediate: "REMEDIATION EXECUTING",
  verified: "RECOVERY VERIFIED",
};
