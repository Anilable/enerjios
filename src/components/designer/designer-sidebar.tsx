'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MapPin,
  Settings,
  Sun,
  Box,
  Zap,
  Ruler,
  Calculator,
  RotateCcw,
  Move3D,
  Grid3X3,
  Compass
} from 'lucide-react'
import type { DesignerState } from '@/app/dashboard/designer/page'

interface DesignerSidebarProps {
  designerState: DesignerState
  updateDesignerState: (updates: Partial<DesignerState>) => void
}

export function DesignerSidebar({ designerState, updateDesignerState }: DesignerSidebarProps) {
  const [roofDimensions, setRoofDimensions] = useState({
    width: 10,
    length: 12,
    height: 3,
    tilt: 30,
    azimuth: 180
  })

  const [panelSettings, setPanelSettings] = useState({
    type: 'JINKO_540W',
    spacing: 0.5,
    marginTop: 1,
    marginSides: 0.8,
    orientation: 'LANDSCAPE'
  })

  const panelTypes = [
    { id: 'JINKO_540W', name: 'Jinko Solar 540W', power: 540, dimensions: '2.27m x 1.13m', efficiency: 21.2 },
    { id: 'CANADIAN_545W', name: 'Canadian Solar 545W', power: 545, dimensions: '2.26m x 1.13m', efficiency: 21.6 },
    { id: 'TRINA_550W', name: 'Trina Solar 550W', power: 550, dimensions: '2.28m x 1.13m', efficiency: 21.8 },
    { id: 'LONGI_555W', name: 'LONGi Solar 555W', power: 555, dimensions: '2.25m x 1.13m', efficiency: 22.1 }
  ]

  const selectedPanel = panelTypes.find(p => p.id === panelSettings.type)

  const handleLocationSearch = () => {
    // Mock location data
    updateDesignerState({
      location: {
        address: 'Çerkezköy, Tekirdağ',
        coordinates: { lat: 41.2867, lng: 27.9961 },
        irradiance: 1298
      }
    })
  }

  const calculateRoofArea = () => {
    const area = roofDimensions.width * roofDimensions.length
    const usableArea = area * 0.75 // %75 kullanılabilir alan
    
    updateDesignerState({
      calculations: {
        ...designerState.calculations,
        roofArea: Math.round(area),
        usableArea: Math.round(usableArea)
      }
    })
  }

  const calculatePanels = () => {
    if (!selectedPanel) return

    const panelWidth = 2.27
    const panelLength = 1.13
    const panelArea = panelWidth * panelLength
    
    const usableArea = designerState.calculations.usableArea
    const maxPanels = Math.floor(usableArea / panelArea * 0.8) // %80 verimlilik
    
    const totalPower = maxPanels * selectedPanel.power
    const annualProduction = totalPower * (designerState.location?.irradiance || 1300) / 1000
    const investment = totalPower * 4.2 // 4.2 TL/W
    const savings = annualProduction * 2.2 * 0.9 // 2.2 TL/kWh, %90 tasarruf
    const payback = investment / savings

    updateDesignerState({
      calculations: {
        ...designerState.calculations,
        totalPanels: maxPanels,
        totalPower: totalPower,
        annualProduction: Math.round(annualProduction),
        investment: Math.round(investment),
        savings: Math.round(savings),
        payback: Math.round(payback * 10) / 10
      }
    })
  }

  return (
    <div className="p-4 space-y-6">
      <Tabs defaultValue="location" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="location" className="text-xs">
            <MapPin className="w-3 h-3" />
          </TabsTrigger>
          <TabsTrigger value="roof" className="text-xs">
            <Box className="w-3 h-3" />
          </TabsTrigger>
          <TabsTrigger value="panels" className="text-xs">
            <Grid3X3 className="w-3 h-3" />
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">
            <Settings className="w-3 h-3" />
          </TabsTrigger>
        </TabsList>

        {/* Location Tab */}
        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                Konum Seçimi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Adres</Label>
                <div className="flex space-x-2 mt-1">
                  <Input 
                    id="address" 
                    placeholder="İl, İlçe, Mahalle..."
                    className="text-sm"
                  />
                  <Button size="sm" onClick={handleLocationSearch}>
                    <Compass className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {designerState.location && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-blue-900 mb-1">
                    {designerState.location.address}
                  </div>
                  <div className="text-xs text-blue-700">
                    Lat: {designerState.location.coordinates.lat.toFixed(4)}°, 
                    Lng: {designerState.location.coordinates.lng.toFixed(4)}°
                  </div>
                  <div className="flex items-center mt-2">
                    <Sun className="w-3 h-3 text-yellow-600 mr-1" />
                    <span className="text-xs text-blue-800">
                      {designerState.location.irradiance} kWh/m²/yıl
                    </span>
                  </div>
                </div>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => updateDesignerState({ mode: 'MAP' })}
              >
                Haritadan Seç
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roof Tab */}
        <TabsContent value="roof" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Box className="w-4 h-4 mr-2 text-primary" />
                Çatı Boyutları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="width" className="text-xs">Genişlik (m)</Label>
                  <Input 
                    id="width"
                    type="number" 
                    value={roofDimensions.width}
                    onChange={(e) => setRoofDimensions(prev => ({ ...prev, width: Number(e.target.value) }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="length" className="text-xs">Uzunluk (m)</Label>
                  <Input 
                    id="length"
                    type="number" 
                    value={roofDimensions.length}
                    onChange={(e) => setRoofDimensions(prev => ({ ...prev, length: Number(e.target.value) }))}
                    className="text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Çatı Eğimi: {roofDimensions.tilt}°</Label>
                <Slider
                  value={[roofDimensions.tilt]}
                  onValueChange={(value) => setRoofDimensions(prev => ({ ...prev, tilt: value[0] }))}
                  max={60}
                  min={0}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-xs">Azimuth: {roofDimensions.azimuth}°</Label>
                <Slider
                  value={[roofDimensions.azimuth]}
                  onValueChange={(value) => setRoofDimensions(prev => ({ ...prev, azimuth: value[0] }))}
                  max={360}
                  min={0}
                  step={15}
                  className="mt-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  180° = Güney, 90° = Doğu, 270° = Batı
                </div>
              </div>

              <Button 
                size="sm" 
                className="w-full"
                onClick={calculateRoofArea}
              >
                <Calculator className="w-3 h-3 mr-2" />
                Alan Hesapla
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Panels Tab */}
        <TabsContent value="panels" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Grid3X3 className="w-4 h-4 mr-2 text-primary" />
                Panel Konfigürasyonu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="panel-type" className="text-xs">Panel Tipi</Label>
                <Select 
                  value={panelSettings.type} 
                  onValueChange={(value) => setPanelSettings(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {panelTypes.map(panel => (
                      <SelectItem key={panel.id} value={panel.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{panel.name}</span>
                          <span className="text-xs text-gray-500">
                            {panel.power}W • {panel.dimensions} • %{panel.efficiency} verimlilik
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPanel && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium mb-2">{selectedPanel.name}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Güç: <span className="font-medium">{selectedPanel.power}W</span></div>
                    <div>Verimlilik: <span className="font-medium">%{selectedPanel.efficiency}</span></div>
                    <div className="col-span-2">Boyut: <span className="font-medium">{selectedPanel.dimensions}</span></div>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs">Panel Arası Mesafe: {panelSettings.spacing}m</Label>
                <Slider
                  value={[panelSettings.spacing]}
                  onValueChange={(value) => setPanelSettings(prev => ({ ...prev, spacing: value[0] }))}
                  max={2}
                  min={0.2}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="margin-top" className="text-xs">Üst Mesafe (m)</Label>
                  <Input 
                    id="margin-top"
                    type="number" 
                    step="0.1"
                    value={panelSettings.marginTop}
                    onChange={(e) => setPanelSettings(prev => ({ ...prev, marginTop: Number(e.target.value) }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="margin-sides" className="text-xs">Yan Mesafe (m)</Label>
                  <Input 
                    id="margin-sides"
                    type="number" 
                    step="0.1"
                    value={panelSettings.marginSides}
                    onChange={(e) => setPanelSettings(prev => ({ ...prev, marginSides: Number(e.target.value) }))}
                    className="text-sm"
                  />
                </div>
              </div>

              <Button 
                size="sm" 
                className="w-full"
                onClick={calculatePanels}
                disabled={!designerState.location || designerState.calculations.roofArea === 0}
              >
                <Calculator className="w-3 h-3 mr-2" />
                Panel Yerleştir
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Settings className="w-4 h-4 mr-2 text-primary" />
                Görünüm Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="view-mode" className="text-xs">Görünüm Modu</Label>
                <Select 
                  value={designerState.viewMode} 
                  onValueChange={(value: any) => updateDesignerState({ viewMode: value })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tümü</SelectItem>
                    <SelectItem value="ROOF">Sadece Çatı</SelectItem>
                    <SelectItem value="PANELS">Sadece Paneller</SelectItem>
                    <SelectItem value="SHADOWS">Sadece Gölgeler</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <Label className="text-xs mb-2 block">Hızlı Araçlar</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Move3D className="w-3 h-3 mr-1" />
                    Hareket
                  </Button>
                  <Button variant="outline" size="sm">
                    <Ruler className="w-3 h-3 mr-1" />
                    Ölçüm
                  </Button>
                  <Button variant="outline" size="sm">
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Sıfırla
                  </Button>
                  <Button variant="outline" size="sm">
                    <Zap className="w-3 h-3 mr-1" />
                    Analiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}