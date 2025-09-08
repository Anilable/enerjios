'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  quality?: number
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  quality = 85,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Generate blur data URL for placeholder
  const generateBlurDataURL = (w = width || 400, h = height || 300) => {
    if (blurDataURL) return blurDataURL
    
    const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null
    if (!canvas) return undefined
    
    canvas.width = 10
    canvas.height = 10
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined
    
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, 10, 10)
    return canvas.toDataURL()
  }

  if (hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400 text-sm',
          fill ? 'absolute inset-0' : '',
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        Görsel yüklenemedi
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div 
          className={cn(
            'absolute inset-0 bg-gray-100 animate-pulse',
            fill ? 'w-full h-full' : ''
          )}
          style={!fill ? { width, height } : undefined}
        />
      )}
      
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? generateBlurDataURL() : undefined}
        sizes={sizes}
        quality={quality}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  )
}

// Specialized components for common use cases
export function HeroImage({ src, alt, className }: { src: string, alt: string, className?: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      priority
      placeholder="blur"
      sizes="100vw"
      quality={90}
      className={cn('object-cover', className)}
    />
  )
}

export function ProductImage({ src, alt, className }: { src: string, alt: string, className?: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={400}
      height={300}
      placeholder="blur"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={85}
      className={cn('object-cover rounded-lg', className)}
    />
  )
}

export function AvatarImage({ src, alt, size = 40, className }: { 
  src: string, 
  alt: string, 
  size?: number,
  className?: string 
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      placeholder="empty"
      quality={80}
      className={cn('rounded-full object-cover', className)}
    />
  )
}

export function ThumbnailImage({ src, alt, className }: { src: string, alt: string, className?: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={150}
      height={100}
      placeholder="blur"
      sizes="150px"
      quality={75}
      className={cn('object-cover rounded', className)}
    />
  )
}

// Lazy loading image component
export function LazyImage({ src, alt, className, ...props }: OptimizedImageProps) {
  const [inView, setInView] = useState(false)

  return (
    <div 
      className={className}
      ref={(el) => {
        if (el && !inView) {
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                setInView(true)
                observer.disconnect()
              }
            },
            { rootMargin: '100px' }
          )
          observer.observe(el)
        }
      }}
    >
      {inView ? (
        <OptimizedImage src={src} alt={alt} className={className} {...props} />
      ) : (
        <div 
          className={cn('bg-gray-100 animate-pulse', className)}
          style={{ width: props.width, height: props.height }}
        />
      )}
    </div>
  )
}