import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import SiloUnit from "./components/SiloUnit";
import ColorLegend from "./components/ColorLegend";
import CollectionBin from "./components/CollectionBin";

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
      </div>

      <Canvas shadows camera={{ position: [0, 4, 18], fov: 60 }}>
        <color attach="background" args={["#0f0f1e"]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <gridHelper
          args={[40, 40, "#444444", "#222222"]}
          position={[0, -6, 0]}
        />

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

        {/* Collection Bin positioned below all silos */}
        <CollectionBin
          position={[0, -4.5, 0]}
          width={18}
          height={3}
          depth={6}
          wallThickness={0.2}
        />

        {/* DEBUG: Red Box to test visibility */}
        <mesh position={[0, -2, 5]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="red" />
        </mesh>

        <OrbitControls target={[0, -2, 0]} />
      </Canvas>
    </div>
  );
}
