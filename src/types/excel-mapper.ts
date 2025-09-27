export interface ExcelData {
  sheets: SheetData[]
  activeSheet: number
}

export interface SheetData {
  name: string
  data: any[][]
  headers: string[]
  headerRow: number
  startRow: number
  endRow: number
  excludedRows: Set<number>
}

export interface ColumnMapping {
  excelColumn: string
  excelIndex: number
  systemField: string
  required: boolean
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'enum'
  enumValues?: string[]
}

export interface SystemField {
  id: string
  name: string
  label: string
  required: boolean
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'enum'
  enumValues?: string[]
  description?: string
  example?: string
}

export interface ValidationError {
  row: number
  column: string
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ImportPreview {
  totalRows: number
  validRows: number
  invalidRows: number
  warnings: number
  errors: ValidationError[]
  mappedData: Record<string, any>[]
}

export const PRODUCT_SYSTEM_FIELDS: SystemField[] = [
  {
    id: 'name',
    name: 'name',
    label: 'Ürün Adı',
    required: true,
    dataType: 'string',
    description: 'Ürünün tam adı',
    example: 'Jinko Solar 550W Panel'
  },
  {
    id: 'code',
    name: 'code',
    label: 'Ürün Kodu',
    required: true,
    dataType: 'string',
    description: 'Benzersiz ürün kodu',
    example: 'JKS-550-TIGER'
  },
  {
    id: 'category',
    name: 'category',
    label: 'Kategori',
    required: true,
    dataType: 'string',
    description: 'Ürün kategorisi (sisteminizden)',
    example: 'Solar Panel, İnverter, Montaj'
  },
  {
    id: 'brand',
    name: 'brand',
    label: 'Marka',
    required: true,
    dataType: 'string',
    description: 'Üretici firma',
    example: 'Jinko Solar'
  },
  {
    id: 'model',
    name: 'model',
    label: 'Model',
    required: true,
    dataType: 'string',
    description: 'Ürün modeli',
    example: 'Tiger Pro 72HC'
  },
  {
    id: 'price',
    name: 'price',
    label: 'Fiyat',
    required: true,
    dataType: 'number',
    description: 'KDV hariç fiyat',
    example: '2500'
  },
  {
    id: 'usdPrice',
    name: 'usdPrice',
    label: 'USD Alış Fiyat',
    required: false,
    dataType: 'number',
    description: 'USD cinsinden alış fiyatı',
    example: '45.50'
  },
  {
    id: 'stock',
    name: 'stock',
    label: 'Stok',
    required: false,
    dataType: 'number',
    description: 'Mevcut stok adedi',
    example: '100'
  },
  {
    id: 'power',
    name: 'power',
    label: 'Güç (W)',
    required: false,
    dataType: 'number',
    description: 'Panel veya inverter gücü',
    example: '550'
  },
  {
    id: 'warranty',
    name: 'warranty',
    label: 'Garanti (Yıl)',
    required: false,
    dataType: 'number',
    description: 'Garanti süresi',
    example: '12'
  },
  {
    id: 'description',
    name: 'description',
    label: 'Açıklama',
    required: false,
    dataType: 'string',
    description: 'Ürün açıklaması'
  },
  {
    id: 'categoryId',
    name: 'categoryId',
    label: 'Kategori ID',
    required: false,
    dataType: 'string',
    description: 'Sistem kategorisi ID (otomatik atanır)',
    example: 'auto-generated'
  }
]

// Bayi excel dosyalarından gelen kategori isimlerini sisteminizin kategorilerine çeviren mapping
export const CATEGORY_MAPPING: Record<string, string> = {
  // Solar Panel kategorileri
  'PANEL': 'Solar Panel',
  'SOLAR PANEL': 'Solar Panel',
  'GÜNEŞ PANELİ': 'Solar Panel',
  'GÜNEŞ PANEL': 'Solar Panel',
  'PV PANEL': 'Solar Panel',
  'PHOTOVOLTAIC': 'Solar Panel',
  'MONOCRISTALLINE': 'Solar Panel',
  'POLYCRISTALLINE': 'Solar Panel',
  'MONOCRYSTALLINE': 'Solar Panel',
  'POLYCRYSTALLINE': 'Solar Panel',
  'PERC': 'Solar Panel',
  'BIFACIAL': 'Solar Panel',

  // İnverter kategorileri
  'İNVERTER': 'İnverter',
  'INVERTER': 'İnverter',
  'EVIRICI': 'İnverter',
  'INVERTOR': 'İnverter',
  'STRING INVERTER': 'İnverter',
  'MICRO INVERTER': 'İnverter',
  'POWER OPTIMIZER': 'İnverter',
  'HYBRID INVERTER': 'İnverter',
  'ON GRID': 'İnverter',
  'OFF GRID': 'İnverter',
  'GRID TIE': 'İnverter',

  // Montaj Sistemleri
  'MONTAJ': 'Montaj Sistemleri',
  'MOUNTING': 'Montaj Sistemleri',
  'MOUNTING SYSTEM': 'Montaj Sistemleri',
  'MONTAJ SİSTEMİ': 'Montaj Sistemleri',
  'KONSTRÜKSIYON': 'Montaj Sistemleri',
  'CONSTRUCTION': 'Montaj Sistemleri',
  'RAIL': 'Montaj Sistemleri',
  'CLAMP': 'Montaj Sistemleri',
  'HOOK': 'Montaj Sistemleri',
  'BRACKET': 'Montaj Sistemleri',
  'ROOF MOUNT': 'Montaj Sistemleri',
  'GROUND MOUNT': 'Montaj Sistemleri',
  'TRACKER': 'Montaj Sistemleri',

  // Kablo ve Bağlantı
  'KABLO': 'Kablo',
  'CABLE': 'Kablo',
  'DC CABLE': 'Kablo',
  'AC CABLE': 'Kablo',
  'SOLAR CABLE': 'Kablo',
  'PV CABLE': 'Kablo',
  'EXTENSION CABLE': 'Kablo',
  'CONNECTOR': 'Kablo',
  'KONNEKTÖR': 'Kablo',
  'MC4': 'Kablo',
  'MC4 CONNECTOR': 'Kablo',

  // Batarya ve Depolama
  'BATARYA': 'Batarya',
  'BATTERY': 'Batarya',
  'AKÜ': 'Batarya',
  'LITHIUM': 'Batarya',
  'LI-ION': 'Batarya',
  'LIFEPO4': 'Batarya',
  'LEAD ACID': 'Batarya',
  'GEL BATTERY': 'Batarya',
  'AGM BATTERY': 'Batarya',
  'ENERGY STORAGE': 'Batarya',

  // İzleme ve Kontrol
  'İZLEME': 'İzleme Sistemleri',
  'MONITORING': 'İzleme Sistemleri',
  'MONITOR': 'İzleme Sistemleri',
  'DATALOGGER': 'İzleme Sistemleri',
  'SMART METER': 'İzleme Sistemleri',
  'COMMUNICATION': 'İzleme Sistemleri',
  'WIRELESS': 'İzleme Sistemleri',
  'GATEWAY': 'İzleme Sistemleri',

  // Güvenlik ve Koruma
  'GÜVENLİK': 'Güvenlik ve Koruma',
  'SECURITY': 'Güvenlik ve Koruma',
  'PROTECTION': 'Güvenlik ve Koruma',
  'FUSE': 'Güvenlik ve Koruma',
  'BREAKER': 'Güvenlik ve Koruma',
  'SURGE PROTECTOR': 'Güvenlik ve Koruma',
  'DISCONNECT': 'Güvenlik ve Koruma',
  'SWITCH': 'Güvenlik ve Koruma',
  'COMBINER BOX': 'Güvenlik ve Koruma',

  // Elektriksel Komponentler
  'ELEKTRİK': 'Elektriksel Komponentler',
  'ELECTRICAL': 'Elektriksel Komponentler',
  'JUNCTION BOX': 'Elektriksel Komponentler',
  'DISTRIBUTION': 'Elektriksel Komponentler',
  'PANEL BOARD': 'Elektriksel Komponentler',
  'METER': 'Elektriksel Komponentler',
  'TRANSFORMER': 'Elektriksel Komponentler',

  // Araçlar ve Ekipmanlar
  'ARAÇ': 'Araçlar ve Ekipmanlar',
  'TOOL': 'Araçlar ve Ekipmanlar',
  'EQUIPMENT': 'Araçlar ve Ekipmanlar',
  'CRIMPING TOOL': 'Araçlar ve Ekipmanlar',
  'MULTIMETER': 'Araçlar ve Ekipmanlar',
  'TESTER': 'Araçlar ve Ekipmanlar',
  'ANALYZER': 'Araçlar ve Ekipmanlar',

  // Genel/Diğer
  'DİĞER': 'Genel',
  'OTHER': 'Genel',
  'GENERAL': 'Genel',
  'MISC': 'Genel',
  'MISCELLANEOUS': 'Genel',
  'ACCESSORY': 'Genel',
  'AKSESUAR': 'Genel',
  'SPARE PART': 'Genel',
  'YEDEK PARÇA': 'Genel'
}

// Eski ProductType mapping'i de saklıyoruz backward compatibility için
export const PRODUCT_TYPE_MAP: Record<string, string> = {
  'PANEL': 'SOLAR_PANEL',
  'SOLAR PANEL': 'SOLAR_PANEL',
  'GÜNEŞ PANELİ': 'SOLAR_PANEL',
  'İNVERTER': 'INVERTER',
  'INVERTOR': 'INVERTER',
  'EVIRICI': 'INVERTER',
  'AKÜ': 'BATTERY',
  'BATARYA': 'BATTERY',
  'BATTERY': 'BATTERY',
  'MONTAJ': 'MOUNTING_SYSTEM',
  'MONTAJ SİSTEMİ': 'MOUNTING_SYSTEM',
  'KONSTRÜKSIYON': 'MOUNTING_SYSTEM',
  'KABLO': 'CABLE',
  'CABLE': 'CABLE',
  'KONNEKTÖR': 'ACCESSORY',
  'CONNECTOR': 'ACCESSORY',
  'İZLEME': 'MONITORING',
  'MONITORING': 'MONITORING',
  'DİĞER': 'ACCESSORY',
  'OTHER': 'ACCESSORY',
  'AKSESUAR': 'ACCESSORY',
  'ACCESSORY': 'ACCESSORY'
}

export const UNIT_MAP: Record<string, string> = {
  'ADET': 'PIECE',
  'AD': 'PIECE',
  'AD.': 'PIECE',
  'PCS': 'PIECE',
  'PIECE': 'PIECE',
  'TAKIM': 'SET',
  'SET': 'SET',
  'METRE': 'METER',
  'M': 'METER',
  'MT': 'METER',
  'METER': 'METER',
  'KG': 'KILOGRAM',
  'KİLOGRAM': 'KILOGRAM',
  'KILOGRAM': 'KILOGRAM'
}

export const CURRENCY_MAP: Record<string, string> = {
  'TL': 'TRY',
  '₺': 'TRY',
  'TRY': 'TRY',
  '$': 'USD',
  'USD': 'USD',
  'DOLAR': 'USD',
  '€': 'EUR',
  'EUR': 'EUR',
  'EURO': 'EUR'
}