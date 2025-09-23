'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Eye
} from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface ChatbotContact {
  id: string
  name: string
  surname: string
  email: string
  phone: string
  city: string
  createdAt: string
  updatedAt: string
}

export default function ChatbotContactsPage() {
  const [contacts, setContacts] = useState<ChatbotContact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<ChatbotContact[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchContacts()
  }, [])

  useEffect(() => {
    const filtered = contacts.filter(contact =>
      `${contact.name} ${contact.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm) ||
      contact.city.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredContacts(filtered)
  }, [searchTerm, contacts])

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/chatbot/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
        setFilteredContacts(data)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Ad', 'Soyad', 'E-posta', 'Telefon', 'Şehir', 'Kayıt Tarihi'].join(','),
      ...filteredContacts.map(contact =>
        [
          contact.name,
          contact.surname,
          contact.email,
          contact.phone,
          contact.city,
          format(new Date(contact.createdAt), 'dd/MM/yyyy HH:mm')
        ].join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `chatbot-contacts-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Chatbot İletişimleri</h1>
        <p className="text-gray-600 mt-2">
          Chatbot üzerinden iletişime geçen kullanıcılar
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam İletişim</p>
                <p className="text-2xl font-bold">{contacts.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bu Hafta</p>
                <p className="text-2xl font-bold">
                  {contacts.filter(c => {
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return new Date(c.createdAt) > weekAgo
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Farklı Şehir</p>
                <p className="text-2xl font-bold">
                  {new Set(contacts.map(c => c.city)).size}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bugün</p>
                <p className="text-2xl font-bold">
                  {contacts.filter(c => {
                    const today = new Date()
                    const contactDate = new Date(c.createdAt)
                    return contactDate.toDateString() === today.toDateString()
                  }).length}
                </p>
              </div>
              <div className="relative">
                <Eye className="h-8 w-8 text-purple-500" />
                {contacts.filter(c => {
                  const today = new Date()
                  const contactDate = new Date(c.createdAt)
                  return contactDate.toDateString() === today.toDateString()
                }).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {contacts.filter(c => {
                      const today = new Date()
                      const contactDate = new Date(c.createdAt)
                      return contactDate.toDateString() === today.toDateString()
                    }).length}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>İletişim Listesi</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                CSV İndir
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Şehir</TableHead>
                  <TableHead>Kayıt Tarihi</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">
                      {contact.name} {contact.surname}
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{contact.city}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(contact.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEmail(contact.email)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCall(contact.phone)}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}