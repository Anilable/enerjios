const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const solarPanels = [
  {
    name: 'Jinko Solar Tiger Neo 540W',
    type: 'SOLAR_PANEL',
    brand: 'Jinko Solar',
    model: 'JKM540M-7RL3-V',
    description: 'Monokristalin PERC teknolojili yüksek verimli solar panel',
    power: 540,
    efficiency: 20.89,
    warranty: 25,
    price: 1250.00,
    stock: 500,
    isAvailable: true,
    specifications: {
      width: 2.279,
      height: 1.134,
      thickness: 0.035,
      weight: 27.5,
      dimensions: '2.279m x 1.134m',
      efficiency: 20.89,
      maxPower: 540,
      voltageAtMaxPower: 41.56,
      currentAtMaxPower: 12.99,
      openCircuitVoltage: 49.95,
      shortCircuitCurrent: 13.92,
      tempCoeffPower: -0.35,
      cellType: 'Monocrystalline PERC',
      frameColor: 'Silver',
      backsheetColor: 'White'
    },
    unitType: 'adet',
    currency: 'TRY',
    images: '["https://example.com/jinko-540w.jpg"]'
  },
  {
    name: 'Canadian Solar HiKu6 CS6W-545MS',
    type: 'SOLAR_PANEL',
    brand: 'Canadian Solar',
    model: 'CS6W-545MS',
    description: 'Yüksek verimli monokristalin PERC hücreli solar panel',
    power: 545,
    efficiency: 21.6,
    warranty: 25,
    price: 1290.00,
    stock: 300,
    isAvailable: true,
    specifications: {
      width: 2.261,
      height: 1.134,
      thickness: 0.035,
      weight: 27.6,
      dimensions: '2.261m x 1.134m',
      efficiency: 21.6,
      maxPower: 545,
      voltageAtMaxPower: 41.7,
      currentAtMaxPower: 13.07,
      openCircuitVoltage: 50.1,
      shortCircuitCurrent: 14.01,
      tempCoeffPower: -0.37,
      cellType: 'Monocrystalline PERC',
      frameColor: 'Silver',
      backsheetColor: 'White'
    },
    unitType: 'adet',
    currency: 'TRY',
    images: '["https://example.com/canadian-545w.jpg"]'
  },
  {
    name: 'Trina Solar Vertex S TSM-550NEG9R',
    type: 'SOLAR_PANEL',
    brand: 'Trina Solar',
    model: 'TSM-550NEG9R',
    description: '210mm hücreli yüksek güçlü monokristalin solar panel',
    power: 550,
    efficiency: 21.8,
    warranty: 25,
    price: 1340.00,
    stock: 250,
    isAvailable: true,
    specifications: {
      width: 2.279,
      height: 1.134,
      thickness: 0.035,
      weight: 28.1,
      dimensions: '2.279m x 1.134m',
      efficiency: 21.8,
      maxPower: 550,
      voltageAtMaxPower: 41.8,
      currentAtMaxPower: 13.16,
      openCircuitVoltage: 50.4,
      shortCircuitCurrent: 14.06,
      tempCoeffPower: -0.34,
      cellType: 'Monocrystalline PERC',
      frameColor: 'Black',
      backsheetColor: 'Black'
    },
    unitType: 'adet',
    currency: 'TRY',
    images: '["https://example.com/trina-550w.jpg"]'
  },
  {
    name: 'LONGi Solar Hi-MO 6 LR5-72HIH-555M',
    type: 'SOLAR_PANEL',
    brand: 'LONGi Solar',
    model: 'LR5-72HIH-555M',
    description: 'PERC 2.0 teknolojili premium monokristalin solar panel',
    power: 555,
    efficiency: 22.1,
    warranty: 25,
    price: 1380.00,
    stock: 180,
    isAvailable: true,
    specifications: {
      width: 2.256,
      height: 1.133,
      thickness: 0.035,
      weight: 27.9,
      dimensions: '2.256m x 1.133m',
      efficiency: 22.1,
      maxPower: 555,
      voltageAtMaxPower: 42.1,
      currentAtMaxPower: 13.19,
      openCircuitVoltage: 50.6,
      shortCircuitCurrent: 14.09,
      tempCoeffPower: -0.33,
      cellType: 'Monocrystalline PERC 2.0',
      frameColor: 'Silver',
      backsheetColor: 'White'
    },
    unitType: 'adet',
    currency: 'TRY',
    images: '["https://example.com/longi-555w.jpg"]'
  },
  {
    name: 'JA Solar JAM72S20-440/MR',
    type: 'SOLAR_PANEL',
    brand: 'JA Solar',
    model: 'JAM72S20-440/MR',
    description: 'PERCIUM+ teknolojili yüksek verimli monokristalin panel',
    power: 440,
    efficiency: 20.4,
    warranty: 25,
    price: 980.00,
    stock: 400,
    isAvailable: true,
    specifications: {
      width: 2.008,
      height: 1.002,
      thickness: 0.035,
      weight: 22.5,
      dimensions: '2.008m x 1.002m',
      efficiency: 20.4,
      maxPower: 440,
      voltageAtMaxPower: 40.9,
      currentAtMaxPower: 10.76,
      openCircuitVoltage: 49.5,
      shortCircuitCurrent: 11.51,
      tempCoeffPower: -0.37,
      cellType: 'Monocrystalline PERCIUM+',
      frameColor: 'Silver',
      backsheetColor: 'White'
    },
    unitType: 'adet',
    currency: 'TRY',
    images: '["https://example.com/ja-440w.jpg"]'
  }
]

async function seedSolarPanels() {
  try {
    console.log('🌱 Seeding solar panels...')

    for (const panel of solarPanels) {
      const existingPanel = await prisma.product.findFirst({
        where: {
          brand: panel.brand,
          model: panel.model
        }
      })

      if (existingPanel) {
        console.log(`⏭️  Skipping ${panel.brand} ${panel.model} - already exists`)
        continue
      }

      await prisma.product.create({
        data: panel
      })

      console.log(`✅ Created ${panel.brand} ${panel.model} - ${panel.power}W`)
    }

    console.log('🎉 Solar panel seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding solar panels:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedSolarPanels()