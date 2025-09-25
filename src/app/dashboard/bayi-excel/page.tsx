'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ImportedProduct {
  name: string
  code: string
  category: string
  brand: string
  model: string
  price: number
  usdPrice?: number
  stock: number
  power?: number
  warranty?: number
  description: string
}

export default function BayiExcelPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{
    success: ImportedProduct[]
    errors: string[]
  } | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile)
        setResults(null)
      } else {
        alert('Sadece Excel dosyaları (.xlsx, .xls) desteklenir!')
      }
    }
  }

  const processExcelFile = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(10)

    try {
      // Read Excel file
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      setProgress(30)

      // Process data
      const processedProducts: ImportedProduct[] = []
      const errors: string[] = []

      jsonData.forEach((row: any, index: number) => {
        try {
          const product: ImportedProduct = {
            name: row['TANIM'] || row['Ürün Adı'] || row['Name'] || '',
            code: row['KOD'] || row['Ürün Kodu'] || row['Code'] || `AUTO-${index}`,
            category: inferCategory(row['TANIM'] || row['Ürün Adı'] || ''),
            brand: row['MARKA'] || row['Brand'] || 'Bilinmeyen',
            model: row['MODEL'] || row['Model'] || '',
            price: parseFloat(row['BİRİM'] || row['Fiyat'] || row['Price'] || '0'),
            usdPrice: parseFloat(row['NET'] || row['USD'] || '0') || undefined,
            stock: parseInt(row['STOK'] || row['Stock'] || '0'),
            power: parseInt(row['GÜÇ'] || row['Power'] || '0') || undefined,
            warranty: parseInt(row['GARANTİ'] || row['Warranty'] || '0') || undefined,
            description: row['AÇIKLAMA'] || row['Description'] || ''
          }

          if (product.name && product.price > 0) {
            processedProducts.push(product)
          } else {
            errors.push(`Satır ${index + 1}: Ürün adı veya fiyat eksik`)
          }
        } catch (error) {
          errors.push(`Satır ${index + 1}: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
        }
      })

      setProgress(60)

      // Save to database
      const createdProducts = []
      const saveErrors = []

      for (const product of processedProducts) {
        try {
          const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: product.name,
              brand: product.brand,
              model: product.model,
              category: product.category,
              price: product.price,
              costPrice: product.usdPrice ? product.usdPrice * 41 : undefined,
              stock: product.stock,
              power: product.power?.toString(),
              warranty: product.warranty?.toString(),
              description: product.description,
              code: product.code,
            }),
          })

          if (response.ok) {
            createdProducts.push(product)
          } else {
            const error = await response.json()
            saveErrors.push(`${product.name}: ${error.error}`)
          }
        } catch (error) {
          saveErrors.push(`${product.name}: API hatası`)
        }
      }

      setProgress(100)
      setResults({
        success: createdProducts,
        errors: [...errors, ...saveErrors]
      })

    } catch (error) {
      setResults({
        success: [],
        errors: [`Excel dosyası okunamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`]
      })
    }

    setIsProcessing(false)
  }

  const inferCategory = (productName: string): string => {
    const name = productName.toLowerCase()
    if (name.includes('panel') || name.includes('solar')) return 'Solar Panel'
    if (name.includes('inverter') || name.includes('evirici')) return 'İnverter'
    if (name.includes('batarya') || name.includes('battery')) return 'Batarya'
    if (name.includes('kablo') || name.includes('cable')) return 'Kablo'
    if (name.includes('montaj') || name.includes('bracket')) return 'Montaj Sistemleri'
    return 'Genel'
  }

  const resetForm = () => {
    setFile(null)
    setResults(null)
    setProgress(0)
    setIsProcessing(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bayi Excel İçe Aktarma</h1>
          <p className="text-muted-foreground">VENTA Excel dosyalarını sisteme aktarın</p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Excel Dosyası Yükle
            </CardTitle>
            <CardDescription>
              VENTA formatında Excel dosyanızı seçin (.xlsx, .xls)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="excel-file">Dosya Seç</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                disabled={isProcessing}
              />
            </div>

            {file && (
              <Alert>
                <FileSpreadsheet className="h-4 w-4" />
                <AlertDescription>
                  Seçilen dosya: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                </AlertDescription>
              </Alert>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">İşleniyor... {progress}%</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={processExcelFile}
                disabled={!file || isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? 'İşleniyor...' : 'İçe Aktar'}
              </Button>
              {(file || results) && (
                <Button variant="outline" onClick={resetForm} disabled={isProcessing}>
                  <X className="w-4 h-4 mr-2" />
                  Temizle
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {results.success.length > 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                İçe Aktarma Sonuçları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.success.length > 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <strong>✅ {results.success.length} ürün başarıyla eklendi!</strong>
                    <ul className="mt-2 space-y-1">
                      {results.success.slice(0, 5).map((product, index) => (
                        <li key={index} className="text-sm">• {product.name}</li>
                      ))}
                      {results.success.length > 5 && (
                        <li className="text-sm text-muted-foreground">...ve {results.success.length - 5} ürün daha</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {results.errors.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <strong>❌ {results.errors.length} hata oluştu:</strong>
                    <ul className="mt-2 space-y-1">
                      {results.errors.slice(0, 5).map((error, index) => (
                        <li key={index} className="text-sm">• {error}</li>
                      ))}
                      {results.errors.length > 5 && (
                        <li className="text-sm text-muted-foreground">...ve {results.errors.length - 5} hata daha</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Kullanım Talimatları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Desteklenen Sütun Adları:</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Ürün:</strong> TANIM, Ürün Adı, Name</li>
                  <li>• <strong>Kod:</strong> KOD, Ürün Kodu, Code</li>
                  <li>• <strong>Fiyat:</strong> BİRİM, Fiyat, Price</li>
                  <li>• <strong>USD:</strong> NET, USD</li>
                  <li>• <strong>Stok:</strong> STOK, Stock</li>
                  <li>• <strong>Diğer:</strong> MARKA, MODEL, GÜÇ, GARANTİ</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Otomatik Özellikler:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Kategori otomatik belirlenir</li>
                  <li>• Eksik kodlar otomatik oluşturulur</li>
                  <li>• USD fiyat TL'ye çevrilir</li>
                  <li>• Güç değeri ürün adından çıkarılır</li>
                  <li>• Hatalı satırlar atlanır</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}