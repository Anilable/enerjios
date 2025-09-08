'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Home,
  Droplets,
  Beef,
  Sprout,
  Sun,
  Zap,
  Calculator,
  DollarSign,
  TrendingUp,
  Thermometer,
  Wind,
  Settings,
  BarChart3,
  Activity
} from 'lucide-react'
import type { AgrovoltaicProject, CropData } from '@/app/dashboard/agri-solar/page'

interface SpecializedCalculatorsProps {
  project: AgrovoltaicProject
  cropDatabase: CropData[]
}

interface GreenhouseConfig {
  length: number
  width: number
  height: number
  roofType: 'GABLE' | 'ARCH' | 'LEAN_TO'
  coveringMaterial: 'GLASS' | 'POLYCARBONATE' | 'POLYETHYLENE'
  ventilationType: 'NATURAL' | 'FORCED' | 'HYBRID'
  heatingType: 'NONE' | 'ELECTRIC' | 'GAS' | 'BIOMASS'
  energyConsumption: number // kWh/m²/year
}

interface LivestockConfig {
  animalType: 'CATTLE' | 'SHEEP' | 'GOAT' | 'POULTRY'
  animalCount: number
  barnLength: number
  barnWidth: number
  dailyWaterConsumption: number // liters per animal
  feedingSystem: 'MANUAL' | 'AUTOMATIC'
  ventilationPower: number // kW
  lightingHours: number
}

interface IrrigationConfig {
  irrigatedArea: number // hectares
  cropType: string
  irrigationType: 'DRIP' | 'SPRINKLER' | 'FLOOD'
  pumpPower: number // kW
  pumpingHours: number // hours per day
  waterSource: 'WELL' | 'SURFACE' | 'MUNICIPALITY'
  pumpDepth: number // meters (for wells)
}

