import { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Calendar, MapPin, Phone, Mail, Scale, Shield, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Hizmet Şartları ve Kullanım Koşulları | EnerjiOS',
  description: 'EnerjiOS güneş enerjisi sistemleri hizmet şartları, kullanım koşulları ve yasal bilgiler.',
  robots: 'index, follow'
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hizmet Şartları ve Kullanım Koşulları
          </h1>
          <p className="text-gray-600">
            Son güncellenme: {new Date().toLocaleDateString('tr-TR')}
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-8">
            {/* Company Info */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Scale className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Şirket Bilgileri</h2>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <p><strong>Ünvanı:</strong> EnerjiOS Enerji Sistemleri Anonim Şirketi</p>
                <p><strong>Mersis No:</strong> 0123456789012345</p>
                <p><strong>Vergi No:</strong> 1234567890</p>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span><strong>Adres:</strong> Atatürk Bulvarı No:123, Keşan/Edirne</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span><strong>Telefon:</strong> +90 284 XXX XX XX</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span><strong>E-posta:</strong> info@enerjios.com</span>
                </div>
              </div>
            </section>

            <Separator />

            {/* Service Terms */}
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Hizmet Kapsamı</h2>
              <div className="space-y-4">
                <h3 className="font-medium">1.1. Sunulan Hizmetler</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Güneş enerjisi sistem tasarımı ve hesaplamaları</li>
                  <li>Çatı üstü güneş paneli kurulumu</li>
                  <li>Tarımsal güneş enerjisi sistemleri (Agri-PV)</li>
                  <li>Elektrik üretim lisansı başvuru desteği</li>
                  <li>Finansman ve leasing danışmanlığı</li>
                  <li>Sistem bakım ve teknik destek hizmetleri</li>
                  <li>YEKDEM başvuru süreçleri</li>
                </ul>

                <h3 className="font-medium mt-6">1.2. Hizmet Süreci</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-3">
                    <strong>Ön Değerlendirme:</strong>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      <li>Online hesaplama ve teklif</li>
                      <li>Uydu görüntüleri analizi</li>
                      <li>İlk finansal değerlendirme</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-3">
                    <strong>Teknik Keşif:</strong>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      <li>Saha ziyareti ve ölçüm</li>
                      <li>Çatı analizi ve güvenlik kontrolü</li>
                      <li>Elektrik altyapı incelemesi</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-3">
                    <strong>Proje Tasarımı:</strong>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      <li>3D sistem tasarımı</li>
                      <li>Detaylı finansal analiz</li>
                      <li>İzin ve lisans başvuruları</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-3">
                    <strong>Kurulum:</strong>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      <li>Profesyonel ekip kurulumu</li>
                      <li>Test ve devreye alma</li>
                      <li>Garanti ve belge teslimi</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Payment Terms */}
            <section>
              <h2 className="text-xl font-semibold mb-4">2. Ödeme Koşulları</h2>
              <div className="space-y-4">
                <h3 className="font-medium">2.1. Ödeme Planı</h3>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li><strong>Sözleşme imzası:</strong> Toplam bedelin %30'u</li>
                    <li><strong>Malzeme tedariği:</strong> Toplam bedelin %40'ı</li>
                    <li><strong>Kurulum tamamlanması:</strong> Toplam bedelin %30'u</li>
                  </ul>
                </div>

                <h3 className="font-medium">2.2. Ödeme Yöntemleri</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Banka havalesi (EFT/SWIFT)</li>
                  <li>Kredi kartı (İyzico güvenli ödeme sistemi)</li>
                  <li>Finansman ve leasing seçenekleri</li>
                  <li>KOSGEB ve diğer devlet destekleri</li>
                </ul>

                <h3 className="font-medium">2.3. Fiyat Politikası</h3>
                <p className="text-gray-700">
                  Verilen teklifler 30 gün süreyle geçerlidir. Bu süre sonunda döviz kurları, 
                  malzeme fiyatları veya vergi oranlarındaki değişiklikler nedeniyle 
                  fiyat güncellemesi yapılabilir.
                </p>
              </div>
            </section>

            <Separator />

            {/* Warranty Terms */}
            <section>
              <h2 className="text-xl font-semibold mb-4">3. Garanti Koşulları</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">3.1. Ürün Garantileri</h3>
                  <div className="space-y-3">
                    <div className="border-l-4 border-green-500 pl-3">
                      <strong>Güneş Panelleri:</strong>
                      <p className="text-sm text-gray-600">25 yıl performans garantisi</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-3">
                      <strong>İnvertörler:</strong>
                      <p className="text-sm text-gray-600">10-25 yıl arası (marka bazında)</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-3">
                      <strong>Montaj Malzemeleri:</strong>
                      <p className="text-sm text-gray-600">15 yıl yapısal garanti</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-3">3.2. Hizmet Garantileri</h3>
                  <div className="space-y-3">
                    <div className="border-l-4 border-orange-500 pl-3">
                      <strong>İşçilik:</strong>
                      <p className="text-sm text-gray-600">2 yıl kurulum garantisi</p>
                    </div>
                    <div className="border-l-4 border-red-500 pl-3">
                      <strong>Su Yalıtımı:</strong>
                      <p className="text-sm text-gray-600">10 yıl sızıntı garantisi</p>
                    </div>
                    <div className="border-l-4 border-teal-500 pl-3">
                      <strong>Sistem Performansı:</strong>
                      <p className="text-sm text-gray-600">5 yıl üretim garantisi</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Garanti Kapsamı Dışı Durumlar:</h4>
                    <ul className="list-disc list-inside text-sm text-amber-700 mt-2 space-y-1">
                      <li>Doğal afetler (deprem, sel, fırtına)</li>
                      <li>Hatalı kullanım veya yetkisiz müdahale</li>
                      <li>Elektrik şebekesinden kaynaklanan sorunlar</li>
                      <li>Normal aşınma ve yıpranma</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Legal Terms */}
            <section>
              <h2 className="text-xl font-semibold mb-4">4. Yasal Hüküm ve Koşullar</h2>
              <div className="space-y-4">
                <h3 className="font-medium">4.1. Sorumluluk Sınırlaması</h3>
                <p className="text-gray-700">
                  Şirketimiz, hizmet verdiği sistem kapsamında öngörülemeyen teknik arızalar, 
                  doğal afetler veya üçüncü kişilerin neden olduğu zararlardan sorumlu değildir. 
                  Sorumluluk sınırımız sözleşme bedelini aşmaz.
                </p>

                <h3 className="font-medium">4.2. Mücbir Sebepler</h3>
                <p className="text-gray-700">
                  Deprem, sel, yangın, savaş, pandemi, grev, hükümet kararları gibi 
                  öngörülemeyen olaylar nedeniyle oluşan gecikmelerden sorumlu değiliz.
                </p>

                <h3 className="font-medium">4.3. Uygulanacak Hukuk</h3>
                <p className="text-gray-700">
                  Bu sözleşme Türkiye Cumhuriyeti kanunlarına tabidir. 
                  Ortaya çıkabilecek uyuşmazlıklarda Edirne Mahkemeleri yetkilidir.
                </p>

                <h3 className="font-medium">4.4. KVKK Uyumluluğu</h3>
                <p className="text-gray-700">
                  Kişisel verileriniz 6698 sayılı Kişisel Verilerin Korunması Kanunu 
                  kapsamında işlenir. Detaylı bilgi için 
                  <a href="/legal/kvkk" className="text-blue-600 hover:underline ml-1">
                    KVKK Politikamızı
                  </a> inceleyebilirsiniz.
                </p>
              </div>
            </section>

            <Separator />

            {/* Contact */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Phone className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">İletişim ve Destek</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Teknik Destek</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Telefon:</strong> +90 284 XXX XX XX<br />
                    <strong>E-posta:</strong> destek@enerjios.com<br />
                    <strong>Çalışma Saatleri:</strong> Pazartesi-Cuma 08:00-18:00
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Satış Danışmanlığı</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Telefon:</strong> +90 284 XXX XX XX<br />
                    <strong>E-posta:</strong> satis@enerjios.com<br />
                    <strong>WhatsApp:</strong> +90 5XX XXX XX XX
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 mt-12 pt-6 border-t">
              <p>
                Bu belge {new Date().getFullYear()} yılında güncellenmiştir. 
                Şartlar ve koşullar önceden haber verilmeksizin değiştirilebilir.
              </p>
              <p className="mt-2">
                <strong>EnerjiOS Enerji Sistemleri A.Ş.</strong> - 
                Türkiye'nin güvenilir güneş enerjisi partneri
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}