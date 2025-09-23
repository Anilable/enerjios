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
  Briefcase,
  Plus,
  Users,
  UserCheck,
  Edit2,
  Trash2,
  Building,
  TrendingUp,
  Activity
} from 'lucide-react'

interface Department {
  id: string
  name: string
  description?: string
  employeeCount: number
  activeEmployeeCount: number
  manager?: {
    firstName: string
    lastName: string
    employeeCode: string
  }
  employees: {
    id: string
    firstName: string
    lastName: string
    employeeCode: string
    isActive: boolean
  }[]
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  isActive: boolean
}

export default function DepartmentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [newDepartmentData, setNewDepartmentData] = useState({
    name: '',
    description: '',
    managerId: ''
  })

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
      const [departmentsRes, employeesRes] = await Promise.all([
        fetch('/api/hr/departments', {
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch('/api/hr/employees', {
          headers: { 'Content-Type': 'application/json' },
        })
      ])

      if (departmentsRes.ok) {
        const departmentsData = await departmentsRes.json()
        setDepartments(departmentsData.departments)
      }

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        setEmployees(employeesData.employees.filter((emp: Employee) => emp.isActive))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDepartment = async () => {
    try {
      const requestData = {
        ...newDepartmentData,
        managerId: newDepartmentData.managerId === 'none' ? undefined : newDepartmentData.managerId
      }

      const response = await fetch('/api/hr/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        setShowAddDialog(false)
        setNewDepartmentData({ name: '', description: '', managerId: '' })
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Departman oluşturulurken hata oluştu')
      }
    } catch (error) {
      console.error('Create department error:', error)
      alert('Departman oluşturulurken hata oluştu')
    }
  }

  const handleEditDepartment = async () => {
    if (!selectedDepartment) return

    try {
      const requestData = {
        ...newDepartmentData,
        managerId: newDepartmentData.managerId === 'none' ? undefined : newDepartmentData.managerId
      }

      const response = await fetch(`/api/hr/departments/${selectedDepartment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        setShowEditDialog(false)
        setSelectedDepartment(null)
        setNewDepartmentData({ name: '', description: '', managerId: '' })
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Departman güncellenirken hata oluştu')
      }
    } catch (error) {
      console.error('Edit department error:', error)
      alert('Departman güncellenirken hata oluştu')
    }
  }

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!confirm('Bu departmanı silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/hr/departments/${departmentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Departman silinirken hata oluştu')
      }
    } catch (error) {
      console.error('Delete department error:', error)
      alert('Departman silinirken hata oluştu')
    }
  }

  const openEditDialog = (department: Department) => {
    setSelectedDepartment(department)
    setNewDepartmentData({
      name: department.name,
      description: department.description || '',
      managerId: department.manager ? '' : '' // We'd need the manager ID here
    })
    setShowEditDialog(true)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const calculateStats = () => {
    const totalDepartments = departments.length
    const totalEmployees = departments.reduce((sum, dept) => sum + dept.employeeCount, 0)
    const avgEmployeesPerDept = totalDepartments > 0 ? totalEmployees / totalDepartments : 0
    const departmentsWithManagers = departments.filter(dept => dept.manager).length

    return {
      totalDepartments,
      totalEmployees,
      avgEmployeesPerDept,
      departmentsWithManagers
    }
  }

  const stats = calculateStats()

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
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Departman Yönetimi</h1>
            <p className="text-orange-100 text-lg">
              Şirket departmanları ve yöneticileri yönetimi
            </p>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            size="lg"
            className="bg-white text-orange-600 hover:bg-orange-50 font-semibold"
          >
            <Plus className="h-5 w-5 mr-2" />
            Yeni Departman
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Departman</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDepartments}</div>
            <p className="text-xs text-muted-foreground">
              Aktif departman sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Çalışan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Tüm departmanlarda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Büyüklük</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgEmployeesPerDept.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Çalışan/departman
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yöneticili Departman</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departmentsWithManagers}</div>
            <p className="text-xs text-muted-foreground">
              Yönetici atanmış
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Departmanlar ({departments.length})</CardTitle>
          <CardDescription>
            Tüm departmanlar ve yönetici bilgileri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Departman</TableHead>
                <TableHead>Yönetici</TableHead>
                <TableHead>Çalışan Sayısı</TableHead>
                <TableHead>Aktif Çalışan</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{department.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {department.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {department.manager ? (
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(department.manager.firstName, department.manager.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">
                            {department.manager.firstName} {department.manager.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {department.manager.employeeCode}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">Yönetici atanmamış</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{department.employeeCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {department.activeEmployeeCount}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        %{department.employeeCount > 0
                          ? ((department.activeEmployeeCount / department.employeeCount) * 100).toFixed(0)
                          : 0} aktif
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={department.description}>
                      {department.description || 'Açıklama yok'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(department)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDepartment(department.id)}
                        disabled={department.employeeCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Department Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Departman</DialogTitle>
            <DialogDescription>
              Yeni departman oluşturun ve yönetici atayın
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Departman Adı</Label>
              <Input
                value={newDepartmentData.name}
                onChange={(e) => setNewDepartmentData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Örn: İnsan Kaynakları"
              />
            </div>
            <div>
              <Label>Açıklama (Opsiyonel)</Label>
              <Textarea
                value={newDepartmentData.description}
                onChange={(e) => setNewDepartmentData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Departman açıklaması..."
                rows={3}
              />
            </div>
            <div>
              <Label>Departman Yöneticisi (Opsiyonel)</Label>
              <Select value={newDepartmentData.managerId} onValueChange={(value) =>
                setNewDepartmentData(prev => ({ ...prev, managerId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Yönetici seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yönetici seçmeyin</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleCreateDepartment} disabled={!newDepartmentData.name}>
              Departman Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Departman Düzenle</DialogTitle>
            <DialogDescription>
              {selectedDepartment?.name} departmanını düzenleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Departman Adı</Label>
              <Input
                value={newDepartmentData.name}
                onChange={(e) => setNewDepartmentData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Örn: İnsan Kaynakları"
              />
            </div>
            <div>
              <Label>Açıklama</Label>
              <Textarea
                value={newDepartmentData.description}
                onChange={(e) => setNewDepartmentData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Departman açıklaması..."
                rows={3}
              />
            </div>
            <div>
              <Label>Departman Yöneticisi</Label>
              <Select value={newDepartmentData.managerId} onValueChange={(value) =>
                setNewDepartmentData(prev => ({ ...prev, managerId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Yönetici seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yönetici seçmeyin</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleEditDepartment} disabled={!newDepartmentData.name}>
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}