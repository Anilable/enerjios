'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Box,
  Map,
  Calendar,
  Calculator,
  Eye,
  Trash2,
  Plus,
  Loader2,
  FileText,
  Sun,
  MapPin
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Design {
  id: string
  name: string
  description?: string
  location?: string
  calculations: {
    totalPanels: number
    totalPower: number
    roofArea: number
    annualProduction: number
  }
  createdAt: string
  updatedAt: string
}

export default function DesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchDesigns = async () => {
    try {
      const response = await fetch('/api/designs')
      if (response.ok) {
        const data = await response.json()
        setDesigns(data)
      } else {
        throw new Error('Failed to fetch designs')
      }
    } catch (error) {
      console.error('Error fetching designs:', error)
      toast({
        title: "Hata",
        description: "Tasarımlar yüklenirken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDesigns()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Bu tasarımı silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/designs/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDesigns(designs.filter(d => d.id !== id))
        toast({
          title: "Başarılı",
          description: "Tasarım başarıyla silindi."
        })
      } else {
        throw new Error('Failed to delete design')
      }
    } catch (error) {
      console.error('Error deleting design:', error)
      toast({
        title: "Hata",
        description: "Tasarım silinirken bir hata oluştu.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Kaydedilen Tasarımlar"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Kaydedilen Tasarımlar' }
        ]}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Kaydedilen Tasarımlar"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Kaydedilen Tasarımlar' }
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Kaydedilen Tasarımlar</h2>
            <p className="text-muted-foreground">
              3D tasarım aracıyla oluşturduğunuz tüm projeler
            </p>
          </div>
          <Link href="/dashboard/designer">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Tasarım
            </Button>
          </Link>
        </div>

        {/* Designs Grid */}
        {designs.length === 0 ? (
          <Card className="p-12 text-center">
            <Box className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Henüz tasarım yok</h3>
            <p className="text-muted-foreground mb-4">
              İlk tasarımınızı oluşturmak için 3D tasarım aracını kullanın
            </p>
            <Link href="/dashboard/designer">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                İlk Tasarımı Oluştur
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <Card key={design.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{design.name}</CardTitle>
                      {design.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {design.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-2 flex-shrink-0">
                      <FileText className="w-3 h-3 mr-1" />
                      Tasarım
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Location */}
                  {design.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{design.location}</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-lg">
                        {design.calculations?.totalPanels || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Panel</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-lg text-primary">
                        {((design.calculations?.totalPower || 0) / 1000).toFixed(1)}kW
                      </div>
                      <div className="text-xs text-muted-foreground">Güç</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-lg text-green-600">
                        {design.calculations?.roofArea || 0}m²
                      </div>
                      <div className="text-xs text-muted-foreground">Alan</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-lg text-blue-600">
                        {Math.round((design.calculations?.annualProduction || 0) / 1000)}k
                      </div>
                      <div className="text-xs text-muted-foreground">kWh/yıl</div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(design.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/dashboard/designer?load=${design.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        Görüntüle
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(design.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}