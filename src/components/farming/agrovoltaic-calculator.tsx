'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Calculator,
  Ruler,
  Sun,
  Droplets,
  TrendingUp,
  DollarSign,
  Leaf,
  Zap,
  Home,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  BarChart3
} from 'lucide-react'
import type { AgrovoltaicProject, CropData, RegionalData } from '@/app/dashboard/agri-solar/page'

interface AgrovoltaicCalculatorProps {
  project: AgrovoltaicProject
  onProjectChange: (project: AgrovoltaicProject) => void
  cropDatabase: CropData[]
  regionalData: RegionalData[]
}

interface AgrovoltaicResults {
  panelConfiguration: {
    totalPanels: number
    panelPower: number
    totalCapacity: number
    panelHeight: number
    rowSpacing: number
    groundCoverage: number
  }
  energyProduction: {
    annualProduction: number
    monthlyAverage: number
    specificYield: number
    performanceRatio: number
  }
  agriculturalImpact: {
    shadingPercentage: number
    yieldReduction: number
    newYieldPerHa: number
    waterSavings: number
    soilProtection: boolean
  }
  economicAnalysis: {
    totalInvestment: number
    agricultureRevenue: number
    energyRevenue: number
    totalRevenue: number
    netProfit: number
    paybackPeriod: number
    roi: number
  }
  recommendations: string[]
}

