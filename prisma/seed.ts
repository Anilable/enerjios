import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Türkiye'nin 81 ili ve güneşlenme verileri
const turkishRegions = [
  { code: '01', name: 'Adana', city: 'Adana', annualSunHours: 2988, solarIrradiance: 1642, electricityRate: 2.15 },
  { code: '02', name: 'Adıyaman', city: 'Adıyaman', annualSunHours: 3016, solarIrradiance: 1728, electricityRate: 2.10 },
  { code: '03', name: 'Afyonkarahisar', city: 'Afyonkarahisar', annualSunHours: 2824, solarIrradiance: 1456, electricityRate: 2.05 },
  { code: '04', name: 'Ağrı', city: 'Ağrı', annualSunHours: 2892, solarIrradiance: 1654, electricityRate: 1.95 },
  { code: '05', name: 'Amasya', city: 'Amasya', annualSunHours: 2456, solarIrradiance: 1298, electricityRate: 2.00 },
  { code: '06', name: 'Ankara', city: 'Ankara', annualSunHours: 2628, solarIrradiance: 1365, electricityRate: 2.20 },
  { code: '07', name: 'Antalya', city: 'Antalya', annualSunHours: 3336, solarIrradiance: 1814, electricityRate: 2.25 },
  { code: '08', name: 'Artvin', city: 'Artvin', annualSunHours: 2184, solarIrradiance: 1156, electricityRate: 1.90 },
  { code: '09', name: 'Aydın', city: 'Aydın', annualSunHours: 3108, solarIrradiance: 1698, electricityRate: 2.15 },
  { code: '10', name: 'Balıkesir', city: 'Balıkesir', annualSunHours: 2736, solarIrradiance: 1423, electricityRate: 2.10 },
  { code: '11', name: 'Bilecik', city: 'Bilecik', annualSunHours: 2456, solarIrradiance: 1298, electricityRate: 2.05 },
  { code: '12', name: 'Bingöl', city: 'Bingöl', annualSunHours: 2892, solarIrradiance: 1654, electricityRate: 1.95 },
  { code: '13', name: 'Bitlis', city: 'Bitlis', annualSunHours: 2892, solarIrradiance: 1654, electricityRate: 1.90 },
  { code: '14', name: 'Bolu', city: 'Bolu', annualSunHours: 2456, solarIrradiance: 1298, electricityRate: 2.00 },
  { code: '15', name: 'Burdur', city: 'Burdur', annualSunHours: 3108, solarIrradiance: 1698, electricityRate: 2.10 },
  { code: '16', name: 'Bursa', city: 'Bursa', annualSunHours: 2456, solarIrradiance: 1298, electricityRate: 2.15 },
  { code: '17', name: 'Çanakkale', city: 'Çanakkale', annualSunHours: 2736, solarIrradiance: 1423, electricityRate: 2.10 },
  { code: '18', name: 'Çankırı', city: 'Çankırı', annualSunHours: 2628, solarIrradiance: 1365, electricityRate: 2.00 },
  { code: '19', name: 'Çorum', city: 'Çorum', annualSunHours: 2456, solarIrradiance: 1298, electricityRate: 2.00 },
  { code: '20', name: 'Denizli', city: 'Denizli', annualSunHours: 3108, solarIrradiance: 1698, electricityRate: 2.15 },
  { code: '21', name: 'Diyarbakır', city: 'Diyarbakır', annualSunHours: 3016, solarIrradiance: 1728, electricityRate: 2.05 },
  { code: '22', name: 'Edirne', city: 'Edirne', annualSunHours: 2736, solarIrradiance: 1423, electricityRate: 2.10 },
  { code: '23', name: 'Elazığ', city: 'Elazığ', annualSunHours: 3016, solarIrradiance: 1728, electricityRate: 2.00 },
  { code: '24', name: 'Erzincan', city: 'Erzincan', annualSunHours: 2892, solarIrradiance: 1654, electricityRate: 1.95 },
  { code: '25', name: 'Erzurum', city: 'Erzurum', annualSunHours: 2892, solarIrradiance: 1654, electricityRate: 1.90 },
  { code: '26', name: 'Eskişehir', city: 'Eskişehir', annualSunHours: 2628, solarIrradiance: 1365, electricityRate: 2.05 },
  { code: '27', name: 'Gaziantep', city: 'Gaziantep', annualSunHours: 3016, solarIrradiance: 1728, electricityRate: 2.10 },
  { code: '28', name: 'Giresun', city: 'Giresun', annualSunHours: 2184, solarIrradiance: 1156, electricityRate: 1.95 },
  { code: '29', name: 'Gümüşhane', city: 'Gümüşhane', annualSunHours: 2184, solarIrradiance: 1156, electricityRate: 1.90 },
  { code: '30', name: 'Hakkâri', city: 'Hakkâri', annualSunHours: 2892, solarIrradiance: 1654, electricityRate: 1.85 },
  { code: '31', name: 'Hatay', city: 'Hatay', annualSunHours: 2988, solarIrradiance: 1642, electricityRate: 2.15 },
  { code: '32', name: 'Isparta', city: 'Isparta', annualSunHours: 3108, solarIrradiance: 1698, electricityRate: 2.10 },
  { code: '33', name: 'Mersin', city: 'Mersin', annualSunHours: 2988, solarIrradiance: 1642, electricityRate: 2.15 },
  { code: '34', name: 'İstanbul', city: 'İstanbul', annualSunHours: 2456, solarIrradiance: 1298, electricityRate: 2.30 },
  { code: '35', name: 'İzmir', city: 'İzmir', annualSunHours: 3108, solarIrradiance: 1698, electricityRate: 2.20 },
  { code: '36', name: 'Kars', city: 'Kars', annualSunHours: 2892, solarIrradiance: 1654, electricityRate: 1.85 },
  { code: '37', name: 'Kastamonu', city: 'Kastamonu', annualSunHours: 2456, solarIrradiance: 1298, electricityRate: 1.95 },
  { code: '38', name: 'Kayseri', city: 'Kayseri', annualSunHours: 2824, solarIrradiance: 1456, electricityRate: 2.05 },
  { code: '39', name: 'Kırklareli', city: 'Kırklareli', annualSunHours: 2736, solarIrradiance: 1423, electricityRate: 2.10 },
  { code: '40', name: 'Kırşehir', city: 'Kırşehir', annualSunHours: 2628, solarIrradiance: 1365, electricityRate: 2.00 },
  { code: '41', name: 'Kocaeli', city: 'Kocaeli', annualSunHours: 2456, solarIrradiance: 1298, electricityRate: 2.20 },
  { code: '42', name: 'Konya', city: 'Konya', annualSunHours: 2824, solarIrradiance: 1456, electricityRate: 2.10 },
  { code: '43', name: 'Kütahya', city: 'Kütahya', annualSunHours: 2628, solarIrradiance: 1365, electricityRate: 2.05 },
  { code: '44', name: 'Malatya', city: 'Malatya', annualSunHours: 3016, solarIrradiance: 1728, electricityRate: 2.00 },
  { code: '45', name: 'Manisa', city: 'Manisa', annualSunHours: 3108, solarIrradiance: 1698, electricityRate: 2.15 },
  { code: '46', name: 'Kahramanmaraş', city: 'Kahramanmaraş', annualSunHours: 3016, solarIrradiance: 1728, electricityRate: 2.05 },
  { code: '47', name: 'Mardin', city: 'Mardin', annualSunHours: 3016, solarIrradiance: 1728, electricityRate: 2.00 },
  { code: '48', name: 'Muğla', city: 'Muğla', annualSunHours: 3336, solarIrradiance: 1814, electricityRate: 2.20 },
  { code: '49', name: 'Muş', city: 'Muş', annualSunHours: 2892, solarIrradiance: 1654, electricityRate: 1.90 },
  { code: '50', name: 'Nevşehir', city: 'Nevşehir', annualSunHours: 2824, solarIrradiance: 1456, electricityRate: 2.00 },
  { code: '51', name: 'Niğde', city: 'Niğde', annualSunHours: 2824, solarIrradiance: 1456, electricityRate: 2.00 },
  { code: '52', name: 'Ordu', city: 'Ordu', annualSunHours: 2184, solarIrradiance: 1156, electricityRate: 1.95 },
  { code: '53', name: 'Rize', city: 'Rize', annualSunHours: 2184, solarIrradiance: 1156, electricityRate: 1.90 },
  { code: '54', name: 'Sakarya', city: 'Sakarya', annualSunHours: 2456, solarIrradiance: 1298, electricityRate: 2.15 },
  { code: '55', name: 'Samsun', city: 'Samsun', annualSunHours: 2184, solarIrradiance: 1156, electricityRate: 2.00 },
  { code: '56', name: 'Siirt', city: 'Siirt', annualSunHours: 3016, solarIrradiance: 1728, electricityRate: 1.95 },
  { code: '57', name: 'Sinop', city: 'Sinop', annualSunHours: 2184, solarIrradiance: 1156, electricityRate: 1.95 },
  { code: '58', name: 'Sivas', city: 'Sivas', annualSunHours: 2824, solarIrradiance: 1456, electricityRate: 1.95 },
  { code: '59', name: 'Tekirdağ', city: 'Tekirdağ', annualSunHours: 2736, solarIrradiance: 1423, electricityRate: 2.15 },
  { code: '60', name: 'Tokat', city: 'Tokat', annualSunHours: 2456, solarIrradiance: 1298, electricityRate: 1.95 },
  { code: '61', name: 'Trabzon', city: 'Trabzon', annualSunHours: 2184, solarIrradiance: 1156, electricityRate: 2.00 },
  { code: '62', name: 'Tunceli', city: 'Tunceli', annualSunHours: 3016, solarIrradiance: 1728, electricityRate: 1.90 },
  { code: '63', name: 'Şanlıurfa', city: 'Şanlıurfa', annualSunHours: 3016, solarIrradiance: 1728, electricityRate: 2.05 },
  { code: '64', name: 'Uşak', city: 'Uşak', annualSunHours: 3108, solarIrradiance: 1698, electricityRate: 2.10 },
  { code: '65', name: 'Van', city: 'Van', annualSunHours: 2892, solarIrradiance: 1654, electricityRate: 1.90 },
  { code: '66', name: 'Yozgat', city: 'Yozgat', annualSunHours: 2628, solarIrradiance: 1365, electricityRate: 1.95 },
  { code: '67', name: 'Zonguldak', city: 'Zonguldak', annualSunHours: 2184, solarIrradiance: 1156, electricityRate: 2.05 },
  { code: '68', name: 'Aksaray', city: 'Aksaray', annualSunHours: 2824, solarIrradiance: 1456, electricityRate: 2.00 },
  { code: '69', name: 'Bayburt', city: 'Bayburt', annualSunHours: 2184, solarIrradiance: 1156, electricityRate: 1.85 },
  { code: '70', name: 'Karaman', city: 'Karaman', annualSunHours: 2824, solarIrradiance: 1456, electricityRate: 2.05 },
  { code: '71', name: 'Kırıkkale', city: 'Kırıkkale', annualSunHours: 2628, solarIrradiance: 1365, electricityRate: 2.00 },
  { code: '72', name: 'Batman', city: 'Batman', annualSunHours: 3016, solarIrradiance: 1728, electricityRate: 1.95 },
  { code: '73', name: 'Şırnak', city: 'Şırnak', annualSunHours: 3016, solarIrradiance: 1728, electricityRate: 1.90 },
  { code: '74', name: 'Bartın', city: 'Bartın', annualSunHours: 2184, solarIrradiance: 1156, electricityRate: 1.95 },
  { code: '75', name: 'Ardahan', city: 'Ardahan', annualSunHours: 2892, solarIrradiance: 1654, electricityRate: 1.80 },
  { code: '76', name: 'Iğdır', city: 'Iğdır', annualSunHours: 2892, solarIrradiance: 1654, electricityRate: 1.85 },
  { code: '77', name: 'Yalova', city: 'Yalova', annualSunHours: 2456, solarIrradiance: 1298, electricityRate: 2.20 },
  { code: '78', name: 'Karabük', city: 'Karabük', annualSunHours: 2456, solarIrradiance: 1298, electricityRate: 1.95 },
  { code: '79', name: 'Kilis', city: 'Kilis', annualSunHours: 3016, solarIrradiance: 1728, electricityRate: 2.00 },
  { code: '80', name: 'Osmaniye', city: 'Osmaniye', annualSunHours: 2988, solarIrradiance: 1642, electricityRate: 2.10 },
  { code: '81', name: 'Düzce', city: 'Düzce', annualSunHours: 2456, solarIrradiance: 1298, electricityRate: 2.00 }
]

