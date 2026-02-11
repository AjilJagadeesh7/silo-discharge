interface CollectionBinProps {
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
  wallThickness?: number;
}

export default function CollectionBin({
  position,
  width,
  height,
  depth,
  wallThickness = 0.2,
}: CollectionBinProps) {
  const floorY = -height / 2;
  const wallHeight = height;

  return (
    <group position={position}>
      {/* Floor */}
      <mesh position={[0, floorY, 0]} receiveShadow>
        <boxGeometry args={[width, wallThickness, depth]} />
        <meshStandardMaterial color="#cccccc" roughness={0.5} />
      </mesh>

      {/* Back Wall */}
      <mesh
        position={[0, 0, -depth / 2 + wallThickness / 2]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[width, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.5} />
      </mesh>

      {/* Front Wall */}
      <mesh
        position={[0, 0, depth / 2 - wallThickness / 2]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[width, wallHeight, wallThickness]} />
        <meshStandardMaterial
          color="#eeeeee"
          roughness={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Left Wall */}
      <mesh
        position={[-width / 2 + wallThickness / 2, 0, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[wallThickness, wallHeight, depth]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.5} />
      </mesh>

      {/* Right Wall */}
      <mesh
        position={[width / 2 - wallThickness / 2, 0, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[wallThickness, wallHeight, depth]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.5} />
      </mesh>
    </group>
  );
}
