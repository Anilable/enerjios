'use client'

import { useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Box } from '@react-three/drei'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  Sun, 
  Calculator, 
  FileSearch, 
  TrendingUp,
  Zap,
  Leaf,
  Shield
} from 'lucide-react'
import * as THREE from 'three'

// 3D Solar Panel Component
function SolarPanel({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group position={position} rotation={rotation}>
      {/* Solar Panel Base */}
      <Box ref={meshRef} args={[2, 0.1, 1.5]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a365d" />
      </Box>
      
      {/* Solar Cells */}
      {[...Array(6)].map((_, i) =>
        [...Array(4)].map((_, j) => (
          <Box
            key={`${i}-${j}`}
            args={[0.25, 0.02, 0.25]}
            position={[-0.75 + i * 0.3, 0.06, -0.5 + j * 0.3]}
          >
            <meshStandardMaterial color="#0f172a" />
          </Box>
        ))
      )}
      
      {/* Reflective surface */}
      <Box args={[1.9, 0.01, 1.4]} position={[0, 0.07, 0]}>
        <meshStandardMaterial 
          color="#1e293b" 
          transparent 
          opacity={0.8}
          roughness={0.1}
          metalness={0.8}
        />
      </Box>
    </group>
  )
}

// 3D Scene Component
function SolarScene() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#fbbf24" />
      
      {/* Multiple Solar Panels */}
      <SolarPanel position={[0, 0, 0]} rotation={[0, 0, 0]} />
      <SolarPanel position={[2.5, 0, -0.5]} rotation={[0, 0.2, 0]} />
      <SolarPanel position={[-2.5, 0, 0.5]} rotation={[0, -0.3, 0]} />
      
      {/* Sun representation */}
      <mesh position={[0, 4, -3]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshLambertMaterial color="#22c55e" opacity={0.8} transparent />
      </mesh>
    </group>
  )
}

export function HeroSection() {
  const [isCalculating, setIsCalculating] = useState(false)

  const stats = [
    { value: '500+', label: 'Tamamlanan Proje', icon: FileSearch },
    { value: '50MW+', label: 'Kurulu Güç', icon: Zap },
    { value: '₺2.4M+', label: 'Müşteri Tasarrufu', icon: TrendingUp },
    { value: '25 Yıl', label: 'Garanti', icon: Shield },
  ]

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.3)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.3)_0%,transparent_50%)]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-screen py-12 lg:py-0">
          
          {/* Left Content */}
          <div className="space-y-8 lg:space-y-10 text-center lg:text-left">
            {/* Badge */}
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium px-4 py-2 inline-flex items-center space-x-2"
            >
              <Leaf className="w-4 h-4" />
              <span>Güneş Enerjisi Yönetim Platformu</span>
            </Badge>

            {/* Headlines */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span className="text-primary">Güneşin Gücü,</span>
                <br />
                <span className="bg-gradient-to-r from-primary to-yellow-600 bg-clip-text text-transparent">
                  Trakya'nın Vizyonu
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
                Güneş enerjisi sistemleri ile elektrik faturanızı %90'a kadar azaltın. 
                Çiftçiler, ev sahipleri ve işletmeler için özel çözümlerle temiz enerjiye geçiş yapın.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/calculator">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Ücretsiz GES Analizi
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 text-lg font-medium transition-all duration-300"
                onClick={() => {
                  const calculatorSection = document.getElementById('calculator-section')
                  if (calculatorSection) {
                    calculatorSection.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
              >
                <FileSearch className="w-5 h-5 mr-2" />
                Hızlı Hesaplama
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Icon className="w-5 h-5 text-primary mr-2" />
                      <span className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Social Proof */}
            <div className="pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Güvenilir partnerleri:</p>
              <div className="flex items-center justify-center lg:justify-start space-x-6 opacity-60">
                <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                  <Sun className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-gray-700">Jinko Solar</span>
                </div>
                <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">Huawei</span>
                </div>
                <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                  <Shield className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-gray-700">SMA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: 3D Scene */}
          <div className="lg:h-screen flex items-center justify-center">
            <div className="w-full max-w-lg h-96 lg:h-[600px] rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-b from-sky-200 to-green-200">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-200 to-green-200">
                  <div className="text-center">
                    <Sun className="w-12 h-12 text-primary mx-auto animate-spin" />
                    <p className="text-sm text-gray-600 mt-2">3D sahne yükleniyor...</p>
                  </div>
                </div>
              }>
                <Canvas
                  camera={{ position: [5, 5, 10], fov: 50 }}
                  shadows
                >
                  <SolarScene />
                  <OrbitControls 
                    enablePan={false} 
                    enableZoom={false}
                    maxPolarAngle={Math.PI / 2.2}
                    minPolarAngle={Math.PI / 4}
                  />
                </Canvas>
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 right-10 w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
      <div className="absolute top-32 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 right-20 w-4 h-4 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />
    </section>
  )
}