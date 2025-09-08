'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  MapPin, 
  Satellite,
  Layers,
  Ruler,
  Square,
  Navigation,
  Target,
  Sun
} from 'lucide-react'
import type { DesignerState } from '@/app/dashboard/designer/page'

interface MapboxDesignerProps {
  designerState: DesignerState
  updateDesignerState: (updates: Partial<DesignerState>) => void
  showLayers: {
    roof: boolean
    panels: boolean
    shadows: boolean
    measurements: boolean
  }
}

// Mock Mapbox implementation for demo
export function MapboxDesigner({ designerState, updateDesignerState, showLayers }: MapboxDesignerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number, lng: number } | null>(null)
  const [mapStyle, setMapStyle] = useState<'satellite' | 'streets'>('satellite')
  const [isDrawing, setIsDrawing] = useState(false)
  const [roofVertices, setRoofVertices] = useState<Array<{ lat: number, lng: number }>>([])

  // Mock Turkish cities data
  const turkishCities = [
    { name: 'İstanbul', lat: 41.0082, lng: 28.9784, irradiance: 1298 },
    { name: 'Ankara', lat: 39.9334, lng: 32.8597, irradiance: 1365 },
    { name: 'İzmir', lat: 38.4192, lng: 27.1287, irradiance: 1698 },
    { name: 'Antalya', lat: 36.8969, lng: 30.7133, irradiance: 1814 },
    { name: 'Bursa', lat: 40.1826, lng: 29.0669, irradiance: 1298 },
    { name: 'Adana', lat: 37.0000, lng: 35.3213, irradiance: 1642 },
    { name: 'Gaziantep', lat: 37.0662, lng: 37.3833, irradiance: 1728 },
    { name: 'Konya', lat: 37.8746, lng: 32.4932, irradiance: 1456 }
  ]

  const [filteredCities, setFilteredCities] = useState(turkishCities)

  useEffect(() => {
    // Filter cities based on search query
    if (searchQuery) {
      setFilteredCities(
        turkishCities.filter(city => 
          city.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    } else {
      setFilteredCities([])
    }
  }, [searchQuery])

  const handleCitySelect = (city: typeof turkishCities[0]) => {
    setSelectedCoords({ lat: city.lat, lng: city.lng })
    updateDesignerState({
      location: {
        address: city.name + ', Türkiye',
        coordinates: { lat: city.lat, lng: city.lng },
        irradiance: city.irradiance
      }
    })
    setSearchQuery(city.name)
    setFilteredCities([])
  }

  const handleMapClick = (event: React.MouseEvent) => {
    if (isDrawing && mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      // Convert pixel coordinates to mock lat/lng
      const lat = 41 + (y / rect.height - 0.5) * 0.1
      const lng = 29 + (x / rect.width - 0.5) * 0.1

      setRoofVertices(prev => [...prev, { lat, lng }])
    }
  }

  const finishDrawing = () => {
    if (roofVertices.length >= 3) {
      // Convert to 3D coordinates for the designer
      const roofPoints = roofVertices.map((vertex, index) => ({
        x: (vertex.lng - 29) * 1000, // Mock conversion
        y: 0,
        z: (vertex.lat - 41) * 1000
      }))

      updateDesignerState({
        roofPoints: roofPoints
      })
    }
    setIsDrawing(false)
    setRoofVertices([])
  }

  return (
    <div className="w-full h-full relative">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 z-10 w-80">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Şehir, ilçe veya adres ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/95"
          />
          
          {/* Search Results */}
          {filteredCities.length > 0 && (
            <Card className="absolute top-12 left-0 right-0 max-h-60 overflow-y-auto bg-white/95 backdrop-blur-sm">
              <div className="p-2">
                {filteredCities.map((city) => (
                  <button
                    key={city.name}
                    className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center justify-between"
                    onClick={() => handleCitySelect(city)}
                  >
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-primary mr-2" />
                      <span className="font-medium">{city.name}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Sun className="w-3 h-3 mr-1 text-yellow-500" />
                      {city.irradiance} kWh/m²
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={mapStyle === 'satellite' ? 'default' : 'outline'}
            onClick={() => setMapStyle('satellite')}
            className="bg-white/90"
          >
            <Satellite className="w-3 h-3 mr-1" />
            Uydu
          </Button>
          <Button
            size="sm"
            variant={mapStyle === 'streets' ? 'default' : 'outline'}
            onClick={() => setMapStyle('streets')}
            className="bg-white/90"
          >
            <Layers className="w-3 h-3 mr-1" />
            Sokak
          </Button>
        </div>

        <div className="flex flex-col space-y-1">
          <Button
            size="sm"
            variant={isDrawing ? 'default' : 'outline'}
            onClick={() => setIsDrawing(!isDrawing)}
            className="bg-white/90"
          >
            <Square className="w-3 h-3 mr-1" />
            {isDrawing ? 'Çizim Yapılıyor...' : 'Çatı Çiz'}
          </Button>
          
          {isDrawing && (
            <Button
              size="sm"
              onClick={finishDrawing}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Tamamla
            </Button>
          )}
        </div>
      </div>

      {/* Drawing Instructions */}
      {isDrawing && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/90 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="font-medium">Çatı Çizimi</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Çatı köşelerini tıklayarak işaretleyin
          </p>
          <div className="text-xs text-gray-500">
            İşaretlenen nokta: {roofVertices.length}
          </div>
        </div>
      )}

      {/* Location Info */}
      {designerState.location && (
        <div className="absolute bottom-4 right-4 z-10">
          <Card className="bg-white/90 backdrop-blur-sm p-4 w-64">
            <div className="flex items-center space-x-2 mb-2">
              <Navigation className="w-4 h-4 text-primary" />
              <span className="font-medium">Seçili Konum</span>
            </div>
            <p className="text-sm text-gray-900 mb-2">
              {designerState.location.address}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>
                {designerState.location.coordinates.lat.toFixed(4)}°N, 
                {designerState.location.coordinates.lng.toFixed(4)}°E
              </span>
              <Badge variant="secondary" className="text-xs">
                <Sun className="w-3 h-3 mr-1 text-yellow-500" />
                {designerState.location.irradiance} kWh/m²
              </Badge>
            </div>
            
            <Button 
              size="sm" 
              className="w-full mt-3"
              onClick={() => updateDesignerState({ mode: '3D' })}
            >
              3D Tasarıma Geç
            </Button>
          </Card>
        </div>
      )}

      {/* Mock Map Display */}
      <div 
        ref={mapRef}
        className={`w-full h-full ${
          mapStyle === 'satellite' 
            ? 'bg-gradient-to-br from-green-200 via-yellow-100 to-blue-200' 
            : 'bg-gradient-to-br from-gray-100 to-gray-200'
        } cursor-crosshair relative`}
        onClick={handleMapClick}
      >
        {/* Mock Map Grid */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#666" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Selected Location Marker */}
        {selectedCoords && (
          <div 
            className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg transform -translate-x-3 -translate-y-3 z-10"
            style={{
              left: '50%',
              top: '50%'
            }}
          >
            <div className="w-full h-full bg-red-500 rounded-full animate-ping absolute"></div>
          </div>
        )}

        {/* Roof Drawing Vertices */}
        {roofVertices.map((vertex, index) => (
          <div
            key={index}
            className="absolute w-3 h-3 bg-blue-500 rounded-full border border-white shadow transform -translate-x-1.5 -translate-y-1.5"
            style={{
              left: `${50 + (vertex.lng - 29) * 5000}%`,
              top: `${50 - (vertex.lat - 41) * 5000}%`
            }}
          >
            <span className="absolute -top-6 -left-2 text-xs font-medium text-blue-900">
              {index + 1}
            </span>
          </div>
        ))}

        {/* Roof Outline */}
        {roofVertices.length > 1 && (
          <svg className="absolute inset-0 pointer-events-none">
            <polyline
              points={roofVertices.map(v => 
                `${50 + (v.lng - 29) * 5000}%, ${50 - (v.lat - 41) * 5000}%`
              ).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
        )}

        {/* Map Watermark */}
        <div className="absolute bottom-2 left-2 text-xs text-gray-600 bg-white/70 px-2 py-1 rounded">
          Trakya Solar • Türkiye Haritası
        </div>
      </div>

      {/* Layer Controls */}
      <div className="absolute left-4 bottom-20 z-10 bg-white/90 rounded-lg p-2 space-y-1">
        <div className="text-xs font-medium mb-2">Katmanlar</div>
        {Object.entries(showLayers).map(([key, visible]) => (
          <div key={key} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded border ${visible ? 'bg-primary border-primary' : 'border-gray-300'}`}></div>
            <span className="text-xs capitalize">{key}</span>
          </div>
        ))}
      </div>
    </div>
  )
}