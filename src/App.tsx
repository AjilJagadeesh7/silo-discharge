import { useState, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

type SimulationMode = "idle" | "discharging";

interface Particle {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  layer: number;
  initialPosition: THREE.Vector3;
}

interface ParticlesProps {
  mode: SimulationMode;
  resetTrigger: number;
  flowSpeed: number;
}

const LAYER_COLORS = ["#FFD700", "#FF6B35", "#4ECDC4", "#f8f8f8", "#F38181"];

function Particles({ mode, resetTrigger, flowSpeed }: ParticlesProps) {
  const PARTICLES_PER_LAYER = 6000;
  const LAYERS = 5;

  const SILO_RADIUS = 1.5;
  const CONE_HEIGHT = 1.5;
  const OUTLET_RADIUS = 0.12;

  const coneBottom = -CONE_HEIGHT;
  const OUTLET_EXIT_Y = coneBottom - 0.05;
  const KILL_Y = coneBottom - 2.0;

  // 🔧 Layer realism tuning
  const LAYER_HEIGHT = 0.75;
  const LAYER_MIX_RATIO = 0.4; //vertical mixing ratio
  const MIX_OFFSET = LAYER_HEIGHT * LAYER_MIX_RATIO;

  const [particles] = useState<Particle[]>(() => {
    const arr: Particle[] = [];

    const MIN_Y = coneBottom;
    const MAX_Y = coneBottom + LAYERS * LAYER_HEIGHT;

    for (let layer = 0; layer < LAYERS; layer++) {
      const layerBottomY = coneBottom + layer * LAYER_HEIGHT;

      for (let i = 0; i < PARTICLES_PER_LAYER; i++) {
        let y =
          layerBottomY +
          Math.random() * LAYER_HEIGHT +
          (Math.random() * 2 - 1) * MIX_OFFSET;

        // clamp vertical spill
        y = Math.max(MIN_Y, Math.min(MAX_Y, y));

        let maxRadius;
        if (y < 0) {
          const h = y - coneBottom;
          maxRadius =
            OUTLET_RADIUS + (h / CONE_HEIGHT) * (SILO_RADIUS - OUTLET_RADIUS);
        } else {
          maxRadius = SILO_RADIUS;
        }

        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * (maxRadius - 0.03);
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;

        const pos = new THREE.Vector3(x, y, z);

        arr.push({
          id: layer * PARTICLES_PER_LAYER + i,
          position: pos.clone(),
          velocity: new THREE.Vector3(),
          layer,
          initialPosition: pos.clone(),
        });
      }
    }

    return arr;
  });

  const instancedMeshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const temp = useMemo(() => new THREE.Object3D(), []);
  const prevReset = useRef(resetTrigger);

  useFrame((_, delta) => {
    const GRAVITY = -3.4 * flowSpeed;

    if (prevReset.current !== resetTrigger) {
      particles.forEach((p) => {
        p.position.copy(p.initialPosition);
        p.velocity.set(0, 0, 0);
      });
      prevReset.current = resetTrigger;
    }

    particles.forEach((p) => {
      const isOutsideSilo = p.position.y < OUTLET_EXIT_Y;

      if (mode !== "discharging" && !isOutsideSilo) {
        p.velocity.set(0, 0, 0);
        return;
      }

      p.velocity.y += GRAVITY * delta;

      if (p.position.y < OUTLET_EXIT_Y) {
        p.velocity.x = 0;
        p.velocity.z = 0;
        p.position.addScaledVector(p.velocity, delta * flowSpeed);

        if (p.position.y < KILL_Y) {
          p.position.set(0, -1000, 0);
          p.velocity.set(0, 0, 0);
        }
        return;
      }

      const r = Math.hypot(p.position.x, p.position.z);

      let activeRadius;
      if (p.position.y < 0) {
        const h = p.position.y - coneBottom;
        activeRadius = OUTLET_RADIUS + (h / CONE_HEIGHT) * 0.18;
      } else {
        activeRadius = 0.35;
      }

      const heightBias = Math.max(
        0.45,
        1.25 - (p.position.y - coneBottom) / 3.0,
      );

      const zoneFactor = r < activeRadius ? 1.0 : r < 0.9 ? 0.45 : 0.25;

      p.velocity.multiplyScalar(0.9 + zoneFactor * 0.08);

      if (p.position.y < 0) {
        const pull = 0.6 * heightBias * flowSpeed;
        p.velocity.x -= p.position.x * pull * delta;
        p.velocity.z -= p.position.z * pull * delta;
      }

      p.position.addScaledVector(p.velocity, delta * flowSpeed);

      const dist = Math.hypot(p.position.x, p.position.z);
      let maxR;
      if (p.position.y < 0) {
        const h = p.position.y - coneBottom;
        maxR =
          OUTLET_RADIUS + (h / CONE_HEIGHT) * (SILO_RADIUS - OUTLET_RADIUS);
      } else {
        maxR = SILO_RADIUS;
      }

      if (dist > maxR - 0.02) {
        const s = (maxR - 0.02) / dist;
        p.position.x *= s;
        p.position.z *= s;
        p.velocity.x *= 0.5;
        p.velocity.z *= 0.5;
      }
    });

    for (let layer = 0; layer < LAYERS; layer++) {
      const mesh = instancedMeshRefs.current[layer];
      if (!mesh) continue;

      let idx = 0;
      particles.forEach((p) => {
        if (p.layer === layer) {
          temp.position.copy(p.position);
          temp.updateMatrix();
          mesh.setMatrixAt(idx++, temp.matrix);
        }
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {Array.from({ length: LAYERS }).map((_, layer) => (
        <instancedMesh
          key={layer}
          ref={(r) => (instancedMeshRefs.current[layer] = r)}
          args={[undefined, undefined, PARTICLES_PER_LAYER]}
        >
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color={LAYER_COLORS[layer]} />
        </instancedMesh>
      ))}
    </group>
  );
}

function Silo() {
  const SILO_RADIUS = 1.5;
  const CYLINDER_HEIGHT = 3.0;
  const CONE_HEIGHT = 1.5;
  const OUTLET_RADIUS = 0.2;

  return (
    <group>
      <mesh position={[0, CYLINDER_HEIGHT / 2, 0]}>
        <cylinderGeometry
          args={[SILO_RADIUS, SILO_RADIUS, CYLINDER_HEIGHT, 32]}
        />
        <meshStandardMaterial
          color="#dddddd"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, -CONE_HEIGHT / 2 + 0.05, 0]}>
        <cylinderGeometry
          args={[SILO_RADIUS, OUTLET_RADIUS, CONE_HEIGHT, 32]}
        />
        <meshStandardMaterial
          color="#cccccc"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default function App() {
  const [mode, setMode] = useState<SimulationMode>("idle");
  const [resetTrigger, setResetTrigger] = useState(0);
  const [flowSpeed, setFlowSpeed] = useState(0.7);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#1a1a2e" }}>
      <div
        style={{
          position: "absolute",
          zIndex: 1,
          top: 20,
          left: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          color: "white",
        }}
      >
        <button
          onClick={() =>
            setMode(mode === "discharging" ? "idle" : "discharging")
          }
        >
          {mode === "discharging" ? "Stop" : "Start"} Discharge
        </button>

        <button
          onClick={() => {
            setMode("idle");
            setFlowSpeed(0.7);
            setResetTrigger((v) => v + 1);
          }}
        >
          Reset
        </button>

        <label>
          Flow speed: {flowSpeed.toFixed(2)}
          <input
            type="range"
            min={0.3}
            max={1.5}
            step={0.05}
            value={flowSpeed}
            onChange={(e) => setFlowSpeed(Number(e.target.value))}
          />
        </label>
      </div>

      <Canvas camera={{ position: [5, 2, 6], fov: 50 }}>
        <color attach="background" args={["#0f0f1e"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} />
        <Silo />
        <Particles
          mode={mode}
          resetTrigger={resetTrigger}
          flowSpeed={flowSpeed}
        />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
