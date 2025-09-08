import Iyzipay from 'iyzipay'

// Initialize İyzico client
export const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY!,
  secretKey: process.env.IYZICO_SECRET_KEY!,
  uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com' // Use sandbox for development
})

// Payment interfaces for Turkish solar business
export interface SolarPaymentRequest {
  // Order details
  orderId: string
  quoteId: string
  userId: string
  
  // Payment amount
  price: string
  paidPrice: string
  currency: 'TRY'
  installment: number
  
  // Customer information
  buyer: {
    id: string
    name: string
    surname: string
    email: string
    gsmNumber: string
    identityNumber: string
    registrationAddress: string
    city: string
    country: string
    ip: string
  }
  
  // Billing & shipping address (same for solar installations)
  address: {
    contactName: string
    city: string
    country: string
    address: string
    zipCode?: string
  }
  
  // Basket items (solar equipment)
  basketItems: Array<{
    id: string
    name: string
    category1: string
    category2?: string
    itemType: 'PHYSICAL' | 'VIRTUAL'
    price: string
  }>
  
  // Payment card details
  paymentCard: {
    cardHolderName: string
    cardNumber: string
    expireMonth: string
    expireYear: string
    cvc: string
    registerCard?: number
  }
  
  // Callback URLs
  callbackUrl: string
}

export interface InstallmentInfo {
  installmentNumber: number
  installmentPrice: string
  totalPrice: string
  installmentRate?: number
}

// Create payment for solar equipment/services
export async function createSolarPayment(paymentData: SolarPaymentRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    iyzipay.payment.create({
      locale: Iyzipay.LOCALE.TR,
      conversationId: paymentData.orderId,
      price: paymentData.price,
      paidPrice: paymentData.paidPrice,
      currency: Iyzipay.CURRENCY.TRY,
      installment: paymentData.installment,
      basketId: paymentData.quoteId,
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      paymentCard: paymentData.paymentCard,
      buyer: paymentData.buyer,
      shippingAddress: paymentData.address,
      billingAddress: paymentData.address,
      basketItems: paymentData.basketItems
    }, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

// Create 3D Secure payment (required for Turkish market)
export async function create3DPayment(paymentData: SolarPaymentRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    iyzipay.threedsInitialize.create({
      locale: Iyzipay.LOCALE.TR,
      conversationId: paymentData.orderId,
      price: paymentData.price,
      paidPrice: paymentData.paidPrice,
      currency: Iyzipay.CURRENCY.TRY,
      installment: paymentData.installment,
      basketId: paymentData.quoteId,
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: paymentData.callbackUrl,
      paymentCard: paymentData.paymentCard,
      buyer: paymentData.buyer,
      shippingAddress: paymentData.address,
      billingAddress: paymentData.address,
      basketItems: paymentData.basketItems
    }, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

// Complete 3D Secure payment
export async function complete3DPayment(request: any): Promise<any> {
  return new Promise((resolve, reject) => {
    iyzipay.threedsPayment.create(request, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

// Get installment info for a BIN (first 6 digits of card)
export async function getInstallmentInfo(binNumber: string, price: string): Promise<InstallmentInfo[]> {
  return new Promise((resolve, reject) => {
    iyzipay.installmentInfo.retrieve({
      locale: Iyzipay.LOCALE.TR,
      conversationId: `installment-${Date.now()}`,
      binNumber,
      price
    }, (err, result) => {
      if (err) {
        reject(err)
      } else {
        // Parse installment options
        const installments: InstallmentInfo[] = []
        if (result.installmentDetails && result.installmentDetails.length > 0) {
          result.installmentDetails[0].installmentPrices?.forEach((installment: any) => {
            installments.push({
              installmentNumber: installment.installmentNumber,
              installmentPrice: installment.installmentPrice,
              totalPrice: installment.totalPrice,
              installmentRate: installment.installmentRate
            })
          })
        }
        resolve(installments)
      }
    })
  })
}

// Refund payment
export async function refundPayment(paymentId: string, price: string, reason: string): Promise<any> {
  return new Promise((resolve, reject) => {
    iyzipay.refund.create({
      locale: Iyzipay.LOCALE.TR,
      conversationId: `refund-${Date.now()}`,
      paymentTransactionId: paymentId,
      price,
      ip: '127.0.0.1', // This should be the admin's IP
      reason
    }, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

// Cancel payment
export async function cancelPayment(paymentId: string, reason: string): Promise<any> {
  return new Promise((resolve, reject) => {
    iyzipay.cancel.create({
      locale: Iyzipay.LOCALE.TR,
      conversationId: `cancel-${Date.now()}`,
      paymentId,
      ip: '127.0.0.1',
      reason
    }, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

// Helper function to create basket items from solar quote
export function createBasketItemsFromQuote(quote: any): any[] {
  const basketItems = []
  
  // Solar panels
  if (quote.systemSize && quote.panelCount) {
    basketItems.push({
      id: `panels-${quote.id}`,
      name: `Güneş Paneli (${quote.panelCount} adet)`,
      category1: 'Solar Equipment',
      category2: 'Panels',
      itemType: 'PHYSICAL',
      price: (quote.panelCost || 0).toFixed(2)
    })
  }
  
  // Inverter
  if (quote.inverterCost) {
    basketItems.push({
      id: `inverter-${quote.id}`,
      name: 'İnvertör Sistemi',
      category1: 'Solar Equipment',
      category2: 'Inverter',
      itemType: 'PHYSICAL',
      price: quote.inverterCost.toFixed(2)
    })
  }
  
  // Installation service
  if (quote.installationCost) {
    basketItems.push({
      id: `installation-${quote.id}`,
      name: 'Kurulum Hizmeti',
      category1: 'Service',
      category2: 'Installation',
      itemType: 'VIRTUAL',
      price: quote.installationCost.toFixed(2)
    })
  }
  
  // If no specific breakdown, create single item
  if (basketItems.length === 0) {
    basketItems.push({
      id: `solar-system-${quote.id}`,
      name: `Güneş Enerjisi Sistemi (${quote.systemSize}kW)`,
      category1: 'Solar System',
      category2: 'Complete System',
      itemType: 'PHYSICAL',
      price: (quote.totalCost || quote.estimatedCost || 0).toFixed(2)
    })
  }
  
  return basketItems
}

// Validate Turkish identity number for payments
export function validateTCKimlik(identityNumber: string): boolean {
  if (!/^\d{11}$/.test(identityNumber)) return false
  
  const digits = identityNumber.split('').map(Number)
  if (digits[0] === 0) return false
  
  const sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
  const sum2 = digits[1] + digits[3] + digits[5] + digits[7]
  const check1 = (sum1 * 7 - sum2) % 10
  const check2 = (sum1 + sum2 + digits[9]) % 10
  
  return check1 === digits[9] && check2 === digits[10]
}

// Format Turkish phone number for İyzico
export function formatTurkishPhone(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Add country code if missing
  if (cleaned.startsWith('5') && cleaned.length === 10) {
    return '+90' + cleaned
  } else if (cleaned.startsWith('90') && cleaned.length === 12) {
    return '+' + cleaned
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    return '+90' + cleaned.slice(1)
  }
  
  return phone // Return as is if format is unclear
}

// Payment status mapping
export const PaymentStatus = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  INIT_THREEDS: 'init_threeds',
  CALLBACK_THREEDS: 'callback_threeds',
  BKM_POS_SELECTED: 'bkm_pos_selected',
  CALLBACK_PECCO: 'callback_pecco'
} as const

export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus]