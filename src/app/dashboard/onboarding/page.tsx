'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import {
  Upload,
  Building,
  FileImage,
  Stamp,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Download
} from 'lucide-react'

export default function OnboardingPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState(1)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [stampFile, setStampFile] = useState<File | null>(null)
  const [stampPreview, setStampPreview] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [companyData, setCompanyData] = useState({
    hasLogo: false,
    hasStamp: false,
    logoUrl: '',
    stampUrl: ''
  })

  useEffect(() => {
    // Check if user needs onboarding
    checkOnboardingStatus()
  }, [session])

  const checkOnboardingStatus = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/company/onboarding-status')
      if (response.ok) {
        const data = await response.json()
        setCompanyData(data)

        // If already completed, redirect to dashboard
        if (data.hasLogo && data.hasStamp) {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'stamp') => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Hata',
        description: 'Lütfen bir resim dosyası seçin',
        variant: 'destructive'
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Hata',
        description: 'Dosya boyutu maksimum 5MB olmalıdır',
        variant: 'destructive'
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      if (type === 'logo') {
        setLogoFile(file)
        setLogoPreview(reader.result as string)
      } else {
        setStampFile(file)
        setStampPreview(reader.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const uploadFile = async (file: File, type: 'logo' | 'stamp') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await fetch('/api/company/upload-document', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Failed to upload ${type}`)
    }

    return response.json()
  }

  const handleUploadLogo = async () => {
    if (!logoFile) {
      toast({
        title: 'Hata',
        description: 'Lütfen bir logo dosyası seçin',
        variant: 'destructive'
      })
      return
    }

    setIsUploading(true)
    try {
      const result = await uploadFile(logoFile, 'logo')
      setCompanyData(prev => ({
        ...prev,
        hasLogo: true,
        logoUrl: result.url
      }))
      setCurrentStep(2)
      toast({
        title: 'Başarılı',
        description: 'Logo başarıyla yüklendi'
      })
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Logo yüklenirken bir hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadStamp = async () => {
    if (!stampFile) {
      toast({
        title: 'Hata',
        description: 'Lütfen bir kaşe dosyası seçin',
        variant: 'destructive'
      })
      return
    }

    setIsUploading(true)
    try {
      const result = await uploadFile(stampFile, 'stamp')
      setCompanyData(prev => ({
        ...prev,
        hasStamp: true,
        stampUrl: result.url
      }))

      // Mark onboarding as complete
      await fetch('/api/company/complete-onboarding', {
        method: 'POST'
      })

      // Update session
      await update()

      toast({
        title: 'Başarılı',
        description: 'Kaşe başarıyla yüklendi. Yönlendiriliyorsunuz...'
      })

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Kaşe yüklenirken bir hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const progress = companyData.hasLogo ? (companyData.hasStamp ? 100 : 50) : 0

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Firma Bilgilerini Tamamlayın</h1>
          <p className="text-gray-600">
            Sistemi kullanmaya başlamadan önce firma bilgilerinizi tamamlamanız gerekmektedir.
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">İlerleme</span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />

            <div className="flex justify-between mt-4">
              <div className={`flex items-center gap-2 ${companyData.hasLogo ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  companyData.hasLogo ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {companyData.hasLogo ? <CheckCircle className="w-5 h-5" /> : <span>1</span>}
                </div>
                <span className="text-sm font-medium">Logo Yükleme</span>
              </div>

              <div className={`flex items-center gap-2 ${companyData.hasStamp ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  companyData.hasStamp ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {companyData.hasStamp ? <CheckCircle className="w-5 h-5" /> : <span>2</span>}
                </div>
                <span className="text-sm font-medium">Kaşe Yükleme</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Logo Upload */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="w-5 h-5" />
                Firma Logosu
              </CardTitle>
              <CardDescription>
                Firma logonuzu yükleyin. Bu logo tekliflerinizde ve belgelerinizde kullanılacaktır.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Logo dosyanız PNG, JPG veya SVG formatında olmalıdır. Maksimum dosya boyutu 5MB.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Label htmlFor="logo">Logo Dosyası</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'logo')}
                  disabled={isUploading}
                />

                {logoPreview && (
                  <div className="mt-4">
                    <Label>Önizleme</Label>
                    <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="max-w-xs max-h-40 object-contain"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={handleUploadLogo}
                    disabled={!logoFile || isUploading}
                    className="flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>Yükleniyor...</>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Logo Yükle
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Stamp Upload */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stamp className="w-5 h-5" />
                Firma Kaşesi
              </CardTitle>
              <CardDescription>
                Firma kaşenizi yükleyin. Bu kaşe resmi belgelerinizde kullanılacaktır.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Kaşe dosyanız PNG veya JPG formatında olmalıdır. Maksimum dosya boyutu 5MB.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Label htmlFor="stamp">Kaşe Dosyası</Label>
                <Input
                  id="stamp"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'stamp')}
                  disabled={isUploading}
                />

                {stampPreview && (
                  <div className="mt-4">
                    <Label>Önizleme</Label>
                    <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center">
                      <img
                        src={stampPreview}
                        alt="Stamp preview"
                        className="max-w-xs max-h-40 object-contain"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    disabled={isUploading}
                  >
                    Geri
                  </Button>
                  <Button
                    onClick={handleUploadStamp}
                    disabled={!stampFile || isUploading}
                    className="flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>Yükleniyor...</>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Kaşe Yükle ve Tamamla
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Building className="w-8 h-8 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Neden Bu Bilgiler Gerekli?</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Logo ve kaşeniz, oluşturduğunuz tekliflerde otomatik olarak yer alacaktır</li>
                  <li>• Müşterilerinize profesyonel görünümlü belgeler sunabileceksiniz</li>
                  <li>• Tüm belgelerinizde kurumsal kimliğiniz korunacaktır</li>
                  <li>• Bu bilgiler güvenli bir şekilde saklanacak ve sadece sizin belgelerinizde kullanılacaktır</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}