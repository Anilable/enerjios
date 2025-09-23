'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  Loader2
} from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'text' | 'quick-reply' | 'contact-form'
}

interface UserInfo {
  name: string
  surname: string
  email: string
  phone: string
  city: string
}

interface QuickReply {
  id: string
  text: string
  action: string
}

const quickReplies: QuickReply[] = [
  { id: '1', text: 'GES sistemi nedir?', action: 'ges-info' },
  { id: '2', text: 'Fiyat hesaplama', action: 'price-calc' },
  { id: '3', text: 'Kurulum süreci', action: 'installation' },
  { id: '4', text: 'İletişime geç', action: 'contact' }
]

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Merhaba! Ben EnerjiOS asistanıyım. Size nasıl yardımcı olabilirim? 🌞',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [showUserForm, setShowUserForm] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    city: ''
  })
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, showUserForm])

  const sendMessage = async (text: string, isQuickReply = false) => {
    if (!text.trim()) return

    // Prevent sending while form is showing
    if (showUserForm) return

    // Count only user messages (not including the initial bot message)
    const userMessageCount = messages.filter(m => m.sender === 'user').length
    const newUserMessageCount = userMessageCount + 1
    setMessageCount(newUserMessageCount)

    // Check if user needs to provide info (after 8 user messages)
    if (newUserMessageCount === 8 && !localStorage.getItem('userInfoProvided')) {
      // First add the user's message
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])
      setInputValue('')

      // Then show the form request
      setTimeout(() => {
        setShowUserForm(true)
        const infoMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Size daha iyi hizmet verebilmemiz için iletişim bilgilerinizi paylaşır mısınız? Bu sayede size özel teklifler ve detaylı bilgi sunabiliriz.',
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, infoMessage])
        scrollToBottom()
      }, 500)
      return
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          isQuickReply,
          conversationHistory: messages.slice(-5) // Son 5 mesajı gönder
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: 'bot',
          timestamp: new Date(),
          type: data.type || 'text'
        }

        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error('API call failed')
      }
    } catch (error) {
      console.error('Chat error:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Üzgünüm, şu anda bir teknik sorun yaşıyorum. Lütfen daha sonra tekrar deneyin veya doğrudan iletişime geçin.',
        sender: 'bot',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickReply = (reply: QuickReply) => {
    sendMessage(reply.text, true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsFormSubmitting(true)

    try {
      // Email is optional, handle empty email
      const submissionData = {
        ...userInfo,
        email: userInfo.email || 'Belirtilmedi'
      }

      // Send user info to API
      const response = await fetch('/api/user/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      })

      if (response.ok) {
        localStorage.setItem('userInfoProvided', 'true')
        setShowUserForm(false)

        const thankYouMessage: Message = {
          id: Date.now().toString(),
          text: '✅ Teşekkür ederim! Bilgilerinizi aldım. Uzman ekibimiz en kısa sürede sizinle iletişime geçecek. Bu arada GES sistemleri hakkında merak ettiğiniz her şeyi sorabilirsiniz!',
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, thankYouMessage])
      } else {
        throw new Error('Failed to submit user info')
      }
    } catch (error) {
      console.error('Error submitting user info:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: '⚠️ Bilgilerinizi kaydedemedim. Lütfen daha sonra tekrar deneyin veya doğrudan 0850 XXX XX XX numarasından bize ulaşın.',
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      setTimeout(scrollToBottom, 100)
    } finally {
      setIsFormSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999]">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 animate-pulse"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
        {messageCount === 0 && (
          <div className="absolute -top-8 -left-32 bg-white rounded-lg shadow-lg p-2 text-sm">
            <div className="font-semibold">Sorularınız mı var?</div>
            <div className="text-xs text-gray-600">Size yardımcı olabilirim!</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <Card className={`w-[380px] md:w-[450px] shadow-2xl transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[600px]'
      } bg-white flex flex-col`}>
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <CardTitle className="text-sm font-medium">EnerjiOS Asistan</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto min-h-0">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.sender === 'bot' && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        {message.sender === 'user' && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        <div className="text-sm">{message.text}</div>
                      </div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString('tr-TR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">Yazıyor...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick Replies - Sadece ilk mesajdan sonra göster */}
            {messages.length <= 2 && !showUserForm && (
              <div className="p-3 border-t bg-gray-50 flex-shrink-0">
                <div className="text-xs text-gray-600 mb-2">Hızlı sorular:</div>
                <div className="flex flex-wrap gap-1">
                  {quickReplies.map((reply) => (
                    <Badge
                      key={reply.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 text-xs"
                      onClick={() => handleQuickReply(reply)}
                    >
                      {reply.text}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* User Info Form */}
            {showUserForm && (
              <div className="p-4 border-t bg-blue-50 flex-shrink-0">
                <form onSubmit={handleUserInfoSubmit} className="space-y-2">
                  <div className="text-sm font-semibold mb-2 text-blue-900">📞 Size Ulaşalım</div>
                  <p className="text-xs text-gray-600 mb-3">Uzmanlarımız size özel çözümler sunmak için iletişime geçecek.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Adınız *"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                      required
                      className="text-sm"
                    />
                    <Input
                      placeholder="Soyadınız *"
                      value={userInfo.surname}
                      onChange={(e) => setUserInfo({...userInfo, surname: e.target.value})}
                      required
                      className="text-sm"
                    />
                  </div>
                  <Input
                    type="tel"
                    placeholder="Telefon Numaranız * (5XX XXX XX XX)"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                    required
                    className="text-sm"
                    pattern="[0-9]{10,11}"
                  />
                  <Input
                    type="email"
                    placeholder="E-posta Adresiniz (isteğe bağlı)"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Hangi şehirdesiniz? *"
                    value={userInfo.city}
                    onChange={(e) => setUserInfo({...userInfo, city: e.target.value})}
                    required
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isFormSubmitting}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isFormSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        '✅ Bilgilerimi Gönder'
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowUserForm(false)
                        localStorage.setItem('userInfoProvided', 'skip')
                        // Continue conversation message
                        const continueMessage: Message = {
                          id: Date.now().toString(),
                          text: 'Anlıyorum, şimdilik bilgi vermek istemiyorsunuz. Size nasıl yardımcı olabilirim?',
                          sender: 'bot',
                          timestamp: new Date()
                        }
                        setMessages(prev => [...prev, continueMessage])
                        setTimeout(scrollToBottom, 100)
                      }}
                      className="flex-1"
                    >
                      Şimdi Değil
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">* Zorunlu alanlar</p>
                </form>
              </div>
            )}

            {/* Input Area - Her zaman görünür */}
            {!showUserForm && (
              <div className="p-4 border-t bg-white flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}