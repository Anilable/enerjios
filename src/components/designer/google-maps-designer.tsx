'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { GoogleMap, LoadScript, Marker, Autocomplete, Polygon, DrawingManager } from '@react-google-maps/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MapPin, 
  Search, 
  Crosshair, 
  Navigation, 
  Plus, 
  Minus,
  Layers,
  Trash2,
  Satellite,
  Map as MapIcon,
  Ruler,
  AlertTriangle,
  Settings
} from 'lucide-react'
import type { DesignerState } from '@/app/dashboard/designer/page'

const libraries: ("places" | "geometry" | "drawing")[] = ["places", "geometry", "drawing"]

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

// Turkey center coordinates
const defaultCenter = {
  lat: 39.925533,
  lng: 32.866287
}

interface GoogleMapsDesignerProps {
  designerState: DesignerState
  updateDesignerState: (updates: Partial<DesignerState>) => void
  showLayers: {
    roof: boolean
    panels: boolean
    shadows: boolean
    measurements: boolean
  }
}

export function GoogleMapsDesigner({
  designerState,
  updateDesignerState,
  showLayers
}: GoogleMapsDesignerProps) {
  const mapRef = useRef<google.maps.Map | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const polygonRef = useRef<google.maps.Polygon | null>(null)
  
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('hybrid')
  const [selectedPosition, setSelectedPosition] = useState<google.maps.LatLngLiteral | null>(
    designerState.location?.coordinates || null
  )
  const [roofPolygon, setRoofPolygon] = useState<google.maps.LatLngLiteral[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [address, setAddress] = useState(designerState.location?.address || '')
  const [roofArea, setRoofArea] = useState(0)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
    
    // If we have a location, center the map there
    if (designerState.location?.coordinates) {
      map.setCenter(designerState.location.coordinates)
      map.setZoom(19) // High zoom for roof details
    }
  }, [designerState.location])

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete
  }

  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return
    
    const place = autocompleteRef.current.getPlace()
    if (!place.geometry?.location) return
    
    const lat = place.geometry.location.lat()
    const lng = place.geometry.location.lng()
    const newPosition = { lat, lng }
    
    setSelectedPosition(newPosition)
    setAddress(place.formatted_address || '')
    
    // Update designer state
    updateDesignerState({
      location: {
        address: place.formatted_address || '',
        coordinates: newPosition,
        irradiance: calculateIrradiance(lat)
      }
    })
    
    // Center and zoom map
    if (mapRef.current) {
      mapRef.current.setCenter(newPosition)
      mapRef.current.setZoom(19)
    }
  }

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng || isDrawing) return
    
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    
    setSelectedPosition({ lat, lng })
    
    // Reverse geocode to get address (without API call for now)
    setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    updateDesignerState({
      location: {
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        coordinates: { lat, lng },
        irradiance: calculateIrradiance(lat)
      }
    })
  }

  const onPolygonComplete = (polygon: google.maps.Polygon) => {
    polygonRef.current = polygon
    
    const path = polygon.getPath()
    const coordinates: google.maps.LatLngLiteral[] = []
    
    for (let i = 0; i < path.getLength(); i++) {
      const latLng = path.getAt(i)
      coordinates.push({ lat: latLng.lat(), lng: latLng.lng() })
    }
    
    setRoofPolygon(coordinates)
    
    // Calculate area
    const area = google.maps.geometry.spherical.computeArea(path)
    setRoofArea(Math.round(area))
    
    // Update designer state
    updateDesignerState({
      roofPoints: coordinates.map((p) => ({
        x: p.lng * 1000,
        y: p.lat * 1000,
        z: 0
      })),
      calculations: {
        ...designerState.calculations,
        roofArea: Math.round(area),
        usableArea: Math.round(area * 0.7)
      }
    })
    
    setIsDrawing(false)
  }

  const calculateIrradiance = (lat: number): number => {
    // Simple approximation for Turkey
    if (lat >= 36 && lat <= 42) {
      const normalized = (42 - lat) / 6
      return Math.round(1400 + normalized * 400)
    }
    return 1600
  }

  const clearRoof = () => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null)
      polygonRef.current = null
    }
    setRoofPolygon([])
    setRoofArea(0)
    updateDesignerState({
      roofPoints: [],
      calculations: {
        ...designerState.calculations,
        roofArea: 0,
        usableArea: 0
      }
    })
  }

  const zoomIn = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || 10
      mapRef.current.setZoom(currentZoom + 1)
    }
  }

  const zoomOut = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || 10
      mapRef.current.setZoom(currentZoom - 1)
    }
  }

  const goToLocation = () => {
    if (selectedPosition && mapRef.current) {
      mapRef.current.setCenter(selectedPosition)
      mapRef.current.setZoom(19)
    }
  }

  // Handle LoadScript errors
  const handleLoadScriptError = (error: Error) => {
    console.error('Google Maps LoadScript error:', error)
    setMapError('Google Haritalar yüklenemedi. API anahtarı yapılandırmasını kontrol edin.')
    setIsLoading(false)
  }

  const handleLoadScriptLoad = () => {
    setIsLoading(false)
    setMapError(null)
  }

  // Fallback component when Maps API fails
  const MapFallback = () => (
    <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Google Haritalar Kullanılamıyor</h3>
        <p className="text-sm text-gray-600 mb-4">
          Google Maps API anahtarı yapılandırma sorunu nedeniyle harita görünümü şu anda kullanılamıyor.
        </p>
        <Alert className="mb-4">
          <Settings className="h-4 w-4" />
          <AlertDescription>
            <strong>Çözüm:</strong><br/>
            1. Google Cloud Console'da API anahtarınızın aktif olduğunu kontrol edin<br/>
            2. API anahtarında <code>localhost:3002</code> adresinin yetkilendirilmiş olduğundan emin olun<br/>
            3. Maps JavaScript API'nin etkin olduğunu kontrol edin
          </AlertDescription>
        </Alert>
        
        {/* Manual coordinate input fallback */}
        <Card className="p-4 text-left">
          <h4 className="font-medium mb-3">Manuel Koordinat Girişi</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Enlem (Latitude)</label>
              <Input 
                type="number" 
                step="0.000001"
                placeholder="Örn: 41.0082"
                value={selectedPosition?.lat || ''}
                onChange={(e) => {
                  const lat = parseFloat(e.target.value)
                  if (!isNaN(lat)) {
                    const newPos = { lat, lng: selectedPosition?.lng || 0 }
                    setSelectedPosition(newPos)
                    updateDesignerState({
                      location: {
                        address: `${lat.toFixed(6)}, ${newPos.lng.toFixed(6)}`,
                        coordinates: newPos,
                        irradiance: calculateIrradiance(lat)
                      }
                    })
                  }
                }}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Boylam (Longitude)</label>
              <Input 
                type="number" 
                step="0.000001"
                placeholder="Örn: 28.9784"
                value={selectedPosition?.lng || ''}
                onChange={(e) => {
                  const lng = parseFloat(e.target.value)
                  if (!isNaN(lng)) {
                    const newPos = { lat: selectedPosition?.lat || 0, lng }
                    setSelectedPosition(newPos)
                    updateDesignerState({
                      location: {
                        address: `${newPos.lat.toFixed(6)}, ${lng.toFixed(6)}`,
                        coordinates: newPos,
                        irradiance: calculateIrradiance(newPos.lat)
                      }
                    })
                  }
                }}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Çatı Alanı (m²)</label>
              <Input 
                type="number"
                placeholder="Örn: 100"
                value={roofArea || ''}
                onChange={(e) => {
                  const area = parseInt(e.target.value) || 0
                  setRoofArea(area)
                  updateDesignerState({
                    calculations: {
                      ...designerState.calculations,
                      roofArea: area,
                      usableArea: Math.round(area * 0.7)
                    }
                  })
                }}
              />
            </div>
            {selectedPosition && (
              <div className="p-2 bg-green-50 rounded text-xs">
                <strong>Konum Seçildi:</strong><br/>
                {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}<br/>
                <strong>Tahmini Işınım:</strong> {calculateIrradiance(selectedPosition.lat)} kWh/m²/yıl
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )

  // Check if API key is available
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return (
      <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">API Anahtarı Bulunamadı</h3>
          <p className="text-sm text-gray-600">
            Google Maps API anahtarı .env.local dosyasında NEXT_PUBLIC_GOOGLE_MAPS_API_KEY olarak tanımlanmalıdır.
          </p>
        </div>
      </div>
    )
  }

  // Show fallback if there's an error
  if (mapError) {
    return <MapFallback />
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      onLoad={handleLoadScriptLoad}
      onError={handleLoadScriptError}
      loadingElement={<div className="w-full h-full bg-gray-100 flex items-center justify-center"><div className="text-gray-600">Google Haritalar yükleniyor...</div></div>}
    >
      <div className="relative w-full h-full">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={selectedPosition || defaultCenter}
          zoom={selectedPosition ? 19 : 6}
          mapTypeId={mapType}
          onLoad={onMapLoad}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            tilt: 0,
            gestureHandling: 'greedy'
          }}
        >
          {/* Drawing Manager */}
          {isDrawing && (
            <DrawingManager
              onPolygonComplete={onPolygonComplete}
              options={{
                drawingControl: false,
                drawingMode: google.maps.drawing.OverlayType.POLYGON,
                polygonOptions: {
                  fillColor: '#FF6B6B',
                  fillOpacity: 0.3,
                  strokeColor: '#FF0000',
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  clickable: true,
                  editable: true,
                  draggable: false
                }
              }}
            />
          )}

          {/* Search Box */}
          <div className="absolute top-4 left-4 right-4 max-w-md">
            <Card className="p-2">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Autocomplete
                  onLoad={onAutocompleteLoad}
                  onPlaceChanged={onPlaceChanged}
                  options={{
                    componentRestrictions: { country: 'tr' },
                    fields: ['address_components', 'geometry', 'formatted_address', 'name']
                  }}
                >
                  <Input
                    type="text"
                    placeholder="Adres ara veya haritada tıkla..."
                    className="border-0 focus-visible:ring-0"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </Autocomplete>
              </div>
            </Card>
          </div>

          {/* Selected Position Marker */}
          {selectedPosition && !isDrawing && (
            <Marker 
              position={selectedPosition}
              title="Seçilen Konum"
            />
          )}

          {/* Existing Roof Polygon */}
          {roofPolygon.length > 0 && !isDrawing && showLayers.roof && (
            <Polygon
              paths={roofPolygon}
              options={{
                fillColor: '#FF6B6B',
                fillOpacity: 0.3,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                editable: true
              }}
            />
          )}
        </GoogleMap>

        {/* Map Controls */}
        <div className="absolute bottom-8 right-4 space-y-2">
          {/* Map Type Selector */}
          <Card className="p-1">
            <div className="flex flex-col space-y-1">
              <Button
                size="sm"
                variant={mapType === 'roadmap' ? 'default' : 'ghost'}
                onClick={() => setMapType('roadmap')}
                className="justify-start"
              >
                <MapIcon className="w-4 h-4 mr-2" />
                Harita
              </Button>
              <Button
                size="sm"
                variant={mapType === 'satellite' ? 'default' : 'ghost'}
                onClick={() => setMapType('satellite')}
                className="justify-start"
              >
                <Satellite className="w-4 h-4 mr-2" />
                Uydu
              </Button>
              <Button
                size="sm"
                variant={mapType === 'hybrid' ? 'default' : 'ghost'}
                onClick={() => setMapType('hybrid')}
                className="justify-start"
              >
                <Layers className="w-4 h-4 mr-2" />
                Hibrit
              </Button>
            </div>
          </Card>

          {/* Zoom Controls */}
          <Card className="p-1">
            <div className="flex flex-col space-y-1">
              <Button size="sm" variant="ghost" onClick={zoomIn}>
                <Plus className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={zoomOut}>
                <Minus className="w-4 h-4" />
              </Button>
              {selectedPosition && (
                <Button size="sm" variant="ghost" onClick={goToLocation}>
                  <Navigation className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Drawing Tools */}
        <div className="absolute top-20 left-4">
          <Card className="p-2">
            <div className="flex flex-col space-y-2">
              {!isDrawing ? (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setIsDrawing(true)}
                    disabled={!selectedPosition}
                  >
                    <Crosshair className="w-4 h-4 mr-2" />
                    Çatı Çiz
                  </Button>
                  {roofPolygon.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearRoof}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Temizle
                    </Button>
                  )}
                </>
              ) : (
                <div className="p-2 text-sm text-gray-600">
                  <p className="font-medium mb-1">Çizim Modu</p>
                  <p className="text-xs">Haritada tıklayarak çatı köşelerini belirleyin</p>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setIsDrawing(false)}
                    className="w-full mt-2"
                  >
                    İptal
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Info Panel */}
        {(selectedPosition || roofArea > 0) && (
          <div className="absolute bottom-8 left-4">
            <Card className="p-4 max-w-sm">
              <div className="space-y-2">
                {selectedPosition && (
                  <>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Konum</span>
                    </div>
                    <p className="text-xs text-gray-600">{address}</p>
                    <div className="text-xs text-gray-500">
                      Enlem: {selectedPosition.lat.toFixed(6)}, Boylam: {selectedPosition.lng.toFixed(6)}
                    </div>
                    <div className="text-xs text-yellow-600">
                      Tahmini Işınım: {calculateIrradiance(selectedPosition.lat)} kWh/m²/yıl
                    </div>
                  </>
                )}
                {roofArea > 0 && (
                  <>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Ruler className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Çatı Ölçümleri</span>
                      </div>
                      <div className="text-sm text-green-600 mt-1">
                        Toplam Alan: {roofArea} m²
                      </div>
                      <div className="text-xs text-gray-600">
                        Kullanılabilir Alan: {Math.round(roofArea * 0.7)} m²
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Instructions */}
        {!selectedPosition && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Card className="p-6 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Başlamak için konum seçin</h3>
              <p className="text-sm text-gray-600">
                Yukarıdaki arama kutusunu kullanın veya<br />
                haritada bir noktaya tıklayın
              </p>
            </Card>
          </div>
        )}
      </div>
    </LoadScript>
  )
}