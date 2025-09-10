'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Download, Bell } from 'lucide-react'

export function PWAInitializer() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
          setServiceWorkerReady(true)

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Show update banner
                  const banner = document.getElementById('update-banner')
                  if (banner) {
                    banner.classList.remove('hidden')
                  }
                }
              })
            }
          })

          // Check for updates every hour
          setInterval(() => {
            registration.update()
          }, 3600000)

          // Set up periodic background sync if supported
          if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            (registration as any).sync?.register('background-sync').catch(console.error)
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'dashboard-update') {
          // Dispatch custom event for dashboard updates
          window.dispatchEvent(new CustomEvent('dashboard-update', { detail: event.data.data }))
        }
      })
    }

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show install prompt after 30 seconds if not installed
      if (!isInstalled) {
        setTimeout(() => {
          setShowInstallPrompt(true)
        }, 30000)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => {
        setShowNotificationPrompt(true)
      }, 60000) // Show after 1 minute
    }

    // Handle app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      console.log('PWA installed')
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [isInstalled])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      
      if (permission === 'granted') {
        console.log('Notification permission granted')
        
        // Subscribe to push notifications
        if (serviceWorkerReady && 'PushManager' in window) {
          try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
              )
            })
            
            // Send subscription to server
            await fetch('/api/notifications/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(subscription)
            })
            
            console.log('Push subscription successful')
          } catch (error) {
            console.error('Push subscription failed:', error)
          }
        }
      }
    }
    
    setShowNotificationPrompt(false)
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    
    return outputArray
  }

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && !isInstalled && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
          <Card className="p-4 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Uygulamayı Yükleyin</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    EnerjiOS'u ana ekranınıza ekleyin ve çevrimdışı kullanın
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={handleInstall}>
                      Yükle
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setShowInstallPrompt(false)}
                    >
                      Daha Sonra
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => setShowInstallPrompt(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Notification Permission Prompt */}
      {showNotificationPrompt && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
          <Card className="p-4 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Bildirimleri Aktif Et</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Proje güncellemeleri ve önemli bildirimler için izin verin
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={handleNotificationPermission}>
                      İzin Ver
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setShowNotificationPrompt(false)}
                    >
                      Hayır
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => setShowNotificationPrompt(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Update Available Banner */}
      <div 
        id="update-banner" 
        className="hidden fixed top-0 left-0 right-0 bg-primary text-white p-2 text-center z-50"
      >
        <span className="text-sm">
          Yeni güncelleme mevcut! 
          <button 
            className="ml-2 underline"
            onClick={() => window.location.reload()}
          >
            Yenile
          </button>
        </span>
      </div>
    </>
  )
}