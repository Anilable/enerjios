import { getServerSession as getNextAuthServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function getServerSession() {
  return getNextAuthServerSession(authOptions)
}