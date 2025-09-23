import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/middleware/validation'
import { handleAPIError, AuthenticationError } from '@/lib/errors'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Types
interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
}

interface PasswordChangeResponse {
  message: string
}

interface PasswordChangeErrorResponse {
  error: string
  details?: any
}

// Enhanced password validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gereklidir'),
  newPassword: z.string()
    .min(8, 'Yeni şifre en az 8 karakter olmalıdır')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir'
    )
}).refine(data => data.currentPassword !== data.newPassword, {
  message: "Yeni şifre mevcut şifreden farklı olmalıdır",
  path: ["newPassword"]
})

// Rate limiting: max 3 password change attempts per 15 minutes
const passwordChangeRateLimit = withRateLimit(
  15 * 60 * 1000, // 15 minutes
  3 // max 3 attempts
)

async function changePassword(request: NextRequest): Promise<NextResponse<PasswordChangeResponse | PasswordChangeErrorResponse>> {
  try {
    const user = await requireAuth()
    const body: PasswordChangeRequest = await request.json()
    
    const validatedData = passwordSchema.parse(body)
    
    // Get current user with password
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true }
    })

    // Prevent timing attacks by always performing bcrypt comparison
    const currentPassword = currentUser?.password || '$2a$12$dummy.hash.to.prevent.timing.attacks.with.consistent.length'
    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      currentPassword
    )

    if (!currentUser?.password || !isCurrentPasswordValid) {
      throw new AuthenticationError('Mevcut şifre yanlış')
    }

    // Hash new password with high cost factor
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 12)

    // Update password and log the change in a transaction
    await prisma.$transaction(async (tx) => {
      // Update password
      await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashedNewPassword,
          updatedAt: new Date()
        }
      })

      // Optional: Log password change for audit trail
      // Uncomment if you have an audit log table
      /*
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_CHANGED',
          ipAddress: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          timestamp: new Date()
        }
      })
      */
    })

    return NextResponse.json({
      message: 'Şifre başarıyla değiştirildi'
    })
  } catch (error) {
    console.error('Password update error:', error)
    return handleAPIError(error)
  }
}

export const PUT = passwordChangeRateLimit(changePassword)