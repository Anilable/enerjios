import { requireAuth } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SettingsClient } from '@/components/settings/SettingsClient'

export default async function SettingsPage() {
  const user = await requireAuth()

  return (
    <DashboardLayout title="Ayarlar">
      <SettingsClient />
    </DashboardLayout>
  )
}