import { ProjectRequest, ProjectRequestFilters, ProjectRequestStatus } from '@/types/project-request'

const API_BASE_URL = '/api/project-requests'

export class ProjectRequestAPI {
  static async getAll(filters?: ProjectRequestFilters): Promise<ProjectRequest[]> {
    const searchParams = new URLSearchParams()
    
    if (filters) {
      if (filters.search) {
        searchParams.append('search', filters.search)
      }
      if (filters.projectType) {
        searchParams.append('projectType', filters.projectType)
      }
      if (filters.priority) {
        searchParams.append('priority', filters.priority)
      }
      if (filters.assignedEngineerId) {
        searchParams.append('assignedEngineerId', filters.assignedEngineerId)
      }
      if (filters.source) {
        searchParams.append('source', filters.source)
      }
      if (filters.dateRange?.start) {
        searchParams.append('dateStart', filters.dateRange.start)
      }
      if (filters.dateRange?.end) {
        searchParams.append('dateEnd', filters.dateRange.end)
      }
    }

    const url = `${API_BASE_URL}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch project requests: ${response.statusText}`)
    }

    return response.json()
  }

  static async getById(id: string): Promise<ProjectRequest> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch project request: ${response.statusText}`)
    }

    return response.json()
  }

  static async create(data: Partial<ProjectRequest>): Promise<ProjectRequest> {
    console.log('📡 API: Making create request to:', API_BASE_URL)
    console.log('📡 API: Request data:', data)

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    console.log('📡 API: Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API: Error response body:', errorText)
      throw new Error(`Failed to create project request: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ API: Create successful:', { id: result.id, requestNumber: result.requestNumber })
    return result
  }

  static async update(id: string, data: Partial<ProjectRequest>): Promise<ProjectRequest> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to update project request: ${response.statusText}`)
    }

    return response.json()
  }

  static async updateStatus(id: string, status: ProjectRequestStatus, note?: string): Promise<ProjectRequest> {
    console.log('🚀 API: Making status update request:', { id, status, note })
    
    const response = await fetch(`${API_BASE_URL}/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, note }),
    })

    console.log('📡 API: Response received:', { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok 
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API: Error response body:', errorText)
      
      throw new Error(`Failed to update project request status: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ API: Update successful:', { id: result.id, status: result.status })
    return result
  }

  static async addNote(id: string, note: string): Promise<ProjectRequest> {
    const response = await fetch(`${API_BASE_URL}/${id}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ note }),
    })

    if (!response.ok) {
      throw new Error(`Failed to add note to project request: ${response.statusText}`)
    }

    return response.json()
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete project request: ${response.statusText}`)
    }
  }
}