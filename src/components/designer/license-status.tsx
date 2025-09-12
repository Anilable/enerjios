'use client'

import { useLicenseValidation } from '@/hooks/use-license-validation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Crown, 
  Star, 
  Calendar,
  AlertTriangle,
  Zap
} from 'lucide-react'

const licenseTypeIcons = {
  BASIC: Shield,
  PROFESSIONAL: Star,
  ENTERPRISE: Crown
}

const licenseTypeColors = {
  BASIC: 'bg-blue-50 border-blue-200 text-blue-800',
  PROFESSIONAL: 'bg-purple-50 border-purple-200 text-purple-800',
  ENTERPRISE: 'bg-gold-50 border-yellow-200 text-yellow-800'
}

const licenseTypeLabels = {
  BASIC: 'Temel',
  PROFESSIONAL: 'Profesyonel', 
  ENTERPRISE: 'Kurumsal'
}

interface LicenseStatusProps {
  compact?: boolean
}

export function LicenseStatus({ compact = false }: LicenseStatusProps) {
  const { licenseInfo, isLoading, error } = useLicenseValidation()

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
        <span>Lisans kontrol ediliyor...</span>
      </div>
    )
  }

  if (error || !licenseInfo) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Lisans doğrulanamadı. Lütfen internet bağlantınızı kontrol edin.
        </AlertDescription>
      </Alert>
    )
  }

  if (!licenseInfo.isValid) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <ShieldX className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Geçersiz lisans. Lütfen lisansınızı yenileyin.
        </AlertDescription>
      </Alert>
    )
  }

  const Icon = licenseTypeIcons[licenseInfo.licenseType]
  const expiryDate = new Date(licenseInfo.expiryDate)
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const isExpiringSoon = daysUntilExpiry <= 7

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Badge className={licenseTypeColors[licenseInfo.licenseType]}>
          <Icon className="w-3 h-3 mr-1" />
          {licenseTypeLabels[licenseInfo.licenseType]}
        </Badge>
        {isExpiringSoon && (
          <Badge variant="destructive" className="animate-pulse">
            {daysUntilExpiry} gün
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            Lisans Durumu
          </CardTitle>
          <Badge className={licenseTypeColors[licenseInfo.licenseType]}>
            <Icon className="w-3 h-3 mr-1" />
            {licenseTypeLabels[licenseInfo.licenseType]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Expiry Warning */}
        {isExpiringSoon && (
          <Alert className="border-orange-200 bg-orange-50">
            <Calendar className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Lisansınız {daysUntilExpiry} gün içinde sona erecek!
            </AlertDescription>
          </Alert>
        )}

        {/* License Limits */}
        <div className="space-y-2 text-xs">
          {licenseInfo.projectsRemaining !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kalan Proje:</span>
              <span className="font-medium">
                {licenseInfo.features.unlimitedProjects ? 'Sınırsız' : licenseInfo.projectsRemaining}
              </span>
            </div>
          )}
          
          {licenseInfo.maxRoofArea !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Çatı Alanı:</span>
              <span className="font-medium">
                {licenseInfo.licenseType === 'ENTERPRISE' ? 'Sınırsız' : `${licenseInfo.maxRoofArea}m²`}
              </span>
            </div>
          )}
          
          {licenseInfo.maxPanels !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Panel:</span>
              <span className="font-medium">
                {licenseInfo.licenseType === 'ENTERPRISE' ? 'Sınırsız' : `${licenseInfo.maxPanels} adet`}
              </span>
            </div>
          )}
        </div>

        {/* Feature List */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Özellikler:</div>
          <div className="grid grid-cols-1 gap-1 text-xs">
            <div className="flex items-center justify-between">
              <span>Çatı Çizimi</span>
              {licenseInfo.features.roofDrawing ? (
                <ShieldCheck className="w-3 h-3 text-green-600" />
              ) : (
                <ShieldX className="w-3 h-3 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Panel Yerleştirme</span>
              {licenseInfo.features.panelPlacement ? (
                <ShieldCheck className="w-3 h-3 text-green-600" />
              ) : (
                <ShieldX className="w-3 h-3 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Gelişmiş Hesaplamalar</span>
              {licenseInfo.features.advancedCalculations ? (
                <ShieldCheck className="w-3 h-3 text-green-600" />
              ) : (
                <ShieldX className="w-3 h-3 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Dışa Aktarma</span>
              {licenseInfo.features.exportFeatures ? (
                <ShieldCheck className="w-3 h-3 text-green-600" />
              ) : (
                <ShieldX className="w-3 h-3 text-red-600" />
              )}
            </div>
          </div>
        </div>

        {/* Upgrade Button for non-enterprise users */}
        {licenseInfo.licenseType !== 'ENTERPRISE' && (
          <Button size="sm" className="w-full">
            <Zap className="w-3 h-3 mr-1" />
            Lisansı Yükselt
          </Button>
        )}
      </CardContent>
    </Card>
  )
}