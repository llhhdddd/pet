interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-lg p-6 ${hover ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export default Card
