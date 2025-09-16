const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addManualRates() {
  try {
    console.log('📋 Adding manual exchange rates from old data...')

    // Eski verilere göre manuel kurlar ekleyelim
    const manualRates = [
      {
        currency: 'USD',
        rate: 29.7228, // (29 + 30.4456) / 2
        description: 'Manuel USD kuru (eski veriden migrate edildi)',
        userId: 'a710921f-8e90-41aa-a552-108b8c36cc94' // Admin user ID
      },
      {
        currency: 'EUR',
        rate: 32.9999, // (32.7765 + 33.2234) / 2
        description: 'Manuel EUR kuru (eski veriden migrate edildi)',
        userId: 'a710921f-8e90-41aa-a552-108b8c36cc94'
      },
      {
        currency: 'CNY',
        rate: 4.1845, // (4.0734 + 4.2956) / 2
        description: 'Manuel CNY kuru (eski veriden migrate edildi)',
        userId: 'a710921f-8e90-41aa-a552-108b8c36cc94'
      }
    ]

    for (const rate of manualRates) {
      try {
        const created = await prisma.manualExchangeRate.create({
          data: {
            currency: rate.currency,
            rate: rate.rate,
            description: rate.description,
            isActive: true,
            createdBy: rate.userId
          }
        })

        console.log(`✅ Added ${rate.currency}: ${rate.rate}`)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  ${rate.currency} already exists, skipping...`)
        } else {
          throw error
        }
      }
    }

    console.log('\n🎉 Manual exchange rates added successfully!')

    // Verileri kontrol edelim
    const allRates = await prisma.manualExchangeRate.findMany({
      include: {
        creator: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    console.log('\n📋 Current manual rates:')
    allRates.forEach(rate => {
      console.log(`- ${rate.currency}: ${rate.rate} (${rate.isActive ? 'Active' : 'Inactive'})`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addManualRates()