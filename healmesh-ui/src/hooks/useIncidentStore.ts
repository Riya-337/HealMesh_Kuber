import { create } from 'zustand'
import type { Diagnosis } from '../lib/types'

interface IncidentStore {
  selected: Diagnosis | null
  drawerOpen: boolean
  selectIncident: (d: Diagnosis) => void
  closeDrawer: () => void
  simulatedIncidents: Diagnosis[]
  addSimulated: (d: Diagnosis) => void
}

export const useIncidentStore = create<IncidentStore>((set) => ({
  selected: null,
  drawerOpen: false,
  simulatedIncidents: [],

  selectIncident: (d) => set({ selected: d, drawerOpen: true }),
  closeDrawer: ()   => set({ drawerOpen: false, selected: null }),
  addSimulated: (d) => set((s) => ({ simulatedIncidents: [d, ...s.simulatedIncidents] })),
}))
