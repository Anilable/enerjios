'use client'

import React, { useRef, useImperativeHandle, forwardRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RotateCcw, Check, X } from 'lucide-react'

interface SignaturePadProps {
  onSave?: (signature: string) => void
  onCancel?: () => void
  title?: string
  description?: string
  width?: number
  height?: number
  backgroundColor?: string
  penColor?: string
}

export interface SignaturePadRef {
  clear: () => void
  isEmpty: () => boolean
  getTrimmedCanvas: () => HTMLCanvasElement
  getSignatureData: () => string
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(({
  onSave,
  onCancel,
  title = 'Dijital İmza',
  description = 'Lütfen aşağıdaki alana imzanızı atın',
  width = 500,
  height = 200,
  backgroundColor = '#ffffff',
  penColor = '#000000'
}, ref) => {
  const signatureRef = useRef<SignatureCanvas>(null)

  useImperativeHandle(ref, () => ({
    clear: () => {
      signatureRef.current?.clear()
    },
    isEmpty: () => {
      return signatureRef.current?.isEmpty() ?? true
    },
    getTrimmedCanvas: () => {
      return signatureRef.current?.getTrimmedCanvas() as HTMLCanvasElement
    },
    getSignatureData: () => {
      return signatureRef.current?.toDataURL() ?? ''
    }
  }))

  const handleClear = () => {
    signatureRef.current?.clear()
  }

  const handleSave = () => {
    if (signatureRef.current?.isEmpty()) {
      alert('Lütfen önce imzanızı atın.')
      return
    }
    
    const signatureData = signatureRef.current?.toDataURL()
    if (signatureData && onSave) {
      onSave(signatureData)
    }
  }

  const handleCancel = () => {
    signatureRef.current?.clear()
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Signature Canvas */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                width,
                height,
                className: 'signature-canvas w-full h-full cursor-crosshair',
                style: {
                  touchAction: 'none',
                  minWidth: '100%',
                  minHeight: height + 'px'
                }
              }}
              backgroundColor={backgroundColor}
              penColor={penColor}
              dotSize={1}
              minWidth={0.5}
              maxWidth={2}
              velocityFilterWeight={0.7}
              throttle={16}
            />
          </div>

          {/* Instructions */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              💡 <strong>İpucu:</strong> Fare veya parmağınızla üstteki beyaz alana imzanızı atabilirsiniz
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex items-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Temizle
            </Button>
            
            {onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                İptal
              </Button>
            )}
            
            {onSave && (
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                İmzayı Onayla
              </Button>
            )}
          </div>

          {/* Legal Notice */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>🔒 Güvenlik ve Gizlilik:</strong> Dijital imzanız güvenli olarak şifrelenir ve 
              sadece bu teklif işlemi için kullanılır. İmzanız yasal olarak geçerlidir ve 
              Türkiye Elektronik İmza Yasası kapsamında kabul edilir.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

SignaturePad.displayName = 'SignaturePad'