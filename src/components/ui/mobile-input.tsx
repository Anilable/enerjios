'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { TOUCH_SIZES, mobileClasses } from '@/lib/mobile-utils'

export interface MobileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  clearable?: boolean
  error?: boolean
  fullWidth?: boolean
  touchOptimized?: boolean
}

const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({
    className,
    type,
    icon,
    iconPosition = 'left',
    clearable = false,
    error = false,
    fullWidth = false,
    touchOptimized = true,
    value,
    onChange,
    onClear,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || '')

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value)
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value)
      onChange?.(e)
    }

    const handleClear = () => {
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>

      setInternalValue('')
      onChange?.(syntheticEvent)
      onClear?.()
    }

    const inputClasses = cn(
      // Base styles
      'flex w-full rounded-lg border border-input bg-background px-3 py-3',
      'text-base placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'transition-all duration-200',

      // Touch-optimized styles
      touchOptimized && [
        'min-h-[48px]', // Touch-friendly height
        mobileClasses.touchTarget,
        'touch-manipulation',
        // Prevent zoom on iOS
        'text-[16px] sm:text-sm',
      ],

      // Icon spacing
      icon && iconPosition === 'left' && 'pl-10',
      icon && iconPosition === 'right' && 'pr-10',

      // Clearable spacing
      clearable && 'pr-10',

      // Error styles
      error && 'border-destructive focus-visible:ring-destructive/20',

      // Full width
      fullWidth && 'w-full',

      className
    )

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          type={type}
          className={inputClasses}
          ref={ref}
          value={internalValue}
          onChange={handleChange}
          {...props}
        />

        {/* Right Icon */}
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}

        {/* Clear Button */}
        {clearable && internalValue && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute right-3 top-1/2 transform -translate-y-1/2',
              'p-1 rounded-full hover:bg-accent transition-colors',
              'text-muted-foreground hover:text-foreground',
              mobileClasses.touchTarget,
              'touch-manipulation active:scale-95'
            )}
            aria-label="Temizle"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    )
  }
)
MobileInput.displayName = 'MobileInput'

// Textarea variant
export interface MobileTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  fullWidth?: boolean
  touchOptimized?: boolean
  autoResize?: boolean
}

const MobileTextarea = React.forwardRef<HTMLTextAreaElement, MobileTextareaProps>(
  ({
    className,
    error = false,
    fullWidth = false,
    touchOptimized = true,
    autoResize = false,
    ...props
  }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    React.useImperativeHandle(ref, () => textareaRef.current!)

    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current
        const adjustHeight = () => {
          textarea.style.height = 'auto'
          textarea.style.height = textarea.scrollHeight + 'px'
        }

        textarea.addEventListener('input', adjustHeight)
        adjustHeight() // Initial adjustment

        return () => textarea.removeEventListener('input', adjustHeight)
      }
    }, [autoResize])

    return (
      <textarea
        className={cn(
          // Base styles
          'flex w-full rounded-lg border border-input bg-background px-3 py-3',
          'text-base placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-200 resize-none',

          // Touch-optimized styles
          touchOptimized && [
            'min-h-[96px]', // Touch-friendly height
            'touch-manipulation',
            // Prevent zoom on iOS
            'text-[16px] sm:text-sm',
          ],

          // Error styles
          error && 'border-destructive focus-visible:ring-destructive/20',

          // Full width
          fullWidth && 'w-full',

          className
        )}
        ref={textareaRef}
        {...props}
      />
    )
  }
)
MobileTextarea.displayName = 'MobileTextarea'

// Search Input variant
export interface MobileSearchInputProps extends MobileInputProps {
  onSearch?: (value: string) => void
  loading?: boolean
}

const MobileSearchInput = React.forwardRef<HTMLInputElement, MobileSearchInputProps>(
  ({
    onSearch,
    loading = false,
    placeholder = "Ara...",
    ...props
  }, ref) => {
    const [searchValue, setSearchValue] = React.useState('')

    const handleSearch = React.useCallback((value: string) => {
      onSearch?.(value)
    }, [onSearch])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchValue(value)

      // Debounce search
      const timeoutId = setTimeout(() => {
        handleSearch(value)
      }, 300)

      return () => clearTimeout(timeoutId)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearch(searchValue)
      }
    }

    return (
      <MobileInput
        ref={ref}
        type="search"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        clearable
        icon={
          loading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )
        }
        iconPosition="left"
        {...props}
      />
    )
  }
)
MobileSearchInput.displayName = 'MobileSearchInput'

export { MobileInput, MobileTextarea, MobileSearchInput }