'use client'

import dynamic from 'next/dynamic'
import { ComponentLoading, PageLoading } from '@/components/ui/loading'

// Lazy load heavy components with loading states

// 3D Designer - Component not available
// export const LazyDesignerCanvas = dynamic(
//   () => import('@/components/designer/designer-canvas').then(mod => ({ default: mod.DesignerCanvas })),
//   {
//     loading: () => <PageLoading text="3D Designer yükleniyor..." />,
//     ssr: false // Disable SSR for Three.js components
//   }
// )

// Mapbox components - Component not available
// export const LazyMapboxMap = dynamic(
//   () => import('@/components/designer/mapbox-integration').then(mod => ({ default: mod.MapboxIntegration })),
//   {
//     loading: () => <ComponentLoading />,
//     ssr: false // Mapbox requires client-side rendering
//   }
// )

// Chart components - Heavy recharts library
export const LazyChartContainer = dynamic(
  () => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })),
  {
    loading: () => <ComponentLoading />
  }
)

export const LazyLineChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.LineChart })),
  { loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse" /> }
)

export const LazyBarChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.BarChart })),
  { loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse" /> }
)

export const LazyPieChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.PieChart })),
  { loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse" /> }
)

// Complex calculators
export const LazyAgrovoltaicCalculator = dynamic(
  () => import('@/components/farming/agrovoltaic-calculator').then(mod => ({ default: mod.AgrovoltaicCalculator })),
  {
    loading: () => <PageLoading text="Agrovoltaik hesaplayıcı yükleniyor..." />
  }
)

export const LazyFinancingOptions = dynamic(
  () => import('@/components/financing/financing-options').then(mod => ({ default: mod.FinancingOptions })),
  {
    loading: () => <ComponentLoading />
  }
)

export const LazyLoanCalculator = dynamic(
  () => import('@/components/financing/loan-calculator').then(mod => ({ default: mod.LoanCalculator })),
  {
    loading: () => <ComponentLoading />
  }
)

// PDF and document components - Component not available
// export const LazyPDFViewer = dynamic(
//   () => import('@/components/ui/pdf-viewer').then(mod => ({ default: mod.PDFViewer })),
//   {
//     loading: () => <PageLoading text="PDF görüntüleyici yükleniyor..." />,
//     ssr: false
//   }
// )

// Heavy form components
export const LazyQuoteBuilder = dynamic(
  () => import('@/components/quotes/quote-builder').then(mod => ({ default: mod.QuoteBuilder })),
  {
    loading: () => <PageLoading text="Teklif oluşturucu yükleniyor..." />
  }
)

// Admin components - Component not available
// export const LazyUserManagement = dynamic(
//   () => import('@/components/admin/user-management').then(mod => ({ default: mod.UserManagement })),
//   {
//     loading: () => <PageLoading text="Kullanıcı yönetimi yükleniyor..." />
//   }
// )

// Analytics and reporting - Component not available
// export const LazyAnalyticsDashboard = dynamic(
//   () => import('@/components/analytics/dashboard').then(mod => ({ default: mod.AnalyticsDashboard })),
//   {
//     loading: () => <PageLoading text="Analitik panosu yükleniyor..." />
//   }
// )

// Export utility function for dynamic imports
export function withLazyLoading<T>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  options?: {
    loading?: React.ComponentType
    ssr?: boolean
    loadingText?: string
  }
) {
  return dynamic(importFn, {
    loading: options?.loading || (() => <ComponentLoading />) as any,
    ssr: options?.ssr ?? true
  })
}

// Preload functions for critical components - Components not available
// export const preloadDesigner = () => {
//   const componentImport = import('@/components/designer/designer-canvas')
//   const mapboxImport = import('@/components/designer/mapbox-integration')
//   return Promise.all([componentImport, mapboxImport])
// }

export const preloadCharts = () => {
  return import('recharts')
}

export const preloadCalculators = () => {
  const agriImport = import('@/components/farming/agrovoltaic-calculator')
  const financeImport = import('@/components/financing/financing-options')
  return Promise.all([agriImport, financeImport])
}