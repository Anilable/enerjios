import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'

interface UserInfoData {
  message: string
  parsedInfo: {
    name: string
    phone: string
    email: string
    city: string
    fullMessage: string
  }
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
    const body: UserInfoData = await request.json()
    const { parsedInfo } = body

    // Get recent conversation context
    const recentMessages = body.conversationHistory.slice(-5)
    const conversationText = recentMessages
      .map(msg => `${msg.sender === 'user' ? 'Kullanıcı' : 'Bot'}: ${msg.text}`)
      .join('\n')

    // Prepare email content
    const emailContent = `
      <h2>✅ Yeni Kullanıcı Bilgileri - Chatbot</h2>
      <p><strong>Tarih:</strong> ${new Date(body.timestamp).toLocaleString('tr-TR')}</p>

      <div style="background-color: #f0f9ff; padding: 20px; border-left: 4px solid #0ea5e9; margin: 15px 0;">
        <h3>📋 Kullanıcı Bilgileri:</h3>
        <ul style="list-style: none; padding: 0;">
          ${parsedInfo.name ? `<li><strong>👤 Ad Soyad:</strong> ${parsedInfo.name}</li>` : ''}
          ${parsedInfo.phone ? `<li><strong>📞 Telefon:</strong> ${parsedInfo.phone}</li>` : ''}
          ${parsedInfo.email ? `<li><strong>📧 E-posta:</strong> ${parsedInfo.email}</li>` : ''}
          ${parsedInfo.city ? `<li><strong>📍 Şehir:</strong> ${parsedInfo.city}</li>` : ''}
        </ul>

        <div style="margin-top: 15px;">
          <strong>💬 Tam Mesaj:</strong>
          <div style="background-color: white; padding: 10px; border-radius: 5px; margin-top: 5px;">
            "${parsedInfo.fullMessage}"
          </div>
        </div>
      </div>

      <h3>🗣️ Son Konuşma Geçmişi:</h3>
      <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; margin: 10px 0;">
        <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 12px;">${conversationText}</pre>
      </div>

      <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0;">
        <h3>🚀 Önerilen Aksiyon:</h3>
        <ul>
          <li>📞 <strong>HEMEN ARA</strong> - Bilgileri verdi, sıcakken ara!</li>
          <li>⏰ Maksimum 2 saat içinde iletişim kur</li>
          <li>💼 GES teklifini hazırla</li>
          <li>📅 Keşif randevusu ayarla</li>
        </ul>

        ${parsedInfo.phone ?
          `<div style="background-color: #22c55e; color: white; padding: 10px; border-radius: 5px; margin-top: 10px; text-align: center;">
            <strong>📞 Direkt Arama Linkı: <a href="tel:${parsedInfo.phone}" style="color: white;">${parsedInfo.phone}</a></strong>
          </div>` : ''}
      </div>
    `

    // Send notification email to admin
    const transporter = createTransporter()
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: 'info@enerjios.com',
          cc: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
          subject: `🔥 SICAK LEAD: ${parsedInfo.name || 'Yeni Kullanıcı'} - ${parsedInfo.city || 'Bilinmeyen Şehir'}`,
          html: emailContent,
          replyTo: parsedInfo.email || undefined
        })
        console.log('User info notification email sent successfully')
      } catch (emailError) {
        console.error('Failed to send user info email:', emailError)
      }
    }

    // Save to database if we have enough info
    if (parsedInfo.name || parsedInfo.phone) {
      try {
        await prisma.chatbotContact.create({
          data: {
            name: parsedInfo.name ? parsedInfo.name.split(' ')[0] : 'Bilinmeyen',
            surname: parsedInfo.name ? parsedInfo.name.split(' ').slice(1).join(' ') : 'Kullanıcı',
            email: parsedInfo.email || 'Belirtilmedi',
            phone: parsedInfo.phone || 'Belirtilmedi',
            city: parsedInfo.city || 'Bilinmeyen',
            createdAt: new Date()
          }
        })
        console.log('User info saved to database')
      } catch (dbError) {
        console.error('Failed to save user info to database:', dbError)
      }
    }

    // Log the user info
    console.log('User info detected:', {
      name: parsedInfo.name,
      phone: parsedInfo.phone,
      city: parsedInfo.city,
      timestamp: body.timestamp
    })

    return NextResponse.json({
      success: true,
      message: 'User info processed successfully',
      parsedInfo
    })

  } catch (error) {
    console.error('User info processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process user info' },
      { status: 500 }
    )
  }
}