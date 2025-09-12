'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search,
  Filter,
  Wheat,
  Sun,
  Droplets,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Leaf,
  Star,
  BarChart3,
  MapPin
} from 'lucide-react'
import type { CropData, AgrovoltaicProject, RegionalData } from '@/app/dashboard/agri-solar/page'

interface CropCompatibilityProps {
  cropDatabase: CropData[]
  selectedProject: AgrovoltaicProject
  regionalData: RegionalData[]
}

export function CropCompatibilityAnalyzer({ cropDatabase, selectedProject, regionalData }: CropCompatibilityProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'compatibility' | 'yield' | 'price'>('compatibility')
  const [selectedCrop, setSelectedCrop] = useState<CropData | null>(null)

  const getCurrentRegion = () => {
    return regionalData.find(r => r.region.includes(selectedProject.location)) || regionalData[0]
  }

  const getFilteredCrops = () => {
    let filtered = cropDatabase
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(crop => 
        crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Category filter
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(crop => crop.category === selectedCategory)
    }
    
    // Regional filter
    const currentRegion = getCurrentRegion()
    if (currentRegion) {
      filtered = filtered.filter(crop => 
        crop.regions.some(region => region.toLowerCase().includes(selectedProject.location.toLowerCase())) ||
        currentRegion.dominantCrops.includes(crop.id)
      )
    }
    
    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'compatibility':
          return b.compatibilityScore - a.compatibilityScore
        case 'yield':
          return b.yieldPerHectare - a.yieldPerHectare
        case 'price':
          return b.marketPrice - a.marketPrice
        default:
          return 0
      }
    })
  }

  const getCompatibilityLevel = (score: number) => {
    if (score >= 80) return { level: 'Mükemmel', color: 'bg-green-500 text-white', icon: CheckCircle }
    if (score >= 60) return { level: 'İyi', color: 'bg-blue-500 text-white', icon: Info }
    if (score >= 40) return { level: 'Orta', color: 'bg-yellow-500 text-white', icon: AlertTriangle }
    return { level: 'Düşük', color: 'bg-red-500 text-white', icon: AlertTriangle }
  }

  const getSeasonalInfo = (crop: CropData) => {
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
    
    return {
      planting: crop.plantingMonths.map(m => months[m - 1]).join(', '),
      harvest: crop.harvestMonths.map(m => months[m - 1]).join(', ')
    }
  }

  const calculateRevenuePotential = (crop: CropData, areaHa: number, yieldReduction = 0.15) => {
    const adjustedYield = crop.yieldPerHectare * (1 - yieldReduction)
    const totalProduction = adjustedYield * areaHa * 1000 // kg
    const revenue = totalProduction * crop.marketPrice
    return {
      production: totalProduction,
      revenue,
      revenuePerHa: revenue / areaHa
    }
  }

  const categories = [
    { id: 'ALL', name: 'Tüm Ürünler', icon: Wheat },
    { id: 'CEREAL', name: 'Tahıllar', icon: Wheat },
    { id: 'VEGETABLE', name: 'Sebzeler', icon: Leaf },
    { id: 'FRUIT', name: 'Meyveler', icon: Sun },
    { id: 'LEGUME', name: 'Baklagiller', icon: Leaf },
    { id: 'INDUSTRIAL', name: 'Endüstriyel', icon: BarChart3 },
    { id: 'GREENHOUSE', name: 'Sera Ürünleri', icon: CheckCircle }
  ]

  const filteredCrops = getFilteredCrops()

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Leaf className="w-5 h-5 mr-2" />
            Ürün Uyumluluk Analizi
          </CardTitle>
          <p className="text-gray-600 text-sm">
            {selectedProject.location} bölgesi için agrovoltaik sistemlere uygun ürünleri keşfedin
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <Label htmlFor="search">Ürün Ara</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Ürün adı veya bilimsel isim..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <Label>Sıralama</Label>
              <select 
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="compatibility">Uyumluluk Skoru</option>
                <option value="yield">Verim (ton/ha)</option>
                <option value="price">Pazar Fiyatı</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-7">
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <TabsTrigger key={cat.id} value={cat.id} className="flex items-center space-x-1">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{cat.name}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Crop Grid */}
      <div className="grid gap-4">
        {filteredCrops.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCrops.map((crop) => {
              const compatibility = getCompatibilityLevel(crop.compatibilityScore)
              const seasonal = getSeasonalInfo(crop)
              const revenue = calculateRevenuePotential(crop, selectedProject.availableArea)
              const Icon = compatibility.icon

              return (
                <Card 
                  key={crop.id} 
                  className={`hover:shadow-lg transition-all cursor-pointer ${
                    selectedCrop?.id === crop.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedCrop(crop)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{crop.name}</h3>
                        <p className="text-sm text-gray-600 italic">{crop.scientificName}</p>
                      </div>
                      <Badge className={compatibility.color}>
                        <Icon className="w-3 h-3 mr-1" />
                        {compatibility.level}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{crop.category}</Badge>
                      {crop.compatibilityScore >= 80 && (
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          ÖNERİLEN
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-lg font-bold text-primary">%{crop.shadeTolerance}</div>
                        <div className="text-xs text-gray-600">Gölge Toleransı</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-lg font-bold text-green-600">{crop.yieldPerHectare}</div>
                        <div className="text-xs text-gray-600">ton/ha</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-lg font-bold text-blue-600">₺{crop.marketPrice}</div>
                        <div className="text-xs text-gray-600">/kg</div>
                      </div>
                    </div>

                    {/* Agricultural Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          Ekim:
                        </span>
                        <span className="font-medium">{seasonal.planting}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          Hasat:
                        </span>
                        <span className="font-medium">{seasonal.harvest}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-gray-600">
                          <Droplets className="w-4 h-4 mr-1" />
                          Su İhtiyacı:
                        </span>
                        <Badge variant={crop.waterRequirement === 'HIGH' ? 'destructive' : 
                                     crop.waterRequirement === 'MEDIUM' ? 'default' : 'secondary'}>
                          {crop.waterRequirement === 'HIGH' ? 'Yüksek' : 
                           crop.waterRequirement === 'MEDIUM' ? 'Orta' : 'Düşük'}
                        </Badge>
                      </div>
                    </div>

                    {/* Revenue Projection */}
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 text-sm mb-2">
                        {selectedProject.availableArea}ha için Gelir Tahmini
                      </h4>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-700">
                          ₺{(revenue.revenue / 1000).toFixed(0)}K
                        </div>
                        <div className="text-xs text-green-600">Yıllık Tarım Geliri</div>
                      </div>
                    </div>

                    {/* Special Notes */}
                    {crop.specialNotes && (
                      <div className="p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                        <Info className="w-3 h-3 inline mr-1" />
                        {crop.specialNotes}
                      </div>
                    )}

                    {/* Regional Suitability */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center text-gray-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        Uygun Bölgeler:
                      </span>
                      <div className="flex space-x-1">
                        {crop.regions.slice(0, 2).map((region, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün Bulunamadı</h3>
              <p className="text-gray-600">
                Arama kriterlerinizi değiştirerek tekrar deneyin
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Crop Analysis */}
      {selectedCrop && (
        <Card className="border-primary">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center text-primary">
              <Star className="w-5 h-5 mr-2" />
              {selectedCrop.name} - Detaylı Analiz
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Agricultural Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Tarımsal Özellikler</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Boy (Olgunlukta)</div>
                    <div className="text-lg font-bold">{selectedCrop.heightAtMaturity}cm</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Gölge Toleransı</div>
                    <div className="text-lg font-bold text-primary">%{selectedCrop.shadeTolerance}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Verim</div>
                    <div className="text-lg font-bold text-green-600">{selectedCrop.yieldPerHectare} ton/ha</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Pazar Fiyatı</div>
                    <div className="text-lg font-bold text-blue-600">₺{selectedCrop.marketPrice}/kg</div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Özel Notlar</h5>
                  <p className="text-sm text-blue-800">{selectedCrop.specialNotes}</p>
                </div>
              </div>

              {/* Right Column - Agrovoltaic Compatibility */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Agrovoltaik Uyumluluk</h4>
                
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {selectedCrop.compatibilityScore}
                  </div>
                  <div className="text-sm text-gray-600">Uyumluluk Skoru (0-100)</div>
                  <Badge className={getCompatibilityLevel(selectedCrop.compatibilityScore).color + ' mt-2'}>
                    {getCompatibilityLevel(selectedCrop.compatibilityScore).level}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Panel Yükseklik Önerisi:</span>
                    <span className="font-bold text-primary">
                      {Math.ceil((selectedCrop.heightAtMaturity + 100) / 50) * 50}cm+
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Önerilen Sıra Arası:</span>
                    <span className="font-bold">
                      {selectedCrop.shadeTolerance > 40 ? '6-8m' : '8-12m'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Su Tasarrufu Potansiyeli:</span>
                    <span className="font-bold text-blue-600">
                      %{selectedCrop.waterRequirement === 'HIGH' ? '20-30' : 
                         selectedCrop.waterRequirement === 'MEDIUM' ? '10-20' : '5-15'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-2">
                    {selectedProject.availableArea}ha İçin Projeksiyon
                  </h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Tahmini Üretim:</span>
                      <span className="font-bold">{(calculateRevenuePotential(selectedCrop, selectedProject.availableArea).production / 1000).toFixed(1)} ton</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yıllık Gelir:</span>
                      <span className="font-bold text-green-600">₺{(calculateRevenuePotential(selectedCrop, selectedProject.availableArea).revenue / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hektar Başı Gelir:</span>
                      <span className="font-bold">₺{(calculateRevenuePotential(selectedCrop, selectedProject.availableArea).revenuePerHa / 1000).toFixed(0)}K/ha</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mt-6 pt-6 border-t">
              <Button 
                onClick={() => {
                  // Update the project with selected crop
                  // This would be handled by parent component
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Bu Ürünü Seç
              </Button>
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Detaylı Rapor
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}