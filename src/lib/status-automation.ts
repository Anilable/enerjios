import { notificationSystem, NotificationType } from './notification-system'

export type ProjectStatus = 
  | 'DESIGN'
  | 'QUOTE_SENT'
  | 'APPROVED'
  | 'SITE_SURVEY'
  | 'PERMITS'
  | 'INSTALLATION'
  | 'TESTING'
  | 'COMPLETED'
  | 'CANCELLED'

export interface StatusTransition {
  from: ProjectStatus
  to: ProjectStatus
  automatic: boolean
  conditions?: {
    timeDelay?: number // minutes
    requiredActions?: string[]
    approvalRequired?: boolean
  }
  triggers?: {
    notifications?: NotificationType[]
    actions?: string[]
  }
}

export interface ProjectStatusUpdate {
  projectId: string
  currentStatus: ProjectStatus
  newStatus: ProjectStatus
  triggeredBy: 'user' | 'system' | 'timer' | 'external'
  userId?: string
  reason?: string
  metadata?: Record<string, any>
  timestamp: string
}

export interface StatusRule {
  id: string
  name: string
  description: string
  conditions: {
    currentStatus: ProjectStatus
    timeElapsed?: number // hours
    customerResponse?: boolean
    paymentReceived?: boolean
    documentsUploaded?: boolean
    surveyCompleted?: boolean
    permitsApproved?: boolean
    installationScheduled?: boolean
  }
  action: {
    newStatus: ProjectStatus
    sendNotifications: NotificationType[]
    assignTo?: string
    createTasks?: string[]
    updatePriority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  }
  isActive: boolean
}

class StatusAutomationEngine {
  private transitions: StatusTransition[] = []
  private rules: StatusRule[] = []
  private statusHistory: ProjectStatusUpdate[] = []

  constructor() {
    this.initializeDefaultTransitions()
    this.initializeDefaultRules()
  }

