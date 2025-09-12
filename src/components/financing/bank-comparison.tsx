'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building,
  Percent,
  Calendar,
  CreditCard,
  CheckCircle,
  X,
  Star,
  TrendingUp,
  Users,
  Shield,
  Clock
} from 'lucide-react'
import type { BankLoan, FinancingScenario } from '@/app/dashboard/financing/page'

interface BankComparisonProps {
  banks: BankLoan[]
  selectedProject: {
    systemSize: number
    totalCost: number
    customerType: 'INDIVIDUAL' | 'SME' | 'FARMER' | 'CORPORATE'
  }
  scenarios: FinancingScenario[]
}

export function BankComparison({ banks, selectedProject, scenarios }: BankComparisonProps) {
  const [selectedBank, setSelectedBank] = useState<string | null>(null)

  const getLoanTypeLabel = (type: BankLoan['loanType']) => {
    switch (type) {
      case 'CONSUMER': return 'Tüketici Kredisi'
      case 'VEHICLE': return 'Taşıt Kredisi'
      case 'BUSINESS': return 'İşletme Kredisi'
      case 'AGRICULTURAL': return 'Tarımsal Kredi'
      case 'LEASING': return 'Finansal Kiralama'
      default: return 'Kredi'
    }
  }

  const getLoanTypeColor = (type: BankLoan['loanType']) => {
    switch (type) {
      case 'CONSUMER': return 'bg-blue-100 text-blue-800'
      case 'VEHICLE': return 'bg-green-100 text-green-800'
      case 'BUSINESS': return 'bg-purple-100 text-purple-800'
      case 'AGRICULTURAL': return 'bg-yellow-100 text-yellow-800'
      case 'LEASING': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEligibilityScore = (bank: BankLoan) => {
    // Mock eligibility calculation based on customer type
    let score = 0
    
    if (selectedProject.customerType === 'FARMER' && bank.loanType === 'AGRICULTURAL') {
      score = 95
    } else if (selectedProject.customerType === 'INDIVIDUAL' && bank.loanType === 'CONSUMER') {
      score = 85
    } else if ((selectedProject.customerType === 'SME' || selectedProject.customerType === 'CORPORATE') && 
               (bank.loanType === 'BUSINESS' || bank.loanType === 'LEASING')) {
      score = 90
    } else {
      score = 60
    }
    
    return score
  }

  const getScenarioForBank = (bankName: string) => {
    return scenarios.find(s => s.bankName === bankName)
  }

  const sortedBanks = banks.sort((a, b) => {
    const scoreA = getEligibilityScore(a)
    const scoreB = getEligibilityScore(b)
    return scoreB - scoreA
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Banka Karşılaştırması</h2>
        <p className="text-gray-600">
          {selectedProject.systemSize}kW sistem için en uygun finansman seçeneklerini karşılaştırın
        </p>
      </div>

      {/* Bank Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {sortedBanks.map((bank, index) => {
          const eligibilityScore = getEligibilityScore(bank)
          const scenario = getScenarioForBank(bank.bankName)
          const isRecommended = index === 0
          
          return (
            <Card 
              key={bank.bankName} 
              className={`hover:shadow-lg transition-all duration-300 ${
                selectedBank === bank.bankName ? 'ring-2 ring-primary' : ''
              } ${isRecommended ? 'border-primary' : ''}`}
            >
              <CardHeader className="relative">
                {isRecommended && (
                  <Badge className="absolute -top-2 -right-2 bg-primary text-white">
                    <Star className="w-3 h-3 mr-1" />
                    ÖNERİLEN
                  </Badge>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{bank.bankName}</h3>
                      <Badge className={getLoanTypeColor(bank.loanType)}>
                        {getLoanTypeLabel(bank.loanType)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">%{bank.interestRate}</div>
                    <div className="text-sm text-gray-600">Faiz Oranı</div>
                  </div>
                </div>

                {/* Eligibility Score */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Uygunluk Skoru</span>
                    <span className="font-medium">{eligibilityScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        eligibilityScore >= 80 ? 'bg-green-500' :
                        eligibilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${eligibilityScore}%` }}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Key Terms */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Max Tutar</span>
                    </div>
                    <div className="font-bold">₺{(bank.maxAmount / 1000)}K</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Max Vade</span>
                    </div>
                    <div className="font-bold">{bank.maxTerm} ay</div>
                  </div>
                </div>

                {/* Scenario Results */}
                {scenario && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="font-medium text-blue-900 mb-2">Bu Proje İçin:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-blue-700">Aylık Ödeme:</span>
                        <div className="font-bold text-blue-900">₺{scenario.monthlyPayment.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-blue-700">Net Nakit Akışı:</span>
                        <div className={`font-bold ${scenario.netMonthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₺{scenario.netMonthlyCashFlow.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Features */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Avantajlar:</h4>
                  <div className="space-y-1">
                    {bank.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Gereksinimler:</h4>
                  <div className="space-y-1">
                    {bank.requirements.slice(0, 2).map((requirement, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mr-2 flex-shrink-0" />
                        {requirement}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Details */}
                <div className="border-t pt-3 text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Dosya Masrafı:</span>
                    <span>₺{bank.processingFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sigorta Oranı:</span>
                    <span>%{bank.insuranceRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min. Gelir:</span>
                    <span>₺{bank.eligibility.minIncome.toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1"
                    variant={selectedBank === bank.bankName ? "default" : "outline"}
                    onClick={() => setSelectedBank(selectedBank === bank.bankName ? null : bank.bankName)}
                  >
                    {selectedBank === bank.bankName ? 'Seçildi' : 'Seç'}
                  </Button>
                  <Button variant="outline" size="sm">
                    Detay
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detaylı Karşılaştırma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Banka</th>
                  <th className="text-center p-3">Faiz Oranı</th>
                  <th className="text-center p-3">Max Tutar</th>
                  <th className="text-center p-3">Max Vade</th>
                  <th className="text-center p-3">Aylık Ödeme</th>
                  <th className="text-center p-3">Toplam Maliyet</th>
                  <th className="text-center p-3">Uygunluk</th>
                  <th className="text-center p-3">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {sortedBanks.map((bank, index) => {
                  const scenario = getScenarioForBank(bank.bankName)
                  const eligibilityScore = getEligibilityScore(bank)
                  
                  return (
                    <tr key={bank.bankName} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <Building className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium">{bank.bankName}</div>
                            <div className="text-xs text-gray-500">{getLoanTypeLabel(bank.loanType)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <span className="font-bold text-primary">%{bank.interestRate}</span>
                      </td>
                      <td className="text-center p-3">₺{(bank.maxAmount / 1000)}K</td>
                      <td className="text-center p-3">{bank.maxTerm} ay</td>
                      <td className="text-center p-3">
                        {scenario ? `₺${scenario.monthlyPayment.toLocaleString()}` : '-'}
                      </td>
                      <td className="text-center p-3">
                        {scenario ? `₺${scenario.totalPayment.toLocaleString()}` : '-'}
                      </td>
                      <td className="text-center p-3">
                        <div className="flex items-center justify-center">
                          <div className={`w-2 h-2 rounded-full mr-1 ${
                            eligibilityScore >= 80 ? 'bg-green-500' :
                            eligibilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span>{eligibilityScore}%</span>
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <Button size="sm" variant="outline">
                          Başvur
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Box */}
      {selectedBank && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-primary">Önerilen Seçim</h3>
            </div>
            <p className="text-gray-700 mb-4">
              <strong>{selectedBank}</strong> bankanız için en uygun seçenek olarak önerilmektedir. 
              Bu bankanın {getLoanTypeLabel(banks.find(b => b.bankName === selectedBank)?.loanType || 'CONSUMER')} 
              ürünü projeniz için ideal koşullar sunmaktadır.
            </p>
            <div className="flex space-x-3">
              <Button>
                <CreditCard className="w-4 h-4 mr-2" />
                {selectedBank} - Başvuru Yap
              </Button>
              <Button variant="outline">
                Detaylı Bilgi Al
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}