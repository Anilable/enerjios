#!/usr/bin/env node

// Connection pool stress test script
const http = require('http')

const BASE_URL = 'http://localhost:3001'
const ENDPOINTS = [
  '/api/health/db',
  '/api/ping',
  '/api/exchange-rates'
]

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const req = http.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        const duration = Date.now() - start
        resolve({
          url,
          status: res.statusCode,
          duration,
          success: res.statusCode < 400
        })
      })
    })

    req.on('error', reject)
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

async function runStressTest() {
  console.log('🚀 Starting connection pool stress test...\n')

  const results = []
  const concurrentRequests = 20
  const totalRequests = 100

  console.log(`📊 Configuration:`)
  console.log(`   • Concurrent requests: ${concurrentRequests}`)
  console.log(`   • Total requests: ${totalRequests}`)
  console.log(`   • Endpoints: ${ENDPOINTS.length}`)
  console.log('')

  const startTime = Date.now()

  for (let batch = 0; batch < totalRequests / concurrentRequests; batch++) {
    console.log(`🔄 Batch ${batch + 1}/${totalRequests / concurrentRequests}`)

    const batchPromises = []
    for (let i = 0; i < concurrentRequests; i++) {
      const endpoint = ENDPOINTS[i % ENDPOINTS.length]
      const url = BASE_URL + endpoint
      batchPromises.push(makeRequest(url))
    }

    try {
      const batchResults = await Promise.allSettled(batchPromises)
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          results.push({
            url: BASE_URL + ENDPOINTS[index % ENDPOINTS.length],
            status: 0,
            duration: 0,
            success: false,
            error: result.reason?.message || 'Unknown error'
          })
        }
      })
    } catch (error) {
      console.error(`❌ Batch ${batch + 1} failed:`, error.message)
    }

    // Brief pause between batches
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  const endTime = Date.now()
  const totalDuration = endTime - startTime

  // Analyze results
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length

  console.log('\n📈 Results:')
  console.log(`   • Total requests: ${results.length}`)
  console.log(`   • Successful: ${successful.length} (${((successful.length / results.length) * 100).toFixed(1)}%)`)
  console.log(`   • Failed: ${failed.length}`)
  console.log(`   • Average response time: ${avgDuration.toFixed(0)}ms`)
  console.log(`   • Total test time: ${totalDuration}ms`)
  console.log(`   • Requests per second: ${(results.length / (totalDuration / 1000)).toFixed(1)}`)

  if (failed.length > 0) {
    console.log('\n❌ Failed requests:')
    failed.slice(0, 5).forEach(f => {
      console.log(`   • ${f.url}: ${f.error || 'HTTP ' + f.status}`)
    })
    if (failed.length > 5) {
      console.log(`   • ... and ${failed.length - 5} more`)
    }
  }

  // Connection pool health check
  console.log('\n🔍 Final connection pool check...')
  try {
    const healthResult = await makeRequest(BASE_URL + '/api/health/db')
    console.log(`   • Health check: ${healthResult.success ? '✅ Healthy' : '❌ Unhealthy'}`)
    console.log(`   • Response time: ${healthResult.duration}ms`)
  } catch (error) {
    console.log(`   • Health check failed: ${error.message}`)
  }

  console.log('\n🎉 Connection pool stress test completed!')

  if (successful.length === results.length && avgDuration < 1000) {
    console.log('✅ All tests passed - connection pool is stable!')
    process.exit(0)
  } else {
    console.log('⚠️  Some issues detected - check connection pool configuration')
    process.exit(1)
  }
}

runStressTest().catch(error => {
  console.error('💥 Stress test failed:', error)
  process.exit(1)
})