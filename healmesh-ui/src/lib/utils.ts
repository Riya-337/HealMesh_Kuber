import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FailureType, ConfidenceLevel } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  if (diff < 60_000)  return `${Math.floor(diff / 1_000)}s ago`
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`
  return `${Math.floor(diff / 3600_000)}h ago`
}

export function formatDynamicDate(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`
  return `${(ms / 1000).toFixed(1)} s`
}

export function getSeverityClass(type: FailureType): string {
  switch (type) {
    case 'CrashLoopBackOff': return 'severity-crash'
    case 'OOMKilled':        return 'severity-oom'
    case 'ImagePullBackOff': return 'severity-image'
    case 'FailedRollout':    return 'severity-rollout'
    default:                  return 'severity-quota'
  }
}

export function getFailureColor(type: FailureType): string {
  switch (type) {
    case 'CrashLoopBackOff': return '#FB923C' // Smoked Copper
    case 'OOMKilled':        return '#F87171' // Rose Terracotta
    case 'ImagePullBackOff':
    case 'FailedRollout':    return '#FDE68A' // Champagne Platinum Gold
    default:                  return '#94A3B8'
  }
}

export function getConfidenceColor(level: ConfidenceLevel): string {
  switch (level) {
    case 'high':   return '#5EEAD4' // Lustrous Celadon Sage
    case 'medium': return '#FDE68A' // Warm Champagne
    case 'low':    return '#F87171' // Rose Terracotta
  }
}

export function getConfidenceLabel(level: ConfidenceLevel): string {
  switch (level) {
    case 'high':   return 'High Confidence'
    case 'medium': return 'Medium Confidence'
    case 'low':    return 'Low Confidence'
  }
}

export function isToday(isoString: string): boolean {
  const d = new Date(isoString)
  const t = new Date()
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth()    === t.getMonth()    &&
    d.getDate()     === t.getDate()
  )
}

export const PROTECTED_NAMESPACES = new Set(['kube-system', 'kube-public', 'healmesh'])

