const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugQuotes() {
  try {
    console.log('🔍 Checking existing quotes...')

    const quotes = await prisma.quote.findMany({
      select: {
        id: true,
        quoteNumber: true,
        createdAt: true,
        status: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Total quotes in database: ${quotes.length}`)

    if (quotes.length > 0) {
      console.log('\n📋 Recent quotes:')
      quotes.forEach((quote, index) => {
        console.log(`${index + 1}. ${quote.quoteNumber} - ${quote.status} - ${quote.createdAt}`)
      })

      // Check for duplicates
      const quoteNumbers = quotes.map(q => q.quoteNumber)
      const duplicates = quoteNumbers.filter((item, index) => quoteNumbers.indexOf(item) !== index)

      if (duplicates.length > 0) {
        console.log('\n🚨 DUPLICATE QUOTE NUMBERS FOUND:')
        duplicates.forEach(dup => console.log(`- ${dup}`))
      } else {
        console.log('\n✅ No duplicate quote numbers found')
      }
    }

    // Test generating new quote number (using same algorithm as API)
    console.log('\n🆔 Testing new quote number generation:')
    for (let i = 0; i < 5; i++) {
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 8).toUpperCase()
      const uuid = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
      const newQuoteNumber = `Q-${timestamp}-${random}-${uuid}`
      console.log(`${i + 1}. ${newQuoteNumber}`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugQuotes()