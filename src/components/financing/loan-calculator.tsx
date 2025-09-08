'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calculator,
  Zap,
  PiggyBank,
  TrendingUp,
  Calendar,
  Percent,
  CreditCard,
  DollarSign,
  Home,
  Building,
  Tractor,
  FileText
} from 'lucide-react'
import type { BankLoan, GovernmentIncentive } from '@/app/dashboard/financing/page'

interface LoanCalculatorProps {
  selectedProject: {
    systemSize: number
    totalCost: number
    annualProduction: number
    monthlyEnergySavings: number
    location: string
    customerType: 'INDIVIDUAL' | 'SME' | 'FARMER' | 'CORPORATE'
  }
  onProjectChange: (project: any) => void
  banks: BankLoan[]
  incentives: GovernmentIncentive[]
}

export function LoanCalculator({ selectedProject, onProjectChange, banks, incentives }: LoanCalculatorProps) {
  const [loanParams, setLoanParams] = useState({
    loanAmount: selectedProject.totalCost * 0.8,
    downPayment: selectedProject.totalCost * 0.2,
    interestRate: 2.75,
    termMonths: 48,
    selectedBank: banks[0]
  })

  const [calculations, setCalculations] = useState({
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0,
    effectiveRate: 0,
    incentiveValue: 0,
    netCost: 0,
    netMonthlyCashFlow: 0,
    paybackPeriod: 0,
    roi25Years: 0
  })

  // Recalculate when parameters change
  useEffect(() => {
    calculateLoan()
  }, [loanParams, selectedProject])

  const calculateLoan = () => {
    const { loanAmount, interestRate, termMonths } = loanParams
    const monthlyRate = interestRate / 100 / 12
    
    // Monthly payment calculation (PMT formula)
    const monthlyPayment = monthlyRate > 0 
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
        (Math.pow(1 + monthlyRate, termMonths) - 1)
      : loanAmount / termMonths

    const totalPayment = monthlyPayment * termMonths
    const totalInterest = totalPayment - loanAmount
    
    // Calculate processing fees and insurance
    const processingFee = loanParams.selectedBank.processingFee
    const insuranceCost = loanAmount * loanParams.selectedBank.insuranceRate / 100
    const effectiveRate = ((totalInterest + processingFee + insuranceCost) / loanAmount / (termMonths / 12)) * 100
    
    // Calculate incentives
    let incentiveValue = 0
    incentives.forEach(incentive => {
      if (incentive.targetGroup === 'ALL' || incentive.targetGroup === selectedProject.customerType) {
        if (incentive.type === 'TAX_EXEMPTION' && incentive.percentage) {
          incentiveValue += (selectedProject.totalCost * incentive.percentage / 100)
        } else if ((incentive.type === 'SUBSIDY' || incentive.type === 'AGRICULTURAL') && incentive.percentage) {
          const subsidyAmount = Math.min(
            selectedProject.totalCost * incentive.percentage / 100,
            incentive.amount || Infinity
          )
          incentiveValue += subsidyAmount
        }
      }
    })
    
    const netCost = selectedProject.totalCost - incentiveValue
    const netMonthlyCashFlow = selectedProject.monthlyEnergySavings - monthlyPayment
    const paybackPeriod = netCost / (selectedProject.monthlyEnergySavings * 12)
    const roi25Years = ((selectedProject.monthlyEnergySavings * 12 * 25) - netCost) / netCost * 100
    
    setCalculations({
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      effectiveRate: Math.round(effectiveRate * 100) / 100,
      incentiveValue: Math.round(incentiveValue),
      netCost: Math.round(netCost),
      netMonthlyCashFlow: Math.round(netMonthlyCashFlow),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      roi25Years: Math.round(roi25Years)
    })
  }

  const updateLoanAmount = (percentage: number) => {
    const newLoanAmount = selectedProject.totalCost * (percentage / 100)
    const newDownPayment = selectedProject.totalCost - newLoanAmount
    
    setLoanParams(prev => ({
      ...prev,
      loanAmount: newLoanAmount,
      downPayment: newDownPayment
    }))
  }

  const getCustomerTypeIcon = (type: string) => {
    switch (type) {
      case 'INDIVIDUAL': return Home
      case 'SME': case 'CORPORATE': return Building  
      case 'FARMER': return Tractor
      default: return Home
    }
  }

  const getCustomerTypeLabel = (type: string) => {
    switch (type) {
      case 'INDIVIDUAL': return 'Bireysel'
      case 'SME': return 'KOBİ'
      case 'CORPORATE': return 'Kurumsal'
      case 'FARMER': return 'Çiftçi'
      default: return 'Bireysel'
    }
  }

  const eligibleBanks = banks.filter(bank => {
    if (selectedProject.customerType === 'FARMER') {
      return bank.loanType === 'AGRICULTURAL' || bank.loanType === 'CONSUMER'
    }
    if (selectedProject.customerType === 'CORPORATE' || selectedProject.customerType === 'SME') {
      return bank.loanType === 'BUSINESS' || bank.loanType === 'LEASING'
    }
    return bank.loanType === 'CONSUMER'
  })

  return (
    <div className="space-y-6">
      {/* Project Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Proje Özeti</h3>
            <div className="flex items-center space-x-2">
              {React.createElement(getCustomerTypeIcon(selectedProject.customerType), { className: "w-4 h-4" })}
              <Badge variant="secondary">{getCustomerTypeLabel(selectedProject.customerType)}</Badge>
            </div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{selectedProject.systemSize} kW</div>
              <div className="text-sm text-gray-600">Sistem Gücü</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">₺{selectedProject.totalCost.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Toplam Maliyet</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{selectedProject.annualProduction.toLocaleString()} kWh</div>
              <div className="text-sm text-gray-600">Yıllık Üretim</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">₺{selectedProject.monthlyEnergySavings}</div>
              <div className="text-sm text-gray-600">Aylık Tasarruf</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Loan Parameters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Kredi Parametreleri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Temel</TabsTrigger>
                <TabsTrigger value="advanced">Gelişmiş</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                {/* Bank Selection */}
                <div>
                  <Label>Banka Seçimi</Label>
                  <Select 
                    value={loanParams.selectedBank.bankName} 
                    onValueChange={(value) => {
                      const bank = eligibleBanks.find(b => b.bankName === value)
                      if (bank) {
                        setLoanParams(prev => ({
                          ...prev,
                          selectedBank: bank,
                          interestRate: bank.interestRate,
                          termMonths: Math.min(prev.termMonths, bank.maxTerm)
                        }))
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleBanks.map(bank => (
                        <SelectItem key={bank.bankName} value={bank.bankName}>
                          <div className="flex items-center justify-between w-full">
                            <span>{bank.bankName}</span>
                            <Badge variant="outline" className="ml-2">
                              {bank.loanType}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Loan Amount */}
                <div>
                  <Label>Kredi Tutarı: ₺{loanParams.loanAmount.toLocaleString()}</Label>
                  <Slider
                    value={[(loanParams.loanAmount / selectedProject.totalCost) * 100]}
                    onValueChange={(value) => updateLoanAmount(value[0])}
                    max={90}
                    min={50}
                    step={5}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>₺{(selectedProject.totalCost * 0.5).toLocaleString()} (%50)</span>
                    <span>₺{(selectedProject.totalCost * 0.9).toLocaleString()} (%90)</span>
                  </div>
                </div>

                {/* Down Payment */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <Label className="text-sm">Peşin Ödeme</Label>
                  <div className="text-xl font-bold">₺{loanParams.downPayment.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">
                    %{Math.round((loanParams.downPayment / selectedProject.totalCost) * 100)} peşin
                  </div>
                </div>

                {/* Interest Rate */}
                <div>
                  <Label>Faiz Oranı: %{loanParams.interestRate}</Label>
                  <Slider
                    value={[loanParams.interestRate]}
                    onValueChange={(value) => setLoanParams(prev => ({ ...prev, interestRate: value[0] }))}
                    max={5}
                    min={1.5}
                    step={0.05}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>%1.5 (En düşük)</span>
                    <span>%5.0 (En yüksek)</span>
                  </div>
                </div>

                {/* Term */}
                <div>
                  <Label>Vade: {loanParams.termMonths} ay</Label>
                  <Slider
                    value={[loanParams.termMonths]}
                    onValueChange={(value) => setLoanParams(prev => ({ ...prev, termMonths: value[0] }))}
                    max={loanParams.selectedBank.maxTerm}
                    min={12}
                    step={6}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>12 ay</span>
                    <span>{loanParams.selectedBank.maxTerm} ay</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                {/* Project Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="systemSize">Sistem Gücü (kW)</Label>
                    <Input
                      id="systemSize"
                      type="number"
                      step="0.1"
                      value={selectedProject.systemSize}
                      onChange={(e) => onProjectChange({
                        ...selectedProject,
                        systemSize: Number(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalCost">Toplam Maliyet (₺)</Label>
                    <Input
                      id="totalCost"
                      type="number"
                      value={selectedProject.totalCost}
                      onChange={(e) => onProjectChange({
                        ...selectedProject,
                        totalCost: Number(e.target.value)
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="annualProduction">Yıllık Üretim (kWh)</Label>
                    <Input
                      id="annualProduction"
                      type="number"
                      value={selectedProject.annualProduction}
                      onChange={(e) => onProjectChange({
                        ...selectedProject,
                        annualProduction: Number(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyEnergySavings">Aylık Tasarruf (₺)</Label>
                    <Input
                      id="monthlyEnergySavings"
                      type="number"
                      value={selectedProject.monthlyEnergySavings}
                      onChange={(e) => onProjectChange({
                        ...selectedProject,
                        monthlyEnergySavings: Number(e.target.value)
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Konum</Label>
                  <Select 
                    value={selectedProject.location}
                    onValueChange={(value) => onProjectChange({ ...selectedProject, location: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="İstanbul">İstanbul</SelectItem>
                      <SelectItem value="Ankara">Ankara</SelectItem>
                      <SelectItem value="İzmir">İzmir</SelectItem>
                      <SelectItem value="Antalya">Antalya</SelectItem>
                      <SelectItem value="Bursa">Bursa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="customerType">Müşteri Tipi</Label>
                  <Select 
                    value={selectedProject.customerType}
                    onValueChange={(value: any) => onProjectChange({ ...selectedProject, customerType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INDIVIDUAL">Bireysel</SelectItem>
                      <SelectItem value="SME">KOBİ</SelectItem>
                      <SelectItem value="CORPORATE">Kurumsal</SelectItem>
                      <SelectItem value="FARMER">Çiftçi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Hesaplama Sonuçları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Monthly Payment */}
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Aylık Ödeme</span>
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">₺{calculations.monthlyPayment.toLocaleString()}</div>
              <div className="text-sm text-gray-600">
                {loanParams.termMonths} ay boyunca
              </div>
            </div>

            {/* Net Cash Flow */}
            <div className={`rounded-lg p-4 ${calculations.netMonthlyCashFlow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Net Aylık Nakit Akışı</span>
                <DollarSign className={`w-4 h-4 ${calculations.netMonthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div className={`text-2xl font-bold ${calculations.netMonthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₺{calculations.netMonthlyCashFlow.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Tasarruf - Kredi ödemesi
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <Percent className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-600">%{calculations.effectiveRate}</div>
                <div className="text-xs text-blue-800">Efektif Faiz</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <PiggyBank className="w-4 h-4 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-green-600">₺{calculations.incentiveValue.toLocaleString()}</div>
                <div className="text-xs text-green-800">Teşvik Değeri</div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <Calendar className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-orange-600">{calculations.paybackPeriod} Yıl</div>
                <div className="text-xs text-orange-800">Geri Ödeme</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <TrendingUp className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-purple-600">%{calculations.roi25Years}</div>
                <div className="text-xs text-purple-800">25 Yıl ROI</div>
              </div>
            </div>

            {/* Total Cost Breakdown */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Kredi Tutarı:</span>
                <span>₺{loanParams.loanAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Toplam Faiz:</span>
                <span>₺{calculations.totalInterest.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Dosya Masrafı:</span>
                <span>₺{loanParams.selectedBank.processingFee}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2 font-bold">
                <span>Toplam Ödeme:</span>
                <span>₺{calculations.totalPayment.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4">
              <Button className="flex-1" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Başvuru Yap
              </Button>
              <Button variant="outline" className="flex-1" size="sm">
                PDF İndir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}