export function SpecializedCalculators({ project, cropDatabase }: SpecializedCalculatorsProps) {
  const [activeCalculator, setActiveCalculator] = useState('greenhouse')
  
  // Greenhouse State
  const [greenhouseConfig, setGreenhouseConfig] = useState<GreenhouseConfig>({
    length: 50,
    width: 20,
    height: 4,
    roofType: 'GABLE',
    coveringMaterial: 'POLYCARBONATE',
    ventilationType: 'HYBRID',
    heatingType: 'ELECTRIC',
    energyConsumption: 150
  })

  // Livestock State
  const [livestockConfig, setLivestockConfig] = useState<LivestockConfig>({
    animalType: 'CATTLE',
    animalCount: 50,
    barnLength: 30,
    barnWidth: 12,
    dailyWaterConsumption: 80,
    feedingSystem: 'AUTOMATIC',
    ventilationPower: 5,
    lightingHours: 8
  })

  // Irrigation State
  const [irrigationConfig, setIrrigationConfig] = useState<IrrigationConfig>({
    irrigatedArea: project.availableArea,
    cropType: project.primaryCrop,
    irrigationType: project.irrigationType,
    pumpPower: 5,
    pumpingHours: 6,
    waterSource: 'WELL',
    pumpDepth: 50
  })

  const calculateGreenhouseSolar = () => {
    const floorArea = greenhouseConfig.length * greenhouseConfig.width // m²
    const roofArea = floorArea * (greenhouseConfig.roofType === 'GABLE' ? 1.2 : 1.1) // considering slope
    
    // Solar panel capacity calculation
    const panelEfficiency = 0.22 // 22% efficiency
    const panelDensity = 0.85 // 85% roof coverage
    const usableRoofArea = roofArea * panelDensity
    const solarCapacity = usableRoofArea * 0.35 // kW (350W/m² panel density)
    
    // Energy consumption calculation
    const annualConsumption = floorArea * greenhouseConfig.energyConsumption // kWh/year
    const heatingLoad = getHeatingLoad(floorArea, greenhouseConfig.heatingType)
    const coolingLoad = getCoolingLoad(floorArea, greenhouseConfig.ventilationType)
    const lightingLoad = getLightingLoad(floorArea)
    const totalAnnualConsumption = annualConsumption + heatingLoad + coolingLoad + lightingLoad
    
    // Solar production
    const avgSolarHours = 7.5 // hours per day
    const performanceRatio = 0.8
    const annualProduction = solarCapacity * avgSolarHours * 365 * performanceRatio
    
    // Economics
    const systemCost = solarCapacity * 5000 // TRY/kW for greenhouse systems
    const energySavings = Math.min(annualProduction, totalAnnualConsumption) * 1.5 // TRY/kWh
    const excessEnergy = Math.max(0, annualProduction - totalAnnualConsumption)
    const feedInRevenue = excessEnergy * 0.8 // TRY/kWh feed-in tariff
    const totalAnnualSavings = energySavings + feedInRevenue
    
    return {
      floorArea,
      roofArea,
      solarCapacity,
      annualConsumption: totalAnnualConsumption,
      annualProduction,
      systemCost,
      annualSavings: totalAnnualSavings,
      paybackPeriod: systemCost / totalAnnualSavings,
      selfConsumption: (Math.min(annualProduction, totalAnnualConsumption) / annualProduction) * 100,
      roi: (totalAnnualSavings / systemCost) * 100
    }
  }

  const calculateLivestockSolar = () => {
    const barnArea = livestockConfig.barnLength * livestockConfig.barnWidth
    const roofArea = barnArea * 1.1 // including overhangs
    
    // Solar system sizing
    const solarCapacity = roofArea * 0.3 // kW (300W/m²)
    
    // Energy consumption calculation
    const ventilationConsumption = livestockConfig.ventilationPower * 12 * 365 // kWh/year
    const lightingConsumption = getLightingConsumption(barnArea, livestockConfig.lightingHours)
    const waterPumpingConsumption = getWaterPumpingConsumption(livestockConfig)
    const feedingSystemConsumption = getFeedingSystemConsumption(livestockConfig)
    const totalAnnualConsumption = ventilationConsumption + lightingConsumption + waterPumpingConsumption + feedingSystemConsumption
    
    // Solar production
    const annualProduction = solarCapacity * 7.5 * 365 * 0.8
    
    // Economics
    const systemCost = solarCapacity * 4800 // TRY/kW for barn roof systems
    const energySavings = Math.min(annualProduction, totalAnnualConsumption) * 1.5
    const excessRevenue = Math.max(0, annualProduction - totalAnnualConsumption) * 0.8
    const totalSavings = energySavings + excessRevenue
    
    return {
      barnArea,
      roofArea,
      solarCapacity,
      annualConsumption: totalAnnualConsumption,
      annualProduction,
      systemCost,
      annualSavings: totalSavings,
      paybackPeriod: systemCost / totalSavings,
      roi: (totalSavings / systemCost) * 100,
      carbonOffset: (annualProduction * 0.5) / 1000 // tons CO2/year
    }
  }

  const calculateIrrigationSolar = () => {
    const pumpingConsumption = irrigationConfig.pumpPower * irrigationConfig.pumpingHours * 200 // 200 days irrigation season
    const totalHead = irrigationConfig.pumpDepth + 20 // meters (depth + pressure head)
    const efficiency = getIrrigationEfficiency(irrigationConfig.irrigationType)
    
    // Water requirements
    const cropWaterNeed = getCropWaterNeed(irrigationConfig.cropType, irrigationConfig.irrigatedArea)
    const systemCapacity = (cropWaterNeed * 1.2) / efficiency // including losses
    
    // Solar pump sizing
    const requiredPower = (systemCapacity * totalHead * 9.81) / (3600 * 0.6) // kW (60% pump efficiency)
    const solarArraySize = requiredPower * 1.3 // 30% oversizing for varying conditions
    
    // Economics
    const solarPumpCost = solarArraySize * 6000 // TRY/kW for solar pumping systems
    const currentElectricityCost = pumpingConsumption * 2.5 // TRY/kWh agricultural tariff
    const maintenanceSavings = 2000 // TRY/year (reduced conventional pump maintenance)
    const totalAnnualSavings = currentElectricityCost + maintenanceSavings
    
    return {
      irrigatedArea: irrigationConfig.irrigatedArea,
      waterRequirement: systemCapacity,
      solarArraySize,
      currentConsumption: pumpingConsumption,
      systemCost: solarPumpCost,
      annualSavings: totalAnnualSavings,
      paybackPeriod: solarPumpCost / totalAnnualSavings,
      roi: (totalAnnualSavings / solarPumpCost) * 100,
      waterEfficiency: efficiency * 100
    }
  }

  // Helper functions
  const getHeatingLoad = (area: number, heatingType: string) => {
    const heatingDemand = { 'NONE': 0, 'ELECTRIC': 80, 'GAS': 60, 'BIOMASS': 40 }
    return area * (heatingDemand[heatingType as keyof typeof heatingDemand] || 0) // kWh/year
  }

  const getCoolingLoad = (area: number, ventilationType: string) => {
    const coolingDemand = { 'NATURAL': 5, 'FORCED': 15, 'HYBRID': 10 }
    return area * (coolingDemand[ventilationType as keyof typeof coolingDemand] || 0)
  }

  const getLightingLoad = (area: number) => {
    return area * 20 // 20 kWh/m²/year for greenhouse lighting
  }

  const getLightingConsumption = (barnArea: number, hours: number) => {
    return barnArea * 0.01 * hours * 365 // 10W/m² LED lighting
  }

  const getWaterPumpingConsumption = (config: LivestockConfig) => {
    const dailyWaterNeed = config.animalCount * config.dailyWaterConsumption
    return (dailyWaterNeed * 0.002 * 365) // Approximate pump energy for water lifting
  }

  const getFeedingSystemConsumption = (config: LivestockConfig) => {
    if (config.feedingSystem === 'AUTOMATIC') {
      return config.animalCount * 50 // kWh/year per animal
    }
    return 0
  }

  const getIrrigationEfficiency = (type: string) => {
    const efficiencies = { 'DRIP': 0.9, 'SPRINKLER': 0.8, 'FLOOD': 0.6 }
    return efficiencies[type as keyof typeof efficiencies] || 0.7
  }

  const getCropWaterNeed = (cropType: string, area: number) => {
    const crop = cropDatabase.find(c => c.id === cropType)
    const waterNeed = { 'LOW': 300, 'MEDIUM': 500, 'HIGH': 700 } // mm/year
    const requirement = waterNeed[crop?.waterRequirement as keyof typeof waterNeed] || 500
    return area * 10000 * requirement / 1000000 // m³/year
  }

  const calculators = [
    { id: 'greenhouse', name: 'Sera Üzeri Solar', icon: Home, color: 'text-green-600' },
    { id: 'livestock', name: 'Ahır Çatısı Solar', icon: Beef, color: 'text-blue-600' },
    { id: 'irrigation', name: 'Solar Sulama Sistemi', icon: Droplets, color: 'text-cyan-600' },
    { id: 'storage', name: 'Depolama + Solar', icon: Settings, color: 'text-purple-600' }
  ]

  return (
    <div className="space-y-6">
      {/* Calculator Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Özel Tarım Sistemleri
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Tarımsal ihtiyaçlarınıza özel solar çözümlerini keşfedin
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {calculators.map((calc) => {
              const Icon = calc.icon
              return (
                <Button
                  key={calc.id}
                  variant={activeCalculator === calc.id ? "default" : "outline"}
                  className="h-20 flex-col space-y-2"
                  onClick={() => setActiveCalculator(calc.id)}
                >
                  <Icon className={`w-6 h-6 ${calc.color}`} />
                  <span className="text-sm">{calc.name}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Greenhouse Solar Calculator */}
      {activeCalculator === 'greenhouse' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Sera Üzeri Solar Sistem Hesaplayıcı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Configuration */}
                <div className="space-y-4">
                  <h4 className="font-medium">Sera Özellikleri</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Uzunluk (m)</Label>
                      <Input
                        type="number"
                        value={greenhouseConfig.length}
                        onChange={(e) => setGreenhouseConfig({
                          ...greenhouseConfig,
                          length: Number(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <Label>Genişlik (m)</Label>
                      <Input
                        type="number"
                        value={greenhouseConfig.width}
                        onChange={(e) => setGreenhouseConfig({
                          ...greenhouseConfig,
                          width: Number(e.target.value)
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Çatı Tipi</Label>
                    <Select
                      value={greenhouseConfig.roofType}
                      onValueChange={(value: any) => setGreenhouseConfig({
                        ...greenhouseConfig,
                        roofType: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GABLE">Beşik Çatı</SelectItem>
                        <SelectItem value="ARCH">Yay Çatı</SelectItem>
                        <SelectItem value="LEAN_TO">Tek Eğimli</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Kaplama Malzemesi</Label>
                    <Select
                      value={greenhouseConfig.coveringMaterial}
                      onValueChange={(value: any) => setGreenhouseConfig({
                        ...greenhouseConfig,
                        coveringMaterial: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GLASS">Cam</SelectItem>
                        <SelectItem value="POLYCARBONATE">Polikarbon</SelectItem>
                        <SelectItem value="POLYETHYLENE">Polietilen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Enerji Tüketimi: {greenhouseConfig.energyConsumption} kWh/m²/yıl</Label>
                    <Slider
                      value={[greenhouseConfig.energyConsumption]}
                      onValueChange={([value]) => setGreenhouseConfig({
                        ...greenhouseConfig,
                        energyConsumption: value
                      })}
                      max={300}
                      min={50}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                  <h4 className="font-medium">Sistem Analizi</h4>
                  {(() => {
                    const results = calculateGreenhouseSolar()
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-green-50 rounded-lg text-center">
                            <div className="text-xl font-bold text-green-700">{results.solarCapacity.toFixed(1)}kW</div>
                            <div className="text-sm text-green-600">Solar Kapasite</div>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg text-center">
                            <div className="text-xl font-bold text-blue-700">{results.floorArea}m²</div>
                            <div className="text-sm text-blue-600">Sera Alanı</div>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h5 className="font-medium mb-2">Enerji Bilançosu</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Yıllık Tüketim:</span>
                              <span className="font-medium">{(results.annualConsumption / 1000).toFixed(1)} MWh</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Solar Üretim:</span>
                              <span className="font-medium text-green-600">{(results.annualProduction / 1000).toFixed(1)} MWh</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Öz Tüketim:</span>
                              <span className="font-medium">%{results.selfConsumption.toFixed(0)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <h5 className="font-medium mb-2">Ekonomik Analiz</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Sistem Maliyeti:</span>
                              <span className="font-medium">₺{(results.systemCost / 1000).toFixed(0)}K</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Yıllık Tasarruf:</span>
                              <span className="font-medium text-green-600">₺{results.annualSavings.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Geri Ödeme:</span>
                              <span className="font-medium">{results.paybackPeriod.toFixed(1)} yıl</span>
                            </div>
                            <div className="flex justify-between">
                              <span>ROI:</span>
                              <span className="font-medium text-blue-600">%{results.roi.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Livestock Solar Calculator */}
      {activeCalculator === 'livestock' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cow className="w-5 h-5 mr-2" />
                Ahır Çatısı Solar Sistem Hesaplayıcı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Configuration */}
                <div className="space-y-4">
                  <h4 className="font-medium">Hayvancılık Bilgileri</h4>
                  
                  <div>
                    <Label>Hayvan Türü</Label>
                    <Select
                      value={livestockConfig.animalType}
                      onValueChange={(value: any) => setLivestockConfig({
                        ...livestockConfig,
                        animalType: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CATTLE">Sığır</SelectItem>
                        <SelectItem value="SHEEP">Koyun</SelectItem>
                        <SelectItem value="GOAT">Keçi</SelectItem>
                        <SelectItem value="POULTRY">Tavukçuluk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Hayvan Sayısı</Label>
                      <Input
                        type="number"
                        value={livestockConfig.animalCount}
                        onChange={(e) => setLivestockConfig({
                          ...livestockConfig,
                          animalCount: Number(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <Label>Su Tüketimi (L/hayvan/gün)</Label>
                      <Input
                        type="number"
                        value={livestockConfig.dailyWaterConsumption}
                        onChange={(e) => setLivestockConfig({
                          ...livestockConfig,
                          dailyWaterConsumption: Number(e.target.value)
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Ahır Uzunluk (m)</Label>
                      <Input
                        type="number"
                        value={livestockConfig.barnLength}
                        onChange={(e) => setLivestockConfig({
                          ...livestockConfig,
                          barnLength: Number(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <Label>Ahır Genişlik (m)</Label>
                      <Input
                        type="number"
                        value={livestockConfig.barnWidth}
                        onChange={(e) => setLivestockConfig({
                          ...livestockConfig,
                          barnWidth: Number(e.target.value)
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Havalandırma Gücü: {livestockConfig.ventilationPower} kW</Label>
                    <Slider
                      value={[livestockConfig.ventilationPower]}
                      onValueChange={([value]) => setLivestockConfig({
                        ...livestockConfig,
                        ventilationPower: value
                      })}
                      max={15}
                      min={1}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                  <h4 className="font-medium">Sistem Analizi</h4>
                  {(() => {
                    const results = calculateLivestockSolar()
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-blue-50 rounded-lg text-center">
                            <div className="text-xl font-bold text-blue-700">{results.solarCapacity.toFixed(1)}kW</div>
                            <div className="text-sm text-blue-600">Solar Kapasite</div>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg text-center">
                            <div className="text-xl font-bold text-green-700">{results.barnArea}m²</div>
                            <div className="text-sm text-green-600">Ahır Alanı</div>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h5 className="font-medium mb-2">Enerji Analizi</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Yıllık Tüketim:</span>
                              <span className="font-medium">{(results.annualConsumption / 1000).toFixed(1)} MWh</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Solar Üretim:</span>
                              <span className="font-medium text-green-600">{(results.annualProduction / 1000).toFixed(1)} MWh</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Karbon Tasarrufu:</span>
                              <span className="font-medium text-green-600">{results.carbonOffset.toFixed(1)} ton CO₂/yıl</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <h5 className="font-medium mb-2">Maliyet Analizi</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Sistem Maliyeti:</span>
                              <span className="font-medium">₺{(results.systemCost / 1000).toFixed(0)}K</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Yıllık Tasarruf:</span>
                              <span className="font-medium text-green-600">₺{results.annualSavings.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Geri Ödeme:</span>
                              <span className="font-medium">{results.paybackPeriod.toFixed(1)} yıl</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Irrigation Solar Calculator */}
      {activeCalculator === 'irrigation' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Droplets className="w-5 h-5 mr-2" />
                Solar Sulama Sistemi Hesaplayıcı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Configuration */}
                <div className="space-y-4">
                  <h4 className="font-medium">Sulama Sistemi</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Sulanan Alan (ha)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={irrigationConfig.irrigatedArea}
                        onChange={(e) => setIrrigationConfig({
                          ...irrigationConfig,
                          irrigatedArea: Number(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <Label>Pompa Gücü (kW)</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={irrigationConfig.pumpPower}
                        onChange={(e) => setIrrigationConfig({
                          ...irrigationConfig,
                          pumpPower: Number(e.target.value)
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Su Kaynağı</Label>
                    <Select
                      value={irrigationConfig.waterSource}
                      onValueChange={(value: any) => setIrrigationConfig({
                        ...irrigationConfig,
                        waterSource: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WELL">Kuyu</SelectItem>
                        <SelectItem value="SURFACE">Yüzey Suyu</SelectItem>
                        <SelectItem value="MUNICIPALITY">Belediye Şebekesi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {irrigationConfig.waterSource === 'WELL' && (
                    <div>
                      <Label>Kuyu Derinliği: {irrigationConfig.pumpDepth} m</Label>
                      <Slider
                        value={[irrigationConfig.pumpDepth]}
                        onValueChange={([value]) => setIrrigationConfig({
                          ...irrigationConfig,
                          pumpDepth: value
                        })}
                        max={200}
                        min={10}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Günlük Çalışma: {irrigationConfig.pumpingHours} saat</Label>
                    <Slider
                      value={[irrigationConfig.pumpingHours]}
                      onValueChange={([value]) => setIrrigationConfig({
                        ...irrigationConfig,
                        pumpingHours: value
                      })}
                      max={12}
                      min={2}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                  <h4 className="font-medium">Sistem Analizi</h4>
                  {(() => {
                    const results = calculateIrrigationSolar()
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-cyan-50 rounded-lg text-center">
                            <div className="text-xl font-bold text-cyan-700">{results.solarArraySize.toFixed(1)}kW</div>
                            <div className="text-sm text-cyan-600">Solar Boyutu</div>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg text-center">
                            <div className="text-xl font-bold text-blue-700">{results.waterRequirement.toFixed(0)}m³</div>
                            <div className="text-sm text-blue-600">Su İhtiyacı/Yıl</div>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h5 className="font-medium mb-2">Su Yönetimi</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Sulanan Alan:</span>
                              <span className="font-medium">{results.irrigatedArea} ha</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sistem Verimi:</span>
                              <span className="font-medium text-green-600">%{results.waterEfficiency.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Mevcut Tüketim:</span>
                              <span className="font-medium">{(results.currentConsumption / 1000).toFixed(1)} MWh/yıl</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <h5 className="font-medium mb-2">Ekonomik Değerlendirme</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Sistem Maliyeti:</span>
                              <span className="font-medium">₺{(results.systemCost / 1000).toFixed(0)}K</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Yıllık Tasarruf:</span>
                              <span className="font-medium text-green-600">₺{results.annualSavings.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Geri Ödeme:</span>
                              <span className="font-medium">{results.paybackPeriod.toFixed(1)} yıl</span>
                            </div>
                            <div className="flex justify-between">
                              <span>ROI:</span>
                              <span className="font-medium text-blue-600">%{results.roi.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Storage Calculator */}
      {activeCalculator === 'storage' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Depolama Tesisi + Solar Sistemi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Depolama Sistemi Hesaplayıcısı</h3>
              <p className="text-gray-600 mb-4">
                Soğuk hava deposu, tahıl deposu ve diğer tarımsal depolama tesisleri için solar çözümler
              </p>
              <Badge variant="outline">Yakında</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button size="lg" className="bg-green-600 hover:bg-green-700">
          <BarChart3 className="w-4 h-4 mr-2" />
          Karşılaştırmalı Rapor İndir
        </Button>
        <Button size="lg" variant="outline">
          <Calculator className="w-4 h-4 mr-2" />
          Tüm Hesaplamaları Kaydet
        </Button>
      </div>
    </div>
  )
}