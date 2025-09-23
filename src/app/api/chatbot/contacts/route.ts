import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Fetch all chatbot contacts from database
    const contacts = await prisma.chatbotContact.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(contacts, { status: 200 })
  } catch (error) {
    console.error('Error fetching chatbot contacts:', error)
    return NextResponse.json(
      { error: 'Kişiler yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID gerekli' },
        { status: 400 }
      )
    }

    await prisma.chatbotContact.delete({
      where: {
        id: id
      }
    })

    return NextResponse.json(
      { message: 'Kişi başarıyla silindi' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting chatbot contact:', error)
    return NextResponse.json(
      { error: 'Kişi silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}