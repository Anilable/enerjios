'use client'

import React, { useState, useEffect } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ColumnMapping, SystemField } from '@/types/excel-mapper'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Link2,
  Unlink,
  RefreshCw,
  Check,
  AlertCircle,
  Info,
  Columns,
  Database
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { autoMapColumns } from '@/lib/excel-parser'

interface ColumnMapperProps {
  excelHeaders: string[]
  systemFields: SystemField[]
  mappings: ColumnMapping[]
  onMappingChange: (mappings: ColumnMapping[]) => void
  className?: string
}

const ItemTypes = {
  EXCEL_COLUMN: 'excelColumn',
  SYSTEM_FIELD: 'systemField'
}

interface ExcelColumnItemProps {
  header: string
  index: number
  mapped: boolean
  mappedTo?: string
}

function ExcelColumnItem({ header, index, mapped, mappedTo }: ExcelColumnItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.EXCEL_COLUMN,
    item: { header, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))

  return (
    <div
      ref={drag as any}
      className={cn(
        "p-3 bg-white dark:bg-gray-800 rounded-lg border cursor-move transition-all",
        isDragging && "opacity-50",
        mapped
          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
          : "border-gray-200 dark:border-gray-700 hover:border-blue-400"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Columns className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{header || `Sütun ${index + 1}`}</span>
        </div>
        {mapped && (
          <Badge variant="secondary" className="text-xs">
            {mappedTo}
          </Badge>
        )}
      </div>
    </div>
  )
}

interface SystemFieldItemProps {
  field: SystemField
  mapped: boolean
  mappedFrom?: string
  onDrop: (excelHeader: string, excelIndex: number) => void
  onUnmap: () => void
}

function SystemFieldItem({ field, mapped, mappedFrom, onDrop, onUnmap }: SystemFieldItemProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.EXCEL_COLUMN,
    drop: (item: { header: string; index: number }) => {
      onDrop(item.header, item.index)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }))

  return (
    <div
      ref={drop as any}
      className={cn(
        "p-3 bg-white dark:bg-gray-800 rounded-lg border transition-all",
        isOver && "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
        mapped
          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
          : field.required
          ? "border-orange-400"
          : "border-gray-200 dark:border-gray-700"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{field.label}</span>
          {field.required && (
            <Badge variant="destructive" className="text-xs">Zorunlu</Badge>
          )}
        </div>
        {mapped && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onUnmap}
          >
            <Unlink className="w-3 h-3" />
          </Button>
        )}
      </div>

      {mapped ? (
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <Link2 className="w-3 h-3" />
          <span>{mappedFrom}</span>
        </div>
      ) : (
        <div className="text-xs text-gray-500">
          {field.description}
        </div>
      )}

      {field.example && (
        <div className="mt-1 text-xs text-gray-400">
          Örnek: {field.example}
        </div>
      )}
    </div>
  )
}

