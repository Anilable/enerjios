'use client'

import React, { useState } from 'react'
import { ImportPreview, ValidationError } from '@/types/excel-mapper'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Download,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { groupErrorsByType, formatValidationMessage } from '@/lib/excel-validation'

interface ValidationResultsProps {
  preview: ImportPreview
  onProceed: () => void
  onBack: () => void
  isImporting?: boolean
  className?: string
}

export function ValidationResults({
  preview,
  onProceed,
  onBack,
  isImporting = false,
  className
}: ValidationResultsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [showPreview, setShowPreview] = useState(false)

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const groupedErrors = groupErrorsByType(preview.errors)
  const hasErrors = preview.errors.filter(e => e.severity === 'error').length > 0
  const validationScore = Math.round(
    (preview.validRows / preview.totalRows) * 100
  )

  const exportErrors = () => {
    const csv = [
      ['Satır', 'Sütun', 'Alan', 'Mesaj', 'Önem'].join(','),
      ...preview.errors.map(e =>
        [e.row + 1, e.column, e.field, e.message, e.severity].join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'validation-errors.csv'
    link.click()
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Doğrulama Sonuçları</h3>
          <Badge
            variant={hasErrors ? "destructive" : "secondary"}
            className={cn(
              hasErrors
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            )}
          >
            {hasErrors ? "Hatalar Var" : "Başarılı"}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Doğrulama Skoru</span>
            <span className="font-medium">{validationScore}%</span>
          </div>
          <Progress
            value={validationScore}
            className={cn(
              "h-3",
              validationScore === 100 && "bg-green-100",
              validationScore >= 80 && validationScore < 100 && "bg-yellow-100",
              validationScore < 80 && "bg-red-100"
            )}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <FileText className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-2xl font-bold">{preview.totalRows}</span>
            <span className="text-xs text-gray-500">Toplam Satır</span>
          </div>

          <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle2 className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-2xl font-bold text-green-600">
              {preview.validRows}
            </span>
            <span className="text-xs text-gray-500">Geçerli Satır</span>
          </div>

          <div className="flex flex-col items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <XCircle className="w-8 h-8 text-red-600 mb-2" />
            <span className="text-2xl font-bold text-red-600">
              {preview.invalidRows}
            </span>
            <span className="text-xs text-gray-500">Hatalı Satır</span>
          </div>

          <div className="flex flex-col items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-yellow-600 mb-2" />
            <span className="text-2xl font-bold text-yellow-600">
              {preview.warnings}
            </span>
            <span className="text-xs text-gray-500">Uyarı</span>
          </div>
        </div>
      </div>

      {/* Error Details */}
      {preview.errors.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Hata Detayları</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={exportErrors}
              >
                <Download className="w-4 h-4 mr-2" />
                CSV İndir
              </Button>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Object.entries(groupedErrors).map(([type, errors]) => {
              if (errors.length === 0) return null

              const isExpanded = expandedSections.has(type)
              const typeLabels: Record<string, { label: string; icon: any; color: string }> = {
                missing_required: {
                  label: 'Eksik Zorunlu Alanlar',
                  icon: XCircle,
                  color: 'text-red-600'
                },
                invalid_type: {
                  label: 'Geçersiz Veri Tipi',
                  icon: AlertTriangle,
                  color: 'text-orange-600'
                },
                invalid_value: {
                  label: 'Geçersiz Değerler',
                  icon: AlertTriangle,
                  color: 'text-orange-600'
                },
                duplicates: {
                  label: 'Tekrarlanan Değerler',
                  icon: AlertTriangle,
                  color: 'text-yellow-600'
                },
                warnings: {
                  label: 'Uyarılar',
                  icon: AlertTriangle,
                  color: 'text-yellow-600'
                }
              }

              const typeInfo = typeLabels[type] || {
                label: type,
                icon: AlertTriangle,
                color: 'text-gray-600'
              }

              const Icon = typeInfo.icon

              return (
                <div key={type}>
                  <button
                    onClick={() => toggleSection(type)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={cn("w-5 h-5", typeInfo.color)} />
                      <span className="font-medium">{typeInfo.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {errors.length}
                      </Badge>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900">
                      <div className="space-y-1">
                        {errors.slice(0, 10).map((error, index) => (
                          <div
                            key={index}
                            className="text-sm py-1 flex items-center space-x-2"
                          >
                            <span className="text-gray-500">•</span>
                            <span>{formatValidationMessage(error)}</span>
                          </div>
                        ))}
                        {errors.length > 10 && (
                          <div className="text-sm text-gray-500 italic">
                            ve {errors.length - 10} hata daha...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Data Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-gray-400" />
            <span className="font-medium">Veri Önizleme</span>
            <Badge variant="secondary" className="text-xs">
              {preview.mappedData.length} kayıt
            </Badge>
          </div>
          {showPreview ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {showPreview && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900">
                    {preview.mappedData.length > 0 &&
                      Object.keys(preview.mappedData[0]).map(key => (
                        <th key={key} className="p-2 text-left font-medium">
                          {key}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.mappedData.slice(0, 5).map((row, index) => (
                    <tr
                      key={index}
                      className="border-t border-gray-100 dark:border-gray-700"
                    >
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} className="p-2">
                          <div className="truncate max-w-[150px]">
                            {String(value || '-')}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.mappedData.length > 5 && (
                <div className="mt-2 text-center text-sm text-gray-500">
                  ve {preview.mappedData.length - 5} kayıt daha...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isImporting}
        >
          Geri Dön
        </Button>

        <div className="flex items-center space-x-3">
          {hasErrors && (
            <span className="text-sm text-red-600">
              Hataları düzeltmeden devam edilemez
            </span>
          )}
          <Button
            onClick={onProceed}
            disabled={hasErrors || isImporting || preview.mappedData.length === 0}
            className={cn(
              hasErrors
                ? "bg-gray-400"
                : "bg-green-600 hover:bg-green-700"
            )}
          >
            {isImporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                İçe Aktarılıyor...
              </>
            ) : (
              `${preview.mappedData.length} Ürünü İçe Aktar`
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}