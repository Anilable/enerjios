import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Award, 
  Users, 
  Phone, 
  Clock, 
  CheckCircle,
  Star,
  ArrowRight,
  Sun,
  Zap,
  Leaf,
  Building
} from 'lucide-react'

export function TrustSection() {
  const certifications = [
    {
      icon: Shield,
      title: 'ISO 9001',
      description: 'Kalite Yönetim Sistemi',
      verified: true,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Award,
      title: 'EPDK Yetkili',
      description: 'Enerji Piyasası Düzenleme Kurumu',
      verified: true,
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: CheckCircle,
      title: 'TSE Onaylı',
      description: 'Türk Standartları Enstitüsü',
      verified: true,
      color: 'text-red-600 bg-red-50'
    },
    {
      icon: Leaf,
      title: 'Yeşil Sertifika',
      description: 'Çevre Dostu Enerji Üretimi',
      verified: true,
      color: 'text-emerald-600 bg-emerald-50'
    }
  ]

  const guarantees = [
    {
      icon: Shield,
      title: '25 Yıl Panel Garantisi',
      description: 'Performans ve üretim garantisi ile uzun vadeli güvence'
    },
    {
      icon: Zap,
      title: '10 Yıl İnverter Garantisi',
      description: 'Sistem bileşenleri için kapsamlı garanti'
    },
    {
      icon: Users,
      title: '7/24 Teknik Destek',
      description: 'Kesintisiz müşteri hizmetleri ve teknik destek'
    },
    {
      icon: Phone,
      title: 'Ücretsiz Bakım',
      description: 'İlk 2 yıl ücretsiz periyodik bakım hizmeti'
    }
  ]

  const partners = [
    {
      name: 'Jinko Solar',
      type: 'Panel Üreticisi',
      logo: '/logos/jinko.png',
      description: 'Dünya\'nın en büyük panel üreticisi'
    },
    {
      name: 'Huawei',
      type: 'İnverter Üreticisi', 
      logo: '/logos/huawei.png',
      description: 'Akıllı enerji çözümleri lideri'
    },
    {
      name: 'SMA Solar',
      type: 'İnverter Üreticisi',
      logo: '/logos/sma.png',
      description: 'Alman kalitesi inverter teknolojisi'
    },
    {
      name: 'Canadian Solar',
      type: 'Panel Üreticisi',
      logo: '/logos/canadian.png',
      description: 'Güvenilir panel teknolojisi'
    }
  ]

  const achievements = [
    { value: '500+', label: 'Tamamlanan Proje', icon: Building },
    { value: '%99.8', label: 'Müşteri Memnuniyeti', icon: Star },
    { value: '50MW+', label: 'Kurulu Güç', icon: Zap },
    { value: '5 Yıl+', label: 'Sektör Deneyimi', icon: Clock },
  ]

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            <span>Güven & Kalite</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Neden Bize
            <span className="text-primary block">Güvenmelisiniz?</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sektörün önde gelen firmalarıyla işbirliği, uluslararası sertifikalar ve 
            binlerce mutlu müşteriyle güven yarattık.
          </p>
        </div>

        {/* Certifications */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {certifications.map((cert, index) => {
            const Icon = cert.icon
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${cert.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center justify-center">
                    {cert.title}
                    {cert.verified && (
                      <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                    )}
                  </h3>
                  
                  <p className="text-sm text-gray-600">
                    {cert.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Guarantees */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 mb-16 shadow-lg">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Kapsamlı Garanti Sistemi
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Yatırımınızın güvencesi altında uzun vadeli tasarruf yapın
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {guarantees.map((guarantee, index) => {
              const Icon = guarantee.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {guarantee.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {guarantee.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Partners */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Güvenilir Partnerlerimiz
            </h3>
            <p className="text-gray-600">
              Dünya lideri markalarla işbirliği yaparak kaliteyi garanti ediyoruz
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((partner, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 bg-white border-0">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
                    <Sun className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                  
                  <h4 className="font-bold text-gray-900 mb-1">
                    {partner.name}
                  </h4>
                  
                  <Badge variant="secondary" className="text-xs mb-2">
                    {partner.type}
                  </Badge>
                  
                  <p className="text-xs text-gray-600">
                    {partner.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-gradient-to-r from-primary to-yellow-600 rounded-3xl p-8 lg:p-12 text-white">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Rakamlarla EnerjiOS
            </h3>
            <p className="text-primary-foreground/80">
              Başarılarımız ve müşteri memnuniyetimizle gururluyuz
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {achievement.value}
                  </div>
                  <div className="text-sm text-primary-foreground/80">
                    {achievement.label}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center">
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white text-primary hover:bg-white/90 px-8"
              asChild
            >
              <Link href="/about">
                Hakkımızda Daha Fazla
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}