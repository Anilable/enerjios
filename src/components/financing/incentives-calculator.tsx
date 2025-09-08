'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Gift,
  Calculator,
  Zap,
  Building,
  Users,
  MapPin,
  Calendar,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Percent
} from 'lucide-react'
import type { GovernmentIncentive } from '@/app/dashboard/financing/page'

interface IncentivesCalculatorProps {
  incentives: GovernmentIncentive[]
  selectedProject: {
    systemSize: number
    totalCost: number
    location: string
    customerType: 'INDIVIDUAL' | 'SME' | 'FARMER' | 'CORPORATE'
  }
}

interface IncentiveCalculation {
  incentive: GovernmentIncentive
  isEligible: boolean
  calculatedValue: number
  reason?: string
}

export function IncentivesCalculator({ incentives, selectedProject }: IncentivesCalculatorProps) {
  const [yekdemParams, setYekdemParams] = useState({
    systemSize: selectedProject.systemSize,
    licenseType: 'UNLICENSED' as 'LICENSED' | 'UNLICENSED',
    contractDuration: 10,
    gridConnection: true
  })

  const [eligibilityResults, setEligibilityResults] = useState<IncentiveCalculation[]>([])
  const [totalIncentiveValue, setTotalIncentiveValue] = useState(0)

  // YEKDEM rates (USD/kWh)
  const yekdemRates = {
    LICENSED: 0.058,
    UNLICENSED: 0.048
  }

  // Regional multipliers for different cities
  const regionalMultipliers = {
    'İstanbul': 1.0,
    'Ankara': 1.1,
    'İzmir': 1.0,
    'Antalya': 1.2,
    'Bursa': 1.0,
    'Konya': 1.3,
    'Gaziantep': 1.4
  }

  const usdToTry = 32.50 // Mock exchange rate

  useEffect(() => {
    calculateIncentives()
  }, [selectedProject, yekdemParams])

  const calculateIncentives = () => {
    const results: IncentiveCalculation[] = []
    let totalValue = 0

    incentives.forEach(incentive => {
      const calculation = calculateSingleIncentive(incentive)
      results.push(calculation)
      if (calculation.isEligible) {
        totalValue += calculation.calculatedValue
      }
    })

    // Add YEKDEM calculation
    const yekdemValue = calculateYekdemValue()
    if (yekdemValue > 0) {
      results.push({
        incentive: {
          id: 'yekdem_custom',
          name: 'YEKDEM Feed-in Tariff',
          type: 'TARIFF',
          authority: 'EPDK',
          description: 'Fazla elektrik satış garantisi',
          amount: yekdemValue,
          conditions: ['Şebekeye bağlı sistem', 'Elektrik üretim lisansı'],
          validUntil: new Date('2025-12-31'),
          targetGroup: 'ALL'
        },
        isEligible: yekdemParams.gridConnection,
        calculatedValue: yekdemValue,
        reason: yekdemParams.gridConnection ? undefined : 'Şebekeye bağlı sistem gerekli'
      })
      if (yekdemParams.gridConnection) {
        totalValue += yekdemValue
      }
    }

    setEligibilityResults(results)
    setTotalIncentiveValue(totalValue)
  }

  const calculateSingleIncentive = (incentive: GovernmentIncentive): IncentiveCalculation => {
    let isEligible = true
    let calculatedValue = 0
    let reason = ''

    // Check target group eligibility
    if (incentive.targetGroup !== 'ALL' && incentive.targetGroup !== selectedProject.customerType) {
      return {
        incentive,
        isEligible: false,
        calculatedValue: 0,
        reason: 'Müşteri tipi uygun değil'
      }
    }

    // Check regional eligibility
    if (incentive.eligibleRegions && !incentive.eligibleRegions.includes(selectedProject.location)) {
      return {
        incentive,
        isEligible: false,
        calculatedValue: 0,
        reason: 'Bölge kapsamında değil'
      }
    }

    // Check validity date
    if (new Date() > incentive.validUntil) {
      return {
        incentive,
        isEligible: false,
        calculatedValue: 0,
        reason: 'Başvuru süresi doldu'
      }
    }

    // Calculate value based on incentive type
    switch (incentive.type) {
      case 'TAX_EXEMPTION':
        if (incentive.percentage) {
          calculatedValue = selectedProject.totalCost * (incentive.percentage / 100)
        }
        break
      
      case 'SUBSIDY':
      case 'AGRICULTURAL':
        if (incentive.percentage) {
          const percentageValue = selectedProject.totalCost * (incentive.percentage / 100)
          calculatedValue = Math.min(percentageValue, incentive.amount || Infinity)
        } else {
          calculatedValue = incentive.amount || 0
        }
        break
      
      case 'REGIONAL_SUPPORT':
        if (incentive.percentage) {
          const percentageValue = selectedProject.totalCost * (incentive.percentage / 100)
          calculatedValue = Math.min(percentageValue, incentive.amount || Infinity)
          
          // Apply regional multiplier
          const multiplier = regionalMultipliers[selectedProject.location as keyof typeof regionalMultipliers] || 1.0
          calculatedValue *= multiplier
        }
        break
      
      default:
        calculatedValue = incentive.amount || 0
    }

    return {
      incentive,
      isEligible,
      calculatedValue: Math.round(calculatedValue),
      reason: isEligible ? undefined : reason
    }
  }

  const calculateYekdemValue = () => {
    if (!yekdemParams.gridConnection) return 0
    
    // Calculate annual surplus energy (assume 30% surplus)
    const annualProduction = selectedProject.systemSize * 1300 // kWh/year
    const surplusEnergy = annualProduction * 0.3 // 30% surplus
    
    const rate = yekdemRates[yekdemParams.licenseType]
    const annualRevenueUsd = surplusEnergy * rate
    const annualRevenueTry = annualRevenueUsd * usdToTry
    
    // Calculate total value over contract duration
    return Math.round(annualRevenueTry * yekdemParams.contractDuration)
  }

  const getIncentiveIcon = (type: string) => {
    switch (type) {
      case 'TAX_EXEMPTION': return Percent
      case 'SUBSIDY': return Gift
      case 'TARIFF': return Zap
      case 'REGIONAL_SUPPORT': return MapPin
      case 'AGRICULTURAL': return Building
      default: return Gift
    }
  }

  const getIncentiveColor = (type: string) => {
    switch (type) {
      case 'TAX_EXEMPTION': return 'text-red-600 bg-red-50'
      case 'SUBSIDY': return 'text-green-600 bg-green-50'
      case 'TARIFF': return 'text-yellow-600 bg-yellow-50'
      case 'REGIONAL_SUPPORT': return 'text-blue-600 bg-blue-50'
      case 'AGRICULTURAL': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getAuthorityBadgeColor = (authority: string) => {
    switch (authority) {
      case 'EPDK': return 'bg-blue-100 text-blue-800'
      case 'Maliye Bakanlığı': return 'bg-red-100 text-red-800'
      case 'KOSGEB': return 'bg-green-100 text-green-800'
      case 'TKDK': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const eligibleIncentives = eligibilityResults.filter(r => r.isEligible)
  const ineligibleIncentives = eligibilityResults.filter(r => !r.isEligible)

  return (
    <div className="space-y-6">
      {/* Header with Total Value */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Teşvik Hesaplayıcısı</h2>
              <p className="text-gray-600">
                {selectedProject.systemSize}kW sistem için uygun teşvikleri keşfedin
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                ₺{totalIncentiveValue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Toplam Teşvik Değeri</div>
              <div className="text-xs text-gray-500">
                %{Math.round((totalIncentiveValue / selectedProject.totalCost) * 100)} tasarruf
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="eligible" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="eligible">
            Uygun Teşvikler ({eligibleIncentives.length})
          </TabsTrigger>
          <TabsTrigger value="yekdem">
            YEKDEM Hesaplayıcısı
          </TabsTrigger>
          <TabsTrigger value="all">
            Tüm Teşvikler ({eligibilityResults.length})
          </TabsTrigger>
        </TabsList>

        {/* Eligible Incentives */}
        <TabsContent value="eligible" className="space-y-4">
          {eligibleIncentives.length > 0 ? (
            <div className="grid gap-4">
              {eligibleIncentives.map((result) => {
                const Icon = getIncentiveIcon(result.incentive.type)
                return (
                  <Card key={result.incentive.id} className="border-green-200 bg-green-50/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getIncentiveColor(result.incentive.type)}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{result.incentive.name}</h3>
                            <Badge className={getAuthorityBadgeColor(result.incentive.authority)}>
                              {result.incentive.authority}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            ₺{result.calculatedValue.toLocaleString()}
                          </div>
                          <div className="flex items-center text-sm text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Uygun
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-gray-700 mb-3">{result.incentive.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-gray-900 mb-2">Koşullar:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {result.incentive.conditions.map((condition, idx) => (
                              <li key={idx} className="flex items-start">
                                <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                                {condition}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm text-gray-900 mb-2">Detaylar:</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex justify-between">
                              <span>Son Başvuru:</span>
                              <span>{result.incentive.validUntil.toLocaleDateString('tr-TR')}</span>
                            </div>
                            {result.incentive.percentage && (
                              <div className="flex justify-between">
                                <span>Destek Oranı:</span>
                                <span>%{result.incentive.percentage}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Hedef Grup:</span>
                              <span>
                                {result.incentive.targetGroup === 'ALL' ? 'Hepsi' :
                                 result.incentive.targetGroup === 'SME' ? 'KOBİ' :
                                 result.incentive.targetGroup === 'FARMER' ? 'Çiftçi' :
                                 result.incentive.targetGroup}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <Button size="sm">
                          <FileText className="w-3 h-3 mr-2" />
                          Başvuru Detayları
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Uygun Teşvik Bulunamadı</h3>
                <p className="text-gray-600">
                  Mevcut proje parametreleriniz için uygun teşvik programı bulunamadı.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* YEKDEM Calculator */}
        <TabsContent value="yekdem" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                YEKDEM Tarife Hesaplayıcısı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="systemSize">Sistem Gücü (kW)</Label>
                  <Input
                    id="systemSize"
                    type="number"
                    value={yekdemParams.systemSize}
                    onChange={(e) => setYekdemParams(prev => ({ ...prev, systemSize: Number(e.target.value) }))}
                  />
                </div>
                
                <div>
                  <Label>Lisans Durumu</Label>
                  <Select 
                    value={yekdemParams.licenseType}
                    onValueChange={(value: any) => setYekdemParams(prev => ({ ...prev, licenseType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNLICENSED">Lisanssız (1MW altı)</SelectItem>
                      <SelectItem value="LICENSED">Lisanslı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contractDuration">Sözleşme Süresi (Yıl)</Label>
                  <Input
                    id="contractDuration"
                    type="number"
                    value={yekdemParams.contractDuration}
                    onChange={(e) => setYekdemParams(prev => ({ ...prev, contractDuration: Number(e.target.value) }))}
                    max={15}
                    min={5}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="gridConnection"
                    checked={yekdemParams.gridConnection}
                    onChange={(e) => setYekdemParams(prev => ({ ...prev, gridConnection: e.target.checked }))}
                  />
                  <Label htmlFor="gridConnection">Şebekeye Bağlı Sistem</Label>
                </div>
              </div>

              {/* YEKDEM Results */}
              <div className="bg-yellow-50 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-yellow-900 mb-3">YEKDEM Hesaplama Sonuçları:</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-yellow-800">Tarife Oranı</div>
                    <div className="text-xl font-bold text-yellow-900">
                      ${yekdemRates[yekdemParams.licenseType]} /kWh
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-yellow-800">Yıllık Fazla Enerji</div>
                    <div className="text-xl font-bold text-yellow-900">
                      {Math.round(yekdemParams.systemSize * 1300 * 0.3).toLocaleString()} kWh
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-yellow-800">Toplam YEKDEM Geliri</div>
                    <div className="text-xl font-bold text-yellow-900">
                      ₺{calculateYekdemValue().toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-yellow-700">
                  * Hesaplama %30 fazla enerji üretimi ve {usdToTry} TL/USD kuru baz alınarak yapılmıştır.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Incentives */}
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {eligibilityResults.map((result) => {
              const Icon = getIncentiveIcon(result.incentive.type)
              return (
                <Card 
                  key={result.incentive.id} 
                  className={result.isEligible ? 'border-green-200' : 'border-red-200'}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getIncentiveColor(result.incentive.type)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{result.incentive.name}</h4>
                          <Badge className={getAuthorityBadgeColor(result.incentive.authority)} variant="secondary">
                            {result.incentive.authority}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold ${result.isEligible ? 'text-green-600' : 'text-gray-400'}`}>
                          ₺{result.calculatedValue.toLocaleString()}
                        </div>
                        <div className="flex items-center text-sm">
                          {result.isEligible ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                              <span className="text-green-700">Uygun</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3 mr-1 text-red-600" />
                              <span className="text-red-700">Uygun Değil</span>
                            </>
                          )}
                        </div>
                        {result.reason && (
                          <div className="text-xs text-red-600 mt-1">{result.reason}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}