'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ExcelMapper } from '@/components/excel-mapper'
import { PRODUCT_SYSTEM_FIELDS } from '@/types/excel-mapper'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileSpreadsheet, Upload, CheckCircle, AlertCircle, Info, ArrowRight, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function BayiExcelPage() {
  const [showMapper, setShowMapper] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importStats, setImportStats] = useState<{
    total: number
    success: number
    failed: number
  } | null>(null)
  const { toast } = useToast()

  const handleImport = async (data: Record<string, any>[]) => {
    setIsImporting(true)
    const stats = { total: data.length, success: 0, failed: 0 }

    try {
      // Process products in batches of 50
      const batchSize = 50
      const batches = []
      for (let i = 0; i < data.length; i += batchSize) {
        batches.push(data.slice(i, i + batchSize))
      }

      for (const batch of batches) {
        const response = await fetch('/api/products/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ products: batch }),
        })

        if (response.ok) {
          const result = await response.json()
          stats.success += result.success || batch.length
          stats.failed += result.failed || 0
        } else {
          stats.failed += batch.length
        }
      }

      setImportStats(stats)
      toast({
        title: 'İçe Aktarma Tamamlandı',
        description: `${stats.success} ürün başarıyla eklendi, ${stats.failed} hata`,
      })
    } catch (error) {
      console.error('Import error:', error)
      stats.failed = data.length
      setImportStats(stats)

      toast({
        title: 'Hata',
        description: 'İçe aktarma sırasında bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setIsImporting(false)
      setShowMapper(false)
    }
  }

  if (showMapper) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-100px)]">
          <ExcelMapper
            onImport={handleImport}
            systemFields={PRODUCT_SYSTEM_FIELDS}
            onClose={() => setShowMapper(false)}
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Excel İçe Aktarma Sistemi</h1>
            <p className="text-muted-foreground">
              Gelişmiş Excel mapper ile ürünlerinizi kolayca içe aktarın
            </p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Zap className="w-3 h-3 mr-1" />
            Yeni Sistem
          </Badge>
        </div>

        {/* Import Stats */}
        {importStats && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-semibold">İçe Aktarma Tamamlandı</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {importStats.success} / {importStats.total} ürün başarıyla eklendi
                    {importStats.failed > 0 && `, ${importStats.failed} hata`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Action Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center space-x-2 text-xl">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              <span>Akıllı Excel İçe Aktarma</span>
            </CardTitle>
            <CardDescription className="text-base">
              Yeni gelişmiş mapper ile Excel dosyalarınızı kolayca içe aktarın
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-white dark:bg-gray-800 rounded-full p-6 shadow-lg mb-6">
                <Upload className="w-12 h-12 text-blue-600" />
              </div>
              <Button
                size="lg"
                onClick={() => setShowMapper(true)}
                disabled={isImporting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    İçe Aktarılıyor...
                  </>
                ) : (
                  <>
                    Excel Mapper'ı Başlat
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                XLSX, XLS formatları • Maksimum 10MB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Akıllı Sütun Eşleştirme</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Otomatik sütun tanıma ve eşleştirme</li>
                <li>• Sürükle-bırak arayüzü</li>
                <li>• Çoklu sayfa desteği</li>
                <li>• Akıllı veri tipi algılama</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span>Gelişmiş Doğrulama</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Gerçek zamanlı veri doğrulama</li>
                <li>• Zorunlu alan kontrolü</li>
                <li>• Tekrar eden kayıt tespiti</li>
                <li>• Hata raporlama ve düzeltme</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                <span>Esnek Veri İşleme</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Satır bazlı hariç tutma</li>
                <li>• Veri önizleme ve düzenleme</li>
                <li>• Toplu seçim ve işlemler</li>
                <li>• İçe aktarma önizlemesi</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Supported Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="w-5 h-5" />
              <span>Desteklenen Ürün Alanları</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-red-600">Zorunlu Alanlar</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>Ürün Adı</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>Ürün Kodu</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>Ürün Tipi</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>Birim Fiyat</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-blue-600">Teknik Özellikler</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Güç (W)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Verimlilik (%)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Garanti (Yıl)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Teknik Özellikler</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-green-600">İsteğe Bağlı</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Marka, Model</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Stok Miktarı</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Para Birimi</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Açıklama</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Use */}
        <Card>
          <CardHeader>
            <CardTitle>Nasıl Kullanılır?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Excel Dosyanızı Hazırlayın</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ürün bilgilerinizi içeren Excel dosyanızın sütun başlıklarının açık olduğundan emin olun.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Dosyayı Yükleyin</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Excel Mapper'ı başlatın ve dosyanızı seçin. Sistem otomatik analiz yapacaktır.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">Sütunları Eşleştirin</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Akıllı eşleştirme ile sütunlarınızı sistem alanlarına bağlayın.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-semibold">Doğrulayın ve İçe Aktarın</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Verilerinizi doğrulayın, hataları düzeltin ve içe aktarma işlemini başlatın.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}