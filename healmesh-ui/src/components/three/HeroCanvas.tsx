import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, RoundedBox, Float, Line } from '@react-three/drei'
import { useRef, useMemo, useState } from 'react'
import * as THREE from 'three'

// 3D Isometric Building Block / Server Matrix Node (KEPT Style)
function IsometricServerBuilding({
  position,
  height,
  width = 0.8,
  depth = 0.8,
  status = 'healthy',
  name,
  pods,
}: {
  position: [number, number, number]
  height: number
  width?: number
  depth?: number
  status?: 'healthy' | 'incident' | 'warning'
  name: string
  pods: string
}) {
  const [hovered, setHovered] = useState(false)
  const isIncident = status === 'incident'
  const isWarning = status === 'warning'
  const accentColor = isIncident ? '#F43F5E' : isWarning ? '#F59E0B' : '#06B6D4'

  const currentHeight = hovered ? height + 0.3 : height

  return (
    <group position={position}>
      {/* 3D Isometric Architectural Block */}
      <group
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <RoundedBox
          args={[width, currentHeight, depth]}
          radius={0.06}
          smoothness={4}
          position={[0, currentHeight / 2, 0]}
        >
          <meshStandardMaterial
            color={hovered ? '#1E293B' : '#0F172A'}
            metalness={0.9}
            roughness={0.15}
          />
        </RoundedBox>

        {/* Luminous Top Face Roof */}
        <mesh position={[0, currentHeight + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width - 0.1, depth - 0.1]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={hovered || isIncident ? 3 : 1.2}
          />
        </mesh>

        {/* Horizontal Louver Windows / LED Blade Strips */}
        {Array.from({ length: Math.floor(height / 0.4) }).map((_, i) => (
          <mesh key={i} position={[0, (i + 1) * 0.38, depth / 2 + 0.01]}>
            <planeGeometry args={[width - 0.15, 0.04]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={isIncident ? 2.5 : 1.5}
            />
          </mesh>
        ))}

        {/* Floating Pin Beacon above the building (KEPT Location Marker) */}
        <Float speed={3} rotationIntensity={0.2} floatIntensity={0.25}>
          <group position={[0, currentHeight + 0.55, 0]}>
            <mesh>
              <octahedronGeometry args={[hovered || isIncident ? 0.18 : 0.12, 0]} />
              <meshStandardMaterial
                color="#FFFFFF"
                emissive={accentColor}
                emissiveIntensity={hovered || isIncident ? 4 : 2}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.22, 0.26, 32]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2} />
            </mesh>
          </group>
        </Float>
      </group>
    </group>
  )
}

