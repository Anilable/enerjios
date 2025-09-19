'use client'

import { useState } from 'react'
import { ProjectRequestStatus } from '@/types/project-request'
import { ProjectRequestAPI } from '@/lib/api/project-requests'
import { useToast } from '@/hooks/use-toast'

export function useStatusUpdate() {
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const updateStatus = async (
    requestId: string,
    newStatus: ProjectRequestStatus,
    customNote?: string
  ): Promise<boolean> => {
    if (isUpdating) return false

    try {
      setIsUpdating(true)

      // Generate automatic note based on status
      const statusLabels: Record<ProjectRequestStatus, string> = {
        OPEN: 'Açık',
        CONTACTED: 'İletişime Geçildi',
        ASSIGNED: 'Atama Yapıldı',
        SITE_VISIT: 'Saha Ziyareti',
        CONVERTED_TO_PROJECT: 'Projeye Dönüştürüldü',
        LOST: 'Kaybedildi'
      }

      const note = customNote || `Durum ${statusLabels[newStatus]} olarak güncellendi`

      await ProjectRequestAPI.updateStatus(requestId, newStatus, note)

      toast({
        title: 'Başarılı',
        description: `Talep durumu ${statusLabels[newStatus]} olarak güncellendi`
      })

      return true
    } catch (error) {
      console.error('Status update failed:', error)

      let errorMessage = 'Durum güncellenirken hata oluştu'

      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın'
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'Bu işlem için yetkiniz yok'
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          errorMessage = 'Talep bulunamadı'
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin'
        }
      }

      toast({
        title: 'Hata',
        description: errorMessage,
        variant: 'destructive'
      })

      return false
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    updateStatus,
    isUpdating
  }
}

// Status transition validation
export const getValidStatusTransitions = (currentStatus: ProjectRequestStatus): ProjectRequestStatus[] => {
  const transitions: Record<ProjectRequestStatus, ProjectRequestStatus[]> = {
    OPEN: ['CONTACTED', 'ASSIGNED', 'LOST'],
    CONTACTED: ['ASSIGNED', 'SITE_VISIT', 'LOST', 'OPEN'],
    ASSIGNED: ['SITE_VISIT', 'CONTACTED', 'LOST', 'CONVERTED_TO_PROJECT'],
    SITE_VISIT: ['CONVERTED_TO_PROJECT', 'ASSIGNED', 'LOST'],
    CONVERTED_TO_PROJECT: ['SITE_VISIT'], // Usually final, but can go back if needed
    LOST: ['OPEN', 'CONTACTED', 'ASSIGNED', 'SITE_VISIT'] // Can reopen lost requests
  }

  return transitions[currentStatus] || []
}

// Status workflow information
export const getStatusWorkflowInfo = (status: ProjectRequestStatus) => {
  const info = {
    OPEN: {
      label: 'Açık',
      description: 'Yeni talep, henüz işleme alınmadı',
      color: 'blue',
      nextSteps: ['Müşteri ile iletişim kur', 'Mühendis ata', 'Detayları incele']
    },
    CONTACTED: {
      label: 'İletişime Geçildi',
      description: 'Müşteri ile iletişim kuruldu',
      color: 'purple',
      nextSteps: ['Mühendis ata', 'Saha ziyareti planla', 'Teknik detayları al']
    },
    ASSIGNED: {
      label: 'Atama Yapıldı',
      description: 'Mühendis/ekip atandı',
      color: 'orange',
      nextSteps: ['Saha ziyaretini planla', 'Müşteri ile randevu al', 'Teknik inceleme yap']
    },
    SITE_VISIT: {
      label: 'Saha Ziyareti',
      description: 'Saha incelemesi yapılıyor/tamamlandı',
      color: 'yellow',
      nextSteps: ['Teknik rapor hazırla', 'Teklif hazırla', 'Projeye dönüştür']
    },
    CONVERTED_TO_PROJECT: {
      label: 'Projeye Dönüştürüldü',
      description: 'Talep başarıyla projeye dönüştürüldü',
      color: 'green',
      nextSteps: ['Proje takibine geç', 'Kurulum planla', 'Müşteri bilgilendir']
    },
    LOST: {
      label: 'Kaybedildi',
      description: 'Talep iptal edildi veya kaybedildi',
      color: 'red',
      nextSteps: ['Kaybetme nedenini analiz et', 'Gerekirse yeniden açabilirsin']
    }
  }

  return info[status]
}