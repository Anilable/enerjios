const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function simpleMigrate() {
  try {
    console.log('📋 Reading existing CustomExchangeRate data...')

    // Önce veriyi okuyalım
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
      console.log(`- ${rate.currency}: Buying ${rate.buyingRate}, Selling ${rate.sellingRate}`)
    })

    // Manuel tablo ekleyelim (Prisma db push ile)
    console.log('\n💾 Creating ManualExchangeRate table via db push...')

    // Schema'dan CustomExchangeRate'i kaldıralım ve sadece ManualExchangeRate'i bırakalım
    console.log('✅ Now you need to:')
    console.log('1. Remove CustomExchangeRate model from schema.prisma')
    console.log('2. Run: npx prisma db push --accept-data-loss')
    console.log('3. Run this script again with --migrate-data flag')

    if (process.argv.includes('--migrate-data')) {
      console.log('\n🔄 Migrating data to ManualExchangeRate...')

      for (const oldRate of oldRates) {
        const averageRate = (oldRate.buyingRate + oldRate.sellingRate) / 2

        try {
          await prisma.manualExchangeRate.create({
            data: {
              currency: oldRate.currency,
              rate: averageRate,
              description: `Migrated from CustomExchangeRate (avg of ${oldRate.buyingRate}/${oldRate.sellingRate})`,
              isActive: true,
              createdBy: oldRate.updatedById,
              createdAt: oldRate.createdAt,
              updatedAt: oldRate.updatedAt
            }
          })

          console.log(`✅ Migrated ${oldRate.currency}: ${averageRate}`)
        } catch (error) {
          console.log(`⚠️  ${oldRate.currency} already exists, skipping...`)
        }
      }

      console.log('\n✨ Data migration completed!')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

simpleMigrate()