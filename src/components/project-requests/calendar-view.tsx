'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  MessageSquare
} from 'lucide-react'
import { ProjectRequest, REQUEST_SOURCE_LABELS, REQUEST_SOURCE_COLORS, REQUEST_SOURCE_ICONS, ProjectRequestStatus } from '@/types/project-request'
import { NextStep, calculateNextStepsForRequests, ProjectRequestWithTimestamps } from '@/lib/next-step-automation'
import { NotesIndicator } from './notes-indicator'
import { NotesManagement } from './notes-management'
import { StatusUpdateDropdown } from './status-update-dropdown'
import { NextStepIndicator } from './next-step-indicator'

interface CalendarViewProps {
  requests: ProjectRequest[]
  onViewRequest: (request: ProjectRequest) => void
  onStatusUpdate?: (requestId: string, newStatus: ProjectRequestStatus) => Promise<void>
}

interface DayData {
  date: Date
  day: number
  isCurrentMonth: boolean
  requests: ProjectRequest[]
  quotesCount: number
  nextSteps: NextStep[]
}

export function CalendarView({ requests, onViewRequest, onStatusUpdate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [notesManagementOpen, setNotesManagementOpen] = useState(false)
  const [selectedRequestForNotes, setSelectedRequestForNotes] = useState<ProjectRequest | null>(null)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Calculate next steps for all requests (client-side)
  const nextStepsMap = useMemo(() => {
    const requestsWithTimestamps: ProjectRequestWithTimestamps[] = requests.map(request => ({
      id: request.id,
      status: request.status,
      createdAt: new Date(request.createdAt),
      updatedAt: new Date(request.updatedAt)
    }))

    return calculateNextStepsForRequests(requestsWithTimestamps)
  }, [requests])

  // Generate calendar data
  const calendarData = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    const firstDayOfWeek = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()

    // Calculate start and end dates for the calendar grid
    const startDate = new Date(firstDayOfMonth)
    startDate.setDate(startDate.getDate() - firstDayOfWeek)

    const endDate = new Date(lastDayOfMonth)
    const remainingDays = 6 - lastDayOfMonth.getDay()
    endDate.setDate(endDate.getDate() + remainingDays)

    const days: DayData[] = []
    const currentDayIter = new Date(startDate)

    while (currentDayIter <= endDate) {
      const dayRequests = requests.filter(request => {
        const requestDate = new Date(request.createdAt)
        return (
          requestDate.getDate() === currentDayIter.getDate() &&
          requestDate.getMonth() === currentDayIter.getMonth() &&
          requestDate.getFullYear() === currentDayIter.getFullYear()
        )
      })

      // Count quotes sent on this day (assuming requests that are converted or have quotes)
      const quotesCount = dayRequests.filter(request =>
        request.status === 'CONVERTED_TO_PROJECT' ||
        request.status === 'SITE_VISIT'
      ).length

      // Collect next steps for this day
      const dayNextSteps: NextStep[] = []
      for (const request of dayRequests) {
        const requestNextSteps = nextStepsMap.get(request.id) || []
        dayNextSteps.push(...requestNextSteps)
      }

      days.push({
        date: new Date(currentDayIter),
        day: currentDayIter.getDate(),
        isCurrentMonth: currentDayIter.getMonth() === currentMonth,
        requests: dayRequests,
        quotesCount,
        nextSteps: dayNextSteps
      })

      currentDayIter.setDate(currentDayIter.getDate() + 1)
    }

    return days
  }, [currentYear, currentMonth, requests, nextStepsMap])

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]

  const dayNames = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800'
      case 'CONTACTED': return 'bg-purple-100 text-purple-800'
      case 'ASSIGNED': return 'bg-orange-100 text-orange-800'
      case 'SITE_VISIT': return 'bg-yellow-100 text-yellow-800'
      case 'CONVERTED_TO_PROJECT': return 'bg-green-100 text-green-800'
      case 'LOST': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTotalStats = () => {
    const totalRequests = requests.length
    const totalQuotes = requests.filter(r =>
      r.status === 'CONVERTED_TO_PROJECT' || r.status === 'SITE_VISIT'
    ).length
    const totalRevenue = requests
      .filter(r => r.status === 'CONVERTED_TO_PROJECT')
      .reduce((sum, r) => sum + (r.estimatedRevenue || 0), 0)

    return { totalRequests, totalQuotes, totalRevenue }
  }

  const stats = getTotalStats()

  const handleOpenNotesManagement = (request: ProjectRequest) => {
    setSelectedRequestForNotes(request)
    setNotesManagementOpen(true)
  }

  const handleCloseNotesManagement = () => {
    setNotesManagementOpen(false)
    setSelectedRequestForNotes(null)
  }


  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Proje Talep Takvimi
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="min-w-[120px] text-center font-medium">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Toplam Talep</p>
                <p className="text-2xl font-bold">{stats.totalRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Teklif Gönderildi</p>
                <p className="text-2xl font-bold">{stats.totalQuotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold">₺{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 p-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarData.map((dayData, index) => {
              const isToday = dayData.date.toDateString() === new Date().toDateString()

              return (
                <div
                  key={index}
                  className={`
                    min-h-[80px] p-2 border rounded-lg relative
                    ${dayData.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                    ${isToday ? 'ring-2 ring-blue-500' : ''}
                    hover:bg-gray-50 transition-colors
                  `}
                >
                  {/* Day Number */}
                  <div className={`
                    text-sm font-medium mb-1
                    ${dayData.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${isToday ? 'text-blue-600 font-bold' : ''}
                  `}>
                    {dayData.day}
                  </div>

                  {/* Request Count Badge */}
                  {dayData.requests.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="absolute top-1 right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hover:bg-blue-600">
                          {dayData.requests.length}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" align="end">
                        <div className="space-y-3">
                          <h4 className="font-medium">
                            {dayData.date.toLocaleDateString('tr-TR')} - Talepler
                          </h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {dayData.requests.map((request) => (
                              <div
                                key={request.id}
                                className="p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                onClick={() => onViewRequest(request)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">
                                      {request.customerName}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {request.location}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Badge
                                      variant="outline"
                                      className={`text-xs flex items-center gap-1 ${REQUEST_SOURCE_COLORS[request.source].badge}`}
                                      title={`Kaynak: ${REQUEST_SOURCE_LABELS[request.source]}`}
                                    >
                                      <span>{REQUEST_SOURCE_ICONS[request.source]}</span>
                                    </Badge>
                                    <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                                      {request.status}
                                    </Badge>
                                    <NotesIndicator
                                      projectRequestId={request.id}
                                      customerName={request.customerName}
                                      onManageNotes={() => handleOpenNotesManagement(request)}
                                      compact={true}
                                    />
                                    <NextStepIndicator
                                      request={{
                                        id: request.id,
                                        status: request.status,
                                        createdAt: new Date(request.createdAt),
                                        updatedAt: new Date(request.updatedAt)
                                      }}
                                      variant="minimal"
                                      showCount={false}
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-2 gap-2">
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">Detay</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {onStatusUpdate && (
                                      <StatusUpdateDropdown
                                        request={request}
                                        onStatusUpdate={onStatusUpdate}
                                        variant="minimal"
                                      />
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleOpenNotesManagement(request)
                                      }}
                                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                    >
                                      <MessageSquare className="w-3 h-3" />
                                      <span>Notlar</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}

                  {/* Next Steps Badge */}
                  {dayData.nextSteps.length > 0 && (
                    <div className={`absolute bottom-1 left-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ${
                      dayData.nextSteps.some(step => step.isOverdue && step.status === 'PENDING') ? 'bg-red-500' :
                      dayData.nextSteps.some(step => step.isDueToday && step.status === 'PENDING') ? 'bg-orange-500' :
                      dayData.nextSteps.some(step => step.status === 'PENDING') ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {dayData.nextSteps.filter(step => step.status === 'PENDING').length}
                    </div>
                  )}

                  {/* Quote Count Badge */}
                  {dayData.quotesCount > 0 && (
                    <div className="absolute bottom-1 right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {dayData.quotesCount}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Talep Sayısı</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Teklif Gönderildi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Bekleyen Adım</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Geciken Adım</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Takvim Açıklaması</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>Proje Talepleri</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Gönderilen Teklifler</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span>Geciken Adımlar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span>Bugün Yapılacaklar</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Management Dialog */}
      {selectedRequestForNotes && (
        <NotesManagement
          projectRequestId={selectedRequestForNotes.id}
          projectRequestCustomerName={selectedRequestForNotes.customerName}
          isOpen={notesManagementOpen}
          onClose={handleCloseNotesManagement}
        />
      )}
    </div>
  )
}