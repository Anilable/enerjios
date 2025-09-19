'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, X, Upload, FileText, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { PARTNER_TYPES } from '@/types/partner'
import { PartnerType } from '@prisma/client'

interface Company {
  id: string
  name: string
  type: string
}

interface CertificationDocument {
  name: string
  type: string
  issuedBy: string
  issuedDate: string
  expiryDate?: string
  documentUrl: string
}

const SPECIALTIES = [
  'Residential Solar',
  'Commercial Solar',
  'Industrial Solar',
  'Agricultural Solar',
  'Rooftop Installation',
  'Ground Mount',
  'Battery Storage',
  'Grid-Tie Systems',
  'Off-Grid Systems',
  'Maintenance & Support',
  'Solar Financing',
  'Energy Management',
]

const TURKEY_CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Konya', 'Gaziantep', 'Adana',
  'Kayseri', 'Mersin', 'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli', 'Şanlıurfa',
  'Adapazarı', 'Malatya', 'Kahramanmaraş', 'Van', 'Batman', 'Elazığ', 'İzmit',
  'Manisa', 'Sivas', 'Gebze', 'Balıkesir', 'Tarsus', 'Kütahya', 'Trabzon', 'Çorum'
]

export default function PartnerRegistrationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // Form state
  const [formData, setFormData] = useState({
    companyId: '',
    type: '' as PartnerType,
    serviceAreas: [] as string[],
    specialties: [] as string[],
    minimumProjectSize: '',
    maximumProjectSize: '',
    responseTimeHours: 24,
    portfolioImages: [] as string[],
    certifications: [] as CertificationDocument[],
    description: '',
    preferredContact: 'EMAIL',
  })

  // Portfolio image upload state
  const [newPortfolioImage, setNewPortfolioImage] = useState('')
  const [newCertification, setNewCertification] = useState<CertificationDocument>({
    name: '',
    type: '',
    issuedBy: '',
    issuedDate: '',
    expiryDate: '',
    documentUrl: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/partner/register')
      return
    }

    if (status === 'authenticated') {
      fetchUserCompanies()
    }
  }, [status, router])

  const fetchUserCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies || [])
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error)
      toast.error('Failed to load companies')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validation
      if (!formData.companyId) {
        toast.error('Please select a company')
        return
      }

      if (formData.serviceAreas.length === 0) {
        toast.error('Please select at least one service area')
        return
      }

      if (formData.specialties.length === 0) {
        toast.error('Please select at least one specialty')
        return
      }

      const requestData = {
        ...formData,
        minimumProjectSize: formData.minimumProjectSize ? parseFloat(formData.minimumProjectSize) : undefined,
        maximumProjectSize: formData.maximumProjectSize ? parseFloat(formData.maximumProjectSize) : undefined,
      }

      const response = await fetch('/api/partners/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      toast.success('Partner registration submitted successfully!')
      router.push('/partner/dashboard')

    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Failed to submit registration')
    } finally {
      setLoading(false)
    }
  }

  const addServiceArea = (city: string) => {
    if (!formData.serviceAreas.includes(city)) {
      setFormData(prev => ({
        ...prev,
        serviceAreas: [...prev.serviceAreas, city]
      }))
    }
  }

  const removeServiceArea = (city: string) => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter(area => area !== city)
    }))
  }

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }))
  }

  const addPortfolioImage = () => {
    if (newPortfolioImage && !formData.portfolioImages.includes(newPortfolioImage)) {
      setFormData(prev => ({
        ...prev,
        portfolioImages: [...prev.portfolioImages, newPortfolioImage]
      }))
      setNewPortfolioImage('')
    }
  }

  const removePortfolioImage = (url: string) => {
    setFormData(prev => ({
      ...prev,
      portfolioImages: prev.portfolioImages.filter(img => img !== url)
    }))
  }

  const addCertification = () => {
    if (newCertification.name && newCertification.type && newCertification.issuedBy) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, { ...newCertification }]
      }))
      setNewCertification({
        name: '',
        type: '',
        issuedBy: '',
        issuedDate: '',
        expiryDate: '',
        documentUrl: '',
      })
    }
  }

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }

  const steps = [
    { title: 'Company Info', icon: <FileText className="w-4 h-4" /> },
    { title: 'Services', icon: <CheckCircle className="w-4 h-4" /> },
    { title: 'Portfolio', icon: <Upload className="w-4 h-4" /> },
    { title: 'Review', icon: <Clock className="w-4 h-4" /> },
  ]

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>No Company Found</CardTitle>
            <CardDescription>
              You need to have a registered company to become a partner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/dashboard/company/register')}
              className="w-full"
            >
              Register Company First
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Become a Partner
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Join our network of verified solar energy professionals
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= index
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {step.icon}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= index ? 'text-amber-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > index ? 'bg-amber-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs value={currentStep.toString()} className="w-full">
            {/* Step 1: Company Info */}
            <TabsContent value="0">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Select your company and partner type
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="company">Company *</Label>
                    <Select
                      value={formData.companyId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, companyId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map(company => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name} ({company.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="type">Partner Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as PartnerType }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select partner type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PARTNER_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of your company and services..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                    <Select
                      value={formData.preferredContact}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, preferredContact: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="PHONE">Phone</SelectItem>
                        <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      disabled={!formData.companyId || !formData.type}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 2: Services */}
            <TabsContent value="1">
              <Card>
                <CardHeader>
                  <CardTitle>Services & Coverage</CardTitle>
                  <CardDescription>
                    Define your service areas and specialties
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Service Areas *</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Select the cities you provide services in
                    </p>
                    <Select onValueChange={addServiceArea}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add service area" />
                      </SelectTrigger>
                      <SelectContent>
                        {TURKEY_CITIES
                          .filter(city => !formData.serviceAreas.includes(city))
                          .map(city => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.serviceAreas.map(area => (
                        <Badge key={area} variant="secondary" className="pr-1">
                          {area}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-2 hover:bg-transparent"
                            onClick={() => removeServiceArea(area)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Specialties *</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Select your areas of expertise
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {SPECIALTIES.map(specialty => (
                        <div key={specialty} className="flex items-center space-x-2">
                          <Checkbox
                            id={specialty}
                            checked={formData.specialties.includes(specialty)}
                            onCheckedChange={() => toggleSpecialty(specialty)}
                          />
                          <Label htmlFor={specialty} className="text-sm">
                            {specialty}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minProjectSize">Minimum Project Size (kW)</Label>
                      <Input
                        id="minProjectSize"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.minimumProjectSize}
                        onChange={(e) => setFormData(prev => ({ ...prev, minimumProjectSize: e.target.value }))}
                        placeholder="e.g., 5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxProjectSize">Maximum Project Size (kW)</Label>
                      <Input
                        id="maxProjectSize"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.maximumProjectSize}
                        onChange={(e) => setFormData(prev => ({ ...prev, maximumProjectSize: e.target.value }))}
                        placeholder="e.g., 1000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="responseTime">Response Time (hours)</Label>
                    <Select
                      value={formData.responseTimeHours.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, responseTimeHours: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="8">8 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="48">48 hours</SelectItem>
                        <SelectItem value="72">72 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(0)}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      disabled={formData.serviceAreas.length === 0 || formData.specialties.length === 0}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 3: Portfolio */}
            <TabsContent value="2">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio & Certifications</CardTitle>
                  <CardDescription>
                    Showcase your work and credentials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Portfolio Images</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Add URLs of your project photos
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={newPortfolioImage}
                        onChange={(e) => setNewPortfolioImage(e.target.value)}
                        placeholder="Image URL"
                      />
                      <Button type="button" onClick={addPortfolioImage}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                      {formData.portfolioImages.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-image.png'
                            }}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => removePortfolioImage(url)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Certifications</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Add your professional certifications
                    </p>
                    <div className="space-y-3 p-4 border rounded">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Certification name"
                          value={newCertification.name}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <Input
                          placeholder="Type (e.g., ISO, CE)"
                          value={newCertification.type}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, type: e.target.value }))}
                        />
                        <Input
                          placeholder="Issued by"
                          value={newCertification.issuedBy}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, issuedBy: e.target.value }))}
                        />
                        <Input
                          type="date"
                          placeholder="Issued date"
                          value={newCertification.issuedDate}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, issuedDate: e.target.value }))}
                        />
                        <Input
                          type="date"
                          placeholder="Expiry date (optional)"
                          value={newCertification.expiryDate}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, expiryDate: e.target.value }))}
                        />
                        <Input
                          placeholder="Document URL"
                          value={newCertification.documentUrl}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, documentUrl: e.target.value }))}
                        />
                      </div>
                      <Button type="button" onClick={addCertification}>
                        Add Certification
                      </Button>
                    </div>

                    <div className="space-y-2 mt-3">
                      {formData.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{cert.name}</p>
                            <p className="text-sm text-gray-600">
                              {cert.type} - Issued by {cert.issuedBy}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeCertification(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                    >
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 4: Review */}
            <TabsContent value="3">
              <Card>
                <CardHeader>
                  <CardTitle>Review & Submit</CardTitle>
                  <CardDescription>
                    Please review your information before submitting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Company Information</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Company: {companies.find(c => c.id === formData.companyId)?.name}</p>
                        <p>Partner Type: {PARTNER_TYPES.find(t => t.value === formData.type)?.label}</p>
                        <p>Preferred Contact: {formData.preferredContact}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium">Service Areas</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.serviceAreas.map(area => (
                          <Badge key={area} variant="secondary">{area}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium">Specialties</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.specialties.map(specialty => (
                          <Badge key={specialty} variant="outline">{specialty}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium">Project Size</h3>
                      <p className="text-sm text-gray-600">
                        {formData.minimumProjectSize && `Min: ${formData.minimumProjectSize} kW`}
                        {formData.minimumProjectSize && formData.maximumProjectSize && ' - '}
                        {formData.maximumProjectSize && `Max: ${formData.maximumProjectSize} kW`}
                        {!formData.minimumProjectSize && !formData.maximumProjectSize && 'No size restrictions'}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium">Portfolio & Certifications</h3>
                      <p className="text-sm text-gray-600">
                        {formData.portfolioImages.length} portfolio images, {formData.certifications.length} certifications
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded">
                    <h4 className="font-medium text-amber-800">What happens next?</h4>
                    <ul className="text-sm text-amber-700 mt-2 space-y-1">
                      <li>• Your application will be reviewed by our team</li>
                      <li>• We may contact you for additional information</li>
                      <li>• Once approved, you'll gain access to the partner dashboard</li>
                      <li>• You'll start receiving qualified leads based on your criteria</li>
                    </ul>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                    >
                      Previous
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  )
}