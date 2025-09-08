import { cn, formatCurrency, formatNumber, calculateROI, formatDate } from '../utils'

describe('Utils Functions', () => {
  describe('cn function', () => {
    it('merges class names correctly', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
    })

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'ignored')).toBe('base conditional')
    })

    it('handles conflicting Tailwind classes', () => {
      // Should keep the last conflicting class
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })
  })

  describe('formatCurrency function', () => {
    it('formats Turkish Lira correctly', () => {
      expect(formatCurrency(1234.56)).toBe('₺1.234,56')
    })

    it('handles zero amount', () => {
      expect(formatCurrency(0)).toBe('₺0,00')
    })

    it('handles negative amounts', () => {
      expect(formatCurrency(-1000)).toBe('-₺1.000,00')
    })

    it('handles large numbers', () => {
      expect(formatCurrency(1000000)).toBe('₺1.000.000,00')
    })
  })

  describe('formatNumber function', () => {
    it('formats numbers with proper separators', () => {
      expect(formatNumber(1234.56)).toBe('1.234,56')
    })

    it('handles integers', () => {
      expect(formatNumber(1000)).toBe('1.000')
    })

    it('handles decimal precision', () => {
      expect(formatNumber(123.456, 2)).toBe('123,46')
    })
  })

  describe('calculateROI function', () => {
    it('calculates ROI correctly', () => {
      const roi = calculateROI({
        initialInvestment: 100000,
        annualSavings: 20000,
        systemLifespan: 25,
        maintenanceCost: 1000
      })

      expect(roi).toHaveProperty('paybackPeriod')
      expect(roi).toHaveProperty('totalSavings')
      expect(roi).toHaveProperty('netProfit')
      expect(roi).toHaveProperty('roi')
      expect(typeof roi.paybackPeriod).toBe('number')
    })

    it('handles edge cases', () => {
      const roi = calculateROI({
        initialInvestment: 100000,
        annualSavings: 0,
        systemLifespan: 25,
        maintenanceCost: 1000
      })

      expect(roi.paybackPeriod).toBe(Infinity)
    })
  })

  describe('formatDate function', () => {
    it('formats date in Turkish locale', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const formatted = formatDate(date)
      expect(formatted).toContain('2024')
    })

    it('handles different date formats', () => {
      const date = new Date('2024-06-15')
      const formatted = formatDate(date, { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
      expect(formatted).toMatch(/\d+\s\w+\s2024/)
    })
  })
})