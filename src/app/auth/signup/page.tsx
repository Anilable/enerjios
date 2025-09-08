import { Metadata } from 'next'
import { SignUpForm } from '@/components/forms/signup-form'

export const metadata: Metadata = {
  title: 'Kayıt Ol | EnerjiOS',
  description: 'Trakya Solar\'a katılın ve güneş enerjisinin gücünü keşfedin',
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignUpForm />
      </div>
    </div>
  )
}