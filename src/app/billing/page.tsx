'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CreditCard,
  Download,
  Calendar,
  DollarSign,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Invoice {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  description: string
  downloadUrl?: string
}

interface PaymentMethod {
  id: string
  type: 'credit_card' | 'bank_account'
  last4: string
  brand?: string
  expiryDate?: string
  isDefault: boolean
}

export default function BillingPage() {
  const [invoices] = useState<Invoice[]>([
    {
      id: 'INV-2024-001',
      date: '2024-12-15',
      amount: 185000,
      status: 'paid',
      description: 'GES Kurulum - Mehmet Yılmaz Çiftliği',
    },
    {
      id: 'INV-2024-002',
      date: '2024-12-10',
      amount: 48000,
      status: 'pending',
      description: 'GES Kurulum - Fatma Demir Evi',
    },
    {
      id: 'INV-2024-003',
      date: '2024-12-05',
      amount: 875000,
      status: 'paid',
      description: 'GES Kurulum - Özkan Sanayi Ltd.',
    }
  ])

  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'pm_1',
      type: 'credit_card',
      last4: '4242',
      brand: 'Visa',
      expiryDate: '12/26',
      isDefault: true
    },
    {
      id: 'pm_2',
      type: 'bank_account',
      last4: '1234',
      isDefault: false
    }
  ])

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <Badge variant="secondary" className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Ödendi</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Bekliyor</Badge>
      case 'overdue':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Gecikmiş</Badge>
    }
  }

  const getPaymentMethodIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />
      case 'bank_account':
        return <Receipt className="w-4 h-4" />
    }
  }

  const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0)
  const totalPending = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faturalandırma</h1>
          <p className="text-muted-foreground">
            Faturalarınızı görüntüleyin ve ödeme yöntemlerinizi yönetin
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Ödenen</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₺{Math.round(totalPaid / 1000)}K</div>
              <p className="text-xs text-muted-foreground">
                Bu ay tamamlanan ödemeler
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Ödemeler</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₺{Math.round(totalPending / 1000)}K</div>
              <p className="text-xs text-muted-foreground">
                Ödeme bekleyen faturalar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bu Ay</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
              <p className="text-xs text-muted-foreground">
                Toplam fatura sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ortalama Fatura</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₺{Math.round((totalPaid + totalPending) / invoices.length / 1000)}K</div>
              <p className="text-xs text-muted-foreground">
                Ortalama fatura tutarı
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">Faturalar</TabsTrigger>
            <TabsTrigger value="payment-methods">Ödeme Yöntemleri</TabsTrigger>
            <TabsTrigger value="settings">Fatura Ayarları</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Faturalar</CardTitle>
                <CardDescription>
                  Geçmiş ve aktif faturalarınızı görüntüleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fatura No</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell className="max-w-xs truncate">{invoice.description}</TableCell>
                        <TableCell className="font-medium">₺{invoice.amount.toLocaleString('tr-TR')}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            İndir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment-methods">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Ödeme Yöntemleri</CardTitle>
                  <CardDescription>
                    Kayıtlı ödeme yöntemlerinizi yönetin
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Ekle
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getPaymentMethodIcon(method.type)}
                      <div>
                        <div className="font-medium">
                          {method.type === 'credit_card' ? method.brand : 'Banka Hesabı'} ****{method.last4}
                          {method.isDefault && (
                            <Badge variant="secondary" className="ml-2">Varsayılan</Badge>
                          )}
                        </div>
                        {method.expiryDate && (
                          <div className="text-sm text-muted-foreground">
                            Son kullanma: {method.expiryDate}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Fatura Ayarları</CardTitle>
                <CardDescription>
                  Faturalama tercihlerinizi yapılandırın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="billing-email">Fatura E-posta Adresi</Label>
                  <Input
                    id="billing-email"
                    type="email"
                    placeholder="faturalandirma@sirket.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-name">Şirket Adı</Label>
                  <Input
                    id="company-name"
                    placeholder="Şirket Adınız"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax-number">Vergi Numarası</Label>
                  <Input
                    id="tax-number"
                    placeholder="1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billing-address">Fatura Adresi</Label>
                  <Input
                    id="billing-address"
                    placeholder="Tam adresinizi girin"
                  />
                </div>

                <Button>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Ayarları Kaydet
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}