'use client'

import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, Box, Line, Text, Html } from '@react-three/drei'
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

// 3D Roof Component
function Roof3D({ roofPoints, showRoof }: { roofPoints: Array<{ x: number; y: number; z: number }>, showRoof: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  if (!showRoof) return null

  // Default rectangular roof if no points defined
  const defaultRoof = [
    { x: -5, y: 0, z: -6 },
    { x: 5, y: 0, z: -6 },
    { x: 5, y: 0, z: 6 },
    { x: -5, y: 0, z: 6 }
  ]

  const points = roofPoints.length > 0 ? roofPoints : defaultRoof

  return (
    <group>
      {/* Roof Surface */}
      <mesh ref={meshRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 12]} />
        <meshLambertMaterial 
          color="#8b4513" 
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Roof Edges */}
      <Line
        points={[
          ...points.map(p => [p.x, p.y + 0.01, p.z] as [number, number, number]),
          [points[0].x, points[0].y + 0.01, points[0].z] as [number, number, number] // Close the loop
        ]}
        color="#654321"
        lineWidth={3}
      />
      
      {/* Roof Area Label */}
      <Html position={[0, 0.1, 0]} center>
        <div className="bg-white/90 px-2 py-1 rounded text-xs font-medium shadow-sm">
          120 m² Çatı Alanı
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

// Shadow Analysis Component
function ShadowAnalysis({ showShadows, sunAngle = 45 }: { showShadows: boolean, sunAngle?: number }) {
  if (!showShadows) return null

  const shadowLength = 5
  const shadowPositions = [
    [2, 0.01, 2],
    [2, 0.01, -2],
    [-2, 0.01, 2],
    [-2, 0.01, -2],
  ]

  return (
    <group>
      {shadowPositions.map((pos, index) => (
        <mesh key={index} position={pos as [number, number, number]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1, shadowLength]} />
          <meshBasicMaterial 
            color="#000000" 
            transparent 
            opacity={0.3}
          />
        </mesh>
      ))}
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
function Scene3D({ designerState, updateDesignerState, showLayers }: Designer3DProps) {
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null)
  const [sunTime, setSunTime] = useState(12)

  const handlePanelClick = (panelId: string) => {
    setSelectedPanel(panelId === selectedPanel ? null : panelId)
  }

  const addPanel = (position: [number, number, number]) => {
    const newPanel = {
      id: `panel_${Date.now()}`,
      position: { x: position[0], y: position[1], z: position[2] },
      rotation: { x: 0, y: 0, z: 0 },
      type: 'JINKO_540W',
      power: 540
    }

    updateDesignerState({
      panels: [...designerState.panels, newPanel]
    })
  }

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[20, 20, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#fbbf24" />

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

      {/* Roof */}
      {showLayers.roof && (
        <Roof3D 
          roofPoints={designerState.roofPoints} 
          showRoof={true}
        />
      )}

      {/* Solar Panels */}
      {showLayers.panels && designerState.panels.map((panel) => (
        <SolarPanel3D
          key={panel.id}
          position={[panel.position.x, panel.position.y + 0.1, panel.position.z]}
          rotation={[panel.rotation.x, panel.rotation.y, panel.rotation.z]}
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
        />
      )}

      {/* Sun Position */}
      <SunIndicator time={sunTime} />

      {/* Camera Controls */}
      <CameraControls />

      {/* Ground Plane */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshLambertMaterial color="#22c55e" transparent opacity={0.1} />
      </mesh>
    </>
  )
}

export function Designer3D(props: Designer3DProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

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
            <Scene3D {...props} />
          </Canvas>
        </Suspense>
      )}

      {/* 3D Controls Overlay */}
      {!isLoading && (
        <div className="absolute bottom-4 left-4 flex flex-col space-y-2">
          <Button size="sm" variant="outline" className="bg-white/90">
            <Sun className="w-3 h-3 mr-2" />
            Güneş Analizi
          </Button>
          <Button size="sm" variant="outline" className="bg-white/90">
            Panel Ekle
          </Button>
        </div>
      )}

      {/* View Information */}
      <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-3 text-sm">
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>3D Tasarım Modu</span>
        </div>
        <div className="text-xs text-gray-600">
          Farenizi hareket ettirin • Tekerleği çevirin • Sağ tıklayın
        </div>
      </div>
    </div>
  )
}