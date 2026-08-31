import { Canvas, useFrame } from '@react-three/fiber'
import { Float, RoundedBox } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'
import type { FailureType } from '../../lib/types'

// Holographic 3D Container Pod with Live Laser Scanning and Fault Node
function HologramPodMesh({ failureType }: { failureType: FailureType }) {
  const containerRef = useRef<THREE.Group>(null)
  const laserRef = useRef<THREE.Mesh>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  const isIncident = failureType === 'CrashLoopBackOff' || failureType === 'OOMKilled'
  const faultColor = isIncident ? '#E06C34' : '#F59E0B'

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    if (containerRef.current) {
      containerRef.current.rotation.y = t * 0.4
    }
    if (coreRef.current) {
      coreRef.current.rotation.x = t * 0.8
      coreRef.current.rotation.z = t * 0.5
    }
    if (laserRef.current) {
      laserRef.current.position.y = Math.sin(t * 2.5) * 0.7
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.6
    }
  })

  return (
    <group ref={containerRef}>
      {/* Outer Hologram Pod Container Chassis */}
      <RoundedBox args={[1.4, 1.8, 1.4]} radius={0.1} smoothness={4}>
        <meshStandardMaterial
          color="#00F0FF"
          wireframe
          transparent
          opacity={0.35}
          emissive="#00F0FF"
          emissiveIntensity={0.6}
        />
      </RoundedBox>

      {/* Internal Fault Core (Pulsing Diamond) */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <octahedronGeometry args={[0.38, 0]} />
        <meshStandardMaterial
          color={faultColor}
          emissive={faultColor}
          emissiveIntensity={3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Orbiting Diagnostic Gyro Ring */}
      <mesh ref={ringRef} position={[0, 0, 0]}>
        <torusGeometry args={[0.95, 0.015, 16, 64]} />
        <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={2} />
      </mesh>

      {/* Sweeping Laser Scanner Plane */}
      <mesh ref={laserRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.3, 1.3]} />
        <meshBasicMaterial
          color="#00F0FF"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Corner Bracket Nodes */}
      {[-0.7, 0.7].map((x) =>
        [-0.9, 0.9].map((y) =>
          [-0.7, 0.7].map((z) => (
            <mesh key={`${x}-${y}-${z}`} position={[x, y, z]}>
              <boxGeometry args={[0.08, 0.08, 0.08]} />
              <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={2} />
            </mesh>
          ))
        )
      )}

      <pointLight color={faultColor} intensity={3.5} distance={4} />
      <pointLight position={[0, 1.2, 0]} color="#00F0FF" intensity={2} distance={3} />
    </group>
  )
}

export default function PodHologramCanvas({ failureType }: { failureType: FailureType }) {
  return (
    <div className="w-full h-[180px] relative rounded-2xl overflow-hidden glass-card border border-hm-teal/30 bg-black/40">
      {/* 3D WebGL Canvas */}
      <Canvas camera={{ position: [2.2, 1.2, 2.5], fov: 42 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#FFFFFF" />

        <Float speed={2} rotationIntensity={0.15} floatIntensity={0.3}>
          <HologramPodMesh failureType={failureType} />
        </Float>
      </Canvas>

      {/* Hologram HUD Scan Overlay */}
      <div className="absolute top-2.5 left-3 pointer-events-none flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-hm-teal animate-ping" />
        <span className="text-[10px] font-mono font-bold tracking-widest text-hm-teal uppercase">
          SPATIAL 3D POD SCANNER
        </span>
      </div>

      <div className="absolute bottom-2 right-3 pointer-events-none text-[9px] font-mono text-white/40">
        SCAN FREQ: 60Hz · LIVE TELEMETRY
      </div>
    </div>
  )
}
