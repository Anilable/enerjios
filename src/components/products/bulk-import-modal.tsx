'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle,
  X, File, Loader2, MapPin, RefreshCw, Info
} from 'lucide-react'
import { DataImportService, DataExportService, ImportResult } from '@/lib/data-import-export'
import { ProductCategoryManager } from '@/lib/product-categories'

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: (result: ImportResult) => void
}

export function BulkImportModal({ isOpen, onClose, onImportComplete }: BulkImportModalProps) {
  const [activeTab, setActiveTab] = useState('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
  const [detectedColumns, setDetectedColumns] = useState<string[]>([])
  const [previewData, setPreviewData] = useState<any[]>([])

  const categories = ProductCategoryManager.getCategories()

  // Standard field mappings for different file types
  const standardFields = [
    { key: 'name', label: 'Ürün Adı', required: true },
    { key: 'brand', label: 'Marka', required: true },
    { key: 'model', label: 'Model', required: false },
    { key: 'categoryId', label: 'Kategori ID', required: true },
    { key: 'description', label: 'Açıklama', required: false },
    { key: 'pricing.basePrice', label: 'Fiyat', required: true },
    { key: 'inventory.sku', label: 'SKU', required: false },
    { key: 'inventory.stockQuantity', label: 'Stok Miktarı', required: false },
    { key: 'inventory.minimumStock', label: 'Minimum Stok', required: false },
    { key: 'inventory.location', label: 'Konum', required: false },
    { key: 'inventory.supplier', label: 'Tedarikçi', required: false },
    { key: 'warranty.duration', label: 'Garanti Süresi', required: false },
    { key: 'certifications', label: 'Sertifikalar', required: false }
  ]

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)

    // Parse file to detect columns and preview data
    try {
      const data = await parseFileForPreview(file)
      if (data.length > 0) {
        setDetectedColumns(Object.keys(data[0]))
        setPreviewData(data.slice(0, 5)) // First 5 rows for preview
        setActiveTab('mapping')
        
        // Auto-map obvious columns
        const autoMapping: Record<string, string> = {}
        Object.keys(data[0]).forEach(column => {
          const lowerColumn = column.toLowerCase()
          if (lowerColumn.includes('name') || lowerColumn.includes('ad')) {
            autoMapping[column] = 'name'
          } else if (lowerColumn.includes('brand') || lowerColumn.includes('marka')) {
            autoMapping[column] = 'brand'
          } else if (lowerColumn.includes('model')) {
            autoMapping[column] = 'model'
          } else if (lowerColumn.includes('price') || lowerColumn.includes('fiyat')) {
            autoMapping[column] = 'pricing.basePrice'
          } else if (lowerColumn.includes('sku')) {
            autoMapping[column] = 'inventory.sku'
          } else if (lowerColumn.includes('stock') || lowerColumn.includes('stok')) {
            autoMapping[column] = 'inventory.stockQuantity'
          }
        })
        setFieldMapping(autoMapping)
      }
    } catch (error) {
      console.error('Error parsing file:', error)
    }
  }

  const parseFileForPreview = async (file: File): Promise<any[]> => {
    // Use the same parsing logic from DataImportService
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    if (extension === 'csv') {
      return new Promise((resolve, reject) => {
        const Papa = require('papaparse')
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results: any) => resolve(results.data),
          error: (error: any) => reject(error)
        })
      })
    }
    // Add other file format handlers as needed
    return []
  }

  const updateFieldMapping = (sourceField: string, targetField: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [sourceField]: targetField
    }))
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10
          if (newProgress >= 90) {
            clearInterval(progressInterval)
          }
          return Math.min(newProgress, 90)
        })
      }, 500)

      const result = await DataImportService.importProducts(selectedFile, fieldMapping)
      
      clearInterval(progressInterval)
      setProgress(100)
      setImportResult(result)
      setActiveTab('result')
      
      setTimeout(() => {
        onImportComplete(result)
      }, 1000)

    } catch (error) {
      console.error('Import error:', error)
      setImportResult({
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errorCount: 1,
        errors: [{ row: 0, field: 'general', message: 'Import failed' }],
        duplicates: []
      })
      setActiveTab('result')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadTemplate = () => {
    const templateData = [
      {
        'Ürün Adı': 'Örnek Panel 400W',
        'Marka': 'Örnek Marka',
        'Model': 'EP400M',
        'Kategori ID': 'panels',
        'Açıklama': 'Yüksek verimli monokristal panel',
        'Fiyat': '1500',
        'SKU': 'PAN-ORN-EP400M',
        'Stok Miktarı': '100',
        'Minimum Stok': '20',
        'Konum': 'A-12-01',
        'Tedarikçi': 'Örnek Tedarikçi',
        'Garanti Süresi': '25',
        'Sertifikalar': 'CE,IEC 61215'
      }
    ]

    DataExportService.exportData(templateData, {
      format: 'xlsx',
      filename: 'product_import_template'
    })
  }

  const resetModal = () => {
    setSelectedFile(null)
    setImportResult(null)
    setProgress(0)
    setFieldMapping({})
    setDetectedColumns([])
    setPreviewData([])
    setActiveTab('upload')
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Toplu Ürün İçe Aktarımı</DialogTitle>
          <DialogDescription>
            Excel, CSV veya JSON dosyasından ürünleri içe aktarın
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upload">Dosya Seç</TabsTrigger>
              <TabsTrigger value="mapping" disabled={!selectedFile}>Alan Eşleştirme</TabsTrigger>
              <TabsTrigger value="preview" disabled={!selectedFile}>Önizleme</TabsTrigger>
              <TabsTrigger value="result" disabled={!importResult}>Sonuç</TabsTrigger>
            </TabsList>

            {/* File Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dosya Seçin</CardTitle>
                  <CardDescription>
                    Desteklenen formatlar: Excel (.xlsx), CSV (.csv), JSON (.json)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4">
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-sm font-medium text-primary">
                            Dosya seçmek için tıklayın
                          </span>
                          <Input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".xlsx,.csv,.json"
                            onChange={handleFileSelect}
                          />
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          veya dosyayı buraya sürükleyin
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedFile && (
                    <Alert>
                      <File className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{selectedFile.name}</strong> seçildi ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-between items-center">
                    <Button variant="outline" onClick={downloadTemplate}>
                      <Download className="w-4 h-4 mr-2" />
                      Şablon İndir
                    </Button>
                    
                    {selectedFile && (
                      <Button onClick={() => setActiveTab('mapping')}>
                        İleri: Alan Eşleştirme
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Category Reference */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Kategori ID Referansı</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {categories.map(category => (
                      <div key={category.id} className="flex justify-between">
                        <span>{category.name}:</span>
                        <code className="bg-gray-100 px-1 rounded">{category.id}</code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Field Mapping Tab */}
            <TabsContent value="mapping" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Alan Eşleştirme</CardTitle>
                  <CardDescription>
                    Dosyanızdaki kolonları sistem alanlarıyla eşleştirin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {standardFields.map(field => (
                      <div key={field.key} className="grid grid-cols-3 gap-4 items-center">
                        <div>
                          <Label className={field.required ? 'font-medium' : ''}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                        </div>
                        <div>
                          <Select
                            value={Object.keys(fieldMapping).find(key => fieldMapping[key] === field.key) || ''}
                            onValueChange={(sourceField) => {
                              if (sourceField) {
                                updateFieldMapping(sourceField, field.key)
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Kolon seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">-- Eşleştirme --</SelectItem>
                              {detectedColumns.map(column => (
                                <SelectItem key={column} value={column}>
                                  {column}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {field.required ? 'Zorunlu' : 'Opsiyonel'}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setActiveTab('upload')}>
                      Geri
                    </Button>
                    <Button onClick={() => setActiveTab('preview')}>
                      İleri: Önizleme
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Veri Önizleme</CardTitle>
                  <CardDescription>
                    İlk 5 satırın nasıl işleneceğini görün
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.values(fieldMapping).map(field => (
                          <TableHead key={field}>
                            {standardFields.find(f => f.key === field)?.label || field}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, index) => (
                        <TableRow key={index}>
                          {Object.entries(fieldMapping).map(([sourceField, targetField]) => (
                            <TableCell key={targetField}>
                              {row[sourceField] || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setActiveTab('mapping')}>
                      Geri
                    </Button>
                    <Button onClick={handleImport} disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          İçe Aktarılıyor...
                        </>
                      ) : (
                        'İçe Aktarımı Başlat'
                      )}
                    </Button>
                  </div>

                  {isProcessing && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">İlerleme</span>
                        <span className="text-sm">{progress}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Result Tab */}
            <TabsContent value="result" className="space-y-4">
              {importResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {importResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      İçe Aktarım {importResult.success ? 'Tamamlandı' : 'Başarısız'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {importResult.importedCount}
                          </div>
                          <div className="text-sm text-muted-foreground">İçe Aktarılan</div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {importResult.skippedCount}
                          </div>
                          <div className="text-sm text-muted-foreground">Atlanılan</div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {importResult.errorCount}
                          </div>
                          <div className="text-sm text-muted-foreground">Hatalı</div>
                        </div>
                      </Card>
                    </div>

                    {/* Errors */}
                    {importResult.errors.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-red-600">Hatalar:</h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {importResult.errors.map((error, index) => (
                            <div key={index} className="text-sm p-2 bg-red-50 rounded border">
                              <strong>Satır {error.row}:</strong> {error.field} - {error.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Duplicates */}
                    {importResult.duplicates.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-yellow-600">Dublikasyonlar:</h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {importResult.duplicates.map((dup, index) => (
                            <div key={index} className="text-sm p-2 bg-yellow-50 rounded border">
                              <strong>Satır {dup.row}:</strong> {dup.identifier} - {dup.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          {activeTab === 'result' ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetModal}>
                Yeni İçe Aktarım
              </Button>
              <Button onClick={handleClose}>
                Kapat
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              İptal
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}