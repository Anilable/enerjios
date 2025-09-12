import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting utilities
export function formatCurrency(amount: number, currency: string = 'TRY'): string {
  const formatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'TRY' ? 0 : 2,
  })
  
  return formatter.format(amount)
}

// Number formatting utilities
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  const formatter = new Intl.NumberFormat('tr-TR', options)
  return formatter.format(value)
}

// Percentage formatting
export function formatPercentage(value: number, decimals: number = 1): string {
  return `%${value.toFixed(decimals)}`
}

// Large number formatting (K, M, B)
export function formatCompactNumber(value: number): string {
  const formatter = new Intl.NumberFormat('tr-TR', {
    notation: 'compact',
    compactDisplay: 'short'
  })
  return formatter.format(value)
}

// Date formatting utilities
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const formatter = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    ...options
  })
  return formatter.format(dateObj)
}

// Time formatting
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const formatter = new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  })
  return formatter.format(dateObj)
}

// Energy units formatting
export function formatEnergy(value: number, unit: 'Wh' | 'kWh' | 'MWh' = 'kWh'): string {
  return `${formatNumber(value)} ${unit}`
}

// Power units formatting
export function formatPower(value: number, unit: 'W' | 'kW' | 'MW' = 'kW'): string {
  return `${formatNumber(value)} ${unit}`
}