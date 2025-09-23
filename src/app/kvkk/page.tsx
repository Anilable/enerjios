import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Shield,
  FileText,
  Download,
  Mail,
  Phone,
  MapPin,
  Scale,
  Calendar,
  Users,
  Database,
  Share2,
  Trash2,
  Eye,
  ArrowLeft
} from 'lucide-react'

export default function KVKKPage() {
  const lastUpdated = "15 Aralık 2024"

  const tableOfContents = [
    { id: 'veri-sorumlusu', title: 'Veri Sorumlusu Bilgileri' },
    { id: 'islenen-veriler', title: 'İşlenen Kişisel Veriler' },
    { id: 'isleme-amaclari', title: 'Verilerin İşlenme Amaçları' },
    { id: 'veri-aktarimi', title: 'Veri Aktarımı' },
    { id: 'saklama-sureleri', title: 'Veri Saklama Süreleri' },
    { id: 'veri-sahibi-haklari', title: 'Veri Sahibi Hakları' },
    { id: 'iletisim', title: 'İletişim Bilgileri' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/" className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Ana Sayfaya Dön
            </Link>
          </div>

          <div className="flex items-start gap-6">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                KVKK Aydınlatma Metni
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında
                kişisel verilerinizin işlenmesine ilişkin aydınlatma metni
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Son güncelleme: {lastUpdated}
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  PDF İndir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    İçindekiler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    {tableOfContents.map((item, index) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="block text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {index + 1}. {item.title}
                      </a>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Veri Sorumlusu Bilgileri */}
            <section id="veri-sorumlusu">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    1. Veri Sorumlusu Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Kişisel verilerinizin işlenme amaçlarını ve yöntemlerini belirleyen,
                    veri kayıt sisteminin kurulmasından ve yönetilmesinden sorumlu olan veri sorumlusu bilgileri:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Şirket Bilgileri</h4>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                          <p><strong>Platform:</strong> EnerjiOS</p>
                          <p><strong>Web Sitesi:</strong> enerjios.com</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">İletişim Bilgileri</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Mail className="h-4 w-4" />
                            info@enerjios.com
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">KVKK İletişim</h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          info@enerjios.com
                        </div>
                        <p className="text-xs">
                          Kişisel veri başvurularınız için özel iletişim kanalı
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* İşlenen Kişisel Veriler */}
            <section id="islenen-veriler">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    2. İşlenen Kişisel Veriler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Platform üzerinden topladığımız ve işlediğimiz kişisel veri kategorileri:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Kimlik Verileri</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <li>• Ad, soyad</li>
                            <li>• T.C. Kimlik Numarası</li>
                            <li>• Pasaport numarası (yabancı uyruklu)</li>
                            <li>• Doğum tarihi</li>
                            <li>• Profil fotoğrafı</li>
                          </ul>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">İletişim Verileri</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <li>• E-posta adresi</li>
                            <li>• Telefon numarası</li>
                            <li>• Posta adresi</li>
                            <li>• İl, ilçe bilgileri</li>
                          </ul>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Müşteri İşlem Verileri</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <li>• Teklif talepleri</li>
                            <li>• Proje bilgileri</li>
                            <li>• Sözleşme verileri</li>
                            <li>• Sipariş geçmişi</li>
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Teknik Veriler</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <li>• IP adresi</li>
                            <li>• Çerez verileri</li>
                            <li>• Tarayıcı bilgileri</li>
                            <li>• Oturum kayıtları</li>
                            <li>• Site kullanım istatistikleri</li>
                          </ul>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Finansal Veriler</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <li>• Fatura bilgileri</li>
                            <li>• Ödeme kayıtları</li>
                            <li>• Vergi bilgileri</li>
                            <li>• Banka hesap bilgileri</li>
                          </ul>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Konum Verileri</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <li>• Proje konumu</li>
                            <li>• GPS koordinatları</li>
                            <li>• Adres bilgileri</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Verilerin İşlenme Amaçları */}
            <section id="isleme-amaclari">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Scale className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    3. Verilerin İşlenme Amaçları
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Kişisel verilerinizi aşağıdaki amaçlarla ve KVKK'nın 5. ve 6. maddelerinde
                      belirtilen kişisel veri işleme şartları dahilinde işlemekteyiz:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Hizmet Sunumu</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <li>• Platform hizmetlerinin sunulması</li>
                          <li>• Güneş enerjisi sistemi teklif hazırlama</li>
                          <li>• Proje yönetimi ve takibi</li>
                          <li>• Teknik destek sağlama</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Müşteri İlişkileri</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <li>• İletişim kurulması</li>
                          <li>• Müşteri memnuniyeti araştırmaları</li>
                          <li>• Şikayet ve önerilerin değerlendirilmesi</li>
                          <li>• After-sales desteği</li>
                        </ul>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Yasal Yükümlülükler</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <li>• Vergi mevzuatı gereği kayıt tutma</li>
                          <li>• Ticaret kanunu yükümlülükleri</li>
                          <li>• EPDK raporlama gereklilikleri</li>
                          <li>• Resmi makam talepleri</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">İç Raporlama</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <li>• İş analizi ve raporlama</li>
                          <li>• Kalite kontrol süreçleri</li>
                          <li>• Risk yönetimi</li>
                          <li>• Performans değerlendirme</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Pazarlama Faaliyetleri (Ayrı Rıza İle)</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Açık rızanız dahilinde pazarlama e-postaları, kampanya bildirimleri ve
                        kişiselleştirilmiş ürün önerileri gönderebiliriz. Bu rızanızı istediğiniz
                        zaman geri çekebilirsiniz.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Veri Aktarımı */}
            <section id="veri-aktarimi">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <Share2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    4. Veri Aktarımı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Kişisel verileriniz, KVKK'nın 8. ve 9. maddelerinde belirtilen şartlara uygun
                      olarak aşağıdaki taraflarla paylaşılabilir:
                    </p>

                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Hizmet Sağlayıcılar</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <li>• Bulut hizmet sağlayıcıları (AWS, Google Cloud)</li>
                          <li>• Ödeme hizmet sağlayıcıları</li>
                          <li>• E-posta servisi sağlayıcıları</li>
                          <li>• Analitik hizmet sağlayıcıları</li>
                        </ul>
                      </div>

                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">İş Ortakları</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <li>• Yetkili bayi ve distribütörler</li>
                          <li>• Kurulum firmaları</li>
                          <li>• Finansman sağlayıcıları</li>
                          <li>• Sigorta şirketleri</li>
                        </ul>
                      </div>

                      <div className="border-l-4 border-orange-500 pl-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Resmi Makamlar</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <li>• Vergi daireleri</li>
                          <li>• EPDK (Enerji Piyasası Düzenleme Kurumu)</li>
                          <li>• Adli ve idari makamlar</li>
                          <li>• Düzenleyici ve denetleyici kurumlar</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Yurtdışı Veri Transferi</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Bazı hizmet sağlayıcılarımız AB dışında konumlanmış olabilir.
                        Bu durumda verileriniz KVKK'nın 9. maddesi uyarınca ve yeterli koruma
                        seviyesi sağlanarak transfer edilir.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Veri Saklama Süreleri */}
            <section id="saklama-sureleri">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                      <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    5. Veri Saklama Süreleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve
                      yasal düzenlemelerde öngörülen süreler dikkate alınarak saklanır:
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="text-left p-4 border-b border-gray-200 dark:border-gray-700">Veri Kategorisi</th>
                            <th className="text-left p-4 border-b border-gray-200 dark:border-gray-700">Saklama Süresi</th>
                            <th className="text-left p-4 border-b border-gray-200 dark:border-gray-700">Yasal Dayanak</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-4">Müşteri kayıt bilgileri</td>
                            <td className="p-4">Sözleşme sona erdikten sonra 10 yıl</td>
                            <td className="p-4">Ticaret Kanunu</td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-4">Finansal işlem kayıtları</td>
                            <td className="p-4">5 yıl</td>
                            <td className="p-4">Vergi Usul Kanunu</td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-4">Çerez ve analitik veriler</td>
                            <td className="p-4">2 yıl</td>
                            <td className="p-4">KVKK Kararları</td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-4">İletişim logları</td>
                            <td className="p-4">3 yıl</td>
                            <td className="p-4">İç politika</td>
                          </tr>
                          <tr>
                            <td className="p-4">Pazarlama rıza kayıtları</td>
                            <td className="p-4">Rıza geri çekilene kadar</td>
                            <td className="p-4">KVKK m.5</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Otomatik İmha</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Verileriniz saklama süresi dolduğunda otomatik olarak sistemlerimizden
                        güvenli bir şekilde silinir. Bu süreç loglanır ve denetim kayıtları tutulur.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Veri Sahibi Hakları */}
            <section id="veri-sahibi-haklari">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    6. Veri Sahibi Hakları
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      KVKK'nın 11. maddesi uyarınca sahip olduğunuz haklar ve
                      bu hakları nasıl kullanabileceğiniz:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Bilgi Talep Etme Hakkı
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Kişisel verilerinizin işlenip işlenmediğini öğrenme ve
                            işleniyorsa buna ilişkin bilgi talep etme hakkı
                          </p>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Düzeltme Hakkı
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Kişisel verileriniz hatalı veya eksikse bunların
                            düzeltilmesini isteme hakkı
                          </p>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Trash2 className="h-4 w-4" />
                            Silme Hakkı
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Yasal koşullar oluştuğunda kişisel verilerinizin
                            silinmesini talep etme hakkı
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            İtiraz Etme Hakkı
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Kişisel verilerinizin işlenmesine itiraz etme ve
                            zarar görürseniz giderilmesini talep etme hakkı
                          </p>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Taşınabilirlik Hakkı
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Kişisel verilerinizi yapılandırılmış ve yaygın
                            kullanılan formatta talep etme hakkı
                          </p>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Scale className="h-4 w-4" />
                            Şikayette Bulunma Hakkı
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Kişisel Verileri Koruma Kurulu'na şikayette bulunma hakkı
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Başvuru Prosedürü</h4>
                      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                        <p>
                          <strong>1. Başvuru Yöntemleri:</strong> Yazılı olarak, kayıtlı elektronik posta (KEP) ile,
                          güvenli elektronik imza ile veya sistemimizde kayıtlı e-posta adresiniz ile
                        </p>
                        <p>
                          <strong>2. Kimlik Doğrulama:</strong> T.C. Kimlik belgeniz fotokopisi ile kimliğinizi doğrulamanız gerekir
                        </p>
                        <p>
                          <strong>3. Yanıt Süresi:</strong> Başvurunuz en geç 30 gün içinde ücretsiz olarak yanıtlanır
                        </p>
                        <p>
                          <strong>4. Ücretlendirme:</strong> Cevabın CD, flash bellek gibi ortamda verilmesi durumunda
                          sadece maliyet yansıtılır
                        </p>
                      </div>

                      <div className="mt-4">
                        <Link href="/kvkk-basvuru">
                          <Button className="bg-green-600 hover:bg-green-700 text-white">
                            <FileText className="h-4 w-4 mr-2" />
                            Online Başvuru Yap
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* İletişim Bilgileri */}
            <section id="iletisim">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <Mail className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    7. İletişim Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Kişisel verileriniz ile ilgili her türlü soru, talep ve şikayetiniz için:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">KVKK Başvuru İletişimi</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">E-posta</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">info@enerjios.com</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Posta Adresi</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                EnerjiOS<br />
                                KVKK Başvuru Birimi<br />
                                Türkiye
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Kişisel Verileri Koruma Kurulu</h4>
                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                          <p>
                            Talebinizin reddedilmesi, verilen cevabın yetersiz bulunması veya
                            süresinde başvuruya cevap verilmemesi hallerinde:
                          </p>
                          <div className="space-y-2">
                            <p><strong>Web:</strong> www.kvkk.gov.tr</p>
                            <p><strong>Adres:</strong> Kişisel Verileri Koruma Kurulu Başkanlığı, Ziya Gökalp Caddesi No:9, 06420 Çankaya/Ankara</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="text-center space-y-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Bu aydınlatma metni {lastUpdated} tarihinde güncellenmiştir.
                      </p>
                      <div className="flex justify-center gap-4">
                        <Link href="/cerez-politikasi">
                          <Button variant="outline" size="sm">Çerez Politikası</Button>
                        </Link>
                        <Link href="/gizlilik-politikasi">
                          <Button variant="outline" size="sm">Gizlilik Politikası</Button>
                        </Link>
                        <Link href="/kvkk-basvuru">
                          <Button size="sm">KVKK Başvuru</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}