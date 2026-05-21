import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/common/Layout'
import Loading from './components/common/Loading'
import ProtectedRoute from './components/common/ProtectedRoute'
import useStore from './store/useStore'

const DesktopPet = lazy(() => import('./components/pet/DesktopPet'))

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
  const petWindowVisible = useStore((s) => s.petWindowVisible)
  const isTauri = '__TAURI_INTERNALS__' in window

  // 启动时恢复桌面宠物窗口（Tauri模式下）
  useEffect(() => {
    if (isTauri && petWindowVisible) {
      import('@tauri-apps/api/webviewWindow').then(async ({ WebviewWindow }) => {
        try {
          const petWin = await WebviewWindow.getByLabel('pet')
          if (petWin) { await petWin.show(); await petWin.setFocus() }
        } catch { /* ignore */ }
      })
    }
  }, []) // 仅在挂载时执行一次

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

      {/* 浏览器模式下的桌面宠物浮层（Tauri 下使用独立窗口） */}
      {petWindowVisible && !isTauri && (
        <Suspense fallback={null}>
          <div style={{
            position: 'fixed', bottom: 20, right: 20, width: 200, height: 220, zIndex: 9999,
          }}>
            <DesktopPet />
          </div>
        </Suspense>
      )}
    </Suspense>
  )
}

export default App
