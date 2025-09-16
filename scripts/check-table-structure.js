const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTableStructure() {
  try {
    console.log('🔍 Checking CustomExchangeRate table structure...')

    // Tablo yapısını kontrol et
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'CustomExchangeRate'
      ORDER BY ordinal_position;
    `

    console.log('📊 Table columns:')
    tableInfo.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`)
    })

    // Verileri raw olarak oku
    console.log('\n📋 Existing data:')
    const data = await prisma.$queryRaw`SELECT * FROM "CustomExchangeRate"`

    if (data.length === 0) {
      console.log('No data found')
    } else {
      data.forEach((row, index) => {
        console.log(`${index + 1}. `, row)
      })
    }

  } catch (error) {
    console.error('❌ Error checking table:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTableStructure()