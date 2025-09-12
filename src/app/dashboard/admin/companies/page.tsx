'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Building, Plus, Search, Filter, Edit, Eye, Trash2,
  Users, Award, MapPin, Phone, Mail, Globe,
  Star, CheckCircle, AlertCircle, Clock, Zap,
  Settings, Shield, Activity, TrendingUp
} from 'lucide-react'

interface Company {
  id: string
  name: string
  businessName: string
  taxNumber: string
  email: string
  phone: string
  website?: string
  address: string
  city: string
  serviceType: 'SOLAR_INSTALLER' | 'EPC_CONTRACTOR' | 'DISTRIBUTOR' | 'MAINTENANCE'
  certifications: string[]
  employeeCount: number
  foundedYear: number
  rating: number
  projectCount: number
  totalCapacity: number
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED'
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED'
  documents: Array<{ type: string; url: string; verified: boolean }>
  subscription: {
    plan: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'
    features: string[]
    expiresAt: string
  }
  createdAt: string
  lastLoginAt?: string
}

export default function CompanyManagementPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      // Mock data - replace with actual API
      const mockCompanies: Company[] = [
        {
          id: '1',
          name: 'Güneş Enerji Solutions',
          businessName: 'Güneş Enerji Çözümleri Ltd. Şti.',
          taxNumber: '1234567890',
          email: 'info@gunesenerji.com',
          phone: '+90 212 555 0101',
          website: 'https://gunesenerji.com',
          address: 'Atatürk Mah. Güneş Sok. No:12',
          city: 'Istanbul',
          serviceType: 'SOLAR_INSTALLER',
          certifications: ['ISO 9001', 'TSE', 'EPDK'],
          employeeCount: 45,
          foundedYear: 2015,
          rating: 4.8,
          projectCount: 127,
          totalCapacity: 5600,
          status: 'ACTIVE',
          verificationStatus: 'VERIFIED',
          documents: [
            { type: 'license', url: '/docs/license.pdf', verified: true },
            { type: 'insurance', url: '/docs/insurance.pdf', verified: true }
          ],
          subscription: {
            plan: 'PROFESSIONAL',
            features: ['CRM', 'Analytics', 'API Access'],
            expiresAt: '2024-12-31'
          },
          createdAt: '2023-01-15',
          lastLoginAt: '2024-01-20'
        },
        {
          id: '2',
          name: 'Solar Teknoloji A.Ş.',
          businessName: 'Solar Teknoloji Anonim Şirketi',
          taxNumber: '0987654321',
          email: 'contact@solartek.com.tr',
          phone: '+90 312 444 0202',
          address: 'Ostim OSB, Teknoloji Cd. No:45',
          city: 'Ankara',
          serviceType: 'EPC_CONTRACTOR',
          certifications: ['ISO 14001', 'OHSAS 18001'],
          employeeCount: 120,
          foundedYear: 2012,
          rating: 4.6,
          projectCount: 89,
          totalCapacity: 12300,
          status: 'ACTIVE',
          verificationStatus: 'VERIFIED',
          documents: [
            { type: 'license', url: '/docs/license2.pdf', verified: true }
          ],
          subscription: {
            plan: 'ENTERPRISE',
            features: ['CRM', 'Analytics', 'API Access', 'White Label'],
            expiresAt: '2024-06-30'
          },
          createdAt: '2023-03-22',
          lastLoginAt: '2024-01-19'
        }
      ]
      
      setCompanies(mockCompanies)
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter
    const matchesService = serviceFilter === 'all' || company.serviceType === serviceFilter
    
    return matchesSearch && matchesStatus && matchesService
  })

  const getStatusBadge = (status: Company['status']) => {
    const variants = {
      ACTIVE: { variant: 'default' as const, label: 'Aktif', icon: CheckCircle },
      PENDING: { variant: 'secondary' as const, label: 'Beklemede', icon: Clock },
      SUSPENDED: { variant: 'destructive' as const, label: 'Askıya Alındı', icon: AlertCircle },
      REJECTED: { variant: 'outline' as const, label: 'Reddedildi', icon: AlertCircle }
    }
    const config = variants[status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getVerificationBadge = (status: Company['verificationStatus']) => {
    const variants = {
      VERIFIED: { variant: 'default' as const, label: 'Doğrulandı', color: 'text-green-600' },
      PENDING: { variant: 'secondary' as const, label: 'Beklemede', color: 'text-yellow-600' },
      REJECTED: { variant: 'destructive' as const, label: 'Reddedildi', color: 'text-red-600' }
    }
    const config = variants[status]
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  const getServiceTypeLabel = (type: Company['serviceType']) => {
    const types = {
      SOLAR_INSTALLER: 'GES Kurulumcu',
      EPC_CONTRACTOR: 'EPC Yüklenici',
      DISTRIBUTOR: 'Distribütör',
      MAINTENANCE: 'Bakım & Servis'
    }
    return types[type]
  }

  const updateCompanyStatus = async (companyId: string, status: Company['status']) => {
    try {
      // API call to update status
      setCompanies(companies.map(company => 
        company.id === companyId ? { ...company, status } : company
      ))
    } catch (error) {
      console.error('Error updating company status:', error)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Firma Yönetimi</h1>
            <p className="text-muted-foreground mt-1">
              Platform üzerindeki tüm firmaları yönetin
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Firma Ekle
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Firma</p>
                  <p className="text-2xl font-bold">{companies.length}</p>
                </div>
                <Building className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aktif Firmalar</p>
                  <p className="text-2xl font-bold">
                    {companies.filter(c => c.status === 'ACTIVE').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bekleyen Onay</p>
                  <p className="text-2xl font-bold">
                    {companies.filter(c => c.verificationStatus === 'PENDING').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Kapasite</p>
                  <p className="text-2xl font-bold">
                    {(companies.reduce((sum, c) => sum + c.totalCapacity, 0) / 1000).toFixed(1)} MW
                  </p>
                </div>
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Firma adı veya email ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="PENDING">Beklemede</SelectItem>
                  <SelectItem value="SUSPENDED">Askıya Alındı</SelectItem>
                  <SelectItem value="REJECTED">Reddedildi</SelectItem>
                </SelectContent>
              </Select>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Hizmet Tipi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Hizmetler</SelectItem>
                  <SelectItem value="SOLAR_INSTALLER">GES Kurulumcu</SelectItem>
                  <SelectItem value="EPC_CONTRACTOR">EPC Yüklenici</SelectItem>
                  <SelectItem value="DISTRIBUTOR">Distribütör</SelectItem>
                  <SelectItem value="MAINTENANCE">Bakım & Servis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Companies Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Firma</TableHead>
                <TableHead>Hizmet Tipi</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Doğrulama</TableHead>
                <TableHead>Projeler</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-muted-foreground">{company.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getServiceTypeLabel(company.serviceType)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(company.status)}</TableCell>
                  <TableCell>{getVerificationBadge(company.verificationStatus)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{company.projectCount} proje</div>
                      <div className="text-muted-foreground">
                        {(company.totalCapacity / 1000).toFixed(1)} MW
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{company.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCompany(company)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Select
                        value={company.status}
                        onValueChange={(status) => updateCompanyStatus(company.id, status as Company['status'])}
                      >
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Aktif</SelectItem>
                          <SelectItem value="SUSPENDED">Askıya Al</SelectItem>
                          <SelectItem value="REJECTED">Reddet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Company Detail Modal */}
        {selectedCompany && (
          <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  {selectedCompany.name}
                </DialogTitle>
                <DialogDescription>
                  Firma detayları ve yönetim seçenekleri
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
                  <TabsTrigger value="verification">Doğrulama</TabsTrigger>
                  <TabsTrigger value="subscription">Abonelik</TabsTrigger>
                  <TabsTrigger value="analytics">Analitik</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Firma Adı</Label>
                      <Input value={selectedCompany.name} readOnly />
                    </div>
                    <div>
                      <Label>Ticari Ünvan</Label>
                      <Input value={selectedCompany.businessName} readOnly />
                    </div>
                    <div>
                      <Label>E-posta</Label>
                      <Input value={selectedCompany.email} readOnly />
                    </div>
                    <div>
                      <Label>Telefon</Label>
                      <Input value={selectedCompany.phone} readOnly />
                    </div>
                    <div>
                      <Label>Şehir</Label>
                      <Input value={selectedCompany.city} readOnly />
                    </div>
                    <div>
                      <Label>Çalışan Sayısı</Label>
                      <Input value={selectedCompany.employeeCount.toString()} readOnly />
                    </div>
                  </div>
                  <div>
                    <Label>Adres</Label>
                    <Textarea value={selectedCompany.address} readOnly />
                  </div>
                </TabsContent>

                <TabsContent value="verification" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Doğrulama Durumu</span>
                      {getVerificationBadge(selectedCompany.verificationStatus)}
                    </div>
                    <div>
                      <Label>Sertifikalar</Label>
                      <div className="flex gap-2 mt-2">
                        {selectedCompany.certifications.map((cert, index) => (
                          <Badge key={index} variant="secondary">{cert}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Belgeler</Label>
                      <div className="space-y-2 mt-2">
                        {selectedCompany.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span className="capitalize">{doc.type}</span>
                            <div className="flex items-center gap-2">
                              {doc.verified ? (
                                <Badge variant="default">Doğrulandı</Badge>
                              ) : (
                                <Badge variant="secondary">Beklemede</Badge>
                              )}
                              <Button size="sm" variant="outline">Görüntüle</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="subscription" className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label>Mevcut Plan</Label>
                      <Badge className="mt-1 block w-fit">
                        {selectedCompany.subscription.plan}
                      </Badge>
                    </div>
                    <div>
                      <Label>Özellikler</Label>
                      <div className="flex gap-2 mt-2">
                        {selectedCompany.subscription.features.map((feature, index) => (
                          <Badge key={index} variant="outline">{feature}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Bitiş Tarihi</Label>
                      <Input value={selectedCompany.subscription.expiresAt} readOnly />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">Proje Sayısı</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">{selectedCompany.projectCount}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-600" />
                          <span className="font-medium">Toplam Kapasite</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">
                          {(selectedCompany.totalCapacity / 1000).toFixed(1)} MW
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-500" />
                          <span className="font-medium">Ortalama Rating</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">{selectedCompany.rating}/5</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-green-600" />
                          <span className="font-medium">Çalışan Sayısı</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">{selectedCompany.employeeCount}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}