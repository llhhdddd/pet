import React from 'react'

interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number' | 'tel'
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
  label?: string
  icon?: React.ReactNode
  error?: string
}

function Input({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  className = '',
  disabled = false,
  label,
  icon,
  error,
}: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 disabled:opacity-50 ${icon ? 'pl-12' : ''}`}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input