'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CustomerList } from '@/components/customers/customer-list'
import { CustomerForm } from '@/components/customers/customer-form'
import { CustomerDetail } from '@/components/customers/customer-detail'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  Target
} from 'lucide-react'

export interface CustomerData {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  district: string
  customerType: 'INDIVIDUAL' | 'CORPORATE' | 'FARMER'
  leadSource: 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'ADVERTISEMENT' | 'OTHER'
  status: 'LEAD' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'CUSTOMER' | 'LOST'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignedTo: string
  tags: string[]
  notes: string
  companyName?: string
  taxNumber?: string
  lastContact: Date
  createdAt: Date
  updatedAt: Date
  
  // Lead Information
  leadInfo: {
    estimatedBudget: number
    projectSize: string
    timeline: string
    electricityBill: number
    roofType: string
    hasRoof: boolean
    propertyType: string
  }
  
  // Interaction History
  interactions: Array<{
    id: string
    type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'QUOTE_SENT' | 'FOLLOW_UP'
    subject: string
    description: string
    date: Date
    userId: string
    userName: string
  }>
  
  // Associated Quotes & Projects
  quotes: Array<{
    id: string
    quoteNumber: string
    total: number
    status: string
    createdAt: Date
  }>
  
  projects: Array<{
    id: string
    projectName: string
    status: string
    startDate: Date
  }>
}

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState('list')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [customers, setCustomers] = useState<CustomerData[]>([])

  const fetcher = useCallback(async (url: string) => {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to fetch customers')
    }

    return response.json()
  }, [])

  const {
    data: customersData,
    isLoading,
    mutate,
  } = useSWR<CustomerData[]>('/api/customers', fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 60000,
  })

  useEffect(() => {
    if (customersData) {
      setCustomers(customersData)
    }
  }, [customersData])

  const refreshCustomers = useCallback(async () => {
    await mutate()
  }, [mutate])

  // Calculate stats from actual customer data
  const stats = {
    totalCustomers: customers.length,
    activeLeads: customers.filter(c => c.status === 'LEAD' || c.status === 'QUALIFIED').length,
    qualifiedLeads: customers.filter(c => c.status === 'QUALIFIED').length,
    customersThisMonth: customers.filter(c => {
      const thisMonth = new Date()
      const customerMonth = new Date(c.createdAt)
      return customerMonth.getMonth() === thisMonth.getMonth() && customerMonth.getFullYear() === thisMonth.getFullYear()
    }).length,
    conversionRate: customers.length > 0 ? (customers.filter(c => c.status === 'CUSTOMER').length / customers.length) * 100 : 0,
    avgDealSize: customers.reduce((sum, c) => sum + c.leadInfo.estimatedBudget, 0) / Math.max(customers.length, 1),
    pipelineValue: customers.reduce((sum, c) => sum + c.leadInfo.estimatedBudget, 0)
  }

  const handleCreateCustomer = () => {
    setIsCreating(true)
    setActiveTab('form')
  }

  const handleViewCustomer = (customer: CustomerData) => {
    setSelectedCustomer(customer)
    setActiveTab('detail')
  }

  const handleEditCustomer = (customer: CustomerData) => {
    setSelectedCustomer(customer)
    setIsCreating(true)
    setActiveTab('form')
  }

  const handleCustomerDeletedSuccess = async (customerId: string) => {
    // Immediately refresh data from server
    await mutate()

    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer(null)
      setIsCreating(false)
    }

    setActiveTab('list')
  }

  const getStatusColor = (status: CustomerData['status']) => {
    switch (status) {
      case 'LEAD': return 'bg-gray-100 text-gray-800'
      case 'QUALIFIED': return 'bg-blue-100 text-blue-800'
      case 'PROPOSAL_SENT': return 'bg-yellow-100 text-yellow-800'
      case 'NEGOTIATION': return 'bg-orange-100 text-orange-800'
      case 'CUSTOMER': return 'bg-green-100 text-green-800'
      case 'LOST': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: CustomerData['status']) => {
    switch (status) {
      case 'LEAD': return 'Potansiyel'
      case 'QUALIFIED': return 'Nitelikli'
      case 'PROPOSAL_SENT': return 'Teklif Gönderildi'
      case 'NEGOTIATION': return 'Müzakere'
      case 'CUSTOMER': return 'Müşteri'
      case 'LOST': return 'Kaybedildi'
      default: return 'Bilinmiyor'
    }
  }

  const getPriorityColor = (priority: CustomerData['priority']) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-600'
      case 'MEDIUM': return 'bg-blue-100 text-blue-600'
      case 'HIGH': return 'bg-orange-100 text-orange-600'
      case 'URGENT': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-6 h-6 text-primary" />
                  <h1 className="text-2xl font-bold text-gray-900">Müşteri Yönetimi</h1>
                </div>
                
                <div className="flex items-center space-x-4 pl-4 border-l">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</div>
                    <div className="text-xs text-gray-600">Toplam Müşteri</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.activeLeads}</div>
                    <div className="text-xs text-gray-600">Aktif Lead</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.customersThisMonth}</div>
                    <div className="text-xs text-gray-600">Bu Ay Kazanılan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">%{stats.conversionRate}</div>
                    <div className="text-xs text-gray-600">Dönüşüm Oranı</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <Target className="w-4 h-4 mr-2" />
                  Pipeline Görünümü
                </Button>
                <Button onClick={handleCreateCustomer}>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Müşteri
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-96">
              <TabsTrigger value="list" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Müşteriler</span>
              </TabsTrigger>
              <TabsTrigger value="form" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Ekle/Düzenle</span>
              </TabsTrigger>
              <TabsTrigger value="detail" className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4" />
                <span>Detay</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Analiz</span>
              </TabsTrigger>
            </TabsList>

            {/* Customer List */}
            <TabsContent value="list" className="space-y-6 h-full">
              {(isLoading && customers.length === 0) ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-gray-900 mb-2">Müşteriler yükleniyor...</p>
                    <p className="text-gray-600">Lütfen bekleyin</p>
                  </div>
                </div>
              ) : (
                <CustomerList 
                  customers={customers}
                  onViewCustomer={handleViewCustomer}
                  onEditCustomer={handleEditCustomer}
                  onRefreshCustomers={refreshCustomers}
                  onCustomerDeleted={handleCustomerDeletedSuccess}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  getPriorityColor={getPriorityColor}
                />
              )}
            </TabsContent>

            {/* Customer Form */}
            <TabsContent value="form" className="h-full">
              <CustomerForm
                customer={isCreating ? selectedCustomer : null}
                onSave={async (customer) => {
                  try {
                    if (isCreating && selectedCustomer) {
                      // Update existing customer
                      const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          firstName: customer.firstName,
                          lastName: customer.lastName,
                          email: customer.email,
                          phone: customer.phone,
                          address: customer.address,
                          city: customer.city,
                          district: customer.district,
                          customerType: customer.customerType,
                          companyName: customer.companyName,
                          taxNumber: customer.taxNumber
                        })
                      })

                      if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(errorData.error || 'Failed to update customer')
                      }

                      // Immediately refresh the data from server
                      await mutate()
                    } else {
                      // Create new customer via API
                      const response = await fetch('/api/customers', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          firstName: customer.firstName,
                          lastName: customer.lastName,
                          email: customer.email,
                          phone: customer.phone,
                          address: customer.address,
                          city: customer.city,
                          district: customer.district,
                          customerType: customer.customerType,
                          companyName: customer.companyName,
                          taxNumber: customer.taxNumber
                        })
                      })

                      if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(errorData.error || 'Failed to create customer')
                      }

                      // Immediately refresh the data from server
                      await mutate()
                    }

                    setIsCreating(false)
                    setSelectedCustomer(null)
                    setActiveTab('list')
                  } catch (error) {
                    console.error('Error saving customer:', error)
                    // TODO: Show error toast to user
                    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
                    alert('Müşteri kaydedilemedi: ' + errorMessage)
                  }
                }}
                onCancel={() => {
                  setIsCreating(false)
                  setSelectedCustomer(null)
                  setActiveTab('list')
                }}
              />
            </TabsContent>

            {/* Customer Detail */}
            <TabsContent value="detail" className="h-full">
              {selectedCustomer ? (
                <CustomerDetail 
                  customer={selectedCustomer}
                  onEdit={() => handleEditCustomer(selectedCustomer)}
                  onClose={() => setActiveTab('list')}
                />
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">Müşteri detayı için seçim yapın</p>
                    <p className="text-gray-600">Detayları görüntülemek için bir müşteri seçin</p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-600" />
                      Pipeline Değeri
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                      ₺{(stats.pipelineValue / 1000000).toFixed(1)}M
                    </div>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+15% bu ay</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <Target className="w-4 h-4 mr-2 text-green-600" />
                      Ortalama Deal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      ₺{(stats.avgDealSize / 1000)}K
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Ortalama proje değeri
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                      Dönüşüm Oranı
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">%{stats.conversionRate}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Lead'den müşteriye
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <UserCheck className="w-4 h-4 mr-2 text-orange-600" />
                      Bu Ay
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">{stats.customersThisMonth}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Yeni müşteri
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lead Sources Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Lead Kaynakları</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Website</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Referans</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                        <span className="text-sm font-medium">30%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sosyal Medya</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Reklam</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                        <span className="text-sm font-medium">10%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}
