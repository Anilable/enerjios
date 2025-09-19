'use client'

import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, Box, Line, Html } from '@react-three/drei'
import { Geometry, Base, Addition, Subtraction } from '@react-three/csg'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Sun, Loader2 } from 'lucide-react'
import * as THREE from 'three'
import type { DesignerState } from '@/app/dashboard/designer/page'

interface Designer3DProps {
  designerState: DesignerState
  updateDesignerState: (updates: Partial<DesignerState>) => void
  showLayers: {
    roof: boolean
    panels: boolean
    shadows: boolean
    measurements: boolean
  }
}

// Enhanced 3D House Component with CSG for better roof-wall integration
function House3D({ roofPoints, showRoof }: { roofPoints: Array<{ x: number; y: number; z: number }>, showRoof: boolean }) {
  const houseRef = useRef<THREE.Group>(null)

  if (!showRoof) return null

  // House dimensions
  const houseWidth = 12
  const houseDepth = 8
  const houseHeight = 3
  const roofHeight = 2.5

  // Calculate roof angles for south-facing orientation
  const roofAngle = Math.PI / 6 // 30 degrees for optimal solar panel angle

  return (
    <group ref={houseRef}>
      {/* Main House Structure */}
      <group>
        {/* House Walls */}
        <Box args={[houseWidth, houseHeight, houseDepth]} position={[0, houseHeight/2, 0]}>
          <meshLambertMaterial
            color="#f5f5dc"
            transparent
            opacity={0.9}
          />
        </Box>

        {/* House Foundation */}
        <Box args={[houseWidth + 0.5, 0.3, houseDepth + 0.5]} position={[0, 0.15, 0]}>
          <meshLambertMaterial color="#696969" />
        </Box>

        {/* Windows */}
        {[-3, 3].map((x, i) => (
          <Box key={`window-front-${i}`} args={[1.5, 1.2, 0.1]} position={[x, houseHeight/2 + 0.3, houseDepth/2 + 0.05]}>
            <meshLambertMaterial color="#87ceeb" transparent opacity={0.7} />
          </Box>
        ))}

        {/* Door */}
        <Box args={[1, 2, 0.1]} position={[0, 1, houseDepth/2 + 0.05]}>
          <meshLambertMaterial color="#8b4513" />
        </Box>
      </group>

      {/* Super Simple Flat Roof - just a box! */}
      <Box args={[houseWidth + 0.5, 0.3, houseDepth + 0.5]} position={[0, houseHeight + 0.15, 0]}>
        <meshLambertMaterial color="#cd853f" />
      </Box>

      {/* Chimney - positioned on flat roof */}
      <Box args={[0.8, 1.5, 0.8]} position={[houseWidth/3, houseHeight + 0.3 + 0.75, 0]}>
        <meshLambertMaterial color="#8b0000" />
      </Box>

      {/* Roof Area Label */}
      <Html position={[0, houseHeight + 1, -2]} center>
        <div className="bg-white/90 px-3 py-2 rounded-lg text-sm font-medium shadow-lg border">
          <div className="text-center">
            <div className="font-bold text-primary">Düz Çatı</div>
            <div className="text-xs text-gray-600 mt-1">
              {(houseWidth * houseDepth).toFixed(0)} m² Solar Alan
            </div>
            <div className="text-xs text-green-600 mt-1">
              ⭐ Optimal Güneş Konumu
            </div>
          </div>
        </div>
      </Html>

      {/* Compass indicator */}
      <Html position={[houseWidth/2 + 2, houseHeight + 1, 0]} center>
        <div className="bg-primary text-white px-2 py-1 rounded text-xs font-bold">
          🧭 G
        </div>
      </Html>
    </group>
  )
}

// 3D Solar Panel Component
function SolarPanel3D({ 
  position, 
  rotation = [0, 0, 0], 
  panelType = 'JINKO_540W',
  selected = false,
  onClick 
}: { 
  position: [number, number, number]
  rotation?: [number, number, number]
  panelType?: string
  selected?: boolean
  onClick?: () => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (groupRef.current && selected) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })

  const panelWidth = 2.27
  const panelLength = 1.13
  const panelHeight = 0.04

  return (
    <group 
      ref={groupRef}
      position={position} 
      rotation={rotation}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Panel Frame */}
      <Box args={[panelWidth, panelHeight, panelLength]}>
        <meshStandardMaterial 
          color={selected ? "#4f46e5" : hovered ? "#6366f1" : "#1a365d"} 
          metalness={0.7}
          roughness={0.3}
        />
      </Box>
      
      {/* Solar Cells Grid */}
      {[...Array(12)].map((_, i) =>
        [...Array(6)].map((_, j) => (
          <Box
            key={`${i}-${j}`}
            args={[0.18, 0.01, 0.18]}
            position={[
              -panelWidth/2 + 0.2 + i * 0.19, 
              panelHeight/2 + 0.005, 
              -panelLength/2 + 0.1 + j * 0.19
            ]}
          >
            <meshStandardMaterial 
              color="#0f172a" 
              metalness={0.9}
              roughness={0.1}
            />
          </Box>
        ))
      )}
      
      {/* Panel Info */}
      {(selected || hovered) && (
        <Html position={[0, 0.2, 0]} center>
          <div className="bg-primary text-white px-2 py-1 rounded text-xs font-medium shadow-lg">
            {panelType.replace('_', ' ')} • 540W
          </div>
        </Html>
      )}
    </group>
  )
}

