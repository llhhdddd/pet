import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Users, Crown, Sparkles } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useStore from '../store/useStore'

function RoleSelect() {
  const navigate = useNavigate()
  const { user, selectRole, rememberedRole, currentRole } = useStore()

  useEffect(() => {
    if (rememberedRole && !currentRole) {
      handleSelectRole(rememberedRole)
    }
  }, [rememberedRole, currentRole])

  const handleSelectRole = (role: 'student' | 'teacher') => {
    selectRole(role)
    navigate(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-4xl animate-scaleIn">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
            <h1 className="text-3xl font-bold text-white text-white-shadow">
              欢迎回来，{user?.username || '用户'}！
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
          </div>
          <p className="text-white/80 text-lg">请选择您要进入的角色端</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            hover
            className={`p-8 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              rememberedRole === 'student' ? 'ring-4 ring-orange-400' : ''
            }`}
            onClick={() => handleSelectRole('student')}
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">学生端</h2>
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-gray-600 mb-6">
              进入学习中心，完成作业、查看成绩、学习资料下载等功能
            </p>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                <span className="text-2xl">📚</span>
                <span className="text-gray-700">课程学习</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                <span className="text-2xl">📝</span>
                <span className="text-gray-700">作业提交</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                <span className="text-2xl">🎮</span>
                <span className="text-gray-700">趣味学习</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                <span className="text-2xl">🐱</span>
                <span className="text-gray-700">宠物养成</span>
              </div>
            </div>
            <Button className="w-full mt-6" size="lg">
              进入学生端
            </Button>
          </Card>

          <Card
            hover
            className={`p-8 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              rememberedRole === 'teacher' ? 'ring-4 ring-blue-400' : ''
            }`}
            onClick={() => handleSelectRole('teacher')}
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
              <Users className="w-12 h-12 text-white" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">教师端</h2>
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-gray-600 mb-6">
              进入教学管理中心，课程管理、作业批改、成绩录入等功能
            </p>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <span className="text-2xl">📖</span>
                <span className="text-gray-700">课程管理</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <span className="text-2xl">✅</span>
                <span className="text-gray-700">作业批改</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <span className="text-2xl">📊</span>
                <span className="text-gray-700">成绩管理</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <span className="text-2xl">👥</span>
                <span className="text-gray-700">学生管理</span>
              </div>
            </div>
            <Button variant="primary" className="w-full mt-6 bg-gradient-to-r from-blue-400 to-indigo-500 hover:shadow-lg hover:shadow-blue-200" size="lg">
              进入教师端
            </Button>
          </Card>
        </div>

        <p className="text-center text-white/60 text-sm mt-8">
          💡 提示：您的选择会被记住，下次登录将直接进入上次选择的角色
        </p>
      </div>
    </div>
  )
}

export default RoleSelect