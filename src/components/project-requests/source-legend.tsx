'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import {
  REQUEST_SOURCE_LABELS,
  REQUEST_SOURCE_COLORS,
  REQUEST_SOURCE_ICONS,
  RequestSource
} from '@/types/project-request'

interface SourceLegendProps {
  /** Show as a compact tooltip button */
  compact?: boolean
  /** Show as an inline legend */
  inline?: boolean
  /** Custom title for the legend */
  title?: string
  /** Custom description */
  description?: string
}

export function SourceLegend({
  compact = false,
  inline = false,
  title = "Talep Kaynakları",
  description = "Proje taleplerinin geldiği kaynakları gösteren renk kodları"
}: SourceLegendProps) {
  const sources = Object.keys(REQUEST_SOURCE_LABELS) as RequestSource[]

  const LegendContent = () => (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium text-sm">{title}</h4>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {sources.map((source) => {
          const colors = REQUEST_SOURCE_COLORS[source]
          const label = REQUEST_SOURCE_LABELS[source]
          const icon = REQUEST_SOURCE_ICONS[source]

          return (
            <div
              key={source}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <Badge
                variant="outline"
                className={`text-xs flex items-center gap-1 ${colors.badge}`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Badge>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">
                  {getSourceDescription(source)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // Compact version as a tooltip button
  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
            title="Kaynak renk kodlarını göster"
          >
            <Info className="w-3 h-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <LegendContent />
        </PopoverContent>
      </Popover>
    )
  }

  // Inline version as a small card
  if (inline) {
    return (
      <div className="p-3 border rounded-lg bg-muted/20">
        <LegendContent />
      </div>
    )
  }

  // Full card version
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="w-4 h-4" />
          {title}
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sources.map((source) => {
            const colors = REQUEST_SOURCE_COLORS[source]
            const label = REQUEST_SOURCE_LABELS[source]
            const icon = REQUEST_SOURCE_ICONS[source]

            return (
              <div
                key={source}
                className={`p-3 rounded-lg border transition-colors ${colors.background} ${colors.border}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={`text-xs flex items-center gap-1 ${colors.badge}`}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {getSourceDescription(source)}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function getSourceDescription(source: RequestSource): string {
  switch (source) {
    case 'WEBSITE':
      return 'Şirket web sitesi üzerinden gelen talepler'
    case 'PHONE':
      return 'Telefon araması ile gelen talepler'
    case 'EMAIL':
      return 'E-posta ile gelen talepler'
    case 'REFERRAL':
      return 'Müşteri referansı ile gelen talepler'
    case 'SOCIAL_MEDIA':
      return 'Sosyal medya platformları üzerinden gelen talepler'
    case 'WALK_IN':
      return 'Doğrudan ofise gelen ziyaretçiler'
    case 'PARTNER_REFERRAL':
      return 'İş ortağı referansı ile gelen talepler'
    case 'WHATSAPP':
      return 'WhatsApp üzerinden gelen talepler'
    case 'OTHER':
      return 'Diğer kaynaklardan gelen talepler'
    default:
      return 'Belirtilmemiş kaynak'
  }
}