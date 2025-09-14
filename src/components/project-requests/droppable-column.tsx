'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProjectRequestCard } from './project-request-card'
import { KanbanColumn, ProjectRequest } from '@/types/project-request'

interface DroppableColumnProps {
  column: KanbanColumn
  onCardClick: (request: ProjectRequest) => void
  onDelete?: (id: string) => void
  canDelete?: boolean
}

export function DroppableColumn({ column, onCardClick, onDelete, canDelete = false }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  console.log('DroppableColumn rendered:', { 
    columnId: column.id, 
    columnTitle: column.title, 
    requestCount: column.requests.length,
    isOver 
  })

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${column.color}`} />
            <CardTitle className="text-sm font-medium truncate">
              {column.title}
            </CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            {column.count}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pt-0 pb-0 overflow-hidden">
        <div
          ref={setNodeRef}
          className={`
            custom-scrollbar space-y-3 min-h-[400px] max-h-[calc(100vh-300px)] p-3 rounded-lg border-2 border-dashed transition-all duration-200 overflow-y-auto
            ${isOver 
              ? 'border-blue-400 bg-blue-50/50 shadow-inner' 
              : 'border-gray-200 hover:border-blue-300/50 hover:bg-gray-50/30'
            }
          `}
          data-testid={`drop-zone-${column.id}`}
        >
          <SortableContext
            items={column.requests.map(request => request.id)}
            strategy={verticalListSortingStrategy}
          >
            {column.requests.map((request) => (
              <ProjectRequestCard
                key={request.id}
                request={request}
                onClick={() => {
                  console.log('Card clicked:', request.id, request.customerName)
                  onCardClick(request)
                }}
                onDelete={onDelete}
                canDelete={canDelete}
              />
            ))}
          </SortableContext>
          
          {column.requests.length === 0 && (
            <div className="flex items-center justify-center h-32">
              <div className="text-center text-muted-foreground text-sm">
                <div className="mb-2 text-lg">📋</div>
                <div>
                  {column.id === 'OPEN' ? 'Yeni talepler buraya gelecek' : 'Henüz talep yok'}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}