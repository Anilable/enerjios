'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Designer3D } from '@/components/designer/designer-3d'
import { GoogleMapsDesigner } from '@/components/designer/google-maps-designer'
import { DesignerSidebar } from '@/components/designer/designer-sidebar'
import { DesignerToolbar } from '@/components/designer/designer-toolbar'
import { DesignerQuoteModal } from '@/components/designer/designer-quote-modal'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Box,
  Map,
  Calculator,
  Settings,
  Save,
  Download,
  Share,
  Eye,
  EyeOff,
  RotateCcw,
  Sun,
  Send,
  Compass
} from 'lucide-react'

export type DesignMode = '3D' | 'MAP'
export type ViewMode = 'ROOF' | 'PANELS' | 'SHADOWS' | 'ALL'

export interface DesignerState {
  mode: DesignMode
  viewMode: ViewMode
  selectedTool: string
  roofPoints: Array<{ x: number; y: number; z: number }>
  panels: Array<{
    id: string
    position: { x: number; y: number; z: number }
    rotation: { x: number; y: number; z: number }
    type: string
    power: number
  }>
  location: {
    address: string
    coordinates: { lat: number; lng: number }
    irradiance: number
  } | null
  calculations: {
    totalPanels: number
    totalPower: number
    roofArea: number
    usableArea: number
    annualProduction: number
    investment: number
    savings: number
    payback: number
  }
}

export default function DesignerPage() {
  const [designerState, setDesignerState] = useState<DesignerState>({
    mode: '3D',
    viewMode: 'ALL',
    selectedTool: 'select',
    roofPoints: [],
    panels: [],
    location: null,
    calculations: {
      totalPanels: 0,
      totalPower: 0,
      roofArea: 0,
      usableArea: 0,
      annualProduction: 0,
      investment: 0,
      savings: 0,
      payback: 0
    }
  })

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const [showLayers, setShowLayers] = useState({
    roof: true,
    panels: true,
    shadows: true,
    measurements: true
  })

  const updateDesignerState = (updates: Partial<DesignerState>) => {
    setDesignerState(prev => ({ ...prev, ...updates }))
  }

  const toggleLayer = (layer: keyof typeof showLayers) => {
    setShowLayers(prev => ({ ...prev, [layer]: !prev[layer] }))
  }

  const handleSave = () => {
    console.log('Saving design...', designerState)
  }

  const handleExport = () => {
    console.log('Exporting design...', designerState)
  }

  return (
    <DashboardLayout
      title="Proje Tasarımcısı"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Proje Tasarımcısı' }
      ]}
    >
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Compass className="w-6 h-6 text-primary" />
                  <h1 className="text-2xl font-bold text-gray-900">Proje Tasarımcısı - 3D Çatı Analizi</h1>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={designerState.mode === '3D' ? 'default' : 'secondary'}>
                    <Box className="w-3 h-3 mr-1" />
                    3D Tasarım
                  </Badge>
                  <Badge variant={designerState.mode === 'MAP' ? 'default' : 'secondary'}>
                    <Map className="w-3 h-3 mr-1" />
                    Harita Görünümü
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => toggleLayer('roof')}>
                  {showLayers.roof ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  Çatı
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleLayer('panels')}>
                  {showLayers.panels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  Paneller
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleLayer('shadows')}>
                  {showLayers.shadows ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  Gölgeler
                </Button>
                
                <div className="h-6 border-l border-gray-300 mx-2" />
                
                <Button variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Sıfırla
                </Button>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Dışa Aktar
                </Button>
                <Button size="sm">
                  <Share className="w-4 h-4 mr-2" />
                  Paylaş
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          {sidebarOpen && (
            <div className="w-80 bg-white border-r shadow-sm overflow-y-auto">
              <DesignerSidebar 
                designerState={designerState}
                updateDesignerState={updateDesignerState}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="bg-white border-b px-4 py-2">
              <DesignerToolbar 
                designerState={designerState}
                updateDesignerState={updateDesignerState}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              />
            </div>

            {/* 3D/Map Viewport */}
            <div className="flex-1 relative bg-gray-100">
              {designerState.mode === '3D' ? (
                <Designer3D 
                  designerState={designerState}
                  updateDesignerState={updateDesignerState}
                  showLayers={showLayers}
                />
              ) : (
                <GoogleMapsDesigner 
                  designerState={designerState}
                  updateDesignerState={updateDesignerState}
                  showLayers={showLayers}
                />
              )}
            </div>
          </div>

          {/* Right Panel - Calculations */}
          <div className="w-80 bg-white border-l shadow-sm overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Calculator className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Hesaplamalar</h3>
              </div>

              {/* Location Info */}
              {designerState.location && (
                <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Map className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Konum</span>
                  </div>
                  <p className="text-sm text-blue-800 mb-2">
                    {designerState.location.address}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Sun className="w-3 h-3 text-yellow-600" />
                    <span className="text-xs text-blue-700">
                      {designerState.location.irradiance} kWh/m² yıllık
                    </span>
                  </div>
                </Card>
              )}

              {/* System Stats */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-900">
                      {designerState.calculations.totalPanels}
                    </div>
                    <div className="text-xs text-gray-600">Panel Sayısı</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-primary">
                      {(designerState.calculations.totalPower / 1000).toFixed(1)}kW
                    </div>
                    <div className="text-xs text-gray-600">Toplam Güç</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">
                      {designerState.calculations.roofArea}m²
                    </div>
                    <div className="text-xs text-gray-600">Çatı Alanı</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">
                      {designerState.calculations.usableArea}m²
                    </div>
                    <div className="text-xs text-gray-600">Kullanılabilir Alan</div>
                  </div>
                </div>
              </div>

              {/* Financial Results */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Yıllık Üretim:</span>
                  <span className="font-medium">
                    {designerState.calculations.annualProduction.toLocaleString()} kWh
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Yatırım Maliyeti:</span>
                  <span className="font-medium">
                    ₺{designerState.calculations.investment.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Yıllık Tasarruf:</span>
                  <span className="font-medium text-green-600">
                    ₺{designerState.calculations.savings.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Geri Ödeme:</span>
                  <span className="font-medium text-primary">
                    {designerState.calculations.payback} yıl
                  </span>
                </div>
              </div>

              {/* Generate Quote Button */}
              <Button 
                className="w-full mt-6" 
                size="lg"
                onClick={() => setQuoteModalOpen(true)}
                disabled={!designerState.location || designerState.calculations.totalPanels === 0}
              >
                <Send className="w-4 h-4 mr-2" />
                Bu Proje İçin Teklif İste
              </Button>
              
              {(!designerState.location || designerState.calculations.totalPanels === 0) && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Teklif için önce konum seçin ve panel yerleştirin
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Quote Request Modal */}
      <DesignerQuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        designerState={designerState}
      />
    </DashboardLayout>
  )
}