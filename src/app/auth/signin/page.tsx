import { Metadata } from 'next'
import { SignInForm } from '@/components/forms/signin-form'

export const metadata: Metadata = {
  title: 'Giriş Yap | EnerjiOS',
  description: 'EnerjiOS hesabınıza giriş yapın',
}

export default function SignInPage() {
  const showTestAccounts = process.env.NODE_ENV !== 'production' && process.env.SHOW_TEST_ACCOUNTS === 'true'

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignInForm />
        
        {/* Test Accounts Info - Only shown in development */}
        {showTestAccounts && (
          <div className="mt-8 p-4 bg-white/50 rounded-lg border-l-4 border-orange-500 text-sm text-gray-600">
            <div className="flex items-center mb-2">
              <span className="text-orange-600 font-semibold">🔧 Development Mode</span>
            </div>
            <h3 className="font-semibold mb-2">Test Hesapları:</h3>
            <div className="space-y-1 text-xs">
              <div><strong>Admin:</strong> admin@enerjios.com</div>
              <div><strong>GES Firması:</strong> solar@gesenerji.com</div>
              <div><strong>Müşteri:</strong> ahmet@gmail.com</div>
              <div><strong>Çiftçi:</strong> mehmet@ciftci.com</div>
              <div className="mt-2 text-xs text-gray-500">
                *Tüm test hesaplarının şifresi: admin123, company123, customer123, farmer123
              </div>
            </div>
            <div className="mt-2 text-xs text-red-600 font-medium bg-red-50 p-2 rounded">
              ⚠️ Bu hesaplar sadece development ortamında görünür
            </div>
          </div>
        )}
      </div>
    </div>
  )
}