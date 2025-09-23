import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'

interface UserContactInfo {
  name: string
  surname: string
  email: string
  phone: string
  city: string
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
    const body: UserContactInfo = await request.json()

    // Validate required fields
    if (!body.name || !body.surname || !body.email || !body.phone || !body.city) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta adresi' },
        { status: 400 }
      )
    }

    // Phone validation (Turkish phone numbers)
    const phoneRegex = /^(\+90|0)?[0-9]{10,11}$/
    const cleanPhone = body.phone.replace(/[\s()-]/g, '')
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Geçersiz telefon numarası' },
        { status: 400 }
      )
    }

    // Prepare email content
    const emailContent = `
      <h2>Yeni Chatbot İletişim Talebi</h2>
      <p><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</p>

      <h3>Kullanıcı Bilgileri:</h3>
      <ul>
        <li><strong>Ad:</strong> ${body.name}</li>
        <li><strong>Soyad:</strong> ${body.surname}</li>
        <li><strong>E-posta:</strong> ${body.email}</li>
        <li><strong>Telefon:</strong> ${body.phone}</li>
        <li><strong>Şehir:</strong> ${body.city}</li>
      </ul>

      <p>Bu kullanıcı chatbot üzerinden iletişime geçti ve bilgilerini paylaştı.</p>
    `

    // Send notification email
    const transporter = createTransporter()
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: 'info@enerjios.com', // Direct email to info@enerjios.com
          cc: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // CC to admin email if configured
          subject: `🔥 Yeni Chatbot İletişim Talebi - ${body.name} ${body.surname}`,
          html: emailContent,
          replyTo: body.email && body.email !== 'Belirtilmedi' ? body.email : undefined
        })
      } catch (emailError) {
        console.error('Email send error:', emailError)
        // Continue even if email fails
      }
    } else {
      console.log('Email not configured, skipping email notification')
    }

    // Save to database
    try {
      await prisma.chatbotContact.create({
        data: {
          name: body.name,
          surname: body.surname,
          email: body.email,
          phone: body.phone,
          city: body.city,
          createdAt: new Date()
        }
      })
    } catch (dbError) {
      console.error('Database save error:', dbError)
      // Continue even if database save fails
    }

    // Log for monitoring
    console.log('New contact received:', {
      name: `${body.name} ${body.surname}`,
      email: body.email,
      phone: body.phone,
      city: body.city,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Bilgileriniz başarıyla kaydedildi'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu, lütfen daha sonra tekrar deneyin' },
      { status: 500 }
    )
  }
}