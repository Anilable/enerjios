'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  AlertCircle,
  Star,
  MapPin,
  Building,
  Users,
  TrendingUp,
  Filter,
  Download
} from 'lucide-react'
import { toast } from 'sonner'
import { Partner } from '@/types/partner'
import { PARTNER_TYPES, PARTNER_STATUSES } from '@/types/partner'

interface AdminStats {
  totalPartners: number
  pendingVerification: number
  verifiedPartners: number
  suspendedPartners: number
  totalQuoteRequests: number
  activeQuoteRequests: number
}

export default function AdminPartnersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [partners, setPartners] = useState<Partner[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [verificationForm, setVerificationForm] = useState({
    action: '',
    notes: '',
  })

  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/partners')
      return
    }

    if (status === 'authenticated') {
      // Check if user is admin
      if (session?.user?.role !== 'ADMIN') {
        router.push('/dashboard')
        return
      }

      fetchAdminData()
      fetchPartners()
    }
  }, [status, router, session])

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/admin/partners/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
    }
  }

  const fetchPartners = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter !== 'all') params.append('type', typeFilter)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/admin/partners?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPartners(data.partners)
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error)
      toast.error('Failed to load partners')
    } finally {
      setLoading(false)
    }
  }

  const handlePartnerAction = async (partnerId: string, action: 'verify' | 'reject' | 'suspend', notes?: string) => {
    try {
      const response = await fetch('/api/admin/partners/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId,
          action,
          notes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process partner action')
      }

      const actionText = action === 'verify' ? 'verified' : action === 'reject' ? 'rejected' : 'suspended'
      toast.success(`Partner ${actionText} successfully`)

      setSelectedPartner(null)
      setVerificationForm({ action: '', notes: '' })
      fetchPartners()
      fetchAdminData()

    } catch (error: any) {
      console.error('Partner action error:', error)
      toast.error(error.message || 'Failed to process action')
    }
  }

  const exportPartners = async () => {
    try {
      const response = await fetch('/api/admin/partners/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `partners-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Partners exported successfully')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export partners')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_VERIFICATION': return 'yellow'
      case 'VERIFIED': return 'green'
      case 'SUSPENDED': return 'red'
      case 'REJECTED': return 'gray'
      default: return 'gray'
    }
  }

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Partner Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage partner registrations and verifications
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Partners</p>
                  <p className="text-2xl font-bold">{stats.totalPartners}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pendingVerification}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified Partners</p>
                  <p className="text-2xl font-bold text-green-600">{stats.verifiedPartners}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Quotes</p>
                  <p className="text-2xl font-bold">{stats.activeQuoteRequests}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="partners" className="w-full">
        <TabsList>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search partners..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {PARTNER_STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {PARTNER_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={fetchPartners}>
                  <Filter className="w-4 h-4 mr-2" />
                  Apply
                </Button>
                <Button variant="outline" onClick={exportPartners}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Partners Table */}
          <Card>
            <CardHeader>
              <CardTitle>Partners</CardTitle>
              <CardDescription>
                Manage partner registrations and verifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map(partner => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {partner.company.logo ? (
                            <img
                              src={partner.company.logo}
                              alt={partner.company.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                              <Building className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{partner.company.name}</p>
                            <p className="text-sm text-gray-500">{partner.tier}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {PARTNER_TYPES.find(t => t.value === partner.type)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{partner.company.city}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(partner.status) as any}>
                          {PARTNER_STATUSES.find(s => s.value === partner.status)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StarRating rating={partner.customerRating} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{partner.totalProjects}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(partner.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedPartner(partner)}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{partner.company.name} - Partner Details</DialogTitle>
                                <DialogDescription>
                                  Review partner information and manage verification status
                                </DialogDescription>
                              </DialogHeader>

                              {selectedPartner && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div>
                                      <h3 className="font-medium mb-3">Company Information</h3>
                                      <div className="space-y-2 text-sm">
                                        <div>
                                          <span className="font-medium">Name:</span> {selectedPartner.company.name}
                                        </div>
                                        <div>
                                          <span className="font-medium">Type:</span> {selectedPartner.type}
                                        </div>
                                        <div>
                                          <span className="font-medium">City:</span> {selectedPartner.company.city}
                                        </div>
                                        <div>
                                          <span className="font-medium">Phone:</span> {selectedPartner.company.phone}
                                        </div>
                                        <div>
                                          <span className="font-medium">Website:</span> {selectedPartner.company.website}
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <h3 className="font-medium mb-3">Performance Metrics</h3>
                                      <div className="space-y-2 text-sm">
                                        <div>
                                          <span className="font-medium">Rating:</span> {selectedPartner.customerRating}/5
                                        </div>
                                        <div>
                                          <span className="font-medium">Total Projects:</span> {selectedPartner.totalProjects}
                                        </div>
                                        <div>
                                          <span className="font-medium">Total Leads:</span> {selectedPartner.totalLeads}
                                        </div>
                                        <div>
                                          <span className="font-medium">Converted:</span> {selectedPartner.convertedLeads}
                                        </div>
                                        <div>
                                          <span className="font-medium">Response Time:</span> {selectedPartner.averageResponseTime || selectedPartner.responseTimeHours}h
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h3 className="font-medium mb-3">Service Areas</h3>
                                    <div className="flex flex-wrap gap-1">
                                      {(selectedPartner.serviceAreas as string[]).map(area => (
                                        <Badge key={area} variant="outline">{area}</Badge>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <h3 className="font-medium mb-3">Specialties</h3>
                                    <div className="flex flex-wrap gap-1">
                                      {(selectedPartner.specialties as string[]).map(specialty => (
                                        <Badge key={specialty} variant="secondary">{specialty}</Badge>
                                      ))}
                                    </div>
                                  </div>

                                  {selectedPartner.description && (
                                    <div>
                                      <h3 className="font-medium mb-3">Description</h3>
                                      <p className="text-sm text-gray-600">{selectedPartner.description}</p>
                                    </div>
                                  )}

                                  {selectedPartner.portfolioImages && (selectedPartner.portfolioImages as string[]).length > 0 && (
                                    <div>
                                      <h3 className="font-medium mb-3">Portfolio Images</h3>
                                      <div className="grid grid-cols-4 gap-2">
                                        {(selectedPartner.portfolioImages as string[]).slice(0, 8).map((url, index) => (
                                          <img
                                            key={index}
                                            src={url}
                                            alt={`Portfolio ${index + 1}`}
                                            className="w-full h-20 object-cover rounded"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).src = '/placeholder-image.png'
                                            }}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {selectedPartner.status === 'PENDING_VERIFICATION' && (
                                    <div className="p-4 border rounded">
                                      <h3 className="font-medium mb-3">Partner Verification</h3>
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="verificationNotes">Notes</Label>
                                          <Textarea
                                            id="verificationNotes"
                                            value={verificationForm.notes}
                                            onChange={(e) => setVerificationForm(prev => ({ ...prev, notes: e.target.value }))}
                                            placeholder="Add notes about verification decision..."
                                            rows={3}
                                          />
                                        </div>
                                        <div className="flex space-x-2">
                                          <Button
                                            onClick={() => handlePartnerAction(selectedPartner.id, 'verify', verificationForm.notes)}
                                            className="flex items-center space-x-2"
                                          >
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Verify Partner</span>
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            onClick={() => handlePartnerAction(selectedPartner.id, 'reject', verificationForm.notes)}
                                            className="flex items-center space-x-2"
                                          >
                                            <XCircle className="w-4 h-4" />
                                            <span>Reject Application</span>
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {selectedPartner.status === 'VERIFIED' && (
                                    <div className="p-4 border rounded">
                                      <h3 className="font-medium mb-3">Partner Actions</h3>
                                      <Button
                                        variant="outline"
                                        onClick={() => handlePartnerAction(selectedPartner.id, 'suspend', 'Account suspended by admin')}
                                        className="flex items-center space-x-2"
                                      >
                                        <AlertCircle className="w-4 h-4" />
                                        <span>Suspend Partner</span>
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {partner.status === 'PENDING_VERIFICATION' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handlePartnerAction(partner.id, 'verify')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handlePartnerAction(partner.id, 'reject')}
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {partners.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No partners found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Partner Analytics</CardTitle>
              <CardDescription>
                Analytics and insights about partner performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">Analytics dashboard will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Partner System Settings</CardTitle>
              <CardDescription>
                Configure partner system settings and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">System settings will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}