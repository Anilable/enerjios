'use client'

import React, { useState, useEffect } from 'react'
import { ExcelData, SheetData, ColumnMapping, ImportPreview, PRODUCT_SYSTEM_FIELDS } from '@/types/excel-mapper'
import { ExcelUpload } from './ExcelUpload'
import { ExcelPreview } from './ExcelPreview'
import { ColumnMapper } from './ColumnMapper'
import { ValidationResults } from './ValidationResults'
import { parseExcelFile, autoMapColumns } from '@/lib/excel-parser'
import { validateImport } from '@/lib/excel-validation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  FileSpreadsheet,
  Upload,
  Table,
  Link2,
  CheckCircle,
  ArrowRight,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface ExcelMapperProps {
  onImport: (data: Record<string, any>[]) => Promise<void>
  systemFields?: typeof PRODUCT_SYSTEM_FIELDS
  className?: string
  onClose?: () => void
}

type Step = 'upload' | 'preview' | 'mapping' | 'validation' | 'importing' | 'complete'

const STEPS: { id: Step; label: string; icon: any }[] = [
  { id: 'upload', label: 'Dosya Yükle', icon: Upload },
  { id: 'preview', label: 'Veri Önizleme', icon: Table },
  { id: 'mapping', label: 'Sütun Eşleştirme', icon: Link2 },
  { id: 'validation', label: 'Doğrulama', icon: CheckCircle }
]

export function ExcelMapper({
  onImport,
  systemFields = PRODUCT_SYSTEM_FIELDS,
  className,
  onClose
}: ExcelMapperProps) {
  const [currentStep, setCurrentStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [excelData, setExcelData] = useState<ExcelData | null>(null)
  const [mappings, setMappings] = useState<ColumnMapping[]>([])
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const { toast } = useToast()

  const handleFileSelect = async (selectedFile: File) => {
    try {
      setFile(selectedFile)
      const data = await parseExcelFile(selectedFile)
      setExcelData(data)
      setCurrentStep('preview')

      toast({
        title: 'Dosya yüklendi',
        description: `${data.sheets.length} sayfa bulundu`,
      })
    } catch (error) {
      console.error('Error parsing file:', error)
      toast({
        title: 'Hata',
        description: 'Dosya okunamadı. Lütfen geçerli bir Excel dosyası seçin.',
        variant: 'destructive'
      })
    }
  }

  const handleSheetChange = (index: number) => {
    if (excelData) {
      setExcelData({ ...excelData, activeSheet: index })
      setMappings([])
    }
  }

  const handleHeaderRowChange = (row: number) => {
    if (excelData) {
      const sheets = [...excelData.sheets]
      const sheet = sheets[excelData.activeSheet]
      sheet.headerRow = row
      sheet.headers = sheet.data[row]?.map(h => String(h || '').trim()) || []
      sheet.startRow = row + 1
      setExcelData({ ...excelData, sheets })
    }
  }

  const handleRangeChange = (start: number, end: number) => {
    if (excelData) {
      const sheets = [...excelData.sheets]
      const sheet = sheets[excelData.activeSheet]
      sheet.startRow = start
      sheet.endRow = end
      setExcelData({ ...excelData, sheets })
    }
  }

  const handleRowToggle = (row: number) => {
    if (excelData) {
      const sheets = [...excelData.sheets]
      const sheet = sheets[excelData.activeSheet]
      const excludedRows = new Set(sheet.excludedRows)

      if (excludedRows.has(row)) {
        excludedRows.delete(row)
      } else {
        excludedRows.add(row)
      }

      sheet.excludedRows = excludedRows
      setExcelData({ ...excelData, sheets })
    }
  }

  const handleBulkToggle = (rows: number[], exclude: boolean) => {
    if (excelData) {
      const sheets = [...excelData.sheets]
      const sheet = sheets[excelData.activeSheet]
      const excludedRows = new Set(sheet.excludedRows)

      rows.forEach(row => {
        if (exclude) {
          excludedRows.add(row)
        } else {
          excludedRows.delete(row)
        }
      })

      sheet.excludedRows = excludedRows
      setExcelData({ ...excelData, sheets })
    }
  }

  const handleProceedToMapping = () => {
    if (excelData) {
      const sheet = excelData.sheets[excelData.activeSheet]
      const autoMappings = autoMapColumns(sheet.headers, systemFields)
      setMappings(autoMappings)
      setCurrentStep('mapping')
    }
  }

  const handleValidate = () => {
    if (excelData) {
      const sheet = excelData.sheets[excelData.activeSheet]
      const preview = validateImport(
        sheet.data,
        mappings,
        sheet.startRow,
        sheet.endRow,
        sheet.excludedRows
      )
      setImportPreview(preview)
      setCurrentStep('validation')
    }
  }

  const handleImport = async () => {
    if (!importPreview) return

    setIsImporting(true)
    setCurrentStep('importing')

    try {
      await onImport(importPreview.mappedData)

      setCurrentStep('complete')
      toast({
        title: 'Başarılı',
        description: `${importPreview.mappedData.length} ürün başarıyla içe aktarıldı`,
      })

      setTimeout(() => {
        onClose?.()
      }, 2000)
    } catch (error) {
      console.error('Import error:', error)
      toast({
        title: 'Hata',
        description: 'İçe aktarma sırasında bir hata oluştu',
        variant: 'destructive'
      })
      setCurrentStep('validation')
    } finally {
      setIsImporting(false)
    }
  }

  const getStepIndex = (step: Step) => {
    return STEPS.findIndex(s => s.id === step)
  }

  const currentStepIndex = getStepIndex(currentStep)

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Excel İçe Aktarma</h2>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center space-x-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStepIndex
            const isCompleted = index < currentStepIndex

            return (
              <React.Fragment key={step.id}>
                <div
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                    isActive && "bg-blue-100 dark:bg-blue-900/30",
                    isCompleted && "text-green-600",
                    !isActive && !isCompleted && "text-gray-400"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{step.label}</span>
                  {step.id === 'mapping' && isActive && (
                    <span className="text-xs bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded">
                      {mappings.length}/{systemFields.length}
                    </span>
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Progress Bar for Mapping */}
        {currentStep === 'mapping' && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Eşleştirme İlerlemesi</span>
              <span>{mappings.length} / {systemFields.length} alan</span>
            </div>
            <Progress
              value={(mappings.length / systemFields.length) * 100}
              className="h-2"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
        {currentStep === 'upload' && (
          <ExcelUpload
            onFileSelect={handleFileSelect}
            selectedFile={file}
            onClear={() => {
              setFile(null)
              setExcelData(null)
            }}
          />
        )}

        {currentStep === 'preview' && excelData && (
          <>
            <ExcelPreview
              sheets={excelData.sheets}
              activeSheet={excelData.activeSheet}
              onSheetChange={handleSheetChange}
              onHeaderRowChange={handleHeaderRowChange}
              onRangeChange={handleRangeChange}
              onRowToggle={handleRowToggle}
              onBulkToggle={handleBulkToggle}
            />
            <div className="mt-6 flex justify-end">
              <Button onClick={handleProceedToMapping}>
                Sütun Eşleştirmeye Geç
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}

        {currentStep === 'mapping' && excelData && (
          <>
            <ColumnMapper
              excelHeaders={excelData.sheets[excelData.activeSheet].headers}
              systemFields={systemFields}
              mappings={mappings}
              onMappingChange={setMappings}
            />
            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('preview')}
              >
                Geri
              </Button>
              <Button
                onClick={handleValidate}
                disabled={
                  systemFields
                    .filter(f => f.required)
                    .some(f => !mappings.find(m => m.systemField === f.id))
                }
              >
                Doğrulamaya Geç
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}

        {currentStep === 'validation' && importPreview && (
          <ValidationResults
            preview={importPreview}
            onProceed={handleImport}
            onBack={() => setCurrentStep('mapping')}
            isImporting={isImporting}
          />
        )}

        {currentStep === 'importing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg font-medium">Veriler içe aktarılıyor...</p>
            <p className="text-sm text-gray-500 mt-2">
              Lütfen bekleyin, bu işlem birkaç dakika sürebilir.
            </p>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
            <p className="text-lg font-medium">İçe aktarma tamamlandı!</p>
            <p className="text-sm text-gray-500 mt-2">
              {importPreview?.mappedData.length} ürün başarıyla içe aktarıldı.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}