import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Button({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  size = 'md',
  className = ''
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-xl transition-all duration-200 btn-press'
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-orange-400 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-200',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    outline: 'border-2 border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }
  
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3',
    lg: 'px-6 py-4 text-lg',
  }
  
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
    >
      {children}
    </button>
  )
}
