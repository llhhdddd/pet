import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Book, FileText, BarChart2, Download, Calendar, Bell, ChevronRight,
  GraduationCap, Clock, Star, Trophy, Users, Mail, CheckCircle
} from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useStore from '../store/useStore'

interface Course {
  id: number
  name: string
  teacher: string
  progress: number
  schedule: string
  color: string
}

interface Assignment {
  id: number
  title: string
  course: string
  dueDate: string
  status: 'pending' | 'submitted' | 'graded'
  grade?: number
}

interface Grade {
  course: string
  grade: number
  rank: number
  trend: 'up' | 'down' | 'stable'
}

function StudentDashboard() {
  const navigate = useNavigate()
  const { user, currentPet, goldBalance, logout, selectRole } = useStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'assignments' | 'grades'>('overview')

  const courses: Course[] = [
    { id: 1, name: '高等数学', teacher: '张教授', progress: 68, schedule: '周一/周三 10:00', color: 'from-red-400 to-orange-500' },
    { id: 2, name: '大学英语', teacher: '李老师', progress: 85, schedule: '周二/周四 14:00', color: 'from-blue-400 to-indigo-500' },
    { id: 3, name: '计算机基础', teacher: '王老师', progress: 92, schedule: '周五 16:00', color: 'from-green-400 to-emerald-500' },
    { id: 4, name: '体育与健康', teacher: '刘老师', progress: 100, schedule: '周三 08:00', color: 'from-yellow-400 to-amber-500' },
  ]

  const assignments: Assignment[] = [
    { id: 1, title: '数学作业第三章', course: '高等数学', dueDate: '2024-01-15', status: 'pending' },
    { id: 2, title: '英语阅读报告', course: '大学英语', dueDate: '2024-01-12', status: 'submitted' },
    { id: 3, title: '编程实践项目', course: '计算机基础', dueDate: '2024-01-10', status: 'graded', grade: 95 },
    { id: 4, title: '体育测试', course: '体育与健康', dueDate: '2024-01-08', status: 'graded', grade: 88 },
  ]

  const grades: Grade[] = [
    { course: '高等数学', grade: 92, rank: 5, trend: 'up' },
    { course: '大学英语', grade: 88, rank: 12, trend: 'stable' },
    { course: '计算机基础', grade: 95, rank: 3, trend: 'up' },
    { course: '体育与健康', grade: 85, rank: 8, trend: 'down' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSwitchRole = () => {
    navigate('/role-select')
  }

  const getStatusBadge = (status: Assignment['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      submitted: 'bg-blue-100 text-blue-700',
      graded: 'bg-green-100 text-green-700',
    }
    const labels = { pending: '待提交', submitted: '已提交', graded: '已评分' }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-400 to-amber-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">进行中课程</p>
              <p className="text-3xl font-bold">4</p>
            </div>
            <Book className="w-10 h-10 text-white/60" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">待提交作业</p>
              <p className="text-3xl font-bold">{assignments.filter(a => a.status === 'pending').length}</p>
            </div>
            <FileText className="w-10 h-10 text-white/60" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-400 to-emerald-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">金币余额</p>
              <p className="text-3xl font-bold">{goldBalance}</p>
            </div>
            <Trophy className="w-10 h-10 text-white/60" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">平均成绩</p>
              <p className="text-3xl font-bold">90</p>
            </div>
            <Star className="w-10 h-10 text-white/60" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              进行中课程
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('courses')}>
              查看全部 <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {courses.slice(0, 3).map(course => (
              <div key={course.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center`}>
                  <Book className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{course.name}</p>
                  <p className="text-sm text-gray-500">{course.teacher}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-orange-500">{course.progress}%</p>
                  <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              最新作业
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('assignments')}>
              查看全部 <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {assignments.slice(0, 3).map(assignment => (
              <div key={assignment.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  assignment.status === 'pending' ? 'bg-yellow-100' :
                  assignment.status === 'submitted' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {assignment.status === 'graded' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <FileText className={`w-5 h-5 ${
                      assignment.status === 'pending' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{assignment.title}</p>
                  <p className="text-sm text-gray-500">{assignment.course} · {assignment.dueDate}</p>
                </div>
                {getStatusBadge(assignment.status)}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-purple-500" />
          我的宠物
        </h3>
        <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
            🐱
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-800 text-lg">{currentPet?.name || '小橘'}</p>
            <p className="text-sm text-gray-600">等级 {currentPet?.level || 1} · 成长值 {currentPet?.growth || 0}</p>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1">
                <span className="text-red-400">❤️</span>
                <span className="text-sm text-gray-600">{currentPet?.health || 100}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-orange-400">🍖</span>
                <span className="text-sm text-gray-600">{currentPet?.hunger || 80}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">⭐</span>
                <span className="text-sm text-gray-600">{currentPet?.happiness || 90}</span>
              </div>
            </div>
          </div>
          <Button variant="primary" className="bg-gradient-to-r from-orange-400 to-amber-500" onClick={() => navigate('/pet')}>
            去照顾它
          </Button>
        </div>
      </Card>
    </div>
  )

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">我的课程</h2>
        <Button variant="outline" size="sm">全部课程</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map(course => (
          <Card key={course.id} hover className="overflow-hidden">
            <div className={`h-3 bg-gradient-to-r ${course.color}`} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{course.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.teacher}
                  </p>
                </div>
                <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                  {course.progress}% 完成
                </div>
              </div>
              <div className="mb-4">
                <div className="w-full h-3 bg-gray-200 rounded-full">
                  <div
                    className={`h-full bg-gradient-to-r ${course.color} rounded-full transition-all`}
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {course.schedule}
                </span>
              </div>
              <Button className="w-full mt-4" variant="outline">
                进入课程
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderAssignments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">作业中心</h2>
        <div className="flex gap-2">
          {['全部', '待提交', '已提交', '已评分'].map((filter) => (
            <Button
              key={filter}
              variant={filter === '全部' ? 'primary' : 'outline'}
              size="sm"
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>
      <Card>
        <div className="space-y-4">
          {assignments.map(assignment => (
            <div key={assignment.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                assignment.status === 'pending' ? 'bg-yellow-100' :
                assignment.status === 'submitted' ? 'bg-blue-100' : 'bg-green-100'
              }`}>
                <FileText className={`w-6 h-6 ${
                  assignment.status === 'pending' ? 'text-yellow-500' :
                  assignment.status === 'submitted' ? 'text-blue-500' : 'text-green-500'
                }`} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{assignment.title}</p>
                <p className="text-sm text-gray-500">{assignment.course} · 截止日期: {assignment.dueDate}</p>
              </div>
              <div className="text-right">
                {getStatusBadge(assignment.status)}
                {assignment.grade && (
                  <p className="text-sm font-medium text-green-600 mt-1">成绩: {assignment.grade}</p>
                )}
              </div>
              <Button
                variant={assignment.status === 'pending' ? 'primary' : 'outline'}
                size="sm"
              >
                {assignment.status === 'pending' ? '提交作业' : '查看详情'}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  const renderGrades = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">成绩查询</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            导出成绩单
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">学期平均成绩</h3>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-orange-500">90</p>
              <p className="text-sm text-gray-500">平均分</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-500">7</p>
              <p className="text-sm text-gray-500">班级排名</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-500">↑3</p>
              <p className="text-sm text-gray-500">相比上周</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {grades.map((grade, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{grade.course}</p>
                <p className="text-sm text-gray-500">班级排名: 第{grade.rank}名</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">{grade.grade}</p>
              </div>
              <div className={`px-2 py-1 rounded text-sm ${
                grade.trend === 'up' ? 'bg-green-100 text-green-600' :
                grade.trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {grade.trend === 'up' ? '↑ 上升' : grade.trend === 'down' ? '↓ 下降' : '→ 稳定'}
              </div>
              <Button variant="ghost" size="sm">
                <BarChart2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">学生端</h1>
              <p className="text-sm text-gray-500">欢迎，{user?.username || '学生'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleSwitchRole}>
              <Users className="w-4 h-4 mr-1" />
              切换角色
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Mail className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              退出登录
            </Button>
          </div>
        </div>
        <div className="border-t">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex gap-1">
              {[
                { key: 'overview', label: '概览', icon: BarChart2 },
                { key: 'courses', label: '课程', icon: Book },
                { key: 'assignments', label: '作业', icon: FileText },
                { key: 'grades', label: '成绩', icon: BarChart2 },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === key
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'courses' && renderCourses()}
        {activeTab === 'assignments' && renderAssignments()}
        {activeTab === 'grades' && renderGrades()}
      </main>
    </div>
  )
}

export default StudentDashboard