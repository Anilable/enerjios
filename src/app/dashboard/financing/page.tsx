'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LoanCalculator } from '@/components/financing/loan-calculator'
import { BankComparison } from '@/components/financing/bank-comparison'
import { IncentivesCalculator } from '@/components/financing/incentives-calculator'
import { FinancingOptions } from '@/components/financing/financing-options'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CreditCard,
  Calculator,
  Building,
  TrendingUp,
  Gift,
  PiggyBank,
  Banknote,
  Shield,
  FileText,
  Users,
  MapPin,
  Calendar
} from 'lucide-react'

export interface BankLoan {
  bankName: string
  bankLogo: string
  loanType: 'CONSUMER' | 'VEHICLE' | 'BUSINESS' | 'AGRICULTURAL' | 'LEASING'
  interestRate: number
  maxAmount: number
  maxTerm: number
  processingFee: number
  insuranceRate: number
  features: string[]
  requirements: string[]
  eligibility: {
    minIncome: number
    minCreditScore: number
    employmentType: string[]
  }
}

export interface GovernmentIncentive {
  id: string
  name: string
  type: 'TAX_EXEMPTION' | 'SUBSIDY' | 'TARIFF' | 'REGIONAL_SUPPORT' | 'AGRICULTURAL'
  authority: string
  description: string
  amount: number
  percentage?: number
  conditions: string[]
  validUntil: Date
  eligibleRegions?: string[]
  targetGroup: 'ALL' | 'SME' | 'FARMER' | 'INDIVIDUAL' | 'CORPORATE'
}

export interface FinancingScenario {
  id: string
  name: string
  loanAmount: number
  downPayment: number
  interestRate: number
  termMonths: number
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  bankName: string
  loanType: string
  incentiveValue: number
  netCost: number
  monthlyEnergySavings: number
  netMonthlyCashFlow: number
  paybackPeriod: number
  roi25Years: number
}

