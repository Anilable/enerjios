/**
 * Next Step Indicator Component
 * Shows next steps for project requests with visual indicators
 */

'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react'
import {
  NextStep,
  formatNextStepForDisplay,
  getPriorityBadgeColor,
  calculateNextSteps,
  ProjectRequestWithTimestamps
} from '@/lib/next-step-automation'

interface NextStepIndicatorProps {
  request: ProjectRequestWithTimestamps
  variant?: 'compact' | 'full' | 'minimal'
  onStepComplete?: (stepId: string) => void
  showCount?: boolean
}

export function NextStepIndicator({
  request,
  variant = 'compact',
  onStepComplete,
  showCount = true
}: NextStepIndicatorProps) {
  const steps = calculateNextSteps(request)
  const pendingSteps = steps.filter(step => step.status === 'PENDING')

  if (pendingSteps.length === 0) {
    return null
  }

  const overdueSteps = pendingSteps.filter(step => step.isOverdue)
  const dueTodaySteps = pendingSteps.filter(step => step.isDueToday)
  const highPrioritySteps = pendingSteps.filter(step => step.priority === 'HIGH')

  // Determine indicator color and urgency
  let indicatorColor = 'bg-blue-100 text-blue-800 border-blue-200'
  let urgencyIcon = <Clock className="w-3 h-3" />

  if (overdueSteps.length > 0) {
    indicatorColor = 'bg-red-100 text-red-800 border-red-200'
    urgencyIcon = <AlertTriangle className="w-3 h-3" />
  } else if (dueTodaySteps.length > 0) {
    indicatorColor = 'bg-orange-100 text-orange-800 border-orange-200'
    urgencyIcon = <Calendar className="w-3 h-3" />
  }

  if (variant === 'minimal') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 rounded-full ${indicatorColor.replace('bg-', 'hover:bg-').replace('100', '200')}`}
          >
            {urgencyIcon}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <NextStepList steps={pendingSteps} onStepComplete={onStepComplete} />
        </PopoverContent>
      </Popover>
    )
  }

  if (variant === 'compact') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Badge
            variant="outline"
            className={`cursor-pointer hover:bg-opacity-80 transition-colors ${indicatorColor}`}
          >
            <div className="flex items-center gap-1">
              {urgencyIcon}
              {showCount && (
                <span className="text-xs font-medium">
                  {pendingSteps.length} adım
                </span>
              )}
            </div>
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <NextStepList steps={pendingSteps} onStepComplete={onStepComplete} />
        </PopoverContent>
      </Popover>
    )
  }

  // Full variant
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-sm">Sonraki Adımlar</h4>
          <Badge variant="outline" className={indicatorColor}>
            {pendingSteps.length} adım
          </Badge>
        </div>
        <NextStepList steps={pendingSteps.slice(0, 3)} onStepComplete={onStepComplete} />
        {pendingSteps.length > 3 && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            +{pendingSteps.length - 3} adım daha...
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface NextStepListProps {
  steps: NextStep[]
  onStepComplete?: (stepId: string) => void
  maxItems?: number
}

function NextStepList({ steps, onStepComplete, maxItems }: NextStepListProps) {
  const displaySteps = maxItems ? steps.slice(0, maxItems) : steps

  if (steps.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
        <p className="text-sm">Tüm adımlar tamamlandı</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Bekleyen Adımlar</h4>
        <Badge variant="outline" className="text-xs">
          {steps.length} adım
        </Badge>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {displaySteps.map((step) => {
          const formattedStep = formatNextStepForDisplay(step)
          return (
            <NextStepItem
              key={step.id}
              step={formattedStep}
              onComplete={onStepComplete}
            />
          )
        })}
      </div>

      {steps.length > displaySteps.length && (
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          +{steps.length - displaySteps.length} adım daha
        </div>
      )}
    </div>
  )
}

interface NextStepItemProps {
  step: ReturnType<typeof formatNextStepForDisplay>
  onComplete?: (stepId: string) => void
}

function NextStepItem({ step, onComplete }: NextStepItemProps) {
  const handleComplete = () => {
    if (onComplete) {
      onComplete(step.id)
    }
  }

  return (
    <div className={`p-3 rounded-lg border ${step.config.bgColor} ${step.config.borderColor}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className="text-lg flex-shrink-0">{step.config.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h5 className="font-medium text-sm truncate">{step.title}</h5>
              <Badge
                variant="outline"
                className={`text-xs ${getPriorityBadgeColor(step.priority)}`}
              >
                {step.priority === 'HIGH' ? 'Yüksek' : step.priority === 'MEDIUM' ? 'Orta' : 'Düşük'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {step.description}
            </p>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${step.urgencyColor}`}>
                {step.urgencyText}
              </span>
              <span className="text-xs text-muted-foreground">
                {step.dueDate.toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>
        </div>

        {onComplete && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 flex-shrink-0"
            onClick={handleComplete}
            title="Adımı tamamla"
          >
            <CheckCircle className="w-4 h-4 text-green-600" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default NextStepIndicator