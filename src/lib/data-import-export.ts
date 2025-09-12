import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export type ExportFormat = 'csv' | 'xlsx' | 'json'
export type DataType = 'customers' | 'projects' | 'quotes' | 'companies' | 'products' | 'analytics'

interface ValidationRule {
  required?: boolean
  type?: 'email' | 'number' | 'date' | 'string'
  minLength?: number
  maxLength?: number
}

type ValidationRules = Record<string, ValidationRule>

interface ExportOptions {
  format: ExportFormat
  filename?: string
  dateRange?: {
    startDate: string
    endDate: string
  }
  filters?: Record<string, any>
  columns?: string[]
}

interface ImportOptions {
  dataType: DataType
  file: File
  mapping?: Record<string, string>
  skipDuplicates?: boolean
  validationRules?: Record<string, any>
}

interface ImportResult {
  success: boolean
  importedCount: number
  skippedCount: number
  errorCount: number
  errors: Array<{
    row: number
    field: string
    message: string
  }>
  duplicates: Array<{
    row: number
    identifier: string
    message: string
  }>
}

export class DataExportService {
  static async exportData<T>(data: T[], options: ExportOptions): Promise<void> {
    const { format, filename = 'export', dateRange, filters, columns } = options
    
    // Filter data based on date range
    let filteredData = data
    if (dateRange) {
      filteredData = this.filterByDateRange(data, dateRange)
    }
    
    // Apply additional filters
    if (filters) {
      filteredData = this.applyFilters(filteredData, filters)
    }
    
    // Select specific columns
    if (columns) {
      filteredData = this.selectColumns(filteredData, columns)
    }

    switch (format) {
      case 'csv':
        await this.exportToCSV(filteredData, filename)
        break
      case 'xlsx':
        await this.exportToXLSX(filteredData, filename)
        break
      case 'json':
        await this.exportToJSON(filteredData, filename)
        break
      default:
        throw new Error('Unsupported export format')
    }
  }

  private static filterByDateRange<T>(data: T[], dateRange: { startDate: string; endDate: string }): T[] {
    return data.filter((item: any) => {
      const itemDate = new Date(item.createdAt || item.date || item.timestamp)
      const startDate = new Date(dateRange.startDate)
      const endDate = new Date(dateRange.endDate)
      
      return itemDate >= startDate && itemDate <= endDate
    })
  }

  private static applyFilters<T>(data: T[], filters: Record<string, any>): T[] {
    return data.filter((item: any) => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined || value === '') return true
        
        const itemValue = item[key]
        
        if (typeof value === 'string') {
          return itemValue?.toString().toLowerCase().includes(value.toLowerCase())
        }
        
        if (Array.isArray(value)) {
          return value.includes(itemValue)
        }
        
        return itemValue === value
      })
    })
  }

  private static selectColumns<T>(data: T[], columns: string[]): T[] {
    return data.map(item => {
      const filteredItem: any = {}
      columns.forEach(column => {
        if ((item as any)[column] !== undefined) {
          filteredItem[column] = (item as any)[column]
        }
      })
      return filteredItem as T
    })
  }

  private static async exportToCSV<T>(data: T[], filename: string): Promise<void> {
    const csv = Papa.unparse(data)
    this.downloadFile(csv, `${filename}.csv`, 'text/csv')
  }

  private static async exportToXLSX<T>(data: T[], filename: string): Promise<void> {
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(data)
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    this.downloadBlob(blob, `${filename}.xlsx`)
  }

  private static async exportToJSON<T>(data: T[], filename: string): Promise<void> {
    const json = JSON.stringify(data, null, 2)
    this.downloadFile(json, `${filename}.json`, 'application/json')
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    this.downloadBlob(blob, filename)
  }

  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Specialized export methods for different data types
  static async exportCustomers(customers: any[], options: Partial<ExportOptions> = {}): Promise<void> {
    const defaultColumns = [
      'name', 'email', 'phone', 'company', 'type', 'address', 'city', 
      'projectCount', 'totalValue', 'status', 'createdAt'
    ]
    
    await this.exportData(customers, {
      format: 'xlsx',
      filename: 'customers_export',
      columns: defaultColumns,
      ...options
    })
  }

  static async exportProjects(projects: any[], options: Partial<ExportOptions> = {}): Promise<void> {
    const defaultColumns = [
      'name', 'customerName', 'companyName', 'type', 'status', 'capacity', 
      'location', 'estimatedValue', 'startDate', 'endDate', 'createdAt'
    ]
    
    await this.exportData(projects, {
      format: 'xlsx',
      filename: 'projects_export',
      columns: defaultColumns,
      ...options
    })
  }

  static async exportQuotes(quotes: any[], options: Partial<ExportOptions> = {}): Promise<void> {
    const defaultColumns = [
      'id', 'customerName', 'companyName', 'projectType', 'systemSize', 
      'totalPrice', 'status', 'validUntil', 'createdAt'
    ]
    
    await this.exportData(quotes, {
      format: 'xlsx',
      filename: 'quotes_export',
      columns: defaultColumns,
      ...options
    })
  }
}