// Temel ürün kataloğu
const solarProducts = [
  // Solar Panels
  {
    type: 'SOLAR_PANEL',
    brand: 'Jinko Solar',
    model: 'JKM540M-7RL4-V',
    name: 'Tiger Neo N-type 72HL4-(V) Mono-facial 540W',
    description: 'Yüksek verimli monokristal güneş paneli',
    power: 540,
    efficiency: 21.8,
    warranty: 25,
    price: 850,
    specifications: JSON.stringify({
      dimensions: '2278×1134×30mm',
      weight: '27.5kg',
      cells: '144 (6×24)',
      voltage: '49.5V',
      current: '10.91A',
      temperature: '-40°C ~ +85°C'
    }),
    images: JSON.stringify(['/images/panels/jinko-540.jpg']),
    stock: 1000,
    unitType: 'adet'
  },
  {
    type: 'SOLAR_PANEL',
    brand: 'Canadian Solar',
    model: 'CS3W-455MS',
    name: 'HiKu Mono PERC 455W',
    description: 'Kanada Canadian Solar monokristal panel',
    power: 455,
    efficiency: 20.9,
    warranty: 25,
    price: 725,
    specifications: JSON.stringify({
      dimensions: '2108×1048×35mm',
      weight: '23.8kg',
      cells: '144 (6×24)',
      voltage: '41.7V',
      current: '10.91A'
    }),
    images: JSON.stringify(['/images/panels/canadian-455.jpg']),
    stock: 800,
    unitType: 'adet'
  },
  // Inverters
  {
    type: 'INVERTER',
    brand: 'Huawei',
    model: 'SUN2000-50KTL-M0',
    name: '50kW String Inverter',
    description: 'Ticari ve endüstriyel uygulamalar için string inverter',
    power: 50000,
    efficiency: 98.8,
    warranty: 10,
    price: 45000,
    specifications: JSON.stringify({
      maxDCPower: '65kW',
      maxEfficiency: '98.8%',
      mpptTrackers: '4',
      maxInputVoltage: '1100V',
      communicationProtocol: 'RS485, Ethernet, WiFi'
    }),
    images: JSON.stringify(['/images/inverters/huawei-50k.jpg']),
    stock: 50,
    unitType: 'adet'
  },
  {
    type: 'INVERTER',
    brand: 'SMA Solar',
    model: 'Sunny Tripower CORE1 50',
    name: 'STP 50-40',
    description: 'Alman SMA üçlü güç inverteri',
    power: 50000,
    efficiency: 98.6,
    warranty: 10,
    price: 52000,
    specifications: JSON.stringify({
      maxDCPower: '75kW',
      maxEfficiency: '98.6%',
      mpptTrackers: '6',
      maxInputVoltage: '1000V'
    }),
    images: JSON.stringify(['/images/inverters/sma-50.jpg']),
    stock: 30,
    unitType: 'adet'
  },
  // Mounting Systems
  {
    type: 'MOUNTING_SYSTEM',
    brand: 'Schletter',
    model: 'FixGrid XS',
    name: 'Çatı Montaj Sistemi',
    description: 'Kiremit çatı için alüminyum montaj rayı',
    price: 35,
    specifications: JSON.stringify({
      material: 'Anodized Aluminum',
      length: '6.2m',
      maxWindLoad: '2400Pa',
      maxSnowLoad: '5400Pa'
    }),
    images: JSON.stringify(['/images/mounting/schletter-rail.jpg']),
    stock: 2000,
    unitType: 'metre'
  },
  // Cables
  {
    type: 'CABLE',
    brand: 'Nexans',
    model: 'ENERGYFLEX ADC H07RN-F',
    name: 'DC Solar Kablosu 4mm²',
    description: 'UV dayanımlı güneş enerjisi kablosu',
    price: 8.5,
    specifications: JSON.stringify({
      crossSection: '4mm²',
      voltage: '1.8kV DC',
      temperature: '-40°C to +90°C',
      uvResistant: true
    }),
    images: JSON.stringify(['/images/cables/dc-cable-4mm.jpg']),
    stock: 5000,
    unitType: 'metre'
  }
]

