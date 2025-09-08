import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Building, 
  Tractor, 
  Store,
  ArrowRight,
  Calculator,
  TrendingUp,
  Shield,
  Zap,
  Leaf,
  PiggyBank,
  Sun
} from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: Home,
      title: 'Ev GES Sistemleri',
      description: 'Çatı sistemleri ile elektrik faturanızı %90\'a kadar azaltın',
      benefits: ['5-15 kW kapasiteler', '25 yıl garanti', '7-9 yıl geri ödeme'],
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      href: '/ev-ges',
      badge: 'Popüler'
    },
    {
      icon: Building,
      title: 'Endüstriyel GES',
      description: 'Fabrika ve büyük tesisler için yüksek kapasiteli çözümler',
      benefits: ['100kW - 10MW+', 'Enerji yönetimi', 'B2B finansman'],
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-700',
      href: '/endustriyel-ges',
      badge: 'Kurumsal'
    },
    {
      icon: Tractor,
      title: 'Tarımsal GES',
      description: 'Çiftçiler için özel agrovoltaik ve tarımsal enerji çözümleri',
      benefits: ['Arazi verimliliği', 'Su tasarrufu', 'Çifte gelir'],
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      href: '/tarimsal-ges',
      badge: 'Özel'
    },
    {
      icon: Store,
      title: 'Ticari GES',
      description: 'KOBİ ve ticari işletmeler için maliyet-etkin çözümler',
      benefits: ['15-100 kW', 'İşletme tasarrufu', 'Vergi avantajı'],
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      href: '/ticari-ges',
      badge: 'KOBİ'
    },
  ]

  const advantages = [
    {
      icon: Calculator,
      title: 'Akıllı Hesaplama',
      description: '3D tasarım ve yapay zeka ile optimum sistem boyutlandırma'
    },
    {
      icon: TrendingUp,
      title: 'Finansal Analiz',
      description: 'ROI, NPV ve IRR analizleri ile yatırım değerlendirme'
    },
    {
      icon: Shield,
      title: '25 Yıl Garanti',
      description: 'Panel, inverter ve sistem performansı tam garantili'
    },
    {
      icon: PiggyBank,
      title: 'Finansman Desteği',
      description: 'Kredi, leasing ve sıfır peşin ödeme seçenekleri'
    },
    {
      icon: Leaf,
      title: 'Yeşil Enerji',
      description: 'Karbon ayak izinizi azaltın, çevreye katkıda bulunun'
    },
    {
      icon: Zap,
      title: 'Hızlı Kurulum',
      description: '15-30 gün içinde anahtar teslim proje tamamlama'
    },
  ]

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sun className="w-4 h-4" />
            <span>Güneş Enerjisi Çözümleri</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Her İhtiyaca Özel
            <span className="text-primary block">GES Sistemleri</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Evden fabrikaya, çiftlikten ofise kadar her alan için özel tasarlanmış güneş enerjisi sistemleri. 
            25 yıllık garantili çözümlerle temiz enerjiye geçiş yapın.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className={`group hover:shadow-xl transition-all duration-300 border-0 ${feature.bgColor} hover:scale-105`}>
                <CardHeader className="text-center pb-4">
                  <div className="relative inline-block">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-8 h-8 ${feature.iconColor}`} />
                    </div>
                    {feature.badge && (
                      <Badge className="absolute -top-2 -right-2 text-xs bg-primary text-white">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-600 text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-2 mb-6">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    variant="ghost" 
                    className="w-full group-hover:bg-white group-hover:text-primary transition-colors"
                    asChild
                  >
                    <Link href={feature.href}>
                      Detay Gör
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Advantages Grid */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Neden EnerjiOS?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Türkiye'nin en kapsamlı GES platformu ile güneş enerjisinde fark yaratıyoruz
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => {
              const Icon = advantage.icon
              return (
                <div key={index} className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Icon className="w-6 h-6 text-primary group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {advantage.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {advantage.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link href="/calculator">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
                <Calculator className="w-5 h-5 mr-2" />
                Hemen GES Hesapla
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}