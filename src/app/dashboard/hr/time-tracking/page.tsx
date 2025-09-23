'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Clock,
  Play,
  Square,
  Plus,
  Users,
  Calendar,
  TrendingUp,
  Download,
  Filter,
  RefreshCw,
  MapPin,
  Timer,
  Coffee,
  AlertTriangle
} from 'lucide-react'
import { format, startOfDay, endOfDay } from 'date-fns'
import { tr } from 'date-fns/locale'

interface TimeEntry {
  id: string
  date: string
  clockIn: string | null
  clockOut: string | null
  breakDuration: number
  totalHours: number | null
  status: string
  location?: string
  notes?: string
  employee: {
    firstName: string
    lastName: string
    employeeCode: string
    department?: {
      name: string
    }
  }
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  department?: {
    name: string
  }
}

interface DailyStats {
  totalEmployees: number
  presentToday: number
  lateArrivals: number
  averageHours: number
  overtimeCount: number
}

export default function TimeTrackingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    totalEmployees: 0,
    presentToday: 0,
    lateArrivals: 0,
    averageHours: 0,
    overtimeCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showClockInDialog, setShowClockInDialog] = useState(false)
  const [showClockOutDialog, setShowClockOutDialog] = useState(false)
  const [showManualEntryDialog, setShowManualEntryDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [clockInData, setClockInData] = useState({
    employeeId: '',
    location: '',
    notes: ''
  })
  const [clockOutData, setClockOutData] = useState({
    employeeId: '',
    breakDuration: 0,
    notes: ''
  })
  const [currentTime, setCurrentTime] = useState(new Date())

  // Check admin permission
  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [session, router])

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [selectedDate])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [entriesRes, employeesRes] = await Promise.all([
        fetch(`/api/hr/time-tracking/entries?startDate=${selectedDate}&endDate=${selectedDate}`, {
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch('/api/hr/employees', {
          headers: { 'Content-Type': 'application/json' },
        })
      ])

      if (entriesRes.ok) {
        const entriesData = await entriesRes.json()
        setTimeEntries(entriesData.timeEntries)

        // Calculate daily stats
        const today = entriesData.timeEntries
        const totalEmployees = entriesData.summary?.totalEntries || 0
        const presentToday = today.filter((entry: TimeEntry) => entry.clockIn).length
        const lateArrivals = today.filter((entry: TimeEntry) => {
          if (!entry.clockIn) return false
          const clockInTime = new Date(entry.clockIn)
          return clockInTime.getHours() > 9 || (clockInTime.getHours() === 9 && clockInTime.getMinutes() > 0)
        }).length
        const averageHours = entriesData.summary?.averageHours || 0
        const overtimeCount = today.filter((entry: TimeEntry) => (entry.totalHours || 0) > 8).length

        setDailyStats({
          totalEmployees,
          presentToday,
          lateArrivals,
          averageHours,
          overtimeCount
        })
      }

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        setEmployees(employeesData.employees.filter((emp: Employee) => emp.id))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClockIn = async () => {
    try {
      const response = await fetch('/api/hr/time-tracking/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clockInData)
      })

      if (response.ok) {
        setShowClockInDialog(false)
        setClockInData({ employeeId: '', location: '', notes: '' })
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Giriş kaydında hata oluştu')
      }
    } catch (error) {
      console.error('Clock in error:', error)
      alert('Giriş kaydında hata oluştu')
    }
  }

  const handleClockOut = async () => {
    try {
      const response = await fetch('/api/hr/time-tracking/clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clockOutData)
      })

      if (response.ok) {
        setShowClockOutDialog(false)
        setClockOutData({ employeeId: '', breakDuration: 0, notes: '' })
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Çıkış kaydında hata oluştu')
      }
    } catch (error) {
      console.error('Clock out error:', error)
      alert('Çıkış kaydında hata oluştu')
    }
  }

  const getStatusBadge = (entry: TimeEntry) => {
    if (!entry.clockIn) {
      return <Badge variant="secondary">Gelmedi</Badge>
    }
    if (entry.status === 'IN') {
      return <Badge variant="default" className="bg-green-500">İçeride</Badge>
    }
    if (entry.status === 'OUT') {
      return <Badge variant="outline">Çıktı</Badge>
    }
    if (entry.status === 'BREAK') {
      return <Badge variant="secondary" className="bg-yellow-500">Molada</Badge>
    }
    return <Badge variant="secondary">{entry.status}</Badge>
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-'
    return format(new Date(timeString), 'HH:mm', { locale: tr })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const exportData = () => {
    const queryParams = new URLSearchParams({
      startDate: selectedDate,
      endDate: selectedDate,
      format: 'csv'
    })
    window.open(`/api/hr/time-tracking/entries?${queryParams}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Mesai Takibi</h1>
            <p className="text-green-100 text-lg">
              Çalışan giriş-çıkış kayıtları ve mesai saatleri yönetimi
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowManualEntryDialog(true)}
              variant="outline"
              size="lg"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <Plus className="h-5 w-5 mr-2" />
              Manuel Kayıt
            </Button>
            <Button
              onClick={() => setShowClockInDialog(true)}
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold"
            >
              <Play className="h-5 w-5 mr-2" />
              Giriş Yap
            </Button>
            <Button
              onClick={() => setShowClockOutDialog(true)}
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-white font-semibold"
            >
              <Square className="h-5 w-5 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>

      {/* Current Time Display */}
      <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="text-6xl font-bold mb-4 text-gray-800 tracking-wider">
              {format(currentTime, 'HH:mm:ss')}
            </div>
            <div className="text-xl text-gray-600 font-medium">
              {format(currentTime, 'EEEE, dd MMMM yyyy', { locale: tr })}
            </div>
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-100 rounded-full">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-blue-800 font-medium">Sistem Aktif</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Çalışan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyStats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Kayıtlı çalışan sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugün Gelenler</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dailyStats.presentToday}</div>
            <p className="text-xs text-muted-foreground">
              Giriş yapmış çalışan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geç Gelenler</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{dailyStats.lateArrivals}</div>
            <p className="text-xs text-muted-foreground">
              09:00'dan sonra gelen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Saat</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyStats.averageHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Günlük çalışma saati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mesai Yapanlar</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{dailyStats.overtimeCount}</div>
            <p className="text-xs text-muted-foreground">
              8+ saat çalışan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Label>Tarih:</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Günlük Mesai Kayıtları ({timeEntries.length})</CardTitle>
          <CardDescription>
            {format(new Date(selectedDate), 'dd MMMM yyyy', { locale: tr })} tarihli giriş-çıkış kayıtları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Çalışan</TableHead>
                <TableHead>Departman</TableHead>
                <TableHead>Giriş Saati</TableHead>
                <TableHead>Çıkış Saati</TableHead>
                <TableHead>Mola (dk)</TableHead>
                <TableHead>Toplam Saat</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Konum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(entry.employee.firstName, entry.employee.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {entry.employee.firstName} {entry.employee.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.employee.employeeCode}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{entry.employee.department?.name || 'Atanmamış'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {entry.clockIn && (
                        <Clock className="h-3 w-3 text-green-500" />
                      )}
                      {formatTime(entry.clockIn)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {entry.clockOut && (
                        <Clock className="h-3 w-3 text-red-500" />
                      )}
                      {formatTime(entry.clockOut)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Coffee className="h-3 w-3 text-amber-500" />
                      {entry.breakDuration || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {entry.totalHours ? `${entry.totalHours.toFixed(2)}h` : '-'}
                      {(entry.totalHours || 0) > 8 && (
                        <Badge variant="secondary" className="ml-1 text-xs bg-orange-100">
                          Mesai
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(entry)}</TableCell>
                  <TableCell>
                    {entry.location ? (
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3" />
                        {entry.location}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Clock In Dialog */}
      <Dialog open={showClockInDialog} onOpenChange={setShowClockInDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Giriş Yap</DialogTitle>
            <DialogDescription>
              Çalışan için giriş kaydı oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Çalışan</Label>
              <Select value={clockInData.employeeId} onValueChange={(value) =>
                setClockInData(prev => ({ ...prev, employeeId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Çalışan seçin" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Konum (Opsiyonel)</Label>
              <Input
                value={clockInData.location}
                onChange={(e) => setClockInData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Örn: Ofis, Saha, Ev"
              />
            </div>
            <div>
              <Label>Notlar (Opsiyonel)</Label>
              <Textarea
                value={clockInData.notes}
                onChange={(e) => setClockInData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Ek notlar..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClockInDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleClockIn} disabled={!clockInData.employeeId}>
              Giriş Yap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clock Out Dialog */}
      <Dialog open={showClockOutDialog} onOpenChange={setShowClockOutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Çıkış Yap</DialogTitle>
            <DialogDescription>
              Çalışan için çıkış kaydı oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Çalışan</Label>
              <Select value={clockOutData.employeeId} onValueChange={(value) =>
                setClockOutData(prev => ({ ...prev, employeeId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Çalışan seçin" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mola Süresi (Dakika)</Label>
              <Input
                type="number"
                min="0"
                value={clockOutData.breakDuration}
                onChange={(e) => setClockOutData(prev => ({ ...prev, breakDuration: parseInt(e.target.value) || 0 }))}
                placeholder="Örn: 60"
              />
            </div>
            <div>
              <Label>Notlar (Opsiyonel)</Label>
              <Textarea
                value={clockOutData.notes}
                onChange={(e) => setClockOutData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Ek notlar..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClockOutDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleClockOut} disabled={!clockOutData.employeeId}>
              Çıkış Yap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}