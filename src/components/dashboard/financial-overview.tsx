'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExchangeRateDisplay } from '@/hooks/use-exchange-rates'
import { FinancialDataGuard, usePermissions } from '@/components/ui/permission-guard'
import { useSession } from 'next-auth/react'
import {
  DollarSign,
  Calculator,
  Info
} from 'lucide-react'

export function FinancialOverview() {
  const { data: session } = useSession()
  const { hasPermission } = usePermissions()
  const canViewFinancialData = hasPermission('finance:read')

  // For Installation Team, show limited technical data only
  if (!canViewFinancialData) {
    return (
      <div className="lg:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Teknik Bilgiler
            </CardTitle>
            <CardDescription>
              Kurulum ekibi için teknik standartlar ve gereksinimler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Standartlar ve Sertifikalar</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Panel standartları: IEC 61215</p>
                  <p>• İnverter sertifikası: CE, TÜRKAK</p>
                  <p>• Kurulum standardı: TSE EN 62446</p>
                  <p>• Güvenlik: IEC 60364-7-712</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Teknik Gereksinimler</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Minimum çatı açısı: 15°</p>
                  <p>• Azimuth toleransı: ±45°</p>
                  <p>• Gölgelendirme: %5 max</p>
                  <p>• Yük kapasitesi: 20 kg/m²</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Finansal Genel Bakış
        </CardTitle>
        <CardDescription>
          Döviz kurları ve finansal veriler
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ExchangeRateDisplay />
        <div className="mt-4 text-sm text-gray-600">
          Kur bilgileri otomatik olarak güncellenmektedir.
        </div>
      </CardContent>
    </Card>
  )
}