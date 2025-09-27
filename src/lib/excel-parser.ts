import * as XLSX from 'xlsx'
import { ExcelData, SheetData, ColumnMapping, SystemField, PRODUCT_TYPE_MAP, UNIT_MAP, CURRENCY_MAP, CATEGORY_MAPPING } from '@/types/excel-mapper'

export function parseExcelFile(file: File): Promise<ExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })

        const sheets: SheetData[] = workbook.SheetNames.map(sheetName => {
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null, raw: false })

          const data = jsonData as any[][]

          // Find first row with meaningful content (not just empty cells)
          const firstNonEmptyRow = data.findIndex(row => {
            if (!row || row.length === 0) return false
            const nonEmptyCount = row.filter(cell =>
              cell !== null &&
              cell !== undefined &&
              cell !== '' &&
              String(cell).trim() !== ''
            ).length
            return nonEmptyCount >= 3 // At least 3 non-empty cells to be considered a header row
          })

          const headerRowIndex = firstNonEmptyRow >= 0 ? firstNonEmptyRow : 0
          const rawHeaders = data[headerRowIndex] || []

          // Clean and process headers more carefully
          const headers = rawHeaders.map((h, index) => {
            if (h === null || h === undefined || h === '') {
              // Generate placeholder for empty headers
              return `Sütun ${index + 1}`
            }
            return String(h).trim()
          }).filter(h => h !== '') // Remove completely empty headers

          console.log('Raw headers from Excel:', rawHeaders)
          console.log('Processed headers:', headers)
          console.log('Header row index:', headerRowIndex)

          return {
            name: sheetName,
            data,
            headers,
            headerRow: headerRowIndex,
            startRow: headerRowIndex + 1,
            endRow: data.length - 1,
            excludedRows: new Set<number>()
          }
        })

        resolve({
          sheets,
          activeSheet: 0
        })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export function autoMapColumns(
  excelHeaders: string[],
  systemFields: SystemField[]
): ColumnMapping[] {
  console.log('AutoMapColumns called with:', {
    excelHeaders,
    systemFields: systemFields.map(f => f.id),
    headerCount: excelHeaders.length,
    nonEmptyHeaders: excelHeaders.filter(h => h && h.trim() !== '').length
  })

  // Filter out empty headers
  const validHeaders = excelHeaders.filter(h => h && h.trim() !== '' && !h.startsWith('Sütun'))
  console.log('Valid headers for mapping:', validHeaders)

  if (validHeaders.length === 0) {
    console.warn('No valid headers found for auto-mapping')
    return []
  }

  const mappings: ColumnMapping[] = []
  const usedSystemFields = new Set<string>()

  const normalizeString = (str: string) => {
    if (!str) return ''
    return str
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöç]/gi, '')
      .replace(/ı/g, 'i')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
  }

  // Genişletilmiş sütun pattern'leri - bayi dosyalarından gelebilecek farklı isimler
  const columnPatterns: Record<string, RegExp[]> = {
    name: [
      /^(ürün\s*)?adı?$/i, /^(product\s*)?name$/i, /^tanım$/i, /^açıklama$/i,
      /^tanim$/i, /^malzeme$/i, /^material$/i, /^item$/i, /^ürün$/i,
      /^product$/i, /^description$/i, /^ad$/i, /^isim$/i
    ],
    code: [
      /^(ürün\s*)?kod(u)?$/i, /^(product\s*)?code$/i, /^stok\s*kodu$/i,
      /^kod$/i, /^code$/i, /^item\s*code$/i, /^part\s*number$/i,
      /^ref$/i, /^reference$/i, /^sku$/i, /^id$/i
    ],
    category: [
      /^kategori$/i, /^category$/i, /^tip$/i, /^tür$/i, /^type$/i,
      /^grup$/i, /^group$/i, /^sınıf$/i, /^class$/i, /^family$/i,
      /^ailesi$/i, /^kategorisi$/i
    ],
    brand: [
      /^marka$/i, /^brand$/i, /^üretici$/i, /^manufacturer$/i,
      /^make$/i, /^firma$/i, /^company$/i, /^vendor$/i,
      /^supplier$/i, /^tedarikçi$/i
    ],
    model: [
      /^model$/i, /^seri$/i, /^series$/i, /^version$/i,
      /^versiyon$/i, /^tip$/i, /^variant$/i, /^çeşit$/i
    ],
    price: [
      /^fiyat$/i, /^birim\s*fiyat$/i, /^price$/i, /^tutar$/i,
      /^unit\s*price$/i, /^cost$/i, /^maliyet$/i, /^net$/i,
      /^liste\s*fiyat$/i, /^list\s*price$/i, /^satış\s*fiyat$/i,
      /^sales\s*price$/i, /^amount$/i, /^miktar$/i
    ],
    usdPrice: [
      /^usd$/i, /^usd\s*fiyat$/i, /^usd\s*price$/i, /^dollar$/i,
      /^dolar$/i, /^usd\s*alış$/i, /^usd\s*cost$/i, /^net\s*usd$/i,
      /^foreign\s*price$/i, /^yabancı\s*para$/i
    ],
    stock: [
      /^stok$/i, /^miktar$/i, /^adet$/i, /^quantity$/i,
      /^qty$/i, /^stock$/i, /^inventory$/i, /^available$/i,
      /^mevcut$/i, /^amount$/i, /^sayı$/i, /^count$/i
    ],
    power: [
      /^güç$/i, /^watt$/i, /^power$/i, /^w$/i, /^wp$/i,
      /^kw$/i, /^kilowatt$/i, /^output$/i, /^çıkış$/i,
      /^kapasite$/i, /^capacity$/i, /^rating$/i
    ],
    warranty: [
      /^garanti$/i, /^warranty$/i, /^guarantee$/i, /^yıl$/i,
      /^year$/i, /^garanti\s*süresi$/i, /^warranty\s*period$/i
    ],
    description: [
      /^açıklama$/i, /^description$/i, /^not(lar)?$/i, /^note$/i,
      /^comment$/i, /^yorum$/i, /^detay$/i, /^detail$/i,
      /^özellik$/i, /^feature$/i, /^spec$/i, /^specification$/i
    ]
  }

  excelHeaders.forEach((header, index) => {
    // Skip empty or placeholder headers
    if (!header || header.trim() === '' || header.startsWith('Sütun')) {
      return
    }

    const normalizedHeader = normalizeString(header)
    console.log(`Processing header: "${header}" (normalized: "${normalizedHeader}")`)

    for (const systemField of systemFields) {
      if (usedSystemFields.has(systemField.id)) continue

      const patterns = columnPatterns[systemField.id]
      if (patterns) {
        const matched = patterns.some(pattern => {
          const testResult = pattern.test(header)
          if (testResult) {
            console.log(`Pattern ${pattern} matched header "${header}" for field ${systemField.id}`)
          }
          return testResult
        })
        if (matched) {
          console.log(`Pattern match found: "${header}" -> ${systemField.id}`)
          mappings.push({
            excelColumn: header,
            excelIndex: index,
            systemField: systemField.id,
            required: systemField.required,
            dataType: systemField.dataType,
            enumValues: systemField.enumValues
          })
          usedSystemFields.add(systemField.id)
          break
        }
      }

      // Fuzzy matching for similar field names
      const normalizedField = normalizeString(systemField.label)
      const similarity = calculateSimilarity(normalizedHeader, normalizedField)
      if (similarity > 0.8) {
        console.log(`Fuzzy match found: "${header}" -> ${systemField.id} (similarity: ${similarity})`)
        mappings.push({
          excelColumn: header,
          excelIndex: index,
          systemField: systemField.id,
          required: systemField.required,
          dataType: systemField.dataType,
          enumValues: systemField.enumValues
        })
        usedSystemFields.add(systemField.id)
        break
      }
    }
  })

  console.log('Final auto mappings:', mappings)
  return mappings
}

