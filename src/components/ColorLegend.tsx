interface ColorLegendProps {
  allColors: string[];
  onColorChange: (index: number, newColor: string) => void;
}

export default function ColorLegend({
  allColors,
  onColorChange,
}: ColorLegendProps) {
  return (
    <div
      style={{
        marginTop: 10,
        padding: 10,
        background: "rgba(255,255,255,0.05)",
        borderRadius: 5,
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: 8 }}>Lot Colors:</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {allColors.map((color, index) => (
          <div
            key={index}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <input
              type="color"
              value={color}
              onChange={(e) => onColorChange(index, e.target.value)}
              style={{
                width: 32,
                height: 32,
                border: "2px solid rgba(255,255,255,0.3)",
                borderRadius: 4,
                cursor: "pointer",
                padding: 0,
              }}
              title={`Lot ${index + 1}`}
            />
            <span style={{ fontSize: 10, opacity: 0.7 }}>Lot {index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
