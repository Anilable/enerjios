import { prisma } from '@/lib/db'
import { ProjectRequestStatus } from '@/types/project-request'
import { NextStepType, NextStepAutomationRule, ProjectRequestNextStep, Priority, DEFAULT_AUTOMATION_RULES } from '@/types/next-step'

export class NextStepAutomationService {
  /**
   * Initialize default automation rules if they don't exist
   */
  static async initializeDefaultRules(): Promise<void> {
    for (const rule of DEFAULT_AUTOMATION_RULES) {
      const existing = await prisma.nextStepAutomationRule.findFirst({
        where: {
          triggerStatus: rule.triggerStatus,
          stepType: rule.stepType
        }
      })

      if (!existing) {
        await prisma.nextStepAutomationRule.create({
          data: rule
        })
      }
    }
  }

  /**
   * Get all active automation rules
   */
  static async getActiveRules(): Promise<NextStepAutomationRule[]> {
    const rules = await prisma.nextStepAutomationRule.findMany({
      where: { isActive: true },
      orderBy: [
        { triggerStatus: 'asc' },
        { daysAfterStatusChange: 'asc' }
      ]
    })

    return rules.map(rule => ({
      ...rule,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString()
    }))
  }

  /**
   * Create next steps when a project request status changes
   */
  static async handleStatusChange(
    projectRequestId: string,
    newStatus: ProjectRequestStatus,
    userId?: string
  ): Promise<ProjectRequestNextStep[]> {
    // Get active rules for this status
    const rules = await prisma.nextStepAutomationRule.findMany({
      where: {
        triggerStatus: newStatus,
        isActive: true
      }
    })

    const createdSteps: ProjectRequestNextStep[] = []

    for (const rule of rules) {
      // Check if this step type already exists and is not completed
      const existingStep = await prisma.projectRequestNextStep.findFirst({
        where: {
          projectRequestId,
          stepType: rule.stepType,
          isCompleted: false
        }
      })

      if (!existingStep) {
        // Calculate due date
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + rule.daysAfterStatusChange)

        // Create the next step
        const nextStep = await prisma.projectRequestNextStep.create({
          data: {
            projectRequestId,
            stepType: rule.stepType,
            title: rule.stepTitle,
            description: rule.stepDescription,
            dueDate,
            priority: rule.priority,
            automationRule: rule.id
          },
          include: {
            completedByUser: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })

        createdSteps.push({
          ...nextStep,
          dueDate: nextStep.dueDate.toISOString(),
          completedAt: nextStep.completedAt?.toISOString(),
          createdAt: nextStep.createdAt.toISOString(),
          updatedAt: nextStep.updatedAt.toISOString()
        })
      }
    }

    // Mark overdue steps
    await this.updateOverdueSteps()

    return createdSteps
  }

  /**
   * Get next steps for a project request
   */
  static async getNextStepsForRequest(projectRequestId: string): Promise<ProjectRequestNextStep[]> {
    const steps = await prisma.projectRequestNextStep.findMany({
      where: { projectRequestId },
      include: {
        completedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { isCompleted: 'asc' },
        { dueDate: 'asc' }
      ]
    })

    return steps.map(step => ({
      ...step,
      dueDate: step.dueDate.toISOString(),
      completedAt: step.completedAt?.toISOString(),
      createdAt: step.createdAt.toISOString(),
      updatedAt: step.updatedAt.toISOString()
    }))
  }

  /**
   * Get next steps for multiple project requests (for calendar view)
   */
  static async getNextStepsForRequests(projectRequestIds: string[]): Promise<Map<string, ProjectRequestNextStep[]>> {
    const steps = await prisma.projectRequestNextStep.findMany({
      where: {
        projectRequestId: {
          in: projectRequestIds
        }
      },
      include: {
        completedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { isCompleted: 'asc' },
        { dueDate: 'asc' }
      ]
    })

    const stepsByRequestId = new Map<string, ProjectRequestNextStep[]>()

    for (const step of steps) {
      const transformedStep: ProjectRequestNextStep = {
        ...step,
        dueDate: step.dueDate.toISOString(),
        completedAt: step.completedAt?.toISOString(),
        createdAt: step.createdAt.toISOString(),
        updatedAt: step.updatedAt.toISOString()
      }

      if (!stepsByRequestId.has(step.projectRequestId)) {
        stepsByRequestId.set(step.projectRequestId, [])
      }
      stepsByRequestId.get(step.projectRequestId)!.push(transformedStep)
    }

    return stepsByRequestId
  }

