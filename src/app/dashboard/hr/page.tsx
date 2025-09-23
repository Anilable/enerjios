'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  UserCheck,
  Clock,
  Calendar,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Coffee,
  Timer,
  Activity,
  Target,
  Award,
  UserPlus,
  FileText,
  BarChart3
} from 'lucide-react'

interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  presentToday: number
  onLeaveToday: number
  pendingLeaveRequests: number
  totalDepartments: number
  averageWorkHours: number
  thisMonthJoiners: number
  overtimeCount: number
  attendanceRate: number
}

interface RecentActivity {
  id: string
  type: string
  message: string
  timestamp: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export default function HRDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    presentToday: 0,
    onLeaveToday: 0,
    pendingLeaveRequests: 0,
    totalDepartments: 0,
    averageWorkHours: 0,
    thisMonthJoiners: 0,
    overtimeCount: 0,
    attendanceRate: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  // Check admin permission
  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [session, router])

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [employeesRes, departmentsRes, timeEntriesRes, leaveRequestsRes] = await Promise.all([
        fetch('/api/hr/employees'),
        fetch('/api/hr/departments'),
        fetch('/api/hr/time-tracking/entries'),
        fetch('/api/hr/leave/requests')
      ])

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        const employees = employeesData.employees || []

        const totalEmployees = employees.length
        const activeEmployees = employees.filter((emp: any) => emp.isActive).length
        const thisMonth = new Date()
        const thisMonthJoiners = employees.filter((emp: any) => {
          const startDate = new Date(emp.startDate)
          return startDate.getMonth() === thisMonth.getMonth() &&
                 startDate.getFullYear() === thisMonth.getFullYear()
        }).length

        setStats(prev => ({
          ...prev,
          totalEmployees,
          activeEmployees,
          thisMonthJoiners
        }))
      }

      if (departmentsRes.ok) {
        const departmentsData = await departmentsRes.json()
        setStats(prev => ({
          ...prev,
          totalDepartments: departmentsData.departments?.length || 0
        }))
      }

      if (timeEntriesRes.ok) {
        const timeData = await timeEntriesRes.json()
        const entries = timeData.timeEntries || []

        const presentToday = entries.filter((entry: any) => entry.clockIn).length
        const averageHours = entries.reduce((sum: number, entry: any) =>
          sum + (entry.totalHours || 0), 0) / (entries.length || 1)
        const overtimeCount = entries.filter((entry: any) => (entry.totalHours || 0) > 8).length

        setStats(prev => ({
          ...prev,
          presentToday,
          averageWorkHours: averageHours,
          overtimeCount,
          attendanceRate: prev.activeEmployees > 0 ? (presentToday / prev.activeEmployees) * 100 : 0
        }))
      }

      if (leaveRequestsRes.ok) {
        const leaveData = await leaveRequestsRes.json()
        const requests = leaveData.requests || []

        const pendingLeaveRequests = requests.filter((req: any) => req.status === 'PENDING').length
        const onLeaveToday = requests.filter((req: any) => {
          const today = new Date()
          const startDate = new Date(req.startDate)
          const endDate = new Date(req.endDate)
          return req.status === 'APPROVED' && startDate <= today && endDate >= today
        }).length

        setStats(prev => ({
          ...prev,
          pendingLeaveRequests,
          onLeaveToday
        }))
      }

      // Mock recent activities
      setRecentActivities([
        {
          id: '1',
          type: 'employee_joined',
          message: 'Yeni çalışan Ali Veli sisteme eklendi',
          timestamp: '2 saat önce',
          icon: UserPlus,
          color: 'text-green-600'
        },
        {
          id: '2',
          type: 'leave_request',
          message: '3 izin talebi onay bekliyor',
          timestamp: '4 saat önce',
          icon: Calendar,
          color: 'text-yellow-600'
        },
        {
          id: '3',
          type: 'overtime',
          message: '5 çalışan bugün mesai yaptı',
          timestamp: '6 saat önce',
          icon: Clock,
          color: 'text-orange-600'
        },
        {
          id: '4',
          type: 'report',
          message: 'Aylık devam raporu oluşturuldu',
          timestamp: '1 gün önce',
          icon: FileText,
          color: 'text-blue-600'
        }
      ])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: 'Personel Yönetimi',
      description: 'Çalışan bilgilerini görüntüle ve yönet',
      href: '/dashboard/hr/employees',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Mesai Takibi',
      description: 'Giriş-çıkış kayıtları ve mesai saatleri',
      href: '/dashboard/hr/time-tracking',
      icon: Clock,
      color: 'bg-green-500'
    },
    {
      title: 'İzin Yönetimi',
      description: 'İzin talepleri ve onay süreçleri',
      href: '/dashboard/hr/leave-management',
      icon: Calendar,
      color: 'bg-purple-500'
    },
    {
      title: 'Departmanlar',
      description: 'Departman yapısı ve yöneticiler',
      href: '/dashboard/hr/departments',
      icon: Briefcase,
      color: 'bg-orange-500'
    },
    {
      title: 'Raporlar',
      description: 'HR analitik ve performans raporları',
      href: '/dashboard/hr/reports',
      icon: BarChart3,
      color: 'bg-indigo-500'
    }
  ]

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
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">İnsan Kaynakları</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
          Şirket personeli ve HR operasyonları yönetim merkezi
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Personel</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeEmployees} aktif çalışan
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugün Gelen</CardTitle>
            <UserCheck className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.presentToday}</div>
            <div className="flex items-center mt-1">
              <Progress value={stats.attendanceRate} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground ml-2">
                %{stats.attendanceRate.toFixed(0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İzinli Personel</CardTitle>
            <Calendar className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.onLeaveToday}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingLeaveRequests} onay bekliyor
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mesai Yapan</CardTitle>
            <Timer className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overtimeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ortalama {stats.averageWorkHours.toFixed(1)} saat/gün
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Hızlı İşlemler</CardTitle>
              <CardDescription>
                Sık kullanılan HR fonksiyonlarına hızlı erişim
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group block"
                  >
                    <Card className="h-full transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer border-2 hover:border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg ${action.color} text-white`}>
                            <action.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                {action.title}
                              </h3>
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Son Aktiviteler</CardTitle>
              <CardDescription>
                Sistem genelindeki son değişiklikler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${activity.color}`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Department Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Departman Özeti</CardTitle>
          <CardDescription>
            Departmanlar ve çalışan dağılımı
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalDepartments}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Aktif Departman</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-lg font-semibold">{(stats.activeEmployees / Math.max(stats.totalDepartments, 1)).toFixed(1)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Ortalama/Departman</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{stats.thisMonthJoiners}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Bu Ay Katılan</p>
              </div>
            </div>
            <Link href="/dashboard/hr/departments">
              <Button variant="outline" className="flex items-center space-x-2">
                <span>Tümünü Gör</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}