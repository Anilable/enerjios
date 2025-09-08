import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sun, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Şifre Sıfırla | EnerjiOS',
  description: 'EnerjiOS hesap şifrenizi sıfırlayın',
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                <Sun className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary">EnerjiOS</span>
              </div>
            </div>
            <CardTitle className="text-2xl">Şifre Sıfırla</CardTitle>
            <CardDescription>
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Sıfırlama Bağlantısı Gönder
              </Button>
            </form>

            <div className="text-center">
              <Link 
                href="/auth/signin" 
                className="inline-flex items-center space-x-2 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Giriş sayfasına dön</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
          <p className="font-semibold mb-1">Not:</p>
          <p>Bu özellik henüz aktif değildir. Test hesaplarını kullanarak giriş yapabilirsiniz.</p>
        </div>
      </div>
    </div>
  )
}