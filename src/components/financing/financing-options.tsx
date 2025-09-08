'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Calculator, 
  PieChart, 
  DollarSign,
  Calendar,
  Award,
  CheckCircle,
  AlertCircle,
  Banknote,
  Target,
  BarChart3,
  Zap
} from 'lucide-react'
import type { BankLoan, FinancingScenario, GovernmentIncentive } from '@/app/dashboard/financing/page'

interface FinancingOptionsProps {
  scenarios: FinancingScenario[]
  banks: BankLoan[]
  incentives: GovernmentIncentive[]
  selectedProject: {
    systemSize: number
    totalCost: number
    customerType: 'INDIVIDUAL' | 'SME' | 'FARMER' | 'CORPORATE'
    location: string
  }
}

export function FinancingOptions({ scenarios, banks, incentives, selectedProject }: FinancingOptionsProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [comparisonView, setComparisonView] = useState<'summary' | 'detailed'>('summary')

  const getFinancingRecommendation = () => {
    const sortedScenarios = scenarios
      .filter(s => s.isEligible)
      .sort((a, b) => b.netPresentValue - a.netPresentValue)
    return sortedScenarios[0]
  }

  const calculatePaybackPeriod = (scenario: FinancingScenario) => {
    if (scenario.netMonthlyCashFlow <= 0) return 'N/A'
    const totalInvestment = selectedProject.totalCost - (scenario.downPayment || 0)
    return Math.ceil(totalInvestment / (scenario.netMonthlyCashFlow * 12)) + ' yıl'
  }

  const getROICategory = (roi: number) => {
    if (roi >= 15) return { label: 'Mükemmel', color: 'bg-green-500', textColor: 'text-green-700' }
    if (roi >= 10) return { label: 'Çok İyi', color: 'bg-blue-500', textColor: 'text-blue-700' }
    if (roi >= 5) return { label: 'İyi', color: 'bg-yellow-500', textColor: 'text-yellow-700' }
    return { label: 'Zayıf', color: 'bg-red-500', textColor: 'text-red-700' }
  }

  const eligibleScenarios = scenarios.filter(s => s.isEligible)
  const recommendedScenario = getFinancingRecommendation()

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Finansman Seçenekleri Analizi</h2>
            <p className="opacity-90">
              {selectedProject.systemSize}kW sistem için {eligibleScenarios.length} uygun finansman seçeneği bulundu
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">₺{selectedProject.totalCost.toLocaleString()}</div>
            <div className="opacity-90">Toplam Proje Maliyeti</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">%{((eligibleScenarios.reduce((acc, s) => acc + s.roi, 0) / eligibleScenarios.length) || 0).toFixed(1)}</div>
            <div className="text-sm opacity-90">Ortalama ROI</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">₺{Math.round((eligibleScenarios.reduce((acc, s) => acc + s.netMonthlyCashFlow, 0) / eligibleScenarios.length) || 0).toLocaleString()}</div>
            <div className="text-sm opacity-90">Ortalama Net Kazanç</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">{eligibleScenarios.length}</div>
            <div className="text-sm opacity-90">Uygun Seçenek</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">%{((eligibleScenarios.reduce((acc, s) => acc + s.effectiveInterestRate, 0) / eligibleScenarios.length) || 0).toFixed(1)}</div>
            <div className="text-sm opacity-90">Ortalama Faiz</div>
          </div>
        </div>
      </div>

      {/* Recommended Option */}
      {recommendedScenario && (
        <Card className="border-primary shadow-lg">
          <CardHeader className="bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Award className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-primary">Önerilen Finansman</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">En yüksek net değer sağlayan seçenek</p>
                </div>
              </div>
              <Badge className="bg-primary text-white">
                ÖNERİLEN
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">{recommendedScenario.bankName}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Faiz Oranı:</span>
                    <span className="font-medium">%{recommendedScenario.effectiveInterestRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vade:</span>
                    <span className="font-medium">{recommendedScenario.term} ay</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kredi Tutarı:</span>
                    <span className="font-medium">₺{recommendedScenario.loanAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Aylık Ödemeler</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Kredi Taksiti:</span>
                    <span className="font-medium">₺{recommendedScenario.monthlyPayment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Kazanç:</span>
                    <span className={`font-medium ${recommendedScenario.netMonthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₺{recommendedScenario.netMonthlyCashFlow.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Toplam Net Akış:</span>
                    <span className="font-bold text-primary">
                      ₺{(recommendedScenario.netMonthlyCashFlow * recommendedScenario.term).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Yatırım Analizi</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>ROI:</span>
                    <span className={`font-medium ${getROICategory(recommendedScenario.roi).textColor}`}>
                      %{recommendedScenario.roi.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>NPV:</span>
                    <span className="font-medium text-green-600">₺{recommendedScenario.netPresentValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Geri Ödeme:</span>
                    <span className="font-medium">{calculatePaybackPeriod(recommendedScenario)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6 pt-4 border-t">
              <Button className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Bu Seçeneği Seç
              </Button>
              <Button variant="outline">
                <Calculator className="w-4 h-4 mr-2" />
                Detaylı Analiz
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison View Toggle */}
      <div className="flex justify-center">
        <Tabs value={comparisonView} onValueChange={(v) => setComparisonView(v as 'summary' | 'detailed')}>
          <TabsList>
            <TabsTrigger value="summary">Özet Karşılaştırma</TabsTrigger>
            <TabsTrigger value="detailed">Detaylı Analiz</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Scenarios Comparison */}
      <Tabs value={comparisonView}>
        <TabsContent value="summary">
          <div className="grid gap-4">
            {eligibleScenarios.map((scenario, index) => {
              const roiCategory = getROICategory(scenario.roi)
              const isRecommended = scenario === recommendedScenario
              
              return (
                <Card 
                  key={`${scenario.bankName}-${scenario.loanType}`}
                  className={`hover:shadow-md transition-all ${
                    selectedScenario === `${scenario.bankName}-${scenario.loanType}` ? 'ring-2 ring-primary' : ''
                  } ${isRecommended ? 'border-primary/50' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Banknote className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{scenario.bankName}</h3>
                          <p className="text-sm text-gray-600">{scenario.loanType}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold">%{scenario.effectiveInterestRate}</div>
                        <div className="text-sm text-gray-600">Faiz Oranı</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-bold">₺{scenario.monthlyPayment.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Aylık Taksit</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className={`font-bold ${scenario.netMonthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₺{scenario.netMonthlyCashFlow.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Net Kazanç</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className={`font-bold ${roiCategory.textColor}`}>%{scenario.roi.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">ROI</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-bold">₺{scenario.netPresentValue.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">NPV</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${roiCategory.color}`} />
                        <span className="text-sm font-medium">{roiCategory.label}</span>
                        {isRecommended && (
                          <Badge className="bg-primary text-white text-xs">ÖNERİLEN</Badge>
                        )}
                      </div>
                      
                      <Button 
                        size="sm"
                        variant={selectedScenario === `${scenario.bankName}-${scenario.loanType}` ? "default" : "outline"}
                        onClick={() => setSelectedScenario(
                          selectedScenario === `${scenario.bankName}-${scenario.loanType}` 
                            ? null 
                            : `${scenario.bankName}-${scenario.loanType}`
                        )}
                      >
                        {selectedScenario === `${scenario.bankName}-${scenario.loanType}` ? 'Seçildi' : 'Karşılaştır'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <CardTitle>Detaylı Finansal Analiz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Banka/Ürün</th>
                      <th className="text-center p-3">Faiz</th>
                      <th className="text-center p-3">Vade</th>
                      <th className="text-center p-3">Kredi Tutarı</th>
                      <th className="text-center p-3">Aylık Taksit</th>
                      <th className="text-center p-3">Net Kazanç</th>
                      <th className="text-center p-3">ROI</th>
                      <th className="text-center p-3">NPV</th>
                      <th className="text-center p-3">Geri Ödeme</th>
                      <th className="text-center p-3">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibleScenarios.map((scenario, index) => {
                      const roiCategory = getROICategory(scenario.roi)
                      const isRecommended = scenario === recommendedScenario
                      
                      return (
                        <tr key={`${scenario.bankName}-${scenario.loanType}`} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{scenario.bankName}</div>
                              <div className="text-xs text-gray-500">{scenario.loanType}</div>
                            </div>
                          </td>
                          <td className="text-center p-3 font-medium">%{scenario.effectiveInterestRate}</td>
                          <td className="text-center p-3">{scenario.term} ay</td>
                          <td className="text-center p-3">₺{(scenario.loanAmount / 1000).toFixed(0)}K</td>
                          <td className="text-center p-3">₺{scenario.monthlyPayment.toLocaleString()}</td>
                          <td className={`text-center p-3 font-medium ${scenario.netMonthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₺{scenario.netMonthlyCashFlow.toLocaleString()}
                          </td>
                          <td className={`text-center p-3 font-medium ${roiCategory.textColor}`}>
                            %{scenario.roi.toFixed(1)}
                          </td>
                          <td className="text-center p-3 text-green-600 font-medium">
                            ₺{(scenario.netPresentValue / 1000).toFixed(0)}K
                          </td>
                          <td className="text-center p-3">{calculatePaybackPeriod(scenario)}</td>
                          <td className="text-center p-3">
                            <div className="flex items-center justify-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${roiCategory.color}`} />
                              {isRecommended && (
                                <Badge className="bg-primary text-white text-xs">ÖNERİLEN</Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button size="lg">
          <Target className="w-4 h-4 mr-2" />
          Seçimi Onayla
        </Button>
        <Button size="lg" variant="outline">
          <BarChart3 className="w-4 h-4 mr-2" />
          Rapor İndir
        </Button>
        <Button size="lg" variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Danışman Randevusu
        </Button>
      </div>
    </div>
  )
}