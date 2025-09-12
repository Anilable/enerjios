export interface SMSConfig {
  provider: 'netgsm' | 'iletimerkezi' | 'mutlucell' | 'vatansms'
  apiKey: string
  apiSecret?: string
  senderName: string
  endpoint: string
}

export interface SMSMessage {
  to: string // Phone number with country code
  message: string
  unicode?: boolean // For Turkish characters
  scheduledAt?: Date
}

export interface SMSResponse {
  success: boolean
  messageId?: string
  cost?: number
  credits?: number
  error?: string
  deliveryStatus?: 'pending' | 'delivered' | 'failed'
}

export interface SMSDeliveryReport {
  messageId: string
  phoneNumber: string
  status: 'pending' | 'delivered' | 'failed' | 'expired'
  deliveredAt?: Date
  errorCode?: string
  errorMessage?: string
}

class SMSService {
  private config: SMSConfig
  private rateLimiter: Map<string, { count: number; resetTime: number }> = new Map()

  constructor(config: SMSConfig) {
    this.config = config
  }

  public async send(message: SMSMessage): Promise<SMSResponse> {
    try {
      // Rate limiting check
      if (!this.checkRateLimit(message.to)) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please wait before sending another SMS.'
        }
      }

      // Validate phone number
      const validatedPhone = this.validateAndFormatPhone(message.to)
      if (!validatedPhone) {
        return {
          success: false,
          error: 'Invalid phone number format'
        }
      }

