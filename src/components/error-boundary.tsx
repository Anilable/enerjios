'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="w-full max-w-md mx-auto mt-8">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 text-red-500">
              <AlertTriangle className="w-full h-full" />
            </div>
            <CardTitle className="text-red-600">Bir Hata Oluştu</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Sayfa yüklenirken bir sorun yaşandı. Lütfen tekrar deneyin.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <pre className="text-xs text-left bg-gray-100 p-2 rounded overflow-auto">
                {this.state.error?.stack}
              </pre>
            )}
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sayfayı Yenile
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

export function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 text-red-500">
          <AlertTriangle className="w-full h-full" />
        </div>
        <CardTitle className="text-red-600">Bir Hata Oluştu</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-600">
          Sayfa yüklenirken bir sorun yaşandı.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="text-xs text-left bg-gray-100 p-2 rounded overflow-auto">
            {error.stack}
          </pre>
        )}
        <Button onClick={resetError} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tekrar Dene
        </Button>
      </CardContent>
    </Card>
  )
}