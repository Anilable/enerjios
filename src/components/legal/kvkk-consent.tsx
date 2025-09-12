'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { consentTexts, personalDataCategories } from '@/lib/kvkk'
import { Shield, FileText, Eye, Download } from 'lucide-react'

interface KVKKConsentProps {
  required?: boolean
  onConsentChange?: (consents: Record<string, boolean>) => void
  initialConsents?: Record<string, boolean>
}

export default function KVKKConsent({ 
  required = false, 
  onConsentChange,
  initialConsents = {}
}: KVKKConsentProps) {
  const [consents, setConsents] = useState<Record<string, boolean>>(initialConsents)
  const [showDetails, setShowDetails] = useState(false)

  const handleConsentChange = (consentType: string, value: boolean) => {
    const newConsents = { ...consents, [consentType]: value }
    setConsents(newConsents)
    onConsentChange?.(newConsents)
  }

  const requiredConsents = ['registration', 'payment']
  const optionalConsents = ['marketing', 'analytics']

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
      <div className="flex items-start space-x-3">
        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">
            Kişisel Verilerin Korunması (KVKK)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Hizmetlerimizden faydalanabilmeniz için bazı kişisel verilerinizi işlememiz gerekmektedir. 
            KVKK kapsamında haklarınız ve verilerinizin nasıl işlendiği hakkında detaylı bilgi alabilirsiniz.
          </p>

          {/* Required Consents */}
          <div className="space-y-3 mb-4">
            <h4 className="text-sm font-medium text-gray-800">Zorunlu Onaylar:</h4>
            {requiredConsents.map((consentType) => (
              <div key={consentType} className="flex items-start space-x-3">
                <Checkbox
                  id={consentType}
                  checked={consents[consentType] || false}
                  onCheckedChange={(checked) => 
                    handleConsentChange(consentType, checked as boolean)
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <label 
                    htmlFor={consentType}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {consentTexts[consentType as keyof typeof consentTexts].title}
                  </label>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Optional Consents */}
          <div className="space-y-3 mb-4">
            <h4 className="text-sm font-medium text-gray-800">İsteğe Bağlı Onaylar:</h4>
            {optionalConsents.map((consentType) => (
              <div key={consentType} className="flex items-start space-x-3">
                <Checkbox
                  id={consentType}
                  checked={consents[consentType] || false}
                  onCheckedChange={(checked) => 
                    handleConsentChange(consentType, checked as boolean)
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <label 
                    htmlFor={consentType}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {consentTexts[consentType as keyof typeof consentTexts].title}
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Detayları Görüntüle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Kişisel Verilerin Korunması Detayları</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh] pr-4">
                  <KVKKDetails />
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" asChild>
              <a href="/api/legal/kvkk-policy" download>
                <Download className="w-4 h-4 mr-2" />
                KVKK Politikası PDF
              </a>
            </Button>

            <Button variant="outline" size="sm" asChild>
              <a href="/legal/data-request" target="_blank">
                <FileText className="w-4 h-4 mr-2" />
                Veri Talebi
              </a>
            </Button>
          </div>

          {required && (!consents.registration || !consents.payment) && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-700">
                <strong>Uyarı:</strong> Devam etmek için zorunlu onayları vermeniz gerekmektedir.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KVKKDetails() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">İşlenen Kişisel Veri Kategorileri</h3>
        <div className="grid gap-4">
          {personalDataCategories.map((category, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h4 className="font-medium mb-2 capitalize">{category.category}</h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <strong>Veri Türleri:</strong>
                  <ul className="list-disc list-inside mt-1 text-gray-600">
                    {category.dataTypes.map((type, i) => (
                      <li key={i}>{type}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>İşleme Amaçları:</strong>
                  <ul className="list-disc list-inside mt-1 text-gray-600">
                    {category.purposes.map((purpose, i) => (
                      <li key={i}>{purpose}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Hukuki Dayanak:</strong>
                  <span className="text-gray-600 ml-2">{category.legalBasis}</span>
                </div>
                <div>
                  <strong>Saklama Süresi:</strong>
                  <span className="text-gray-600 ml-2">{category.retentionPeriod}</span>
                </div>
                {category.sharingWithThirdParties && category.thirdParties && (
                  <div className="md:col-span-2">
                    <strong>Paylaşılan 3. Taraflar:</strong>
                    <span className="text-gray-600 ml-2">{category.thirdParties.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">KVKK Kapsamındaki Haklarınız</h3>
        <div className="grid gap-2">
          {[
            'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
            'İşlenmişse bu konuda bilgi talep etme',
            'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme',
            'Aktarıldığı üçüncü kişileri bilme',
            'Eksik veya yanlış işlenmişse düzeltilmesini isteme',
            'Silinmesini veya yok edilmesini isteme',
            'Düzeltme/silme işlemlerinin üçüncü kişilere bildirilmesini isteme',
            'Otomatik sistemlerle analiz edilmesine itiraz etme',
            'Kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme'
          ].map((right, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">{right}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">İletişim Bilgileri</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm">
            <strong>Veri Sorumlusu:</strong> Trakya Solar Enerji Sistemleri A.Ş.<br />
            <strong>Adres:</strong> Keşan, Edirne<br />
            <strong>E-posta:</strong> kvkk@trakyasolar.com<br />
            <strong>Telefon:</strong> +90 284 XXX XX XX
          </p>
        </div>
      </div>
    </div>
  )
}