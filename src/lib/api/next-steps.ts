import { ProjectRequestNextStep, Priority } from '@/types/next-step'

const API_BASE_URL = '/api'

export class NextStepAPI {
  /**
   * Get next steps for a specific project request
   */
  static async getNextStepsForRequest(projectRequestId: string): Promise<ProjectRequestNextStep[]> {
    const response = await fetch(`${API_BASE_URL}/project-requests/${projectRequestId}/next-steps`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch next steps: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Create a custom next step
   */
  static async createCustomStep(
    projectRequestId: string,
    title: string,
    description?: string,
    dueDate?: Date,
    priority: Priority = 'MEDIUM'
  ): Promise<ProjectRequestNextStep> {
    const response = await fetch(`${API_BASE_URL}/project-requests/${projectRequestId}/next-steps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        dueDate: dueDate?.toISOString() || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default to tomorrow
        priority
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create next step: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Complete a next step
   */
  static async completeStep(stepId: string): Promise<ProjectRequestNextStep> {
    const response = await fetch(`${API_BASE_URL}/next-steps/${stepId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ complete: true }),
    })

    if (!response.ok) {
      throw new Error(`Failed to complete next step: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Update a next step
   */
  static async updateStep(
    stepId: string,
    updates: Partial<{
      title: string
      description: string
      dueDate: Date
      priority: Priority
    }>
  ): Promise<ProjectRequestNextStep> {
    const body: any = {}

    if (updates.title !== undefined) body.title = updates.title
    if (updates.description !== undefined) body.description = updates.description
    if (updates.dueDate !== undefined) body.dueDate = updates.dueDate.toISOString()
    if (updates.priority !== undefined) body.priority = updates.priority

    const response = await fetch(`${API_BASE_URL}/next-steps/${stepId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Failed to update next step: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Delete a next step
   */
  static async deleteStep(stepId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/next-steps/${stepId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete next step: ${response.statusText}`)
    }
  }

  /**
   * Get next step statistics
   */
  static async getNextStepStats(): Promise<{
    totalActive: number
    overdue: number
    dueToday: number
    dueTomorrow: number
    completedThisWeek: number
  }> {
    const response = await fetch(`${API_BASE_URL}/next-steps/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch next step stats: ${response.statusText}`)
    }

    return response.json()
  }
}