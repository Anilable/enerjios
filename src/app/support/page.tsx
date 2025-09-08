'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  HelpCircle, 
  MessageCircle, 
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Send,
  FileText,
  Video,
  Book,
  Users,
  Zap,
  Settings,
  ShieldCheck,
  Calendar,
  User,
  Plus
} from 'lucide-react'

interface SupportTicket {
  id: string
  subject: string
  category: 'technical' | 'billing' | 'installation' | 'maintenance' | 'general'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  createdDate: string
  lastUpdate: string
  assignee: string
  description: string
  responses: number
}

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
  views: number
}

const mockTickets: SupportTicket[] = [
  {
    id: 'TIK-001',
    subject: 'İnverter LED\'i kırmızı yanıyor',
    category: 'technical',
    priority: 'high',
    status: 'in-progress',
    createdDate: '2024-02-25',
    lastUpdate: '2024-02-26',
    assignee: 'Ahmet Yılmaz',
    description: 'Sistem inverterinin LED\'i sürekli kırmızı yanıyor ve sistem üretim yapmıyor.',
    responses: 3
  },
  {
    id: 'TIK-002',
    subject: 'Aylık fatura hesaplama hatası',
    category: 'billing',
    priority: 'medium',
    status: 'open',
    createdDate: '2024-02-20',
    lastUpdate: '2024-02-20',
    assignee: 'Fatma Demir',
    description: 'Bu ay elektrik faturamda GES üretimi doğru yansımamış.',
    responses: 1
  },
  {
    id: 'TIK-003',
    subject: 'Panel temizliği nasıl yapılır?',
    category: 'maintenance',
    priority: 'low',
    status: 'resolved',
    createdDate: '2024-02-15',
    lastUpdate: '2024-02-18',
    assignee: 'Mehmet Kaya',
    description: 'Solar panellerin temizliği hangi sıklıkla ve nasıl yapılmalı?',
    responses: 2
  }
]

const mockFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'GES sistemi kaç yıl çalışır?',
    answer: 'Güneş enerjisi sistemleri 25-30 yıl verimli bir şekilde çalışır. Paneller için 25 yıl, invertör için 10-15 yıl garanti verilir.',
    category: 'Genel',
    helpful: 45,
    views: 234
  },
  {
    id: '2',
    question: 'Sistem bakımı nasıl yapılır?',
    answer: 'GES sistemleri minimum bakım gerektirir. Panellerin temizliği, inverter kontrolü ve kablaj kontrolü yılda 1-2 kez yapılmalıdır.',
    category: 'Bakım',
    helpful: 32,
    views: 187
  },
  {
    id: '3',
    question: 'Üretilen enerji nasıl faturalandırılır?',
    answer: 'Üretilen enerji önce evinizde kullanılır, fazlası şebekeye satılır. Net-metering sistemi ile elektrik faturanızdan düşülür.',
    category: 'Faturalandırma',
    helpful: 38,
    views: 298
  },
  {
    id: '4',
    question: 'Sistem arıza durumunda ne yapmalıyım?',
    answer: 'Sistem arızası durumunda önce inverter LED durumunu kontrol edin, sonra 7/24 destek hattımızı arayın: 0850 123 45 67',
    category: 'Teknik',
    helpful: 29,
    views: 156
  }
]

