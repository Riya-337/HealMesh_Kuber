import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, RoundedBox, Float, Line } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { NAMESPACE_NODES, MOCK_DIAGNOSES } from '../../lib/mockData'
import { useIncidentStore } from '../../hooks/useIncidentStore'
import type { NamespaceNode } from '../../lib/types'

// Central Hub with Sweeping Radar Scanner and Core Monolith
function CentralHub() {
  const radarRef = useRef<THREE.Mesh>(null)
  const coreRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    if (radarRef.current) {
      radarRef.current.rotation.z = -t * 1.2
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.25
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Center Holographic Spire */}
      <group ref={coreRef} position={[0, 0.8, 0]}>
        <RoundedBox args={[0.9, 1.8, 0.9]} radius={0.08} smoothness={4}>
          <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.15} />
        </RoundedBox>
        {/* Core Glowing Energy Bands */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.48, 0.48, 0.15, 32]} />
          <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={3} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.48, 0.48, 0.1, 32]} />
          <meshStandardMaterial color="#818CF8" emissive="#818CF8" emissiveIntensity={2.5} />
        </mesh>
      </group>

      {/* Sweeping Radar Scanner Ring (KEPT Style) */}
      <mesh ref={radarRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 5.8, 64]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Static Target Rings */}
      {[2.2, 4.2, 5.8].map((radius, i) => (
        <mesh key={i} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius, radius + 0.015, 64]} />
          <meshStandardMaterial color="#94A3B8" emissive="#94A3B8" emissiveIntensity={0.6} transparent opacity={0.3} />
        </mesh>
      ))}

      <pointLight position={[0, 1.5, 0]} color="#38BDF8" intensity={3} distance={7} />
    </group>
  )
}

