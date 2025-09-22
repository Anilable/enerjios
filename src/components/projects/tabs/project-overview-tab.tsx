'use client'

import { useState } from 'react'
import { useExchangeRates, formatCurrency } from '@/hooks/use-exchange-rates'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'
import {
  CalendarDays, MapPin, Phone, Mail, Building2, User, 
  FileText, Download, Upload, Eye, MessageSquare, 
  Clock, CheckCircle, AlertCircle, TrendingUp, Zap,
  DollarSign, Users, Activity, Settings, Plus
} from 'lucide-react'

interface ProjectOverviewTabProps {
  project: any
}

const timelineData = [
  { phase: 'Tasarım', completed: true, date: '2024-12-18', duration: '2 gün' },
  { phase: 'Teklif Hazırlama', completed: true, date: '2024-12-18', duration: '1 gün' },
  { phase: 'Onay Süreci', completed: true, date: '2024-12-19', duration: '1 gün' },
  { phase: 'Malzeme Tedariki', completed: true, date: '2024-12-20', duration: '2 gün' },
  { phase: 'Kurulum', completed: false, date: '2024-12-20', duration: '3 gün', progress: 75 },
  { phase: 'Test & Devreye Alma', completed: false, date: '2024-12-23', duration: '1 gün' },
  { phase: 'Teslim', completed: false, date: '2024-12-24', duration: '1 gün' }
]

const performanceData = [
  { month: 'Oca', estimated: 6500, actual: 0 },
  { month: 'Şub', estimated: 7200, actual: 0 },
  { month: 'Mar', estimated: 8500, actual: 0 },
  { month: 'Nis', estimated: 9200, actual: 0 },
  { month: 'May', estimated: 10500, actual: 0 },
  { month: 'Haz', estimated: 11200, actual: 0 },
  { month: 'Tem', estimated: 11800, actual: 0 },
  { month: 'Ağu', estimated: 11500, actual: 0 },
  { month: 'Eyl', estimated: 9800, actual: 0 },
  { month: 'Eki', estimated: 8200, actual: 0 },
  { month: 'Kas', estimated: 6800, actual: 0 },
  { month: 'Ara', estimated: 5800, actual: 0 }
]


