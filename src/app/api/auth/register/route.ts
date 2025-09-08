import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, companyName, taxNumber, phone, city } = body

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Gerekli alanları doldurun' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Bu e-posta adresi zaten kullanımda' },
        { status: 400 }
      )
    }

    // For company registration, check if tax number exists
    if (role === 'COMPANY' && taxNumber) {
      const existingCompany = await db.company.findUnique({
        where: { taxNumber }
      })

      if (existingCompany) {
        return NextResponse.json(
          { message: 'Bu vergi numarası zaten kayıtlı' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as any,
        status: 'ACTIVE',
        phone
      }
    })

    // Create role-specific profile
    if (role === 'COMPANY') {
      await db.company.create({
        data: {
          userId: user.id,
          name: companyName || name,
          taxNumber: taxNumber || `temp_${Date.now()}`,
          type: 'INSTALLER',
          city: city || '',
          phone: phone || '',
          verified: false
        }
      })
    } else if (role === 'CUSTOMER' || role === 'FARMER') {
      const customerType = role === 'FARMER' ? 'FARMER' : 'INDIVIDUAL'
      const nameParts = name.split(' ')
      
      await db.customer.create({
        data: {
          userId: user.id,
          type: customerType as any,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          city: city || '',
          phone: phone || ''
        }
      })

      // Create farmer profile if needed
      if (role === 'FARMER') {
        await db.farmer.create({
          data: {
            userId: user.id,
            farmSize: 0,
            mainCrops: JSON.stringify([]),
            monthlyConsumption: 0
          }
        })
      }
    }

    return NextResponse.json(
      { 
        message: 'Kayıt başarılı',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Kayıt yapılırken bir hata oluştu' },
      { status: 500 }
    )
  }
}