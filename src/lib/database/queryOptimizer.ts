import { Prisma } from '@prisma/client'

export class QueryOptimizer {
  /**
   * Optimizes project queries by selecting only necessary fields
   */
  static getProjectSelectFields(includeRelations = false): Prisma.ProjectSelect {
    const baseFields: Prisma.ProjectSelect = {
      id: true,
      name: true,
      status: true,
      capacity: true,
      actualCost: true,
      estimatedCost: true,
      createdAt: true,
      updatedAt: true
    }

    if (includeRelations) {
      return {
        ...baseFields,
        company: {
          select: {
            id: true,
            name: true
          }
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true
          }
        }
      }
    }

    return baseFields
  }

  /**
   * Optimizes quote queries for financial calculations
   */
  static getQuoteSelectFields(): Prisma.QuoteSelect {
    return {
      id: true,
      total: true,
      status: true,
      createdAt: true,
      approvedAt: true,
      projectId: true
    }
  }

  /**
   * Creates optimized date filters
   */
  static createDateFilter(startDate?: string, endDate?: string): Prisma.DateTimeFilter | undefined {
    if (!startDate && !endDate) return undefined

    const filter: Prisma.DateTimeFilter = {}
    
    if (startDate) {
      filter.gte = new Date(startDate)
    }
    
    if (endDate) {
      filter.lte = new Date(endDate)
    }

    return filter
  }

  /**
   * Batches database operations for better performance
   */
  static async batchQueries<T>(
    queries: (() => Promise<T>)[],
    batchSize = 5
  ): Promise<T[]> {
    const results: T[] = []
    
    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize)
      const batchResults = await Promise.all(batch.map(query => query()))
      results.push(...batchResults)
    }
    
    return results
  }
}