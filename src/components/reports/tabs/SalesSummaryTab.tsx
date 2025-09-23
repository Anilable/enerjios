import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { DollarSign, FileText, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { formatChartTooltip, formatPeriodLabel } from '../utils/chartHelpers'

interface SalesSummaryTabProps {
  reportData: any
}

export function SalesSummaryTab({ reportData }: SalesSummaryTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(reportData?.summary?.totalSales || 0)}</p>
                <p className="text-sm text-muted-foreground">Toplam Satış</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{reportData?.summary?.totalCount || 0}</p>
                <p className="text-sm text-muted-foreground">Toplam Proje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(reportData?.summary?.averageValue || 0)}</p>
                <p className="text-sm text-muted-foreground">Ortalama Değer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Satış Trendi - Gerçek Veriler</CardTitle>
          <p className="text-sm text-muted-foreground">
            Onaylanmış tekliflerden hesaplanan gerçek satış verileri
          </p>
        </CardHeader>
        <CardContent>
          {reportData?.data && reportData.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={reportData.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip
                  formatter={formatChartTooltip}
                  labelFormatter={formatPeriodLabel}
                />
                <Area
                  type="monotone"
                  dataKey="totalAmount"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Seçilen dönem için satış verisi bulunamadı</p>
                <p className="text-sm">Farklı bir tarih aralığı deneyin</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}