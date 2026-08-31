import ClusterCanvas from '../components/three/ClusterCanvas'

export default function ClusterPage() {
  return (
    <div className="h-full w-full relative overflow-hidden flex flex-col p-4">
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="label-style text-hm-teal">Spatial Cluster Topology</div>
        <h1 className="text-xl font-bold font-display text-white mt-0.5">3D CLUSTER MESH</h1>
      </div>
      <div className="flex-1 rounded-2xl overflow-hidden glass-card border border-white/10">
        <ClusterCanvas />
      </div>
    </div>
  )
}
