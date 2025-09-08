import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LeadCaptureDialog } from '@/components/ui/lead-capture-dialog'
import { 
  ArrowRight, 
  CheckCircle, 
  Building, 
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
  Store,
  Coffee,
  Car,
  Briefcase
} from 'lucide-react'

export default function TicariGesPage() {
  const benefits = [
    {
      icon: PiggyBank,
      title: "İşletme Maliyetlerinde %70 Tasarruf",
      description: "Aylık elektrik giderlerinizi önemli ölçüde azaltın"
    },
    {
      icon: TrendingUp,
      title: "Karlılık Artışı",
      description: "Düşük işletme maliyetleri ile rekabet avantajı"
    },
    {
      icon: Leaf,
      title: "Yeşil İşletme İmajı",
      description: "Çevre dostu marka imajı ile müşteri memnuniyeti"
    },
    {
      icon: Shield,
      title: "Uzun Vadeli Güvence",
      description: "25 yıl garanti ile istikrarlı enerji maliyetleri"
    }
  ]

  const features = [
    "İşletme tipine özel sistem tasarımı",
    "Estetik görünüm ve mimari uyum", 
    "Akıllı enerji yönetim sistemleri",
    "Uzaktan izleme ve kontrol",
    "Minimum bakım gerektiren teknoloji",
    "Mevcut elektrik sistemine kolay entegrasyon",
    "Profesyonel proje yönetimi",
    "Devreye alma ve eğitim hizmetleri"
  ]

  const packages = [
    {
      name: "Küçük İşletme",
      power: "15 kW",
      panels: "38 Adet Panel",
      price: "67,500",
      features: [
        "15 kW Güneş Sistemi",
        "38 Adet 400W Panel", 
        "String İnverter",
        "Temel İzleme Sistemi",
        "Standart Kurulum",
        "3 Yıl Servis Garantisi"
      ],
      popular: false
    },
    {
      name: "Orta Boy İşletme",
      power: "35 kW", 
      panels: "88 Adet Panel",
      price: "147,000",
      features: [
        "35 kW Güneş Sistemi",
        "88 Adet 400W Panel",
        "Hibrit İnverter Sistemi", 
        "Akıllı İzleme",
        "Premium Kurulum",
        "5 Yıl Kapsamlı Garanti"
      ],
      popular: true
    },
    {
      name: "Büyük Ticari Tesis",
      power: "75 kW+",
      panels: "188+ Adet Panel", 
      price: "Talebe Göre",
      features: [
        "75 kW+ Güneş Sistemi",
        "188+ Adet Panel",
        "Merkezi İnverter",
        "SCADA İzleme Sistemi",
        "Premium Kurulum",
        "10 Yıl Kapsamlı Garanti"
      ],
      popular: false
    }
  ]

  const businessTypes = [
    {
      name: "Perakende Mağazalar",
      description: "Market, giyim mağazası, elektronik dükkanı vb. işletmeler",
      icon: Store
    },
    {
      name: "Kafe & Restoran", 
      description: "Yiyecek içecek sektöründeki işletmeler için enerji çözümleri",
      icon: Coffee
    },
    {
      name: "Oto Galeri & Servis",
      description: "Otomotiv sektöründe faaliyet gösteren işletmeler",
      icon: Car
    },
    {
      name: "Ofis Binaları",
      description: "Büro ve hizmet sektörü işletmeleri için çözümler", 
      icon: Briefcase
    }
  ]

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-red-50 to-purple-50 py-20">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.3)_0%,transparent_50%)]" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-orange-600/10 text-orange-700 border-orange-300">
                  <Building className="w-4 h-4 mr-2" />
                  Ticari Güneş Enerjisi Sistemleri
                </Badge>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                  İşletmeniz İçin
                  <span className="text-orange-600 block">Akıllı Enerji Yatırımı</span>
                </h1>
                
                <p className="text-xl text-gray-600">
                  Ticari güneş enerjisi sistemleri ile işletme maliyetlerinizi düşürün. 
                  Mağaza, ofis, restoran ve tüm ticari tesisler için özel çözümler.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700" asChild>
                  <Link href="/auth/signup">
                    <Calculator className="w-5 h-5 mr-2" />
                    Ticari GES Teklifi
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                
                <LeadCaptureDialog title="Ticari GES Danışmanlığı" description="İşletmeniz için özel enerji çözümü geliştirme görüşmesi planlayalım">
                  <Button variant="outline" size="lg" className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white">
                    <Phone className="w-5 h-5 mr-2" />
                    İşletme Danışmanlığı
                  </Button>
                </LeadCaptureDialog>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">%70</div>
                  <div className="text-sm text-gray-600">Maliyet Tasarrufu</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">5-7 Yıl</div>
                  <div className="text-sm text-gray-600">Geri Ödeme</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">%15</div>
                  <div className="text-sm text-gray-600">Karlılık Artışı</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-2xl">
                <div className="w-full h-64 bg-gradient-to-r from-orange-100 via-red-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Building className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                    <p className="text-gray-600">Ticari GES Sistemi</p>
                    <p className="text-sm text-gray-500">İşletme görseli yakında</p>
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
              Ticari GES'in İşletmenize Faydaları
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Güneş enerjisi ile işletme maliyetlerinizi optimize edin, karlılığınızı artırın
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-orange-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <benefit.icon className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Business Types Section */}
      <section className="py-20 bg-orange-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Hangi İşletmelere Hizmet Veriyoruz
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tüm ticari sektörlere özel güneş enerjisi çözümleri
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {businessTypes.map((business, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow bg-white">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-orange-600/10 rounded-lg flex items-center justify-center mb-4">
                    <business.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{business.name}</h3>
                  <p className="text-gray-600 text-sm">{business.description}</p>
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
                İşletmeniz İçin Özel Teknoloji Çözümleri
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
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700" asChild>
                  <Link href="/auth/signup">
                    Teknik Detaylar İçin Başvur
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 shadow-xl">
                <CardContent className="p-8">
                  <div className="w-full h-80 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-orange-600/10 p-4 rounded-lg">
                          <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                          <p className="text-sm font-medium">Akıllı İnverter</p>
                        </div>
                        <div className="bg-red-600/10 p-4 rounded-lg">
                          <TrendingUp className="w-8 h-8 text-red-600 mx-auto mb-2" />
                          <p className="text-sm font-medium">Performans İzleme</p>
                        </div>
                      </div>
                      <p className="text-gray-600">Ticari GES Sistemi</p>
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
              Ticari GES Çözüm Paketleri
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              İşletmenizin büyüklüğüne uygun güneş enerjisi sistemleri
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <Card key={index} className={`relative ${pkg.popular ? 'ring-2 ring-orange-600 shadow-xl' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-600 text-white px-4 py-1">
                      <Award className="w-4 h-4 mr-1" />
                      En Popüler
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-orange-600">
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
                    className={`w-full ${pkg.popular ? 'bg-orange-600 hover:bg-orange-700' : ''}`} 
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
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 max-w-2xl mx-auto mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">💡 İşletme GES Avantajları</h3>
              <p className="text-blue-700 text-sm">
                Ticari işletmeler için özel vergi avantajları ve amortisman imkanları mevcuttur. 
                Sisteminizi 5 yılda amorti edebilir, vergiden düşebilirsiniz.
              </p>
            </div>
            
            <LeadCaptureDialog title="İşletme GES Danışmanlığı" description="İşletmeniz için en uygun çözümü birlikte belirleyelim">
              <Button variant="outline" size="lg" className="border-orange-600 text-orange-600">
                <Building className="w-5 h-5 mr-2" />
                İşletme Danışmanlığı
              </Button>
            </LeadCaptureDialog>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Başarı Hikayelerimiz
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              İşletmelerin güneş enerjisi ile elde ettiği gerçek tasarruflar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <Store className="w-8 h-8 text-green-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">ABC Market Zinciri</h3>
                <p className="text-sm text-gray-600 mb-4">
                  15 şubede 500 kW kurulum ile aylık ₺45,000 tasarruf
                </p>
                <div className="text-2xl font-bold text-green-600">%72 Tasarruf</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <Coffee className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Delta Restoran Grubu</h3>
                <p className="text-sm text-gray-600 mb-4">
                  8 restoranda 120 kW kurulum ile yıllık ₺380,000 tasarruf
                </p>
                <div className="text-2xl font-bold text-blue-600">4.2 Yıl Geri Ödeme</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <Car className="w-8 h-8 text-purple-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Mega Oto Galeri</h3>
                <p className="text-sm text-gray-600 mb-4">
                  80 kW sistem ile showroom ve servis elektrik giderlerinde büyük tasarruf
                </p>
                <div className="text-2xl font-bold text-purple-600">%68 Tasarruf</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              İşletmenizde Enerji Tasarrufu Dönemi Başlasın!
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Bugün başvurun, 15-20 gün içinde işletmenizde güneş enerjisi üretmeye başlayın. 
              Uzman ticari GES ekibimiz tüm süreci yönetir, siz sadece tasarrufun keyfini çıkarın.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/signup" className="bg-white text-orange-600 hover:bg-white/90">
                  <Building className="w-5 h-5 mr-2" />
                  Ticari GES Projesi Başlat
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              
              <LeadCaptureDialog title="Acil İşletme Danışmanlığı">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
                  <Phone className="w-5 h-5 mr-2" />
                  Acil Danışmanlık Hattı
                </Button>
              </LeadCaptureDialog>
            </div>
            
            <div className="flex items-center justify-center space-x-8 mt-12 pt-8 border-t border-white/20">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Hızlı Kurulum</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>25 Yıl Garanti</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Ticari Uzmanlar</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}