'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Clock,
  Calendar,
  TrendingUp,
  Download,
  FileText,
  PieChart,
  BarChart3,
  Activity,
  Target,
  DollarSign,
  Briefcase,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { tr } from 'date-fns/locale'

interface DashboardMetrics {
  totalEmployees: number
  activeEmployees: number
  newHiresThisMonth: number
  avgWorkingHours: number
  attendanceRate: number
  pendingLeaveRequests: number
  approvedLeaveDays: number
  departmentCount: number
}

interface DepartmentStats {
  name: string
  employeeCount: number
  activeEmployeeCount: number
  avgAttendance: number
  avgWorkingHours: number
  pendingLeaves: number
}

interface AttendanceReport {
  date: string
  totalEmployees: number
  present: number
  absent: number
  late: number
  attendanceRate: number
}

interface LeaveAnalysis {
  type: string
  total: number
  approved: number
  pending: number
  rejected: number
  avgDuration: number
}

interface PayrollSummary {
  totalEmployees: number
  totalHours: number
  regularHours: number
  overtimeHours: number
  totalCost: number
}

export default function HRReportsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth')
  const [selectedReport, setSelectedReport] = useState<'overview' | 'attendance' | 'leave' | 'payroll'>('overview')

  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    totalEmployees: 0,
    activeEmployees: 0,
    newHiresThisMonth: 0,
    avgWorkingHours: 0,
    attendanceRate: 0,
    pendingLeaveRequests: 0,
    approvedLeaveDays: 0,
    departmentCount: 0
  })

  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([])
  const [attendanceReports, setAttendanceReports] = useState<AttendanceReport[]>([])
  const [leaveAnalysis, setLeaveAnalysis] = useState<LeaveAnalysis[]>([])
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary>({
    totalEmployees: 0,
    totalHours: 0,
    regularHours: 0,
    overtimeHours: 0,
    totalCost: 0
  })

  // Check admin permission
  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [session, router])

  // Fetch data when component mounts or period changes
  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod])

  const getDateRange = () => {
    const now = new Date()
    switch (selectedPeriod) {
      case 'thisMonth':
        return {
          startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(now), 'yyyy-MM-dd')
        }
      case 'lastMonth':
        const lastMonth = subMonths(now, 1)
        return {
          startDate: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(lastMonth), 'yyyy-MM-dd')
        }
      case 'last3Months':
        return {
          startDate: format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(now), 'yyyy-MM-dd')
        }
      default:
        return {
          startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(now), 'yyyy-MM-dd')
        }
    }
  }

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const { startDate, endDate } = getDateRange()

      // Fetch all HR data in parallel
      const [
        employeesRes,
        timeEntriesRes,
        leaveRequestsRes,
        leaveBalanceRes,
        departmentsRes
      ] = await Promise.all([
        fetch('/api/hr/employees'),
        fetch(`/api/hr/time-tracking/entries?startDate=${startDate}&endDate=${endDate}`),
        fetch('/api/hr/leave/requests'),
        fetch('/api/hr/leave/balance'),
        fetch('/api/hr/departments')
      ])

      // Process employees data
      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        const employees = employeesData.employees

        const thisMonth = new Date()
        const newHires = employees.filter((emp: any) => {
          const startDate = new Date(emp.startDate)
          return startDate.getMonth() === thisMonth.getMonth() &&
                 startDate.getFullYear() === thisMonth.getFullYear()
        }).length

        setDashboardMetrics(prev => ({
          ...prev,
          totalEmployees: employees.length,
          activeEmployees: employees.filter((emp: any) => emp.isActive).length,
          newHiresThisMonth: newHires
        }))
      }

      // Process time entries data
      if (timeEntriesRes.ok) {
        const timeEntriesData = await timeEntriesRes.json()
        const entries = timeEntriesData.timeEntries
        const summary = timeEntriesData.summary

        setDashboardMetrics(prev => ({
          ...prev,
          avgWorkingHours: summary?.averageHours || 0,
          attendanceRate: summary?.presentDays ?
            (summary.presentDays / (summary.presentDays + summary.absentDays)) * 100 : 0
        }))

        // Process daily attendance for chart
        const dailyAttendance = entries.reduce((acc: any, entry: any) => {
          const date = format(new Date(entry.date), 'yyyy-MM-dd')
          if (!acc[date]) {
            acc[date] = { date, totalEmployees: 0, present: 0, absent: 0, late: 0 }
          }
          acc[date].totalEmployees++
          if (entry.clockIn) {
            acc[date].present++
            const clockInTime = new Date(entry.clockIn)
            if (clockInTime.getHours() > 9) {
              acc[date].late++
            }
          } else {
            acc[date].absent++
          }
          return acc
        }, {})

        const attendanceArray = Object.values(dailyAttendance).map((day: any) => ({
          ...day,
          attendanceRate: day.totalEmployees > 0 ? (day.present / day.totalEmployees) * 100 : 0
        }))

        setAttendanceReports(attendanceArray as AttendanceReport[])
      }

      // Process leave requests data
      if (leaveRequestsRes.ok) {
        const leaveData = await leaveRequestsRes.json()
        const requests = leaveData.leaveRequests
        const summary = leaveData.summary

        setDashboardMetrics(prev => ({
          ...prev,
          pendingLeaveRequests: summary?.pending || 0,
          approvedLeaveDays: summary?.totalDaysRequested || 0
        }))

        // Analyze leave by type
        const leaveByType = requests.reduce((acc: any, request: any) => {
          if (!acc[request.type]) {
            acc[request.type] = {
              type: request.type,
              total: 0,
              approved: 0,
              pending: 0,
              rejected: 0,
              totalDays: 0
            }
          }
          acc[request.type].total++
          acc[request.type][request.status.toLowerCase()]++
          acc[request.type].totalDays += request.totalDays
          return acc
        }, {})

        const leaveAnalysisArray = Object.values(leaveByType).map((item: any) => ({
          ...item,
          avgDuration: item.total > 0 ? item.totalDays / item.total : 0
        }))

        setLeaveAnalysis(leaveAnalysisArray as LeaveAnalysis[])
      }

      // Process departments data
      if (departmentsRes.ok) {
        const departmentsData = await departmentsRes.json()
        const departments = departmentsData.departments

        setDashboardMetrics(prev => ({
          ...prev,
          departmentCount: departments.length
        }))

        // Calculate department statistics
        const deptStats = departments.map((dept: any) => ({
          name: dept.name,
          employeeCount: dept.employeeCount,
          activeEmployeeCount: dept.activeEmployeeCount,
          avgAttendance: 85 + Math.random() * 10, // Mock data
          avgWorkingHours: 7.5 + Math.random() * 1,
          pendingLeaves: Math.floor(Math.random() * 5)
        }))

        setDepartmentStats(deptStats)
      }

      // Calculate mock payroll summary
      const avgSalary = 45000 // Mock average salary
      setPayrollSummary({
        totalEmployees: dashboardMetrics.activeEmployees,
        totalHours: dashboardMetrics.activeEmployees * dashboardMetrics.avgWorkingHours * 22, // 22 working days
        regularHours: dashboardMetrics.activeEmployees * 8 * 22,
        overtimeHours: Math.max(0, dashboardMetrics.activeEmployees * (dashboardMetrics.avgWorkingHours - 8) * 22),
        totalCost: dashboardMetrics.activeEmployees * avgSalary
      })

    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = (type: string) => {
    // Mock export functionality
    const filename = `hr-${type}-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
    alert(`${filename} raporu indirilecek`) // In real implementation, this would trigger actual download
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const getLeaveTypeName = (type: string) => {
    switch (type) {
      case 'VACATION': return 'Yıllık İzin'
      case 'SICK': return 'Hastalık İzni'
      case 'PERSONAL': return 'Kişisel İzin'
      default: return type
    }
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
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">HR Raporları</h1>
            <p className="text-indigo-100 text-lg">
              İnsan kaynakları analitikleri ve raporları
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-44 bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisMonth">Bu Ay</SelectItem>
                <SelectItem value="lastMonth">Geçen Ay</SelectItem>
                <SelectItem value="last3Months">Son 3 Ay</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="lg"
              onClick={() => exportReport('overview')}
              className="bg-white text-indigo-600 hover:bg-indigo-50 border-0 font-semibold"
            >
              <Download className="h-5 w-5 mr-2" />
              Rapor İndir
            </Button>
          </div>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={selectedReport === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedReport('overview')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Genel Bakış
        </Button>
        <Button
          variant={selectedReport === 'attendance' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedReport('attendance')}
        >
          <Clock className="h-4 w-4 mr-2" />
          Devam Takibi
        </Button>
        <Button
          variant={selectedReport === 'leave' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedReport('leave')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          İzin Analizi
        </Button>
        <Button
          variant={selectedReport === 'payroll' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedReport('payroll')}
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Bordro Hazırlık
        </Button>
      </div>

      {/* Overview Report */}
      {selectedReport === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Çalışan</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardMetrics.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardMetrics.activeEmployees} aktif
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bu Ay Başlayanlar</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{dashboardMetrics.newHiresThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  Yeni işe alım
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Devam Oranı</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardMetrics.attendanceRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Ortalama devam
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bekleyen İzinler</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{dashboardMetrics.pendingLeaveRequests}</div>
                <p className="text-xs text-muted-foreground">
                  Onay bekliyor
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Department Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Departman Analizi</CardTitle>
              <CardDescription>
                Departman bazında performans metrikleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentStats.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{dept.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {dept.activeEmployeeCount}/{dept.employeeCount} aktif çalışan
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{dept.avgAttendance.toFixed(1)}%</div>
                        <div className="text-muted-foreground">Devam</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{dept.avgWorkingHours.toFixed(1)}h</div>
                        <div className="text-muted-foreground">Ort. Saat</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{dept.pendingLeaves}</div>
                        <div className="text-muted-foreground">Bekleyen İzin</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Attendance Report */}
      {selectedReport === 'attendance' && (
        <Card>
          <CardHeader>
            <CardTitle>Devam Takip Raporu</CardTitle>
            <CardDescription>
              Günlük devam durumu ve istatistikleri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendanceReports.slice(0, 10).map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="font-medium">
                    {format(new Date(report.date), 'dd MMMM yyyy', { locale: tr })}
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-green-600">{report.present}</div>
                      <div className="text-muted-foreground">Gelen</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-red-600">{report.absent}</div>
                      <div className="text-muted-foreground">Gelmeyen</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-yellow-600">{report.late}</div>
                      <div className="text-muted-foreground">Geç Gelen</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{report.attendanceRate.toFixed(1)}%</div>
                      <div className="text-muted-foreground">Devam Oranı</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leave Analysis */}
      {selectedReport === 'leave' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>İzin Türü Analizi</CardTitle>
              <CardDescription>
                İzin türlerine göre dağılım ve ortalamalar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaveAnalysis.map((analysis, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">{getLeaveTypeName(analysis.type)}</div>
                      <Badge variant="outline">{analysis.total} talep</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-green-600">{analysis.approved}</div>
                        <div className="text-muted-foreground">Onaylanan</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-yellow-600">{analysis.pending}</div>
                        <div className="text-muted-foreground">Bekleyen</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-red-600">{analysis.rejected}</div>
                        <div className="text-muted-foreground">Reddedilen</div>
                      </div>
                    </div>
                    <div className="mt-2 text-center text-sm text-muted-foreground">
                      Ortalama süre: {analysis.avgDuration.toFixed(1)} gün
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>İzin Bakiye Özeti</CardTitle>
              <CardDescription>
                Genel izin kullanım durumu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Toplam Onaylanan İzin</span>
                    <Badge variant="default">{dashboardMetrics.approvedLeaveDays} gün</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Bekleyen İzin Talepleri</span>
                    <Badge variant="secondary">{dashboardMetrics.pendingLeaveRequests} talep</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Ortalama İzin Kullanımı</span>
                    <Badge variant="outline">
                      {dashboardMetrics.activeEmployees > 0
                        ? (dashboardMetrics.approvedLeaveDays / dashboardMetrics.activeEmployees).toFixed(1)
                        : 0} gün/kişi
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payroll Report */}
      {selectedReport === 'payroll' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Bordro Özeti</CardTitle>
              <CardDescription>
                Aylık çalışma saatleri ve maliyet analizi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <span className="font-medium">Toplam Çalışan</span>
                  <span className="text-lg font-bold">{payrollSummary.totalEmployees}</span>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <span className="font-medium">Toplam Çalışma Saati</span>
                  <span className="text-lg font-bold">{payrollSummary.totalHours.toFixed(0)}h</span>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <span className="font-medium">Normal Mesai</span>
                  <span className="text-lg font-bold text-blue-600">{payrollSummary.regularHours.toFixed(0)}h</span>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <span className="font-medium">Fazla Mesai</span>
                  <span className="text-lg font-bold text-orange-600">{payrollSummary.overtimeHours.toFixed(0)}h</span>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg bg-primary/5">
                  <span className="font-medium">Toplam Maliyet</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(payrollSummary.totalCost)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bordro İşlemleri</CardTitle>
              <CardDescription>
                Bordro hazırlama ve export işlemleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => exportReport('payroll-summary')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Bordro Özet Raporu İndir
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => exportReport('timesheet')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Mesai Saatleri Raporu İndir
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => exportReport('overtime')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Fazla Mesai Raporu İndir
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => exportReport('attendance-detailed')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Detaylı Devam Raporu İndir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}