// Concentric Expanding Radar Ring (KEPT Style Pulse Wave)
function RadarPulseWave({ position, color, isIncident }: {
  position: [number, number, number]
  color: string
  isIncident?: boolean
}) {
  const ringRef1 = useRef<THREE.Mesh>(null)
  const ringRef2 = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const speed = isIncident ? 2.0 : 1.2

    if (ringRef1.current) {
      const p1 = (t * speed) % 1
      ringRef1.current.scale.setScalar(0.3 + p1 * 2.8)
      const mat = ringRef1.current.material as THREE.MeshBasicMaterial
      mat.opacity = (1 - p1) * (isIncident ? 0.9 : 0.45)
    }

    if (ringRef2.current) {
      const p2 = ((t * speed) + 0.5) % 1
      ringRef2.current.scale.setScalar(0.3 + p2 * 2.8)
      const mat = ringRef2.current.material as THREE.MeshBasicMaterial
      mat.opacity = (1 - p2) * (isIncident ? 0.8 : 0.35)
    }
  })

  return (
    <group position={[position[0], 0.02, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ringRef1}>
        <ringGeometry args={[0.3, 0.36, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      <mesh ref={ringRef2}>
        <ringGeometry args={[0.3, 0.36, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

// Animated Spline Data Highway Connecting Buildings (KEPT Route Track)
function SplineDataHighway({
  start,
  end,
  color,
}: {
  start: [number, number, number]
  end: [number, number, number]
  color: string
}) {
  const points = useMemo(() => {
    return [
      new THREE.Vector3(...start),
      new THREE.Vector3((start[0] + end[0]) / 2, 0.4, (start[2] + end[2]) / 2),
      new THREE.Vector3(...end),
    ]
  }, [start, end])

  const packetRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = (state.clock.getElapsedTime() * 0.9) % 1
    if (packetRef.current) {
      const p = new THREE.Vector3().lerpVectors(points[0], points[2], t)
      p.y += Math.sin(t * Math.PI) * 0.25
      packetRef.current.position.copy(p)
    }
  })

  return (
    <group>
      <Line points={points} color={color} lineWidth={1.5} transparent opacity={0.4} />
      {/* Moving Light Packet */}
      <mesh ref={packetRef}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" emissive={color} emissiveIntensity={3.5} />
      </mesh>
    </group>
  )
}

// Central 3D Radar Satellite Core
function CentralRadarCore() {
  const sweepRef = useRef<THREE.Mesh>(null)
  const sphereRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    if (sweepRef.current) sweepRef.current.rotation.z = -t * 1.4
    if (sphereRef.current) sphereRef.current.rotation.y += delta * 0.4
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Central Spire Monolith */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.08, 0.16, 2.4, 16]} />
        <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={2} metalness={0.9} />
      </mesh>

      {/* Floating Holographic Gyro Sphere */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh ref={sphereRef} position={[0, 2.6, 0]}>
          <icosahedronGeometry args={[0.45, 1]} />
          <meshStandardMaterial color="#00F0FF" wireframe emissive="#00F0FF" emissiveIntensity={3} />
        </mesh>
      </Float>

      {/* 360° Sweeping Radar Fan */}
      <mesh ref={sweepRef} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 5.2, 64]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export default function HeroCanvas() {
  return (
    <div className="w-full h-full min-h-[520px] lg:min-h-[660px] relative flex items-center justify-center">
      {/* 3D WebGL Isometric Topography Canvas */}
      <Canvas
        camera={{ position: [5.5, 6.0, 6.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[12, 20, 10]} intensity={2.2} color="#FFFFFF" />
        <pointLight position={[-8, 6, -6]} intensity={2.5} color="#38BDF8" />
        <pointLight position={[8, 5, 6]} intensity={2} color="#818CF8" />

        {/* 3D Isometric Base Ground Platform */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[5.6, 64]} />
          <meshStandardMaterial color="#091222" metalness={0.92} roughness={0.15} />
        </mesh>

        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[5.52, 5.58, 64]} />
          <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={2.5} />
        </mesh>

        {/* Concentric Coordinate Rings */}
        {[1.8, 3.4, 4.8].map((r, i) => (
          <mesh key={i} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r, r + 0.015, 64]} />
            <meshStandardMaterial color="#94A3B8" emissive="#94A3B8" emissiveIntensity={0.5} transparent opacity={0.25} />
          </mesh>
        ))}

        <CentralRadarCore />

        {/* Isometric Cluster Buildings (KEPT Spatial Grid) */}
        <IsometricServerBuilding position={[2.2, 0, 1.2]} height={1.6} name="payments" pods="12 pods" status="healthy" />
        <IsometricServerBuilding position={[-2.4, 0, 0.8]} height={1.3} name="batch-jobs" pods="8 pods" status="incident" />
        <IsometricServerBuilding position={[0.6, 0, 2.6]} height={1.1} name="api-gateway" pods="16 pods" status="healthy" />
        <IsometricServerBuilding position={[-1.2, 0, -2.2]} height={1.9} name="auth-service" pods="6 pods" status="warning" />
        <IsometricServerBuilding position={[2.6, 0, -1.8]} height={1.4} name="ingress" pods="4 pods" status="healthy" />

        {/* Radar Pulse Ripples */}
        <RadarPulseWave position={[-2.4, 0, 0.8]} color="#F43F5E" isIncident />
        <RadarPulseWave position={[2.2, 0, 1.2]} color="#06B6D4" />
        <RadarPulseWave position={[0.6, 0, 2.6]} color="#06B6D4" />

        {/* Spline Data Highways */}
        <SplineDataHighway start={[0, 0.8, 0]} end={[2.2, 0.8, 1.2]} color="#06B6D4" />
        <SplineDataHighway start={[0, 0.8, 0]} end={[-2.4, 0.8, 0.8]} color="#F43F5E" />
        <SplineDataHighway start={[0, 0.8, 0]} end={[0.6, 0.8, 2.6]} color="#06B6D4" />
        <SplineDataHighway start={[0, 0.8, 0]} end={[-1.2, 0.8, -2.2]} color="#F59E0B" />

        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={14}
          autoRotate
          autoRotateSpeed={0.4}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 3.8}
        />
      </Canvas>

      {/* Spatial High-Gloss Status Chips Floating in 3D Space */}
      <div className="absolute top-6 right-2 md:right-6 glass-card px-4 py-2.5 max-w-[260px] shadow-2xl border-t border-white/40 backdrop-blur-3xl animate-float">
        <div className="flex items-center gap-2 font-serif font-bold text-emerald-300 text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10B981] animate-pulse" />
          <span>payments-service</span>
        </div>
        <div className="text-xs text-white/80 font-serif mt-0.5">● 100% Operational (12 Pods)</div>
        <div className="text-[10px] text-white/40 font-mono mt-1">Live Telemetry: Normal</div>
      </div>

      <div className="absolute bottom-10 left-2 md:left-6 glass-card px-4 py-2.5 max-w-[280px] shadow-2xl border-t border-white/40 backdrop-blur-3xl animate-float-delayed">
        <div className="flex items-center gap-2 font-serif font-bold text-rose-300 text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_#F43F5E] animate-ping" />
          <span>CrashLoopBackOff Detected</span>
        </div>
        <div className="text-xs text-white/90 font-serif mt-0.5">AI Diagnosis: Connection Refused</div>
        <div className="text-[10px] text-cyan-300 font-mono mt-1">⚡ Groq Llama 3.1 — 842ms</div>
      </div>
    </div>
  )
}
