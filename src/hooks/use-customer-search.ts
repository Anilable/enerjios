import { useState, useEffect } from 'react'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  previousProjects?: number
  totalCapacity?: number
}

export function useCustomerSearch(query: string) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (query.length < 2) {
      setCustomers([])
      return
    }

    const searchCustomers = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`)
        
        if (!response.ok) {
          throw new Error('Failed to search customers')
        }

        const data = await response.json()
        setCustomers(data)
      } catch (err) {
        console.error('Customer search error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        setCustomers([])
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce the search
    const timeoutId = setTimeout(searchCustomers, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  return { customers, isLoading, error }
}