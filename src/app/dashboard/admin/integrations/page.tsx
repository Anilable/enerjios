'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Plug, Plus, Settings, TestTube, Eye, EyeOff, Trash2,
  CheckCircle, AlertCircle, Clock, Zap, Cloud, CreditCard,
  MessageSquare, Mail, Map, RefreshCw, Activity, Shield,
  Key, Globe, Database, Webhook, Code, Monitor
} from 'lucide-react'

interface APIIntegration {
  id: string
  name: string
  provider: string
  baseUrl: string
  isActive: boolean
  lastTestedAt?: string
  testResult?: {
    success: boolean
    error?: string
    responseTime?: number
  }
  rateLimits?: {
    requestsPerMinute: number
    requestsPerHour: number
    requestsPerDay: number
  }
  createdAt: string
}

interface AvailableProvider {
  name: string
  description: string
  requiredFields: string[]
  testEndpoint: string
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<APIIntegration[]>([])
  const [availableProviders, setAvailableProviders] = useState<Record<string, AvailableProvider>>({})
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<APIIntegration | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    apiKey: '',
    apiSecret: '',
    baseUrl: '',
    configuration: '{}',
    isActive: true,
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerHour: 3600,
      requestsPerDay: 86400
    }
  })

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations')
      const data = await response.json()
      
      if (data.success) {
        setIntegrations(data.integrations)
        setAvailableProviders(data.availableProviders)
      }
    } catch (error) {
      console.error('Error fetching integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIntegration = async () => {
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          configuration: JSON.parse(formData.configuration)
        })
      })
      
      if (response.ok) {
        await fetchIntegrations()
        setIsCreateModalOpen(false)
        resetForm()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating integration:', error)
      alert('Failed to create integration')
    }
  }

  const testIntegration = async (integration: APIIntegration) => {
    try {
      const response = await fetch(`/api/integrations/test/${integration.id}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchIntegrations()
      }
    } catch (error) {
      console.error('Error testing integration:', error)
    }
  }

  const toggleIntegration = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/integrations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, isActive })
      })
      
      if (response.ok) {
        await fetchIntegrations()
      }
    } catch (error) {
      console.error('Error toggling integration:', error)
    }
  }

  const deleteIntegration = async (id: string) => {
    if (!confirm('Bu entegrasyonu silmek istediğinizden emin misiniz?')) return
    
    try {
      const response = await fetch(`/api/integrations?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchIntegrations()
      }
    } catch (error) {
      console.error('Error deleting integration:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      provider: '',
      apiKey: '',
      apiSecret: '',
      baseUrl: '',
      configuration: '{}',
      isActive: true,
      rateLimits: {
        requestsPerMinute: 60,
        requestsPerHour: 3600,
        requestsPerDay: 86400
      }
    })
  }

  const getProviderIcon = (provider: string) => {
    const icons = {
      WEATHER_API: Cloud,
      PRICING_API: Database,
      PAYMENT_GATEWAY: CreditCard,
      SMS_SERVICE: MessageSquare,
      EMAIL_SERVICE: Mail,
      MAPS_API: Map
    }
    return icons[provider as keyof typeof icons] || Plug
  }

  const getStatusBadge = (integration: APIIntegration) => {
    if (!integration.isActive) {
      return <Badge variant="secondary">Pasif</Badge>
    }
    
    if (!integration.testResult) {
      return <Badge variant="outline">Test Edilmemiş</Badge>
    }
    
    if (integration.testResult.success) {
      return <Badge variant="default" className="bg-green-600">Aktif</Badge>
    } else {
      return <Badge variant="destructive">Hata</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">API Entegrasyonları</h1>
            <p className="text-muted-foreground mt-1">
              Harici API servislerini yönetin ve izleyin
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Entegrasyon
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Entegrasyon</p>
                  <p className="text-2xl font-bold">{integrations.length}</p>
                </div>
                <Plug className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aktif</p>
                  <p className="text-2xl font-bold">
                    {integrations.filter(i => i.isActive && i.testResult?.success).length}
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
                  <p className="text-sm text-muted-foreground">Hatalı</p>
                  <p className="text-2xl font-bold">
                    {integrations.filter(i => i.testResult && !i.testResult.success).length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Test Edilmemiş</p>
                  <p className="text-2xl font-bold">
                    {integrations.filter(i => !i.testResult).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integrations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Mevcut Entegrasyonlar</CardTitle>
            <CardDescription>
              Yapılandırılmış API entegrasyonlarını görüntüleyin ve yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servis</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Son Test</TableHead>
                  <TableHead>Yanıt Süresi</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrations.map((integration) => {
                  const Icon = getProviderIcon(integration.provider)
                  return (
                    <TableRow key={integration.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{integration.name}</div>
                            <div className="text-sm text-muted-foreground">{integration.baseUrl}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{integration.provider}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(integration)}</TableCell>
                      <TableCell>
                        {integration.lastTestedAt ? (
                          <span className="text-sm">
                            {new Date(integration.lastTestedAt).toLocaleDateString('tr-TR')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {integration.testResult?.responseTime ? (
                          <span className="text-sm">{integration.testResult.responseTime}ms</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testIntegration(integration)}
                          >
                            <TestTube className="w-4 h-4" />
                          </Button>
                          <Switch
                            checked={integration.isActive}
                            onCheckedChange={(checked) => toggleIntegration(integration.id, checked)}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedIntegration(integration)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteIntegration(integration.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Integration Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni API Entegrasyonu</DialogTitle>
              <DialogDescription>
                Yeni bir harici API entegrasyonu yapılandırın
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Entegrasyon Adı</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Örn: OpenWeather API"
                  />
                </div>
                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Select
                    value={formData.provider}
                    onValueChange={(value) => setFormData({...formData, provider: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Provider seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(availableProviders).map(([key, provider]) => (
                        <SelectItem key={key} value={key}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input
                  id="baseUrl"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({...formData, baseUrl: e.target.value})}
                  placeholder="https://api.example.com/v1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="apiSecret">API Secret (Opsiyonel)</Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    value={formData.apiSecret}
                    onChange={(e) => setFormData({...formData, apiSecret: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="configuration">Ek Konfigürasyon (JSON)</Label>
                <Textarea
                  id="configuration"
                  value={formData.configuration}
                  onChange={(e) => setFormData({...formData, configuration: e.target.value})}
                  placeholder='{"region": "tr", "units": "metric"}'
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label>Rate Limits</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="perMinute" className="text-sm">Dakikada</Label>
                    <Input
                      id="perMinute"
                      type="number"
                      value={formData.rateLimits.requestsPerMinute}
                      onChange={(e) => setFormData({
                        ...formData,
                        rateLimits: {
                          ...formData.rateLimits,
                          requestsPerMinute: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="perHour" className="text-sm">Saatte</Label>
                    <Input
                      id="perHour"
                      type="number"
                      value={formData.rateLimits.requestsPerHour}
                      onChange={(e) => setFormData({
                        ...formData,
                        rateLimits: {
                          ...formData.rateLimits,
                          requestsPerHour: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="perDay" className="text-sm">Günde</Label>
                    <Input
                      id="perDay"
                      type="number"
                      value={formData.rateLimits.requestsPerDay}
                      onChange={(e) => setFormData({
                        ...formData,
                        rateLimits: {
                          ...formData.rateLimits,
                          requestsPerDay: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                />
                <Label htmlFor="isActive">Entegrasyonu aktif et</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleCreateIntegration}>
                Oluştur ve Test Et
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}