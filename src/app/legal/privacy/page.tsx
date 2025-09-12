import { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Database, Users, Globe, Lock, Eye, Download, Mail } from 'lucide-react'
import { personalDataCategories, dataSubjectRights } from '@/lib/kvkk'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası ve KVKK | EnerjiOS',
  description: 'EnerjiOS kişisel verilerin korunması politikası, KVKK uyumluluğu ve gizlilik bilgileri.',
  robots: 'index, follow'
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Gizlilik Politikası ve KVKK
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Kişisel verilerinizin güvenliği bizim için önceliktir. 
            6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında haklarınız ve sorumluluklarımız.
          </p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Badge variant="outline">Son güncellenme: {new Date().toLocaleDateString('tr-TR')}</Badge>
            <Badge variant="outline">KVKK Uyumlu</Badge>
          </div>
        </div>

        <div className="space-y-8">
          {/* Data Controller Info */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Veri Sorumlusu Bilgileri</h2>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Şirket:</strong> EnerjiOS Enerji Sistemleri A.Ş.</p>
                  <p><strong>Adres:</strong> Atatürk Bulvarı No:123, Keşan/Edirne</p>
                  <p><strong>KVKK İletişim:</strong> kvkk@enerjios.com</p>
                </div>
                <div>
                  <p><strong>Telefon:</strong> +90 284 XXX XX XX</p>
                  <p><strong>Sicil No:</strong> 0123456789012345</p>
                  <p><strong>KEP Adresi:</strong> trakyasolar@hs03.kep.tr</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Data Categories */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Users className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold">İşlenen Kişisel Veri Kategorileri</h2>
            </div>
            
            <div className="grid gap-6">
              {personalDataCategories.map((category, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-lg capitalize flex items-center space-x-2">
                      {category.category === 'identity' && <Shield className="w-5 h-5" />}
                      {category.category === 'contact' && <Mail className="w-5 h-5" />}
                      {category.category === 'financial' && <Database className="w-5 h-5" />}
                      {category.category === 'location' && <Globe className="w-5 h-5" />}
                      {category.category === 'technical' && <Lock className="w-5 h-5" />}
                      {category.category === 'commercial' && <Users className="w-5 h-5" />}
                      <span>{category.category}</span>
                    </h3>
                    <Badge variant={category.legalBasis === 'consent' ? 'default' : 'secondary'}>
                      {category.legalBasis}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Veri Türleri:</h4>
                      <ul className="space-y-1">
                        {category.dataTypes.map((type, i) => (
                          <li key={i} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            <span className="text-gray-600">{type}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">İşleme Amaçları:</h4>
                      <ul className="space-y-1">
                        {category.purposes.map((purpose, i) => (
                          <li key={i} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            <span className="text-gray-600">{purpose}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <h4 className="font-medium text-gray-800">Saklama Süresi:</h4>
                        <p className="text-gray-600">{category.retentionPeriod}</p>
                      </div>
                      
                      {category.sharingWithThirdParties && category.thirdParties && (
                        <div>
                          <h4 className="font-medium text-gray-800">3. Taraflar:</h4>
                          <p className="text-gray-600 text-xs">{category.thirdParties.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Data Subject Rights */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Eye className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold">KVKK Kapsamındaki Haklarınız</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {dataSubjectRights.map((right, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-purple-600">{index + 1}</span>
                  </div>
                  <span className="text-sm text-gray-700">{right}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium mb-2">Haklarınızı Nasıl Kullanabilirsiniz?</h3>
              <p className="text-sm text-gray-700 mb-4">
                KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki yöntemlerle bizimle iletişime geçebilirsiniz:
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="/legal/data-request">
                    <Eye className="w-4 h-4 mr-2" />
                    Online Başvuru
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="mailto:kvkk@enerjios.com">
                    <Mail className="w-4 h-4 mr-2" />
                    E-posta Gönder
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/api/legal/kvkk-application-form" download>
                    <Download className="w-4 h-4 mr-2" />
                    Başvuru Formu
                  </a>
                </Button>
              </div>
            </div>
          </Card>

          {/* Data Security */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold">Veri Güvenliği</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Teknik Güvenlik Önlemleri</h3>
                <ul className="space-y-2 text-sm">
                  {[
                    'SSL/TLS şifreleme (256-bit)',
                    'İki faktörlü kimlik doğrulama',
                    'Güvenlik duvarı ve DDoS koruması',
                    'Düzenli güvenlik güncellemeleri',
                    'Veri yedekleme ve kurtarma',
                    'Erişim logları ve izleme'
                  ].map((measure, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-gray-700">{measure}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-3">İdari Güvenlik Önlemleri</h3>
                <ul className="space-y-2 text-sm">
                  {[
                    'Personel gizlilik anlaşmaları',
                    'KVKK farkındalık eğitimleri',
                    'Erişim yetki kontrolü',
                    'Düzenli güvenlik denetimleri',
                    'Veri ihlali müdahale planı',
                    'Üçüncü taraf güvenlik denetimleri'
                  ].map((measure, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-700">{measure}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Cookies Policy */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold">Çerez (Cookie) Politikası</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">
                Web sitemizde kullanıcı deneyimini iyileştirmek ve analiz yapmak amacıyla çerezler kullanılmaktadır.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium text-green-600 mb-2">Zorunlu Çerezler</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Oturum yönetimi</li>
                    <li>• Güvenlik token'ları</li>
                    <li>• Dil tercihleri</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium text-blue-600 mb-2">Analitik Çerezler</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Google Analytics</li>
                    <li>• Sayfa görüntüleme</li>
                    <li>• Kullanıcı davranışı</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium text-purple-600 mb-2">Pazarlama Çerezleri</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Kişiselleştirilmiş içerik</li>
                    <li>• Kampanya takibi</li>
                    <li>• Sosyal medya entegrasyonu</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact and Updates */}
          <Card className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">İletişim ve Güncellemeler</h2>
              <p className="text-gray-600 mb-6">
                Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçin. 
                Politika güncellemelerinden haberdar olmak için e-posta listemize katılabilirsiniz.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="default" asChild>
                  <a href="mailto:kvkk@enerjios.com">
                    <Mail className="w-4 h-4 mr-2" />
                    KVKK İletişim
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/legal/data-request">
                    <Eye className="w-4 h-4 mr-2" />
                    Veri Talebi
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/api/legal/privacy-policy-pdf" download>
                    <Download className="w-4 h-4 mr-2" />
                    PDF İndir
                  </a>
                </Button>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 py-6 border-t">
            <p>
              Bu gizlilik politikası {new Date().getFullYear()} yılında güncellenmiştir ve 
              6698 sayılı Kişisel Verilerin Korunması Kanunu'na uygundur.
            </p>
            <p className="mt-2">
              <strong>EnerjiOS</strong> - Güvenilir güneş enerjisi çözümleri
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}