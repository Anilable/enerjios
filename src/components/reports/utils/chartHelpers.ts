export const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00']

export function getProjectStatusData(data: any[]) {
  const statusCounts = data.reduce((acc, project) => {
    const status = project.status || 'UNKNOWN'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(statusCounts).map(([name, value]) => ({
    name: getStatusDisplayName(name),
    value
  }))
}

function getStatusDisplayName(status: string): string {
  const statusMap: Record<string, string> = {
    'PLANNING': 'Planlama',
    'IN_PROGRESS': 'Devam Ediyor',
    'COMPLETED': 'Tamamlandı',
    'ON_HOLD': 'Beklemede',
    'CANCELLED': 'İptal Edildi',
    'UNKNOWN': 'Bilinmiyor'
  }
  
  return statusMap[status] || status
}

export function formatChartTooltip(value: any, name: string) {
  if (name === 'Tutar' || name === 'Gelir' || name === 'Karlılık/kW') {
    return [`₺${value.toLocaleString('tr-TR')}`, name]
  }
  return [value, name]
}

export function formatPeriodLabel(label: string): string {
  return `Dönem: ${label}`
}