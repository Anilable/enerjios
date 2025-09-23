import { z } from 'zod'

export const reportQuerySchema = z.object({
  type: z.enum(['sales-summary', 'project-performance', 'customer-analytics', 'financial-overview', 'company-performance'])
    .default('sales-summary'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('month')
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate)
    }
    return true
  },
  {
    message: "Start date must be before or equal to end date",
    path: ["startDate"]
  }
)

export const financeQuerySchema = z.object({
  type: z.enum(['overview', 'invoices', 'expenses', 'revenue']).default('overview')
})

export const databaseQuerySchema = z.object({
  includeStats: z.boolean().default(true),
  includePerformance: z.boolean().default(false)
})

export type ReportQuery = z.infer<typeof reportQuerySchema>
export type FinanceQuery = z.infer<typeof financeQuerySchema>
export type DatabaseQuery = z.infer<typeof databaseQuerySchema>