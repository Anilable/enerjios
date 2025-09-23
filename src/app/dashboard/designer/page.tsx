'use client'

import { useState, useEffect } from 'react'
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
import { LicenseStatus } from '@/components/designer/license-status'

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
    province?: string
    district?: string
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

  const [sidebarOpen, setSidebarOpen] = useState(false) // Default closed on mobile
  const [rightPanelOpen, setRightPanelOpen] = useState(false) // Default closed on mobile
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

  // Handle responsive defaults
  useEffect(() => {
    const handleResize = () => {
      const isLarge = window.innerWidth >= 1024 // lg breakpoint
      if (isLarge) {
        setSidebarOpen(false) // Start with sidebar closed even on desktop for more space
        setRightPanelOpen(true) // Show calculations panel on desktop
      } else {
        setSidebarOpen(false)
        setRightPanelOpen(false)
      }
    }

    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSave = async () => {
    // Create save modal to get name and description
    const name = prompt('Tasarım adı giriniz:')
    if (!name) return

    const description = prompt('Tasarım açıklaması (opsiyonel):') || ''

    try {
      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          designerState,
          location: designerState.location,
          calculations: designerState.calculations
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert('Tasarım başarıyla kaydedildi!')
        console.log('Design saved with ID:', result.id)
      } else {
        throw new Error('Failed to save design')
      }
    } catch (error) {
      console.error('Error saving design:', error)
      alert('Tasarım kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  const handleExport = async () => {
    try {
      if (!designerState.location || designerState.calculations.totalPanels === 0) {
        alert('Dışa aktarma için önce konum seçin ve panel yerleştirin.')
        return
      }

      const { exportDesignToPDF } = await import('@/lib/design-export')

      const exportData = {
        projectName: designerState.location.address || 'Güneş Enerji Projesi',
        location: designerState.location.address,
        coordinates: designerState.location.coordinates,
        calculations: designerState.calculations,
        irradiance: designerState.location.irradiance,
        timestamp: new Date()
      }

      await exportDesignToPDF('designer-map-container', exportData)

    } catch (error) {
      console.error('Error exporting design:', error)
      alert('Dışa aktarma sırasında bir hata oluştu: ' + (error as Error).message)
    }
  }

  return (
    <DashboardLayout
      title="Proje Tasarımcısı"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Proje Tasarımcısı' }
      ]}
    >
      <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-50 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b shadow-sm flex-shrink-0">
          <div className="px-4 lg:px-6 py-3">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Compass className="w-5 h-5 text-primary flex-shrink-0" />
                  <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 truncate">Proje Tasarımcısı</h1>
                </div>
                
                <div className="hidden lg:flex items-center gap-2 ml-4">
                  <Badge variant={designerState.mode === '3D' ? 'default' : 'secondary'}>
                    <Box className="w-3 h-3 mr-1" />
                    3D
                  </Badge>
                  <Badge variant={designerState.mode === 'MAP' ? 'default' : 'secondary'}>
                    <Map className="w-3 h-3 mr-1" />
                    Harita
                  </Badge>
                  <LicenseStatus compact={true} />
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {/* Mobile Menu Buttons */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="sm:hidden"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setRightPanelOpen(!rightPanelOpen)}
                  className="sm:hidden"
                >
                  <Calculator className="w-4 h-4" />
                </Button>
                
                {/* Desktop Layer Controls */}
                <div className="hidden lg:flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => toggleLayer('roof')}>
                    {showLayers.roof ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span className="ml-1">Çatı</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toggleLayer('panels')}>
                    {showLayers.panels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span className="ml-1">Panel</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toggleLayer('shadows')}>
                    {showLayers.shadows ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span className="ml-1">Gölge</span>
                  </Button>
                </div>
                
                {/* Action Buttons */}
                <div className="hidden sm:flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4" />
                    <span className="hidden md:inline ml-1">Kaydet</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport} className="hidden md:inline-flex">
                    <Download className="w-4 h-4" />
                    <span className="ml-1">Dışa Aktar</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden relative">
          {/* Mobile Overlay */}
          {(sidebarOpen || rightPanelOpen) && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-10 sm:hidden"
              onClick={() => {
                setSidebarOpen(false)
                setRightPanelOpen(false)
              }}
            />
          )}
          {/* Left Sidebar */}
          <div className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            fixed sm:relative z-30 sm:z-0
            w-64 sm:w-72 lg:w-80 
            h-full sm:h-auto
            bg-white border-r shadow-lg sm:shadow-sm 
            transition-transform duration-300 ease-in-out
            sm:translate-x-0 sm:flex-shrink-0
            ${sidebarOpen ? 'sm:block' : 'sm:hidden lg:block'}
            overflow-y-auto
          `}>
            <DesignerSidebar 
              designerState={designerState}
              updateDesignerState={updateDesignerState}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Toolbar */}
            <div className="bg-white border-b px-2 sm:px-4 py-2 flex-shrink-0">
              <DesignerToolbar 
                designerState={designerState}
                updateDesignerState={updateDesignerState}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                sidebarOpen={sidebarOpen}
                rightPanelOpen={rightPanelOpen}
                onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
              />
            </div>

            {/* 3D/Map Viewport */}
            <div id="designer-map-container" className="flex-1 relative bg-gray-100 min-h-0">
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
          <div className={`
            ${rightPanelOpen ? 'translate-x-0' : 'translate-x-full'}
            fixed sm:relative z-20 sm:z-0
            w-64 sm:w-72 lg:w-80 
            h-full sm:h-auto
            bg-white border-l shadow-lg sm:shadow-sm 
            transition-transform duration-300 ease-in-out
            sm:translate-x-0 sm:flex-shrink-0
            ${rightPanelOpen ? 'sm:block' : 'sm:hidden lg:block'}
            overflow-y-auto
            right-0 sm:right-auto
          `}>
            <div className="p-4 sm:p-6">
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
                  <div className="text-xs text-blue-600 mt-1 opacity-75">
                    * NREL PVWatts verisi kullanılarak hesaplanmıştır
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
                <div className="text-xs text-gray-500 mt-3 p-2 bg-gray-50 rounded">
                  📊 Profesyonel NREL PVWatts API kullanılarak hesaplanmıştır
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