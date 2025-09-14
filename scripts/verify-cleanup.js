#!/usr/bin/env node

// Script to verify cleanup results
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyCleanup() {
  try {
    console.log('🔍 Verifying cleanup results...\n')

    // Check remaining quote items
    const remainingQuoteItems = await prisma.quoteItem.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            type: true
          }
        },
        quote: {
          select: {
            id: true,
            quoteNumber: true,
            status: true
          }
        }
      }
    })

    console.log(`📊 Total quote items remaining: ${remainingQuoteItems.length}`)

    // Filter custom items that might still exist
    const customItemsRemaining = remainingQuoteItems.filter(item =>
      item.product.brand === 'Custom' ||
      item.product.name.includes('Custom') ||
      item.product.name.includes('Özel')
    )

    if (customItemsRemaining.length > 0) {
      console.log(`⚠️  Found ${customItemsRemaining.length} custom items still remaining:`)
      customItemsRemaining.forEach((item, index) => {
        console.log(`${index + 1}. ${item.product.name} in quote #${item.quote.quoteNumber}`)
        console.log(`   Brand: ${item.product.brand}`)
        console.log(`   Type: ${item.product.type}`)
        console.log(`   Item ID: ${item.id}`)
        console.log(`   Product ID: ${item.product.id}`)
        console.log('')
      })

      // Delete these remaining items
      console.log('🗑️  Deleting remaining custom items...')
      for (const item of customItemsRemaining) {
        try {
          await prisma.quoteItem.delete({
            where: { id: item.id }
          })
          console.log(`✅ Deleted ${item.product.name} from quote #${item.quote.quoteNumber}`)
        } catch (error) {
          console.log(`❌ Failed to delete: ${error.message}`)
        }
      }
    } else {
      console.log('✅ No custom quote items remaining')
    }

    // Check remaining custom products
    console.log('\n🧹 Checking remaining custom products...')
    const customProducts = await prisma.product.findMany({
      where: {
        brand: 'Custom'
      },
      include: {
        _count: {
          select: {
            quoteItems: true,
            panelPlacements: true
          }
        }
      }
    })

    console.log(`📊 Total custom products remaining: ${customProducts.length}`)

    if (customProducts.length > 0) {
      console.log('Custom products:')
      for (const product of customProducts) {
        console.log(`- ${product.name} (${product._count.quoteItems} quote items, ${product._count.panelPlacements} panel placements)`)

        // If no references, delete it
        if (product._count.quoteItems === 0 && product._count.panelPlacements === 0) {
          try {
            await prisma.product.delete({
              where: { id: product.id }
            })
            console.log(`  ✅ Deleted orphaned product`)
          } catch (error) {
            console.log(`  ❌ Failed to delete: ${error.message}`)
          }
        }
      }
    }

    console.log('\n🎉 Verification and cleanup completed!')

  } catch (error) {
    console.error('💥 Error during verification:', error)
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Database connection closed')
  }
}

// Run the verification
verifyCleanup()
  .then(() => {
    console.log('✨ Verification completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Verification failed:', error)
    process.exit(1)
  })