export class DataImportService {
  static async importData(options: ImportOptions): Promise<ImportResult> {
    const { file, dataType, mapping, skipDuplicates = true, validationRules } = options
    
    try {
      // Parse file based on extension
      const data = await this.parseFile(file)
      
      // Apply field mapping
      const mappedData = mapping ? this.applyMapping(data, mapping) : data
      
      // Validate data
      const validationResult = this.validateData(mappedData, dataType, validationRules)
      
      if (validationResult.errors.length > 0 && !skipDuplicates) {
        return {
          success: false,
          importedCount: 0,
          skippedCount: 0,
          errorCount: validationResult.errors.length,
          errors: validationResult.errors,
          duplicates: []
        }
      }

      // Process import based on data type
      const importResult = await this.processImport(
        validationResult.validData, 
        dataType, 
        skipDuplicates
      )
      
      return {
        success: true,
        importedCount: importResult.imported,
        skippedCount: importResult.skipped,
        errorCount: validationResult.errors.length,
        errors: validationResult.errors,
        duplicates: importResult.duplicates
      }
      
    } catch (error) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errorCount: 1,
        errors: [{
          row: 0,
          field: 'file',
          message: error instanceof Error ? error.message : 'Unknown error'
        }],
        duplicates: []
      }
    }
  }

  private static async parseFile(file: File): Promise<any[]> {
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'csv':
        return await this.parseCSV(file)
      case 'xlsx':
      case 'xls':
        return await this.parseExcel(file)
      case 'json':
        return await this.parseJSON(file)
      default:
        throw new Error(`Unsupported file format: ${extension}`)
    }
  }

  private static async parseCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${results.errors[0].message}`))
          } else {
            resolve(results.data)
          }
        },
        error: (error) => reject(error)
      })
    })
  }

  private static async parseExcel(file: File): Promise<any[]> {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    return XLSX.utils.sheet_to_json(worksheet)
  }

  private static async parseJSON(file: File): Promise<any[]> {
    const text = await file.text()
    const data = JSON.parse(text)
    
    return Array.isArray(data) ? data : [data]
  }

  private static applyMapping(data: any[], mapping: Record<string, string>): any[] {
    return data.map(row => {
      const mappedRow: any = {}
      
      Object.entries(mapping).forEach(([sourceField, targetField]) => {
        if (row[sourceField] !== undefined) {
          mappedRow[targetField] = row[sourceField]
        }
      })
      
      // Include unmapped fields
      Object.entries(row).forEach(([key, value]) => {
        if (!Object.keys(mapping).includes(key)) {
          mappedRow[key] = value
        }
      })
      
      return mappedRow
    })
  }

  private static validateData(data: any[], dataType: DataType, customRules?: Record<string, any>) {
    const errors: Array<{ row: number; field: string; message: string }> = []
    const validData: any[] = []

    const validationRules = this.getValidationRules(dataType, customRules)

    data.forEach((row, index) => {
      let hasErrors = false

      Object.entries(validationRules).forEach(([field, rules]) => {
        const value = row[field]

        if (rules.required && (!value || value.toString().trim() === '')) {
          errors.push({
            row: index + 1,
            field,
            message: `${field} is required`
          })
          hasErrors = true
        }

        if (value && rules.type) {
          if (rules.type === 'email' && !this.isValidEmail(value)) {
            errors.push({
              row: index + 1,
              field,
              message: `Invalid email format`
            })
            hasErrors = true
          }

          if (rules.type === 'number' && isNaN(Number(value))) {
            errors.push({
              row: index + 1,
              field,
              message: `Must be a number`
            })
            hasErrors = true
          }

          if (rules.type === 'date' && !this.isValidDate(value)) {
            errors.push({
              row: index + 1,
              field,
              message: `Invalid date format`
            })
            hasErrors = true
          }
        }

        if (value && rules.minLength && value.toString().length < rules.minLength) {
          errors.push({
            row: index + 1,
            field,
            message: `Minimum length is ${rules.minLength}`
          })
          hasErrors = true
        }

        if (value && rules.maxLength && value.toString().length > rules.maxLength) {
          errors.push({
            row: index + 1,
            field,
            message: `Maximum length is ${rules.maxLength}`
          })
          hasErrors = true
        }
      })

      if (!hasErrors) {
        validData.push(row)
      }
    })

    return { errors, validData }
  }

  private static getValidationRules(dataType: DataType, customRules?: Record<string, any>): ValidationRules {
    const baseRules: Record<DataType, ValidationRules> = {
      customers: {
        name: { required: true, minLength: 2, maxLength: 100 },
        email: { required: true, type: 'email' as const },
        phone: { required: false, minLength: 10, maxLength: 15 },
        type: { required: true }
      },
      projects: {
        name: { required: true, minLength: 2, maxLength: 200 },
        customerName: { required: true },
        type: { required: true },
        capacity: { required: true, type: 'number' as const },
        location: { required: true }
      },
      quotes: {
        customerName: { required: true },
        projectType: { required: true },
        systemSize: { required: true, type: 'number' as const },
        totalPrice: { required: true, type: 'number' as const }
      },
      companies: {
        name: { required: true, minLength: 2, maxLength: 200 },
        email: { required: true, type: 'email' as const },
        phone: { required: true },
        serviceType: { required: true }
      },
      products: {
        name: { required: true },
        category: { required: true },
        price: { required: true, type: 'number' as const },
        power: { required: false, type: 'number' as const }
      },
      analytics: {}
    }

    return { ...baseRules[dataType], ...customRules }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private static isValidDate(date: string): boolean {
    const parsed = new Date(date)
    return !isNaN(parsed.getTime())
  }

  private static async processImport(data: any[], dataType: DataType, skipDuplicates: boolean) {
    // Mock import process - replace with actual API calls
    let imported = 0
    let skipped = 0
    const duplicates: Array<{ row: number; identifier: string; message: string }> = []

    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      
      // Simulate duplicate check
      const isDuplicate = Math.random() < 0.1 // 10% chance of duplicate
      
      if (isDuplicate && skipDuplicates) {
        skipped++
        duplicates.push({
          row: i + 1,
          identifier: item.email || item.name || `item-${i}`,
          message: 'Duplicate entry skipped'
        })
      } else {
        // Simulate API call
        await this.saveToDatabase(item, dataType)
        imported++
      }
    }

    return { imported, skipped, duplicates }
  }

  private static async saveToDatabase(item: any, dataType: DataType): Promise<void> {
    // Mock database save - replace with actual implementation
    return new Promise(resolve => {
      setTimeout(resolve, 10) // Simulate async operation
    })
  }

  // Specialized import methods
  static async importCustomers(file: File, mapping?: Record<string, string>): Promise<ImportResult> {
    return await this.importData({
      dataType: 'customers',
      file,
      mapping,
      skipDuplicates: true,
      validationRules: {
        email: { required: true, type: 'email' },
        phone: { required: true, minLength: 10 }
      }
    })
  }

  static async importProjects(file: File, mapping?: Record<string, string>): Promise<ImportResult> {
    return await this.importData({
      dataType: 'projects',
      file,
      mapping,
      skipDuplicates: false,
      validationRules: {
        capacity: { required: true, type: 'number', min: 1 },
        estimatedValue: { type: 'number', min: 0 }
      }
    })
  }

  static async importProducts(file: File, mapping?: Record<string, string>): Promise<ImportResult> {
    return await this.importData({
      dataType: 'products',
      file,
      mapping,
      skipDuplicates: true,
      validationRules: {
        price: { required: true, type: 'number', min: 0 },
        power: { type: 'number', min: 0 }
      }
    })
  }
}