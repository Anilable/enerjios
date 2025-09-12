import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Veritabanı Yönetimi | EnerjiOS',
  description: 'Veritabanı durumu, performans metrikleri, yedekleme ve güvenlik yönetimi',
}

export default function DatabaseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}