'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, 
  DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import {
  MessageCircle, Send, Phone, Video, Paperclip, 
  Smile, MoreVertical, X, Minimize2, Maximize2,
  User, Bot, Clock, CheckCheck, AlertCircle,
  Star, ThumbsUp, ThumbsDown, Download
} from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useSession } from 'next-auth/react'

interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'agent' | 'bot'
  timestamp: Date
  status: 'sent' | 'delivered' | 'read'
  attachments?: Array<{
    name: string
    url: string
    type: string
  }>
}

interface ChatSession {
  id: string
  userId: string
  agentId?: string
  status: 'waiting' | 'active' | 'closed'
  priority: 'low' | 'medium' | 'high'
  category: string
  subject: string
  startTime: Date
  endTime?: Date
  rating?: number
  feedback?: string
}

export function ChatSupport() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [chatSession, setChatSession] = useState<ChatSession | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [agentInfo, setAgentInfo] = useState<any>(null)
  const [showRating, setShowRating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !chatSession) {
      initializeChat()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const initializeChat = async () => {
    try {
      // Create new chat session
      const newSession: ChatSession = {
        id: generateId(),
        userId: session?.user?.id || 'anonymous',
        status: 'waiting',
        priority: 'medium',
        category: 'general',
        subject: 'Genel Destek',
        startTime: new Date()
      }
      
      setChatSession(newSession)
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: generateId(),
        content: 'Merhaba! EnerjiOS destek ekibine hoş geldiniz. Size nasıl yardımcı olabilirim?',
        sender: 'bot',
        timestamp: new Date(),
        status: 'delivered'
      }
      
      setMessages([welcomeMessage])
      
      // Simulate agent connection after a delay
      setTimeout(() => {
        connectToAgent()
      }, 3000)
    } catch (error) {
      console.error('Error initializing chat:', error)
    }
  }

  const connectToAgent = () => {
    if (!chatSession) return
    
    setChatSession(prev => prev ? { ...prev, status: 'active', agentId: 'agent-1' } : null)
    
    setAgentInfo({
      name: 'Ayşe Demir',
      title: 'GES Uzmanı',
      avatar: '/images/agents/ayse.jpg',
      status: 'online'
    })
    
    const agentMessage: ChatMessage = {
      id: generateId(),
      content: 'Merhaba! Ben Ayşe, GES uzmanınız. Güneş enerjisi sistemleri hakkında tüm sorularınızı yanıtlamaktan memnuniyet duyarım.',
      sender: 'agent',
      timestamp: new Date(),
      status: 'delivered'
    }
    
    setMessages(prev => [...prev, agentMessage])
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatSession) return
    
    const message: ChatMessage = {
      id: generateId(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    }
    
    setMessages(prev => [...prev, message])
    setNewMessage('')
    
    // Simulate typing indicator
    setIsTyping(true)
    
    // Simulate agent response after a delay
    setTimeout(() => {
      setIsTyping(false)
      
      const responses = [
        'Anladım, bu konuda size yardımcı olabilirim. Biraz daha detay verebilir misiniz?',
        'Bu durum için birkaç farklı seçenek var. Size en uygun olanını bulalım.',
        'Tabii ki! Bu konuda size rehberlik edebilirim.',
        'Güzel bir soru. Bu konuda şu şekilde ilerleyebiliriz...',
        'Bu durum için teknik ekibimizle görüşmem gerekebilir. Biraz bekleyebilir misiniz?'
      ]
      
      const response: ChatMessage = {
        id: generateId(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: agentInfo ? 'agent' : 'bot',
        timestamp: new Date(),
        status: 'delivered'
      }
      
      setMessages(prev => [...prev, response])
    }, 2000 + Math.random() * 2000)
  }

  const endChat = () => {
    if (chatSession) {
      setChatSession(prev => prev ? { ...prev, status: 'closed', endTime: new Date() } : null)
      setShowRating(true)
    }
  }

  const submitRating = (rating: number, feedback?: string) => {
    if (chatSession) {
      setChatSession(prev => prev ? { ...prev, rating, feedback } : null)
      setShowRating(false)
      setIsOpen(false)
      
      // Reset for next session
      setTimeout(() => {
        setMessages([])
        setChatSession(null)
        setAgentInfo(null)
      }, 500)
    }
  }

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.sender === 'user'
    const isBot = message.sender === 'bot'
    
    return (
      <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          ) : isBot ? (
            <div className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          ) : (
            <img
              src={agentInfo?.avatar || '/images/default-avatar.png'}
              alt={agentInfo?.name}
              className="w-8 h-8 rounded-full"
            />
          )}
        </div>
        <div className={`max-w-xs lg:max-w-md ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
          <div
            className={`px-4 py-2 rounded-lg ${
              isUser 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <p className="text-sm">{message.content}</p>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-gray-500">
              {format(message.timestamp, 'HH:mm', { locale: tr })}
            </span>
            {isUser && (
              <div className="text-primary">
                {message.status === 'sent' && <Clock className="w-3 h-3" />}
                {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-500" />}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const TypingIndicator = () => (
    <div className="flex gap-3">
      <div className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center">
        {agentInfo ? (
          <img src={agentInfo.avatar} alt={agentInfo.name} className="w-8 h-8 rounded-full" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>
      <div className="bg-gray-100 rounded-lg px-4 py-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg"
            size="icon"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-2xl border transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5" />
              <div>
                <h4 className="font-medium">Canlı Destek</h4>
                {agentInfo ? (
                  <p className="text-xs opacity-90">
                    {agentInfo.name} - {agentInfo.title}
                  </p>
                ) : chatSession?.status === 'waiting' ? (
                  <p className="text-xs opacity-90">Bağlanıyor...</p>
                ) : (
                  <p className="text-xs opacity-90">Online</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4 h-80">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button size="icon" onClick={sendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                {chatSession?.status === 'active' && (
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Sesli arama için: +90 (212) 123-4567</span>
                    <Button variant="ghost" size="sm" onClick={endChat}>
                      Sohbeti Bitir
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Rating Dialog */}
      <Dialog open={showRating} onOpenChange={setShowRating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Destek Değerlendirmesi</DialogTitle>
            <DialogDescription>
              Aldığınız hizmeti değerlendirmeniz bizim için çok önemli
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Hizmet kalitesini değerlendirin:</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="ghost"
                    size="sm"
                    onClick={() => submitRating(rating)}
                  >
                    <Star className="w-5 h-5 fill-current text-yellow-400" />
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Textarea
                placeholder="Geri bildiriminizi yazabilirsiniz (opsiyonel)"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => submitRating(5, '')}>
                <ThumbsUp className="w-4 h-4 mr-2" />
                Mükemmel
              </Button>
              <Button variant="outline" onClick={() => setShowRating(false)}>
                Atla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}