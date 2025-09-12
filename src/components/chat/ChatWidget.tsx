'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSocket } from '@/hooks/useSocket'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

interface ChatWidgetProps {
  receiverId?: string
  receiverName?: string
  projectId?: string
}

export default function ChatWidget({ receiverId, receiverName, projectId }: ChatWidgetProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { 
    connected, 
    messages, 
    sendMessage, 
    startTyping, 
    stopTyping, 
    typingUsers 
  } = useSocket(session?.user?.id)

  const filteredMessages = messages.filter(msg => 
    (msg.senderId === session?.user?.id && receiverId) ||
    (msg.senderId === receiverId && receiverId) ||
    (!receiverId) // Show all if no specific receiver
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [filteredMessages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !receiverId) return

    sendMessage(message, receiverId, projectId)
    setMessage('')
    stopTyping(receiverId)
  }

  const handleTyping = (value: string) => {
    setMessage(value)
    if (receiverId) {
      if (value.trim()) {
        startTyping(receiverId)
      } else {
        stopTyping(receiverId)
      }
    }
  }

  if (!session?.user) return null

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="sr-only">Sohbeti Aç</span>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-80 h-96 shadow-lg z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {receiverName ? `${receiverName} ile Sohbet` : 'Canlı Destek'}
            </CardTitle>
            <div className="flex items-center space-x-1">
              <Badge variant={connected ? "default" : "destructive"} className="text-xs">
                {connected ? "Çevrimiçi" : "Çevrimdışı"}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="flex-1 flex flex-col p-2 space-y-2">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-2 max-h-60">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderId === session.user.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        msg.senderId === session.user.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {formatDistanceToNow(new Date(msg.timestamp), { 
                          addSuffix: true, 
                          locale: tr 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {receiverId && typingUsers.has(receiverId) && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {receiverId && (
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => handleTyping(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 text-sm"
                    disabled={!connected}
                  />
                  <Button type="submit" size="sm" disabled={!connected || !message.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              )}

              {!receiverId && (
                <div className="text-center text-sm text-gray-500">
                  Sohbet başlatmak için bir müşteri veya proje seçin
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </>
  )
}