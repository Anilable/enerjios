#!/usr/bin/env node

/**
 * Performance Audit Script for Trakya Solar
 * Analyzes bundle size, lighthouse scores, and performance metrics
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const PERFORMANCE_BUDGETS = {
  // Bundle sizes (gzipped)
  mainJs: 300 * 1024, // 300KB
  mainCss: 50 * 1024, // 50KB
  totalJs: 1000 * 1024, // 1MB
  totalCss: 100 * 1024, // 100KB
  
  // Lighthouse scores (0-100)
  performance: 90,
  accessibility: 95,
  bestPractices: 90,
  seo: 95,
  
  // Core Web Vitals
  lcp: 2500, // Largest Contentful Paint (ms)
  fid: 100,  // First Input Delay (ms)
  cls: 0.1,  // Cumulative Layout Shift
}

class PerformanceAuditor {
  constructor() {
    this.results = {
      bundleAnalysis: {},
      lighthouse: {},
      recommendations: []
    }
  }

  async analyzeBundleSize() {
    console.log('🔍 Analyzing bundle sizes...')
    
    try {
      // Build the application first
      console.log('Building application...')
      execSync('npm run build', { stdio: 'inherit' })
      
      // Analyze bundle with next/bundle-analyzer
      process.env.ANALYZE = 'true'
      execSync('npm run build', { stdio: 'pipe' })
      
      // Read build manifest
      const buildManifestPath = path.join(process.cwd(), '.next/build-manifest.json')
      if (fs.existsSync(buildManifestPath)) {
        const buildManifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'))
        this.results.bundleAnalysis = this.analyzeBuildManifest(buildManifest)
      }
      
      // Read static file sizes
      this.analyzeStaticFiles()
      
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message)
      this.results.recommendations.push('Fix build errors before analyzing bundle size')
    }
  }

  analyzeBuildManifest(manifest) {
    const analysis = {
      pages: {},
      shared: [],
      totalSize: 0
    }

    // Analyze each page's bundle
    for (const [page, files] of Object.entries(manifest.pages)) {
      let pageSize = 0
      
      files.forEach(file => {
        const filePath = path.join(process.cwd(), '.next', file)
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath)
          pageSize += stats.size
        }
      })
      
      analysis.pages[page] = {
        files: files.length,
        size: pageSize
      }
      analysis.totalSize += pageSize
    }

    return analysis
  }

  analyzeStaticFiles() {
    const staticDir = path.join(process.cwd(), '.next/static')
    if (!fs.existsSync(staticDir)) return

    let totalJsSize = 0
    let totalCssSize = 0

    const analyzeDirectory = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true })
      
      files.forEach(file => {
        const filePath = path.join(dir, file.name)
        
        if (file.isDirectory()) {
          analyzeDirectory(filePath)
        } else if (file.isFile()) {
          const stats = fs.statSync(filePath)
          const ext = path.extname(file.name)
          
          if (ext === '.js') {
            totalJsSize += stats.size
          } else if (ext === '.css') {
            totalCssSize += stats.size
          }
        }
      })
    }

    analyzeDirectory(staticDir)

    this.results.bundleAnalysis.static = {
      totalJsSize,
      totalCssSize,
      jsFiles: Math.floor(totalJsSize / 1024) + ' KB',
      cssFiles: Math.floor(totalCssSize / 1024) + ' KB'
    }

    // Check against budgets
    if (totalJsSize > PERFORMANCE_BUDGETS.totalJs) {
      this.results.recommendations.push(
        `JavaScript bundle too large: ${Math.floor(totalJsSize / 1024)}KB > ${Math.floor(PERFORMANCE_BUDGETS.totalJs / 1024)}KB`
      )
    }

    if (totalCssSize > PERFORMANCE_BUDGETS.totalCss) {
      this.results.recommendations.push(
        `CSS bundle too large: ${Math.floor(totalCssSize / 1024)}KB > ${Math.floor(PERFORMANCE_BUDGETS.totalCss / 1024)}KB`
      )
    }
  }

  async runLighthouse() {
    console.log('🚀 Running Lighthouse audit...')
    
    try {
      // Start the development server
      console.log('Starting development server...')
      const server = execSync('npm run dev &', { stdio: 'pipe' })
      
      // Wait for server to be ready
      await this.waitForServer('http://localhost:3000')
      
      // Run lighthouse
      const lighthouse = require('lighthouse')
      const chromeLauncher = require('chrome-launcher')
      
      const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })
      const options = { logLevel: 'info', output: 'json', port: chrome.port }
      const runnerResult = await lighthouse('http://localhost:3000', options)
      
      await chrome.kill()
      
      // Process results
      this.results.lighthouse = this.processLighthouseResults(runnerResult.lhr)
      
    } catch (error) {
      console.error('❌ Lighthouse audit failed:', error.message)
      this.results.recommendations.push('Fix server startup issues before running Lighthouse')
    }
  }

  processLighthouseResults(lhr) {
    const scores = {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
      seo: Math.round(lhr.categories.seo.score * 100)
    }

    // Core Web Vitals
    const vitals = {
      lcp: lhr.audits['largest-contentful-paint'].displayValue,
      fid: lhr.audits['max-potential-fid'].displayValue,
      cls: lhr.audits['cumulative-layout-shift'].displayValue
    }

    // Check against budgets
    Object.entries(scores).forEach(([metric, score]) => {
      if (score < PERFORMANCE_BUDGETS[metric]) {
        this.results.recommendations.push(
          `${metric} score too low: ${score} < ${PERFORMANCE_BUDGETS[metric]}`
        )
      }
    })

    return { scores, vitals }
  }

  async waitForServer(url, timeout = 30000) {
    const start = Date.now()
    
    while (Date.now() - start < timeout) {
      try {
        const response = await fetch(url)
        if (response.ok) return
      } catch (error) {
        // Server not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    throw new Error('Server failed to start within timeout')
  }

  generateRecommendations() {
    console.log('💡 Generating performance recommendations...')
    
    const recommendations = [
      // Bundle optimization
      'Consider code splitting for large pages',
      'Use dynamic imports for heavy components',
      'Enable tree shaking for unused code',
      'Optimize images with next/image',
      'Use compression middleware',
      
      // Runtime optimization
      'Implement service worker caching',
      'Use React.memo for expensive components',
      'Optimize database queries',
      'Enable CDN for static assets',
      'Use performance monitoring tools'
    ]

    this.results.recommendations.push(...recommendations)
  }

  generateReport() {
    console.log('\n📊 Performance Audit Report')
    console.log('================================')
    
    // Bundle Analysis
    if (this.results.bundleAnalysis.static) {
      console.log('\n📦 Bundle Analysis:')
      console.log(`JavaScript: ${this.results.bundleAnalysis.static.jsFiles}`)
      console.log(`CSS: ${this.results.bundleAnalysis.static.cssFiles}`)
    }
    
    // Lighthouse Scores
    if (this.results.lighthouse.scores) {
      console.log('\n🚨 Lighthouse Scores:')
      Object.entries(this.results.lighthouse.scores).forEach(([metric, score]) => {
        const emoji = score >= 90 ? '✅' : score >= 50 ? '⚠️' : '❌'
        console.log(`${emoji} ${metric}: ${score}/100`)
      })
    }
    
    // Core Web Vitals
    if (this.results.lighthouse.vitals) {
      console.log('\n⚡ Core Web Vitals:')
      Object.entries(this.results.lighthouse.vitals).forEach(([metric, value]) => {
        console.log(`${metric.toUpperCase()}: ${value}`)
      })
    }
    
    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:')
      this.results.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`)
      })
    }

    // Save report
    const reportPath = path.join(process.cwd(), 'performance-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2))
    console.log(`\n📄 Full report saved to: ${reportPath}`)
  }

  async run() {
    console.log('🚀 Starting Trakya Solar Performance Audit...\n')
    
    await this.analyzeBundleSize()
    // await this.runLighthouse() // Uncomment when ready
    this.generateRecommendations()
    this.generateReport()
    
    console.log('\n✨ Performance audit complete!')
  }
}

// Run the auditor
if (require.main === module) {
  const auditor = new PerformanceAuditor()
  auditor.run().catch(error => {
    console.error('❌ Performance audit failed:', error)
    process.exit(1)
  })
}

module.exports = PerformanceAuditor