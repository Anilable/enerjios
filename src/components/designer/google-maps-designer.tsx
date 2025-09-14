'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { GoogleMap, LoadScript, Marker, Autocomplete, Polygon, DrawingManager } from '@react-google-maps/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useLicenseValidation } from '@/hooks/use-license-validation'
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
  Settings,
  Sun,
  RotateCcw
} from 'lucide-react'
import type { DesignerState } from '@/app/dashboard/designer/page'
import { useNRELCalculation, estimateSystemCapacity } from '@/hooks/use-nrel-calculation'

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
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null)

  // NREL integration
  const { getSolarResourceData } = useNRELCalculation()

  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('satellite')
  const [selectedPosition, setSelectedPosition] = useState<google.maps.LatLngLiteral | null>(
    designerState.location?.coordinates || null
  )
  // Support multiple roof polygons
  const [roofPolygons, setRoofPolygons] = useState<{
    id: string
    polygon: google.maps.Polygon
    coordinates: google.maps.LatLngLiteral[]
    area: number
  }[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentDrawingPolygon, setCurrentDrawingPolygon] = useState<google.maps.Polygon | null>(null)
  const [address, setAddress] = useState(designerState.location?.address || '')
  const [totalRoofArea, setTotalRoofArea] = useState(0)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPanelGrid, setShowPanelGrid] = useState(false)
  const [licenseError, setLicenseError] = useState<string | null>(null)
  const [realTimeArea, setRealTimeArea] = useState(0)
  
  // License validation
  const { licenseInfo, checkFeatureAccess, checkRoofAreaLimit, checkPanelLimit } = useLicenseValidation()
  
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
    
    // Extract province and district from address components
    let province = ''
    let district = ''
    
    if (place.address_components) {
      place.address_components.forEach(component => {
        const types = component.types
        if (types.includes('administrative_area_level_1')) {
          province = component.long_name
        } else if (types.includes('administrative_area_level_2')) {
          district = component.long_name
        }
      })
    }
    
    const enhancedAddress = place.formatted_address || ''
    const addressWithDetails = province && district 
      ? `${enhancedAddress} (${district}, ${province})`
      : enhancedAddress
    
    setSelectedPosition(newPosition)
    setAddress(addressWithDetails)
    
    // Update designer state with enhanced address info
    updateDesignerState({
      location: {
        address: addressWithDetails,
        coordinates: newPosition,
        irradiance: calculateIrradiance(lat, lng),
        province: province,
        district: district
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
    
    // Reverse geocode to get detailed address with province/district info
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          let province = ''
          let district = ''
          
          results[0].address_components?.forEach(component => {
            const types = component.types
            if (types.includes('administrative_area_level_1')) {
              province = component.long_name
            } else if (types.includes('administrative_area_level_2')) {
              district = component.long_name
            }
          })
          
          const formattedAddress = results[0].formatted_address
          const addressWithDetails = province && district 
            ? `${formattedAddress} (${district}, ${province})`
            : formattedAddress
            
          setAddress(addressWithDetails)
          updateDesignerState({
            location: {
              address: addressWithDetails,
              coordinates: { lat, lng },
              irradiance: calculateIrradiance(lat, lng),
              province: province,
              district: district
            }
          })
        } else {
          // Fallback to coordinates if geocoding fails
          const coordAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          setAddress(coordAddress)
          updateDesignerState({
            location: {
              address: coordAddress,
              coordinates: { lat, lng },
              irradiance: calculateIrradiance(lat)
            }
          })
        }
      })
    } else {
      // Fallback when Google Maps API is not available
      const coordAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setAddress(coordAddress)
      updateDesignerState({
        location: {
          address: coordAddress,
          coordinates: { lat, lng },
          irradiance: calculateIrradiance(lat)
        }
      })
    }
  }

  const onPolygonComplete = (polygon: google.maps.Polygon) => {
    const path = polygon.getPath()
    const coordinates: google.maps.LatLngLiteral[] = []

    for (let i = 0; i < path.getLength(); i++) {
      const latLng = path.getAt(i)
      coordinates.push({ lat: latLng.lat(), lng: latLng.lng() })
    }

    // Calculate area for this polygon
    const area = google.maps.geometry.spherical.computeArea(path)
    const validatedArea = Math.round(area)

    // Create unique ID for this polygon
    const polygonId = `roof-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Add to polygons array
    const newPolygon = {
      id: polygonId,
      polygon: polygon,
      coordinates: coordinates,
      area: validatedArea
    }

    setRoofPolygons(prev => [...prev, newPolygon])

    // Calculate total area from all polygons
    const newTotalArea = roofPolygons.reduce((sum, p) => sum + p.area, 0) + validatedArea
    setTotalRoofArea(newTotalArea)

    // Check license limits for total roof area
    const roofAreaCheck = checkRoofAreaLimit(newTotalArea)
    if (!roofAreaCheck.allowed) {
      setLicenseError(roofAreaCheck.message || 'Toplam çatı alanı limiti aşıldı')
      polygon.setMap(null)
      return
    }

    setLicenseError(null)

    // Calculate total panel placement for all polygons
    calculateTotalPanelPlacement(newTotalArea)

    setIsDrawing(false)
    setCurrentDrawingPolygon(null)
    setRealTimeArea(0)
  }

  const calculateTotalPanelPlacement = (totalArea: number) => {
    const panelWidth = 2.27 // meters (more accurate panel dimensions)
    const panelHeight = 1.13 // meters
    const panelArea = panelWidth * panelHeight
    const panelPower = 540 // watts per panel (updated to match sidebar)

    // Calculate usable area (75% of total roof area for obstacles, edges, etc.)
    const usableArea = Math.round(totalArea * 0.75)

    // Improved panel calculation using polygon fitting algorithm
    let totalMaxPanels = 0

    // For each polygon, calculate how many panels can fit using its shape
    roofPolygons.forEach(roofPolygon => {
      const polygonMaxPanels = calculatePanelsInPolygon(roofPolygon.coordinates, panelWidth, panelHeight)
      totalMaxPanels += polygonMaxPanels
    })

    // Fallback to simple area calculation if polygon fitting fails
    if (totalMaxPanels === 0) {
      totalMaxPanels = Math.floor(usableArea / panelArea)
    }

    // Check license limits for panel count
    const panelCheck = checkPanelLimit(totalMaxPanels)
    const allowedPanels = panelCheck.allowed ? totalMaxPanels : (licenseInfo?.maxPanels || totalMaxPanels)
    const totalPower = allowedPanels * panelPower

    if (!panelCheck.allowed) {
      console.warn(panelCheck.message)
    }

    // Calculate production and financials
    const irradiance = designerState.location?.irradiance || 1450
    const systemEfficiency = 0.85 // 85% system efficiency
    const annualProduction = Math.round((totalPower / 1000) * irradiance * systemEfficiency)
    const electricityRate = 4.5 // TL/kWh average
    const annualSavings = Math.round(annualProduction * electricityRate)
    const investmentPerKW = 35000 // TL per kW
    const totalInvestment = Math.round((totalPower / 1000) * investmentPerKW)
    const paybackPeriod = totalInvestment > 0 ? Math.round(totalInvestment / annualSavings * 10) / 10 : 0

    // Combine all coordinates for designer state
    const allCoordinates = roofPolygons.flatMap(p => p.coordinates)

    // Update designer state with all calculations
    updateDesignerState({
      roofPoints: allCoordinates.map((p) => ({
        x: p.lng * 1000,
        y: p.lat * 1000,
        z: 0
      })),
      calculations: {
        ...designerState.calculations,
        roofArea: totalArea,
        usableArea: usableArea,
        totalPanels: allowedPanels,
        totalPower: totalPower,
        annualProduction: annualProduction,
        investment: totalInvestment,
        savings: annualSavings,
        payback: paybackPeriod
      }
    })
  }

  // Improved panel placement algorithm that fits panels within polygon boundaries
  const calculatePanelsInPolygon = (coordinates: google.maps.LatLngLiteral[], panelWidth: number, panelHeight: number): number => {
    if (coordinates.length < 3) return 0

    // Convert lat/lng to meters for accurate placement
    const bounds = coordinates.reduce((acc, point) => ({
      minLat: Math.min(acc.minLat, point.lat),
      maxLat: Math.max(acc.maxLat, point.lat),
      minLng: Math.min(acc.minLng, point.lng),
      maxLng: Math.max(acc.maxLng, point.lng)
    }), {
      minLat: coordinates[0].lat,
      maxLat: coordinates[0].lat,
      minLng: coordinates[0].lng,
      maxLng: coordinates[0].lng
    })

    // Rough approximation: 1 degree lat = ~111km, 1 degree lng = ~111km * cos(lat)
    const avgLat = (bounds.minLat + bounds.maxLat) / 2
    const latToMeters = 111000
    const lngToMeters = 111000 * Math.cos(avgLat * Math.PI / 180)

    const polygonWidth = (bounds.maxLng - bounds.minLng) * lngToMeters
    const polygonHeight = (bounds.maxLat - bounds.minLat) * latToMeters

    // Simple grid fitting with spacing
    const panelSpacing = 0.5 // 50cm spacing between panels
    const effectivePanelWidth = panelWidth + panelSpacing
    const effectivePanelHeight = panelHeight + panelSpacing

    const panelsPerRow = Math.floor(polygonWidth / effectivePanelWidth)
    const panelsPerCol = Math.floor(polygonHeight / effectivePanelHeight)

    return Math.max(0, panelsPerRow * panelsPerCol * 0.8) // 80% efficiency for irregular shapes
  }

  const calculateIrradiance = (lat: number, lng?: number): number => {
    // More accurate dynamic irradiance calculation for Turkey
    // Based on Turkey's solar radiation map and regional data
    
    // Base irradiance values for different latitude zones in Turkey
    // Southern Turkey (Mediterranean): 36-37.5° N - Highest irradiance
    // Central Turkey (Anatolia): 37.5-40° N - Moderate-high irradiance  
    // Northern Turkey (Black Sea): 40-42° N - Lower irradiance
    
    let baseIrradiance = 1450 // Default for Turkey average
    
    if (lat >= 36 && lat < 37) {
      // Mediterranean coast (Antalya, Mersin, Hatay)
      baseIrradiance = 1750 + (37 - lat) * 100
    } else if (lat >= 37 && lat < 38) {
      // Southern Anatolia (Gaziantep, Şanlıurfa, Adana region)
      baseIrradiance = 1650 + (38 - lat) * 50
    } else if (lat >= 38 && lat < 39) {
      // Central Anatolia South (Konya, Kayseri, Nevşehir)
      baseIrradiance = 1550 + (39 - lat) * 30
    } else if (lat >= 39 && lat < 40) {
      // Central Anatolia North (Ankara, Eskişehir, Kırıkkale)
      baseIrradiance = 1450 + (40 - lat) * 20
    } else if (lat >= 40 && lat < 41) {
      // Marmara & Northern Anatolia (Istanbul, Bursa, Bolu)
      baseIrradiance = 1350 + (41 - lat) * 50
    } else if (lat >= 41 && lat <= 42) {
      // Black Sea coast (Samsun, Trabzon, Zonguldak)
      baseIrradiance = 1200 + (42 - lat) * 100
    }
    
    // Longitude adjustments for regional variations
    if (lng !== undefined) {
      if (lng >= 26 && lng < 30) {
        // Western Turkey (Aegean) - slightly higher
        baseIrradiance += 50
      } else if (lng >= 35 && lng < 37) {
        // Central southern Turkey - higher due to continental climate
        baseIrradiance += 75
      } else if (lng >= 40 && lng < 45) {
        // Eastern Turkey - adjust for altitude and continental effects
        if (lat < 39) {
          baseIrradiance += 100 // Southeastern regions get more sun
        } else {
          baseIrradiance -= 50 // Northeastern regions get less
        }
      }
    }
    
    // Ensure values stay within realistic bounds for Turkey
    return Math.max(1100, Math.min(1850, Math.round(baseIrradiance)))
  }

  const clearAllRoofs = () => {
    // Clear all polygons from map
    roofPolygons.forEach(roofPolygon => {
      roofPolygon.polygon.setMap(null)
    })

    // Clear current drawing if any
    if (currentDrawingPolygon) {
      currentDrawingPolygon.setMap(null)
      setCurrentDrawingPolygon(null)
    }

    // Reset state
    setRoofPolygons([])
    setTotalRoofArea(0)
    setRealTimeArea(0)
    setIsDrawing(false)

    updateDesignerState({
      roofPoints: [],
      panels: [],
      calculations: {
        ...designerState.calculations,
        roofArea: 0,
        usableArea: 0,
        totalPanels: 0,
        totalPower: 0,
        annualProduction: 0,
        investment: 0,
        savings: 0,
        payback: 0
      }
    })
  }

  const cancelCurrentDrawing = () => {
    if (currentDrawingPolygon) {
      currentDrawingPolygon.setMap(null)
      setCurrentDrawingPolygon(null)
    }

    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(null)
    }

    setIsDrawing(false)
    setRealTimeArea(0)
  }

  const undoLastPolygon = () => {
    if (roofPolygons.length === 0) return

    const lastPolygon = roofPolygons[roofPolygons.length - 1]
    lastPolygon.polygon.setMap(null)

    const newPolygons = roofPolygons.slice(0, -1)
    setRoofPolygons(newPolygons)

    const newTotalArea = newPolygons.reduce((sum, p) => sum + p.area, 0)
    setTotalRoofArea(newTotalArea)

    if (newTotalArea > 0) {
      calculateTotalPanelPlacement(newTotalArea)
    } else {
      updateDesignerState({
        roofPoints: [],
        panels: [],
        calculations: {
          ...designerState.calculations,
          roofArea: 0,
          usableArea: 0,
          totalPanels: 0,
          totalPower: 0,
          annualProduction: 0,
          investment: 0,
          savings: 0,
          payback: 0
        }
      })
    }
  }

  const removePolygon = (polygonId: string) => {
    const polygonToRemove = roofPolygons.find(p => p.id === polygonId)
    if (!polygonToRemove) return

    polygonToRemove.polygon.setMap(null)

    const newPolygons = roofPolygons.filter(p => p.id !== polygonId)
    setRoofPolygons(newPolygons)

    const newTotalArea = newPolygons.reduce((sum, p) => sum + p.area, 0)
    setTotalRoofArea(newTotalArea)

    if (newTotalArea > 0) {
      calculateTotalPanelPlacement(newTotalArea)
    } else {
      updateDesignerState({
        roofPoints: [],
        calculations: {
          ...designerState.calculations,
          roofArea: 0,
          usableArea: 0,
          totalPanels: 0,
          totalPower: 0,
          annualProduction: 0,
          investment: 0,
          savings: 0,
          payback: 0
        }
      })
    }
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
            2. API anahtarında <code>localhost:3000</code> adresinin yetkilendirilmiş olduğundan emin olun<br/>
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
                        irradiance: calculateIrradiance(lat, newPos.lng)
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
                        irradiance: calculateIrradiance(newPos.lat, lng)
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
                value={totalRoofArea || ''}
                onChange={(e) => {
                  const area = parseInt(e.target.value) || 0
                  setTotalRoofArea(area)
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
                <strong>Tahmini Işınım:</strong> {calculateIrradiance(selectedPosition.lat, selectedPosition.lng)} kWh/m²/yıl
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
              onLoad={(drawingManager) => {
                drawingManagerRef.current = drawingManager
              }}
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
          <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-auto max-w-full sm:max-w-sm md:max-w-md z-10">
            <Card className="p-2 shadow-lg">
              <div className="flex items-center space-x-2 min-w-0">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <Autocomplete
                  onLoad={onAutocompleteLoad}
                  onPlaceChanged={onPlaceChanged}
                  options={{
                    componentRestrictions: { country: 'tr' },
                    fields: ['address_components', 'geometry', 'formatted_address', 'name'],
                    types: ['geocode', 'establishment']
                  }}
                >
                  <Input
                    type="text"
                    placeholder="Adres ara veya haritada tıkla..."
                    className="border-0 focus-visible:ring-0 text-sm sm:text-base min-w-0"
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

          {/* Existing Roof Polygons */}
          {roofPolygons.length > 0 && !isDrawing && showLayers.roof &&
            roofPolygons.map((roofPolygon) => (
              <Polygon
                key={roofPolygon.id}
                paths={roofPolygon.coordinates}
                options={{
                  fillColor: '#FF6B6B',
                  fillOpacity: 0.3,
                  strokeColor: '#FF0000',
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  editable: true
                }}
                onClick={() => {
                  // Allow individual polygon deletion
                  if (window.confirm(`Bu çatı bölümünü silmek istiyor musunuz? (${roofPolygon.area} m²)`)) {
                    removePolygon(roofPolygon.id)
                  }
                }}
              />
            ))
          }
          
          {/* Panel Grid Visualization */}
          {roofPolygons.length > 0 && showPanelGrid && showLayers.panels && designerState.calculations.totalPanels > 0 && (
            <>
              {/* Create panel grid visualization for each polygon */}
              {roofPolygons.map((roofPolygon, polygonIndex) => {
                const panelsInThisPolygon = calculatePanelsInPolygon(roofPolygon.coordinates, 2.27, 1.13)
                const maxPanelsToShow = Math.min(panelsInThisPolygon, 15) // Limit visual complexity

                return Array.from({ length: maxPanelsToShow }, (_, panelIndex) => {
                  // Calculate panel positions within this specific polygon bounds
                  const bounds = roofPolygon.coordinates.reduce((acc, point) => ({
                    minLat: Math.min(acc.minLat, point.lat),
                    maxLat: Math.max(acc.maxLat, point.lat),
                    minLng: Math.min(acc.minLng, point.lng),
                    maxLng: Math.max(acc.maxLng, point.lng)
                  }), {
                    minLat: roofPolygon.coordinates[0].lat,
                    maxLat: roofPolygon.coordinates[0].lat,
                    minLng: roofPolygon.coordinates[0].lng,
                    maxLng: roofPolygon.coordinates[0].lng
                  })

                  const cols = Math.ceil(Math.sqrt(maxPanelsToShow))
                  const row = Math.floor(panelIndex / cols)
                  const col = panelIndex % cols

                  const latStep = (bounds.maxLat - bounds.minLat) / (cols + 1)
                  const lngStep = (bounds.maxLng - bounds.minLng) / (cols + 1)

                  const panelLat = bounds.minLat + latStep * (row + 1)
                  const panelLng = bounds.minLng + lngStep * (col + 1)

                  return (
                    <Polygon
                      key={`panel-${polygonIndex}-${panelIndex}`}
                      paths={[
                        { lat: panelLat - latStep * 0.25, lng: panelLng - lngStep * 0.15 },
                        { lat: panelLat - latStep * 0.25, lng: panelLng + lngStep * 0.15 },
                        { lat: panelLat + latStep * 0.25, lng: panelLng + lngStep * 0.15 },
                        { lat: panelLat + latStep * 0.25, lng: panelLng - lngStep * 0.15 }
                      ]}
                      options={{
                        fillColor: '#1E40AF',
                        fillOpacity: 0.6,
                        strokeColor: '#60A5FA',
                        strokeOpacity: 0.9,
                        strokeWeight: 1
                      }}
                    />
                  )
                })
              }).flat()}
            </>
          )}
        </GoogleMap>

        {/* Map Controls */}
        <div className="absolute bottom-4 right-2 sm:bottom-8 sm:right-4 space-y-2 z-10">
          {/* Map Type Selector */}
          <Card className="p-1 shadow-lg">
            <div className="flex sm:flex-col space-x-1 sm:space-x-0 sm:space-y-1">
              <Button
                size="sm"
                variant={mapType === 'roadmap' ? 'default' : 'ghost'}
                onClick={() => setMapType('roadmap')}
                className="justify-center sm:justify-start text-xs sm:text-sm"
              >
                <MapIcon className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Harita</span>
              </Button>
              <Button
                size="sm"
                variant={mapType === 'satellite' ? 'default' : 'ghost'}
                onClick={() => setMapType('satellite')}
                className="justify-center sm:justify-start text-xs sm:text-sm"
              >
                <Satellite className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Uydu</span>
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
        <div className="absolute top-16 left-2 sm:top-20 sm:left-4 z-10">
          <Card className="p-2 shadow-lg">
            <div className="flex flex-col space-y-1 sm:space-y-2">
              {!isDrawing ? (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      if (!checkFeatureAccess('roofDrawing')) {
                        setLicenseError('Çatı çizimi özelliği için lisans yükseltmesi gerekli')
                        return
                      }
                      setLicenseError(null)
                      setIsDrawing(true)
                    }}
                    disabled={!selectedPosition || !checkFeatureAccess('roofDrawing')}
                    className="text-xs sm:text-sm w-full"
                  >
                    <Crosshair className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Çatı Çiz</span>
                    <span className="sm:hidden">Çiz</span>
                  </Button>
                  {roofPolygons.length > 0 && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (!checkFeatureAccess('panelPlacement')) {
                            setLicenseError('Panel yerleştirme özelliği için lisans yükseltmesi gerekli')
                            return
                          }
                          setLicenseError(null)
                          setShowPanelGrid(!showPanelGrid)
                        }}
                        disabled={!checkFeatureAccess('panelPlacement')}
                        className="text-xs sm:text-sm"
                      >
                        <Sun className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">{showPanelGrid ? 'Panelleri Gizle' : 'Panelleri Göster'}</span>
                        <span className="sm:hidden">{showPanelGrid ? 'Gizle' : 'Panel'}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={undoLastPolygon}
                        className="text-xs sm:text-sm"
                      >
                        <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Geri Al</span>
                        <span className="sm:hidden">Geri</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={clearAllRoofs}
                        className="text-xs sm:text-sm"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Tümünü Sil</span>
                        <span className="sm:hidden">Sil</span>
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <div className="p-2 text-sm text-gray-600">
                  <p className="font-medium mb-1">Çizim Modu Aktif</p>
                  <p className="text-xs mb-2">Haritada tıklayarak çatı köşelerini belirleyin</p>

                  {realTimeArea > 0 && (
                    <div className="bg-blue-50 rounded p-2 mb-2 text-xs">
                      <span className="font-medium text-blue-700">
                        Anlık Alan: {realTimeArea} m²
                      </span>
                    </div>
                  )}

                  {totalRoofArea > 0 && (
                    <div className="bg-green-50 rounded p-2 mb-2 text-xs">
                      <span className="font-medium text-green-700">
                        Toplam: {totalRoofArea} m²
                      </span>
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={cancelCurrentDrawing}
                    className="w-full text-xs"
                  >
                    Çizimi İptal Et
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Info Panel */}
        {(selectedPosition || totalRoofArea > 0) && (
          <div className="absolute bottom-4 left-2 right-16 sm:bottom-8 sm:left-4 sm:right-auto max-w-full sm:max-w-xs md:max-w-sm">
            <Card className="p-3 sm:p-4 shadow-lg">
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
                      Tahmini Işınım: {calculateIrradiance(selectedPosition.lat, selectedPosition.lng)} kWh/m²/yıl
                    </div>
                  </>
                )}
                {totalRoofArea > 0 && (
                  <>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Ruler className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Çatı Ölçümleri</span>
                      </div>
                      <div className="text-sm text-green-600 mt-1">
                        Toplam Alan: {totalRoofArea} m² ({roofPolygons.length} bölge)
                      </div>
                      <div className="text-xs text-gray-600">
                        Kullanılabilir Alan: {Math.round(totalRoofArea * 0.75)} m²
                      </div>
                      {designerState.calculations.totalPanels > 0 && (
                        <>
                          <div className="text-xs text-blue-600 mt-1">
                            Panel Sayısı: {designerState.calculations.totalPanels} adet
                          </div>
                          <div className="text-xs text-purple-600">
                            Toplam Güç: {(designerState.calculations.totalPower / 1000).toFixed(1)} kW
                          </div>
                          <div className="text-xs text-orange-600">
                            Yıllık Üretim: {designerState.calculations.annualProduction.toLocaleString()} kWh
                          </div>
                        </>
                      )}

                      {roofPolygons.length > 1 && (
                        <div className="mt-2 border-t pt-2">
                          <div className="text-xs text-gray-600 mb-1">Bölge Detayları:</div>
                          {roofPolygons.map((polygon, index) => (
                            <div key={polygon.id} className="text-xs text-gray-500">
                              Bölge {index + 1}: {polygon.area} m²
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* License Error Alert */}
        {licenseError && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20">
            <Alert className="border-red-200 bg-red-50 max-w-md">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {licenseError}
              </AlertDescription>
            </Alert>
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