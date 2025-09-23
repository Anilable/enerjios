import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Lock,
  Shield,
  Database,
  Share2,
  UserCheck,
  Settings,
  AlertTriangle,
  Calendar,
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  Eye,
  Trash2,
  RefreshCw,
  Users,
  Globe,
  Server
} from 'lucide-react'

export default function GizlilikPolitikasi() {
  const lastUpdated = "15 Aralık 2024"

  const dataTypes = [
    {
      category: "Hesap Bilgileri",
      icon: UserCheck,
      items: ["Ad, soyad", "E-posta adresi", "Telefon numarası", "Şifre (şifrelenmiş)", "Profil fotoğrafı"],
      purpose: "Hesap oluşturma ve kimlik doğrulama"
    },
    {
      category: "Proje Verileri",
      icon: Database,
      items: ["Proje konumu", "Teknik gereksinimler", "Kapasite bilgileri", "Teklif geçmişi", "Dosya yüklemeleri"],
      purpose: "Güneş enerjisi sistemi teklif ve proje yönetimi"
    },
    {
      category: "İletişim Kayıtları",
      icon: Mail,
      items: ["E-posta yazışmaları", "Telefon görüşme kayıtları", "Canlı destek mesajları", "Form gönderileri"],
      purpose: "Müşteri desteği ve iletişim"
    },
    {
      category: "Teknik Veriler",
      icon: Server,
      items: ["IP adresi", "Tarayıcı bilgileri", "Cihaz bilgileri", "Oturum kayıtları", "Hata logları"],
      purpose: "Site güvenliği ve performans iyileştirme"
    }
  ]

  const securityMeasures = [
    {
      title: "Veri Şifreleme",
      description: "Tüm hassas veriler AES-256 ile şifrelenir",
      icon: Lock
    },
    {
      title: "Güvenli Bağlantı",
      description: "HTTPS/TLS ile güvenli veri iletimi",
      icon: Shield
    },
    {
      title: "Erişim Kontrolü",
      description: "Çok faktörlü kimlik doğrulama ve yetkilendirme",
      icon: UserCheck
    },
    {
      title: "Düzenli Yedekleme",
      description: "Günlük otomatik yedekleme ve kurtarma planı",
      icon: RefreshCw
    },
    {
      title: "Güvenlik İzleme",
      description: "7/24 sistem izleme ve anormalliklerin tespiti",
      icon: Eye
    },
    {
      title: "Personel Eğitimi",
      description: "Tüm çalışanlar veri güvenliği konusunda eğitilir",
      icon: Users
    }
  ]

  const userRights = [
    {
      right: "Erişim Hakkı",
      description: "Hangi kişisel verilerinizin işlendiğini öğrenme hakkı",
      action: "Veri raporunuz talep edin"
    },
    {
      right: "Düzeltme Hakkı",
      description: "Hatalı veya eksik verilerinizin düzeltilmesini talep etme hakkı",
      action: "Düzeltme talebinde bulunun"
    },
    {
      right: "Silme Hakkı",
      description: "Verilerinizin silinmesini talep etme hakkı (unutulma hakkı)",
      action: "Hesap silme talebinde bulunun"
    },
    {
      right: "Taşınabilirlik Hakkı",
      description: "Verilerinizi başka platformlara aktarma hakkı",
      action: "Veri export'u talep edin"
    },
    {
      right: "İtiraz Hakkı",
      description: "Veri işleme faaliyetlerine itiraz etme hakkı",
      action: "İtiraz başvurusu yapın"
    },
    {
      right: "Kısıtlama Hakkı",
      description: "Belirli veri işleme faaliyetlerinin durdurulmasını talep etme hakkı",
      action: "Kısıtlama talebinde bulunun"
    }
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
            <div className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
              <Lock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Gizlilik Politikası
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Kişisel verilerinizi nasıl topladığımız, kullandığımız ve koruduğumuz
                hakkında detaylı bilgiler
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Son güncelleme: {lastUpdated}
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                  KVKK Uyumlu
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Genel Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              Genel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Bu Politikanın Kapsamı</h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Bu gizlilik politikası, EnerjiOS platformu (enerjios.com) ve mobil uygulamalarımız
                  aracılığıyla toplanan kişisel verilerin işlenmesi hakkında bilgi verir.
                  6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve AB Genel Veri Koruma
                  Tüzüğü (GDPR) gerekliliklerine uygun olarak hazırlanmıştır.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Değişiklik Bildirimi</h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Bu politikada yapılan önemli değişiklikler, web sitemiz üzerinden ve
                  kayıtlı e-posta adresinize gönderilecek bildirimlerle duyurulur.
                  Değişiklikler yayınlandığı tarihten itibaren geçerli olur.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Veri Sorumlusu</h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <p><strong>Şirket:</strong> EnerjiOS Teknoloji A.Ş.</p>
                <p><strong>Adres:</strong> Teknokent Mahallesi, Silikon Bulvarı No:123, 34906 Pendik/İstanbul</p>
                <p><strong>İletişim:</strong> kvkk@enerjios.com | +90 (216) 123 45 67</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toplanan Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              Toplanan Bilgiler
            </CardTitle>
            <CardDescription>
              Platform kullanımınız sırasında topladığımız kişisel veri kategorileri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dataTypes.map((type) => {
                const IconComponent = type.icon
                return (
                  <Card key={type.category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        {type.category}
                      </CardTitle>
                      <CardDescription>{type.purpose}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        {type.items.map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Otomatik Veri Toplama
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Web sitemizi ziyaret ettiğinizde çerezler, log dosyaları ve benzer teknolojiler
                aracılığıyla bazı teknik bilgiler otomatik olarak toplanır. Bu veriler site
                performansını iyileştirmek ve güvenlik sağlamak için kullanılır.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bilgi Kullanımı */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              Bilgi Kullanımı
            </CardTitle>
            <CardDescription>
              Toplanan kişisel verilerinizi hangi amaçlarla kullandığımız
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Hizmet Sunumu</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Güneş enerjisi sistemi teklifleri hazırlama</li>
                    <li>• Proje yönetimi ve takibi</li>
                    <li>• Teknik destek sağlama</li>
                    <li>• Hesap yönetimi</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">İletişim</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Müşteri desteği</li>
                    <li>• Proje güncellemeleri</li>
                    <li>• Sistem bildirimleri</li>
                    <li>• Önemli duyurular</li>
                  </ul>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Yasal Gereklilikler</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Vergi ve muhasebe kayıtları</li>
                    <li>• Düzenleyici kurumlar raporlaması</li>
                    <li>• Hukuki yükümlülükler</li>
                    <li>• Denetim süreçleri</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Site İyileştirme</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Kullanıcı deneyimi analizi</li>
                    <li>• Performans optimizasyonu</li>
                    <li>• Özellik geliştirme</li>
                    <li>• Hata tespit ve düzeltme</li>
                  </ul>
                </div>

                <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Güvenlik</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Dolandırıcılık tespiti</li>
                    <li>• Yetkisiz erişim engelleme</li>
                    <li>• Spam ve kötüye kullanım önleme</li>
                    <li>• Sistem güvenliği izleme</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Pazarlama (Onay ile)</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Kişiselleştirilmiş teklifler</li>
                    <li>• Kampanya bildirimleri</li>
                    <li>• Ürün önerileri</li>
                    <li>• Newsletter gönderimi</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bilgi Paylaşımı */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Share2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              Bilgi Paylaşımı
            </CardTitle>
            <CardDescription>
              Kişisel verilerinizi kimlerle ve hangi durumlarda paylaştığımız
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Kişisel verilerinizi sadece aşağıdaki durumlarda ve yasal gereklilikler
              çerçevesinde üçüncü taraflarla paylaşırız:
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Hizmet Sağlayıcılar</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Hizmetlerimizi sunabilmek için güvenilir üçüncü taraf şirketlerle çalışıyoruz:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• <strong>Bulut hizmet sağlayıcıları:</strong> AWS, Google Cloud (veri depolama)</li>
                  <li>• <strong>Ödeme işlemcileri:</strong> İyzico, PayU (güvenli ödemeler)</li>
                  <li>• <strong>E-posta servisleri:</strong> SendGrid (sistem e-postaları)</li>
                  <li>• <strong>Analitik hizmetler:</strong> Google Analytics (site analizi)</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">İş Ortakları</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Hizmet sunumu için gerekli durumlarda iş ortaklarımızla sınırlı veri paylaşımı:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• <strong>Kurulum firmaları:</strong> Proje uygulama için gerekli teknik bilgiler</li>
                  <li>• <strong>Finansman sağlayıcıları:</strong> Kredi başvuruları için (onayınız ile)</li>
                  <li>• <strong>Sigorta şirketleri:</strong> Sigorta poliçeleri için gerekli bilgiler</li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Resmi Makamlar</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Yasal yükümlülükler gereği resmi kurumlarla paylaşım:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Vergi daireleri (mali kayıtlar)</li>
                  <li>• EPDK (enerji sektörü raporlaması)</li>
                  <li>• Adli makamlar (yasal talep halinde)</li>
                  <li>• Düzenleyici kurumlar (denetim süreçleri)</li>
                </ul>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Uluslararası Veri Transferi
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Bazı hizmet sağlayıcılarımız AB dışında konumlanabilir. Bu durumda
                verileriniz yeterli koruma seviyesi sağlanarak ve KVKK gerekliliklerine
                uygun olarak transfer edilir. Transfer öncesi uygun güvenlik önlemleri
                alınır ve veri koruma anlaşmaları imzalanır.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Veri Güvenliği */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              Veri Güvenliği
            </CardTitle>
            <CardDescription>
              Kişisel verilerinizi korumak için aldığımız teknik ve idari güvenlik önlemleri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityMeasures.map((measure) => {
                const IconComponent = measure.icon
                return (
                  <Card key={measure.title}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex-shrink-0">
                          <IconComponent className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {measure.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {measure.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="mt-6 space-y-4">
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Güvenlik Sertifikaları</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Sistemlerimiz ISO 27001 bilgi güvenliği standartlarına uygun olarak tasarlanmış
                  ve SOC 2 Type II denetimlerinden geçmiştir. Düzenli penetrasyon testleri
                  ve güvenlik değerlendirmeleri yapılmaktadır.
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Güvenlik İhlali Prosedürü</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Olası bir güvenlik ihlali durumunda, KVKK gereğince 72 saat içinde
                  Kişisel Verileri Koruma Kurulu'na bildirim yapılır ve etkilenen
                  kullanıcılar derhal bilgilendirilir. İyileştirme önlemleri hızla hayata geçirilir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kullanıcı Hakları */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              Kullanıcı Hakları
            </CardTitle>
            <CardDescription>
              KVKK kapsamında sahip olduğunuz haklar ve nasıl kullanabileceğiniz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userRights.map((right, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {right.right}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {right.description}
                    </p>
                    <Button variant="outline" size="sm" className="text-xs">
                      {right.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Hak Kullanım Prosedürü</h4>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <p>Online başvuru formunu doldurun veya kvkk@enerjios.com adresine e-posta gönderin</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <p>Kimlik doğrulama için T.C. Kimlik belgesi fotokopyanızı ekleyin</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <p>Başvurunuz 30 gün içinde ücretsiz olarak yanıtlanır</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <p>Yanıt e-posta ile gönderilir, büyük dosyalar için fiziki ortam kullanılabilir</p>
                </div>
              </div>

              <div className="mt-4">
                <Link href="/kvkk-basvuru">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <FileText className="h-4 w-4 mr-2" />
                    KVKK Başvuru Yap
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* İletişim */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Mail className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              İletişim ve Destek
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Gizlilik Soruları</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">E-posta</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">kvkk@enerjios.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Telefon</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">+90 (216) 123 45 67</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Veri Koruma Kurulu</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Başvurularınızın yetersiz yanıtlanması durumunda:
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p><strong>Web:</strong> www.kvkk.gov.tr</p>
                  <p><strong>Adres:</strong> Ziya Gökalp Cad. No:9, Çankaya/Ankara</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Bu gizlilik politikası {lastUpdated} tarihinde güncellenmiştir.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Link href="/kvkk">
                  <Button variant="outline" size="sm">KVKK Aydınlatma Metni</Button>
                </Link>
                <Link href="/cerez-politikasi">
                  <Button variant="outline" size="sm">Çerez Politikası</Button>
                </Link>
                <Link href="/kvkk-basvuru">
                  <Button size="sm">KVKK Başvuru Yap</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}