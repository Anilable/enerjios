import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import DashboardOverview from '../DashboardOverview'

// Mock fetch
global.fetch = jest.fn()

const mockSession = {
  user: {
    id: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
    role: 'COMPANY'
  }
}

const mockDashboardData = {
  metrics: {
    totalProjects: 50,
    totalRevenue: 1500000,
    totalCustomers: 25,
    conversionRate: 75,
    projectGrowth: 12.5,
    revenueGrowth: 18.3
  },
  charts: {
    monthlyRevenue: [
      { month: '2024-01', revenue: 120000, project_count: 5 },
      { month: '2024-02', revenue: 150000, project_count: 6 },
      { month: '2024-03', revenue: 180000, project_count: 8 }
    ],
    projectsByStatus: [
      { status: 'COMPLETED', count: 20, label: 'Tamamlandı' },
      { status: 'IN_PROGRESS', count: 15, label: 'Devam Ediyor' },
      { status: 'PENDING', count: 10, label: 'Bekliyor' }
    ]
  },
  activities: {
    recentProjects: [
      {
        id: '1',
        name: 'Solar Project 1',
        status: 'IN_PROGRESS',
        statusLabel: 'Devam Ediyor',
        totalAmount: 100000,
        customerName: 'John Doe'
      }
    ]
  }
}

const renderWithSession = (component: React.ReactNode) => {
  return render(
    <SessionProvider session={mockSession}>
      {component}
    </SessionProvider>
  )
}

describe('DashboardOverview Component', () => {
  beforeEach(() => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockDashboardData
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    renderWithSession(<DashboardOverview />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('fetches and displays dashboard metrics', async () => {
    renderWithSession(<DashboardOverview />)
    
    await waitFor(() => {
      expect(screen.getByText('Toplam Projeler')).toBeInTheDocument()
    })
    
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('₺1.500.000,00')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
  })

  it('displays revenue chart', async () => {
    renderWithSession(<DashboardOverview />)
    
    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })
  })

  it('shows project status distribution', async () => {
    renderWithSession(<DashboardOverview />)
    
    await waitFor(() => {
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })
  })

  it('displays recent activities', async () => {
    renderWithSession(<DashboardOverview />)
    
    await waitFor(() => {
      expect(screen.getByText('Solar Project 1')).toBeInTheDocument()
    })
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Devam Ediyor')).toBeInTheDocument()
  })

  it('handles API error gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('API Error'))
    
    renderWithSession(<DashboardOverview />)
    
    await waitFor(() => {
      expect(screen.getByText(/Bir hata oluştu/)).toBeInTheDocument()
    })
  })

  it('refreshes data when refresh button is clicked', async () => {
    renderWithSession(<DashboardOverview />)
    
    await waitFor(() => {
      expect(screen.getByText('Toplam Projeler')).toBeInTheDocument()
    })
    
    const refreshButton = screen.getByRole('button', { name: /yenile/i })
    refreshButton.click()
    
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('applies correct time range filter', async () => {
    renderWithSession(<DashboardOverview />)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dashboard/overview?timeframe=30d')
      )
    })
  })
})