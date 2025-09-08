import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LeadCaptureDialog } from '@/components/ui/lead-capture-dialog'
import { 
  ArrowRight, 
  CheckCircle, 
  Home, 
  Zap, 
  PiggyBank, 
  Shield, 
  Sun, 
  Calculator,
  Phone,
  Leaf,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react'

export default function EvGesPage() {
  const benefits = [
    {
      icon: PiggyBank,
      title: "Elektrik Faturası Tasarrufu",
      description: "Aylık elektrik faturanızı %90'a kadar azaltın"
    },
    {
      icon: Leaf,
      title: "Çevre Dostu",
      description: "Yılda ortalama 2.5 ton CO₂ emisyonunu önleyin"
    },
    {
      icon: TrendingUp,
      title: "Yatırım Getirisi",
      description: "5-7 yılda kendini amorti eden yatırım"
    },
    {
      icon: Shield,
      title: "25 Yıl Garanti",
      description: "Uzun vadeli güvence ve performans garantisi"
    }
  ]

  const features = [
    "Yüksek verimli monokristal solar paneller",
    "MPPT teknolojisi ile maksimum enerji hasadı",
    "Akıllı izleme sistemi ve mobil uygulama",
    "Profesyonel kurulum ve devreye alma",
    "Ücretsiz bakım ve destek hizmeti",
    "Net-metering sistemi entegrasyonu"
  ]

  const packages = [
    {
      name: "Temel Paket",
      power: "3 kW",
      panels: "8 Adet Panel",
      price: "13,500",
      features: [
        "3 kW Güneş Sistemi",
        "8 Adet 375W Panel", 
        "String İnverter",
        "Montaj Malzemeleri",
        "Kurulum Hizmeti",
        "2 Yıl Servis"
      ],
      popular: false
    },
    {
      name: "Standart Paket",
      power: "5 kW", 
      panels: "13 Adet Panel",
      price: "22,500",
      features: [
        "5 kW Güneş Sistemi",
        "13 Adet 385W Panel",
        "Hibrit İnverter", 
        "Akıllı İzleme Sistemi",
        "Kurulum Hizmeti",
        "5 Yıl Servis Garantisi"
      ],
      popular: true
    },
    {
      name: "Premium Paket",
      power: "8 kW",
      panels: "20 Adet Panel", 
      price: "36,000",
      features: [
        "8 kW Güneş Sistemi",
        "20 Adet 400W Panel",
        "Hibrit İnverter + Batarya",
        "Akıllı Enerji Yönetimi",
        "Premium Kurulum",
        "10 Yıl Kapsamlı Garanti"
      ],
      popular: false
    }
  ]

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-green-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Home className="w-4 h-4 mr-2" />
                  Ev Güneş Enerjisi Sistemleri
                </Badge>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                  Eviniz İçin
                  <span className="text-primary block">Güneş Enerjisi Çözümleri</span>
                </h1>
                
                <p className="text-xl text-gray-600">
                  Ev güneş enerjisi sistemleri ile elektrik faturanızı sıfıra indirin. 
                  Temiz enerji üretin, tasarruf edin ve çevreye katkıda bulunun.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/auth/signup">
                    <Calculator className="w-5 h-5 mr-2" />
                    Ücretsiz Teklif Al
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                
                <LeadCaptureDialog>
                  <Button variant="outline" size="lg">
                    <Phone className="w-5 h-5 mr-2" />
                    Hemen Arayın
                  </Button>
                </LeadCaptureDialog>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">%90</div>
                  <div className="text-sm text-gray-600">Fatura Tasarrufu</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">5-7 Yıl</div>
                  <div className="text-sm text-gray-600">Geri Ödeme</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">25 Yıl</div>
                  <div className="text-sm text-gray-600">Garanti</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-2xl">
                <div className="w-full h-64 bg-gradient-to-r from-blue-100 to-green-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Sun className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="text-gray-600">Ev GES Sistemi</p>
                    <p className="text-sm text-gray-500">Görsel yakında eklenecek</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Ev GES Sisteminin Avantajları
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Güneş enerjisi sistemi kurarak hem cebinize hem de çevreye fayda sağlayın
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
                Premium Sistem Özellikleri
              </h2>
              
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-gray-700">{feature}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/auth/signup">
                    Teknik Detaylar İçin Başvur
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <Card className="bg-white shadow-xl">
                <CardContent className="p-8">
                  <div className="w-full h-80 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Sistem Şeması</p>
                      <p className="text-sm text-gray-500">Detaylı görsel hazırlanıyor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Ev GES Paketlerimiz
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              İhtiyaçlarınıza uygun sistem paketini seçin, hemen kuruluma başlayın
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <Card key={index} className={`relative ${pkg.popular ? 'ring-2 ring-primary shadow-xl' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1">
                      <Award className="w-4 h-4 mr-1" />
                      En Popüler
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-primary">₺{pkg.price}</div>
                    <div className="text-sm text-gray-500">KDV Dahil</div>
                  </div>
                  <CardDescription className="text-lg font-medium">
                    {pkg.power} • {pkg.panels}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {pkg.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className={`w-full ${pkg.popular ? 'bg-primary hover:bg-primary/90' : ''}`} 
                    variant={pkg.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/auth/signup">
                      Paketi Seç
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Özel ihtiyaçlarınız mı var? Size özel çözüm hazırlayalım.
            </p>
            <LeadCaptureDialog title="Özel Teklif Talep Et" description="Size özel bir çözüm hazırlayalım">
              <Button variant="outline" size="lg">
                <Calculator className="w-5 h-5 mr-2" />
                Özel Teklif İste
              </Button>
            </LeadCaptureDialog>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Güneş Enerjisine Geçiş Zamanı!
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Bugün başvurun, 15 gün içinde evinizde güneş enerjisi üretmeye başlayın. 
              Uzman ekibimiz tüm süreci yönetir, siz sadece tasarrufun keyfini çıkarın.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/signup" className="bg-white text-primary hover:bg-white/90">
                  <Sun className="w-5 h-5 mr-2" />
                  Hemen Başla
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              
              <LeadCaptureDialog>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  <Phone className="w-5 h-5 mr-2" />
                  Ücretsiz Danışmanlık
                </Button>
              </LeadCaptureDialog>
            </div>
            
            <div className="flex items-center justify-center space-x-8 mt-12 pt-8 border-t border-white/20">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>15 Gün Kurulum</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>25 Yıl Garanti</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Sertifikalı Kurulum</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}