// Enhanced Shadow Analysis Component
function ShadowAnalysis({ showShadows, sunAngle = 45, time = 12 }: { showShadows: boolean, sunAngle?: number, time?: number }) {
  if (!showShadows) return null

  // Calculate shadow parameters based on sun position and house dimensions
  const houseWidth = 12
  const houseDepth = 8
  const houseHeight = 3
  const roofHeight = 2.5
  const totalHeight = houseHeight + roofHeight

  // Calculate shadow length based on sun angle
  const shadowLength = totalHeight / Math.tan((sunAngle * Math.PI) / 180)

  // Calculate shadow direction based on time of day
  const sunAzimuth = ((time - 12) / 12) * Math.PI // Sun moves east to west
  const shadowOffsetX = Math.sin(sunAzimuth) * shadowLength
  const shadowOffsetZ = Math.cos(sunAzimuth) * shadowLength

  return (
    <group>
      {/* House shadow */}
      <mesh
        position={[shadowOffsetX, 0.02, shadowOffsetZ]}
        rotation={[-Math.PI / 2, sunAzimuth, 0]}
      >
        <planeGeometry args={[houseWidth * 1.2, shadowLength]} />
        <meshBasicMaterial
          color="#1a1a1a"
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Roof shadow (more pronounced) */}
      <mesh
        position={[shadowOffsetX * 0.8, 0.03, shadowOffsetZ * 0.8]}
        rotation={[-Math.PI / 2, sunAzimuth, 0]}
      >
        <planeGeometry args={[houseWidth * 0.8, shadowLength * 0.7]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Chimney shadow */}
      <mesh
        position={[houseWidth/3 + shadowOffsetX * 0.6, 0.04, shadowOffsetZ * 0.6]}
        rotation={[-Math.PI / 2, sunAzimuth, 0]}
      >
        <planeGeometry args={[0.8, shadowLength * 0.4]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Shadow info */}
      <Html position={[shadowOffsetX + 2, 0.5, shadowOffsetZ]} center>
        <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
          Saat {time}:00 Gölgesi
        </div>
      </Html>
    </group>
  )
}

// Sun Position Indicator
function SunIndicator({ time = 12 }: { time?: number }) {
  const sunRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (sunRef.current) {
      const angle = (time / 24) * Math.PI * 2 - Math.PI / 2
      sunRef.current.position.x = Math.cos(angle) * 20
      sunRef.current.position.y = Math.sin(angle) * 10 + 10
      sunRef.current.position.z = 0
    }
  })

  return (
    <mesh ref={sunRef}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color="#fbbf24" />
    </mesh>
  )
}

