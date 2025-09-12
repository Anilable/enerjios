'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Zap,
  Shield,
  Building
} from 'lucide-react';
import { QuoteApprovalDialog } from '@/components/quotes/QuoteApprovalDialog';

interface PublicQuote {
  id: string;
  quoteNumber: string;
  status: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  validUntil: string;
  terms: string | null;
  notes: string | null;
  pdfUrl: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  project: {
    name: string;
    type: string;
    capacity: number;
    estimatedCost: number | null;
  };
  company: {
    name: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    logo: string | null;
    website: string | null;
  } | null;
  createdBy: {
    name: string | null;
    email: string;
    phone: string | null;
  };
  customer: {
    type: string;
    firstName: string | null;
    lastName: string | null;
    companyName: string | null;
    phone: string | null;
  } | null;
  items: Array<{
    id: string;
    description: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
    product: {
      name: string;
      brand: string;
      model: string;
      type: string;
      power: number | null;
      warranty: number | null;
    };
  }>;
}

export default function PublicQuotePage() {
  const params = useParams();
  const token = params.token as string;

  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);

  useEffect(() => {
    fetchQuote();
  }, [token]);

  const fetchQuote = async () => {
    try {
      const response = await fetch(`/api/quotes/public/${token}`);
      const data = await response.json();

      if (response.ok) {
        setQuote(data);
      } else if (response.status === 410) {
        setExpired(true);
        setError(data.error);
      } else {
        setError(data.error || 'Teklif yüklenemedi');
      }
    } catch (err) {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Taslak', variant: 'secondary' as const },
      SENT: { label: 'Gönderildi', variant: 'default' as const },
      VIEWED: { label: 'Görüntülendi', variant: 'default' as const },
      APPROVED: { label: 'Onaylandı', variant: 'default' as const },
      REJECTED: { label: 'Reddedildi', variant: 'destructive' as const },
      EXPIRED: { label: 'Süresi Doldu', variant: 'secondary' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isExpired = () => {
    if (!quote) return false;
    return new Date(quote.validUntil) < new Date() || quote.status === 'EXPIRED';
  };

  const canTakeAction = () => {
    return quote && !isExpired() && !['APPROVED', 'REJECTED'].includes(quote.status);
  };

  const getCustomerName = () => {
    if (!quote?.customer) return 'Değerli Müşterimiz';
    
    if (quote.customer.companyName) {
      return quote.customer.companyName;
    }
    
    const fullName = `${quote.customer.firstName || ''} ${quote.customer.lastName || ''}`.trim();
    return fullName || 'Değerli Müşterimiz';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Teklif yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              {expired ? <Clock className="h-12 w-12 text-orange-500 mx-auto" /> : <XCircle className="h-12 w-12 text-red-500 mx-auto" />}
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {expired ? 'Teklif Süresi Doldu' : 'Teklif Bulunamadı'}
            </h2>
            <p className="text-gray-600">{error}</p>
            {expired && (
              <p className="text-sm text-gray-500 mt-2">
                Yeni bir teklif için bizimle iletişime geçiniz.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {quote.company?.logo && (
                <Image
                  src={quote.company.logo}
                  alt={quote.company.name}
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {quote.company?.name || 'Trakya Solar'}
                </h1>
                <p className="text-orange-600">Güneş Enerji Çözümleri</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Teklif No</div>
              <div className="text-lg font-semibold">{quote.quoteNumber}</div>
              {getStatusBadge(quote.status)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Expiry Warning */}
        {isExpired() && (
          <Alert className="border-red-200 bg-red-50">
            <Clock className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Bu teklifin geçerlilik süresi dolmuştur. Yeni bir teklif için bizimle iletişime geçiniz.
            </AlertDescription>
          </Alert>
        )}

        {/* Customer Greeting */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Merhaba {getCustomerName()},
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Güneş enerji sistemi kurulum talebiniz için hazırladığımız detaylı teklifi aşağıda bulabilirsiniz. 
                Teklifimiz {formatDate(quote.validUntil)} tarihine kadar geçerlidir.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-orange-500" />
              Proje Detayları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Proje Adı</div>
                <div className="font-semibold">{quote.project.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Sistem Tipi</div>
                <div className="font-semibold">{quote.project.type}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Sistem Kapasitesi</div>
                <div className="font-semibold">{quote.project.capacity} kWp</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Teklif Tarihi</div>
                <div className="font-semibold">{formatDate(quote.sentAt || quote.validUntil)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quote Items */}
        <Card>
          <CardHeader>
            <CardTitle>Teklif Kalemleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quote.items.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">
                        {item.product.brand} - {item.product.model}
                      </p>
                      {item.product.power && (
                        <p className="text-sm text-orange-600">
                          {item.product.power}W
                        </p>
                      )}
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-semibold">{formatCurrency(item.total)}</div>
                      <div className="text-sm text-gray-500">
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </div>
                    </div>
                  </div>
                  {item.product.warranty && (
                    <div className="flex items-center text-sm text-green-600">
                      <Shield className="h-4 w-4 mr-1" />
                      {item.product.warranty} yıl garanti
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Price Summary */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Ara Toplam:</span>
                <span>{formatCurrency(quote.subtotal)}</span>
              </div>
              {quote.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>İndirim:</span>
                  <span>-{formatCurrency(quote.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>KDV ({((quote.tax / quote.subtotal) * 100).toFixed(0)}%):</span>
                <span>{formatCurrency(quote.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Genel Toplam:</span>
                <span className="text-orange-600">{formatCurrency(quote.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Notes */}
        {(quote.terms || quote.notes) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Önemli Notlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quote.terms && (
                <div>
                  <h4 className="font-semibold mb-2">Şartlar ve Koşullar:</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.terms}</p>
                </div>
              )}
              {quote.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Ek Notlar:</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {canTakeAction() && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">Bu teklifi değerlendirin</h3>
                <p className="text-gray-600">
                  Teklifimizi inceledikten sonra onaylayabilir veya reddedebilirsiniz.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => setShowApprovalDialog(true)}
                    className="bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Teklifi Onayla
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowApprovalDialog(true)}
                    size="lg"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Teklifi Reddet
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PDF Download */}
        {quote.pdfUrl && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Button
                  onClick={() => window.open(quote.pdfUrl!, '_blank')}
                  variant="outline"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  PDF Olarak İndir
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              İletişim Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{quote.createdBy.email}</span>
                </div>
                {quote.createdBy.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{quote.createdBy.phone}</span>
                  </div>
                )}
                {quote.company?.website && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-gray-500" />
                    <a href={quote.company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {quote.company.website}
                    </a>
                  </div>
                )}
              </div>
              {quote.company && (
                <div className="space-y-3">
                  {quote.company.address && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-1 text-gray-500 flex-shrink-0" />
                      <span className="text-sm">
                        {quote.company.address}
                        {quote.company.city && `, ${quote.company.city}`}
                      </span>
                    </div>
                  )}
                  {quote.company.phone && (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{quote.company.phone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Approval Dialog */}
        {showApprovalDialog && (
          <QuoteApprovalDialog
            quote={quote}
            token={token}
            isOpen={showApprovalDialog}
            onClose={() => setShowApprovalDialog(false)}
            onSuccess={fetchQuote}
          />
        )}
      </div>
    </div>
  );
}