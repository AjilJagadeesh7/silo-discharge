import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import SiloUnit from "./components/SiloUnit";
import ColorLegend from "./components/ColorLegend";

type SimulationMode = "idle" | "discharging";

export default function App() {
  const [mode, setMode] = useState<SimulationMode>("idle");
  const [resetTrigger, setResetTrigger] = useState(0);
  const [flowSpeed, setFlowSpeed] = useState(0.45);

  // Define layer configurations for each silo
  // Each silo has completely unique colors with no overlap
  const silo1Layers = 3;
  const [silo1Colors, setSilo1Colors] = useState([
    "#FFD700",
    "#FF6B35",
    "#4ECDC4",
  ]); // Gold, Orange, Teal

  const silo2Layers = 3;
  const [silo2Colors, setSilo2Colors] = useState([
    "#F38181",
    "#9B59B6",
    "#3498DB",
  ]); // Pink, Purple, Blue

  const silo3Layers = 3;
  const [silo3Colors, setSilo3Colors] = useState([
    "#2ECC71",
    "#E74C3C",
    "#F39C12",
  ]); // Green, Coral, Amber

  const pileContainerWidth = 13.5;
  const pileContainerDepth = 4.2;
  const pileContainerHeight = 3.2;
  const pileContainerY = -1.4;

  // Merge all colors for the legend
  const allColors = [...silo1Colors, ...silo2Colors, ...silo3Colors];

  // Handle color change from the color picker
  const handleColorChange = (index: number, newColor: string) => {
    if (index < 3) {
      // Silo 1 colors (lots 0-2)
      const newColors = [...silo1Colors];
      newColors[index] = newColor;
      setSilo1Colors(newColors);
    } else if (index < 6) {
      // Silo 2 colors (lots 3-5)
      const newColors = [...silo2Colors];
      newColors[index - 3] = newColor;
      setSilo2Colors(newColors);
    } else {
      // Silo 3 colors (lots 6-8)
      const newColors = [...silo3Colors];
      newColors[index - 6] = newColor;
      setSilo3Colors(newColors);
    }
  };

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
          width: 300,
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
            setFlowSpeed(0.45);
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

        <ColorLegend allColors={allColors} onColorChange={handleColorChange} />

        <div
          style={{
            marginTop: 10,
            padding: "10px",
            background: "rgba(0, 0, 0, 0.5)",
            borderRadius: "5px",
            border: "1px solid #4ECDC4",
            textAlign: "center",
          }}
        >
          Discharge is 33.3%
        </div>
      </div>

      <Canvas camera={{ position: [8, 3, 10], fov: 60 }}>
        <color attach="background" args={["#0f0f1e"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} />

        <mesh position={[0, pileContainerY, 0]}>
          <boxGeometry
            args={[pileContainerWidth, pileContainerHeight, pileContainerDepth]}
          />
          <meshStandardMaterial
            color="#9aa0a6"
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Three silos positioned side by side */}
        <SiloUnit
          position={[-5, 0, 0]}
          mode={mode}
          resetTrigger={resetTrigger}
          flowSpeed={flowSpeed}
          layers={silo1Layers}
          layerColors={silo1Colors}
          onDischargeComplete={() => setMode("idle")}
        />
        <SiloUnit
          position={[0, 0, 0]}
          mode={mode}
          resetTrigger={resetTrigger}
          flowSpeed={flowSpeed}
          layers={silo2Layers}
          layerColors={silo2Colors}
        />
        <SiloUnit
          position={[5, 0, 0]}
          mode={mode}
          resetTrigger={resetTrigger}
          flowSpeed={flowSpeed}
          layers={silo3Layers}
          layerColors={silo3Colors}
        />

        <OrbitControls />
      </Canvas>
    </div>
  );
}
