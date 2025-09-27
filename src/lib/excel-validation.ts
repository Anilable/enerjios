import { z } from 'zod'
import { ColumnMapping, ValidationError, ImportPreview } from '@/types/excel-mapper'
import { transformValue } from './excel-parser'

const productSchema = z.object({
  name: z.string().min(1, 'Ürün adı gerekli'),
  code: z.string().min(1, 'Ürün kodu gerekli'),
  category: z.string().min(1, 'Kategori gerekli'),
  brand: z.string().min(1, 'Marka gerekli'),
  model: z.string().min(1, 'Model gerekli'),
  price: z.number().positive('Fiyat pozitif olmalı'),
  usdPrice: z.number().positive().optional().nullable(),
  stock: z.number().min(0).optional().nullable(),
  power: z.number().positive().optional().nullable(),
  warranty: z.number().min(0).optional().nullable(),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable()
})

export function validateRow(
  rowData: any[],
  rowIndex: number,
  mappings: ColumnMapping[]
): { data: any; errors: ValidationError[] } {
  const errors: ValidationError[] = []
  const mappedData: any = {}

  for (const mapping of mappings) {
    const rawValue = rowData[mapping.excelIndex]
    const transformedValue = transformValue(
      rawValue,
      mapping.dataType,
      mapping.systemField,
      mapping.enumValues
    )

    mappedData[mapping.systemField] = transformedValue

    if (mapping.required && (transformedValue === null || transformedValue === '')) {
      errors.push({
        row: rowIndex,
        column: mapping.excelColumn,
        field: mapping.systemField,
        message: `${mapping.excelColumn} boş olamaz`,
        severity: 'error'
      })
    }

    if (mapping.dataType === 'number' && transformedValue !== null && isNaN(transformedValue)) {
      errors.push({
        row: rowIndex,
        column: mapping.excelColumn,
        field: mapping.systemField,
        message: `${mapping.excelColumn} geçerli bir sayı değil`,
        severity: 'error'
      })
    }

    if (mapping.dataType === 'enum' && transformedValue === null && rawValue) {
      errors.push({
        row: rowIndex,
        column: mapping.excelColumn,
        field: mapping.systemField,
        message: `"${rawValue}" geçerli bir ${mapping.excelColumn} değeri değil`,
        severity: 'warning'
      })
    }
  }

  try {
    productSchema.parse(mappedData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.issues.forEach(err => {
        const existingError = errors.find(
          e => e.field === err.path[0] && e.row === rowIndex
        )
        if (!existingError) {
          errors.push({
            row: rowIndex,
            column: err.path[0] as string,
            field: err.path[0] as string,
            message: err.message,
            severity: 'error'
          })
        }
      })
    }
  }

  return { data: mappedData, errors }
}

export function validateImport(
  data: any[][],
  mappings: ColumnMapping[],
  startRow: number,
  endRow: number,
  excludedRows: Set<number>
): ImportPreview {
  const allErrors: ValidationError[] = []
  const mappedData: Record<string, any>[] = []
  let validRows = 0
  let invalidRows = 0

  for (let i = startRow; i <= endRow; i++) {
    if (excludedRows.has(i)) continue

    const row = data[i]
    if (!row || row.every(cell => !cell)) continue

    const { data: rowData, errors } = validateRow(row, i, mappings)

    if (errors.filter(e => e.severity === 'error').length === 0) {
      validRows++
      mappedData.push(rowData)
    } else {
      invalidRows++
    }

    allErrors.push(...errors)
  }

  const warnings = allErrors.filter(e => e.severity === 'warning').length

  return {
    totalRows: endRow - startRow + 1 - excludedRows.size,
    validRows,
    invalidRows,
    warnings,
    errors: allErrors,
    mappedData
  }
}

export function checkDuplicates(
  mappedData: Record<string, any>[],
  field: string
): Set<string> {
  const seen = new Map<string, number>()
  const duplicates = new Set<string>()

  mappedData.forEach(item => {
    const value = item[field]
    if (value) {
      const count = seen.get(value) || 0
      seen.set(value, count + 1)
      if (count > 0) {
        duplicates.add(value)
      }
    }
  })

  return duplicates
}

export function formatValidationMessage(error: ValidationError): string {
  const rowNum = error.row + 1
  return `Satır ${rowNum}: ${error.message}`
}

export function groupErrorsByType(errors: ValidationError[]): Record<string, ValidationError[]> {
  const grouped: Record<string, ValidationError[]> = {
    missing_required: [],
    invalid_type: [],
    invalid_value: [],
    duplicates: [],
    warnings: []
  }

  errors.forEach(error => {
    if (error.severity === 'warning') {
      grouped.warnings.push(error)
    } else if (error.message.includes('boş olamaz')) {
      grouped.missing_required.push(error)
    } else if (error.message.includes('geçerli bir sayı değil')) {
      grouped.invalid_type.push(error)
    } else if (error.message.includes('duplicate') || error.message.includes('tekrar')) {
      grouped.duplicates.push(error)
    } else {
      grouped.invalid_value.push(error)
    }
  })

  return grouped
}