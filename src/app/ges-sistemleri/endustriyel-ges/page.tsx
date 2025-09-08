import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LeadCaptureDialog } from '@/components/ui/lead-capture-dialog'
import { 
  ArrowRight, 
  CheckCircle, 
  Factory, 
  Zap, 
  PiggyBank, 
  Shield, 
  Sun, 
  Calculator,
  Phone,
  Leaf,
  TrendingUp,
  Clock,
  Award,
  Settings,
  BarChart3,
  Gauge
} from 'lucide-react'

export default function EndustriyelGesPage() {
  const benefits = [
    {
      icon: PiggyBank,
      title: "Enerji Maliyetlerinde %80 Tasarruf",
      description: "Yüksek elektrik tüketiminizi önemli ölçüde azaltın"
    },
    {
      icon: TrendingUp,
      title: "Hızlı Yatırım Geri Dönüşü",
      description: "3-5 yılda kendini amorti eden yatırım"
    },
    {
      icon: Leaf,
      title: "Karbon Ayak İzi Azaltımı",
      description: "Kurumsal sürdürülebilirlik hedeflerinize ulaşın"
    },
    {
      icon: Shield,
      title: "Profesyonel Destek",
      description: "7/24 izleme ve bakım hizmeti"
    }
  ]

  const features = [
    "Yüksek kapasiteli endüstriyel solar paneller (500W+)",
    "String ve merkezi inverter seçenekleri", 
    "SCADA sistemi ile uzaktan izleme",
    "Otomatik temizleme sistemleri",
    "Yıldırımdan korunma sistemleri",
    "Üretim garantili performans izleme",
    "ISO 9001 sertifikalı kurulum",
    "Yedek parça ve servis garantisi"
  ]

  const packages = [
    {
      name: "Küçük Tesis",
      power: "100 kW",
      panels: "200 Adet Panel",
      price: "450,000",
      features: [
        "100 kW Güneş Sistemi",
        "200 Adet 500W Panel", 
        "String İnverter Sistemi",
        "Temel İzleme Sistemi",
        "Standart Kurulum",
        "5 Yıl Servis Garantisi"
      ],
      popular: false
    },
    {
      name: "Orta Ölçekli Tesis",
      power: "500 kW", 
      panels: "1,000 Adet Panel",
      price: "2,100,000",
      features: [
        "500 kW Güneş Sistemi",
        "1,000 Adet 500W Panel",
        "Merkezi İnverter Sistemi", 
        "SCADA İzleme Sistemi",
        "Profesyonel Kurulum",
        "10 Yıl Kapsamlı Garanti"
      ],
      popular: true
    },
    {
      name: "Büyük Ölçekli Tesis",
      power: "1 MW+",
      panels: "2,000+ Adet Panel", 
      price: "Talebe Göre",
      features: [
        "1 MW+ Güneş Sistemi",
        "2,000+ Adet Panel",
        "Hibrit Inverter Sistemi",
        "Gelişmiş SCADA + AI",
        "Premium Kurulum Hizmeti",
        "15 Yıl Kapsamlı Garanti"
      ],
      popular: false
    }
  ]

  const industries = [
    {
      name: "Tekstil Fabrikaları",
      description: "Yoğun enerji tüketimi olan tekstil tesislerinde %70-80 tasarruf",
      icon: Settings
    },
    {
      name: "Gıda İşleme Tesisleri", 
      description: "Soğutma ve işleme süreçlerinde sürekli enerji ihtiyacı",
      icon: Factory
    },
    {
      name: "Otomotiv Sanayi",
      description: "Üretim hatları ve boyama tesisleri için yüksek enerji gereksinimi",
      icon: Gauge
    },
    {
      name: "Madencilik",
      description: "Uzak lokasyonlarda enerji maliyetlerinin düşürülmesi", 
      icon: BarChart3
    }
  ]

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-20 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.5)_0%,transparent_50%)]" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border-blue-500">
                  <Factory className="w-4 h-4 mr-2" />
                  Endüstriyel Güneş Enerjisi Sistemleri
                </Badge>
                
                <h1 className="text-4xl lg:text-5xl font-bold">
                  Fabrikanız İçin
                  <span className="text-blue-400 block">Büyük Ölçekli GES Çözümleri</span>
                </h1>
                
                <p className="text-xl text-gray-300">
                  Endüstriyel güneş enerjisi sistemleri ile enerji maliyetlerinizi minimize edin. 
                  MW seviyesinde güç üretimi, profesyonel kurulum ve sürekli destek.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/auth/signup">
                    <Calculator className="w-5 h-5 mr-2" />
                    Endüstriyel Teklif Al
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                
                <LeadCaptureDialog title="Endüstriyel Proje Danışmanlığı">
                  <Button variant="outline" size="lg" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white">
                    <Phone className="w-5 h-5 mr-2" />
                    Uzman Danışmanlık
                  </Button>
                </LeadCaptureDialog>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">MW+</div>
                  <div className="text-sm text-gray-400">Kurulu Güç</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">%80</div>
                  <div className="text-sm text-gray-400">Maliyet Tasarrufu</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">3-5 Yıl</div>
                  <div className="text-sm text-gray-400">Geri Ödeme</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
                <div className="w-full h-64 bg-gradient-to-r from-blue-900/50 to-gray-900/50 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Factory className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-300">Endüstriyel GES Sistemi</p>
                    <p className="text-sm text-gray-400">Görsel yakında eklenecek</p>
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
              Endüstriyel GES'in İşletmenize Faydaları
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Büyük ölçekli güneş enerjisi sistemleri ile işletme maliyetlerinizi önemli ölçüde düşürün
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <benefit.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Hangi Sektörlere Hizmet Veriyoruz
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Farklı endüstri dallarına özel çözümler geliştiriyoruz
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {industries.map((industry, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
                    <industry.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{industry.name}</h3>
                  <p className="text-gray-600 text-sm">{industry.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
                Endüstriyel Seviye Teknoloji ve Hizmetler
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
              <Card className="bg-gradient-to-br from-blue-50 to-gray-50 shadow-xl">
                <CardContent className="p-8">
                  <div className="w-full h-80 bg-gradient-to-br from-blue-100 to-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-600/10 p-4 rounded-lg">
                          <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-sm font-medium">SCADA Sistem</p>
                        </div>
                        <div className="bg-green-600/10 p-4 rounded-lg">
                          <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="text-sm font-medium">Performans Analizi</p>
                        </div>
                      </div>
                      <p className="text-gray-600">Akıllı İzleme Sistemi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Endüstriyel GES Çözüm Paketleri
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              İşletmenizin büyüklüğüne uygun profesyonel güneş enerjisi sistemleri
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <Card key={index} className={`relative ${pkg.popular ? 'ring-2 ring-blue-600 shadow-xl' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      <Award className="w-4 h-4 mr-1" />
                      En Popüler
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-blue-600">
                      {pkg.price === "Talebe Göre" ? pkg.price : `₺${pkg.price}`}
                    </div>
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
                    className={`w-full ${pkg.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`} 
                    variant={pkg.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/auth/signup">
                      {pkg.price === "Talebe Göre" ? "Özel Teklif İste" : "Paketi Seç"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Özel kapasiteli sistemler ve özelleştirilmiş çözümler için uzmanlarımızla görüşün.
            </p>
            <LeadCaptureDialog title="Endüstriyel Proje Danışmanlığı" description="Size özel çözüm geliştirme toplantısı planlayalım">
              <Button variant="outline" size="lg">
                <Factory className="w-5 h-5 mr-2" />
                Proje Danışmanlığı
              </Button>
            </LeadCaptureDialog>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Endüstriyel Güneş Enerjisine Geçin
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Bugün başvurun, 30-60 gün içinde fabrika çatınızda MW seviyesinde güneş enerjisi üretmeye başlayın. 
              Uzman mühendis ekibimiz tüm süreci yönetir.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/signup" className="bg-white text-blue-600 hover:bg-white/90">
                  <Factory className="w-5 h-5 mr-2" />
                  Endüstriyel Proje Başlat
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              
              <LeadCaptureDialog title="Acil Proje Danışmanlığı">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <Phone className="w-5 h-5 mr-2" />
                  Acil Danışmanlık Hattı
                </Button>
              </LeadCaptureDialog>
            </div>
            
            <div className="flex items-center justify-center space-x-8 mt-12 pt-8 border-t border-white/20">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>30-60 Gün Kurulum</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>15 Yıl Garanti</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>ISO Sertifikalı</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}