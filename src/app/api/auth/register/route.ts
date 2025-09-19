import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name, email, password, userType,
      firstName, lastName, phone, city,
      companyName, taxNumber, sector,
      specializations, farmName, farmLocation, farmSize, crops
    } = body

    // Validation
    if (!name || !email || !password || !userType) {
      return NextResponse.json(
        { message: 'Gerekli alanları doldurun' },
        { status: 400 }
      )
    }

    // User type specific validation
    if ((userType === 'kurumsal' || userType === 'ges-firmasi') && (!companyName || !taxNumber)) {
      return NextResponse.json(
        { message: 'Kurumsal hesaplar için firma adı ve vergi numarası gereklidir' },
        { status: 400 }
      )
    }

    if (userType === 'ciftci' && (!farmName || !farmLocation)) {
      return NextResponse.json(
        { message: 'Çiftçi hesabı için çiftlik adı ve lokasyon gereklidir' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      )
    }

    // Check if user already exists (email and phone uniqueness)
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Bu e-posta adresi zaten kullanımda' },
        { status: 400 }
      )
    }

    // Check phone uniqueness (if phone is provided)
    if (phone) {
      const existingPhoneUser = await prisma.user.findFirst({
        where: { phone }
      })

      if (existingPhoneUser) {
        return NextResponse.json(
          { message: 'Bu telefon numarası zaten kayıtlı' },
          { status: 400 }
        )
      }
    }

    // For company registration, check if tax number exists
    if ((userType === 'kurumsal' || userType === 'ges-firmasi') && taxNumber) {
      const existingCompany = await prisma.company.findUnique({
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

    // Map userType to role
    const getUserRole = (userType: string) => {
      switch (userType) {
        case 'bireysel':
          return 'CUSTOMER'
        case 'kurumsal':
          return 'CUSTOMER'
        case 'ges-firmasi':
          return 'COMPANY'
        case 'ciftci':
          return 'FARMER'
        default:
          return 'CUSTOMER'
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: getUserRole(userType) as any,
        status: 'ACTIVE',
        phone
      }
    })

    // Create role-specific profile
    if (userType === 'ges-firmasi') {
      // Create GES company profile
      await prisma.company.create({
        data: {
          userId: user.id,
          name: companyName,
          taxNumber,
          type: 'INSTALLER',
          city: city || '',
          phone: phone || '',
          verified: false
        }
      })
    } else if (userType === 'kurumsal') {
      // Create corporate customer profile
      await prisma.customer.create({
        data: {
          userId: user.id,
          type: 'CORPORATE',
          companyName,
          taxNumber,
          firstName: firstName || name.split(' ')[0] || '',
          lastName: lastName || name.split(' ').slice(1).join(' ') || '',
          city: city || '',
          phone: phone || ''
        }
      })
    } else if (userType === 'bireysel') {
      // Create individual customer profile
      await prisma.customer.create({
        data: {
          userId: user.id,
          type: 'INDIVIDUAL',
          firstName: firstName || name.split(' ')[0] || '',
          lastName: lastName || name.split(' ').slice(1).join(' ') || '',
          city: city || '',
          phone: phone || ''
        }
      })
    } else if (userType === 'ciftci') {
      // Create farmer customer profile
      await prisma.customer.create({
        data: {
          userId: user.id,
          type: 'FARMER',
          firstName: firstName || name.split(' ')[0] || '',
          lastName: lastName || name.split(' ').slice(1).join(' ') || '',
          city: city || '',
          phone: phone || ''
        }
      })

      // Create farmer-specific profile
      await prisma.farmer.create({
        data: {
          userId: user.id,
          farmSize: farmSize ? parseFloat(farmSize) : 0,
          mainCrops: JSON.stringify(crops || []),
          monthlyConsumption: 0
        }
      })
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