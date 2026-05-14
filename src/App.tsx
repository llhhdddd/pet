import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import Layout from './components/common/Layout'
import useStore from './store/useStore'

const Home = lazy(() => import('./pages/Home'))
const Pet = lazy(() => import('./pages/Pet'))
const Task = lazy(() => import('./pages/Task'))
const Gold = lazy(() => import('./pages/Gold'))
const BugCatch = lazy(() => import('./pages/BugCatch'))
const Class = lazy(() => import('./pages/Class'))
const Group = lazy(() => import('./pages/Group'))
const Statistics = lazy(() => import('./pages/Statistics'))
const Settings = lazy(() => import('./pages/Settings'))
const Profile = lazy(() => import('./pages/Profile'))
const Login = lazy(() => import('./pages/Login'))
const RoleSelect = lazy(() => import('./pages/RoleSelect'))
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'))
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'))

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'student' | 'teacher' }) {
  const { isAuthenticated, currentRole, token } = useStore()

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && currentRole !== requiredRole) {
    return <Navigate to="/role-select" replace />
  }

  if (!currentRole) {
    return <Navigate to="/role-select" replace />
  }

  return <>{children}</>
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token, currentRole } = useStore()

  if (token && isAuthenticated && currentRole) {
    return <Navigate to="/role-select" replace />
  }

  if (token && isAuthenticated) {
    return <Navigate to="/role-select" replace />
  }

  return <>{children}</>
}

function App() {
  const { checkAuth, token } = useStore()

  useEffect(() => {
    if (token) {
      checkAuth()
    }
  }, [])

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-3xl">🐱</span>
        </div>
        <p className="text-gray-600">加载中...</p>
      </div>
    </div>}>
      <Routes>
        <Route path="/login" element={
          <AuthRoute><Login /></AuthRoute>
        } />
        <Route path="/role-select" element={
          <ProtectedRoute><RoleSelect /></ProtectedRoute>
        } />
        <Route path="/student/dashboard" element={
          <ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>
        } />
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute requiredRole="teacher"><TeacherDashboard /></ProtectedRoute>
        } />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="pet" element={<Pet />} />
          <Route path="task" element={<Task />} />
          <Route path="gold" element={<Gold />} />
          <Route path="bugcatch" element={<BugCatch />} />
          <Route path="class" element={<Class />} />
          <Route path="group" element={<Group />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App