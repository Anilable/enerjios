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
} from '@/components/ui/dialog'
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  UserX,
  Download,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  DollarSign
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  employeeCode: string
  position: string
  salary: number
  phoneNumber?: string
  isActive: boolean
  startDate: string
  profileImage?: string
  department?: {
    name: string
  }
  timeEntries: any[]
  leaveRequests: any[]
}

interface Department {
  id: string
  name: string
}

export default function EmployeesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  // Check admin permission
  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [session, router])

  // Fetch employees and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesRes, departmentsRes] = await Promise.all([
          fetch('/api/hr/employees', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch('/api/hr/departments', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })
        ])

        if (employeesRes.ok) {
          const employeesData = await employeesRes.json()
          setEmployees(employeesData.employees)
        }

        if (departmentsRes.ok) {
          const departmentsData = await departmentsRes.json()
          setDepartments(departmentsData.departments)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch =
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment =
      !selectedDepartment || selectedDepartment === 'all' || employee.department?.name === selectedDepartment

    const matchesStatus =
      !selectedStatus || selectedStatus === 'all' ||
      (selectedStatus === 'active' ? employee.isActive : !employee.isActive)

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowDetailDialog(true)
  }

  const handleDeactivateEmployee = async (employeeId: string) => {
    if (!confirm('Bu çalışanı deaktif etmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/hr/employees/${employeeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        setEmployees(prev => prev.map(emp =>
          emp.id === employeeId ? { ...emp, isActive: false } : emp
        ))
      }
    } catch (error) {
      console.error('Error deactivating employee:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Personel Yönetimi</h1>
            <p className="text-blue-100 text-lg">
              Çalışanları yönetin, bilgilerini güncelleyin ve raporları görüntüleyin
            </p>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
          >
            <Plus className="h-5 w-5 mr-2" />
            Yeni Çalışan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Toplam Çalışan</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{employees.length}</div>
            <p className="text-sm text-green-600 font-medium mt-1">
              {employees.filter(e => e.isActive).length} aktif
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Departman Sayısı</CardTitle>
            <div className="p-2 bg-purple-100 rounded-full">
              <Briefcase className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{departments.length}</div>
            <p className="text-sm text-gray-600 mt-1">
              Aktif departmanlar
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Bu Ay Başlayanlar</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {employees.filter(e => {
                const startDate = new Date(e.startDate)
                const thisMonth = new Date()
                return startDate.getMonth() === thisMonth.getMonth() &&
                       startDate.getFullYear() === thisMonth.getFullYear()
              }).length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Yeni işe alımlar
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ortalama Maaş</CardTitle>
            <div className="p-2 bg-orange-100 rounded-full">
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(
                employees.filter(e => e.isActive).reduce((sum, e) => sum + e.salary, 0) /
                employees.filter(e => e.isActive).length || 0
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Aktif çalışanlar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gray-50 rounded-t-lg">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-blue-600" />
            Filtreler ve Arama
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ad, soyad, email veya çalışan kodu ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="Departman seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Departmanlar</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Hepsi</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Çalışanlar ({filteredEmployees.length})</CardTitle>
          <CardDescription>
            Tüm çalışan bilgileri ve durumları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Çalışan</TableHead>
                <TableHead>Departman</TableHead>
                <TableHead>Pozisyon</TableHead>
                <TableHead>İletişim</TableHead>
                <TableHead>Başlama Tarihi</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={employee.profileImage} />
                        <AvatarFallback>
                          {getInitials(employee.firstName, employee.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {employee.employeeCode}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.department?.name || 'Atanmamış'}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1" />
                        {employee.email}
                      </div>
                      {employee.phoneNumber && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          {employee.phoneNumber}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(employee.startDate)}</TableCell>
                  <TableCell>
                    <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                      {employee.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewEmployee(employee)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Detayları Gör
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Düzenle
                        </DropdownMenuItem>
                        {employee.isActive && (
                          <DropdownMenuItem
                            onClick={() => handleDeactivateEmployee(employee.id)}
                            className="text-red-600"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Deaktif Et
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Employee Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Çalışan Detayları</DialogTitle>
            <DialogDescription>
              {selectedEmployee?.firstName} {selectedEmployee?.lastName} - Detaylı Bilgiler
            </DialogDescription>
          </DialogHeader>

          {selectedEmployee && (
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Ad Soyad</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Çalışan Kodu</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmployee.employeeCode}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmployee.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Telefon</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmployee.phoneNumber || 'Belirtilmemiş'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Departman</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmployee.department?.name || 'Atanmamış'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Pozisyon</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmployee.position}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Başlama Tarihi</label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedEmployee.startDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Durum</label>
                  <Badge variant={selectedEmployee.isActive ? 'default' : 'secondary'}>
                    {selectedEmployee.isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="font-medium mb-2">Son Aktiviteler</h4>
                <div className="text-sm text-muted-foreground">
                  <p>• {selectedEmployee.timeEntries.length} mesai kaydı (son 30 gün)</p>
                  <p>• {selectedEmployee.leaveRequests.filter(r => r.status === 'PENDING').length} bekleyen izin talebi</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}