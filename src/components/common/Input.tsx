import { ReactNode } from 'react'

interface InputProps {
  label?: string
  icon?: ReactNode
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  error?: string
  className?: string
}

export default function Input({ 
  label, 
  icon, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  error,
  className = ''
}: InputProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-12' : 'px-4'} py-3 rounded-xl border-2 bg-gray-50 focus:bg-white transition-all ${
            error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-orange-400'
          }`}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