// Benzerlik hesaplama fonksiyonu (Levenshtein distance)
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null))

  for (let i = 0; i <= len1; i++) matrix[i][0] = i
  for (let j = 0; j <= len2; j++) matrix[0][j] = j

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }

  const maxLen = Math.max(len1, len2)
  if (maxLen === 0) return 1
  return 1 - matrix[len1][len2] / maxLen
}

export function transformValue(
  value: any,
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'enum',
  fieldName?: string,
  enumValues?: string[]
): any {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const strValue = String(value).trim()

  switch (dataType) {
    case 'number':
      const cleanedNumber = strValue
        .replace(/[^\d,.-]/g, '')
        .replace(',', '.')
      const num = parseFloat(cleanedNumber)
      return isNaN(num) ? null : num

    case 'date':
      const date = new Date(value)
      return isNaN(date.getTime()) ? null : date

    case 'boolean':
      const lowerValue = strValue.toLowerCase()
      return lowerValue === 'true' || lowerValue === 'yes' ||
             lowerValue === 'evet' || lowerValue === '1'

    case 'enum':
      if (fieldName === 'type') {
        const upperValue = strValue.toUpperCase()
        return PRODUCT_TYPE_MAP[upperValue] || 'ACCESSORY'
      }
      if (fieldName === 'unit') {
        const upperValue = strValue.toUpperCase()
        return UNIT_MAP[upperValue] || 'PIECE'
      }
      if (fieldName === 'currency') {
        const upperValue = strValue.toUpperCase()
        return CURRENCY_MAP[upperValue] || 'TRY'
      }
      if (enumValues?.includes(strValue)) {
        return strValue
      }
      const upperValue = strValue.toUpperCase()
      if (enumValues?.includes(upperValue)) {
        return upperValue
      }
      return null

    case 'string':
    default:
      // Kategori alanı için özel mapping
      if (fieldName === 'category') {
        return mapCategory(strValue)
      }
      return strValue
  }
}

