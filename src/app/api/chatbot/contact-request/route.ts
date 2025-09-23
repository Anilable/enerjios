import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { NotificationService } from '@/lib/notifications'

interface ContactRequestData {
  message: string
  timestamp: string
  conversationHistory: Array<{
    id: string
    text: string
    sender: 'user' | 'bot'
    timestamp: Date
  }>
}

// Email configuration
const createTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactRequestData = await request.json()

    // Get recent conversation context (last 5 messages)
    const recentMessages = body.conversationHistory.slice(-5)
    const conversationText = recentMessages
      .map(msg => `${msg.sender === 'user' ? 'Kullanıcı' : 'Bot'}: ${msg.text}`)
      .join('\n')

    // Prepare email content
    const emailContent = `
      <h2>🚨 Yeni Chatbot İletişim Talebi</h2>
      <p><strong>Tarih:</strong> ${new Date(body.timestamp).toLocaleString('tr-TR')}</p>

      <h3>İletişim Talebi Mesajı:</h3>
      <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #2563eb; margin: 10px 0;">
        <p><strong>"${body.message}"</strong></p>
      </div>

      <h3>Son Konuşma Geçmişi:</h3>
      <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; margin: 10px 0;">
        <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 12px;">${conversationText}</pre>
      </div>

      <h3>Önerilen Aksiyon:</h3>
      <ul>
        <li>🔥 <strong>Öncelik:</strong> Yüksek - Müşteri aktif olarak iletişim istiyor</li>
        <li>📞 Hemen telefon ile geri dönüş yapın</li>
        <li>⏰ Maksimum 30 dakika içinde arayın</li>
        <li>📧 Alternatif olarak email ile detaylı bilgi gönderin</li>
      </ul>

      <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0;">
        <p><strong>💡 Not:</strong> Bu bir otomatik algılama sistemidir. Müşteri iletişim kurmak istiyor ve hızlı yanıt bekleniyor.</p>
      </div>
    `

    // Send notification email to admin
    const transporter = createTransporter()
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.ADMIN_EMAIL || 'info@enerjios.com',
          subject: `🚨 ACİL: Chatbot İletişim Talebi - ${new Date().toLocaleString('tr-TR')}`,
          html: emailContent
        })
        console.log('Contact request notification email sent successfully')
      } catch (emailError) {
        console.error('Failed to send contact request email:', emailError)
      }
    }

    // Create admin panel notification if user system is available
    try {
      // Get admin users - you might need to adjust this based on your user system
      const adminUserId = process.env.ADMIN_USER_ID
      if (adminUserId) {
        await NotificationService.create({
          title: '🚨 Yeni İletişim Talebi',
          message: `Chatbot üzerinden iletişim talebi: "${body.message.substring(0, 100)}..."`,
          type: 'SYSTEM_ALERT',
          userId: adminUserId,
          actionUrl: '/dashboard/chatbot-contacts'
        })
      }
    } catch (notificationError) {
      console.error('Failed to create admin notification:', notificationError)
    }

    // Log the contact request
    console.log('Contact request detected:', {
      message: body.message,
      timestamp: body.timestamp,
      conversationLength: body.conversationHistory.length
    })

    return NextResponse.json({
      success: true,
      message: 'Contact request notification sent'
    })

  } catch (error) {
    console.error('Contact request notification error:', error)
    return NextResponse.json(
      { error: 'Failed to process contact request' },
      { status: 500 }
    )
  }
}