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
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Calendar as CalendarIcon,
  Plus,
  Check,
  X,
  Clock,
  Users,
  TrendingUp,
  Download,
  Filter,
  Search,
  Eye,
  MessageSquare,
  CalendarDays,
  Plane,
  Heart,
  User,
  AlertCircle
} from 'lucide-react'
import { format, addDays, differenceInBusinessDays } from 'date-fns'
import { tr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface LeaveRequest {
  id: string
  type: 'SICK' | 'VACATION' | 'PERSONAL'
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  approvedAt?: string
  comments?: string
  employee: {
    firstName: string
    lastName: string
    employeeCode: string
    department?: {
      name: string
    }
  }
  approvedBy?: {
    firstName: string
    lastName: string
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

interface LeaveBalance {
  employeeId: string
  employeeName: string
  employeeCode: string
  department: string
  vacation: {
    total: number
    used: number
    pending: number
    remaining: number
  }
  sick: {
    used: number
    pending: number
  }
  personal: {
    used: number
    pending: number
  }
}

interface LeaveStats {
  pending: number
  approved: number
  rejected: number
  totalDaysRequested: number
}

export default function LeaveManagementPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [leaveStats, setLeaveStats] = useState<LeaveStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalDaysRequested: 0
  })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [newRequestData, setNewRequestData] = useState({
    employeeId: '',
    type: '',
    startDate: new Date(),
    endDate: new Date(),
    reason: ''
  })
  const [currentTab, setCurrentTab] = useState<'requests' | 'balances'>('requests')

  // Check admin permission
  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [session, router])

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [requestsRes, employeesRes, balancesRes] = await Promise.all([
        fetch('/api/hr/leave/requests', {
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch('/api/hr/employees', {
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch('/api/hr/leave/balance', {
          headers: { 'Content-Type': 'application/json' },
        })
      ])

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json()
        setLeaveRequests(requestsData.leaveRequests)
        setLeaveStats(requestsData.summary)
      }

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        setEmployees(employeesData.employees.filter((emp: Employee) => emp.id))
      }

      if (balancesRes.ok) {
        const balancesData = await balancesRes.json()
        setLeaveBalances(balancesData.leaveBalances)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (requestId: string, action: 'approve' | 'reject', comments?: string) => {
    try {
      const response = await fetch(`/api/hr/leave/${requestId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, comments })
      })

      if (response.ok) {
        fetchData()
        if (selectedRequest?.id === requestId) {
          setShowDetailDialog(false)
          setSelectedRequest(null)
        }
      } else {
        const error = await response.json()
        alert(error.error || 'İşlem sırasında hata oluştu')
      }
    } catch (error) {
      console.error('Approval error:', error)
      alert('İşlem sırasında hata oluştu')
    }
  }

  const handleNewRequest = async () => {
    try {
      const totalDays = differenceInBusinessDays(newRequestData.endDate, newRequestData.startDate) + 1

      const response = await fetch('/api/hr/leave/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRequestData,
          totalDays,
          startDate: newRequestData.startDate.toISOString(),
          endDate: newRequestData.endDate.toISOString()
        })
      })

      if (response.ok) {
        setShowNewRequestDialog(false)
        setNewRequestData({
          employeeId: '',
          type: '',
          startDate: new Date(),
          endDate: new Date(),
          reason: ''
        })
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'İzin talebi oluşturulurken hata oluştu')
      }
    } catch (error) {
      console.error('New request error:', error)
      alert('İzin talebi oluşturulurken hata oluştu')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Bekliyor</Badge>
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Onaylandı</Badge>
      case 'REJECTED':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Reddedildi</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VACATION':
        return <Plane className="h-4 w-4 text-blue-500" />
      case 'SICK':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'PERSONAL':
        return <User className="h-4 w-4 text-purple-500" />
      default:
        return <CalendarDays className="h-4 w-4" />
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'VACATION':
        return 'Yıllık İzin'
      case 'SICK':
        return 'Hastalık İzni'
      case 'PERSONAL':
        return 'Kişisel İzin'
      default:
        return type
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const filteredRequests = leaveRequests.filter(request => {
    const matchesStatus = !statusFilter || statusFilter === 'all' || request.status === statusFilter
    const matchesType = !typeFilter || typeFilter === 'all' || request.type === typeFilter
    const matchesSearch = !searchTerm ||
      request.employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employee.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesType && matchesSearch
  })

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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">İzin Yönetimi</h1>
            <p className="text-purple-100 text-lg">
              Çalışan izin talepleri ve bakiye yönetimi
            </p>
          </div>
          <Button
            onClick={() => setShowNewRequestDialog(true)}
            size="lg"
            className="bg-white text-purple-600 hover:bg-purple-50 font-semibold"
          >
            <Plus className="h-5 w-5 mr-2" />
            Yeni İzin Talebi
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Talepler</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{leaveStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Onay bekleyen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{leaveStats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Bu ay onaylanan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reddedilen</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{leaveStats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              Bu ay reddedilen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gün</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveStats.totalDaysRequested}</div>
            <p className="text-xs text-muted-foreground">
              Talep edilen gün
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={currentTab === 'requests' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentTab('requests')}
        >
          İzin Talepleri
        </Button>
        <Button
          variant={currentTab === 'balances' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentTab('balances')}
        >
          İzin Bakiyeleri
        </Button>
      </div>

      {currentTab === 'requests' && (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtreler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Çalışan ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Durum seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="PENDING">Bekliyor</SelectItem>
                    <SelectItem value="APPROVED">Onaylandı</SelectItem>
                    <SelectItem value="REJECTED">Reddedildi</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="İzin türü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Türler</SelectItem>
                    <SelectItem value="VACATION">Yıllık İzin</SelectItem>
                    <SelectItem value="SICK">Hastalık İzni</SelectItem>
                    <SelectItem value="PERSONAL">Kişisel İzin</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Dışa Aktar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Leave Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>İzin Talepleri ({filteredRequests.length})</CardTitle>
              <CardDescription>
                Tüm çalışan izin talepleri ve durumları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Çalışan</TableHead>
                    <TableHead>İzin Türü</TableHead>
                    <TableHead>Tarih Aralığı</TableHead>
                    <TableHead>Gün Sayısı</TableHead>
                    <TableHead>Sebep</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(request.employee.firstName, request.employee.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {request.employee.firstName} {request.employee.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {request.employee.employeeCode} • {request.employee.department?.name || 'Atanmamış'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(request.type)}
                          {getTypeName(request.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(request.startDate), 'dd MMM yyyy', { locale: tr })}</div>
                          <div className="text-muted-foreground">
                            {format(new Date(request.endDate), 'dd MMM yyyy', { locale: tr })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.totalDays} gün</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={request.reason}>
                          {request.reason}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowDetailDialog(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.status === 'PENDING' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApproval(request.id, 'approve')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleApproval(request.id, 'reject')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {currentTab === 'balances' && (
        <Card>
          <CardHeader>
            <CardTitle>İzin Bakiyeleri</CardTitle>
            <CardDescription>
              Çalışanların yıllık izin kullanım durumları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Çalışan</TableHead>
                  <TableHead>Departman</TableHead>
                  <TableHead>Toplam Hak</TableHead>
                  <TableHead>Kullanılan</TableHead>
                  <TableHead>Bekleyen</TableHead>
                  <TableHead>Kalan</TableHead>
                  <TableHead>Hastalık</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveBalances.map((balance) => (
                  <TableRow key={balance.employeeId}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {balance.employeeName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{balance.employeeName}</div>
                          <div className="text-sm text-muted-foreground">
                            {balance.employeeCode}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{balance.department}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{balance.vacation.total} gün</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{balance.vacation.used} gün</Badge>
                    </TableCell>
                    <TableCell>
                      {balance.vacation.pending > 0 ? (
                        <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                          {balance.vacation.pending} gün
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className={
                        balance.vacation.remaining > 5 ? 'bg-green-100 text-green-800' :
                        balance.vacation.remaining > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {balance.vacation.remaining} gün
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {balance.sick.used} gün kullanıldı
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* New Leave Request Dialog */}
      <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni İzin Talebi</DialogTitle>
            <DialogDescription>
              Çalışan için yeni izin talebi oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Çalışan</Label>
                <Select value={newRequestData.employeeId} onValueChange={(value) =>
                  setNewRequestData(prev => ({ ...prev, employeeId: value }))
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
                <Label>İzin Türü</Label>
                <Select value={newRequestData.type} onValueChange={(value) =>
                  setNewRequestData(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="İzin türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VACATION">Yıllık İzin</SelectItem>
                    <SelectItem value="SICK">Hastalık İzni</SelectItem>
                    <SelectItem value="PERSONAL">Kişisel İzin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Başlangıç Tarihi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newRequestData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newRequestData.startDate ? format(newRequestData.startDate, "PPP", { locale: tr }) : "Tarih seçin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newRequestData.startDate}
                      onSelect={(date: Date | undefined) => date && setNewRequestData(prev => ({ ...prev, startDate: date }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Bitiş Tarihi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newRequestData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newRequestData.endDate ? format(newRequestData.endDate, "PPP", { locale: tr }) : "Tarih seçin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newRequestData.endDate}
                      onSelect={(date: Date | undefined) => date && setNewRequestData(prev => ({ ...prev, endDate: date }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label>Toplam İş Günü</Label>
              <div className="text-sm text-muted-foreground mt-1">
                {differenceInBusinessDays(newRequestData.endDate, newRequestData.startDate) + 1} gün
              </div>
            </div>

            <div>
              <Label>Sebep</Label>
              <Textarea
                value={newRequestData.reason}
                onChange={(e) => setNewRequestData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="İzin sebebini açıklayın..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRequestDialog(false)}>
              İptal
            </Button>
            <Button
              onClick={handleNewRequest}
              disabled={!newRequestData.employeeId || !newRequestData.type || !newRequestData.reason}
            >
              Talebi Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Request Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>İzin Talebi Detayları</DialogTitle>
            <DialogDescription>
              {selectedRequest?.employee.firstName} {selectedRequest?.employee.lastName} - İzin Talebi
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Çalışan</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.employee.firstName} {selectedRequest.employee.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Departman</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.employee.department?.name || 'Atanmamış'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">İzin Türü</label>
                  <p className="text-sm text-muted-foreground">
                    {getTypeName(selectedRequest.type)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Toplam Gün</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.totalDays} gün
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Başlangıç</label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedRequest.startDate), 'dd MMMM yyyy', { locale: tr })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Bitiş</label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedRequest.endDate), 'dd MMMM yyyy', { locale: tr })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Durum</label>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div>
                  <label className="text-sm font-medium">Talep Tarihi</label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedRequest.createdAt), 'dd MMMM yyyy', { locale: tr })}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Sebep</label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedRequest.reason}
                </p>
              </div>

              {selectedRequest.comments && (
                <div>
                  <label className="text-sm font-medium">Yönetici Yorumu</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedRequest.comments}
                  </p>
                </div>
              )}

              {selectedRequest.approvedBy && (
                <div>
                  <label className="text-sm font-medium">Onaylayan</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.approvedBy.firstName} {selectedRequest.approvedBy.lastName}
                  </p>
                </div>
              )}

              {selectedRequest.status === 'PENDING' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="default"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproval(selectedRequest.id, 'approve')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Onayla
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleApproval(selectedRequest.id, 'reject')}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reddet
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}