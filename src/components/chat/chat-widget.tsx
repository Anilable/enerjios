'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MessageCircle, X, Send, Paperclip, Image as ImageIcon,
  Smile, MoreVertical, Phone, Video, Minimize2, Maximize2,
  Bot, User, Clock, CheckCheck, Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ChatMessage {
  id: string
  sender: 'user' | 'agent' | 'system' | 'bot'
  senderName: string
  senderAvatar?: string
  message: string
  timestamp: string
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  attachments?: {
    type: 'image' | 'file'
    url: string
    name: string
    size?: number
  }[]
  isTyping?: boolean
}

export interface ChatAgent {
  id: string
  name: string
  avatar?: string
  status: 'online' | 'offline' | 'busy'
  department: string
  rating?: number
}

interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left'
  primaryColor?: string
  userId?: string
  userName?: string
  userEmail?: string
}

export function ChatWidget({
  position = 'bottom-right',
  primaryColor = '#f59e0b',
  userId,
  userName = 'Misafir',
  userEmail
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [agent, setAgent] = useState<ChatAgent | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize chat connection
  useEffect(() => {
    if (isOpen && connectionStatus === 'disconnected') {
      connectToChat()
    }
  }, [isOpen])

  const connectToChat = async () => {
    setConnectionStatus('connecting')
    
    // Simulate connection delay
    setTimeout(() => {
      setConnectionStatus('connected')
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        senderName: 'EnerjiOS Bot',
        message: 'Merhaba! EnerjiOS\'a hoş geldiniz. Size nasıl yardımcı olabilirim?',
        timestamp: new Date().toISOString()
      }
      
      setMessages([welcomeMessage])
      
      // Simulate agent assignment after 2 seconds
      setTimeout(() => {
        const assignedAgent: ChatAgent = {
          id: 'agent-1',
          name: 'Ayşe Yılmaz',
          avatar: '/images/agents/agent1.jpg',
          status: 'online',
          department: 'Satış Destek',
          rating: 4.8
        }
        
        setAgent(assignedAgent)
        
        const agentMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'system',
          senderName: 'Sistem',
          message: `${assignedAgent.name} size yardımcı olmak için bağlandı.`,
          timestamp: new Date().toISOString()
        }
        
        setMessages(prev => [...prev, agentMessage])
      }, 2000)
    }, 1000)
  }

  const sendMessage = () => {
    if (!inputMessage.trim()) return
    
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: userName,
      message: inputMessage,
      timestamp: new Date().toISOString(),
      status: 'sending'
    }
    
    setMessages(prev => [...prev, newMessage])
    setInputMessage('')
    
    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      ))
    }, 500)
    
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
      ))
    }, 1000)
    
    // Simulate agent typing
    setTimeout(() => {
      setIsTyping(true)
    }, 1500)
    
    // Simulate agent response
    setTimeout(() => {
      setIsTyping(false)
      
      const responses = [
        'Elbette, size yardımcı olmaktan mutluluk duyarım. Hangi konuda bilgi almak istersiniz?',
        'Güneş enerjisi sistemlerimiz hakkında detaylı bilgi verebilirim. Konut mu yoksa ticari bir proje mi planlıyorsunuz?',
        'Anladım. Size özel bir teklif hazırlayabilirim. Kurulum yapılacak alanın m² bilgisini paylaşabilir misiniz?',
        'Harika! Hemen sizin için en uygun sistemi hesaplayalım. Aylık ortalama elektrik faturanız ne kadar?'
      ]
      
      const agentResponse: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'agent',
        senderName: agent?.name || 'Destek',
        senderAvatar: agent?.avatar,
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, agentResponse])
      
      // Mark user message as read
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
      ))
    }, 3000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      default:
        return null
    }
  }

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4'

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={`fixed ${positionClasses} z-50`}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
              style={{ backgroundColor: primaryColor }}
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            
            {/* Notification Badge */}
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">
                1
              </span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed ${positionClasses} z-50`}
            style={{
              width: isMinimized ? '320px' : '380px',
              height: isMinimized ? '60px' : '600px'
            }}
          >
            <Card className="w-full h-full flex flex-col shadow-2xl">
              {/* Header */}
              <div 
                className="flex items-center justify-between p-4 border-b rounded-t-lg"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center gap-3 text-white">
                  {agent ? (
                    <>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={agent.avatar} />
                        <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm">{agent.name}</div>
                        <div className="text-xs opacity-90">{agent.department}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-6 h-6" />
                      <div>
                        <div className="font-semibold">EnerjiOS</div>
                        <div className="text-xs opacity-90">
                          {connectionStatus === 'connecting' ? 'Bağlanıyor...' :
                           connectionStatus === 'connected' ? 'Çevrimiçi' : 'Çevrimdışı'}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.sender === 'system' ? (
                            <div className="text-center text-xs text-gray-500 w-full py-2">
                              {message.message}
                            </div>
                          ) : (
                            <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                              {message.sender !== 'user' && (
                                <Avatar className="w-8 h-8">
                                  {message.sender === 'bot' ? (
                                    <AvatarFallback>
                                      <Bot className="w-4 h-4" />
                                    </AvatarFallback>
                                  ) : (
                                    <>
                                      <AvatarImage src={message.senderAvatar} />
                                      <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                                    </>
                                  )}
                                </Avatar>
                              )}
                              
                              <div className={`space-y-1 ${message.sender === 'user' ? 'items-end' : ''}`}>
                                {message.sender !== 'user' && (
                                  <div className="text-xs text-gray-500 px-1">
                                    {message.senderName}
                                  </div>
                                )}
                                
                                <div
                                  className={`rounded-lg px-3 py-2 ${
                                    message.sender === 'user'
                                      ? 'bg-primary text-white'
                                      : 'bg-gray-100 text-gray-900'
                                  }`}
                                >
                                  <div className="text-sm">{message.message}</div>
                                </div>
                                
                                <div className="flex items-center gap-1 px-1">
                                  <span className="text-xs text-gray-400">
                                    {formatTime(message.timestamp)}
                                  </span>
                                  {message.sender === 'user' && getStatusIcon(message.status)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="flex gap-2 max-w-[80%]">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={agent?.avatar} />
                              <AvatarFallback>{agent?.name?.[0] || 'A'}</AvatarFallback>
                            </Avatar>
                            <div className="bg-gray-100 rounded-lg px-3 py-2">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="border-t p-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Paperclip className="w-5 h-5" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </Button>
                      
                      <Input
                        ref={inputRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Mesajınızı yazın..."
                        className="flex-1"
                        disabled={connectionStatus !== 'connected'}
                      />
                      
                      <Button 
                        onClick={sendMessage}
                        size="icon"
                        style={{ backgroundColor: primaryColor }}
                        disabled={!inputMessage.trim() || connectionStatus !== 'connected'}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-400 text-center mt-2">
                      256-bit SSL şifreleme ile korunmaktadır
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}