  /**
   * Complete a next step
   */
  static async completeStep(stepId: string, userId?: string): Promise<ProjectRequestNextStep> {
    const step = await prisma.projectRequestNextStep.update({
      where: { id: stepId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        completedBy: userId
      },
      include: {
        completedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return {
      ...step,
      dueDate: step.dueDate.toISOString(),
      completedAt: step.completedAt?.toISOString(),
      createdAt: step.createdAt.toISOString(),
      updatedAt: step.updatedAt.toISOString()
    }
  }

  /**
   * Create a custom next step
   */
  static async createCustomStep(
    projectRequestId: string,
    title: string,
    description: string | undefined,
    dueDate: Date,
    priority: Priority = 'MEDIUM'
  ): Promise<ProjectRequestNextStep> {
    const step = await prisma.projectRequestNextStep.create({
      data: {
        projectRequestId,
        stepType: 'CUSTOM',
        title,
        description,
        dueDate,
        priority
      },
      include: {
        completedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return {
      ...step,
      dueDate: step.dueDate.toISOString(),
      completedAt: step.completedAt?.toISOString(),
      createdAt: step.createdAt.toISOString(),
      updatedAt: step.updatedAt.toISOString()
    }
  }

  /**
   * Update overdue status for all pending steps
   */
  static async updateOverdueSteps(): Promise<void> {
    const now = new Date()

    await prisma.projectRequestNextStep.updateMany({
      where: {
        isCompleted: false,
        dueDate: {
          lt: now
        },
        isOverdue: false
      },
      data: {
        isOverdue: true
      }
    })
  }

  /**
   * Get overdue steps across all project requests
   */
  static async getOverdueSteps(): Promise<ProjectRequestNextStep[]> {
    await this.updateOverdueSteps()

    const steps = await prisma.projectRequestNextStep.findMany({
      where: {
        isOverdue: true,
        isCompleted: false
      },
      include: {
        completedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        projectRequest: {
          select: {
            id: true,
            customerName: true,
            status: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    })

    return steps.map(step => ({
      ...step,
      projectRequest: undefined, // Remove from the response as it's not part of the interface
      dueDate: step.dueDate.toISOString(),
      completedAt: step.completedAt?.toISOString(),
      createdAt: step.createdAt.toISOString(),
      updatedAt: step.updatedAt.toISOString()
    }))
  }

  /**
   * Get upcoming steps (due within the next 7 days)
   */
  static async getUpcomingSteps(): Promise<ProjectRequestNextStep[]> {
    const now = new Date()
    const weekFromNow = new Date()
    weekFromNow.setDate(now.getDate() + 7)

    const steps = await prisma.projectRequestNextStep.findMany({
      where: {
        isCompleted: false,
        dueDate: {
          gte: now,
          lte: weekFromNow
        }
      },
      include: {
        completedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    })

    return steps.map(step => ({
      ...step,
      dueDate: step.dueDate.toISOString(),
      completedAt: step.completedAt?.toISOString(),
      createdAt: step.createdAt.toISOString(),
      updatedAt: step.updatedAt.toISOString()
    }))
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
    await this.updateOverdueSteps()

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [
      totalActive,
      overdue,
      dueToday,
      dueTomorrow,
      completedThisWeek
    ] = await Promise.all([
      prisma.projectRequestNextStep.count({
        where: { isCompleted: false }
      }),
      prisma.projectRequestNextStep.count({
        where: { isOverdue: true, isCompleted: false }
      }),
      prisma.projectRequestNextStep.count({
        where: {
          isCompleted: false,
          dueDate: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.projectRequestNextStep.count({
        where: {
          isCompleted: false,
          dueDate: {
            gte: tomorrow,
            lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.projectRequestNextStep.count({
        where: {
          isCompleted: true,
          completedAt: {
            gte: weekAgo
          }
        }
      })
    ])

    return {
      totalActive,
      overdue,
      dueToday,
      dueTomorrow,
      completedThisWeek
    }
  }

  /**
   * Delete a next step
   */
  static async deleteStep(stepId: string): Promise<void> {
    await prisma.projectRequestNextStep.delete({
      where: { id: stepId }
    })
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
    const step = await prisma.projectRequestNextStep.update({
      where: { id: stepId },
      data: updates,
      include: {
        completedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return {
      ...step,
      dueDate: step.dueDate.toISOString(),
      completedAt: step.completedAt?.toISOString(),
      createdAt: step.createdAt.toISOString(),
      updatedAt: step.updatedAt.toISOString()
    }
  }
}