// Camera Controls
function CameraControls() {
  const { camera, gl } = useThree()
  
  useEffect(() => {
    camera.position.set(15, 10, 15)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return (
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      maxPolarAngle={Math.PI / 2.1}
      minDistance={5}
      maxDistance={50}
    />
  )
}

// Main 3D Scene
interface Scene3DProps extends Designer3DProps {
  sunTime: number
  selectedPanel: string | null
  setSelectedPanel: (id: string | null) => void
}

function Scene3D({ designerState, updateDesignerState, showLayers, sunTime, selectedPanel, setSelectedPanel }: Scene3DProps) {
  const handlePanelClick = (panelId: string) => {
    setSelectedPanel(panelId === selectedPanel ? null : panelId)
  }

  return (
    <>
      {/* Enhanced Lighting */}
      <ambientLight intensity={0.4} color="#ffffff" />

      {/* Main directional light (sun) */}
      <directionalLight
        position={[20, 25, -10]}
        intensity={1.2}
        color="#ffeaa7"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      {/* Sky hemisphere light */}
      <hemisphereLight
        args={["#87ceeb", "#8fbc8f", 0.6]}
      />

      {/* Rim lighting for depth */}
      <directionalLight
        position={[-15, 10, 15]}
        intensity={0.3}
        color="#74b9ff"
      />

      {/* Grid */}
      <Grid 
        args={[50, 50]} 
        position={[0, -0.01, 0]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#e5e7eb"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#9ca3af"
        fadeDistance={30}
        fadeStrength={1}
      />

      {/* House with South-Facing Roof */}
      {showLayers.roof && (
        <House3D
          roofPoints={designerState.roofPoints}
          showRoof={true}
        />
      )}

      {/* Solar Panels */}
      {showLayers.panels && designerState.panels.map((panel) => (
        <SolarPanel3D
          key={panel.id}
          position={[panel.position.x, panel.position.y, panel.position.z]} // Use exact panel position
          rotation={[panel.rotation.x, panel.rotation.y, panel.rotation.z]} // Use panel rotation
          panelType={panel.type}
          selected={selectedPanel === panel.id}
          onClick={() => handlePanelClick(panel.id)}
        />
      ))}

      {/* Shadow Analysis */}
      {showLayers.shadows && (
        <ShadowAnalysis
          showShadows={true}
          sunAngle={45}
          time={sunTime}
        />
      )}

      {/* Sun Position */}
      <SunIndicator time={sunTime} />

      {/* Camera Controls */}
      <CameraControls />

      {/* Enhanced Ground Plane */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshLambertMaterial color="#4ade80" transparent opacity={0.3} />
      </mesh>

      {/* Property boundary indication */}
      <Line
        points={[
          [-20, 0, -15], [20, 0, -15], [20, 0, 15], [-20, 0, 15], [-20, 0, -15]
        ]}
        color="#6b7280"
        lineWidth={2}
        dashed
        dashScale={2}
        gapSize={1}
      />
    </>
  )
}

export function Designer3D(props: Designer3DProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [sunTime, setSunTime] = useState(14) // Start at 2 PM for good lighting
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const addPanel = (position: [number, number, number]) => {
    // Simple flat roof positioning
    const houseHeight = 3
    const roofThickness = 0.3
    const adjustedY = houseHeight + roofThickness + 0.1 // Just above flat roof

    const newPanel = {
      id: `panel_${Date.now()}`,
      position: { x: position[0], y: adjustedY, z: position[2] },
      rotation: { x: 0, y: 0, z: 0 }, // Flat - no angle
      type: 'JINKO_540W',
      power: 540
    }

    props.updateDesignerState({
      panels: [...props.designerState.panels, newPanel]
    })
  }

  const autoArrangePanels = () => {
    const panelWidth = 1
    const panelHeight = 2
    const spacing = 0.2
    const houseWidth = 12
    const houseDepth = 8
    const roofWidth = houseWidth - 1 // Leave margin
    const roofDepth = houseDepth - 1 // Leave margin

    const cols = Math.floor(roofWidth / (panelWidth + spacing))
    const rows = Math.floor(roofDepth / (panelHeight + spacing))

    const newPanels = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = -roofWidth/2 + col * (panelWidth + spacing) + panelWidth/2
        const z = -roofDepth/2 + row * (panelHeight + spacing) + panelHeight/2
        const y = 3 + 0.3 + 0.1 // houseHeight + roofThickness + margin

        newPanels.push({
          id: `panel_auto_${row}_${col}`,
          position: { x, y, z },
          rotation: { x: 0, y: 0, z: 0 }, // Flat panels
          type: 'JINKO_540W',
          power: 540
        })
      }
    }

    props.updateDesignerState({
      panels: newPanels
    })
  }

  const clearPanels = () => {
    props.updateDesignerState({
      panels: []
    })
  }

  return (
    <div className="w-full h-full relative bg-gradient-to-b from-sky-100 to-green-50">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">3D Sahne Yükleniyor...</p>
            <p className="text-sm text-gray-600">Çatı modelleme araçları hazırlanıyor</p>
          </div>
        </div>
      ) : (
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }>
          <Canvas
            camera={{ position: [15, 10, 15], fov: 50 }}
            shadows
            onCreated={(state) => {
              state.gl.setClearColor('#f0f9ff')
            }}
          >
            <Scene3D
              {...props}
              sunTime={sunTime}
              selectedPanel={selectedPanel}
              setSelectedPanel={setSelectedPanel}
            />
          </Canvas>
        </Suspense>
      )}

      {/* 3D Controls Overlay */}
      {!isLoading && (
        <div className="absolute bottom-4 left-4 flex flex-col space-y-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/90 hover:bg-white"
            onClick={() => setSunTime(sunTime >= 18 ? 8 : sunTime + 2)}
          >
            <Sun className="w-3 h-3 mr-2" />
            Saat: {sunTime}:00
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-white/90 hover:bg-white"
            onClick={() => addPanel([0, 3.5, -2])}
          >
            🔋 Panel Ekle
          </Button>
          <Button
            size="sm"
            variant="default"
            className="bg-primary/90 hover:bg-primary"
            onClick={autoArrangePanels}
          >
            ✨ Otomatik Yerleştir
          </Button>
          {props.designerState.panels.length > 0 && (
            <Button
              size="sm"
              variant="destructive"
              className="bg-red-500/90 hover:bg-red-500"
              onClick={clearPanels}
            >
              🗑 Temizle
            </Button>
          )}
        </div>
      )}

      {/* View Information */}
      <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-3 text-sm max-w-xs">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="font-medium">3D Güneş Evi Tasarımı</span>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <div>🏠 Güney yönlü optimum çatı</div>
          <div>☀️ Gerçek zaman gölge analizi</div>
          <div>🔄 Farenizi hareket ettirin</div>
        </div>
        <div className="mt-2 p-2 bg-green-50 rounded text-xs">
          <div className="font-medium text-green-800">Panel Alanı:</div>
          <div className="text-green-600">Güney çatı - 65 m²</div>
        </div>
      </div>
    </div>
  )
}