// YEKDEM ve teşvik verileri
const incentives = [
  {
    name: 'YEKDEM - Güneş',
    type: 'FEED_IN_TARIFF',
    description: 'Yenilenebilir Enerji Kaynaklarını Destekleme Mekanizması - Güneş Enerjisi',
    amount: 1.33, // TL/kWh (2024)
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-12-31'),
    requirements: JSON.stringify([
      'Lisanslı güneş enerjisi üretim tesisi',
      'EPDK başvurusu onayı',
      'Şebeke bağlantı anlaşması'
    ])
  },
  {
    name: 'KDV İstisnası',
    type: 'TAX_EXEMPTION',
    description: 'Güneş enerjisi sistemleri için KDV istisnası',
    amount: 20, // % KDV
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    requirements: JSON.stringify([
      'Güneş enerjisi sistemi kurulumu',
      'Fatura üzerinde KDV istisnası belirtisi'
    ])
  },
  {
    name: 'Gümrük Vergisi Muafiyeti',
    type: 'CUSTOMS_EXEMPTION',
    description: 'Güneş paneli ve ekipmanları için gümrük vergisi muafiyeti',
    amount: 0,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    requirements: JSON.stringify([
      'İthalat lisansı',
      'Güneş enerjisi ekipmanı sertifikası'
    ])
  }
]

