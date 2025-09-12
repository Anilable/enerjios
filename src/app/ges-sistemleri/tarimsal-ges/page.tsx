import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LeadCaptureDialog } from '@/components/ui/lead-capture-dialog'
import { 
  ArrowRight, 
  CheckCircle, 
  Tractor, 
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
  Droplets,
  Wheat,
  Mountain
} from 'lucide-react'

export default function TarimsalGesPage() {
  const benefits = [
    {
      icon: PiggyBank,
      title: "Tarımsal Elektrik Desteği",
      description: "Sulama, soğutma ve diğer tarımsal faaliyetlerde %90 tasarruf"
    },
    {
      icon: Droplets,
      title: "Kesintisiz Sulama",
      description: "Güneş enerjisi ile çalışan sulama sistemleri"
    },
    {
      icon: Leaf,
      title: "Sürdürülebilir Tarım",
      description: "Çevre dostu üretim ile organik tarıma katkı"
    },
    {
      icon: Shield,
      title: "Devlet Teşvikleri",
      description: "Tarımsal GES için özel hibe ve destek programları"
    }
  ]

  const features = [
    "Tarımsal arazi koruyucu agri-voltaik sistemler",
    "Sulama sistemleri ile entegre çözümler", 
    "Dayanıklı ve çiftlik koşullarına uygun paneller",
    "Uzaktan izleme ve otomatik kontrol",
    "Hava koşullarına dayanıklı inverterler",
    "Kolay bakım ve temizlik imkanı",
    "Mobil uygulama ile sistem takibi",
    "7/24 teknik destek hizmeti"
  ]

  const packages = [
    {
      name: "Küçük Çiftlik",
      power: "10 kW",
      panels: "25 Adet Panel",
      price: "45,000",
      features: [
        "10 kW Güneş Sistemi",
        "25 Adet 400W Panel", 
        "Tarımsal İnverter",
        "Temel İzleme Sistemi",
        "Standart Kurulum",
        "3 Yıl Servis Garantisi"
      ],
      popular: false
    },
    {
      name: "Orta Çiftlik",
      power: "25 kW", 
      panels: "63 Adet Panel",
      price: "105,000",
      features: [
        "25 kW Güneş Sistemi",
        "63 Adet 400W Panel",
        "Hibrit İnverter Sistemi", 
        "Akıllı İzleme",
        "Sulama Entegrasyonu",
        "5 Yıl Kapsamlı Garanti"
      ],
      popular: true
    },
    {
      name: "Büyük Tarım İşletmesi",
      power: "50 kW+",
      panels: "125+ Adet Panel", 
      price: "Talebe Göre",
      features: [
        "50 kW+ Güneş Sistemi",
        "125+ Adet Panel",
        "Agri-Voltaik Sistem",
        "SCADA İzleme",
        "Sera Entegrasyonu",
        "10 Yıl Kapsamlı Garanti"
      ],
      popular: false
    }
  ]

  const applications = [
    {
      name: "Sulama Sistemleri",
      description: "Güneş enerjisi ile çalışan damlama sulama ve yağmurlama sistemleri",
      icon: Droplets
    },
    {
      name: "Sera İşletmeleri", 
      description: "Isıtma, soğutma ve aydınlatma için enerji sağlama",
      icon: Leaf
    },
    {
      name: "Hayvancılık Tesisleri",
      description: "Ahır aydınlatması, sağım ve soğutma sistemleri",
      icon: Mountain
    },
    {
      name: "Tahıl Kurutma",
      description: "Hasat sonrası tahıl kurutma ve depolama sistemleri", 
      icon: Wheat
    }
  ]

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 py-20">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.3)_0%,transparent_50%)]" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-green-600/10 text-green-700 border-green-300">
                  <Tractor className="w-4 h-4 mr-2" />
                  Tarımsal Güneş Enerjisi Sistemleri
                </Badge>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                  Çiftçiler İçin
                  <span className="text-green-600 block">Akıllı Enerji Çözümleri</span>
                </h1>
                
                <p className="text-xl text-gray-600">
                  Tarımsal güneş enerjisi sistemleri ile çiftlik maliyetlerinizi düşürün. 
                  Sulama, soğutma ve tüm tarımsal faaliyetleriniz için temiz enerji.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
                  <Link href="/auth/signup">
                    <Calculator className="w-5 h-5 mr-2" />
                    Tarımsal GES Teklifi
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                
                <LeadCaptureDialog title="Tarımsal GES Danışmanlığı" description="Çiftliğiniz için özel çözüm geliştirme görüşmesi planlayalım">
                  <Button variant="outline" size="lg" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                    <Phone className="w-5 h-5 mr-2" />
                    Çiftlik Danışmanlığı
                  </Button>
                </LeadCaptureDialog>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">%90</div>
                  <div className="text-sm text-gray-600">Enerji Tasarrufu</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">Devlet</div>
                  <div className="text-sm text-gray-600">Teşvikleri</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">4-6 Yıl</div>
                  <div className="text-sm text-gray-600">Geri Ödeme</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-2xl">
                <div className="w-full h-64 bg-gradient-to-r from-green-100 via-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Tractor className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">Tarımsal GES Sistemi</p>
                    <p className="text-sm text-gray-500">Çiftlik görseli yakında</p>
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
              Tarımsal GES'in Çiftçilere Faydaları
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Güneş enerjisi ile çiftlik maliyetlerinizi düşürün, verimliliğinizi artırın
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-green-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <benefit.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="py-20 bg-green-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Tarımsal GES Kullanım Alanları
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Çiftlik faaliyetlerinizin her alanında güneş enerjisi çözümleri
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {applications.map((application, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow bg-white">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center mb-4">
                    <application.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{application.name}</h3>
                  <p className="text-gray-600 text-sm">{application.description}</p>
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
                Çiftlik Koşullarına Özel Teknoloji
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
                <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
                  <Link href="/auth/signup">
                    Teknik Detaylar İçin Başvur
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <Card className="bg-gradient-to-br from-green-50 to-yellow-50 shadow-xl">
                <CardContent className="p-8">
                  <div className="w-full h-80 bg-gradient-to-br from-green-100 to-yellow-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-green-600/10 p-4 rounded-lg">
                          <Droplets className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="text-sm font-medium">Sulama Sistemi</p>
                        </div>
                        <div className="bg-yellow-600/10 p-4 rounded-lg">
                          <Sun className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                          <p className="text-sm font-medium">Solar Panel</p>
                        </div>
                      </div>
                      <p className="text-gray-600">Agri-Voltaik Sistem</p>
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
              Tarımsal GES Çözüm Paketleri
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Çiftliğinizin büyüklüğüne uygun güneş enerjisi sistemleri
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <Card key={index} className={`relative ${pkg.popular ? 'ring-2 ring-green-600 shadow-xl' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white px-4 py-1">
                      <Award className="w-4 h-4 mr-1" />
                      Çiftçi Favorisi
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-green-600">
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
                    className={`w-full ${pkg.popular ? 'bg-green-600 hover:bg-green-700' : ''}`} 
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
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-6 max-w-2xl mx-auto mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">🌾 Tarımsal GES Teşvikleri</h3>
              <p className="text-yellow-700 text-sm">
                Tarım ve Orman Bakanlığı tarımsal GES kurulumları için %50'ye varan hibe desteği sağlamaktadır. 
                Ayrıca KOSGEB ve TÜBİTAK destekleri de mevcuttur.
              </p>
            </div>
            
            <LeadCaptureDialog title="Teşvik Başvuru Danışmanlığı" description="Tarımsal GES teşvikleri için başvuru sürecinde size yardımcı olalım">
              <Button variant="outline" size="lg" className="border-green-600 text-green-600">
                <Shield className="w-5 h-5 mr-2" />
                Teşvik Başvurusu
              </Button>
            </LeadCaptureDialog>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Çiftliğinizde Güneş Enerjisi Dönemi Başlasın!
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Bugün başvurun, 15-20 gün içinde çiftliğinizde güneş enerjisi üretmeye başlayın. 
              Uzman tarımsal GES ekibimiz tüm süreci yönetir, devlet teşviklerinden faydalanın.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/signup" className="bg-white text-green-600 hover:bg-white/90">
                  <Tractor className="w-5 h-5 mr-2" />
                  Çiftlik GES Projesi Başlat
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              
              <LeadCaptureDialog title="Acil Çiftlik Danışmanlığı">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  <Phone className="w-5 h-5 mr-2" />
                  Tarımsal GES Danışmanlık
                </Button>
              </LeadCaptureDialog>
            </div>
            
            <div className="flex items-center justify-center space-x-8 mt-12 pt-8 border-t border-white/20">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Devlet Teşvikleri</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Hızlı Kurulum</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Tarım Uzmanları</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}