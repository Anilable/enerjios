'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sun,
  FileSearch,
  TrendingUp,
  Zap,
  Leaf,
  Shield,
  Calculator
} from 'lucide-react'

// Solar Energy Animation Component
interface SolarEnergyAnimationProps {
  currentTime: Date
  isLowPerformance: boolean
  turkeyTime: Date
  hours: number
  minutes: number
  totalMinutes: number
  isDaytime: boolean
  isDeepNight: boolean
  isEvening: boolean
  isSunrise: boolean
  isSunset: boolean
  isNight: boolean
  panelEfficiency: number
}

function SolarEnergyAnimation({
  currentTime,
  isLowPerformance,
  turkeyTime,
  hours,
  minutes,
  totalMinutes,
  isDaytime,
  isDeepNight,
  isEvening,
  isSunrise,
  isSunset,
  isNight,
  panelEfficiency
}: SolarEnergyAnimationProps) {
  // Sun position calculation (east to west, 6am to 6pm)
  const sunProgress = isDaytime ? Math.max(0, Math.min(1, (totalMinutes - 360) / 720)) : 0
  const sunX = 10 + (sunProgress * 80) // Move from 10% to 90% across screen
  const sunY = 10 + Math.sin(sunProgress * Math.PI) * 20 // Arc motion

  // Enhanced sky color calculations with improved time phases
  const getSkyColors = () => {
    if (isDeepNight) {
      // Deep night colors (00:00-06:00) - very dark with stars
      return {
        top: 'hsl(240, 80%, 8%)',      // Very dark navy
        middle: 'hsl(230, 70%, 15%)',   // Dark blue
        bottom: 'hsl(220, 60%, 25%)'    // Slightly lighter at horizon
      }
    } else if (isSunrise) {
      // Sunrise colors (05:00-08:00) - warm oranges and pinks
      return {
        top: 'hsl(15, 80%, 70%)',      // Warm orange
        middle: 'hsl(30, 90%, 80%)',    // Light orange
        bottom: 'hsl(200, 60%, 85%)'   // Light blue horizon
      }
    } else if (isDaytime) {
      // Daytime colors (06:00-18:00) - bright blues
      return {
        top: 'hsl(210, 80%, 75%)',     // Bright blue
        middle: 'hsl(200, 70%, 85%)',   // Light blue
        bottom: 'hsl(120, 60%, 85%)'   // Green horizon
      }
    } else if (isSunset || isEvening) {
      // Sunset/evening colors (17:00-22:00) - deep oranges and purples
      return {
        top: 'hsl(280, 60%, 40%)',     // Purple
        middle: 'hsl(20, 90%, 70%)',    // Orange
        bottom: 'hsl(50, 80%, 80%)'    // Yellow horizon
      }
    } else {
      // Night colors (22:00-24:00) - dark blues and purples
      return {
        top: 'hsl(240, 70%, 15%)',     // Dark navy
        middle: 'hsl(230, 60%, 25%)',   // Medium blue
        bottom: 'hsl(220, 50%, 35%)'   // Lighter blue at horizon
      }
    }
  }

  const skyColors = getSkyColors()

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Animated Sky Background */}
      <div
        className={`absolute inset-0 transition-all ${isLowPerformance ? 'duration-[10s]' : 'duration-[5s]'} ease-in-out`}
        style={{
          background: `linear-gradient(180deg,
            ${skyColors.top} 0%,
            ${skyColors.middle} 40%,
            ${skyColors.bottom} 100%)
          `
        }}
      />
      
      {/* Stars (only visible during deep night and regular night) */}
      {(isDeepNight || isNight) && (
        <div className="absolute inset-0">
          {[...Array(isDeepNight ? 30 : 20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 60}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: 0.4 + Math.random() * 0.6
              }}
            />
          ))}
        </div>
      )}

      {/* Moon (only visible during deep night and regular night) */}
      {(isDeepNight || isNight) && (
        <div className="absolute top-16 right-20">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-radial from-gray-100 to-gray-300 rounded-full shadow-lg opacity-90">
              {/* Moon craters */}
              <div className="absolute top-2 left-3 w-2 h-2 bg-gray-400 rounded-full opacity-40" />
              <div className="absolute top-6 right-2 w-1.5 h-1.5 bg-gray-400 rounded-full opacity-30" />
              <div className="absolute bottom-3 left-5 w-1 h-1 bg-gray-400 rounded-full opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Animated Clouds */}
      <div className="absolute inset-0">
        <div
          className={`absolute top-16 ${isLowPerformance ? '' : 'animate-float-slow'}`}
          style={{
            left: '10%',
            opacity: (isDeepNight || isNight) ? 0.2 : 0.7,
            transform: isLowPerformance ? 'translateX(20px)' : undefined
          }}
        >
          <div className={`w-16 h-8 ${(isDeepNight || isNight) ? 'bg-gray-500/20' : 'bg-white/70'} rounded-full blur-sm`} />
          <div className={`w-12 h-6 ${(isDeepNight || isNight) ? 'bg-gray-500/15' : 'bg-white/50'} rounded-full blur-sm -mt-4 ml-8`} />
        </div>
        <div
          className={`absolute top-24 ${isLowPerformance ? '' : 'animate-float-delayed'}`}
          style={{
            left: '60%',
            opacity: (isDeepNight || isNight) ? 0.15 : 0.6,
            transform: isLowPerformance ? 'translateX(-15px)' : undefined
          }}
        >
          <div className={`w-20 h-10 ${isNight ? 'bg-gray-500/25' : 'bg-white/60'} rounded-full blur-sm`} />
          <div className={`w-14 h-7 ${isNight ? 'bg-gray-500/15' : 'bg-white/40'} rounded-full blur-sm -mt-5 ml-10`} />
        </div>
        <div
          className={`absolute top-32 ${isLowPerformance ? '' : 'animate-float'}`}
          style={{
            left: '30%',
            opacity: (isDeepNight || isNight) ? 0.3 : 0.8,
            transform: isLowPerformance ? 'translateX(10px)' : undefined
          }}
        >
          <div className={`w-12 h-6 ${isNight ? 'bg-gray-400/40' : 'bg-white/80'} rounded-full blur-sm`} />
        </div>
      </div>

      {/* Animated Sun (only visible during day) */}
      {(isDaytime || isSunrise || isSunset) && (
        <div
          className="absolute transition-all duration-1000 ease-in-out"
          style={{
            top: `${sunY}%`,
            left: `${sunX}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="relative">
            {/* Sun Glow */}
            <div className={`absolute inset-0 w-20 h-20 bg-yellow-300 rounded-full blur-xl opacity-60 ${isLowPerformance ? '' : 'animate-pulse-slow'}`} />
            <div className={`absolute inset-0 w-16 h-16 bg-yellow-400 rounded-full blur-lg opacity-80 ${isLowPerformance ? '' : 'animate-pulse-medium'}`} />

            {/* Sun Core */}
            <div className={`relative w-12 h-12 bg-gradient-radial from-yellow-200 via-yellow-400 to-orange-500 rounded-full ${isLowPerformance ? '' : 'animate-rotate-slow'} shadow-lg`}>
              {/* Sun Rays */}
              <div className={`absolute inset-0 ${isLowPerformance ? '' : 'animate-rotate-reverse'}`}>
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
      )}
      
      {/* Light Beams from Sun to Panels (only during daytime) */}
      {(isDaytime || isSunrise || isSunset) && (
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lightBeam1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                  offset="0%"
                  style={{
                    stopColor: '#fbbf24',
                    stopOpacity: isDaytime ? 0.8 : 0.4
                  }}
                />
                <stop
                  offset="100%"
                  style={{
                    stopColor: '#f59e0b',
                    stopOpacity: isDaytime ? 0.3 : 0.1
                  }}
                />
              </linearGradient>
              <linearGradient id="lightBeam2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                  offset="0%"
                  style={{
                    stopColor: '#fbbf24',
                    stopOpacity: isDaytime ? 0.6 : 0.3
                  }}
                />
                <stop
                  offset="100%"
                  style={{
                    stopColor: '#f59e0b',
                    stopOpacity: isDaytime ? 0.2 : 0.05
                  }}
                />
              </linearGradient>
            </defs>

            <path
              d={`M ${sunX * 5} ${sunY * 4 + 60} L 180 280 L 200 300 L ${sunX * 5 + 20} ${sunY * 4 + 80} Z`}
              fill="url(#lightBeam1)"
              className={isLowPerformance ? '' : 'animate-pulse-light'}
            />
            <path
              d={`M ${sunX * 5 + 10} ${sunY * 4 + 70} L 260 250 L 280 270 L ${sunX * 5 + 30} ${sunY * 4 + 90} Z`}
              fill="url(#lightBeam2)"
              className={isLowPerformance ? '' : 'animate-pulse-light-delayed'}
            />
          </svg>
        </div>
      )}
      
      {/* Solar Panels */}
      <div className="absolute bottom-20 left-8">
        <div className="relative">
          {/* Panel 1 */}
          <div className="relative w-32 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-lg transform -rotate-12 hover:scale-105 transition-transform duration-500">
            {/* Panel reflection */}
            <div
              className={`absolute inset-1 bg-gradient-to-br from-blue-400/20 via-transparent to-yellow-400/30 rounded-md ${
                isLowPerformance ? '' : 'animate-shimmer'
              }`}
              style={{
                opacity: (isDeepNight || isNight) ? 0.05 : panelEfficiency / 100
              }}
            />
            {/* Solar cells grid */}
            <div className="absolute inset-2 grid grid-cols-6 gap-0.5">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-slate-700 rounded-sm ${isLowPerformance ? '' : 'animate-cell-glow'}`}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    backgroundColor: (isDeepNight || isNight)
                      ? 'rgb(51, 65, 85)'
                      : panelEfficiency > 50
                      ? 'rgb(30, 41, 59)'
                      : 'rgb(51, 65, 85)',
                    boxShadow: (isDeepNight || isNight)
                      ? 'none'
                      : `0 0 ${Math.max(2, panelEfficiency / 25)}px rgba(251, 191, 36, ${Math.min(0.6, panelEfficiency / 100)})`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Panel 2 */}
          <div className="absolute top-4 left-16 w-28 h-18 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-lg transform -rotate-6 hover:scale-105 transition-transform duration-500">
            <div
              className={`absolute inset-1 bg-gradient-to-br from-blue-400/20 via-transparent to-yellow-400/30 rounded-md ${
                isLowPerformance ? '' : 'animate-shimmer-delayed'
              }`}
              style={{
                opacity: (isDeepNight || isNight) ? 0.05 : panelEfficiency / 100
              }}
            />
            <div className="absolute inset-2 grid grid-cols-5 gap-0.5">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-slate-700 rounded-sm ${isLowPerformance ? '' : 'animate-cell-glow'}`}
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    backgroundColor: (isDeepNight || isNight)
                      ? 'rgb(51, 65, 85)'
                      : panelEfficiency > 50
                      ? 'rgb(30, 41, 59)'
                      : 'rgb(51, 65, 85)',
                    boxShadow: (isDeepNight || isNight)
                      ? 'none'
                      : `0 0 ${Math.max(2, panelEfficiency / 25)}px rgba(251, 191, 36, ${Math.min(0.6, panelEfficiency / 100)})`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Panel 3 */}
          <div className="absolute top-8 left-32 w-24 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-lg transform rotate-3 hover:scale-105 transition-transform duration-500">
            <div
              className={`absolute inset-1 bg-gradient-to-br from-blue-400/20 via-transparent to-yellow-400/30 rounded-md ${
                isLowPerformance ? '' : 'animate-shimmer-slow'
              }`}
              style={{
                opacity: (isDeepNight || isNight) ? 0.05 : panelEfficiency / 100
              }}
            />
            <div className="absolute inset-2 grid grid-cols-4 gap-0.5">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-slate-700 rounded-sm ${isLowPerformance ? '' : 'animate-cell-glow'}`}
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    backgroundColor: (isDeepNight || isNight)
                      ? 'rgb(51, 65, 85)'
                      : panelEfficiency > 50
                      ? 'rgb(30, 41, 59)'
                      : 'rgb(51, 65, 85)',
                    boxShadow: (isDeepNight || isNight)
                      ? 'none'
                      : `0 0 ${Math.max(2, panelEfficiency / 25)}px rgba(251, 191, 36, ${Math.min(0.6, panelEfficiency / 100)})`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Landscape with Parallax */}
      <div className="absolute bottom-0 w-full">
        {/* Back Hills */}
        <div
          className="absolute bottom-0 w-full h-24 bg-gradient-to-t opacity-60"
          style={{
            clipPath: 'polygon(0 100%, 20% 60%, 40% 80%, 60% 40%, 80% 70%, 100% 50%, 100% 100%)',
            background: (isDeepNight || isNight)
              ? 'linear-gradient(to top, rgb(15, 35, 15), rgb(25, 45, 25))'
              : 'linear-gradient(to top, rgb(22, 163, 74), rgb(34, 197, 94))'
          }}
        />

        {/* Middle Hills */}
        <div
          className={`absolute bottom-0 w-full h-20 bg-gradient-to-t opacity-80 ${
            isLowPerformance ? '' : 'animate-parallax-slow'
          }`}
          style={{
            clipPath: 'polygon(0 100%, 15% 70%, 35% 90%, 55% 50%, 75% 80%, 95% 60%, 100% 100%)',
            background: (isDeepNight || isNight)
              ? 'linear-gradient(to top, rgb(25, 45, 25), rgb(18, 95, 45))'
              : 'linear-gradient(to top, rgb(34, 197, 94), rgb(74, 222, 128))',
            transform: isLowPerformance ? 'translateX(5px)' : undefined
          }}
        />

        {/* Front Ground */}
        <div
          className={`absolute bottom-0 w-full h-16 bg-gradient-to-t ${
            isLowPerformance ? '' : 'animate-parallax'
          }`}
          style={{
            clipPath: 'polygon(0 100%, 25% 80%, 50% 90%, 75% 70%, 100% 85%, 100% 100%)',
            background: (isDeepNight || isNight)
              ? 'linear-gradient(to top, rgb(18, 95, 45), rgb(25, 145, 70))'
              : 'linear-gradient(to top, rgb(74, 222, 128), rgb(134, 239, 172))',
            transform: isLowPerformance ? 'translateX(10px)' : undefined
          }}
        />

        {/* Grass Details */}
        <div
          className={`absolute bottom-4 left-4 w-1 h-6 rounded-t-full ${
            isLowPerformance ? '' : 'animate-sway'
          }`}
          style={{
            backgroundColor: isNight ? 'rgb(21, 128, 61)' : 'rgb(22, 163, 74)'
          }}
        />
        <div
          className={`absolute bottom-3 left-8 w-1 h-8 rounded-t-full ${
            isLowPerformance ? '' : 'animate-sway-delayed'
          }`}
          style={{
            backgroundColor: isNight ? 'rgb(20, 83, 45)' : 'rgb(21, 128, 61)'
          }}
        />
        <div
          className={`absolute bottom-5 right-12 w-1 h-5 rounded-t-full ${
            isLowPerformance ? '' : 'animate-sway-slow'
          }`}
          style={{
            backgroundColor: isNight ? 'rgb(34, 197, 94)' : 'rgb(34, 197, 94)'
          }}
        />
        <div
          className={`absolute bottom-2 right-20 w-1 h-7 rounded-t-full ${
            isLowPerformance ? '' : 'animate-sway'
          }`}
          style={{
            backgroundColor: isNight ? 'rgb(21, 128, 61)' : 'rgb(22, 163, 74)'
          }}
        />
      </div>

      {/* Energy Flow Particles (only during day) */}
      {(isDaytime || isSunrise || isSunset) && !isLowPerformance && (
        <div className="absolute inset-0">
          {[...Array(Math.floor(panelEfficiency / 15))].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-energy-flow"
              style={{
                left: `${20 + i * 15}%`,
                top: `${60 + i * 5}%`,
                animationDelay: `${i * 0.8}s`,
                opacity: panelEfficiency / 100
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function HeroSection() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLowPerformance, setIsLowPerformance] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check for low performance devices
    const checkPerformance = () => {
      const isLowPerf = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                       window.navigator.hardwareConcurrency < 4 ||
                       window.devicePixelRatio < 2
      setIsLowPerformance(isLowPerf)
    }

    checkPerformance()
    setMounted(true)

    // Update time every minute for better performance
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Use requestAnimationFrame for smooth animations on high-performance devices
    let animationFrame: number

    const animate = () => {
      if (!isLowPerformance) {
        setCurrentTime(new Date())
        animationFrame = requestAnimationFrame(animate)
      }
    }

    if (!isLowPerformance) {
      animationFrame = requestAnimationFrame(animate)
    }

    return () => {
      clearInterval(timeInterval)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isLowPerformance])

  // Calculate Turkey time (GMT+3) - Force Turkey timezone
  const turkeyTime = new Date(currentTime.toLocaleString("en-US", {timeZone: "Europe/Istanbul"}))
  const hours = turkeyTime.getHours()
  const minutes = turkeyTime.getMinutes()
  const totalMinutes = hours * 60 + minutes


  // Improved Day/Night cycle calculations
  const isDeepNight = hours >= 0 && hours < 6     // 00:00-06:00: Deep night (stars, no solar)
  const isDaytime = hours >= 6 && hours < 18      // 06:00-18:00: Day (bright sky, active panels)
  const isEvening = hours >= 18 && hours < 22     // 18:00-22:00: Evening (sunset colors)
  const isNight = hours >= 22 || hours < 6        // 22:00-24:00 + 00:00-06:00: Night (dark sky)

  // Transition periods for smooth animations
  const isSunrise = hours >= 5 && hours < 8
  const isSunset = hours >= 17 && hours < 20

  // Panel efficiency based on time of day with realistic values
  const getPanelEfficiency = () => {
    if (isDeepNight || isNight) return 0                    // No solar generation at night
    if (isSunrise) return 10 + Math.random() * 15          // Low efficiency during sunrise
    if (isSunset || isEvening) return 15 + Math.random() * 20  // Reduced efficiency during sunset
    if (isDaytime) return 60 + Math.random() * 30          // Peak efficiency during day
    return 0
  }

  const panelEfficiency = getPanelEfficiency()

  const stats = [
    { value: '500+', label: 'Tamamlanan Proje', icon: FileSearch },
    { value: '50MW+', label: 'Kurulu Güç', icon: Zap },
    { value: '₺2.4M+', label: 'Müşteri Tasarrufu', icon: TrendingUp },
    { value: '25 Yıl', label: 'Garanti', icon: Shield },
  ]

  // Prevent hydration mismatch by ensuring client-side rendering for time-dependent content
  if (!mounted) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </section>
    )
  }

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

            {/* CTA Buttons - 4 Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 px-6 py-4 text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl relative z-10"
                onClick={() => window.location.href = '/dashboard'}
              >
                <Sun className="w-5 h-5 mr-2" />
                Hemen Başla
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-4 text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl relative z-10"
                onClick={() => {
                  const companiesSection = document.querySelector('#companies-section')
                  if (companiesSection) {
                    companiesSection.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
              >
                <FileSearch className="w-5 h-5 mr-2" />
                Firmaları Gör
              </Button>

              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl relative z-10"
                onClick={() => {
                  const calculatorSection = document.getElementById('calculator-section')
                  if (calculatorSection) {
                    calculatorSection.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
              >
                <Calculator className="w-5 h-5 mr-2" />
                Hızlı Hesaplama
              </Button>

              <Button
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl relative z-10"
                onClick={() => window.location.href = '/partner/register'}
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Partner Ol
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
                  <span className="font-semibold text-gray-700">Hegel</span>
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
              <SolarEnergyAnimation
                currentTime={currentTime}
                isLowPerformance={isLowPerformance}
                turkeyTime={turkeyTime}
                hours={hours}
                minutes={minutes}
                totalMinutes={totalMinutes}
                isDaytime={isDaytime}
                isDeepNight={isDeepNight}
                isEvening={isEvening}
                isSunrise={isSunrise}
                isSunset={isSunset}
                isNight={isNight}
                panelEfficiency={panelEfficiency}
              />
              
              {/* Interactive Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-sm font-medium bg-black/30 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span>
                    {isDeepNight ? 'Derin Gece Modu' :
                     isNight ? 'Gece Modu' :
                     isSunrise ? 'Gün Doğumu' :
                     isSunset ? 'Gün Batımı' :
                     isEvening ? 'Akşam Saatleri' :
                     'Canlı Enerji Üretimi'}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${(isDeepNight || isNight) ? 'bg-blue-400' : 'bg-green-400'} ${isLowPerformance ? '' : 'animate-pulse'}`} />
                    <span className={`${(isDeepNight || isNight) ? 'text-blue-400' : 'text-green-400'} font-bold`}>
                      {(isDeepNight || isNight) ? '0.0 kW' : `${panelEfficiency.toFixed(1)} kW`}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs opacity-80">
                  <span>Türkiye Saati: {turkeyTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>Verimlilik: %{Math.round(panelEfficiency)}</span>
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