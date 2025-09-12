'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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

// Solar Energy Animation Component
function SolarEnergyAnimation() {
  const [timeOfDay, setTimeOfDay] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(prev => (prev + 0.5) % 360)
    }, 100)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Animated Sky Background */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{
          background: `linear-gradient(180deg, 
            ${timeOfDay < 180 
              ? `hsl(${200 + timeOfDay * 0.3}, 80%, ${85 - timeOfDay * 0.1}%)` 
              : `hsl(${220 + (timeOfDay - 180) * 0.2}, 70%, ${50 + (timeOfDay - 180) * 0.2}%)`
            } 0%, 
            ${timeOfDay < 180 
              ? `hsl(${40 + timeOfDay * 0.2}, 90%, ${90 - timeOfDay * 0.1}%)` 
              : `hsl(${30 + (timeOfDay - 180) * 0.1}, 80%, ${70 + (timeOfDay - 180) * 0.1}%)`
            } 40%,
            hsl(120, 60%, 85%) 100%)
          `
        }}
      />
      
      {/* Animated Clouds */}
      <div className="absolute inset-0">
        <div className="absolute top-16 animate-float-slow" style={{ left: '10%' }}>
          <div className="w-16 h-8 bg-white/70 rounded-full blur-sm" />
          <div className="w-12 h-6 bg-white/50 rounded-full blur-sm -mt-4 ml-8" />
        </div>
        <div className="absolute top-24 animate-float-delayed" style={{ left: '60%' }}>
          <div className="w-20 h-10 bg-white/60 rounded-full blur-sm" />
          <div className="w-14 h-7 bg-white/40 rounded-full blur-sm -mt-5 ml-10" />
        </div>
        <div className="absolute top-32 animate-float" style={{ left: '30%' }}>
          <div className="w-12 h-6 bg-white/80 rounded-full blur-sm" />
        </div>
      </div>
      
      {/* Animated Sun */}
      <div className="absolute top-12 right-16">
        <div className="relative">
          {/* Sun Glow */}
          <div className="absolute inset-0 w-20 h-20 bg-yellow-300 rounded-full blur-xl opacity-60 animate-pulse-slow" />
          <div className="absolute inset-0 w-16 h-16 bg-yellow-400 rounded-full blur-lg opacity-80 animate-pulse-medium" />
          
          {/* Sun Core */}
          <div className="relative w-12 h-12 bg-gradient-radial from-yellow-200 via-yellow-400 to-orange-500 rounded-full animate-rotate-slow shadow-lg">
            {/* Sun Rays */}
            <div className="absolute inset-0 animate-rotate-reverse">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-8 bg-gradient-to-t from-transparent via-yellow-400 to-transparent opacity-70"
                  style={{
                    top: '-16px',
                    left: '50%',
                    transformOrigin: '50% 40px',
                    transform: `translateX(-50%) rotate(${i * 45}deg)`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Light Beams from Sun to Panels */}
      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lightBeam1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#fbbf24', stopOpacity: 0.8}} />
              <stop offset="100%" style={{stopColor: '#f59e0b', stopOpacity: 0.3}} />
            </linearGradient>
            <linearGradient id="lightBeam2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#fbbf24', stopOpacity: 0.6}} />
              <stop offset="100%" style={{stopColor: '#f59e0b', stopOpacity: 0.2}} />
            </linearGradient>
          </defs>
          
          <path
            d="M 400 60 L 180 280 L 200 300 L 420 80 Z"
            fill="url(#lightBeam1)"
            className="animate-pulse-light"
          />
          <path
            d="M 410 70 L 260 250 L 280 270 L 430 90 Z"
            fill="url(#lightBeam2)"
            className="animate-pulse-light-delayed"
          />
        </svg>
      </div>
      
      {/* Solar Panels */}
      <div className="absolute bottom-20 left-8">
        <div className="relative">
          {/* Panel 1 */}
          <div className="relative w-32 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-lg transform -rotate-12 hover:scale-105 transition-transform duration-500">
            {/* Panel reflection */}
            <div className="absolute inset-1 bg-gradient-to-br from-blue-400/20 via-transparent to-yellow-400/30 rounded-md animate-shimmer" />
            {/* Solar cells grid */}
            <div className="absolute inset-2 grid grid-cols-6 gap-0.5">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="bg-slate-700 rounded-sm animate-cell-glow" style={{animationDelay: `${i * 0.1}s`}} />
              ))}
            </div>
          </div>
          
          {/* Panel 2 */}
          <div className="absolute top-4 left-16 w-28 h-18 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-lg transform -rotate-6 hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-1 bg-gradient-to-br from-blue-400/20 via-transparent to-yellow-400/30 rounded-md animate-shimmer-delayed" />
            <div className="absolute inset-2 grid grid-cols-5 gap-0.5">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="bg-slate-700 rounded-sm animate-cell-glow" style={{animationDelay: `${i * 0.15}s`}} />
              ))}
            </div>
          </div>
          
          {/* Panel 3 */}
          <div className="absolute top-8 left-32 w-24 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-lg transform rotate-3 hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-1 bg-gradient-to-br from-blue-400/20 via-transparent to-yellow-400/30 rounded-md animate-shimmer-slow" />
            <div className="absolute inset-2 grid grid-cols-4 gap-0.5">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="bg-slate-700 rounded-sm animate-cell-glow" style={{animationDelay: `${i * 0.2}s`}} />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Green Landscape with Parallax */}
      <div className="absolute bottom-0 w-full">
        {/* Back Hills */}
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-green-600 to-green-500 opacity-60" 
             style={{clipPath: 'polygon(0 100%, 20% 60%, 40% 80%, 60% 40%, 80% 70%, 100% 50%, 100% 100%)'}} />
        
        {/* Middle Hills */}
        <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-green-500 to-green-400 opacity-80 animate-parallax-slow"
             style={{clipPath: 'polygon(0 100%, 15% 70%, 35% 90%, 55% 50%, 75% 80%, 95% 60%, 100% 100%)'}} />
        
        {/* Front Ground */}
        <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-green-400 to-green-300 animate-parallax"
             style={{clipPath: 'polygon(0 100%, 25% 80%, 50% 90%, 75% 70%, 100% 85%, 100% 100%)'}} />
        
        {/* Grass Details */}
        <div className="absolute bottom-4 left-4 w-1 h-6 bg-green-600 rounded-t-full animate-sway" />
        <div className="absolute bottom-3 left-8 w-1 h-8 bg-green-700 rounded-t-full animate-sway-delayed" />
        <div className="absolute bottom-5 right-12 w-1 h-5 bg-green-500 rounded-t-full animate-sway-slow" />
        <div className="absolute bottom-2 right-20 w-1 h-7 bg-green-600 rounded-t-full animate-sway" />
      </div>
      
      {/* Energy Flow Particles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-energy-flow"
            style={{
              left: `${20 + i * 15}%`,
              top: `${60 + i * 5}%`,
              animationDelay: `${i * 0.8}s`
            }}
          />
        ))}
      </div>
    </div>
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
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-screen py-8 lg:py-0">
          
          {/* Left Content */}
          <div className="space-y-6 md:space-y-8 lg:space-y-10 text-center lg:text-left">
            {/* Premium CTA - Above the fold - Mobile First */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-6 md:mb-8 order-1">
              {/* Mobile sticky CTA for screens smaller than sm */}
              <div className="block sm:hidden fixed bottom-4 left-4 right-4 z-50">
                <Link href="/calculator">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-primary via-blue-600 to-orange-500 text-white px-6 py-5 text-lg font-bold shadow-3xl rounded-2xl border-2 border-white/20 w-full animate-pulse-cta relative overflow-hidden"
                  >
                    <Calculator className="w-5 h-5 mr-2 relative z-10" />
                    <span className="relative z-10">GES Hesapla & Giriş Yap</span>
                    <ArrowRight className="w-5 h-5 ml-2 relative z-10" />
                  </Button>
                </Link>
              </div>
              
              {/* Desktop CTA */}
              <div className="hidden sm:flex justify-center lg:justify-start w-full">
                <Link href="/calculator">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-primary via-blue-600 to-orange-500 hover:from-primary/90 hover:via-blue-700 hover:to-orange-600 text-white px-14 py-7 text-xl md:text-2xl font-bold shadow-3xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 rounded-2xl border-2 border-white/20 backdrop-blur-sm animate-pulse-cta relative overflow-hidden"
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
                    <Calculator className="w-7 h-7 mr-3 relative z-10" />
                    <span className="relative z-10">GES Hesapla & Giriş Yap</span>
                    <ArrowRight className="w-7 h-7 ml-3 relative z-10 animate-bounce" />
                  </Button>
                </Link>
              </div>
            </div>

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
                  Türkiye'nin Vizyonu
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
                Güneş enerjisi sistemleri ile elektrik faturanızı %90'a kadar azaltın. 
                Çiftçiler, ev sahipleri ve işletmeler için özel çözümlerle temiz enerjiye geçiş yapın.
              </p>
            </div>

            {/* Secondary CTA Buttons - Less prominent */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">              
              <Button 
                variant="ghost" 
                size="lg"
                className="text-primary hover:bg-primary/10 px-6 py-3 text-base font-medium transition-all duration-300"
                onClick={() => {
                  const calculatorSection = document.getElementById('calculator-section')
                  if (calculatorSection) {
                    calculatorSection.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
              >
                <FileSearch className="w-4 h-4 mr-2" />
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
              <div className="flex items-center justify-center lg:justify-start flex-wrap gap-3 opacity-60">
                <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                  <Sun className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-gray-700">Havensis</span>
                </div>
                <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">Hagel</span>
                </div>
                <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                  <Shield className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-gray-700">DMRTech</span>
                </div>
                <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                  <Sun className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-700">Tommatech</span>
                </div>
                <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-700">CW Enerji</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Solar Energy Animation */}
          <div className="lg:h-screen flex items-center justify-center">
            <div className="w-full max-w-lg h-96 lg:h-[600px] rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-b from-sky-200 to-green-200 relative">
              <SolarEnergyAnimation />
              
              {/* Interactive Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-sm font-medium bg-black/30 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span>Canlı Enerji Üretimi</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 font-bold">24.8 kW</span>
                  </div>
                </div>
              </div>
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