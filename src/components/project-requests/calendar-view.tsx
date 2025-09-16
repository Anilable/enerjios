'use client'

import { useState, useMemo } from 'react'
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
  TrendingUp
} from 'lucide-react'
import { ProjectRequest } from '@/types/project-request'

interface CalendarViewProps {
  requests: ProjectRequest[]
  onViewRequest: (request: ProjectRequest) => void
}

interface DayData {
  date: Date
  day: number
  isCurrentMonth: boolean
  requests: ProjectRequest[]
  quotesCount: number
}

export function CalendarView({ requests, onViewRequest }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

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

      days.push({
        date: new Date(currentDayIter),
        day: currentDayIter.getDate(),
        isCurrentMonth: currentDayIter.getMonth() === currentMonth,
        requests: dayRequests,
        quotesCount
      })

      currentDayIter.setDate(currentDayIter.getDate() + 1)
    }

    return days
  }, [currentYear, currentMonth, requests])

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
                                  <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                                    {request.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Eye className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">Detay</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}