// Test kullanıcıları
const testUsers = [
  {
    email: 'admin@enerjios.com',
    name: 'System Admin',
    role: 'ADMIN',
    password: 'admin123'
  },
  {
    email: 'solar@gesenerji.com',
    name: 'GES Enerji Ltd.',
    role: 'COMPANY',
    password: 'company123'
  },
  {
    email: 'ahmet@gmail.com',
    name: 'Ahmet Yılmaz',
    role: 'CUSTOMER',
    password: 'customer123'
  },
  {
    email: 'fatma@demir.com',
    name: 'Fatma Demir',
    role: 'CUSTOMER',
    password: 'customer123'
  },
  {
    email: 'mehmet@ciftci.com',
    name: 'Mehmet Çiftçi',
    role: 'FARMER',
    password: 'farmer123'
  }
]

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Türkiye bölgelerini ekle
  console.log('📍 Adding Turkish regions...')
  for (const region of turkishRegions) {
    await prisma.region.upsert({
      where: { code: region.code },
      update: {},
      create: {
        ...region,
        agriculturalZone: ['01', '02', '27', '44', '63'].includes(region.code), // Tarım bölgeleri
        industrialZone: ['34', '35', '41', '16', '06'].includes(region.code) // Sanayi bölgeleri
      }
    })
  }
  console.log('✅ Regions seeded!')

  // 2. Teşvikleri ekle
  console.log('💰 Adding incentives...')
  for (const incentive of incentives) {
    await prisma.incentive.create({
      data: incentive
    })
  }
  console.log('✅ Incentives seeded!')

  // 3. Test kullanıcılarını ekle
  console.log('👥 Adding test users...')
  for (const userData of testUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        role: userData.role as any,
        password: hashedPassword,
        status: 'ACTIVE'
      },
      create: {
        email: userData.email,
        name: userData.name,
        role: userData.role as any,
        password: hashedPassword,
        status: 'ACTIVE'
      }
    })

    // Rol bazlı ek veriler
    if (userData.role === 'COMPANY') {
      await prisma.company.upsert({
        where: { userId: user.id },
        update: {
          name: userData.name,
          taxNumber: `1234567${userData.email.substring(0, 3)}`,
          type: 'INSTALLER',
          city: 'İstanbul',
          district: 'Kadıköy',
          verified: true
        },
        create: {
          userId: user.id,
          name: userData.name,
          taxNumber: `1234567${userData.email.substring(0, 3)}`,
          type: 'INSTALLER',
          city: 'İstanbul',
          district: 'Kadıköy',
          verified: true
        }
      })
    } else if (userData.role === 'CUSTOMER') {
      const isCompanyCustomer = userData.email === 'fatma@demir.com'
      await prisma.customer.upsert({
        where: { userId: user.id },
        update: {
          type: isCompanyCustomer ? 'CORPORATE' : 'INDIVIDUAL',
          firstName: userData.name.split(' ')[0],
          lastName: userData.name.split(' ')[1],
          companyName: isCompanyCustomer ? 'Demir Tekstil A.Ş.' : null,
          taxNumber: isCompanyCustomer ? '9876543210' : null,
          identityNumber: !isCompanyCustomer ? '12345678901' : null,
          phone: isCompanyCustomer ? '0212 555 1234' : '0532 111 2233',
          address: isCompanyCustomer ? 'Organize Sanayi Bölgesi 3. Cadde No:45' : 'Nispetiye Cad. No:12/5',
          city: 'İstanbul',
          district: isCompanyCustomer ? 'Başakşehir' : 'Beşiktaş'
        },
        create: {
          userId: user.id,
          type: isCompanyCustomer ? 'CORPORATE' : 'INDIVIDUAL',
          firstName: userData.name.split(' ')[0],
          lastName: userData.name.split(' ')[1],
          companyName: isCompanyCustomer ? 'Demir Tekstil A.Ş.' : null,
          taxNumber: isCompanyCustomer ? '9876543210' : null,
          identityNumber: !isCompanyCustomer ? '12345678901' : null,
          phone: isCompanyCustomer ? '0212 555 1234' : '0532 111 2233',
          address: isCompanyCustomer ? 'Organize Sanayi Bölgesi 3. Cadde No:45' : 'Nispetiye Cad. No:12/5',
          city: 'İstanbul',
          district: isCompanyCustomer ? 'Başakşehir' : 'Beşiktaş'
        }
      })
    } else if (userData.role === 'FARMER') {
      await prisma.customer.upsert({
        where: { userId: user.id },
        update: {
          type: 'FARMER',
          firstName: userData.name.split(' ')[0],
          lastName: userData.name.split(' ')[1],
          city: 'Konya',
          district: 'Merkez'
        },
        create: {
          userId: user.id,
          type: 'FARMER',
          firstName: userData.name.split(' ')[0],
          lastName: userData.name.split(' ')[1],
          city: 'Konya',
          district: 'Merkez'
        }
      })

      await prisma.farmer.upsert({
        where: { userId: user.id },
        update: {
          farmSize: 50.0, // 50 dönüm
          irrigationType: 'Damla sulama',
          mainCrops: JSON.stringify(['Buğday', 'Arpa', 'Şekerpancarı']),
          livestockCount: 25,
          monthlyConsumption: 2500,
          irrigationPumps: 2,
          coldStorage: true
        },
        create: {
          userId: user.id,
          farmSize: 50.0, // 50 dönüm
          irrigationType: 'Damla sulama',
          mainCrops: JSON.stringify(['Buğday', 'Arpa', 'Şekerpancarı']),
          livestockCount: 25,
          monthlyConsumption: 2500,
          irrigationPumps: 2,
          coldStorage: true
        }
      })
    }
  }
  console.log('✅ Test users seeded!')

  // 4. Ürün kataloğunu ekle
  console.log('📦 Adding product catalog...')
  const company = await prisma.company.findFirst()
  for (const product of solarProducts) {
    await prisma.product.create({
      data: {
        ...product,
        companyId: company?.id,
        type: product.type as any
      }
    })
  }
  console.log('✅ Product catalog seeded!')

  // 5. Örnek proje ekle
  console.log('🏗️ Adding sample projects...')
  const customer = await prisma.customer.findFirst()
  const companyEntity = await prisma.company.findFirst()
  const istanbul = await prisma.region.findFirst({ where: { code: '34' } })

  if (customer && companyEntity && istanbul) {
    // Konum oluştur
    const location = await prisma.location.create({
      data: {
        latitude: 41.0082,
        longitude: 28.9784,
        address: 'Kadıköy, İstanbul',
        city: 'İstanbul',
        district: 'Kadıköy',
        roofArea: 200, // m²
        roofType: 'flat',
        roofAngle: 0,
        orientation: 180 // Güney yönlü
      }
    })

    // Proje oluştur
    const project = await prisma.project.create({
      data: {
        name: 'Kadıköy Çatı GES Projesi',
        type: 'ROOFTOP',
        status: 'PLANNED',
        ownerId: customer.userId,
        customerId: customer.id,
        companyId: companyEntity.id,
        locationId: location.id,
        capacity: 100, // kWp
        estimatedCost: 450000,
        description: 'Konut çatısında 100 kW güneş enerjisi sistemi kurulumu'
      }
    })

    // Finansal analiz
    await prisma.financial.create({
      data: {
        projectId: project.id,
        systemCost: 400000,
        installationCost: 50000,
        maintenanceCost: 2000,
        annualProduction: 150000, // kWh/yıl
        degradationRate: 0.7,
        electricityRate: 2.30,
        annualSaving: 345000, // TL/yıl
        co2Reduction: 75, // ton/yıl
        paybackPeriod: 7.2,
        roi25Year: 485,
        irr: 15.8,
        npv: 2850000,
        feedInTariff: 1.33
      }
    })

    // Teklif oluştur
    const quote = await prisma.quote.upsert({
      where: { quoteNumber: 'QUO-2024-0001' },
      update: {
        projectId: project.id,
        customerId: customer.id,
        companyId: companyEntity.id,
        createdById: customer.userId,
        status: 'SENT',
        subtotal: 400000,
        tax: 80000,
        total: 480000,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 gün
      },
      create: {
        projectId: project.id,
        customerId: customer.id,
        companyId: companyEntity.id,
        createdById: customer.userId,
        quoteNumber: 'QUO-2024-0001',
        status: 'SENT',
        subtotal: 400000,
        tax: 80000,
        total: 480000,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 gün
      }
    })

    // Teklif kalemleri
    const panels = await prisma.product.findFirst({ where: { type: 'SOLAR_PANEL' } })
    const inverter = await prisma.product.findFirst({ where: { type: 'INVERTER' } })

    if (panels) {
      await prisma.quoteItem.create({
        data: {
          quoteId: quote.id,
          productId: panels.id,
          description: 'Güneş Paneli 540W',
          quantity: 185, // panel sayısı
          unitPrice: 850,
          total: 157250
        }
      })
    }

    if (inverter) {
      await prisma.quoteItem.create({
        data: {
          quoteId: quote.id,
          productId: inverter.id,
          description: 'String Inverter 50kW',
          quantity: 2,
          unitPrice: 45000,
          total: 90000
        }
      })
    }

    console.log('✅ Sample project with quote created!')
  }

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })