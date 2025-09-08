'use client'

import { useToast } from '@/hooks/use-toast'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            max-w-sm w-full px-4 py-3 rounded-lg shadow-lg border
            ${toast.variant === 'destructive' 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : toast.variant === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-white border-gray-200 text-gray-900'
            }
          `}
          onClick={() => dismiss(toast.id)}
        >
          <div className="font-medium">{toast.title}</div>
          {toast.description && (
            <div className="text-sm mt-1 opacity-90">{toast.description}</div>
          )}
        </div>
      ))}
    </div>
  )
}