  private initializeDefaultTransitions(): void {
    this.transitions = [
      // Design to Quote
      {
        from: 'DESIGN',
        to: 'QUOTE_SENT',
        automatic: true,
        conditions: {
          timeDelay: 30, // 30 minutes after design completion
          requiredActions: ['design_approved', 'quote_generated']
        },
        triggers: {
          notifications: ['quote_ready'],
          actions: ['send_quote_email', 'create_follow_up_task']
        }
      },
      // Quote to Approved
      {
        from: 'QUOTE_SENT',
        to: 'APPROVED',
        automatic: false,
        conditions: {
          approvalRequired: true
        },
        triggers: {
          notifications: ['quote_approved'],
          actions: ['schedule_site_survey', 'start_permit_process']
        }
      },
      // Approved to Site Survey
      {
        from: 'APPROVED',
        to: 'SITE_SURVEY',
        automatic: true,
        conditions: {
          timeDelay: 60, // 1 hour after approval
          requiredActions: ['survey_team_assigned']
        },
        triggers: {
          notifications: ['installation_scheduled'],
          actions: ['notify_survey_team', 'send_customer_preparation_guide']
        }
      },
      // Site Survey to Permits
      {
        from: 'SITE_SURVEY',
        to: 'PERMITS',
        automatic: true,
        conditions: {
          requiredActions: ['survey_completed', 'report_generated']
        },
        triggers: {
          actions: ['submit_permit_applications', 'update_final_design']
        }
      },
      // Permits to Installation
      {
        from: 'PERMITS',
        to: 'INSTALLATION',
        automatic: true,
        conditions: {
          requiredActions: ['permits_approved', 'materials_ready']
        },
        triggers: {
          notifications: ['installation_scheduled'],
          actions: ['assign_installation_team', 'schedule_installation_date']
        }
      },
      // Installation to Testing
      {
        from: 'INSTALLATION',
        to: 'TESTING',
        automatic: true,
        conditions: {
          requiredActions: ['installation_completed', 'electrical_connected']
        },
        triggers: {
          actions: ['schedule_testing', 'prepare_commissioning_docs']
        }
      },
      // Testing to Completed
      {
        from: 'TESTING',
        to: 'COMPLETED',
        automatic: true,
        conditions: {
          requiredActions: ['testing_passed', 'customer_training_completed']
        },
        triggers: {
          notifications: ['installation_completed'],
          actions: ['activate_monitoring', 'send_user_guide', 'schedule_first_maintenance']
        }
      }
    ]
  }

  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'quote_follow_up',
        name: 'Quote Follow-up Reminder',
        description: 'Send follow-up notification if quote not responded after 3 days',
        conditions: {
          currentStatus: 'QUOTE_SENT',
          timeElapsed: 72, // 3 days
          customerResponse: false
        },
        action: {
          newStatus: 'QUOTE_SENT', // Stay in same status
          sendNotifications: ['payment_reminder'], // Reuse payment reminder template
          createTasks: ['Call customer about quote', 'Send quote reminder email'],
          updatePriority: 'HIGH'
        },
        isActive: true
      },
      {
        id: 'urgent_approval_reminder',
        name: 'Urgent Approval Reminder',
        description: 'Mark as urgent if quote pending for 7 days',
        conditions: {
          currentStatus: 'QUOTE_SENT',
          timeElapsed: 168, // 7 days
          customerResponse: false
        },
        action: {
          newStatus: 'QUOTE_SENT',
          sendNotifications: [],
          createTasks: ['Manager review required', 'Prepare revised quote'],
          updatePriority: 'URGENT'
        },
        isActive: true
      },
      {
        id: 'payment_received_automation',
        name: 'Auto-progress on Payment',
        description: 'Automatically move to site survey when payment received',
        conditions: {
          currentStatus: 'APPROVED',
          paymentReceived: true
        },
        action: {
          newStatus: 'SITE_SURVEY',
          sendNotifications: ['installation_scheduled'],
          assignTo: 'survey_team',
          createTasks: ['Schedule site survey', 'Prepare survey equipment']
        },
        isActive: true
      },
      {
        id: 'documents_ready_automation',
        name: 'Auto-progress on Documents',
        description: 'Move to installation when all documents uploaded',
        conditions: {
          currentStatus: 'PERMITS',
          documentsUploaded: true,
          permitsApproved: true
        },
        action: {
          newStatus: 'INSTALLATION',
          sendNotifications: ['installation_scheduled'],
          assignTo: 'installation_team',
          createTasks: ['Order materials', 'Schedule installation crew']
        },
        isActive: true
      },
      {
        id: 'installation_completion_check',
        name: 'Installation Completion Check',
        description: 'Auto-complete when installation team marks as done',
        conditions: {
          currentStatus: 'INSTALLATION',
          installationScheduled: true
        },
        action: {
          newStatus: 'TESTING',
          sendNotifications: [],
          createTasks: ['Perform system testing', 'Customer training session'],
          assignTo: 'commissioning_team'
        },
        isActive: true
      }
    ]
  }

  public async processStatusUpdate(
    projectId: string,
    currentStatus: ProjectStatus,
    newStatus: ProjectStatus,
    triggeredBy: 'user' | 'system' | 'timer' | 'external' = 'user',
    metadata?: Record<string, any>
  ): Promise<{
    success: boolean
    statusUpdate: ProjectStatusUpdate
    notifications?: any[]
    actions?: string[]
    errors?: string[]
  }> {
    const statusUpdate: ProjectStatusUpdate = {
      projectId,
      currentStatus,
      newStatus,
      triggeredBy,
      timestamp: new Date().toISOString(),
      metadata
    }

    try {
      // Find the transition
      const transition = this.transitions.find(t => t.from === currentStatus && t.to === newStatus)
      
      if (!transition) {
        throw new Error(`Invalid status transition: ${currentStatus} → ${newStatus}`)
      }

      // Check conditions if not user-triggered
      if (triggeredBy !== 'user' && transition.conditions) {
        const conditionsMet = await this.checkTransitionConditions(projectId, transition.conditions)
        if (!conditionsMet) {
          throw new Error('Transition conditions not met')
        }
      }

      // Record the status change
      this.statusHistory.push(statusUpdate)

      // Execute triggers
      const notifications = []
      const actions = []

      if (transition.triggers) {
        // Send notifications
        if (transition.triggers.notifications) {
          for (const notificationType of transition.triggers.notifications) {
            try {
              // Get project and customer info (mock data for now)
              const customerInfo = await this.getProjectCustomerInfo(projectId)
              const projectData = await this.getProjectData(projectId)

              const notificationLogs = await notificationSystem.sendNotification(
                notificationType,
                customerInfo,
                { ...projectData, ...metadata }
              )
              
              notifications.push(...notificationLogs)
            } catch (error) {
              console.error(`Failed to send notification ${notificationType}:`, error)
            }
          }
        }

        // Execute actions
        if (transition.triggers.actions) {
          for (const action of transition.triggers.actions) {
            try {
              await this.executeAction(projectId, action, metadata)
              actions.push(action)
            } catch (error) {
              console.error(`Failed to execute action ${action}:`, error)
            }
          }
        }
      }

      return {
        success: true,
        statusUpdate,
        notifications,
        actions
      }

    } catch (error) {
      return {
        success: false,
        statusUpdate,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  public async checkAutomationRules(projectId: string): Promise<{
    triggeredRules: StatusRule[]
    actions: string[]
    notifications: any[]
  }> {
    const triggeredRules: StatusRule[] = []
    const actions: string[] = []
    const notifications: any[] = []

    // Get current project status (mock implementation)
    const projectStatus = await this.getCurrentProjectStatus(projectId)
    const projectAge = await this.getProjectAge(projectId) // hours

    for (const rule of this.rules.filter(r => r.isActive)) {
      let ruleMatches = true

      // Check status condition
      if (rule.conditions.currentStatus && rule.conditions.currentStatus !== projectStatus.status) {
        ruleMatches = false
      }

      // Check time condition
      if (rule.conditions.timeElapsed && projectAge < rule.conditions.timeElapsed) {
        ruleMatches = false
      }

      // Check other conditions (mock implementation)
      if (rule.conditions.customerResponse !== undefined) {
        const hasCustomerResponse = await this.checkCustomerResponse(projectId)
        if (rule.conditions.customerResponse !== hasCustomerResponse) {
          ruleMatches = false
        }
      }

      if (ruleMatches) {
        triggeredRules.push(rule)

        // Execute rule actions
        for (const notificationType of rule.action.sendNotifications) {
          try {
            const customerInfo = await this.getProjectCustomerInfo(projectId)
            const projectData = await this.getProjectData(projectId)

            const notificationLogs = await notificationSystem.sendNotification(
              notificationType,
              customerInfo,
              projectData
            )

            notifications.push(...notificationLogs)
          } catch (error) {
            console.error(`Failed to send rule notification:`, error)
          }
        }

        if (rule.action.createTasks) {
          actions.push(...rule.action.createTasks)
        }

        // Status update if needed
        if (rule.action.newStatus !== projectStatus.status) {
          await this.processStatusUpdate(
            projectId,
            projectStatus.status,
            rule.action.newStatus,
            'system',
            { triggeredRule: rule.id }
          )
        }
      }
    }

    return {
      triggeredRules,
      actions,
      notifications
    }
  }

  private async checkTransitionConditions(
    projectId: string,
    conditions: NonNullable<StatusTransition['conditions']>
  ): Promise<boolean> {
    // Mock implementation - in real app, check database
    
    if (conditions.requiredActions) {
      // Check if all required actions are completed
      const completedActions = await this.getCompletedActions(projectId)
      const allActionsCompleted = conditions.requiredActions.every(action => 
        completedActions.includes(action)
      )
      if (!allActionsCompleted) return false
    }

    if (conditions.timeDelay) {
      // Check if enough time has passed
      const lastStatusChange = await this.getLastStatusChangeTime(projectId)
      const now = Date.now()
      const delayMs = conditions.timeDelay * 60 * 1000 // convert to ms
      if (now - lastStatusChange < delayMs) return false
    }

    if (conditions.approvalRequired) {
      // Check if approval is given
      const hasApproval = await this.checkApproval(projectId)
      if (!hasApproval) return false
    }

    return true
  }

  private async executeAction(projectId: string, action: string, metadata?: Record<string, any>): Promise<void> {
    // Mock implementation - in real app, execute actual actions
    console.log(`Executing action: ${action} for project: ${projectId}`, metadata)
    
    switch (action) {
      case 'send_quote_email':
        // Integration with email service
        break
      case 'schedule_site_survey':
        // Integration with calendar/scheduling system
        break
      case 'notify_survey_team':
        // Notify survey team via Slack/Teams
        break
      case 'submit_permit_applications':
        // Submit to government systems
        break
      case 'activate_monitoring':
        // Activate system monitoring
        break
      // Add more action implementations
    }
  }

  // Mock data getter methods - replace with actual database queries
  private async getCurrentProjectStatus(projectId: string): Promise<{ status: ProjectStatus; updatedAt: string }> {
    return { status: 'QUOTE_SENT', updatedAt: new Date().toISOString() }
  }

  private async getProjectAge(projectId: string): Promise<number> {
    // Return age in hours
    return 48 // Mock: 48 hours old
  }

  private async getProjectCustomerInfo(projectId: string) {
    return {
      name: 'Test Customer',
      email: 'customer@example.com',
      phone: '+90 532 123 4567',
      language: 'tr' as const
    }
  }

  private async getProjectData(projectId: string) {
    return {
      projectId,
      projectTitle: 'Test Project',
      systemSize: 50,
      estimatedPrice: 175000
    }
  }

  private async checkCustomerResponse(projectId: string): Promise<boolean> {
    return false // Mock implementation
  }

  private async getCompletedActions(projectId: string): Promise<string[]> {
    return ['design_approved'] // Mock implementation
  }

  private async getLastStatusChangeTime(projectId: string): Promise<number> {
    return Date.now() - (2 * 60 * 60 * 1000) // Mock: 2 hours ago
  }

  private async checkApproval(projectId: string): Promise<boolean> {
    return true // Mock implementation
  }

  // Public API methods
  public getStatusHistory(projectId?: string): ProjectStatusUpdate[] {
    if (projectId) {
      return this.statusHistory.filter(update => update.projectId === projectId)
    }
    return [...this.statusHistory]
  }

  public getActiveRules(): StatusRule[] {
    return this.rules.filter(rule => rule.isActive)
  }

  public addRule(rule: StatusRule): void {
    this.rules.push(rule)
  }

  public updateRule(ruleId: string, updates: Partial<StatusRule>): boolean {
    const index = this.rules.findIndex(rule => rule.id === ruleId)
    if (index === -1) return false

    this.rules[index] = { ...this.rules[index], ...updates }
    return true
  }

  public deleteRule(ruleId: string): boolean {
    const index = this.rules.findIndex(rule => rule.id === ruleId)
    if (index === -1) return false

    this.rules.splice(index, 1)
    return true
  }
}

export const statusAutomation = new StatusAutomationEngine()
export default statusAutomation