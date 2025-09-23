// src/components/reports/MetricsGrid.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Building, Zap, FileText } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { DashboardStats } from '@/types/reports'

interface MetricsGridProps {
  stats: DashboardStats
}

export function MetricsGrid({ stats }: MetricsGridProps) {
  const metrics = [
    {
      title: 'Toplam Gelir',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      trend: '+12.5% önceki döneme göre',
      trendIcon: TrendingUp
    },
    {
      title: 'Aktif Projeler',
      value: stats.activeProjects.toString(),
      icon: Building,
      color: 'text-blue-600',
      subtitle: `${stats.completedProjects} tamamlandı`
    },
    {
      title: 'Sistem Kapasitesi',
      value: `${formatNumber(stats.systemCapacity)} kW`,
      icon: Zap,
      color: 'text-yellow-600',
      subtitle: `Ortalama: ${formatNumber(stats.avgProjectSize)} kW/proje`
    },
    {
      title: 'Dönüşüm Oranı',
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: FileText,
      color: 'text-purple-600',
      trend: '+2.3% önceki döneme göre',
      trendIcon: TrendingUp
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            {metric.trend && metric.trendIcon && (
              <div className="flex items-center text-xs text-green-600">
                <metric.trendIcon className="h-3 w-3 mr-1" />
                {metric.trend}
              </div>
            )}
            {metric.subtitle && (
              <div className="text-xs text-gray-500">
                {metric.subtitle}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}