export function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
  const [newNote, setNewNote] = useState('')
  const { rates, loading: ratesLoading } = useExchangeRates()
  
  // Simplified project costs calculation
  const systemSizeKW = project.technical.systemSize
  const projectCosts = {
    breakdown: {
      panels: { cost: systemSizeKW * 15000 },
      inverter: { cost: systemSizeKW * 8000 },
      installation: { cost: systemSizeKW * 5000 },
      additional: { cost: systemSizeKW * 2000 }
    },
    total: { cost: systemSizeKW * 30000 }
  }
  
  // Calculate financial breakdown based on real costs
  const financialBreakdown = [
    { category: 'Solar Paneller', amount: projectCosts.breakdown.panels.cost, percentage: Math.round((projectCosts.breakdown.panels.cost / projectCosts.total.cost) * 100) },
    { category: 'İnverter', amount: projectCosts.breakdown.inverter.cost, percentage: Math.round((projectCosts.breakdown.inverter.cost / projectCosts.total.cost) * 100) },
    { category: 'Montaj Sistemi', amount: projectCosts.breakdown.installation.cost * 0.4, percentage: Math.round((projectCosts.breakdown.installation.cost * 0.4 / projectCosts.total.cost) * 100) },
    { category: 'Kablolama', amount: projectCosts.breakdown.additional.cost * 0.75, percentage: Math.round((projectCosts.breakdown.additional.cost * 0.75 / projectCosts.total.cost) * 100) },
    { category: 'İşçilik', amount: projectCosts.breakdown.installation.cost * 0.6, percentage: Math.round((projectCosts.breakdown.installation.cost * 0.6 / projectCosts.total.cost) * 100) },
    { category: 'Diğer', amount: projectCosts.breakdown.additional.cost * 0.25, percentage: Math.round((projectCosts.breakdown.additional.cost * 0.25 / projectCosts.total.cost) * 100) }
  ]

  const addNote = () => {
    if (newNote.trim()) {
      // Would integrate with API
      console.log('Adding note:', newNote)
      setNewNote('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Project Status & Timeline */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Proje İlerlemesi
            </CardTitle>
            <CardDescription>
              Mevcut aşama ve genel ilerleme durumu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Genel İlerleme</span>
              <span className="text-sm text-muted-foreground">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-3" />
            
            <div className="space-y-3 mt-6">
              {timelineData.map((phase, index) => (
                <div key={phase.phase} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    phase.completed 
                      ? 'bg-green-500 text-white' 
                      : index === 4 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {phase.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : index === 4 ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${phase.completed ? 'text-green-700' : index === 4 ? 'text-blue-700' : 'text-gray-500'}`}>
                        {phase.phase}
                      </span>
                      <span className="text-xs text-muted-foreground">{phase.duration}</span>
                    </div>
                    {phase.progress && (
                      <div className="mt-1">
                        <Progress value={phase.progress} className="h-1" />
                        <span className="text-xs text-muted-foreground">{phase.progress}% tamamlandı</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Proje Takımı
            </CardTitle>
            <CardDescription>
              Bu projeye atanan takım üyeleri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {project.team.map((member: any) => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <AvatarInitials name={member.name} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Separator />

            <div className="bg-muted/50 p-3 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Son Aktivite</h4>
              <p className="text-sm text-muted-foreground">
                {project.lastActivity.action}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                {project.lastActivity.user}
                <span>•</span>
                {project.lastActivity.timestamp}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Details & Financial Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Teknik Detaylar
            </CardTitle>
            <CardDescription>
              Sistem özellikleri ve kapasitesi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{project.technical.systemSize}</p>
                <p className="text-xs text-blue-600 font-medium">kW Kapasite</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{project.technical.panelCount}</p>
                <p className="text-xs text-green-600 font-medium">Panel Sayısı</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{(project.technical.annualProduction / 1000).toFixed(0)}k</p>
                <p className="text-xs text-purple-600 font-medium">kWh/Yıl Üretim</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{project.technical.roofArea}</p>
                <p className="text-xs text-orange-600 font-medium">m² Çatı Alanı</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">İnverter Tipi:</span>
                <span className="text-sm font-medium">{project.technical.inverterType}</span>
              </div>
              {project.technical.batteryCapacity && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Batarya Kapasitesi:</span>
                  <span className="text-sm font-medium">{project.technical.batteryCapacity} kWh</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ortalama Panel Gücü:</span>
                <span className="text-sm font-medium">
                  {(project.technical.systemSize * 1000 / project.technical.panelCount).toFixed(0)}W
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Finansal Özet
            </CardTitle>
            <CardDescription>
              Proje bütçesi ve maliyet dağılımı
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {ratesLoading ? '...' : formatCurrency(projectCosts.total.cost)}
                </p>
                <p className="text-xs text-blue-600 font-medium">Güncel Maliyet</p>
                {rates && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ${Math.round(projectCosts.total.cost / (rates.USD || 30))}
                  </p>
                )}
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(project.financial.paidAmount || 0)}
                </p>
                <p className="text-xs text-green-600 font-medium">Ödenen Tutar</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ödeme İlerlemesi</span>
                <span>{Math.round(((project.financial.paidAmount || 0) / projectCosts.total.cost) * 100)}%</span>
              </div>
              <Progress value={((project.financial.paidAmount || 0) / projectCosts.total.cost) * 100} className="h-2" />
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Maliyet Dağılımı</h4>
              <div className="space-y-2">
                {financialBreakdown.slice(0, 4).map((item) => (
                  <div key={item.category} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(item.amount)}
                      </span>
                      <div className="w-12 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-primary h-1.5 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-right w-12">%{item.percentage}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {!ratesLoading && rates && (
                <div className="mt-3 p-2 bg-muted/30 rounded text-xs text-muted-foreground">
                  Döviz kuru: $1 = {formatCurrency(rates.USD)} 
                  <span className="ml-2">Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Projection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Yıllık Performans Projeksiyonu
          </CardTitle>
          <CardDescription>
            Aylık enerji üretim tahmini (kWh)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} kWh`, 'Tahmini Üretim']} />
              <Area 
                type="monotone" 
                dataKey="estimated" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(performanceData.reduce((sum, month) => sum + month.estimated, 0) / 1000)}k
              </p>
              <p className="text-xs text-blue-600 font-medium">Yıllık Toplam (kWh)</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(Math.round(performanceData.reduce((sum, month) => sum + month.estimated, 0) * 2.5))}
              </p>
              <p className="text-xs text-green-600 font-medium">Yıllık Tasarruf</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {(projectCosts.total.cost / (performanceData.reduce((sum, month) => sum + month.estimated, 0) * 2.5)).toFixed(1)}
              </p>
              <p className="text-xs text-purple-600 font-medium">Yıl Geri Ödeme</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents & Notes */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Proje Dokümanları
            </CardTitle>
            <CardDescription>
              Proje ile ilgili tüm belgeler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(doc.size / 1024 / 1024).toFixed(2)} MB • {doc.uploadedAt}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4">
              <Upload className="w-4 h-4 mr-2" />
              Belge Yükle
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Proje Notları
            </CardTitle>
            <CardDescription>
              Proje ile ilgili notlar ve güncellemeler
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {project.notes.map((note: string, index: number) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">{note}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date().toLocaleDateString('tr-TR')} • Sistem
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Yeni not ekle..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[80px]"
              />
              <Button onClick={addNote} size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Not Ekle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}