// Kategori mapping fonksiyonu
function mapCategory(categoryValue: string): string {
  if (!categoryValue) return 'Genel'

  const upperValue = categoryValue.toUpperCase().trim()

  // Önce exact match ara
  if (CATEGORY_MAPPING[upperValue]) {
    return CATEGORY_MAPPING[upperValue]
  }

  // Partial match ara - kategorinin içinde anahtar kelimeler var mı?
  for (const [key, mappedCategory] of Object.entries(CATEGORY_MAPPING)) {
    if (upperValue.includes(key) || key.includes(upperValue)) {
      return mappedCategory
    }
  }

  // Fuzzy matching ile benzer kategoriler ara
  let bestMatch = 'Genel'
  let bestSimilarity = 0

  for (const [key, mappedCategory] of Object.entries(CATEGORY_MAPPING)) {
    const similarity = calculateSimilarity(upperValue, key)
    if (similarity > bestSimilarity && similarity > 0.6) {
      bestSimilarity = similarity
      bestMatch = mappedCategory
    }
  }

  return bestMatch
}

export function detectEmptyRows(data: any[][], startRow: number, endRow: number): number[] {
  const emptyRows: number[] = []

  for (let i = startRow; i <= endRow; i++) {
    const row = data[i]
    if (!row || row.every(cell => cell === '' || cell === null || cell === undefined)) {
      emptyRows.push(i)
    }
  }

  return emptyRows
}

export function suggestHeaderRow(data: any[][]): number {
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i]
    if (row && row.length > 3) {
      const nonEmptyCells = row.filter(cell => cell !== '' && cell !== null && cell !== undefined)
      if (nonEmptyCells.length >= 3) {
        const hasNumbers = row.some(cell => !isNaN(Number(cell)))
        const hasText = row.some(cell => isNaN(Number(cell)) && cell !== '')

        if (hasText && !hasNumbers) {
          return i
        }
      }
    }
  }

  return 0
}