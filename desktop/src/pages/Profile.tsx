import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Edit2, 
  Save, 
  Trash2, 
  LogOut, 
  AlertTriangle,
  CheckCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  X
} from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useStore from '../store/useStore'
import { authApi } from '../services/api'

type TabType = 'profile' | 'security' | 'danger'

function Profile() {
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [message, setMessage] = useState({ type: 'success' | 'error', text: '' })
  
  // Profile form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
  })
  
  // Security form state
  const [securityData, setSecurityData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  const { user, logout, clearAllData, setUser } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        phone: user.phone || '',
      })
    }
  }, [user])

  useEffect(() => {
    const password = securityData.newPassword
    let strength = 0
    if (password.length >= 8) strength += 1
    if (password.length >= 12) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1
    setPasswordStrength(Math.min(strength, 4))
  }, [securityData.newPassword])

  const handleSaveProfile = async () => {
    if (!formData.username || !formData.email) {
      setMessage({ type: 'error', text: '请填写必填字段' })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage({ type: 'error', text: '请输入有效的邮箱地址' })
      return
    }

    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      setMessage({ type: 'error', text: '请输入有效的手机号码' })
      return
    }

    try {
      await authApi.updateProfile(formData)
      setUser({
        ...user!,
        ...formData,
      })
      setIsEditing(false)
      setMessage({ type: 'success', text: '资料更新成功' })
    } catch (err) {
      setMessage({ type: 'error', text: '更新失败，请稍后重试' })
    }
    setTimeout(() => setMessage({ type: 'success', text: '' }), 3000)
  }

  const handleChangePassword = async () => {
    if (!securityData.oldPassword || !securityData.newPassword || !securityData.confirmPassword) {
      setMessage({ type: 'error', text: '请填写所有密码字段' })
      return
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      setMessage({ type: 'error', text: '新密码和确认密码不一致' })
      return
    }

    if (passwordStrength < 2) {
      setMessage({ type: 'error', text: '密码强度不足，请使用更复杂的密码' })
      return
    }

    setMessage({ type: 'success', text: '密码修改成功' })
    setSecurityData({ oldPassword: '', newPassword: '', confirmPassword: '' })
    setTimeout(() => setMessage({ type: 'success', text: '' }), 3000)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleDeleteAccount = async () => {
    try {
      await authApi.deleteAccount()
      clearAllData()
      navigate('/login')
    } catch (err) {
      setMessage({ type: 'error', text: '注销失败，请稍后重试' })
      setShowDeleteConfirm(false)
      setTimeout(() => setMessage({ type: 'success', text: '' }), 3000)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-orange-600">请先登录</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-orange-800">个人中心</h1>
          <p className="text-orange-500 mt-1">管理您的账户信息和安全设置</p>
        </div>
        <Button onClick={handleLogout} variant="outline" className="gap-2">
          <LogOut className="w-4 h-4" />
          退出登录
        </Button>
      </div>

      {/* 消息提示 */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-600 border border-green-200' 
            : 'bg-red-100 text-red-600 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* 标签页切换 */}
      <div className="flex bg-white/80 backdrop-blur-lg rounded-xl p-1 shadow-lg">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md'
              : 'text-orange-600 hover:text-orange-800'
          }`}
        >
          <User className="w-4 h-4" />
          个人资料
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'security'
              ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md'
              : 'text-orange-600 hover:text-orange-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          安全设置
        </button>
        <button
          onClick={() => setActiveTab('danger')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'danger'
              ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-md'
              : 'text-orange-600 hover:text-orange-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          危险操作
        </button>
      </div>

      {/* 内容区域 */}
      <div className="space-y-4">
        {/* 个人资料 */}
        {activeTab === 'profile' && (
          <Card className="shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-orange-800">基本信息</h2>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                  <Edit2 className="w-4 h-4" />
                  编辑
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} className="gap-2">
                    <Save className="w-4 h-4" />
                    保存
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline">
                    取消
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* 用户头像 */}
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg ${
                  user.role === 'teacher'
                    ? 'bg-gradient-to-br from-blue-400 to-indigo-500'
                    : 'bg-gradient-to-br from-orange-400 to-amber-500'
                }`}>
                  {user.username.charAt(0)}
                </div>
                <div>
                  <p className="text-orange-800 font-bold text-lg">{user.username}</p>
                  <p className="text-orange-500 text-sm">{user.role === 'teacher' ? '👨‍🏫 教师' : '👨‍🎓 学生'}</p>
                </div>
              </div>

              {/* 用户名 */}
              <div>
                <label className="block text-orange-700 text-sm font-medium mb-2">用户名</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 pl-12 rounded-xl transition-all duration-200 ${
                      isEditing
                        ? 'bg-orange-50 border border-orange-200 text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-400'
                        : 'bg-gray-100 text-gray-600 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {/* 邮箱 */}
              <div>
                <label className="block text-orange-700 text-sm font-medium mb-2">邮箱 *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 pl-12 rounded-xl transition-all duration-200 ${
                      isEditing
                        ? 'bg-orange-50 border border-orange-200 text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-400'
                        : 'bg-gray-100 text-gray-600 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {/* 手机号 */}
              <div>
                <label className="block text-orange-700 text-sm font-medium mb-2">手机号</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="请输入手机号"
                    className={`w-full px-4 py-3 pl-12 rounded-xl transition-all duration-200 ${
                      isEditing
                        ? 'bg-orange-50 border border-orange-200 text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-400'
                        : 'bg-gray-100 text-gray-600 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 安全设置 */}
        {activeTab === 'security' && (
          <Card className="shadow-lg">
            <h2 className="text-lg font-semibold text-orange-800 mb-6">修改密码</h2>
            
            <div className="space-y-4">
              {/* 旧密码 */}
              <div>
                <label className="block text-orange-700 text-sm font-medium mb-2">旧密码 *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={securityData.oldPassword}
                    onChange={(e) => setSecurityData({ ...securityData, oldPassword: e.target.value })}
                    placeholder="请输入旧密码"
                    className="w-full px-4 py-3 pl-12 pr-12 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600"
                  >
                    {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* 新密码 */}
              <div>
                <label className="block text-orange-700 text-sm font-medium mb-2">新密码 *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                    placeholder="请输入新密码"
                    className="w-full px-4 py-3 pl-12 pr-12 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* 密码强度指示 */}
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-orange-500">密码强度</span>
                    <span className={`text-sm font-medium ${
                      passwordStrength <= 1 ? 'text-red-500' :
                      passwordStrength <= 2 ? 'text-yellow-500' :
                      passwordStrength <= 3 ? 'text-blue-500' : 'text-green-500'
                    }`}>
                      {passwordStrength <= 1 ? '弱' : passwordStrength <= 2 ? '一般' : passwordStrength <= 3 ? '强' : '非常强'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength
                            ? level <= 1 ? 'bg-red-400' : level <= 2 ? 'bg-yellow-400' : level <= 3 ? 'bg-blue-400' : 'bg-green-400'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* 确认密码 */}
              <div>
                <label className="block text-orange-700 text-sm font-medium mb-2">确认新密码 *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                    placeholder="请再次输入新密码"
                    className="w-full px-4 py-3 pl-12 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              <Button onClick={handleChangePassword} className="w-full">
                修改密码
              </Button>
            </div>
          </Card>
        )}

        {/* 危险操作 */}
        {activeTab === 'danger' && (
          <Card className="shadow-lg border-red-200 bg-red-50/50">
            <h2 className="text-lg font-semibold text-red-700 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              危险操作
            </h2>
            
            <div className="space-y-4">
              {/* 注销账号 */}
              <div className="p-4 bg-red-100 rounded-xl border border-red-200">
                <div className="flex items-start gap-3">
                  <Trash2 className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-red-700 mb-1">注销账号</h3>
                    <p className="text-sm text-red-600">
                      注销后将永久删除您的所有数据，包括学习记录、宠物信息、金币余额等。此操作不可撤销，请谨慎操作。
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setShowDeleteConfirm(true)} 
                  variant="danger" 
                  className="mt-4 w-full"
                >
                  注销账号
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* 注销确认弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-fadeIn">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-red-700 mb-2">确认注销账号？</h3>
              <p className="text-orange-600 mb-6">
                此操作将永久删除您的所有数据，包括学习记录、宠物信息、金币余额等。此操作不可撤销！
              </p>
              
              <div className="flex gap-3">
                <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" className="flex-1">
                  取消
                </Button>
                <Button onClick={handleDeleteAccount} variant="danger" className="flex-1">
                  确认注销
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
