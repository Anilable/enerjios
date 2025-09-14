#!/usr/bin/env node

// Final verification script
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function finalCheck() {
  try {
    console.log('🔍 Final cleanup verification...\n')

    // Check quote items
    const quoteItems = await prisma.quoteItem.findMany({
      include: {
        product: {
          select: {
            name: true,
            brand: true
          }
        }
      }
    })

    const customItems = quoteItems.filter(item => item.product.brand === 'Custom')

    console.log(`📊 Total quote items: ${quoteItems.length}`)
    console.log(`🎯 Custom quote items: ${customItems.length}`)

    // Check custom products
    const customProducts = await prisma.product.findMany({
      where: {
        brand: 'Custom'
      }
    })

    console.log(`📦 Custom products: ${customProducts.length}`)

    if (customItems.length === 0 && customProducts.length === 0) {
      console.log('\n✅ SUCCESS: All custom items and products have been cleaned up!')
    } else {
      console.log('\n⚠️  Some custom items still remain:')
      if (customItems.length > 0) {
        console.log(`- ${customItems.length} custom quote items`)
      }
      if (customProducts.length > 0) {
        console.log(`- ${customProducts.length} custom products`)
      }
    }

  } catch (error) {
    console.error('💥 Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

finalCheck()