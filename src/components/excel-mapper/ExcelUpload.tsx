'use client'

import React, { useCallback } from 'react'
import { Upload, FileSpreadsheet, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ExcelUploadProps {
  onFileSelect: (file: File) => void
  selectedFile?: File | null
  onClear?: () => void
  className?: string
}

export function ExcelUpload({
  onFileSelect,
  selectedFile,
  onClear,
  className
}: ExcelUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()

      const files = Array.from(e.dataTransfer.files)
      const excelFile = files.find(
        file =>
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') ||
          file.name.endsWith('.xls')
      )

      if (excelFile) {
        onFileSelect(excelFile)
      }
    },
    [onFileSelect]
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="relative"
        >
          <input
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={handleFileInput}
            className="hidden"
            id="excel-upload"
          />
          <label
            htmlFor="excel-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-4 text-gray-500 dark:text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Excel dosyasını buraya sürükleyin</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                veya dosya seçmek için tıklayın
              </p>
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                XLSX, XLS (MAX. 10MB)
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          {onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}