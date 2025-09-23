import { requireAuth } from '@/lib/auth-utils'
import { checkApiPermissions } from '@/lib/permissions'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield } from 'lucide-react'
import { FinanceClient } from './finance-client'



export default async function FinancePage() {
  const user = await requireAuth()

  // Check if user has permission to access financial data
  const hasFinanceAccess = checkApiPermissions(
    user.role as any,
    user.id,
    ['finance:read'],
    undefined // User object doesn't have companyId field
  )

  if (!hasFinanceAccess) {
    return (
      <DashboardLayout title="Finans Yönetimi">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Bu sayfaya erişim yetkiniz bulunmamaktadır. Finansal verileri görüntülemek için gerekli izinlere sahip değilsiniz.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Finans Yönetimi">
      <FinanceClient />
    </DashboardLayout>
  )
}