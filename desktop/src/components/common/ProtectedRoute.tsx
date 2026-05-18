import { Navigate } from 'react-router-dom'
import useStore from '../../store/useStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useStore((s) => s.user)
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default ProtectedRoute
