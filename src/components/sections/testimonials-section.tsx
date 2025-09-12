'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Quote, 
  Tractor,
  Home,
  Building,
  Store,
  TrendingUp,
  Zap,
  Leaf
} from 'lucide-react'

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: 'Mehmet Çiftçi',
      title: 'Çiftçi - Konya',
      avatar: '/images/avatars/mehmet.jpg',
      type: 'FARMER',
      typeIcon: Tractor,
      rating: 5,
      content: 'Tarımsal GES sistemimiz sayesinde hem elektrik tasarrufu yapıyoruz hem de tarlalarımızı daha verimli kullanıyoruz. Aylık 3.500 TL elektrik faturası 200 TL\'ye düştü.',
      stats: {
        savings: '₺3.300/ay tasarruf',
        system: '75 kW Tarımsal GES',
        payback: '6.2 yıl geri ödeme'
      },
      image: '/images/projects/konya-farm.jpg'
    },
    {
      id: 2,
      name: 'Ayşe Yılmaz',
      title: 'Ev Sahibi - İstanbul',
      avatar: '/images/avatars/ayse.jpg',
      type: 'CUSTOMER',
      typeIcon: Home,
      rating: 5,
      content: 'Çatı GES sistemimiz 2 yıldır sorunsuz çalışıyor. 850 TL olan elektrik faturamız 80 TL\'ye düştü. Çocuklarımıza temiz bir gelecek bırakmanın mutluluğu paha biçilemez.',
      stats: {
        savings: '₺770/ay tasarruf',
        system: '12 kW Çatı GES',
        payback: '7.5 yıl geri ödeme'
      },
      image: '/images/projects/istanbul-home.jpg'
    },
    {
      id: 3,
      name: 'Ahmet Kaya',
      title: 'Fabrika Sahibi - Bursa',
      avatar: '/images/avatars/ahmet.jpg',
      type: 'COMPANY',
      typeIcon: Building,
      rating: 5,
      content: 'Fabrikamızdaki 250 kW GES sistemi ile enerji maliyetlerimizi %85 azalttık. EnerjiOS ekibi kurulumdan sonra da sürekli destek veriyor.',
      stats: {
        savings: '₺15.000/ay tasarruf',
        system: '250 kW Endüstriyel GES',
        payback: '5.8 yıl geri ödeme'
      },
      image: '/images/projects/bursa-factory.jpg'
    },
    {
      id: 4,
      name: 'Fatma Demir',
      title: 'Market Sahibi - Antalya',
      avatar: '/images/avatars/fatma.jpg',
      type: 'BUSINESS',
      typeIcon: Store,
      rating: 5,
      content: 'Marketimizin çatısında 25 kW GES sistemi kuruldu. Klima ve soğutma maliyetleri çok azaldı. Yatırımımızı 6 yılda amorti edeceğiz.',
      stats: {
        savings: '₺1.200/ay tasarruf',
        system: '25 kW Ticari GES',
        payback: '6.0 yıl geri ödeme'
      },
      image: '/images/projects/antalya-market.jpg'
    }
  ]

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const currentTestimonial = testimonials[currentIndex]
  const TypeIcon = currentTestimonial.typeIcon

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'FARMER': return 'Çiftçi'
      case 'CUSTOMER': return 'Ev Sahibi'
      case 'COMPANY': return 'Endüstriyel'
      case 'BUSINESS': return 'Ticari'
      default: return 'Müşteri'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FARMER': return 'bg-green-100 text-green-800'
      case 'CUSTOMER': return 'bg-blue-100 text-blue-800'
      case 'COMPANY': return 'bg-gray-100 text-gray-800'
      case 'BUSINESS': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const overallStats = [
    { icon: TrendingUp, value: '₺2.4M+', label: 'Toplam Müşteri Tasarrufu' },
    { icon: Zap, value: '50MW+', label: 'Kurulu Güç' },
    { icon: Leaf, value: '25K Ton', label: 'CO₂ Azaltımı' },
    { icon: Home, value: '500+', label: 'Mutlu Müşteri' },
  ]

  return (
    <section className="py-20 lg:py-32 bg-white relative z-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            <span>Müşteri Yorumları</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Müşterilerimiz
            <span className="text-primary block">Ne Diyor?</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Gerçek müşterilerimizin deneyimleri ve güneş enerjisi ile elde ettikleri tasarruf hikayeleri
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="overflow-hidden shadow-2xl border-0">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                
                {/* Content */}
                <div className="p-8 lg:p-12">
                  <div className="mb-6">
                    <Quote className="w-8 h-8 text-primary mb-4" />
                    
                    {/* Rating */}
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(currentTestimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="ml-2 text-sm text-gray-600 font-medium">
                        {currentTestimonial.rating}.0
                      </span>
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="text-lg text-gray-700 mb-8 leading-relaxed">
                    "{currentTestimonial.content}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center space-x-4 mb-6">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={currentTestimonial.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {currentTestimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="font-semibold text-gray-900">
                        {currentTestimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {currentTestimonial.title}
                      </div>
                    </div>

                    <Badge 
                      variant="secondary" 
                      className={`ml-auto ${getTypeColor(currentTestimonial.type)}`}
                    >
                      <TypeIcon className="w-3 h-3 mr-1" />
                      {getTypeLabel(currentTestimonial.type)}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-600">Aylık Tasarruf</span>
                      <span className="font-semibold text-green-700">
                        {currentTestimonial.stats.savings}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-600">Sistem</span>
                      <span className="font-semibold text-blue-700">
                        {currentTestimonial.stats.system}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                      <span className="text-gray-600">Geri Ödeme</span>
                      <span className="font-semibold text-primary">
                        {currentTestimonial.stats.payback}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div className="bg-gradient-to-br from-primary/20 to-yellow-100 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <TypeIcon className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      {getTypeLabel(currentTestimonial.type)} Müşterisi
                    </h3>
                    <p className="text-gray-600 text-sm">
                      EnerjiOS ile temiz enerjiye geçiş
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-center space-x-4 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={prevTestimonial}
              className="w-10 h-10 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextTestimonial}
              className="w-10 h-10 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="bg-gradient-to-r from-primary to-yellow-600 rounded-3xl p-8 lg:p-12 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              EnerjiOS ile Elde Edilen Sonuçlar
            </h3>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              Müşterilerimizin elde ettiği tasarruf ve çevre yararına katkılar
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {overallStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-primary-foreground/80">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}