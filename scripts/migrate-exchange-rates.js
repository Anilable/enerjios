const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateExchangeRates() {
  try {
    console.log('📋 Reading existing CustomExchangeRate data...')

    // Eski verileri oku
    const oldRates = await prisma.customExchangeRate.findMany({
      include: {
        updatedBy: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    console.log(`Found ${oldRates.length} existing rates:`)
    oldRates.forEach(rate => {
      console.log(`- ${rate.currency}: Buying ${rate.buyingRate}, Selling ${rate.sellingRate} (updated by ${rate.updatedBy?.email || rate.updatedById})`)
    })

    if (oldRates.length === 0) {
      console.log('✅ No existing data to migrate')
      return
    }

    console.log('\n💾 Creating ManualExchangeRate table...')

    // Yeni tabloyu oluştur
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ManualExchangeRate" (
        "id" TEXT NOT NULL,
        "currency" TEXT NOT NULL,
        "rate" DOUBLE PRECISION NOT NULL,
        "description" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdBy" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "ManualExchangeRate_pkey" PRIMARY KEY ("id")
      );
    `

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "ManualExchangeRate_currency_isActive_key"
      ON "ManualExchangeRate"("currency", "isActive");
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "ManualExchangeRate_currency_idx"
      ON "ManualExchangeRate"("currency");
    `

    await prisma.$executeRaw`
      ALTER TABLE "ManualExchangeRate"
      ADD CONSTRAINT IF NOT EXISTS "ManualExchangeRate_createdBy_fkey"
      FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    `

    console.log('✅ ManualExchangeRate table created')

    console.log('\n🔄 Migrating data...')

    // Verileri yeni tabloya kopyala (ortalama kur kullan)
    for (const oldRate of oldRates) {
      const newRateId = 'mer_' + Math.random().toString(36).substring(2, 15)
      const averageRate = (oldRate.buyingRate + oldRate.sellingRate) / 2

      await prisma.$executeRaw`
        INSERT INTO "ManualExchangeRate" (
          "id", "currency", "rate", "description", "isActive",
          "createdBy", "createdAt", "updatedAt"
        ) VALUES (
          ${newRateId}, ${oldRate.currency}, ${averageRate},
          ${'Migrated from CustomExchangeRate (average of buy/sell rates)'},
          true, ${oldRate.updatedById}, ${oldRate.updatedAt}, ${oldRate.updatedAt}
        )
      `

      console.log(`✅ Migrated ${oldRate.currency}: ${averageRate} (average of ${oldRate.buyingRate}/${oldRate.sellingRate})`)
    }

    console.log('\n🗑️  Dropping old CustomExchangeRate table...')
    await prisma.$executeRaw`DROP TABLE "CustomExchangeRate"`
    console.log('✅ Old table dropped')

    console.log('\n✨ Migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateExchangeRates()
  .catch(console.error)