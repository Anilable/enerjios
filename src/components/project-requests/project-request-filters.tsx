'use client'

import { useState } from 'react'
import type { ProjectRequestFilters } from '@/types/project-request'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface ProjectRequestFiltersProps {
  onFilterChange: (filters: ProjectRequestFilters) => void
}

export function ProjectRequestFilters({ onFilterChange }: ProjectRequestFiltersProps) {
  const [filters, setFilters] = useState<ProjectRequestFilters>({
    search: '',
    projectType: undefined,
    priority: undefined,
    assignedEngineerId: undefined,
    source: undefined,
    dateRange: undefined
  })

  const updateFilter = <K extends keyof ProjectRequestFilters>(
    key: K, 
    value: ProjectRequestFilters[K]
  ) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilter = <K extends keyof ProjectRequestFilters>(key: K) => {
    updateFilter(key, undefined as ProjectRequestFilters[K])
  }

  const clearAllFilters = () => {
    const clearedFilters: ProjectRequestFilters = {
      search: '',
      projectType: undefined,
      priority: undefined,
      assignedEngineerId: undefined,
      source: undefined,
      dateRange: undefined
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = 
    filters.projectType || 
    filters.priority || 
    filters.assignedEngineerId || 
    filters.source ||
    filters.dateRange

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filtreler</h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-xs"
          >
            Tümünü Temizle
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Project Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="projectType">Proje Türü</Label>
          <Select 
            value={filters.projectType || ''} 
            onValueChange={(value) => updateFilter('projectType', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tür seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RESIDENTIAL">Konut</SelectItem>
              <SelectItem value="COMMERCIAL">Ticari</SelectItem>
              <SelectItem value="INDUSTRIAL">Endüstriyel</SelectItem>
              <SelectItem value="AGRICULTURAL">Tarımsal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <Label htmlFor="priority">Öncelik</Label>
          <Select 
            value={filters.priority || ''} 
            onValueChange={(value) => updateFilter('priority', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Öncelik seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HIGH">Yüksek</SelectItem>
              <SelectItem value="MEDIUM">Orta</SelectItem>
              <SelectItem value="LOW">Düşük</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Engineer Filter */}
        <div className="space-y-2">
          <Label htmlFor="engineer">Atanan Mühendis</Label>
          <Select 
            value={filters.assignedEngineerId || ''} 
            onValueChange={(value) => updateFilter('assignedEngineerId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Mühendis seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eng1">Mühendis Mehmet</SelectItem>
              <SelectItem value="eng2">Tarım Uzmanı Ali</SelectItem>
              <SelectItem value="eng3">Endüstri Uzmanı Veli</SelectItem>
              <SelectItem value="eng4">Mimar Ayşe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Source Filter */}
        <div className="space-y-2">
          <Label htmlFor="source">Kaynak</Label>
          <Select 
            value={filters.source || ''} 
            onValueChange={(value) => updateFilter('source', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Kaynak seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WEBSITE">Website</SelectItem>
              <SelectItem value="PHONE">Telefon</SelectItem>
              <SelectItem value="EMAIL">E-posta</SelectItem>
              <SelectItem value="REFERRAL">Referans</SelectItem>
              <SelectItem value="SOCIAL_MEDIA">Sosyal Medya</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Başlangıç Tarihi</Label>
          <Input 
            type="date"
            value={filters.dateRange?.start || ''}
            onChange={(e) => updateFilter('dateRange', {
              start: e.target.value,
              end: filters.dateRange?.end || ''
            })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Bitiş Tarihi</Label>
          <Input 
            type="date"
            value={filters.dateRange?.end || ''}
            onChange={(e) => updateFilter('dateRange', {
              start: filters.dateRange?.start || '',
              end: e.target.value
            })}
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Aktif Filtreler:</Label>
          <div className="flex flex-wrap gap-2">
            {filters.projectType && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tür: {filters.projectType}
                <button onClick={() => clearFilter('projectType')}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.priority && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Öncelik: {filters.priority}
                <button onClick={() => clearFilter('priority')}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.assignedEngineerId && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Mühendis: {filters.assignedEngineerId}
                <button onClick={() => clearFilter('assignedEngineerId')}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.source && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Kaynak: {filters.source}
                <button onClick={() => clearFilter('source')}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.dateRange && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tarih: {filters.dateRange.start} - {filters.dateRange.end}
                <button onClick={() => clearFilter('dateRange')}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}