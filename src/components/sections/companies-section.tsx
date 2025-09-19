'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Building2,
  MapPin,
  Star,
  ArrowRight,
  Users,
  Globe,
  Award,
  Eye
} from 'lucide-react'

interface Company {
  id: string
  name: string
  type: string
  location: string
  description: string
  logo?: string
  rating: number
  website?: string
  projectCount: number
  reviewCount: number
  specialization: string
}

interface CompaniesResponse {
  success: boolean
  data: Company[]
  total: number
  error?: string
}

export function CompaniesSection() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/companies/public')
      const data: CompaniesResponse = await response.json()

      if (data.success) {
        // Only show sample companies, ignore database companies for now
        const sampleCompanies = getSampleCompanies()
        setCompanies(sampleCompanies)
      } else {
        setError(data.error || 'Şirket bilgileri alınamadı')
      }
    } catch (err) {
      console.error('Error fetching companies:', err)
      setError('Şirket bilgileri alınırken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const getSampleCompanies = (): Company[] => [
    {
      id: 'havensis',
      name: 'Havensis',
      type: 'MANUFACTURER',
      location: 'İstanbul',
      description: 'Türkiye\'nin öncü güneş enerjisi çözümleri sağlayıcısı. Yenilikçi teknolojiler ve kaliteli üretim.',
      rating: 4.9,
      website: 'havensis.com',
      projectCount: 750,
      reviewCount: 220,
      specialization: 'Panel & Ekipman Üreticisi'
    },
    {
      id: 'hagel',
      name: 'Hagel',
      type: 'MANUFACTURER',
      location: 'Ankara',
      description: 'Yüksek verimli güneş paneli üretimi ve enerji depolama sistemleri konusunda uzman.',
      rating: 4.8,
      website: 'hagel.com.tr',
      projectCount: 650,
      reviewCount: 180,
      specialization: 'Panel & Ekipman Üreticisi'
    },
    {
      id: 'dmrtech',
      name: 'DMRTech',
      type: 'INSTALLER',
      location: 'İzmir',
      description: 'Profesyonel GES kurulum ve bakım hizmetleri. Endüstriyel ve konut projelerinde uzman.',
      rating: 4.7,
      website: 'dmrtech.com.tr',
      projectCount: 420,
      reviewCount: 150,
      specialization: 'GES Kurulum Firması'
    },
    {
      id: 'tommatech',
      name: 'Tommatech',
      type: 'MANUFACTURER',
      location: 'Bursa',
      description: 'İleri teknoloji güneş paneli üretimi ve AR-GE çalışmaları ile sektörde öncü kuruluş.',
      rating: 4.8,
      website: 'tommatech.com',
      projectCount: 580,
      reviewCount: 195,
      specialization: 'Panel & Ekipman Üreticisi'
    },
    {
      id: 'cw-enerji',
      name: 'CW Enerji',
      type: 'MANUFACTURER',
      location: 'Antalya OSB, Antalya',
      description: '2010\'dan beri güneş enerjisi alanında faaliyet gösteren. Yıllık 1.8 GW panel üretim kapasitesi ile Türkiye\'nin öncü firmalarından.',
      rating: 4.9,
      website: 'cw-enerji.com',
      projectCount: 850,
      reviewCount: 245,
      specialization: 'Panel & Ekipman Üreticisi'
    }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INSTALLER':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'MANUFACTURER':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'CONSULTANT':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'BANK':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Building2 className="w-4 h-4" />
              <span>Güvenilir Partnerler</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Sektörün
              <span className="text-primary block">Öncü Firmaları</span>
            </h2>
          </div>

          <div className="flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="companies-section" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Building2 className="w-4 h-4" />
            <span>Güvenilir Partnerler</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Sektörün
            <span className="text-primary block">Öncü Firmaları</span>
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Güneş enerjisi sektöründe güvenilir çözüm ortaklarımızla tanışın.
            Uzman firmalarımız ile projelerinizi hayata geçirin.
          </p>
        </div>

        {/* Companies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {companies.map((company) => (
            <Card key={company.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white relative overflow-hidden">
              <CardContent className="p-6">
                {/* Company Logo/Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-primary" />
                  )}
                </div>

                {/* Company Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                      {company.name}
                    </h3>

                    <Badge
                      variant="outline"
                      className={`text-xs ${getTypeColor(company.type)}`}
                    >
                      {company.specialization}
                    </Badge>
                  </div>

                  {/* Location */}
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{company.location}</span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                    {company.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    {/* Rating */}
                    {company.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700">
                          {company.rating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Project Count */}
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {company.projectCount} proje
                      </span>
                    </div>
                  </div>

                  {/* Website Link */}
                  {company.website && (
                    <div className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors">
                      <Globe className="w-4 h-4 mr-2" />
                      <span className="truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                    </div>
                  )}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl p-8 lg:p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <Award className="w-16 h-16 text-primary mx-auto mb-6" />

            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Daha Fazla Firma ve Detaylı Bilgiler
            </h3>

            <p className="text-gray-600 mb-8">
              Tüm güvenilir partnerlerimizi görmek, detaylı firma profillerini incelemek ve
              projeleriniz için en uygun firmayı bulmak için giriş yapın.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="px-8"
                asChild
              >
                <Link href="/auth/signin">
                  <Eye className="w-5 h-5 mr-2" />
                  Daha Fazlası İçin Giriş Yapın
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="px-8"
                asChild
              >
                <Link href="/companies">
                  Tüm Firmaları Gör
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}