      // Send based on provider
      switch (this.config.provider) {
        case 'netgsm':
          return await this.sendNetGSM({ ...message, to: validatedPhone })
        case 'iletimerkezi':
          return await this.sendIletiMerkezi({ ...message, to: validatedPhone })
        case 'mutlucell':
          return await this.sendMutluCell({ ...message, to: validatedPhone })
        case 'vatansms':
          return await this.sendVatanSMS({ ...message, to: validatedPhone })
        default:
          return {
            success: false,
            error: 'Unsupported SMS provider'
          }
      }
    } catch (error) {
      console.error('SMS send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown SMS error'
      }
    }
  }

  public async sendBulk(messages: SMSMessage[]): Promise<SMSResponse[]> {
    const results: SMSResponse[] = []
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 50
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize)
      
      const batchPromises = batch.map(message => this.send(message))
      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          results.push({
            success: false,
            error: 'Failed to send SMS in batch'
          })
        }
      })
      
      // Small delay between batches
      if (i + batchSize < messages.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return results
  }

  public async getDeliveryReport(messageId: string): Promise<SMSDeliveryReport | null> {
    try {
      switch (this.config.provider) {
        case 'netgsm':
          return await this.getNetGSMDeliveryReport(messageId)
        case 'iletimerkezi':
          return await this.getIletiMerkeziDeliveryReport(messageId)
        // Add other providers as needed
        default:
          return null
      }
    } catch (error) {
      console.error('Failed to get delivery report:', error)
      return null
    }
  }

  public async getAccountInfo(): Promise<{
    credits: number
    balance: number
    currency: string
  } | null> {
    try {
      switch (this.config.provider) {
        case 'netgsm':
          return await this.getNetGSMAccountInfo()
        case 'iletimerkezi':
          return await this.getIletiMerkeziAccountInfo()
        default:
          return null
      }
    } catch (error) {
      console.error('Failed to get account info:', error)
      return null
    }
  }

  private validateAndFormatPhone(phone: string): string | null {
    // Remove all non-digit characters
    let cleanPhone = phone.replace(/\D/g, '')
    
    // Handle different Turkish phone formats
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '90' + cleanPhone.slice(1) // Convert 05XX to 905XX
    } else if (!cleanPhone.startsWith('90')) {
      if (cleanPhone.length === 10) {
        cleanPhone = '90' + cleanPhone // Add country code
      }
    }
    
    // Validate Turkish mobile format (90 5XX XXX XX XX)
    if (/^905\d{9}$/.test(cleanPhone)) {
      return cleanPhone
    }
    
    return null
  }

  private checkRateLimit(phone: string): boolean {
    const now = Date.now()
    const key = phone
    const limit = this.rateLimiter.get(key)
    
    if (!limit) {
      this.rateLimiter.set(key, { count: 1, resetTime: now + 60000 }) // 1 minute
      return true
    }
    
    if (now > limit.resetTime) {
      this.rateLimiter.set(key, { count: 1, resetTime: now + 60000 })
      return true
    }
    
    if (limit.count >= 5) { // Max 5 SMS per minute per number
      return false
    }
    
    limit.count++
    return true
  }

  // NetGSM Integration
  private async sendNetGSM(message: SMSMessage): Promise<SMSResponse> {
    const params = new URLSearchParams({
      usercode: this.config.apiKey,
      password: this.config.apiSecret || '',
      gsmno: message.to,
      message: message.message,
      msgheader: this.config.senderName,
      unicode: message.unicode ? '1' : '0',
      dil: 'TR'
    })

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    })

    const result = await response.text()
    
    // NetGSM returns space-separated values: jobID msgID credits
    if (result.includes('00')) {
      const parts = result.trim().split(' ')
      return {
        success: true,
        messageId: parts[0],
        credits: parseInt(parts[2]) || 0
      }
    } else {
      return {
        success: false,
        error: this.getNetGSMErrorMessage(result)
      }
    }
  }

  private getNetGSMErrorMessage(code: string): string {
    const errorCodes: Record<string, string> = {
      '20': 'Mesaj metninde karakter hatası',
      '30': 'Geçersiz kullanıcı adı/şifre',
      '40': 'Mesaj başlığı onaylı değil',
      '50': 'Yetersiz kredi',
      '60': 'Geçersiz GSM numarası',
      '70': 'Mesaj gönderim hatası'
    }
    
    return errorCodes[code] || `NetGSM error: ${code}`
  }

  // İleti Merkezi Integration
  private async sendIletiMerkezi(message: SMSMessage): Promise<SMSResponse> {
    const payload = {
      username: this.config.apiKey,
      password: this.config.apiSecret,
      text: message.message,
      receipents: [message.to],
      sender: this.config.senderName,
      send_date: message.scheduledAt ? message.scheduledAt.toISOString() : undefined
    }

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()
    
    if (result.status === 'success') {
      return {
        success: true,
        messageId: result.id?.toString(),
        cost: result.cost
      }
    } else {
      return {
        success: false,
        error: result.message || 'İleti Merkezi error'
      }
    }
  }

  // MutluCell Integration
  private async sendMutluCell(message: SMSMessage): Promise<SMSResponse> {
    const params = new URLSearchParams({
      username: this.config.apiKey,
      password: this.config.apiSecret || '',
      number: message.to,
      message: message.message,
      title: this.config.senderName
    })

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    })

    const result = await response.text()
    
    if (result.startsWith('OK')) {
      return {
        success: true,
        messageId: result.split(':')[1]?.trim()
      }
    } else {
      return {
        success: false,
        error: `MutluCell error: ${result}`
      }
    }
  }

  // VatanSMS Integration
  private async sendVatanSMS(message: SMSMessage): Promise<SMSResponse> {
    const payload = {
      api_id: this.config.apiKey,
      api_key: this.config.apiSecret,
      sender: this.config.senderName,
      message_type: 'turkce',
      message: message.message,
      message_content_type: 'bilgi',
      recipients: [message.to]
    }

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()
    
    if (result.status === true) {
      return {
        success: true,
        messageId: result.order_id?.toString()
      }
    } else {
      return {
        success: false,
        error: result.message || 'VatanSMS error'
      }
    }
  }

  // Delivery report methods
  private async getNetGSMDeliveryReport(messageId: string): Promise<SMSDeliveryReport | null> {
    const params = new URLSearchParams({
      usercode: this.config.apiKey,
      password: this.config.apiSecret || '',
      bulkid: messageId,
      type: '1'
    })

    const response = await fetch('https://api.netgsm.com.tr/sms/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    })

    const result = await response.text()
    
    // Parse NetGSM delivery report format
    const lines = result.trim().split('\n')
    if (lines.length > 1) {
      const parts = lines[1].split(' ')
      return {
        messageId,
        phoneNumber: parts[0] || '',
        status: this.parseNetGSMStatus(parts[1]),
        deliveredAt: parts[2] ? new Date(parts[2]) : undefined
      }
    }
    
    return null
  }

  private parseNetGSMStatus(code: string): 'pending' | 'delivered' | 'failed' | 'expired' {
    switch (code) {
      case '1': return 'delivered'
      case '2': return 'failed'
      case '3': return 'pending'
      default: return 'expired'
    }
  }

  private async getIletiMerkeziDeliveryReport(messageId: string): Promise<SMSDeliveryReport | null> {
    const params = new URLSearchParams({
      username: this.config.apiKey,
      password: this.config.apiSecret || '',
      packet_id: messageId
    })

    const response = await fetch('https://api.iletimerkezi.com/v1/get-report', {
      method: 'POST',
      body: params
    })

    const result = await response.json()
    
    if (result.status === 'success' && result.reports?.[0]) {
      const report = result.reports[0]
      return {
        messageId,
        phoneNumber: report.number,
        status: report.status === 'delivered' ? 'delivered' : 'failed',
        deliveredAt: report.delivered_at ? new Date(report.delivered_at) : undefined
      }
    }
    
    return null
  }

  // Account info methods
  private async getNetGSMAccountInfo(): Promise<{ credits: number; balance: number; currency: string } | null> {
    const params = new URLSearchParams({
      usercode: this.config.apiKey,
      password: this.config.apiSecret || '',
      stip: '1' // Get credit info
    })

    const response = await fetch('https://api.netgsm.com.tr/balance/list/get', {
      method: 'POST',
      body: params
    })

    const result = await response.text()
    
    if (result && !result.includes('HATA')) {
      const credits = parseFloat(result.trim())
      return {
        credits,
        balance: credits,
        currency: 'TL'
      }
    }
    
    return null
  }

  private async getIletiMerkeziAccountInfo(): Promise<{ credits: number; balance: number; currency: string } | null> {
    const params = new URLSearchParams({
      username: this.config.apiKey,
      password: this.config.apiSecret || ''
    })

    const response = await fetch('https://api.iletimerkezi.com/v1/get-balance', {
      method: 'POST',
      body: params
    })

    const result = await response.json()
    
    if (result.status === 'success') {
      return {
        credits: result.balance?.amount || 0,
        balance: result.balance?.amount || 0,
        currency: result.balance?.currency || 'TL'
      }
    }
    
    return null
  }
}

