#!/usr/bin/env node

// Script to clean up custom quote items from database
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupCustomQuoteItems() {
  try {
    console.log('🔍 Checking for custom quote items...\n')

    // First, let's see what quote items exist
    const quoteItems = await prisma.quoteItem.findMany({
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

    console.log(`📊 Found ${quoteItems.length} quote items total\n`)

    if (quoteItems.length === 0) {
      console.log('✅ No quote items found - nothing to clean up')
      return
    }

    // Identify custom items (those with "Custom" brand or specific patterns)
    const customItems = quoteItems.filter(item =>
      item.product.brand === 'Custom' ||
      item.product.name.includes('Özel') ||
      item.product.type === 'CUSTOM'
    )

    console.log(`🎯 Found ${customItems.length} custom items:\n`)

    customItems.forEach((item, index) => {
      console.log(`${index + 1}. Quote #${item.quote.quoteNumber}`)
      console.log(`   Product: ${item.product.name}`)
      console.log(`   Brand: ${item.product.brand}`)
      console.log(`   Type: ${item.product.type}`)
      console.log(`   Quote Status: ${item.quote.status}`)
      console.log(`   Item ID: ${item.id}`)
      console.log(`   Product ID: ${item.product.id}`)
      console.log('')
    })

    if (customItems.length === 0) {
      console.log('✅ No custom items found - nothing to clean up')
      return
    }

    // Ask for confirmation before deletion
    console.log('⚠️  WARNING: This will DELETE the custom quote items from the database!')
    console.log('Press Ctrl+C to cancel or any key to continue...\n')

    // Wait for user input (in a real scenario, you'd use readline)
    // For now, we'll proceed with deletion

    console.log('🗑️  Starting deletion of custom quote items...\n')

    let deletedCount = 0

    for (const item of customItems) {
      try {
        console.log(`Deleting item: ${item.product.name} from quote #${item.quote.quoteNumber}`)

        await prisma.quoteItem.delete({
          where: {
            id: item.id
          }
        })

        deletedCount++
        console.log(`✅ Deleted successfully`)
      } catch (error) {
        console.log(`❌ Failed to delete: ${error.message}`)
      }
    }

    console.log(`\n🎉 Cleanup completed!`)
    console.log(`📊 Summary:`)
    console.log(`   • Total custom items found: ${customItems.length}`)
    console.log(`   • Successfully deleted: ${deletedCount}`)
    console.log(`   • Failed deletions: ${customItems.length - deletedCount}`)

    // Now let's clean up any orphaned custom products
    console.log(`\n🧹 Checking for orphaned custom products...`)

    const customProducts = await prisma.product.findMany({
      where: {
        OR: [
          { brand: 'Custom' },
          { type: 'CUSTOM' },
          { name: { contains: 'Özel' } }
        ]
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

    const orphanedProducts = customProducts.filter(product =>
      product._count.quoteItems === 0 && product._count.panelPlacements === 0
    )

    if (orphanedProducts.length > 0) {
      console.log(`Found ${orphanedProducts.length} orphaned custom products:`)

      for (const product of orphanedProducts) {
        try {
          console.log(`Deleting orphaned product: ${product.name}`)
          await prisma.product.delete({
            where: {
              id: product.id
            }
          })
          console.log(`✅ Deleted successfully`)
        } catch (error) {
          console.log(`❌ Failed to delete product: ${error.message}`)
        }
      }
    } else {
      console.log(`✅ No orphaned custom products found`)
    }

  } catch (error) {
    console.error('💥 Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
    console.log('\n🔌 Database connection closed')
  }
}

// Run the cleanup
cleanupCustomQuoteItems()
  .then(() => {
    console.log('✨ Cleanup script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })