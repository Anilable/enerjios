'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { LeadCaptureDialog } from '@/components/ui/lead-capture-dialog'
import { 
  Calculator, 
  MapPin, 
  Zap, 
  Home, 
  TrendingUp, 
  Calendar, 
  PiggyBank, 
  ArrowRight,
  Sun,
  Leaf
} from 'lucide-react'

// Türkiye'nin 81 ili ve güneşlenme değerleri (kWh/m²/yıl)
const cities = [
  { code: '01', name: 'Adana', irradiance: 1642 },
  { code: '02', name: 'Adıyaman', irradiance: 1589 },
  { code: '03', name: 'Afyonkarahisar', irradiance: 1456 },
  { code: '04', name: 'Ağrı', irradiance: 1365 },
  { code: '05', name: 'Amasya', irradiance: 1298 },
  { code: '06', name: 'Ankara', irradiance: 1365 },
  { code: '07', name: 'Antalya', irradiance: 1814 },
  { code: '08', name: 'Artvin', irradiance: 1186 },
  { code: '09', name: 'Aydın', irradiance: 1698 },
  { code: '10', name: 'Balıkesir', irradiance: 1456 },
  { code: '11', name: 'Bilecik', irradiance: 1298 },
  { code: '12', name: 'Bingöl', irradiance: 1456 },
  { code: '13', name: 'Bitlis', irradiance: 1456 },
  { code: '14', name: 'Bolu', irradiance: 1186 },
  { code: '15', name: 'Burdur', irradiance: 1589 },
  { code: '16', name: 'Bursa', irradiance: 1298 },
  { code: '17', name: 'Çanakkale', irradiance: 1456 },
  { code: '18', name: 'Çankırı', irradiance: 1298 },
  { code: '19', name: 'Çorum', irradiance: 1298 },
  { code: '20', name: 'Denizli', irradiance: 1589 },
  { code: '21', name: 'Diyarbakır', irradiance: 1589 },
  { code: '22', name: 'Edirne', irradiance: 1365 },
  { code: '23', name: 'Elazığ', irradiance: 1456 },
  { code: '24', name: 'Erzincan', irradiance: 1365 },
  { code: '25', name: 'Erzurum', irradiance: 1365 },
  { code: '26', name: 'Eskişehir', irradiance: 1365 },
  { code: '27', name: 'Gaziantep', irradiance: 1728 },
  { code: '28', name: 'Giresun', irradiance: 1186 },
  { code: '29', name: 'Gümüşhane', irradiance: 1298 },
  { code: '30', name: 'Hakkari', irradiance: 1589 },
  { code: '31', name: 'Hatay', irradiance: 1642 },
  { code: '32', name: 'Isparta', irradiance: 1589 },
  { code: '33', name: 'Mersin', irradiance: 1642 },
  { code: '34', name: 'İstanbul', irradiance: 1298 },
  { code: '35', name: 'İzmir', irradiance: 1698 },
  { code: '36', name: 'Kars', irradiance: 1365 },
  { code: '37', name: 'Kastamonu', irradiance: 1186 },
  { code: '38', name: 'Kayseri', irradiance: 1456 },
  { code: '39', name: 'Kırklareli', irradiance: 1298 },
  { code: '40', name: 'Kırşehir', irradiance: 1365 },
  { code: '41', name: 'Kocaeli', irradiance: 1298 },
  { code: '42', name: 'Konya', irradiance: 1456 },
  { code: '43', name: 'Kütahya', irradiance: 1365 },
  { code: '44', name: 'Malatya', irradiance: 1456 },
  { code: '45', name: 'Manisa', irradiance: 1589 },
  { code: '46', name: 'Kahramanmaraş', irradiance: 1589 },
  { code: '47', name: 'Mardin', irradiance: 1728 },
  { code: '48', name: 'Muğla', irradiance: 1814 },
  { code: '49', name: 'Muş', irradiance: 1456 },
  { code: '50', name: 'Nevşehir', irradiance: 1456 },
  { code: '51', name: 'Niğde', irradiance: 1456 },
  { code: '52', name: 'Ordu', irradiance: 1186 },
  { code: '53', name: 'Rize', irradiance: 1098 },
  { code: '54', name: 'Sakarya', irradiance: 1298 },
  { code: '55', name: 'Samsun', irradiance: 1298 },
  { code: '56', name: 'Siirt', irradiance: 1589 },
  { code: '57', name: 'Sinop', irradiance: 1186 },
  { code: '58', name: 'Sivas', irradiance: 1365 },
  { code: '59', name: 'Tekirdağ', irradiance: 1365 },
  { code: '60', name: 'Tokat', irradiance: 1298 },
  { code: '61', name: 'Trabzon', irradiance: 1186 },
  { code: '62', name: 'Tunceli', irradiance: 1456 },
  { code: '63', name: 'Şanlıurfa', irradiance: 1728 },
  { code: '64', name: 'Uşak', irradiance: 1456 },
  { code: '65', name: 'Van', irradiance: 1589 },
  { code: '66', name: 'Yozgat', irradiance: 1365 },
  { code: '67', name: 'Zonguldak', irradiance: 1186 },
  { code: '68', name: 'Aksaray', irradiance: 1456 },
  { code: '69', name: 'Bayburt', irradiance: 1365 },
  { code: '70', name: 'Karaman', irradiance: 1456 },
  { code: '71', name: 'Kırıkkale', irradiance: 1365 },
  { code: '72', name: 'Batman', irradiance: 1589 },
  { code: '73', name: 'Şırnak', irradiance: 1589 },
  { code: '74', name: 'Bartın', irradiance: 1186 },
  { code: '75', name: 'Ardahan', irradiance: 1298 },
  { code: '76', name: 'Iğdır', irradiance: 1456 },
  { code: '77', name: 'Yalova', irradiance: 1298 },
  { code: '78', name: 'Karabük', irradiance: 1186 },
  { code: '79', name: 'Kilis', irradiance: 1728 },
  { code: '80', name: 'Osmaniye', irradiance: 1642 },
  { code: '81', name: 'Düzce', irradiance: 1186 }
].sort((a, b) => a.name.localeCompare(b.name, 'tr')) // Alfabetik sıralama

export function CalculatorSection() {
  const [formData, setFormData] = useState({
    city: '',
    monthlyBill: '',
    roofArea: '',
    systemType: 'ROOFTOP'
  })
  
  const [results, setResults] = useState<{
    systemSize: number
    investment: number
    annualSaving: number
    paybackPeriod: number
    co2Reduction: number
    monthlyProduction: number
  } | null>(null)

  const [isCalculating, setIsCalculating] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Handle hydration to prevent SSR/client mismatch
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Memoized disabled state to ensure consistency
  const isButtonDisabled = useMemo(() => {
    if (!isHydrated) return true // Always disabled on server-side
    return !formData.city || !formData.monthlyBill || isCalculating
  }, [isHydrated, formData.city, formData.monthlyBill, isCalculating])

  const handleCalculate = () => {
    if (!formData.city || !formData.monthlyBill) return

    setIsCalculating(true)
    
    // Simulate calculation delay
    setTimeout(() => {
      const monthlyBill = parseFloat(formData.monthlyBill)
      const selectedCity = cities.find(c => c.code === formData.city)
      const irradiance = selectedCity?.irradiance || 1400
      
      // Gerçekçi hesaplamalar
      const electricityPrice = 4.73 // 2024 güncel ortalama kWh fiyatı (TL)
      const annualConsumption = (monthlyBill / electricityPrice) * 12 // kWh/yıl

      // Sistem boyutu hesaplama (güneşlenme ve performans oranı ile)
      const performanceRatio = 0.75 // Tipik GES performans oranı
      const systemSize = Math.ceil(annualConsumption / (irradiance * performanceRatio)) // kWp

      // Güncel yatırım maliyeti (2024 fiyatları)
      const unitCostPerKWp = systemSize <= 10 ? 18000 : systemSize <= 50 ? 15000 : 12000 // TL/kWp
      const investment = systemSize * unitCostPerKWp

      // Yıllık üretim ve tasarruf
      const annualProduction = systemSize * irradiance * performanceRatio // kWh/yıl
      const selfConsumptionRate = 0.70 // Öztüketim oranı %70
      const gridFeedRate = 0.30 // Şebekeye verilen %30

      // Tasarruf hesaplama (öztüketim + şebekeye satış)
      const selfConsumptionSaving = annualProduction * selfConsumptionRate * electricityPrice
      const gridFeedIncome = annualProduction * gridFeedRate * (electricityPrice * 0.6) // Satış fiyatı alış fiyatının %60'ı
      const annualSaving = selfConsumptionSaving + gridFeedIncome

      // Geri ödeme süresi ve CO2 azaltımı
      const paybackPeriod = investment / annualSaving
      const co2Reduction = annualProduction * 0.475 / 1000 // ton CO2/yıl (Türkiye elektrik karbon yoğunluğu)
      const monthlyProduction = annualProduction / 12

      setResults({
        systemSize,
        investment,
        annualSaving: Math.round(annualSaving),
        paybackPeriod: Math.round(paybackPeriod * 10) / 10,
        co2Reduction: Math.round(co2Reduction * 10) / 10,
        monthlyProduction: Math.round(monthlyProduction)
      })
      
      setIsCalculating(false)
    }, 1500)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setResults(null) // Clear results when inputs change
  }

  return (
    <section id="calculator-section" className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 to-yellow-50 dark:from-primary/10 dark:to-yellow-900/20 relative z-0 mb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Calculator className="w-4 h-4" />
            <span>Hızlı Hesaplama</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            GES Yatırımınızı
            <span className="text-primary block">Hemen Hesaplayın</span>
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Bulunduğunuz şehir ve elektrik faturanıza göre güneş enerjisi sisteminin 
            size sağlayacağı tasarruf ve yatırım getirisini öğrenin.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* Calculator Form */}
            <Card className="shadow-xl border-0 dark:bg-gray-800">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Ücretsiz GES Hesaplayıcı</CardTitle>
                <CardDescription>
                  Temel bilgilerinizi girerek potansiyel tasarrufunuzu keşfedin
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Bulunduğunuz Şehir</span>
                  </Label>
                  <Select 
                    value={formData.city} 
                    onValueChange={(value) => handleInputChange('city', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Şehir seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city.code} value={city.code}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyBill" className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span>Aylık Elektrik Faturası (TL)</span>
                  </Label>
                  <Input
                    id="monthlyBill"
                    type="number"
                    placeholder="Örn: 850"
                    value={formData.monthlyBill}
                    onChange={(e) => handleInputChange('monthlyBill', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roofArea" className="flex items-center space-x-2">
                    <Home className="w-4 h-4 text-primary" />
                    <span>Çatı Alanı (m² - Opsiyonel)</span>
                  </Label>
                  <Input
                    id="roofArea"
                    type="number"
                    placeholder="Örn: 100"
                    value={formData.roofArea}
                    onChange={(e) => handleInputChange('roofArea', e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleCalculate}
                  disabled={isButtonDisabled}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-medium"
                >
                  {isCalculating ? (
                    <>
                      <Sun className="w-5 h-5 mr-2 animate-spin" />
                      Hesaplanıyor...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-2" />
                      Hesapla
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  * Hesaplamalar yaklaşık değerlerdir. Kesin analiz için detaylı inceleme gereklidir.
                </p>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              {results ? (
                <>
                  <Card className="bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8" />
                      </div>
                      <CardTitle className="text-2xl">Hesaplama Sonuçları</CardTitle>
                      <CardDescription className="text-primary-foreground/80">
                        Size özel GES sistemi analizi
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 rounded-xl p-4 text-center">
                          <Sun className="w-8 h-8 mx-auto mb-2" />
                          <div className="text-2xl font-bold">{results.systemSize} kW</div>
                          <div className="text-sm opacity-80">Sistem Gücü</div>
                        </div>
                        
                        <div className="bg-white/10 rounded-xl p-4 text-center">
                          <PiggyBank className="w-8 h-8 mx-auto mb-2" />
                          <div className="text-2xl font-bold">₺{results.investment.toLocaleString()}</div>
                          <div className="text-sm opacity-80">Toplam Yatırım</div>
                        </div>
                        
                        <div className="bg-white/10 rounded-xl p-4 text-center">
                          <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                          <div className="text-2xl font-bold">₺{results.annualSaving.toLocaleString()}</div>
                          <div className="text-sm opacity-80">Yıllık Tasarruf</div>
                        </div>
                        
                        <div className="bg-white/10 rounded-xl p-4 text-center">
                          <Calendar className="w-8 h-8 mx-auto mb-2" />
                          <div className="text-2xl font-bold">{results.paybackPeriod} Yıl</div>
                          <div className="text-sm opacity-80">Geri Ödeme</div>
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Leaf className="w-5 h-5" />
                            <span className="font-medium">Çevre Etkisi</span>
                          </div>
                          <Badge variant="secondary" className="bg-white/20 text-white">
                            {results.co2Reduction} ton CO₂/yıl tasarruf
                          </Badge>
                        </div>
                        <div className="text-sm opacity-80">
                          25 yılda {Math.round(results.co2Reduction * 25)} ton karbon ayak izi azaltımı
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="h-full border-dashed border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800">
                  <CardContent className="flex flex-col items-center justify-center text-center h-full py-16">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                      <Calculator className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Hesaplama Sonuçları
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Formu doldurup hesapla butonuna basın
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* CTA Card - Positioned with proper spacing and z-index */}
              <div className="mt-12 relative z-10">
                <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-xl relative">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Home className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-3">
                      Profesyonel Keşif İstiyorum
                    </h3>
                    <p className="text-base mb-6 opacity-90 max-w-sm mx-auto">
                      Uzmanlarımız evinizi ziyaret ederek detaylı analiz yapar ve size özel çözüm önerir
                    </p>
                    <LeadCaptureDialog>
                      <Button 
                        variant="secondary" 
                        size="lg"
                        className="bg-white text-orange-600 hover:bg-white/90 font-semibold px-8 py-3 shadow-lg"
                      >
                        Ücretsiz Keşif Talep Et
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </LeadCaptureDialog>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}