interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number'
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
}

function Input({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  className = '',
  disabled = false,
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 disabled:opacity-50 ${className}`}
    />
  )
}

export default Input
