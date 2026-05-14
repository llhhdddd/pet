import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  const hoverStyles = hover ? 'card-hover cursor-pointer' : ''
  
  return (
    <div className={`glass rounded-2xl p-6 shadow-lg ${hoverStyles} ${className}`}>
      {children}
    </div>
  )
}
