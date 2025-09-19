'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  TrendingUp,
  Users,
  Clock,
  Star,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Eye,
  CheckCircle,
  XCircle,
  DollarSign,
  Award,
  AlertCircle,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { Partner, PartnerQuoteRequest, QuoteRequest } from '@/types/partner'

interface DashboardStats {
  totalLeads: number
  activeQuotes: number
  conversionRate: number
  avgResponseTime: number
  totalRevenue: number
  thisMonthLeads: number
}

interface PartnerWithStatus extends Partner {
  registrationStatus: string
}

export default function PartnerDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [partner, setPartner] = useState<PartnerWithStatus | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [quoteRequests, setQuoteRequests] = useState<PartnerQuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Quote response form
  const [selectedQuote, setSelectedQuote] = useState<PartnerQuoteRequest | null>(null)
  const [responseForm, setResponseForm] = useState({
    quotedPrice: '',
    timeline: '',
    notes: '',
    warrantyYears: '10',
    installationIncluded: true,
    maintenanceIncluded: false,
    financingAvailable: false,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/partner/dashboard')
      return
    }

    if (status === 'authenticated') {
      fetchPartnerData()
      fetchQuoteRequests()
    }
  }, [status, router])

  const fetchPartnerData = async () => {
    try {
      const response = await fetch('/api/partners/dashboard')
      if (response.ok) {
        const data = await response.json()
        setPartner(data.partner)
        setStats(data.stats)
      } else if (response.status === 404) {
        // Partner not registered yet
        setPartner(null)
      }
    } catch (error) {
      console.error('Failed to fetch partner data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchQuoteRequests = async () => {
    try {
      const response = await fetch('/api/partners/quote-requests')
      if (response.ok) {
        const data = await response.json()
        setQuoteRequests(data.quoteRequests)
      }
    } catch (error) {
      console.error('Failed to fetch quote requests:', error)
    }
  }

  const handleQuoteResponse = async (quoteRequestId: string) => {
    try {
      const response = await fetch('/api/partners/respond-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteRequestId,
          ...responseForm,
          quotedPrice: parseFloat(responseForm.quotedPrice),
          warrantyYears: parseInt(responseForm.warrantyYears),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit quote response')
      }

      toast.success('Quote response submitted successfully!')
      setSelectedQuote(null)
      setResponseForm({
        quotedPrice: '',
        timeline: '',
        notes: '',
        warrantyYears: '10',
        installationIncluded: true,
        maintenanceIncluded: false,
        financingAvailable: false,
      })
      fetchQuoteRequests()

    } catch (error: any) {
      console.error('Quote response error:', error)
      toast.error(error.message || 'Failed to submit response')
    }
  }

  const markQuoteAsViewed = async (quoteRequestId: string) => {
    try {
      await fetch('/api/partners/quote-requests/view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quoteRequestId }),
      })
      fetchQuoteRequests()
    } catch (error) {
      console.error('Failed to mark as viewed:', error)
    }
  }

  const declineQuote = async (quoteRequestId: string, reason: string) => {
    try {
      const response = await fetch('/api/partners/quote-requests/decline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quoteRequestId, reason }),
      })

      if (!response.ok) {
        throw new Error('Failed to decline quote')
      }

      toast.success('Quote declined')
      fetchQuoteRequests()

    } catch (error: any) {
      console.error('Decline quote error:', error)
      toast.error(error.message || 'Failed to decline quote')
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'URGENT': return 'destructive'
      case 'NORMAL': return 'secondary'
      case 'FLEXIBLE': return 'outline'
      default: return 'secondary'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'blue'
      case 'VIEWED': return 'yellow'
      case 'RESPONDED': return 'green'
      case 'DECLINED': return 'red'
      case 'EXPIRED': return 'gray'
      default: return 'gray'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Partner Registration Required</CardTitle>
            <CardDescription>
              You need to register as a partner to access this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/partner/register')}
              className="w-full"
            >
              Register as Partner
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (partner.status === 'PENDING_VERIFICATION') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>Verification Pending</span>
            </CardTitle>
            <CardDescription>
              Your partner application is being reviewed by our team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">What's next?</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Our team will review your application</li>
                  <li>• We may contact you for additional information</li>
                  <li>• You'll receive an email once approved</li>
                  <li>• Typical review time: 2-3 business days</li>
                </ul>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/partner/register')}
                className="w-full"
              >
                Update Application
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (partner.status === 'REJECTED' || partner.status === 'SUSPENDED') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <XCircle className="w-5 h-5" />
              <span>{partner.status === 'REJECTED' ? 'Application Rejected' : 'Account Suspended'}</span>
            </CardTitle>
            <CardDescription>
              {partner.verificationNotes || 'Please contact support for more information.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => window.location.href = 'mailto:support@enerjios.com'}
              className="w-full"
            >
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Partner Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 flex items-center space-x-2 mt-1">
              <span>{partner.company.name}</span>
              <Badge variant="secondary" className="ml-2">
                {partner.tier}
              </Badge>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Verified
              </Badge>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <StarRating rating={partner.customerRating} />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads" className="relative">
            Leads
            {quoteRequests.filter(q => q.status === 'SENT').length > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 text-xs">
                {quoteRequests.filter(q => q.status === 'SENT').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Leads</p>
                      <p className="text-2xl font-bold">{stats.totalLeads}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    +{stats.thisMonthLeads} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Quotes</p>
                      <p className="text-2xl font-bold">{stats.activeQuotes}</p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                      <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Response</p>
                      <p className="text-2xl font-bold">{stats.avgResponseTime}h</p>
                    </div>
                    <Clock className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quoteRequests.slice(0, 5).map(quote => (
                    <div key={quote.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{quote.quoteRequest.customerName}</p>
                        <p className="text-sm text-gray-600">
                          {quote.quoteRequest.projectType} in {quote.quoteRequest.location}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(quote.sentAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(quote.status) as any}>
                        {quote.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Customer Rating</span>
                    <div className="flex items-center space-x-2">
                      <StarRating rating={partner.customerRating} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Projects</span>
                    <span className="font-medium">{partner.totalProjects}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Time</span>
                    <span className="font-medium">{partner.averageResponseTime || partner.responseTimeHours}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Partner Tier</span>
                    <Badge variant="outline">{partner.tier}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Requests</CardTitle>
              <CardDescription>
                Manage incoming lead requests from potential customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quoteRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No quote requests yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Quote requests will appear here when customers match your criteria
                    </p>
                  </div>
                ) : (
                  quoteRequests.map(quote => (
                    <Card key={quote.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">{quote.quoteRequest.customerName}</h3>
                              <Badge variant={getUrgencyColor(quote.quoteRequest.urgency)}>
                                {quote.quoteRequest.urgency}
                              </Badge>
                              <Badge variant={getStatusColor(quote.status) as any}>
                                {quote.status}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{quote.quoteRequest.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Zap className="w-3 h-3" />
                                <span>{quote.quoteRequest.projectType}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(quote.sentAt).toLocaleDateString()}</span>
                              </div>
                              {quote.quoteRequest.estimatedCapacity && (
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="w-3 h-3" />
                                  <span>{quote.quoteRequest.estimatedCapacity} kW</span>
                                </div>
                              )}
                            </div>

                            {quote.quoteRequest.description && (
                              <p className="text-sm text-gray-700 mb-3">
                                {quote.quoteRequest.description}
                              </p>
                            )}

                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markQuoteAsViewed(quote.id)}
                                disabled={quote.status !== 'SENT'}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>

                              {quote.status === 'SENT' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => setSelectedQuote(quote)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Respond
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => declineQuote(quote.id, 'Not available')}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Decline
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="text-right text-sm text-gray-500">
                            {quote.viewedAt && (
                              <p>Viewed: {new Date(quote.viewedAt).toLocaleDateString()}</p>
                            )}
                            {quote.respondedAt && (
                              <p>Responded: {new Date(quote.respondedAt).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes">
          <Card>
            <CardHeader>
              <CardTitle>Quote History</CardTitle>
              <CardDescription>
                View all submitted quotes and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">Quote history will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Partner Profile</CardTitle>
              <CardDescription>
                Manage your partner information and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Company Information</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Name:</strong> {partner.company.name}</p>
                    <p><strong>Type:</strong> {partner.type}</p>
                    <p><strong>Location:</strong> {partner.company.city}</p>
                    <p><strong>Verified:</strong> {partner.verifiedAt ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Service Areas</h3>
                  <div className="flex flex-wrap gap-1">
                    {(partner.serviceAreas as string[]).map(area => (
                      <Badge key={area} variant="outline">{area}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Specialties</h3>
                  <div className="flex flex-wrap gap-1">
                    {(partner.specialties as string[]).map(specialty => (
                      <Badge key={specialty} variant="secondary">{specialty}</Badge>
                    ))}
                  </div>
                </div>

                <Button variant="outline" onClick={() => router.push('/partner/settings')}>
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quote Response Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Respond to Quote Request</CardTitle>
              <CardDescription>
                {selectedQuote.quoteRequest.customerName} - {selectedQuote.quoteRequest.projectType}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quotedPrice">Quoted Price (TL) *</Label>
                  <Input
                    id="quotedPrice"
                    type="number"
                    value={responseForm.quotedPrice}
                    onChange={(e) => setResponseForm(prev => ({ ...prev, quotedPrice: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="timeline">Timeline *</Label>
                  <Input
                    id="timeline"
                    value={responseForm.timeline}
                    onChange={(e) => setResponseForm(prev => ({ ...prev, timeline: e.target.value }))}
                    placeholder="e.g., 2-3 weeks"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="warrantyYears">Warranty (years)</Label>
                <Select
                  value={responseForm.warrantyYears}
                  onValueChange={(value) => setResponseForm(prev => ({ ...prev, warrantyYears: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 years</SelectItem>
                    <SelectItem value="10">10 years</SelectItem>
                    <SelectItem value="15">15 years</SelectItem>
                    <SelectItem value="20">20 years</SelectItem>
                    <SelectItem value="25">25 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={responseForm.notes}
                  onChange={(e) => setResponseForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information about your quote..."
                  rows={3}
                />
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSelectedQuote(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleQuoteResponse(selectedQuote.id)}
                  disabled={!responseForm.quotedPrice || !responseForm.timeline}
                >
                  Submit Quote
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          }`}
        />
      ))}
      <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
    </div>
  )
}