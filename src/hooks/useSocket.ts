import { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import { initSocket, getSocket, disconnectSocket } from '@/lib/socket'

interface ChatMessage {
  id: string
  message: string
  senderId: string
  timestamp: string
  projectId?: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
}

export const useSocket = (userId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Temporarily disable socket connections for performance optimization
    // const socketInstance = initSocket()
    // setSocket(socketInstance)
    
    setSocket(null)
    setConnected(false)

    // Socket event listeners disabled to prevent polling overhead
    // Will be re-enabled when real-time features are specifically needed

    return () => {
      // disconnectSocket()
    }
  }, [userId])

  const sendMessage = (message: string, receiverId: string, projectId?: string) => {
    if (socket && userId) {
      const messageData = {
        message,
        senderId: userId,
        receiverId,
        projectId,
      }
      socket.emit('send-message', messageData)
      
      // Add to local messages immediately
      const localMessage: ChatMessage = {
        id: Date.now().toString(),
        message,
        senderId: userId,
        timestamp: new Date().toISOString(),
        projectId,
      }
      setMessages(prev => [...prev, localMessage])
    }
  }

  const sendNotification = (targetUserId: string, title: string, message: string, type: Notification['type']) => {
    if (socket) {
      socket.emit('send-notification', {
        userId: targetUserId,
        title,
        message,
        type,
      })
    }
  }

  const startTyping = (receiverId: string) => {
    if (socket && userId) {
      socket.emit('typing-start', { userId, receiverId })
    }
  }

  const stopTyping = (receiverId: string) => {
    if (socket && userId) {
      socket.emit('typing-stop', { userId, receiverId })
    }
  }

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  return {
    socket,
    connected,
    messages,
    notifications,
    typingUsers,
    sendMessage,
    sendNotification,
    startTyping,
    stopTyping,
    markNotificationAsRead,
    clearAllNotifications,
  }
}