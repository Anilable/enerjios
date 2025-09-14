'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Menu,
  Box,
  Map,
  MousePointer,
  Move,
  Square,
  Circle,
  Ruler,
  RotateCw,
  Trash2,
  Copy,
  Layers,
  Sun,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Calculator
} from 'lucide-react'
import type { DesignerState } from '@/app/dashboard/designer/page'

interface DesignerToolbarProps {
  designerState: DesignerState
  updateDesignerState: (updates: Partial<DesignerState>) => void
  onToggleSidebar: () => void
  sidebarOpen?: boolean
  rightPanelOpen?: boolean
  onToggleRightPanel?: () => void
}

const tools = [
  { id: 'select', name: 'Seç', icon: MousePointer },
  { id: 'move', name: 'Taşı', icon: Move },
  { id: 'rectangle', name: 'Dikdörtgen', icon: Square },
  { id: 'polygon', name: 'Çokgen', icon: Square },
  { id: 'circle', name: 'Daire', icon: Circle },
  { id: 'measure', name: 'Ölçü', icon: Ruler },
]

const viewModes = [
  { id: 'ALL', name: 'Tümü', color: 'bg-blue-500' },
  { id: 'ROOF', name: 'Çatı', color: 'bg-gray-500' },
  { id: 'PANELS', name: 'Paneller', color: 'bg-green-500' },
  { id: 'SHADOWS', name: 'Gölgeler', color: 'bg-purple-500' },
]

export function DesignerToolbar({ 
  designerState, 
  updateDesignerState, 
  onToggleSidebar, 
  sidebarOpen, 
  rightPanelOpen, 
  onToggleRightPanel 
}: DesignerToolbarProps) {
  return (
    <div className="flex items-center justify-between overflow-x-auto">
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
        {/* Desktop Sidebar Toggle */}
        <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="hidden sm:flex">
          <Menu className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Mode Switch */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant={designerState.mode === '3D' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => updateDesignerState({ mode: '3D' })}
            className="text-xs sm:text-sm"
          >
            <Box className="w-3 h-3 mr-1" />
            3D
          </Button>
          <Button
            variant={designerState.mode === 'MAP' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => updateDesignerState({ mode: 'MAP' })}
            className="text-xs sm:text-sm"
          >
            <Map className="w-3 h-3 mr-1" />
            Harita
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 hidden md:block" />

        {/* Drawing Tools - Hidden on mobile, show only essential ones */}
        <div className="hidden md:flex items-center space-x-1">
          {tools.slice(0, 4).map(tool => {
            const Icon = tool.icon
            return (
              <Button
                key={tool.id}
                variant={designerState.selectedTool === tool.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => updateDesignerState({ selectedTool: tool.id })}
                title={tool.name}
              >
                <Icon className="w-3 h-3" />
              </Button>
            )
          })}
        </div>

        <Separator orientation="vertical" className="h-6 hidden lg:block" />

        {/* View Controls - Essential only on mobile */}
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" title="Yakınlaştır" className="hidden sm:flex">
            <ZoomIn className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" title="Uzaklaştır" className="hidden sm:flex">
            <ZoomOut className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" title="Görünümü Sıfırla">
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
        {/* View Mode Indicator - Simplified on mobile */}
        <div className="hidden lg:flex items-center space-x-2">
          <Layers className="w-4 h-4 text-gray-500" />
          {viewModes.map(mode => (
            <Badge
              key={mode.id}
              variant={designerState.viewMode === mode.id ? 'default' : 'secondary'}
              className={`text-xs cursor-pointer ${
                designerState.viewMode === mode.id 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => updateDesignerState({ viewMode: mode.id as any })}
            >
              <div className={`w-2 h-2 rounded-full mr-1 ${mode.color}`} />
              {mode.name}
            </Badge>
          ))}
        </div>

        {/* Mobile Panel Toggles */}
        <div className="flex sm:hidden items-center space-x-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggleSidebar}
            className={sidebarOpen ? 'bg-primary text-white' : ''}
          >
            <Menu className="w-4 h-4" />
          </Button>
          {onToggleRightPanel && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onToggleRightPanel}
              className={rightPanelOpen ? 'bg-primary text-white' : ''}
            >
              <Calculator className="w-4 h-4" />
            </Button>
          )}
        </div>

        <Separator orientation="vertical" className="h-6 hidden lg:block" />

        {/* Action Buttons - Desktop only */}
        <div className="hidden lg:flex items-center space-x-1">
          <Button variant="ghost" size="sm" title="Kopyala">
            <Copy className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" title="Döndür">
            <RotateCw className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" title="Sil">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 hidden lg:block" />

        {/* Solar Analysis - Desktop only */}
        <Button variant="outline" size="sm" className="hidden lg:flex">
          <Sun className="w-3 h-3 mr-2 text-yellow-500" />
          Güneş Analizi
        </Button>
      </div>
    </div>
  )
}