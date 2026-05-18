import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, Cat, ListTodo, Coins, Users, Building2, LogOut, BarChart3, Settings, User, Bug } from 'lucide-react'
import useStore from '../../store/useStore'

const studentNavItems = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'pet', label: '宠物', icon: Cat },
  { id: 'task', label: '任务', icon: ListTodo },
  { id: 'gold', label: '金币', icon: Coins },
  { id: 'bugcatch', label: '捉虫', icon: Bug },
  { id: 'class', label: '班级', icon: Building2 },
  { id: 'group', label: '小组', icon: Users },
  { id: 'profile', label: '个人中心', icon: User },
]

const teacherNavItems = [
  { id: 'class', label: '班级管理', icon: Building2 },
  { id: 'task', label: '任务管理', icon: ListTodo },
  { id: 'statistics', label: '学情分析', icon: BarChart3 },
  { id: 'settings', label: '规则配置', icon: Settings },
  { id: 'profile', label: '个人中心', icon: User },
]

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, currentGroup, goldBalance } = useStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const currentPath = location.pathname === '/' ? 'home' : location.pathname.replace('/', '')
  const navItems = user?.role === 'teacher' ? teacherNavItems : studentNavItems

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 overflow-hidden">
      {/* 侧边栏 */}
      <aside className="w-64 glass-light border-r border-white/40 flex flex-col shadow-xl">
        {/* Logo */}
        <div className="p-6 border-b border-white/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <Cat className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-orange-800">Pet Companion</h1>
              <p className="text-sm text-orange-600">
                {user?.role === 'teacher' ? '👨‍🏫 教师端' : '👨‍🎓 学生端'}
              </p>
            </div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isActive = currentPath === item.id
              return (
                <li key={item.id} className="animate-slideInLeft" style={{ animationDelay: `${index * 50}ms` }}>
                  <button
                    onClick={() => navigate(item.id === 'home' ? '/' : `/${item.id}`)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 btn-press ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-200'
                        : 'text-gray-700 hover:bg-white/60 hover:text-orange-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* 用户信息 */}
        <div className="p-4 border-t border-white/30">
          {user && (
            <div className="flex items-center justify-between animate-slideInLeft" style={{ animationDelay: '350ms' }}>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${
                  user.role === 'teacher'
                    ? 'bg-gradient-to-br from-blue-400 to-indigo-500'
                    : 'bg-gradient-to-br from-orange-400 to-amber-500'
                }`}>
                  {user.username.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user.username}</p>
                  <p className="text-sm text-gray-500">
                    {user.role === 'teacher' ? '教师' : '学生'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                title="退出登录"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        {/* 顶部信息栏 */}
        <header className="glass-light border-b border-white/30 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              {currentGroup && user?.role === 'student' && (
                <div className="flex items-center gap-2">
                  <span className="text-orange-600 text-sm">当前小组：</span>
                  <span className="font-semibold text-orange-800">{currentGroup.name}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {user?.role === 'student' && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 px-5 py-2.5 rounded-full border border-amber-200 shadow-sm">
                  <Coins className="w-5 h-5 text-amber-600" />
                  <span className="font-bold text-amber-700">{goldBalance}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="p-6">
          <div className="page-transition">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

export default Layout