export default function FinancingPage() {
  const [activeTab, setActiveTab] = useState('calculator')
  const [selectedProject, setSelectedProject] = useState({
    systemSize: 12.5,
    totalCost: 75000,
    annualProduction: 16800,
    monthlyEnergySavings: 1240,
    location: 'İstanbul',
    customerType: 'INDIVIDUAL' as const
  })

  // Turkish Banks Data
  const [banks] = useState<BankLoan[]>([
    {
      bankName: 'İş Bankası',
      bankLogo: '/logos/isbank.png',
      loanType: 'CONSUMER',
      interestRate: 2.89,
      maxAmount: 500000,
      maxTerm: 60,
      processingFee: 890,
      insuranceRate: 0.12,
      features: [
        'Hızlı onay (24 saat)',
        'Masrafsız erken ödeme',
        'Dijital başvuru',
        'Esnek ödeme seçenekleri'
      ],
      requirements: [
        'SGK girişli çalışan',
        'En az 3 maaş bordrosu',
        'İkametgah belgesi'
      ],
      eligibility: {
        minIncome: 8000,
        minCreditScore: 650,
        employmentType: ['Çalışan', 'Memur', 'Serbest Meslek']
      }
    },
    {
      bankName: 'Garanti BBVA',
      bankLogo: '/logos/garanti.png',
      loanType: 'CONSUMER',
      interestRate: 2.95,
      maxAmount: 400000,
      maxTerm: 48,
      processingFee: 750,
      insuranceRate: 0.15,
      features: [
        'Online başvuru',
        '7/24 müşteri hizmetleri',
        'Bonus puanlarla indirim',
        'Tatil dönemleri ödemesiz'
      ],
      requirements: [
        'En az 6 ay SGK',
        'Maaş hesabı',
        'Gelir belgesi'
      ],
      eligibility: {
        minIncome: 7500,
        minCreditScore: 600,
        employmentType: ['Çalışan', 'Memur']
      }
    },
    {
      bankName: 'Ziraat Bankası',
      bankLogo: '/logos/ziraat.png',
      loanType: 'AGRICULTURAL',
      interestRate: 1.95,
      maxAmount: 1000000,
      maxTerm: 72,
      processingFee: 500,
      insuranceRate: 0.08,
      features: [
        'Çiftçiye özel faiz',
        'Mevsimsel ödeme',
        'Devlet destekli',
        'Tarımsal sigorta dahil'
      ],
      requirements: [
        'Çiftçi kayıt sistemi',
        'Tarımsal faaliyet belgesi',
        'Arazi tapusu'
      ],
      eligibility: {
        minIncome: 5000,
        minCreditScore: 500,
        employmentType: ['Çiftçi']
      }
    },
    {
      bankName: 'Yapı Kredi',
      bankLogo: '/logos/yapikredi.png',
      loanType: 'LEASING',
      interestRate: 2.45,
      maxAmount: 2000000,
      maxTerm: 60,
      processingFee: 1200,
      insuranceRate: 0.10,
      features: [
        'Leasing avantajı',
        'KDV avantajı',
        'Kurumsal müşteriler',
        'Hızlı onay süreci'
      ],
      requirements: [
        'Ticari sıcil',
        'Mali müşavir onayı',
        'Bilanço'
      ],
      eligibility: {
        minIncome: 25000,
        minCreditScore: 700,
        employmentType: ['Şirket', 'Ticari']
      }
    }
  ])

  // Government Incentives Data  
  const [incentives] = useState<GovernmentIncentive[]>([
    {
      id: '1',
      name: 'YEKDEM Tarife Desteği',
      type: 'TARIFF',
      authority: 'EPDK',
      description: 'Fazla enerji için feed-in tariff garantisi',
      amount: 0.058, // USD/kWh
      conditions: [
        'Lisanslı tesis için geçerli',
        '10 yıl garanti',
        'Aylık fatura düzenlenir'
      ],
      validUntil: new Date('2025-12-31'),
      targetGroup: 'ALL'
    },
    {
      id: '2', 
      name: 'GES KDV İstisnası',
      type: 'TAX_EXEMPTION',
      authority: 'Maliye Bakanlığı',
      description: 'GES ekipmanları için %18 KDV muafiyeti',
      percentage: 18,
      amount: 0,
      conditions: [
        'Panel ve inverter dahil',
        'Kurulum hizmeti hariç',
        'Belgelendirilmesi gerekli'
      ],
      validUntil: new Date('2024-12-31'),
      targetGroup: 'ALL'
    },
    {
      id: '3',
      name: 'KOSGEB Enerji Verimliliği',
      type: 'SUBSIDY',
      authority: 'KOSGEB',
      description: 'KOBİ\'ler için %50 hibe desteği',
      percentage: 50,
      amount: 150000,
      conditions: [
        'KOBİ sınıfında olma',
        'En az 2 çalışan',
        'Proje raporu hazırlanması'
      ],
      validUntil: new Date('2024-10-31'),
      targetGroup: 'SME'
    },
    {
      id: '4',
      name: 'TKDK Tarımsal Enerji',
      type: 'AGRICULTURAL',
      authority: 'TKDK',
      description: 'Çiftçiler için %65 hibe desteği',
      percentage: 65,
      amount: 200000,
      conditions: [
        'Aktif çiftçi kaydı',
        'Minimum 2 yıl tarımsal faaliyet',
        'Sürdürülebilirlik planı'
      ],
      validUntil: new Date('2025-06-30'),
      targetGroup: 'FARMER'
    },
    {
      id: '5',
      name: 'İstanbul Büyükşehir Enerji Desteği',
      type: 'REGIONAL_SUPPORT',
      authority: 'İBB',
      description: 'İstanbul\'da GES kurulumu için %25 destek',
      percentage: 25,
      amount: 50000,
      conditions: [
        'İstanbul ikamet',
        'Bina ruhsatı',
        'Belediye onayı'
      ],
      validUntil: new Date('2024-12-31'),
      eligibleRegions: ['İstanbul'],
      targetGroup: 'INDIVIDUAL'
    }
  ])

  const [stats] = useState({
    totalLoansProcessed: 247,
    averageLoanAmount: 68500,
    averageInterestRate: 2.67,
    approvalRate: 78.5,
    totalIncentiveValue: 3200000,
    activeIncentives: incentives.length,
    avgProcessingTime: 7.2
  })

  const [financingScenarios, setFinancingScenarios] = useState<FinancingScenario[]>([])

  // Calculate financing scenarios
  useEffect(() => {
    calculateFinancingScenarios()
  }, [selectedProject])

  const calculateFinancingScenarios = () => {
    const scenarios: FinancingScenario[] = []
    
    banks.forEach((bank, index) => {
      const loanAmount = selectedProject.totalCost * 0.8 // 80% financing
      const downPayment = selectedProject.totalCost * 0.2
      const monthlyRate = bank.interestRate / 100 / 12
      const termMonths = bank.maxTerm
      
      // Monthly payment calculation
      const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                            (Math.pow(1 + monthlyRate, termMonths) - 1)
      
      const totalPayment = monthlyPayment * termMonths
      const totalInterest = totalPayment - loanAmount
      
      // Calculate applicable incentives
      let incentiveValue = 0
      incentives.forEach(incentive => {
        if (incentive.targetGroup === 'ALL' || incentive.targetGroup === selectedProject.customerType) {
          if (incentive.type === 'TAX_EXEMPTION' && incentive.percentage) {
            incentiveValue += (selectedProject.totalCost * incentive.percentage / 100)
          } else if (incentive.type === 'SUBSIDY' && incentive.percentage) {
            incentiveValue += Math.min(
              selectedProject.totalCost * incentive.percentage / 100,
              incentive.amount
            )
          }
        }
      })
      
      const netCost = selectedProject.totalCost - incentiveValue
      const netMonthlyCashFlow = selectedProject.monthlyEnergySavings - monthlyPayment
      const paybackPeriod = netCost / (selectedProject.monthlyEnergySavings * 12)
      const roi25Years = ((selectedProject.monthlyEnergySavings * 12 * 25) - netCost) / netCost * 100
      
      scenarios.push({
        id: `scenario_${index}`,
        name: `${bank.bankName} - ${bank.loanType}`,
        loanAmount,
        downPayment,
        interestRate: bank.interestRate,
        termMonths,
        monthlyPayment: Math.round(monthlyPayment),
        totalPayment: Math.round(totalPayment),
        totalInterest: Math.round(totalInterest),
        bankName: bank.bankName,
        loanType: bank.loanType,
        incentiveValue: Math.round(incentiveValue),
        netCost: Math.round(netCost),
        monthlyEnergySavings: selectedProject.monthlyEnergySavings,
        netMonthlyCashFlow: Math.round(netMonthlyCashFlow),
        paybackPeriod: Math.round(paybackPeriod * 10) / 10,
        roi25Years: Math.round(roi25Years)
      })
    })
    
    setFinancingScenarios(scenarios)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <h1 className="text-2xl font-bold text-gray-900">Finansman & Teşvikler</h1>
                </div>
                
                <div className="flex items-center space-x-4 pl-4 border-l">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalLoansProcessed}</div>
                    <div className="text-xs text-gray-600">İşlenen Kredi</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">%{stats.approvalRate}</div>
                    <div className="text-xs text-gray-600">Onay Oranı</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.activeIncentives}</div>
                    <div className="text-xs text-gray-600">Aktif Teşvik</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">₺{(stats.totalIncentiveValue / 1000)}K</div>
                    <div className="text-xs text-gray-600">Teşvik Değeri</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Başvuru Formu
                </Button>
                <Button size="sm">
                  <Calculator className="w-4 h-4 mr-2" />
                  Hızlı Hesaplama
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto">
              <TabsTrigger value="calculator" className="flex items-center space-x-2">
                <Calculator className="w-4 h-4" />
                <span>Hesaplayıcı</span>
              </TabsTrigger>
              <TabsTrigger value="banks" className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>Bankalar</span>
              </TabsTrigger>
              <TabsTrigger value="incentives" className="flex items-center space-x-2">
                <Gift className="w-4 h-4" />
                <span>Teşvikler</span>
              </TabsTrigger>
              <TabsTrigger value="scenarios" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Senaryolar</span>
              </TabsTrigger>
              <TabsTrigger value="application" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Başvuru</span>
              </TabsTrigger>
            </TabsList>

            {/* Loan Calculator */}
            <TabsContent value="calculator" className="space-y-6">
              <LoanCalculator 
                selectedProject={selectedProject}
                onProjectChange={setSelectedProject}
                banks={banks}
                incentives={incentives}
              />
            </TabsContent>

            {/* Bank Comparison */}
            <TabsContent value="banks" className="space-y-6">
              <BankComparison 
                banks={banks}
                selectedProject={selectedProject}
                scenarios={financingScenarios}
              />
            </TabsContent>

            {/* Incentives Calculator */}
            <TabsContent value="incentives" className="space-y-6">
              <IncentivesCalculator 
                incentives={incentives}
                selectedProject={selectedProject}
              />
            </TabsContent>

            {/* Financing Scenarios */}
            <TabsContent value="scenarios" className="space-y-6">
              <FinancingOptions 
                scenarios={financingScenarios}
                banks={banks}
                incentives={incentives}
                selectedProject={selectedProject}
              />
            </TabsContent>

            {/* Application */}
            <TabsContent value="application" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Kredi Başvurusu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Kredi Başvuru Formu</h3>
                    <p className="text-gray-600 mb-4">
                      Seçtiğiniz bankaya kredi başvurusu yapmak için formu doldurun
                    </p>
                    <Button>
                      Başvuru Formunu Başlat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}