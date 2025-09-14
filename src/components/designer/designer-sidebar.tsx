'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import type { DesignerState } from '@/app/dashboard/designer/page'

interface DesignerSidebarProps {
  designerState: DesignerState
  updateDesignerState: (updates: Partial<DesignerState>) => void
}

export function DesignerSidebar({ designerState, updateDesignerState }: DesignerSidebarProps) {
  return (
    <div className="w-full h-full bg-white border-r p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Settings className="w-5 h-5 mr-2 text-primary" />
            Tasarım Paneli
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Güneş paneli tasarım aracı geliştiriliyor...
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateDesignerState({ mode: '3D' })}
                className={designerState.mode === '3D' ? 'bg-primary/10' : ''}
              >
                3D Görünüm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateDesignerState({ mode: 'MAP' })}
                className={designerState.mode === 'MAP' ? 'bg-primary/10' : ''}
              >
                Harita
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Sistem Özeti</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Panel Sayısı:</span>
                <span className="font-medium">{designerState.calculations.totalPanels}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Toplam Güç:</span>
                <span className="font-medium">{(designerState.calculations.totalPower / 1000).toFixed(1)}kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Çatı Alanı:</span>
                <span className="font-medium">{designerState.calculations.roofArea}m²</span>
              </div>
            </div>
          </div>

          {designerState.location && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Konum</h4>
              <p className="text-xs text-gray-600">
                {designerState.location.address}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}