function ColumnMapperContent({
  excelHeaders,
  systemFields,
  mappings,
  onMappingChange,
  className
}: ColumnMapperProps) {
  const [localMappings, setLocalMappings] = useState<ColumnMapping[]>(mappings)

  useEffect(() => {
    setLocalMappings(mappings)
  }, [mappings])

  const handleAutoMap = () => {
    console.log('Auto mapping started with headers:', excelHeaders)
    const autoMappings = autoMapColumns(excelHeaders, systemFields)
    console.log('Auto mappings result:', autoMappings)
    setLocalMappings(autoMappings)
    onMappingChange(autoMappings)
  }

  const handleClearMappings = () => {
    setLocalMappings([])
    onMappingChange([])
  }

  const handleMap = (
    systemFieldId: string,
    excelHeader: string,
    excelIndex: number
  ) => {
    console.log('Mapping:', systemFieldId, 'to', excelHeader, 'at index', excelIndex)

    const systemField = systemFields.find(f => f.id === systemFieldId)
    if (!systemField) {
      console.log('System field not found:', systemFieldId)
      return
    }

    // Remove any existing mapping for this system field (one-to-one mapping)
    const filteredMappings = localMappings.filter(
      m => m.systemField !== systemFieldId
    )

    // Also remove any existing mapping for this excel column if it exists
    const finalFilteredMappings = filteredMappings.filter(
      m => m.excelIndex !== excelIndex
    )

    const newMapping = {
      excelColumn: excelHeader,
      excelIndex,
      systemField: systemFieldId,
      required: systemField.required,
      dataType: systemField.dataType,
      enumValues: systemField.enumValues
    }

    const newMappings = [...finalFilteredMappings, newMapping]
    console.log('Previous mappings:', localMappings)
    console.log('New mapping created:', newMapping)
    console.log('Final mappings:', newMappings)

    setLocalMappings(newMappings)
    onMappingChange(newMappings)
  }

  const handleUnmap = (systemFieldId: string) => {
    const newMappings = localMappings.filter(m => m.systemField !== systemFieldId)
    setLocalMappings(newMappings)
    onMappingChange(newMappings)
  }

  const getMappedSystemField = (excelIndex: number) => {
    const mapping = localMappings.find(m => m.excelIndex === excelIndex)
    if (mapping) {
      const field = systemFields.find(f => f.id === mapping.systemField)
      return field?.label
    }
    return undefined
  }

  const getMappedExcelColumn = (systemFieldId: string) => {
    const mapping = localMappings.find(m => m.systemField === systemFieldId)
    return mapping?.excelColumn
  }

  const requiredFields = systemFields.filter(f => f.required)
  const requiredFieldsMapped = requiredFields.every(f =>
    localMappings.some(m => m.systemField === f.id)
  )

  const mappedCount = localMappings.length
  const totalFields = systemFields.length

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleAutoMap}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Otomatik Eşleştir</span>
            </Button>
            <Button
              variant="ghost"
              onClick={handleClearMappings}
              disabled={localMappings.length === 0}
            >
              Tümünü Temizle
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {requiredFieldsMapped ? (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Check className="w-3 h-3 mr-1" />
                Zorunlu alanlar eşleştirildi
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                <AlertCircle className="w-3 h-3 mr-1" />
                Zorunlu alanlar eksik
              </Badge>
            )}
            <span className="text-sm text-gray-500">
              {mappedCount} / {totalFields} alan eşleştirildi
            </span>
          </div>
        </div>
      </div>

      {/* Mapping Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Excel Columns */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <Columns className="w-5 h-5" />
              <span>Excel Sütunları</span>
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {excelHeaders.map((header, index) => (
                <ExcelColumnItem
                  key={index}
                  header={header}
                  index={index}
                  mapped={localMappings.some(m => m.excelIndex === index)}
                  mappedTo={getMappedSystemField(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden lg:flex items-center justify-center">
          <ArrowRight className="w-8 h-8 text-gray-400" />
        </div>

        {/* System Fields */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Sistem Alanları</span>
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {systemFields.map((field) => (
                <SystemFieldItem
                  key={field.id}
                  field={field}
                  mapped={localMappings.some(m => m.systemField === field.id)}
                  mappedFrom={getMappedExcelColumn(field.id)}
                  onDrop={(header, index) => handleMap(field.id, header, index)}
                  onUnmap={() => handleUnmap(field.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-900 dark:text-blue-200">
          <p className="font-medium mb-1">Nasıl kullanılır?</p>
          <ul className="space-y-1 text-xs">
            <li>• Excel sütunlarını sürükleyerek sistem alanlarına bırakın</li>
            <li>• Otomatik eşleştirme için "Otomatik Eşleştir" butonunu kullanın</li>
            <li>• Zorunlu alanlar turuncu çerçeve ile işaretlidir</li>
            <li>• Eşleşmeyi kaldırmak için bağlantı simgesine tıklayın</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export function ColumnMapper(props: ColumnMapperProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <ColumnMapperContent {...props} />
    </DndProvider>
  )
}