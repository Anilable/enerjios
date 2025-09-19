'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  Search,
  Star,
  MapPin,
  Clock,
  Filter,
  Grid3X3,
  List,
  Phone,
  Mail,
  Globe,
  Award,
  Briefcase,
  Users,
  Building,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { PARTNER_TYPES, PartnerSearchFilters } from '@/types/partner'
import { Partner } from '@/types/partner'

const SPECIALTIES = [
  'Residential Solar',
  'Commercial Solar',
  'Industrial Solar',
  'Agricultural Solar',
  'Rooftop Installation',
  'Ground Mount',
  'Battery Storage',
  'Grid-Tie Systems',
  'Off-Grid Systems',
  'Maintenance & Support',
  'Solar Financing',
  'Energy Management',
]

const PARTNER_TYPE_ICONS = {
  INSTALLATION_COMPANY: Building,
  MANUFACTURER: Zap,
  CONSULTANT: Users,
  FINANCIAL_PARTNER: Briefcase,
}

export default function PartnersPage() {
  const router = useRouter()

  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filters
  const [filters, setFilters] = useState<PartnerSearchFilters>({
    sortBy: 'rating',
    sortOrder: 'desc',
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [minRating, setMinRating] = useState<number[]>([1])
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchPartners()
  }, [filters, currentPage])

  const fetchPartners = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      if (selectedLocation) params.append('location', selectedLocation)
      if (selectedType) params.append('partnerType', selectedType)
      if (minRating[0] > 1) params.append('minRating', minRating[0].toString())
      if (selectedSpecialties.length > 0) params.append('specialties', selectedSpecialties.join(','))
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

      params.append('page', currentPage.toString())
      params.append('limit', '12')

      const response = await fetch(`/api/partners?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch partners')
      }

      const data = await response.json()
      setPartners(data.partners)
      setTotalPages(data.pagination.pages)
      setTotalCount(data.pagination.total)

    } catch (error) {
      console.error('Failed to fetch partners:', error)
      toast.error('Failed to load partners')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      location: selectedLocation || undefined,
      partnerType: selectedType as any || undefined,
      minRating: minRating[0] > 1 ? minRating[0] : undefined,
      specialties: selectedSpecialties.length > 0 ? selectedSpecialties : undefined,
    }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSelectedLocation('')
    setSelectedType('')
    setSelectedSpecialties([])
    setMinRating([1])
    setFilters({
      sortBy: 'rating',
      sortOrder: 'desc',
    })
    setCurrentPage(1)
  }

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    )
  }

  const handleRequestQuote = (partnerId: string) => {
    router.push(`/request-quotes?partnerId=${partnerId}`)
  }

  const viewPartnerDetails = (partnerId: string) => {
    router.push(`/partner/${partnerId}`)
  }

  const StarRating = ({ rating, size = 4 }: { rating: number; size?: number }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-${size} h-${size} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    )
  }

  const PartnerCard = ({ partner }: { partner: Partner }) => {
    const TypeIcon = PARTNER_TYPE_ICONS[partner.type]

    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <div onClick={() => viewPartnerDetails(partner.id)}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {partner.company.logo ? (
                  <img
                    src={partner.company.logo}
                    alt={partner.company.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <TypeIcon className="w-6 h-6 text-amber-600" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-lg">{partner.company.name}</CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span>{partner.company.city}</span>
                  </div>
                </div>
              </div>
              <Badge variant="secondary">
                {PARTNER_TYPES.find(t => t.value === partner.type)?.label}
              </Badge>
            </div>
          </CardHeader>
        </div>

        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <StarRating rating={partner.customerRating} />
              <Badge variant="outline" className="text-xs">
                {partner.tier}
              </Badge>
            </div>

            <div className="text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{partner.responseTimeHours}h response</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="w-3 h-3" />
                  <span>{partner.totalProjects} projects</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {partner.specialties.slice(0, 3).map((specialty) => (
                <Badge key={specialty} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {partner.specialties.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{partner.specialties.length - 3} more
                </Badge>
              )}
            </div>

            <div className="text-xs text-gray-500">
              Service areas: {partner.serviceAreas.slice(0, 3).join(', ')}
              {partner.serviceAreas.length > 3 && ` +${partner.serviceAreas.length - 3} more`}
            </div>

            <div className="flex space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => viewPartnerDetails(partner.id)}
              >
                View Details
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRequestQuote(partner.id)
                }}
              >
                Request Quote
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const PartnerListItem = ({ partner }: { partner: Partner }) => {
    const TypeIcon = PARTNER_TYPE_ICONS[partner.type]

    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => viewPartnerDetails(partner.id)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {partner.company.logo ? (
                <img
                  src={partner.company.logo}
                  alt={partner.company.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center">
                  <TypeIcon className="w-8 h-8 text-amber-600" />
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold">{partner.company.name}</h3>
                  <Badge variant="secondary">
                    {PARTNER_TYPES.find(t => t.value === partner.type)?.label}
                  </Badge>
                  <Badge variant="outline">{partner.tier}</Badge>
                </div>

                <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{partner.company.city}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{partner.responseTimeHours}h response</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>{partner.totalProjects} projects</span>
                  </div>
                </div>

                <div className="mb-3">
                  <StarRating rating={partner.customerRating} size={4} />
                </div>

                {partner.description && (
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {partner.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-1 mb-3">
                  {partner.specialties.slice(0, 5).map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {partner.specialties.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{partner.specialties.length - 5} more
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Service areas: {partner.serviceAreas.slice(0, 5).join(', ')}
                  {partner.serviceAreas.length > 5 && ` +${partner.serviceAreas.length - 5} more`}
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  viewPartnerDetails(partner.id)
                }}
              >
                View Details
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRequestQuote(partner.id)
                }}
              >
                Request Quote
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Find Solar Partners
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Connect with verified solar energy professionals in your area
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by location or company name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Input
                    placeholder="City or region"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Partner Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      {PARTNER_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Minimum Rating: {minRating[0]}
                  </label>
                  <Slider
                    value={minRating}
                    onValueChange={setMinRating}
                    max={5}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="responseTime">Response Time</SelectItem>
                      <SelectItem value="totalProjects">Projects Count</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {showFilters && (
              <div>
                <label className="text-sm font-medium mb-2 block">Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(specialty => (
                    <Badge
                      key={specialty}
                      variant={selectedSpecialties.includes(specialty) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleSpecialty(specialty)}
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button onClick={handleSearch}>
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {loading ? 'Loading...' : `${totalCount} partners found`}
        </p>
      </div>

      {/* Partners List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : partners.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">No partners found matching your criteria</p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map(partner => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {partners.map(partner => (
                <PartnerListItem key={partner.id} partner={partner} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex space-x-2">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i
                  if (pageNum > totalPages) return null

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}