// Pre-configured SMS services for different providers
export const createNetGSMService = (apiKey: string, apiSecret: string, senderName: string) => {
  return new SMSService({
    provider: 'netgsm',
    apiKey,
    apiSecret,
    senderName,
    endpoint: 'https://api.netgsm.com.tr/sms/send/get'
  })
}

export const createIletiMerkeziService = (username: string, password: string, senderName: string) => {
  return new SMSService({
    provider: 'iletimerkezi',
    apiKey: username,
    apiSecret: password,
    senderName,
    endpoint: 'https://api.iletimerkezi.com/v1/send-sms'
  })
}

export const createMutluCellService = (username: string, password: string, senderName: string) => {
  return new SMSService({
    provider: 'mutlucell',
    apiKey: username,
    apiSecret: password,
    senderName,
    endpoint: 'https://smsgw.mutlucell.com/smsgw/sendsms.php'
  })
}

export const createVatanSMSService = (apiId: string, apiKey: string, senderName: string) => {
  return new SMSService({
    provider: 'vatansms',
    apiKey: apiId,
    apiSecret: apiKey,
    senderName,
    endpoint: 'https://api.vatansms.net/api/v1/1toN'
  })
}

// Default SMS service instance (can be configured via environment variables)
export const defaultSMSService = createNetGSMService(
  process.env.NETGSM_API_KEY || '',
  process.env.NETGSM_API_SECRET || '',
  process.env.SMS_SENDER_NAME || 'TrakyaSolar'
)

export { SMSService }
export default SMSService