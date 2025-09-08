'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Download, 
  Eye,
  Search,
  Upload,
  Filter,
  Calendar,
  Building,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  Folder,
  User,
  Share2,
  Trash2,
  Edit
} from 'lucide-react'

interface Document {
  id: string
  name: string
  type: 'contract' | 'technical' | 'financial' | 'legal' | 'report' | 'certificate'
  category: string
  size: string
  uploadDate: string
  lastModified: string
  status: 'active' | 'pending' | 'expired' | 'draft'
  description: string
  uploader: string
  downloadCount: number
  isShared: boolean
  expiryDate?: string
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'GES Kurulum Sözleşmesi',
    type: 'contract',
    category: 'Sözleşmeler',
    size: '245 KB',
    uploadDate: '2024-01-15',
    lastModified: '2024-02-10',
    status: 'active',
    description: 'Ana kurulum sözleşmesi - 10.5 kW sistem',
    uploader: 'Solar Tech Enerji',
    downloadCount: 5,
    isShared: true,
    expiryDate: '2024-12-31'
  },
  {
    id: '2',
    name: 'Sistem Teknik Özellikleri',
    type: 'technical',
    category: 'Teknik Belgeler',
    size: '1.2 MB',
    uploadDate: '2024-01-20',
    lastModified: '2024-01-20',
    status: 'active',
    description: 'Panel ve inverter teknik spesifikasyonları',
    uploader: 'Sistem Yöneticisi',
    downloadCount: 12,
    isShared: false
  },
  {
    id: '3',
    name: 'Aylık Performans Raporu',
    type: 'report',
    category: 'Raporlar',
    size: '512 KB',
    uploadDate: '2024-02-28',
    lastModified: '2024-02-28',
    status: 'active',
    description: 'Şubat 2024 sistem performans analizi',
    uploader: 'Sistem Otomatik',
    downloadCount: 3,
    isShared: true
  },
  {
    id: '4',
    name: 'CE Sertifikası',
    type: 'certificate',
    category: 'Sertifikalar',
    size: '156 KB',
    uploadDate: '2024-01-10',
    lastModified: '2024-01-10',
    status: 'active',
    description: 'Solar panel CE uygunluk sertifikası',
    uploader: 'JinkoSolar',
    downloadCount: 8,
    isShared: false,
    expiryDate: '2026-01-10'
  },
  {
    id: '5',
    name: 'Finansal Analiz Raporu',
    type: 'financial',
    category: 'Mali Belgeler',
    size: '680 KB',
    uploadDate: '2024-02-15',
    lastModified: '2024-02-20',
    status: 'draft',
    description: 'ROI ve geri ödeme hesaplamaları (taslak)',
    uploader: 'Finans Uzmanı',
    downloadCount: 1,
    isShared: false
  },
  {
    id: '6',
    name: 'Garanti Belgesi',
    type: 'legal',
    category: 'Yasal Belgeler',
    size: '189 KB',
    uploadDate: '2024-01-25',
    lastModified: '2024-01-25',
    status: 'active',
    description: '25 yıl panel garanti belgesi',
    uploader: 'Solar Tech Enerji',
    downloadCount: 7,
    isShared: true,
    expiryDate: '2049-01-25'
  }
]

export default function DocumentsPage() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [documents] = useState<Document[]>(mockDocuments)

  const getTypeColor = (type: Document['type']) => {
    switch (type) {
      case 'contract': return 'bg-blue-100 text-blue-800'
      case 'technical': return 'bg-green-100 text-green-800'
      case 'financial': return 'bg-purple-100 text-purple-800'
      case 'legal': return 'bg-red-100 text-red-800'
      case 'report': return 'bg-orange-100 text-orange-800'
      case 'certificate': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'expired': return <AlertCircle className="w-4 h-4" />
      case 'draft': return <Edit className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getStatusText = (status: Document['status']) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'pending': return 'Bekliyor'
      case 'expired': return 'Süresi Doldu'
      case 'draft': return 'Taslak'
      default: return status
    }
  }

  const getTypeText = (type: Document['type']) => {
    switch (type) {
      case 'contract': return 'Sözleşme'
      case 'technical': return 'Teknik'
      case 'financial': return 'Mali'
      case 'legal': return 'Yasal'
      case 'report': return 'Rapor'
      case 'certificate': return 'Sertifika'
      default: return type
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (selectedTab === 'all') return matchesSearch
    if (selectedTab === 'contracts') return matchesSearch && doc.type === 'contract'
    if (selectedTab === 'technical') return matchesSearch && doc.type === 'technical'
    if (selectedTab === 'reports') return matchesSearch && doc.type === 'report'
    return matchesSearch
  })

  const totalDocuments = documents.length
  const activeDocuments = documents.filter(d => d.status === 'active').length
  const sharedDocuments = documents.filter(d => d.isShared).length
  const totalDownloads = documents.reduce((sum, doc) => sum + doc.downloadCount, 0)

  const documentsByCategory = documents.reduce((acc, doc) => {
    acc[doc.category] = (acc[doc.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <DashboardLayout title="Belgelerim">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalDocuments}</p>
                <p className="text-sm text-gray-600">Toplam Belge</p>
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
                <p className="text-2xl font-bold text-gray-900">{activeDocuments}</p>
                <p className="text-sm text-gray-600">Aktif Belge</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Share2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{sharedDocuments}</p>
                <p className="text-sm text-gray-600">Paylaşılan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Download className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalDownloads}</p>
                <p className="text-sm text-gray-600">İndirme</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Belgelerim</CardTitle>
                <CardDescription>
                  Güneş enerjisi sisteminizle ilgili tüm belgeleri görüntüleyin ve yönetin
                </CardDescription>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <Upload className="w-4 h-4 mr-2" />
                Yeni Belge Yükle
              </Button>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Belge ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="default">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrele
                </Button>
              </div>

              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="all">Tümü</TabsTrigger>
                  <TabsTrigger value="contracts">Sözleşmeler</TabsTrigger>
                  <TabsTrigger value="technical">Teknik</TabsTrigger>
                  <TabsTrigger value="reports">Raporlar</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedTab} className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <FileText className="w-5 h-5 text-gray-500" />
                              <h3 className="text-lg font-semibold text-gray-900">
                                {doc.name}
                              </h3>
                              <Badge className={getTypeColor(doc.type)}>
                                {getTypeText(doc.type)}
                              </Badge>
                              <Badge className={`${getStatusColor(doc.status)} flex items-center space-x-1`}>
                                {getStatusIcon(doc.status)}
                                <span>{getStatusText(doc.status)}</span>
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-4">
                              {doc.description}
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Folder className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">{doc.category}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">{doc.uploader}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">{doc.uploadDate}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Download className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">{doc.downloadCount} indirme</span>
                              </div>
                            </div>

                            {doc.expiryDate && (
                              <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                                <div className="flex items-center space-x-2 text-yellow-700">
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="text-sm">
                                    Geçerlilik süresi: {doc.expiryDate}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t mt-4">
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Boyut: {doc.size}</span>
                                <span className="text-gray-400">•</span>
                                <span>Son değişiklik: {doc.lastModified}</span>
                                {doc.isShared && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <div className="flex items-center space-x-1 text-green-600">
                                      <Share2 className="w-3 h-3" />
                                      <span>Paylaşıldı</span>
                                    </div>
                                  </>
                                )}
                              </div>

                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-1" />
                                  Görüntüle
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-1" />
                                  İndir
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Share2 className="w-4 h-4 mr-1" />
                                  Paylaş
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredDocuments.length === 0 && (
                    <Card>
                      <CardContent className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">
                          {searchTerm ? 'Aradığınız belge bulunamadı' : 'Bu kategoride belge bulunmuyor'}
                        </p>
                        <Button className="bg-primary hover:bg-primary/90">
                          <Upload className="w-4 h-4 mr-2" />
                          İlk Belgenizi Yükleyin
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kategori Dağılımı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(documentsByCategory).map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{category}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Belge Yükle
              </Button>
              <Button className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Toplu İndirme
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <a href="/projects">
                  <Building className="w-4 h-4 mr-2" />
                  Projelerim
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Son Aktiviteler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Performans raporu oluşturuldu</p>
                    <p className="text-gray-500">2 saat önce</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Sözleşme güncellendi</p>
                    <p className="text-gray-500">1 gün önce</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Mali belge paylaşıldı</p>
                    <p className="text-gray-500">3 gün önce</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Belge Güvenliği</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-700">Güvenli</p>
                  <p className="text-xs text-green-600">Tüm belgeler şifreli</p>
                </div>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• 256-bit SSL şifreleme</p>
                <p>• Günlük yedekleme</p>
                <p>• Erişim kontrol sistemi</p>
                <p>• Virus tarama aktif</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}