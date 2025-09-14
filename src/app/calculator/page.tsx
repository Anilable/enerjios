'use client'

import { useState } from 'react'
import { PublicLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Calculator, 
  Home, 
  Zap, 
  TrendingUp, 
  PiggyBank,
  FileText,
  Download,
  Share2,
  BarChart3,
  Sun,
  MapPin
} from 'lucide-react'

interface CalculationResult {
  systemSize: number
  monthlyProduction: number
  yearlyProduction: number
  monthlySavings: number
  yearlySavings: number
  paybackPeriod: number
  totalCost: number
  roi: number
}

export default function CalculatorPage() {
  const [formData, setFormData] = useState({
    monthlyBill: '',
    roofArea: '',
    roofType: '',
    city: '',
    buildingType: '',
    electricityUsage: ''
  })

  const [result, setResult] = useState<CalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculateSystem = async () => {
    setIsCalculating(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const monthlyBill = parseFloat(formData.monthlyBill) || 0
    const roofArea = parseFloat(formData.roofArea) || 0
    
    // Basic calculations (simplified)
    const kwhPrice = 2.5 // TL per kWh
    const monthlyUsage = monthlyBill / kwhPrice
    const systemSize = Math.min(monthlyUsage * 12 / 1200, roofArea * 0.2) // kW
    const yearlyProduction = systemSize * 1400 // kWh per year
    const monthlyProduction = yearlyProduction / 12
    const monthlySavings = Math.min(monthlyProduction * kwhPrice, monthlyBill)
    const yearlySavings = monthlySavings * 12
    const totalCost = systemSize * 15000 // TL per kW installed
    const paybackPeriod = totalCost / yearlySavings
    const roi = (yearlySavings * 25 - totalCost) / totalCost * 100

    setResult({
      systemSize,
      monthlyProduction,
      yearlyProduction,
      monthlySavings,
      yearlySavings,
      paybackPeriod,
      totalCost,
      roi
    })
    
    setIsCalculating(false)
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            GES Hesaplayıcı
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Aylık elektrik faturanız ve çatı alanınızı girerek size özel güneş enerjisi sistemi hesaplayın
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-primary" />
                <span>GES Sistem Hesaplama</span>
              </CardTitle>
              <CardDescription>
                Aylık elektrik faturanız ve çatı alanınızı girerek size özel GES sistemi hesaplayın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyBill">Aylık Elektrik Faturası (TL)</Label>
                  <Input
                    id="monthlyBill"
                    placeholder="500"
                    value={formData.monthlyBill}
                    onChange={(e) => handleInputChange('monthlyBill', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="roofArea">Çatı Alanı (m²)</Label>
                  <Input
                    id="roofArea"
                    placeholder="100"
                    value={formData.roofArea}
                    onChange={(e) => handleInputChange('roofArea', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">Şehir</Label>
                  <Select onValueChange={(value) => handleInputChange('city', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Şehir seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="istanbul">İstanbul</SelectItem>
                      <SelectItem value="ankara">Ankara</SelectItem>
                      <SelectItem value="izmir">İzmir</SelectItem>
                      <SelectItem value="antalya">Antalya</SelectItem>
                      <SelectItem value="adana">Adana</SelectItem>
                      <SelectItem value="edirne">Edirne</SelectItem>
                      <SelectItem value="tekirdag">Tekirdağ</SelectItem>
                      <SelectItem value="kirklareli">Kırklareli</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="roofType">Çatı Tipi</Label>
                  <Select onValueChange={(value) => handleInputChange('roofType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Çatı tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tile">Kiremitli Çatı</SelectItem>
                      <SelectItem value="metal">Metal Çatı</SelectItem>
                      <SelectItem value="concrete">Beton Teras</SelectItem>
                      <SelectItem value="other">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full"
                >
                  {showAdvanced ? 'Basit Hesaplama' : 'Detaylı Hesaplama'}
                </Button>

                {showAdvanced && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="buildingType">Bina Tipi</Label>
                      <Select onValueChange={(value) => handleInputChange('buildingType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Bina tipi seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">Konut</SelectItem>
                          <SelectItem value="commercial">Ticari</SelectItem>
                          <SelectItem value="industrial">Sanayi</SelectItem>
                          <SelectItem value="agricultural">Tarımsal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="electricityUsage">Günlük Kullanım (kWh)</Label>
                      <Input
                        id="electricityUsage"
                        placeholder="20"
                        value={formData.electricityUsage}
                        onChange={(e) => handleInputChange('electricityUsage', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={calculateSystem}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isCalculating || !formData.monthlyBill || !formData.roofArea}
              >
                {isCalculating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Hesaplanıyor...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Hesapla
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hesaplama İpuçları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <Sun className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium">Optimum Çatı Alanı</p>
                  <p className="text-sm text-gray-600">1 kW için yaklaşık 8 m² çatı alanı gereklidir</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Coğrafi Konum</p>
                  <p className="text-sm text-gray-600">Güney yönlü çatılar en yüksek verim sağlar</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Enerji Tüketimi</p>
                  <p className="text-sm text-gray-600">Sisteminiz tüketiminizin %80-90'ını karşılamalı</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {result ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    <span>Sistem Özeti</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {result.systemSize.toFixed(1)} kW
                    </div>
                    <p className="text-sm text-gray-600">Önerilen Sistem Gücü</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Aylık Üretim</span>
                      <span className="font-medium">{result.monthlyProduction.toFixed(0)} kWh</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Yıllık Üretim</span>
                      <span className="font-medium">{result.yearlyProduction.toFixed(0)} kWh</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Aylık Tasarruf</span>
                      <span className="font-medium text-green-600">₺{result.monthlySavings.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Yıllık Tasarruf</span>
                      <span className="font-medium text-green-600">₺{result.yearlySavings.toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Geri Ödeme Süresi</span>
                        <Badge variant={result.paybackPeriod < 7 ? "default" : "secondary"}>
                          {result.paybackPeriod.toFixed(1)} yıl
                        </Badge>
                      </div>
                      <Progress value={Math.min((7 / result.paybackPeriod) * 100, 100)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PiggyBank className="w-5 h-5 text-blue-600" />
                    <span>Finansal Analiz</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ₺{result.totalCost.toLocaleString('tr-TR')}
                    </div>
                    <p className="text-sm text-gray-600">Toplam Yatırım</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">25 Yıl ROI</span>
                      <span className="font-medium text-green-600">{result.roi.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">25 Yıl Kazanç</span>
                      <span className="font-medium text-green-600">
                        ₺{((result.yearlySavings * 25) - result.totalCost).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button className="w-full" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Detaylı Rapor Al
                    </Button>
                    <div className="flex space-x-2">
                      <Button className="flex-1" variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        İndir
                      </Button>
                      <Button className="flex-1" variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-1" />
                        Paylaş
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sonraki Adımlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild>
                    <a href="/dashboard/quotes">
                      <FileText className="w-4 h-4 mr-2" />
                      Teklif Al
                    </a>
                  </Button>
                  <Button className="w-full" variant="outline" asChild>
                    <a href="/dashboard/financing">
                      <PiggyBank className="w-4 h-4 mr-2" />
                      Finansman Seçenekleri
                    </a>
                  </Button>
                  <Button className="w-full" variant="outline" asChild>
                    <a href="/support">
                      <Home className="w-4 h-4 mr-2" />
                      Ücretsiz Keşif
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Hesaplama yapmak için soldaki formu doldurun
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      </div>
    </PublicLayout>
  )
}