// Animated Radar Pulse Ripple Expanding Outward
function RadarRipple({ position, color, isIncident }: {
  position: [number, number, number]
  color: string
  isIncident: boolean
}) {
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const speed = isIncident ? 2.2 : 1.4

    if (ring1Ref.current) {
      const progress1 = (t * speed) % 1
      ring1Ref.current.scale.setScalar(0.4 + progress1 * 2.2)
      const mat = ring1Ref.current.material as THREE.MeshBasicMaterial
      mat.opacity = (1 - progress1) * (isIncident ? 0.8 : 0.4)
    }

    if (ring2Ref.current) {
      const progress2 = ((t * speed) + 0.5) % 1
      ring2Ref.current.scale.setScalar(0.4 + progress2 * 2.2)
      const mat = ring2Ref.current.material as THREE.MeshBasicMaterial
      mat.opacity = (1 - progress2) * (isIncident ? 0.7 : 0.3)
    }
  })

  return (
    <group position={[position[0], 0.04, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ring1Ref}>
        <ringGeometry args={[0.3, 0.35, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      <mesh ref={ring2Ref}>
        <ringGeometry args={[0.3, 0.35, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

// Fluid Glowing Spline Route Track with Moving Packet Particle
function SplineDataRoute({ targetPos, color }: { targetPos: [number, number, number]; color: string }) {
  const points = useMemo(() => {
    return [
      new THREE.Vector3(0, 0.4, 0),
      new THREE.Vector3(targetPos[0] * 0.5, 0.25, targetPos[2] * 0.5),
      new THREE.Vector3(targetPos[0], 0.6, targetPos[2]),
    ]
  }, [targetPos])

  const particleRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = (state.clock.getElapsedTime() * 0.8) % 1
    if (particleRef.current) {
      const p = new THREE.Vector3().lerpVectors(points[0], points[2], t)
      particleRef.current.position.copy(p)
    }
  })

  return (
    <group>
      <Line
        points={points}
        color={color}
        lineWidth={1.5}
        transparent
        opacity={0.4}
      />
      {/* Moving Data Packet Pulse */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" emissive={color} emissiveIntensity={3} />
      </mesh>
    </group>
  )
}

// 3D Floating Spatial Node Pin (KEPT Location Tracking 3D Style)
function SpatialLocationPin({ node, isSelected }: { node: NamespaceNode; isSelected: boolean }) {
  const [hovered, setHovered] = useState(false)
  const selectIncident = useIncidentStore((s) => s.selectIncident)

  const isIncident = node.status === 'incident'
  const isWarning = node.status === 'warning'
  const color = isIncident ? '#F43F5E' : isWarning ? '#F59E0B' : '#10B981'

  const handleClick = (e: any) => {
    e.stopPropagation()
    const found = MOCK_DIAGNOSES.find((d) => d.namespace === node.name) || MOCK_DIAGNOSES[0]
    selectIncident(found)
  }

  return (
    <group position={node.position}>
      <RadarRipple position={node.position} color={color} isIncident={isIncident} />
      <SplineDataRoute targetPos={node.position} color={color} />

      <Float speed={2.5} rotationIntensity={0.1} floatIntensity={0.35}>
        <group
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
          }}
          onPointerOut={() => setHovered(false)}
        >
          {/* Vertical Laser Stalk */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
          </mesh>

          {/* Floating 3D Geolocation Diamond Marker */}
          <mesh position={[0, 1.15, 0]}>
            <octahedronGeometry args={[hovered || isSelected ? 0.32 : 0.24, 0]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive={color}
              emissiveIntensity={hovered || isIncident ? 3.5 : 2}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>

          {/* Horizontal Halo Ring */}
          <mesh position={[0, 1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.36, 0.4, 32]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
          </mesh>

          {/* Incident Alert Vertical Laser Beacon */}
          {isIncident && (
            <mesh position={[0, 2.8, 0]}>
              <cylinderGeometry args={[0.015, 0.06, 3, 16]} />
              <meshBasicMaterial color="#F43F5E" transparent opacity={0.6} />
            </mesh>
          )}
        </group>
      </Float>
    </group>
  )
}

export default function ClusterCanvas() {
  const selected = useIncidentStore((s) => s.selected)
  const selectIncident = useIncidentStore((s) => s.selectIncident)

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 7.5, 8.5], fov: 46 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 18, 10]} intensity={2} color="#FFFFFF" />
        <pointLight position={[-8, 6, -6]} intensity={2} color="#38BDF8" />
        <pointLight position={[8, 5, 6]} intensity={2} color="#818CF8" />

        {/* 3D Isometric Ground Grid Disc with Tactile Radial Edge */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[6.5, 64]} />
          <meshStandardMaterial color="#0A101D" metalness={0.88} roughness={0.2} />
        </mesh>

        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[6.42, 6.48, 64]} />
          <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={2} />
        </mesh>

        <CentralHub />

        {NAMESPACE_NODES.map((node) => (
          <SpatialLocationPin
            key={node.name}
            node={node}
            isSelected={selected?.namespace === node.name}
          />
        ))}

        <OrbitControls
          enablePan={false}
          minDistance={4}
          maxDistance={15}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2.15}
        />
      </Canvas>

      {/* Floating Spatial Location Tags Docked Over 3D Scene (Interactive Buttons) */}
      <div className="absolute top-4 right-4 flex flex-wrap gap-2 max-w-md pointer-events-auto z-20">
        {NAMESPACE_NODES.map((n) => {
          const isIncident = n.status === 'incident'
          const isWarning = n.status === 'warning'
          const isSelected = selected?.namespace === n.name

          const handlePillClick = () => {
            const found = MOCK_DIAGNOSES.find((d) => d.namespace === n.name) || {
              ...MOCK_DIAGNOSES[0],
              id: `diag-${n.name}-${Date.now()}`,
              namespace: n.name,
              pod_name: `${n.name}-service-${Math.random().toString(36).substring(2, 7)}`,
              failure_type: isIncident
                ? 'CrashLoopBackOff'
                : isWarning
                ? 'ImagePullBackOff'
                : 'CrashLoopBackOff',
              root_cause: isIncident
                ? `The pod in namespace '${n.name}' entered CrashLoopBackOff due to a connection timeout.`
                : `Namespace '${n.name}' telemetry inspected. All ${n.podCount} container replicas operating under active watch.`,
              created_at: new Date().toISOString(),
            }
            selectIncident(found as any)
          }

          return (
            <button
              key={n.name}
              onClick={handlePillClick}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif border backdrop-blur-2xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-white/30 border-white text-white font-bold ring-2 ring-white/50 scale-105 shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                  : isIncident
                  ? 'bg-rose-500/25 border-rose-400 text-rose-200 font-bold hover:bg-rose-500/40 hover:scale-105 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : isWarning
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 hover:bg-amber-500/35 hover:scale-105'
                  : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white hover:scale-105'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isIncident
                    ? 'bg-rose-400 animate-ping'
                    : isWarning
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="font-bold">{n.name}</span>
              <span className="opacity-60 text-[10px] ml-0.5 font-mono">{n.podCount} pods</span>
            </button>
          )
        })}
      </div>

      {/* Navigation HUD Control Pill */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="px-5 py-2 rounded-full glass-card border border-white/25 backdrop-blur-2xl text-xs font-serif text-white/80 inline-flex items-center gap-3 shadow-2xl">
          <span>⤾ Orbit camera</span>
          <span className="text-white/20">|</span>
          <span>↕ Zoom</span>
          <span className="text-white/20">|</span>
          <span>◎ Click 3D pin to inspect outage</span>
        </div>
      </div>
    </div>
  )
}
