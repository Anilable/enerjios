'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AgrovoltaicCalculator } from '@/components/farming/agrovoltaic-calculator'
import { CropCompatibilityAnalyzer } from '@/components/farming/crop-compatibility'
import { FarmingDashboard } from '@/components/farming/farming-dashboard'
import { SpecializedCalculators } from '@/components/farming/specialized-calculators'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Tractor,
  Wheat,
  Sun,
  Calculator,
  MapPin,
  TrendingUp,
  Droplets,
  Leaf,
  Home,
  BarChart3,
  Calendar,
  Settings,
  Globe,
  Zap
} from 'lucide-react'

export interface CropData {
  id: string
  name: string
  scientificName: string
  category: 'CEREAL' | 'VEGETABLE' | 'FRUIT' | 'LEGUME' | 'INDUSTRIAL' | 'GREENHOUSE'
  shadeTolerance: number // 0-100%
  heightAtMaturity: number // cm
  waterRequirement: 'LOW' | 'MEDIUM' | 'HIGH'
  plantingMonths: number[]
  harvestMonths: number[]
  yieldPerHectare: number // tons/ha
  marketPrice: number // TRY/kg
  compatibilityScore: number // 0-100 with agrovoltaics
  regions: string[]
  specialNotes: string
}

export interface AgrovoltaicProject {
  farmName: string
  location: string
  totalArea: number // hectares
  availableArea: number // hectares for solar
  soilType: string
  irrigationType: 'DRIP' | 'SPRINKLER' | 'FLOOD' | 'NONE'
  primaryCrop: string
  secondaryCrop?: string
  currentYield: number
  energyNeed: number // kWh/year
  budget: number
}

export interface RegionalData {
  region: string
  province: string
  district: string
  climate: 'MEDITERRANEAN' | 'CONTINENTAL' | 'BLACK_SEA' | 'AEGEAN' | 'MARMARA' | 'SOUTHEASTERN' | 'EASTERN'
  avgSunHours: number
  avgTemperature: number
  rainfallMm: number
  dominantCrops: string[]
  soilTypes: string[]
  incentiveMultiplier: number
}

