'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Calculator,
  MapPin,
  Calendar,
  DollarSign,
  Zap,
  Clock,
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import { PARTNER_TYPES, URGENCY_LEVELS } from '@/types/partner'
import { ProjectType } from '@prisma/client'

const PROJECT_TYPES = [
  { value: 'RESIDENTIAL', label: 'Residential', icon: '🏠' },
  { value: 'COMMERCIAL', label: 'Commercial', icon: '🏢' },
  { value: 'INDUSTRIAL', label: 'Industrial', icon: '🏭' },
  { value: 'AGRICULTURAL', label: 'Agricultural', icon: '🚜' },
  { value: 'ROOFTOP', label: 'Rooftop', icon: '🏠' },
  { value: 'LAND', label: 'Ground Mount', icon: '🌱' },
]

const TURKEY_CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Konya', 'Gaziantep', 'Adana',
  'Kayseri', 'Mersin', 'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli', 'Şanlıurfa',
  'Adapazarı', 'Malatya', 'Kahramanmaraş', 'Van', 'Batman', 'Elazığ', 'İzmit',
  'Manisa', 'Sivas', 'Gebze', 'Balıkesir', 'Tarsus', 'Kütahya', 'Trabzon', 'Çorum'
]

function RequestQuotesForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedPartnerId = searchParams?.get('partnerId')

  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // Form state
  const [formData, setFormData] = useState({
    customerName: session?.user?.name || '',
    customerEmail: session?.user?.email || '',
    customerPhone: '',
    projectType: '' as ProjectType,
    location: '',
    address: '',
    estimatedCapacity: '',
    budget: '',
    description: '',
    urgency: 'NORMAL',
    preferredPartnerType: '',
    maxPartnersToContact: 5,
    expectedStartDate: '',
  })

  const [estimatedSavings, setEstimatedSavings] = useState(0)

  useEffect(() => {
    // Pre-fill user data if logged in
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        customerName: session.user.name || '',
        customerEmail: session.user.email || '',
      }))
    }
  }, [session])

  useEffect(() => {
    // Calculate estimated savings based on capacity and location
    if (formData.estimatedCapacity && formData.location) {
      const capacity = parseFloat(formData.estimatedCapacity)
      const avgSunHours = 5.5 // Average for Turkey
      const electricityRate = 2.5 // TL per kWh
      const annualProduction = capacity * avgSunHours * 365
      const annualSavings = annualProduction * electricityRate
      setEstimatedSavings(annualSavings)
    }
  }, [formData.estimatedCapacity, formData.location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validation
      if (!formData.customerName || !formData.customerEmail || !formData.projectType || !formData.location) {
        toast.error('Please fill in all required fields')
        return
      }

      const requestData = {
        ...formData,
        estimatedCapacity: formData.estimatedCapacity ? parseFloat(formData.estimatedCapacity) : undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
      }

      const response = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit quote request')
      }

      toast.success(
        `Quote request submitted successfully! ${data.matchedPartners.length} partners will be contacted.`
      )

      // Redirect to quote requests tracking page
      router.push('/dashboard/quote-requests')

    } catch (error: any) {
      console.error('Quote request error:', error)
      toast.error(error.message || 'Failed to submit quote request')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.customerName && formData.customerEmail && formData.customerPhone)
      case 1:
        return !!(formData.projectType && formData.location)
      case 2:
        return true
      default:
        return false
    }
  }

  const steps = [
    { title: 'Contact Info', description: 'Your contact details' },
    { title: 'Project Details', description: 'About your solar project' },
    { title: 'Preferences', description: 'Partner and timeline preferences' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Request Solar Quotes
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Get quotes from verified solar partners in your area
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= index
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > index ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${
                    currentStep >= index ? 'text-amber-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {currentStep === 0 && <Users className="w-5 h-5" />}
                {currentStep === 1 && <Zap className="w-5 h-5" />}
                {currentStep === 2 && <Clock className="w-5 h-5" />}
                <span>{steps[currentStep].title}</span>
              </CardTitle>
              <CardDescription>
                {steps[currentStep].description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Contact Info */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">Full Name *</Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Email Address *</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      placeholder="+90 XXX XXX XX XX"
                      required
                    />
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Why do we need your contact info?</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Partners will contact you directly with their quotes</li>
                      <li>• We'll send you updates about your quote requests</li>
                      <li>• Your information is only shared with matched partners</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 2: Project Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label>Project Type *</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Select the type of solar installation you need
                    </p>
                    <RadioGroup
                      value={formData.projectType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, projectType: value as ProjectType }))}
                      className="grid grid-cols-2 md:grid-cols-3 gap-4"
                    >
                      {PROJECT_TYPES.map(type => (
                        <div key={type.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={type.value} id={type.value} />
                          <Label htmlFor={type.value} className="flex items-center space-x-2 cursor-pointer">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Select
                        value={formData.location}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {TURKEY_CITIES.map(city => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="estimatedCapacity">Estimated Capacity (kW)</Label>
                      <Input
                        id="estimatedCapacity"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.estimatedCapacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, estimatedCapacity: e.target.value }))}
                        placeholder="e.g., 10"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Don't know? Partners will help you determine the right size
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Property Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Street address for site evaluation"
                    />
                  </div>

                  <div>
                    <Label htmlFor="budget">Budget Range (TL)</Label>
                    <Select
                      value={formData.budget}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50000">Under 50,000 TL</SelectItem>
                        <SelectItem value="100000">50,000 - 100,000 TL</SelectItem>
                        <SelectItem value="200000">100,000 - 200,000 TL</SelectItem>
                        <SelectItem value="500000">200,000 - 500,000 TL</SelectItem>
                        <SelectItem value="1000000">500,000 - 1,000,000 TL</SelectItem>
                        <SelectItem value="1000001">Over 1,000,000 TL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Tell us more about your project, specific requirements, or questions..."
                      rows={4}
                    />
                  </div>

                  {/* Estimated Savings */}
                  {estimatedSavings > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calculator className="w-5 h-5 text-green-600" />
                        <h4 className="font-medium text-green-900">Estimated Annual Savings</h4>
                      </div>
                      <p className="text-2xl font-bold text-green-700">
                        ₺{estimatedSavings.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Based on {formData.estimatedCapacity} kW system in {formData.location}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Preferences */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label>Project Urgency</Label>
                    <RadioGroup
                      value={formData.urgency}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}
                      className="grid grid-cols-1 gap-3 mt-3"
                    >
                      {URGENCY_LEVELS.map(level => (
                        <div key={level.value} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <RadioGroupItem value={level.value} id={level.value} />
                          <Label htmlFor={level.value} className="flex-1 cursor-pointer">
                            <div className="font-medium">{level.label}</div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="preferredPartnerType">Preferred Partner Type</Label>
                    <Select
                      value={formData.preferredPartnerType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, preferredPartnerType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No preference</SelectItem>
                        {PARTNER_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="maxPartners">Maximum Partners to Contact</Label>
                    <Select
                      value={formData.maxPartnersToContact.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, maxPartnersToContact: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 partners</SelectItem>
                        <SelectItem value="5">5 partners</SelectItem>
                        <SelectItem value="8">8 partners</SelectItem>
                        <SelectItem value="10">10 partners</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      More partners = more quotes, but also more follow-up calls
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="expectedStartDate">Expected Start Date</Label>
                    <Input
                      id="expectedStartDate"
                      type="date"
                      value={formData.expectedStartDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedStartDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h4 className="font-medium text-amber-900 mb-2">What happens next?</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• We'll match you with qualified partners in your area</li>
                      <li>• Partners will contact you within their response time</li>
                      <li>• You'll receive detailed quotes and can compare options</li>
                      <li>• Choose the partner that best fits your needs</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <Separator />

              <div className="flex justify-between">
                {currentStep > 0 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceedFromStep(currentStep)}
                    className="ml-auto flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="ml-auto"
                  >
                    {loading ? 'Submitting...' : 'Submit Quote Request'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Pre-selected partner info */}
        {preselectedPartnerId && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-sm text-amber-600">
                <CheckCircle className="w-4 h-4" />
                <span>This quote request will be sent to your selected partner</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function RequestQuotesPage() {
  return (
    <Suspense fallback={<div className='flex items-center justify-center p-8'>Loading...</div>}>
      <RequestQuotesForm />
    </Suspense>
  )
}