export default function SupportPage() {
  const [selectedTab, setSelectedTab] = useState('tickets')
  const [searchTerm, setSearchTerm] = useState('')
  const [tickets] = useState<SupportTicket[]>(mockTickets)
  const [faqs] = useState<FAQItem[]>(mockFAQs)
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    priority: '',
    description: ''
  })

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return <HelpCircle className="w-4 h-4" />
      case 'in-progress': return <Clock className="w-4 h-4" />
      case 'resolved': return <CheckCircle className="w-4 h-4" />
      case 'closed': return <AlertCircle className="w-4 h-4" />
      default: return <HelpCircle className="w-4 h-4" />
    }
  }

  const getCategoryText = (category: SupportTicket['category']) => {
    switch (category) {
      case 'technical': return 'Teknik'
      case 'billing': return 'Faturalandırma'
      case 'installation': return 'Kurulum'
      case 'maintenance': return 'Bakım'
      case 'general': return 'Genel'
      default: return category
    }
  }

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalTickets = tickets.length
  const openTickets = tickets.filter(t => t.status === 'open').length
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length

  return (
    <DashboardLayout title="Destek Merkezi">
      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">7/24 Teknik Destek</p>
                <p className="text-2xl font-bold">0850 123 45 67</p>
              </div>
              <Phone className="w-8 h-8 text-blue-200" />
            </div>
            <Button variant="secondary" className="w-full mt-4">
              Hemen Ara
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Email Desteği</p>
                <p className="text-lg font-bold">destek@trakyasolar.com</p>
              </div>
              <Mail className="w-8 h-8 text-green-200" />
            </div>
            <Button variant="secondary" className="w-full mt-4">
              E-posta Gönder
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Canlı Destek</p>
                <p className="text-lg font-bold">Anlık Yardım</p>
              </div>
              <MessageCircle className="w-8 h-8 text-purple-200" />
            </div>
            <Button variant="secondary" className="w-full mt-4">
              Sohbet Başlat
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HelpCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
                <p className="text-sm text-gray-600">Toplam Talep</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{openTickets + inProgressTickets}</p>
                <p className="text-sm text-gray-600">Aktif Talep</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{resolvedTickets}</p>
                <p className="text-sm text-gray-600">Çözümlenen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">2.4 saat</p>
                <p className="text-sm text-gray-600">Ort. Yanıt Süresi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Destek Taleplerim</CardTitle>
              <CardDescription>
                Teknik sorunlar, faturalandırma ve genel sorularınız için destek talebi oluşturun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="tickets">Taleplerim</TabsTrigger>
                  <TabsTrigger value="new-ticket">Yeni Talep</TabsTrigger>
                  <TabsTrigger value="faq">Sık Sorular</TabsTrigger>
                </TabsList>

                <TabsContent value="tickets" className="space-y-4">
                  {tickets.map((ticket) => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {ticket.subject}
                              </h3>
                              <Badge className={getPriorityColor(ticket.priority)}>
                                {ticket.priority.toUpperCase()}
                              </Badge>
                              <Badge className={`${getStatusColor(ticket.status)} flex items-center space-x-1`}>
                                {getStatusIcon(ticket.status)}
                                <span>{ticket.status}</span>
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-4">
                              {ticket.description}
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">{ticket.id}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Settings className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">{getCategoryText(ticket.category)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">{ticket.assignee}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MessageCircle className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">{ticket.responses} yanıt</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Oluşturulma: {ticket.createdDate}</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span>Son güncelleme: {ticket.lastUpdate}</span>
                          </div>

                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Yanıtla
                            </Button>
                            <Button variant="outline" size="sm">
                              Detayları Gör
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {tickets.length === 0 && (
                    <Card>
                      <CardContent className="text-center py-12">
                        <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">Henüz destek talebiniz bulunmuyor</p>
                        <Button 
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => setSelectedTab('new-ticket')}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          İlk Talebinizi Oluşturun
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="new-ticket" className="space-y-6">
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Konu</Label>
                        <Input
                          id="subject"
                          placeholder="Sorununuzu kısaca açıklayın"
                          value={newTicket.subject}
                          onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Kategori</Label>
                          <Select onValueChange={(value) => setNewTicket({...newTicket, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Kategori seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Teknik Destek</SelectItem>
                              <SelectItem value="billing">Faturalandırma</SelectItem>
                              <SelectItem value="installation">Kurulum</SelectItem>
                              <SelectItem value="maintenance">Bakım</SelectItem>
                              <SelectItem value="general">Genel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="priority">Öncelik</Label>
                          <Select onValueChange={(value) => setNewTicket({...newTicket, priority: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Öncelik seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Düşük</SelectItem>
                              <SelectItem value="medium">Orta</SelectItem>
                              <SelectItem value="high">Yüksek</SelectItem>
                              <SelectItem value="urgent">Acil</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Açıklama</Label>
                        <Textarea
                          id="description"
                          placeholder="Sorununuzu detaylı olarak açıklayın..."
                          className="min-h-[120px]"
                          value={newTicket.description}
                          onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                        />
                      </div>

                      <Button className="w-full bg-primary hover:bg-primary/90">
                        <Send className="w-4 h-4 mr-2" />
                        Destek Talebi Gönder
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="faq" className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Sık sorularda ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="space-y-4">
                    {filteredFAQs.map((faq) => (
                      <Card key={faq.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            {faq.question}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {faq.answer}
                          </p>
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{faq.views} görüntüleme</span>
                              <span>•</span>
                              <span>{faq.helpful} faydalı</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                👍 Faydalı
                              </Button>
                              <Button variant="outline" size="sm">
                                👎
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hızlı Yardım</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <Video className="w-4 h-4 mr-2" />
                Video Rehberler
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Book className="w-4 h-4 mr-2" />
                Kullanım Kılavuzu
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Garanti Koşulları
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                Sistem Durumu
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Destek Saatleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Teknik Destek</span>
                <Badge className="bg-green-100 text-green-800">7/24</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Telefon Desteği</span>
                <span className="text-sm">08:00 - 20:00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">E-posta Desteği</span>
                <Badge className="bg-green-100 text-green-800">7/24</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Saha Desteği</span>
                <span className="text-sm">09:00 - 17:00</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popüler Konular</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-sm p-2">
                İnverter alarm kodları
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm p-2">
                Panel temizliği
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm p-2">
                Elektrik faturası hesaplama
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm p-2">
                Sistem performans kontrolü
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm p-2">
                Garanti prosedürleri
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acil Durumlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-800 text-sm font-medium mb-2">Yangın/Elektrik Tehlikesi</p>
                <Button variant="destructive" size="sm" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Acil Hat: 112
                </Button>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-orange-800 text-sm font-medium mb-2">Sistem Arızası</p>
                <Button variant="outline" size="sm" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Teknik: 0850 123 45 67
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}