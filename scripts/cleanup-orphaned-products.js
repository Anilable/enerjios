#!/usr/bin/env node

// Script to clean up orphaned custom products from database
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupOrphanedProducts() {
  try {
    console.log('🧹 Checking for orphaned custom products...\n')

    // Find products with "Custom" brand
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

    console.log(`📊 Found ${customProducts.length} products with "Custom" brand\n`)

    if (customProducts.length === 0) {
      console.log('✅ No custom products found - nothing to clean up')
      return
    }

    // Filter orphaned products (no references)
    const orphanedProducts = customProducts.filter(product =>
      product._count.quoteItems === 0 && product._count.panelPlacements === 0
    )

    console.log(`🎯 Found ${orphanedProducts.length} orphaned custom products:\n`)

    orphanedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   Brand: ${product.brand}`)
      console.log(`   Type: ${product.type}`)
      console.log(`   Quote Items: ${product._count.quoteItems}`)
      console.log(`   Panel Placements: ${product._count.panelPlacements}`)
      console.log(`   Product ID: ${product.id}`)
      console.log('')
    })

    if (orphanedProducts.length === 0) {
      console.log('✅ No orphaned custom products found')
      return
    }

    console.log('🗑️  Starting deletion of orphaned custom products...\n')

    let deletedCount = 0

    for (const product of orphanedProducts) {
      try {
        console.log(`Deleting orphaned product: ${product.name}`)

        await prisma.product.delete({
          where: {
            id: product.id
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
    console.log(`   • Orphaned custom products found: ${orphanedProducts.length}`)
    console.log(`   • Successfully deleted: ${deletedCount}`)
    console.log(`   • Failed deletions: ${orphanedProducts.length - deletedCount}`)

    // Show remaining custom products (if any)
    const remainingCustomProducts = customProducts.filter(product =>
      product._count.quoteItems > 0 || product._count.panelPlacements > 0
    )

    if (remainingCustomProducts.length > 0) {
      console.log(`\n📋 Remaining custom products (still in use):`)
      remainingCustomProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product._count.quoteItems} quote items, ${product._count.panelPlacements} panel placements)`)
      })
    }

  } catch (error) {
    console.error('💥 Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
    console.log('\n🔌 Database connection closed')
  }
}

// Run the cleanup
cleanupOrphanedProducts()
  .then(() => {
    console.log('✨ Cleanup script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })