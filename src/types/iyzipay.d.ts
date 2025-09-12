declare module 'iyzipay' {
  export interface IyzipayConfig {
    apiKey: string
    secretKey: string
    uri?: string
  }

  export interface IyzipayResult {
    status: string
    errorCode?: string
    errorMessage?: string
    errorGroup?: string
    locale?: string
    systemTime?: number
    conversationId?: string
    [key: string]: any
  }

  export interface PaymentResult extends IyzipayResult {
    price?: number
    paidPrice?: number
    installment?: number
    currency?: string
    paymentId?: string
    paymentStatus?: string
    fraudStatus?: number
    merchantCommissionRate?: number
    merchantCommissionRateAmount?: number
    iyziCommissionRateAmount?: number
    iyziCommissionFee?: number
    cardType?: string
    cardAssociation?: string
    cardFamily?: string
    binNumber?: string
    basketId?: string
    token?: string
    tokenExpireTime?: string
    paymentPageUrl?: string
    callbackUrl?: string
    phase?: string
  }

  export default class Iyzipay {
    constructor(config: IyzipayConfig)
    
    static LOCALE: {
      TR: string
      EN: string
    }
    
    static CURRENCY: {
      TRY: string
      EUR: string
      USD: string
      GBP: string
      IRR: string
      NOK: string
      RUB: string
      CHF: string
    }
    
    static PAYMENT_CHANNEL: {
      MOBILE: string
      WEB: string
      MOBILE_WEB: string
      MOBILE_IOS: string
      MOBILE_ANDROID: string
      MOBILE_WINDOWS: string
      MOBILE_TABLET: string
      MOBILE_PHONE: string
    }
    
    static PAYMENT_GROUP: {
      PRODUCT: string
      LISTING: string
      SUBSCRIPTION: string
    }
    
    payment: {
      create: (request: any, callback: (err: any, result: any) => void) => void
      retrieve: (request: any, callback: (err: any, result: any) => void) => void
    }
    
    checkoutFormInitialize: {
      create: (request: any, callback: (err: any, result: any) => void) => void
      retrieve: (request: any, callback: (err: any, result: any) => void) => void
    }
    
    threedsInitialize: {
      create: (request: any, callback: (err: any, result: any) => void) => void
    }
    
    threedsPayment: {
      create: (request: any, callback: (err: any, result: any) => void) => void
      retrieve: (request: any, callback: (err: any, result: any) => void) => void
    }
    
    refund: {
      create: (request: any, callback: (err: any, result: any) => void) => void
    }
    
    cancel: {
      create: (request: any, callback: (err: any, result: any) => void) => void
    }
    
    installmentInfo: {
      retrieve: (request: any, callback: (err: any, result: any) => void) => void
    }
  }
}