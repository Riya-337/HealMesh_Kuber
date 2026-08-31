import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  healPhases,
  meshEdges,
  meshNodes,
  type HealPhase,
} from "./mesh-data";
import { cn } from "@/lib/utils";

interface MeshVisualProps {
  className?: string;
  phase?: HealPhase;
  interval?: number;
  onPhaseChange?: (phase: HealPhase) => void;
  faultId?: string;
  labels?: boolean;
  compact?: boolean;
}

export function MeshVisual({
  className,
  phase: forcedPhase,
  interval = 3200,
  onPhaseChange,
  faultId = "payments",
  labels = true,
  compact = false,
}: MeshVisualProps) {
  const [index, setIndex] = useState(0);
  const phase = forcedPhase ?? healPhases[index]!;
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<{
    label: string;
    id: string;
    health: string;
    latency: string;
  } | null>(null);

  // Cycle phase if not forced
  useEffect(() => {
    if (forcedPhase) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % healPhases.length),
      interval,
    );
    return () => window.clearInterval(id);
  }, [forcedPhase, interval]);

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x5146E5, 2, 20);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x78C69A, 1.5, 20);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Theme colors mapping
    const themeColors = {
      indigo: new THREE.Color(0x5146e5),
      cyan: new THREE.Color(0x65c7d8),
      healthy: new THREE.Color(0x78c69a),
      warning: new THREE.Color(0xe8b85c),
      critical: new THREE.Color(0xe16b6b),
      dark: new THREE.Color(0x111111),
      border: new THREE.Color(0xe7e5e1),
    };

    // Build 3D Node positions projected from 2D coordinates
    // R = 2.2 for outer sphere
    const nodeObjects: {
      id: string;
      mesh: THREE.Mesh;
      basePos: THREE.Vector3;
      kind: string;
      label: string;
    }[] = [];

    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);

    // Translucent background shell sphere
    const shellGeo = new THREE.SphereGeometry(2.2, 32, 32);
    const shellMat = new THREE.MeshPhysicalMaterial({
      color: 0x5146e5,
      metalness: 0.1,
      roughness: 0.2,
      transmission: 0.9,
      thickness: 1.0,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    nodesGroup.add(shell);

    meshNodes.forEach((node) => {
      // Map 2D (0 to 400) to 3D centered coord
      const x = (node.x - 200) / 90;
      const y = -(node.y - 200) / 90;
      
      // Calculate 3D sphere coordinate depth Z
      let z = 0;
      if (node.kind === "service") {
        const dist = Math.sqrt(x * x + y * y);
        const radius = 2.2;
        z = dist < radius ? Math.sqrt(radius * radius - dist * dist) : 0;
        // Distribute some Z forward and backward randomly for beautiful depth
        if (node.id === "redis" || node.id === "k8s") z = -z;
      } else if (node.kind === "agent") {
        const dist = Math.sqrt(x * x + y * y);
        const radius = 1.0;
        z = dist < radius ? Math.sqrt(radius * radius - dist * dist) : 0;
        if (node.id === "agent-3") z = -z;
      }

      const nodePos = new THREE.Vector3(x, y, z);
      const isCore = node.kind === "core";
      const isAgent = node.kind === "agent";

      const nodeGeo = new THREE.SphereGeometry(isCore ? 0.26 : isAgent ? 0.13 : 0.08, 32, 32);
      
      // Node Material
      const nodeMat = new THREE.MeshBasicMaterial({
        color: isCore ? themeColors.indigo : themeColors.cyan,
      });

      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(nodePos);
      nodesGroup.add(nodeMesh);

      // Core glow aura
      if (isCore) {
        const auraGeo = new THREE.SphereGeometry(0.4, 32, 32);
        const auraMat = new THREE.MeshBasicMaterial({
          color: themeColors.indigo,
          transparent: true,
          opacity: 0.15,
        });
        const aura = new THREE.Mesh(auraGeo, auraMat);
        nodeMesh.add(aura);
      }

      nodeObjects.push({
        id: node.id,
        mesh: nodeMesh,
        basePos: nodePos,
        kind: node.kind,
        label: node.label,
      });
    });

    // Connected Lines
    const linesGroup = new THREE.Group();
    nodesGroup.add(linesGroup);

    const lineObjects: {
      fromId: string;
      toId: string;
      line: THREE.Line;
    }[] = [];

    meshEdges.forEach((edge) => {
      const fromNode = nodeObjects.find((n) => n.id === edge.from);
      const toNode = nodeObjects.find((n) => n.id === edge.to);
      if (fromNode && toNode) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          fromNode.basePos,
          toNode.basePos,
        ]);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x888899,
          transparent: true,
          opacity: 0.2,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        linesGroup.add(line);
        lineObjects.push({
          fromId: edge.from,
          toId: edge.to,
          line,
        });
      }
    });

    // Interactivity: Raycaster for Hover detection
    const raycaster = new THREE.Raycaster();
    const ndcMouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      ndcMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      ndcMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Update target parallax rotation based on mouse pos
      targetRotation.y = ndcMouse.x * 0.4;
      targetRotation.x = -ndcMouse.y * 0.3;
    };

    container.addEventListener("mousemove", onMouseMove);

    // Animation values
    const currentRotation = new THREE.Euler(0, 0, 0);
    const targetRotation = new THREE.Euler(0, 0, 0);

    let animationId: number;
    let clock = new THREE.Clock();

    const render = () => {
      animationId = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();

      // Inertial Parallax + Slow ambient rotation
      currentRotation.y += (targetRotation.y + elapsed * 0.08 - currentRotation.y) * 0.05;
      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.05;
      nodesGroup.rotation.copy(currentRotation);

      // Raycast for hover tooltips
      raycaster.setFromCamera(ndcMouse, camera);
      const intersects = raycaster.intersectObjects(
        nodeObjects.map((n) => n.mesh),
      );

      if (intersects.length > 0) {
        const hitMesh = intersects[0]!.object;
        const hitNode = nodeObjects.find((n) => n.mesh === hitMesh);
        if (hitNode && hitNode.kind === "service") {
          setHoveredNode({
            label: hitNode.label,
            id: hitNode.id,
            health: hitNode.id === faultId && phase !== "calm" ? "94%" : "99%",
            latency: hitNode.id === faultId && phase !== "calm" ? "182ms" : "41ms",
          });
        }
      } else {
        setHoveredNode(null);
      }

      // Update Node Colors & State animation based on current self-healing phase
      nodeObjects.forEach((n) => {
        const isCore = n.kind === "core";
        const isAgent = n.kind === "agent";
        const isFault = n.id === faultId;
        const mat = n.mesh.material as THREE.MeshBasicMaterial;

        if (isFault) {
          if (phase === "detect") {
            mat.color.copy(themeColors.critical);
            const scale = 1.3 + Math.sin(elapsed * 12) * 0.15;
            n.mesh.scale.setScalar(scale);
          } else if (phase === "decide") {
            mat.color.copy(themeColors.warning);
            n.mesh.scale.setScalar(1.2);
          } else if (phase === "remediate") {
            mat.color.copy(themeColors.indigo);
            n.mesh.scale.setScalar(1.2);
          } else if (phase === "verified") {
            mat.color.copy(themeColors.healthy);
            n.mesh.scale.setScalar(1.0);
          } else {
            mat.color.copy(themeColors.cyan);
            n.mesh.scale.setScalar(1.0);
          }
        } else if (isCore) {
          mat.color.copy(themeColors.indigo);
        } else if (isAgent) {
          if (phase === "decide" || phase === "remediate") {
            mat.color.copy(themeColors.indigo);
            n.mesh.scale.setScalar(1.2 + Math.sin(elapsed * 4) * 0.1);
          } else {
            mat.color.copy(themeColors.cyan);
            n.mesh.scale.setScalar(1.0);
          }
        } else {
          mat.color.copy(themeColors.cyan);
          n.mesh.scale.setScalar(1.0);
        }
      });

      // Update Line styles based on phase
      lineObjects.forEach((l) => {
        const lineMat = l.line.material as THREE.LineBasicMaterial;
        const touchesFault = l.fromId === faultId || l.toId === faultId;
        if (touchesFault) {
          if (phase === "detect" || phase === "decide") {
            lineMat.color.copy(themeColors.critical);
            lineMat.opacity = 0.1;
          } else if (phase === "remediate") {
            lineMat.color.copy(themeColors.indigo);
            lineMat.opacity = 0.65;
          } else if (phase === "verified") {
            lineMat.color.copy(themeColors.healthy);
            lineMat.opacity = 0.55;
          } else {
            lineMat.color.setHex(0x888899);
            lineMat.opacity = 0.2;
          }
        } else {
          lineMat.color.setHex(0x888899);
          lineMat.opacity = 0.2;
        }
      });

      renderer.render(scene, camera);
    };

    render();

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width: newW, height: newH } = entries[0].contentRect;
      renderer.setSize(newW, newH);
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [forcedPhase, faultId, phase]);

  return (
    <div className={cn("relative aspect-square w-full", className)}>
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="h-full w-full pointer-events-auto" />

      {/* Dynamic Status Readout overlay */}
      {!compact && (
        <div className="pointer-events-none absolute bottom-0 left-0 flex items-center gap-2 rounded-full border border-current/10 bg-card/85 px-4 py-2 backdrop-blur">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background:
                phase === "detect"
                  ? "var(--critical)"
                  : phase === "decide"
                    ? "var(--warning)"
                    : phase === "remediate"
                      ? "var(--indigo-electric)"
                      : "var(--healthy)",
            }}
          />
          <span className="eyebrow !text-[10px] text-foreground/80 font-bold">
            {phase === "calm" ? "MESH STABLE" : phaseLabel(phase)}
          </span>
        </div>
      )}

      {/* Raycasted Service Nodes Telemetry Overlay */}
      {hoveredNode && !compact && (
        <div className="pointer-events-none absolute right-0 top-0 w-48 rounded-2xl border border-current/10 bg-card/90 p-4 shadow-lg backdrop-blur">
          <p className="eyebrow !text-[10.5px] font-bold text-foreground">{hoveredNode.label}-SERVICE</p>
          <dl className="mt-2.5 space-y-1.5 text-[11.5px] text-muted-foreground">
            <div className="flex justify-between">
              <dt>Health</dt>
              <dd className="text-foreground font-semibold">{hoveredNode.health}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Latency</dt>
              <dd className="text-foreground font-semibold">{hoveredNode.latency}</dd>
            </div>
            <div className="flex justify-between">
              <dt>AI status</dt>
              <dd className="text-foreground font-semibold">Monitoring</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}

function phaseLabel(phase: HealPhase) {
  return {
    calm: "MESH STABLE",
    detect: "ANOMALY DETECTED",
    decide: "AGENT INVESTIGATING",
    remediate: "REMEDIATION EXECUTING",
    verified: "RECOVERY VERIFIED",
  }[phase];
}
