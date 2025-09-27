'use client'

import React, { useState, useEffect } from 'react'
import { SheetData } from '@/types/excel-mapper'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Table, FileSpreadsheet, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { detectEmptyRows } from '@/lib/excel-parser'

interface ExcelPreviewProps {
  sheets: SheetData[]
  activeSheet: number
  onSheetChange: (index: number) => void
  onHeaderRowChange: (row: number) => void
  onRangeChange: (start: number, end: number) => void
  onRowToggle: (row: number) => void
  onBulkToggle: (rows: number[], exclude: boolean) => void
  className?: string
}

export function ExcelPreview({
  sheets,
  activeSheet,
  onSheetChange,
  onHeaderRowChange,
  onRangeChange,
  onRowToggle,
  onBulkToggle,
  className
}: ExcelPreviewProps) {
  const [showExcluded, setShowExcluded] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  const currentSheet = sheets[activeSheet]
  const { data, headerRow, startRow, endRow, excludedRows } = currentSheet

  useEffect(() => {
    const emptyRows = detectEmptyRows(data, startRow, endRow)
    if (emptyRows.length > 0) {
      onBulkToggle(emptyRows, true)
    }
  }, [data, startRow, endRow])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allRows = new Set<number>()
      for (let i = startRow; i <= endRow; i++) {
        if (!excludedRows.has(i) || showExcluded) {
          allRows.add(i)
        }
      }
      setSelectedRows(allRows)
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleRowSelect = (row: number, checked: boolean) => {
    const newSelection = new Set(selectedRows)
    if (checked) {
      newSelection.add(row)
    } else {
      newSelection.delete(row)
    }
    setSelectedRows(newSelection)
  }

  const handleBulkAction = (action: 'exclude' | 'include') => {
    const rows = Array.from(selectedRows)
    onBulkToggle(rows, action === 'exclude')
    setSelectedRows(new Set())
  }

  const filteredData = data.filter((row, index) => {
    if (index < startRow || index > endRow) return false
    if (!showExcluded && excludedRows.has(index)) return false
    if (searchTerm) {
      return row.some(cell =>
        String(cell || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return true
  })

  const maxRows = Math.min(data.length - 1, 100)

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sheet Selection */}
          <div>
            <label className="text-sm font-medium mb-1 block">Excel Sayfası</label>
            <Select
              value={activeSheet.toString()}
              onValueChange={(value) => onSheetChange(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sheets.map((sheet, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    <div className="flex items-center space-x-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{sheet.name}</span>
                      <span className="text-xs text-gray-500">
                        ({sheet.data.length} satır)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Header Row Selection */}
          <div>
            <label className="text-sm font-medium mb-1 block">Başlık Satırı</label>
            <Select
              value={headerRow.toString()}
              onValueChange={(value) => onHeaderRowChange(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {data.slice(0, Math.min(10, data.length)).map((row, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    Satır {index + 1}: {row.slice(0, 3).join(', ')}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Row */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Başlangıç Satırı: {startRow + 1}
            </label>
            <Slider
              value={[startRow]}
              min={headerRow + 1}
              max={maxRows}
              step={1}
              onValueChange={([value]) => onRangeChange(value, endRow)}
              className="w-full"
            />
          </div>

          {/* End Row */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Bitiş Satırı: {endRow + 1}
            </label>
            <Slider
              value={[endRow]}
              min={startRow}
              max={data.length - 1}
              step={1}
              onValueChange={([value]) => onRangeChange(startRow, value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Tabloda ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 text-sm border rounded-md"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExcluded(!showExcluded)}
            >
              {showExcluded ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hariç Tutulanları Gizle
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Hariç Tutulanları Göster
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {selectedRows.size} satır seçildi
            </span>
            {selectedRows.size > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('exclude')}
                >
                  Hariç Tut
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('include')}
                >
                  Dahil Et
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <th className="p-2 text-left">
                  <Checkbox
                    checked={selectedRows.size > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Durum</th>
                {data[headerRow]?.map((header, index) => (
                  <th key={index} className="p-2 text-left min-w-[120px]">
                    {header || `Sütun ${index + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 50).map((row, rowIndex) => {
                const actualIndex = data.indexOf(row)
                const isExcluded = excludedRows.has(actualIndex)
                const isSelected = selectedRows.has(actualIndex)

                return (
                  <tr
                    key={actualIndex}
                    className={cn(
                      "border-t border-gray-100 dark:border-gray-700",
                      isExcluded && "bg-red-50 dark:bg-red-900/20 opacity-60",
                      isSelected && "bg-blue-50 dark:bg-blue-900/20"
                    )}
                  >
                    <td className="p-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleRowSelect(actualIndex, checked as boolean)
                        }
                      />
                    </td>
                    <td className="p-2 text-gray-500">{actualIndex + 1}</td>
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => onRowToggle(actualIndex)}
                      >
                        {isExcluded ? (
                          <span className="text-red-600">Hariç</span>
                        ) : (
                          <span className="text-green-600">Dahil</span>
                        )}
                      </Button>
                    </td>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="p-2">
                        <div className="truncate max-w-[200px]" title={String(cell || '')}>
                          {cell || '-'}
                        </div>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredData.length > 50 && (
          <div className="p-3 text-center text-sm text-gray-500 bg-gray-50 dark:bg-gray-900">
            {filteredData.length - 50} satır daha var...
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div>
          Toplam: {endRow - startRow + 1} satır
        </div>
        <div>
          Dahil: {endRow - startRow + 1 - excludedRows.size} satır
        </div>
        <div>
          Hariç: {excludedRows.size} satır
        </div>
      </div>
    </div>
  )
}