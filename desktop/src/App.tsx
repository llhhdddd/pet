import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/common/Layout'
import Loading from './components/common/Loading'
import ProtectedRoute from './components/common/ProtectedRoute'

const Home = lazy(() => import('./pages/Home'))
const Pet = lazy(() => import('./pages/Pet'))
const TaskWrapper = lazy(() => import('./pages/TaskWrapper'))
const Gold = lazy(() => import('./pages/Gold'))
const Class = lazy(() => import('./pages/Class'))
const Group = lazy(() => import('./pages/Group'))
const Statistics = lazy(() => import('./pages/Statistics'))
const Settings = lazy(() => import('./pages/Settings'))
const Profile = lazy(() => import('./pages/Profile'))
const BugCatch = lazy(() => import('./pages/BugCatch'))
const Login = lazy(() => import('./pages/Login'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="pet" element={<Pet />} />
          <Route path="task" element={<TaskWrapper />} />
          <Route path="gold" element={<Gold />} />
          <Route path="bugcatch" element={<BugCatch />} />
          <Route path="class" element={<Class />} />
          <Route path="group" element={<Group />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