export default function AgriSolarPage() {
  const [activeTab, setActiveTab] = useState('calculator')
  const [selectedProject, setSelectedProject] = useState<AgrovoltaicProject>({
    farmName: '',
    location: 'Trakya',
    totalArea: 10,
    availableArea: 5,
    soilType: 'Killi-tınlı',
    irrigationType: 'DRIP',
    primaryCrop: 'wheat',
    energyNeed: 50000,
    budget: 500000,
    currentYield: 4.5
  })

  const [regionalData, setRegionalData] = useState<RegionalData[]>([])
  const [cropDatabase, setCropDatabase] = useState<CropData[]>([])

  useEffect(() => {
    loadRegionalData()
    loadCropDatabase()
  }, [])

  const loadRegionalData = () => {
    const regions: RegionalData[] = [
      {
        region: 'Trakya Bölgesi',
        province: 'Edirne',
        district: 'Merkez',
        climate: 'CONTINENTAL',
        avgSunHours: 7.2,
        avgTemperature: 14.5,
        rainfallMm: 580,
        dominantCrops: ['wheat', 'sunflower', 'canola'],
        soilTypes: ['Killi-tınlı', 'Kumlu-tın', 'Alüvyal'],
        incentiveMultiplier: 1.2
      },
      {
        region: 'Ege Bölgesi',
        province: 'İzmir',
        district: 'Menemen',
        climate: 'MEDITERRANEAN',
        avgSunHours: 8.1,
        avgTemperature: 18.2,
        rainfallMm: 720,
        dominantCrops: ['olive', 'grape', 'cotton'],
        soilTypes: ['Kırmızı Akdeniz', 'Alüvyal', 'Kireçli'],
        incentiveMultiplier: 1.1
      },
      {
        region: 'Akdeniz Bölgesi',
        province: 'Antalya',
        district: 'Serik',
        climate: 'MEDITERRANEAN',
        avgSunHours: 9.2,
        avgTemperature: 20.1,
        rainfallMm: 1100,
        dominantCrops: ['tomato', 'cucumber', 'pepper'],
        soilTypes: ['Terra Rosa', 'Alüvyal', 'Kırmızı Akdeniz'],
        incentiveMultiplier: 1.3
      },
      {
        region: 'İç Anadolu',
        province: 'Konya',
        district: 'Çumra',
        climate: 'CONTINENTAL',
        avgSunHours: 8.5,
        avgTemperature: 12.8,
        rainfallMm: 350,
        dominantCrops: ['wheat', 'barley', 'sugar_beet'],
        soilTypes: ['Kastanoz', 'Kestane', 'Solonçak'],
        incentiveMultiplier: 1.4
      },
      {
        region: 'Karadeniz Bölgesi',
        province: 'Samsun',
        district: 'Bafra',
        climate: 'BLACK_SEA',
        avgSunHours: 5.8,
        avgTemperature: 14.9,
        rainfallMm: 720,
        dominantCrops: ['corn', 'hazelnut', 'tea'],
        soilTypes: ['Kahverengi Orman', 'Alüvyal', 'Podzolik'],
        incentiveMultiplier: 0.9
      }
    ]
    setRegionalData(regions)
  }

  const loadCropDatabase = () => {
    const crops: CropData[] = [
      {
        id: 'wheat',
        name: 'Buğday',
        scientificName: 'Triticum aestivum',
        category: 'CEREAL',
        shadeTolerance: 20,
        heightAtMaturity: 120,
        waterRequirement: 'MEDIUM',
        plantingMonths: [10, 11],
        harvestMonths: [6, 7],
        yieldPerHectare: 4.5,
        marketPrice: 4.5,
        compatibilityScore: 75,
        regions: ['Trakya', 'İç Anadolu', 'Güneydoğu Anadolu'],
        specialNotes: 'Panel yüksekliği en az 3m olmalı, sıra arası 8m+'
      },
      {
        id: 'corn',
        name: 'Mısır',
        scientificName: 'Zea mays',
        category: 'CEREAL',
        shadeTolerance: 15,
        heightAtMaturity: 250,
        waterRequirement: 'HIGH',
        plantingMonths: [4, 5],
        harvestMonths: [9, 10],
        yieldPerHectare: 11.2,
        marketPrice: 3.8,
        compatibilityScore: 60,
        regions: ['Karadeniz', 'Marmara', 'Trakya'],
        specialNotes: 'Yüksek boy nedeniyle panel yüksekliği 4m+ gerekli'
      },
      {
        id: 'sunflower',
        name: 'Ayçiçeği',
        scientificName: 'Helianthus annuus',
        category: 'INDUSTRIAL',
        shadeTolerance: 10,
        heightAtMaturity: 200,
        waterRequirement: 'MEDIUM',
        plantingMonths: [3, 4],
        harvestMonths: [8, 9],
        yieldPerHectare: 2.8,
        marketPrice: 8.5,
        compatibilityScore: 45,
        regions: ['Trakya', 'Marmara', 'İç Anadolu'],
        specialNotes: 'Güneşi takip eder, panel gölgesi minimum olmalı'
      },
      {
        id: 'tomato',
        name: 'Domates',
        scientificName: 'Solanum lycopersicum',
        category: 'VEGETABLE',
        shadeTolerance: 40,
        heightAtMaturity: 180,
        waterRequirement: 'HIGH',
        plantingMonths: [3, 4, 5],
        harvestMonths: [6, 7, 8, 9, 10],
        yieldPerHectare: 65,
        marketPrice: 4.2,
        compatibilityScore: 85,
        regions: ['Akdeniz', 'Ege', 'Marmara'],
        specialNotes: 'Sera tarımında çok uyumlu, gölgeden faydalanır'
      },
      {
        id: 'cucumber',
        name: 'Salatalık',
        scientificName: 'Cucumis sativus',
        category: 'VEGETABLE',
        shadeTolerance: 50,
        heightAtMaturity: 60,
        waterRequirement: 'HIGH',
        plantingMonths: [4, 5, 6],
        harvestMonths: [6, 7, 8, 9],
        yieldPerHectare: 45,
        marketPrice: 3.8,
        compatibilityScore: 90,
        regions: ['Akdeniz', 'Ege', 'Marmara'],
        specialNotes: 'Sera ve açık alan agrovoltaik için ideal'
      },
      {
        id: 'olive',
        name: 'Zeytin',
        scientificName: 'Olea europaea',
        category: 'FRUIT',
        shadeTolerance: 30,
        heightAtMaturity: 800,
        waterRequirement: 'LOW',
        plantingMonths: [3, 4, 10, 11],
        harvestMonths: [10, 11, 12],
        yieldPerHectare: 3.5,
        marketPrice: 12.5,
        compatibilityScore: 70,
        regions: ['Ege', 'Akdeniz', 'Marmara'],
        specialNotes: 'Ağaçlar arası panel kurulumu mümkün'
      },
      {
        id: 'cotton',
        name: 'Pamuk',
        scientificName: 'Gossypium hirsutum',
        category: 'INDUSTRIAL',
        shadeTolerance: 25,
        heightAtMaturity: 150,
        waterRequirement: 'HIGH',
        plantingMonths: [4, 5],
        harvestMonths: [9, 10, 11],
        yieldPerHectare: 1.8,
        marketPrice: 18.5,
        compatibilityScore: 65,
        regions: ['Ege', 'Akdeniz', 'Güneydoğu Anadolu'],
        specialNotes: 'Sulama sistemi ile entegrasyon önemli'
      }
    ]
    setCropDatabase(crops)
  }

  const getCurrentRegion = () => {
    return regionalData.find(r => r.region.includes(selectedProject.location)) || regionalData[0]
  }

  const getCompatibleCrops = () => {
    const region = getCurrentRegion()
    return cropDatabase.filter(crop => 
      region?.dominantCrops.includes(crop.id) && crop.compatibilityScore >= 60
    )
  }

  return (
    <DashboardLayout>
      <div className="flex h-full bg-gray-50">
        {/* Header */}
        <div className="w-full">
          <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                  <Tractor className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">🌾 Agrovoltaik Sistemi</h1>
                  <p className="text-green-100 mt-1">
                    Tarım + Enerji = İkili Gelir • Türkiye&apos;nin İlk Kapsamlı Çiftçi Modülü
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-6 text-green-100">
                  <div>
                    <div className="text-2xl font-bold">%{getCurrentRegion()?.incentiveMultiplier ? (getCurrentRegion()!.incentiveMultiplier * 100 - 100).toFixed(0) : '20'}</div>
                    <div className="text-sm">Bölgesel Destek</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{getCompatibleCrops().length}</div>
                    <div className="text-sm">Uyumlu Ürün</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{getCurrentRegion()?.avgSunHours || 7.5}</div>
                    <div className="text-sm">Günlük Güneş</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-3">
                <Wheat className="w-6 h-6 mb-2" />
                <div className="text-lg font-semibold">{selectedProject.totalArea} ha</div>
                <div className="text-sm opacity-90">Toplam Arazi</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <Sun className="w-6 h-6 mb-2" />
                <div className="text-lg font-semibold">{selectedProject.availableArea} ha</div>
                <div className="text-sm opacity-90">Solar Alan</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <TrendingUp className="w-6 h-6 mb-2" />
                <div className="text-lg font-semibold">₺{(selectedProject.budget / 1000).toFixed(0)}K</div>
                <div className="text-sm opacity-90">Yatırım Bütçesi</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <Droplets className="w-6 h-6 mb-2" />
                <div className="text-lg font-semibold">{selectedProject.irrigationType}</div>
                <div className="text-sm opacity-90">Sulama Tipi</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <Leaf className="w-6 h-6 mb-2" />
                <div className="text-lg font-semibold">{cropDatabase.find(c => c.id === selectedProject.primaryCrop)?.name || 'Seçiniz'}</div>
                <div className="text-sm opacity-90">Ana Ürün</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto mb-6">
                <TabsTrigger value="calculator" className="flex items-center space-x-2">
                  <Calculator className="w-4 h-4" />
                  <span>Hesaplayıcı</span>
                </TabsTrigger>
                <TabsTrigger value="crops" className="flex items-center space-x-2">
                  <Wheat className="w-4 h-4" />
                  <span>Ürün Uyumu</span>
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Çiftlik Yönetimi</span>
                </TabsTrigger>
                <TabsTrigger value="specialized" className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>Özel Sistemler</span>
                </TabsTrigger>
                <TabsTrigger value="regional" className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Bölgesel Analiz</span>
                </TabsTrigger>
              </TabsList>

              {/* Agrovoltaic Calculator */}
              <TabsContent value="calculator" className="space-y-6">
                <AgrovoltaicCalculator 
                  project={selectedProject}
                  onProjectChange={setSelectedProject}
                  cropDatabase={cropDatabase}
                  regionalData={regionalData}
                />
              </TabsContent>

              {/* Crop Compatibility */}
              <TabsContent value="crops" className="space-y-6">
                <CropCompatibilityAnalyzer 
                  cropDatabase={cropDatabase}
                  selectedProject={selectedProject}
                  regionalData={regionalData}
                />
              </TabsContent>

              {/* Farm Dashboard */}
              <TabsContent value="dashboard" className="space-y-6">
                <FarmingDashboard 
                  project={selectedProject}
                  cropDatabase={cropDatabase}
                  regionalData={regionalData}
                />
              </TabsContent>

              {/* Specialized Calculators */}
              <TabsContent value="specialized" className="space-y-6">
                <SpecializedCalculators 
                  project={selectedProject}
                  cropDatabase={cropDatabase}
                />
              </TabsContent>

              {/* Regional Analysis */}
              <TabsContent value="regional" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Bölgesel Tarım Analizi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {regionalData.map((region, index) => (
                        <Card key={index} className={`hover:shadow-md transition-shadow ${
                          region.region.includes(selectedProject.location) ? 'ring-2 ring-primary' : ''
                        }`}>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-lg mb-2">{region.region}</h3>
                            <p className="text-gray-600 text-sm mb-3">{region.province} - {region.district}</p>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Güneş Saati:</span>
                                <span className="font-medium">{region.avgSunHours}h/gün</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Ortalama Sıcaklık:</span>
                                <span className="font-medium">{region.avgTemperature}°C</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Yıllık Yağış:</span>
                                <span className="font-medium">{region.rainfallMm}mm</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Destek Çarpanı:</span>
                                <span className="font-medium text-green-600">x{region.incentiveMultiplier}</span>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t">
                              <h4 className="font-medium text-sm mb-2">Dominant Ürünler:</h4>
                              <div className="flex flex-wrap gap-1">
                                {region.dominantCrops.map((cropId, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {cropDatabase.find(c => c.id === cropId)?.name || cropId}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <Button 
                              className="w-full mt-4" 
                              size="sm"
                              variant={region.region.includes(selectedProject.location) ? "default" : "outline"}
                              onClick={() => setSelectedProject({
                                ...selectedProject,
                                location: region.region.split(' ')[0]
                              })}
                            >
                              {region.region.includes(selectedProject.location) ? 'Seçili Bölge' : 'Bu Bölgeyi Seç'}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}