export function AgrovoltaicCalculator({ 
  project, 
  onProjectChange, 
  cropDatabase, 
  regionalData 
}: AgrovoltaicCalculatorProps) {
  const [results, setResults] = useState<AgrovoltaicResults | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [selectedCrop, setSelectedCrop] = useState<CropData | null>(null)
  const [panelHeight, setPanelHeight] = useState([350]) // cm
  const [rowSpacing, setRowSpacing] = useState([800]) // cm
  const [panelTilt, setPanelTilt] = useState([35]) // degrees
  const [groundCoverage, setGroundCoverage] = useState([40]) // percentage

  useEffect(() => {
    const crop = cropDatabase.find(c => c.id === project.primaryCrop)
    setSelectedCrop(crop || null)
  }, [project.primaryCrop, cropDatabase])

  useEffect(() => {
    if (selectedCrop) {
      calculateAgrovoltaics()
    }
  }, [project, selectedCrop, panelHeight, rowSpacing, panelTilt, groundCoverage])

  const calculateAgrovoltaics = () => {
    if (!selectedCrop) return

    setIsCalculating(true)

    const currentRegion = regionalData.find(r => r.region.includes(project.location)) || regionalData[0]
    
    // Panel Configuration Calculations
    const panelArea = 2.0 // m² per panel (typical 450W panel)
    const panelPower = 450 // watts per panel
    const availableAreaM2 = project.availableArea * 10000 // convert ha to m²
    const effectiveAreaForPanels = availableAreaM2 * (groundCoverage[0] / 100)
    const totalPanels = Math.floor(effectiveAreaForPanels / (panelArea + (rowSpacing[0] / 100) * panelArea))
    const totalCapacity = totalPanels * panelPower / 1000 // kW

    // Energy Production Calculations
    const avgSunHours = currentRegion?.avgSunHours || 7.5
    const shadingLoss = Math.max(0, (panelHeight[0] - 300) / 100 * 0.05) // Height penalty
    const spacingBonus = Math.min(0.1, (rowSpacing[0] - 600) / 1000 * 0.05) // Spacing bonus
    const performanceRatio = Math.min(0.85, 0.75 + spacingBonus - shadingLoss)
    const annualProduction = totalCapacity * avgSunHours * 365 * performanceRatio
    const specificYield = totalCapacity > 0 ? annualProduction / totalCapacity : 0

    // Agricultural Impact Calculations
    const shadingPercentage = Math.min(80, groundCoverage[0] * (panelHeight[0] / 400))
    const cropShadeTolerance = selectedCrop.shadeTolerance / 100
    const yieldImpactFactor = Math.max(0.3, 1 - (shadingPercentage / 100 - cropShadeTolerance) * 1.5)
    const newYieldPerHa = project.currentYield * yieldImpactFactor
    const waterSavingsPercent = Math.min(30, shadingPercentage * 0.3) // Up to 30% water savings
    const soilProtection = panelHeight[0] >= 250 && rowSpacing[0] >= 600

    // Economic Analysis
    const panelCostPerKW = 4500 // TRY/kW installed
    const structureCostMultiplier = 1.4 // Higher structure costs for agrovoltaics
    const totalInvestment = totalCapacity * panelCostPerKW * structureCostMultiplier

    const cropPrice = selectedCrop.marketPrice // TRY/kg
    const agricultureRevenue = newYieldPerHa * project.availableArea * cropPrice * 1000 // yearly
    const energyPricePerKWh = 1.2 // TRY/kWh feed-in tariff
    const energyRevenue = annualProduction * energyPricePerKWh // yearly
    const totalRevenue = agricultureRevenue + energyRevenue
    
    const operatingCosts = totalRevenue * 0.15 // 15% operating costs
    const netProfit = totalRevenue - operatingCosts
    const paybackPeriod = totalInvestment / netProfit
    const roi = (netProfit / totalInvestment) * 100

    // Recommendations
    const recommendations: string[] = []
    
    if (panelHeight[0] < selectedCrop.heightAtMaturity + 100) {
      recommendations.push(`Panel yüksekliğini en az ${Math.ceil((selectedCrop.heightAtMaturity + 100) / 50) * 50}cm yapın`)
    }
    
    if (selectedCrop.shadeTolerance < 30 && shadingPercentage > 40) {
      recommendations.push(`${selectedCrop.name} düşük gölge toleransına sahip, panel aralığını artırın`)
    }
    
    if (selectedCrop.waterRequirement === 'HIGH' && waterSavingsPercent < 15) {
      recommendations.push('Su tasarrufu için panel kaplamayı artırın')
    }
    
    if (roi < 15) {
      recommendations.push('Yatırım getirisini artırmak için sistem boyutunu optimize edin')
    }
    
    if (paybackPeriod > 10) {
      recommendations.push('Geri ödeme süresini kısaltmak için desteklerden yararlanın')
    }

    if (selectedCrop.compatibilityScore >= 80) {
      recommendations.push(`${selectedCrop.name} agrovoltaik için mükemmel uyum gösteriyor`)
    }

    const calculatedResults: AgrovoltaicResults = {
      panelConfiguration: {
        totalPanels,
        panelPower,
        totalCapacity,
        panelHeight: panelHeight[0],
        rowSpacing: rowSpacing[0],
        groundCoverage: groundCoverage[0]
      },
      energyProduction: {
        annualProduction,
        monthlyAverage: annualProduction / 12,
        specificYield,
        performanceRatio
      },
      agriculturalImpact: {
        shadingPercentage,
        yieldReduction: ((project.currentYield - newYieldPerHa) / project.currentYield) * 100,
        newYieldPerHa,
        waterSavings: waterSavingsPercent,
        soilProtection
      },
      economicAnalysis: {
        totalInvestment,
        agricultureRevenue,
        energyRevenue,
        totalRevenue,
        netProfit,
        paybackPeriod,
        roi
      },
      recommendations
    }

    setResults(calculatedResults)
    setIsCalculating(false)
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getImpactColor = (impact: number, reverse = false) => {
    const threshold = reverse ? -10 : 10
    if (reverse ? impact <= threshold : impact >= threshold) return 'text-green-600'
    if (reverse ? impact <= 0 : impact <= 0) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Project Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Proje Konfigürasyonu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Project Info */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Temel Bilgiler</h4>
              
              <div className="space-y-2">
                <Label htmlFor="farmName">Çiftlik Adı</Label>
                <Input
                  id="farmName"
                  value={project.farmName}
                  onChange={(e) => onProjectChange({ ...project, farmName: e.target.value })}
                  placeholder="Örnek Çiftlik"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalArea">Toplam Arazi (ha)</Label>
                <Input
                  id="totalArea"
                  type="number"
                  value={project.totalArea}
                  onChange={(e) => onProjectChange({ ...project, totalArea: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableArea">Solar İçin Uygun Alan (ha)</Label>
                <Input
                  id="availableArea"
                  type="number"
                  value={project.availableArea}
                  onChange={(e) => onProjectChange({ ...project, availableArea: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Crop Selection */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Ürün Seçimi</h4>
              
              <div className="space-y-2">
                <Label htmlFor="primaryCrop">Ana Ürün</Label>
                <Select
                  value={project.primaryCrop}
                  onValueChange={(value) => onProjectChange({ ...project, primaryCrop: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ürün seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropDatabase.map((crop) => (
                      <SelectItem key={crop.id} value={crop.id}>
                        <div className="flex items-center space-x-2">
                          <span>{crop.name}</span>
                          <Badge className={`text-xs ${getCompatibilityColor(crop.compatibilityScore)}`}>
                            %{crop.compatibilityScore}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCrop && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <h5 className="font-medium mb-2">{selectedCrop.name} Özellikleri</h5>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Gölge Toleransı:</span>
                      <span className="font-medium">%{selectedCrop.shadeTolerance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Boy:</span>
                      <span className="font-medium">{selectedCrop.heightAtMaturity}cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Su İhtiyacı:</span>
                      <Badge variant={selectedCrop.waterRequirement === 'HIGH' ? 'destructive' : 
                                   selectedCrop.waterRequirement === 'MEDIUM' ? 'default' : 'secondary'}>
                        {selectedCrop.waterRequirement === 'HIGH' ? 'Yüksek' : 
                         selectedCrop.waterRequirement === 'MEDIUM' ? 'Orta' : 'Düşük'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentYield">Mevcut Verim (ton/ha)</Label>
                <Input
                  id="currentYield"
                  type="number"
                  step="0.1"
                  value={project.currentYield}
                  onChange={(e) => onProjectChange({ ...project, currentYield: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Technical Parameters */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Teknik Parametreler</h4>
              
              <div className="space-y-2">
                <Label htmlFor="irrigationType">Sulama Sistemi</Label>
                <Select
                  value={project.irrigationType}
                  onValueChange={(value: any) => onProjectChange({ ...project, irrigationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRIP">Damla Sulama</SelectItem>
                    <SelectItem value="SPRINKLER">Yağmurlama</SelectItem>
                    <SelectItem value="FLOOD">Salma Sulama</SelectItem>
                    <SelectItem value="NONE">Sulamasız</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Panel Yüksekliği: {panelHeight[0]}cm</Label>
                <Slider
                  value={panelHeight}
                  onValueChange={setPanelHeight}
                  max={500}
                  min={200}
                  step={25}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>200cm</span>
                  <span>500cm</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sıra Arası Mesafe: {rowSpacing[0]}cm</Label>
                <Slider
                  value={rowSpacing}
                  onValueChange={setRowSpacing}
                  max={1200}
                  min={400}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>4m</span>
                  <span>12m</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Zemin Kaplama: %{groundCoverage[0]}</Label>
                <Slider
                  value={groundCoverage}
                  onValueChange={setGroundCoverage}
                  max={60}
                  min={20}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>%20</span>
                  <span>%60</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="grid gap-6">
          {/* Technical Results */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Panel Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sun className="w-5 h-5 mr-2" />
                  Panel Konfigürasyonu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{results.panelConfiguration.totalPanels.toLocaleString()}</div>
                    <div className="text-sm text-blue-600">Toplam Panel</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{results.panelConfiguration.totalCapacity.toFixed(1)}kW</div>
                    <div className="text-sm text-blue-600">Sistem Gücü</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Panel Yüksekliği:</span>
                    <span className="font-medium">{results.panelConfiguration.panelHeight}cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sıra Arası:</span>
                    <span className="font-medium">{results.panelConfiguration.rowSpacing}cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Zemin Kaplaması:</span>
                    <span className="font-medium">%{results.panelConfiguration.groundCoverage}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Energy Production */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Enerji Üretimi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-700">{(results.energyProduction.annualProduction / 1000).toFixed(0)}MWh</div>
                    <div className="text-sm text-yellow-600">Yıllık Üretim</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-700">{results.energyProduction.specificYield.toFixed(0)}</div>
                    <div className="text-sm text-yellow-600">Özgül Verim</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Aylık Ortalama:</span>
                    <span className="font-medium">{(results.energyProduction.monthlyAverage / 1000).toFixed(1)}MWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performans Oranı:</span>
                    <span className="font-medium">%{(results.energyProduction.performanceRatio * 100).toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agricultural Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Leaf className="w-5 h-5 mr-2" />
                Tarımsal Etki Analizi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-700">%{results.agriculturalImpact.shadingPercentage.toFixed(1)}</div>
                  <div className="text-sm text-gray-600 mt-1">Gölgelenme</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-3xl font-bold ${getImpactColor(results.agriculturalImpact.yieldReduction, true)}`}>
                    %{results.agriculturalImpact.yieldReduction.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Verim Kaybı</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">%{results.agriculturalImpact.waterSavings.toFixed(1)}</div>
                  <div className="text-sm text-gray-600 mt-1">Su Tasarrufu</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-3xl ${results.agriculturalImpact.soilProtection ? 'text-green-600' : 'text-red-600'}`}>
                    {results.agriculturalImpact.soilProtection ? <CheckCircle className="w-8 h-8 mx-auto" /> : <AlertTriangle className="w-8 h-8 mx-auto" />}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Toprak Koruması</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Tarımsal Verim Projeksiyonu</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Mevcut Verim:</span>
                    <div className="font-bold text-blue-900">{project.currentYield} ton/ha</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Yeni Verim:</span>
                    <div className={`font-bold ${getImpactColor((results.agriculturalImpact.newYieldPerHa / project.currentYield - 1) * 100)}`}>
                      {results.agriculturalImpact.newYieldPerHa.toFixed(1)} ton/ha
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Economic Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Ekonomik Analiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">₺{(results.economicAnalysis.totalRevenue / 1000).toFixed(0)}K</div>
                  <div className="text-sm text-green-600">Yıllık Gelir</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">%{results.economicAnalysis.roi.toFixed(1)}</div>
                  <div className="text-sm text-blue-600">Yatırım Getirisi</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">{results.economicAnalysis.paybackPeriod.toFixed(1)}</div>
                  <div className="text-sm text-purple-600">Geri Ödeme (Yıl)</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Gelir Dağılımı</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tarım Geliri:</span>
                      <span className="font-medium">₺{results.economicAnalysis.agricultureRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Enerji Geliri:</span>
                      <span className="font-medium">₺{results.economicAnalysis.energyRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Toplam Gelir:</span>
                      <span>₺{results.economicAnalysis.totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Yatırım Analizi</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>İlk Yatırım:</span>
                      <span className="font-medium">₺{(results.economicAnalysis.totalInvestment / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Kâr:</span>
                      <span className="font-medium text-green-600">₺{results.economicAnalysis.netProfit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>NPV (10 yıl):</span>
                      <span className="text-green-600">₺{(results.economicAnalysis.netProfit * 6.14).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {results.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Öneriler ve Uyarılar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-yellow-800">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Detaylı Rapor İndir
            </Button>
            <Button size="lg" variant="outline">
              <Calculator className="w-4 h-4 mr-2" />
              Proje Kaydet
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}