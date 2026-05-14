import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  onClose?: () => void
}

function Toast({ message, type = 'info', onClose }: ToastProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }

  const Icon = icons[type]

  return (
    <div className={`flex items-center gap-3 ${colors[type]} text-white px-4 py-3 rounded-xl shadow-lg`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1 font-medium">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default Toast
