import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Book, Users, FileText, BarChart2, Upload, Calendar, Bell, ChevronRight,
  GraduationCap, Clock, CheckCircle, AlertCircle, UserPlus, Settings, Download
} from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useStore from '../store/useStore'

interface Course {
  id: number
  name: string
  studentCount: number
  schedule: string
  status: 'active' | 'upcoming' | 'completed'
  color: string
}

interface Submission {
  id: number
  studentName: string
  assignmentTitle: string
  course: string
  submittedAt: string
  status: 'pending' | 'graded'
  grade?: number
}

interface Student {
  id: number
  name: string
  studentId: string
  course: string
  attendance: number
  avgGrade: number
}

function TeacherDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'grading' | 'students'>('overview')

  const courses: Course[] = [
    { id: 1, name: '高等数学', studentCount: 128, schedule: '周一/周三 10:00', status: 'active', color: 'from-red-400 to-orange-500' },
    { id: 2, name: '大学英语', studentCount: 95, schedule: '周二/周四 14:00', status: 'active', color: 'from-blue-400 to-indigo-500' },
    { id: 3, name: '计算机基础', studentCount: 156, schedule: '周五 16:00', status: 'active', color: 'from-green-400 to-emerald-500' },
    { id: 4, name: '线性代数', studentCount: 88, schedule: '周一/周三 14:00', status: 'upcoming', color: 'from-purple-400 to-pink-500' },
  ]

  const submissions: Submission[] = [
    { id: 1, studentName: '王小明', assignmentTitle: '数学作业第三章', course: '高等数学', submittedAt: '2024-01-14 09:30', status: 'pending' },
    { id: 2, studentName: '李小红', assignmentTitle: '英语阅读报告', course: '大学英语', submittedAt: '2024-01-14 08:45', status: 'pending' },
    { id: 3, studentName: '张伟', assignmentTitle: '编程实践项目', course: '计算机基础', submittedAt: '2024-01-13 16:20', status: 'graded', grade: 92 },
    { id: 4, studentName: '刘芳', assignmentTitle: '数学作业第二章', course: '高等数学', submittedAt: '2024-01-13 14:00', status: 'graded', grade: 88 },
  ]

  const students: Student[] = [
    { id: 1, name: '王小明', studentId: '2024001', course: '高等数学', attendance: 95, avgGrade: 88 },
    { id: 2, name: '李小红', studentId: '2024002', course: '高等数学', attendance: 98, avgGrade: 92 },
    { id: 3, name: '张伟', studentId: '2024003', course: '计算机基础', attendance: 100, avgGrade: 95 },
    { id: 4, name: '刘芳', studentId: '2024004', course: '大学英语', attendance: 92, avgGrade: 85 },
    { id: 5, name: '陈强', studentId: '2024005', course: '计算机基础', attendance: 88, avgGrade: 78 },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSwitchRole = () => {
    navigate('/role-select')
  }

  const getStatusBadge = (status: Course['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      upcoming: 'bg-blue-100 text-blue-700',
      completed: 'bg-gray-100 text-gray-600',
    }
    const labels = { active: '进行中', upcoming: '即将开始', completed: '已结束' }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">管理课程</p>
              <p className="text-3xl font-bold">{courses.length}</p>
            </div>
            <Book className="w-10 h-10 text-white/60" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-400 to-emerald-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">学生总数</p>
              <p className="text-3xl font-bold">{courses.reduce((sum, c) => sum + c.studentCount, 0)}</p>
            </div>
            <Users className="w-10 h-10 text-white/60" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-orange-400 to-amber-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">待批改作业</p>
              <p className="text-3xl font-bold">{submissions.filter(s => s.status === 'pending').length}</p>
            </div>
            <FileText className="w-10 h-10 text-white/60" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">本周课时</p>
              <p className="text-3xl font-bold">12</p>
            </div>
            <Clock className="w-10 h-10 text-white/60" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              待批改作业
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('grading')}>
              全部 <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {submissions.filter(s => s.status === 'pending').slice(0, 3).map(submission => (
              <div key={submission.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{submission.studentName}</p>
                  <p className="text-sm text-gray-500">{submission.assignmentTitle}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {submission.submittedAt}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              今日课程
            </h3>
          </div>
          <div className="space-y-3">
            {courses.filter(c => c.status === 'active').slice(0, 2).map(course => (
              <div key={course.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center`}>
                  <Book className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{course.name}</p>
                  <p className="text-sm text-gray-500">{course.schedule}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-500">{course.studentCount}人</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-purple-500" />
            班级成绩概览
          </h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            导出报表
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">课程名称</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">学生数</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">平均分</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">及格率</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">作业提交率</th>
              </tr>
            </thead>
            <tbody>
              {courses.slice(0, 3).map(course => (
                <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${course.color} flex items-center justify-center`}>
                        <Book className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-800">{course.name}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 text-gray-600">{course.studentCount}</td>
                  <td className="text-center py-3 px-4">
                    <span className="font-medium text-orange-500">{(85 + Math.random() * 10).toFixed(1)}</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="font-medium text-green-600">{(92 + Math.random() * 6).toFixed(1)}%</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="font-medium text-blue-600">{(88 + Math.random() * 10).toFixed(1)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">课程管理</h2>
        <Button variant="primary">
          <Book className="w-4 h-4 mr-1" />
          创建新课程
        </Button>
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
                    {course.studentCount} 名学生
                  </p>
                </div>
                {getStatusBadge(course.status)}
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {course.schedule}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" size="sm">
                  课程设置
                </Button>
                <Button variant="primary" className="flex-1" size="sm">
                  进入课程
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderGrading = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">作业批改</h2>
        <div className="flex gap-2">
          {['全部', '待批改', '已批改'].map((filter) => (
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
          {submissions.map(submission => (
            <div key={submission.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                submission.status === 'pending' ? 'bg-orange-100' : 'bg-green-100'
              }`}>
                {submission.status === 'pending' ? (
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{submission.assignmentTitle}</p>
                <p className="text-sm text-gray-500">
                  学生: {submission.studentName} · {submission.course}
                </p>
                <p className="text-sm text-gray-400">提交时间: {submission.submittedAt}</p>
              </div>
              <div className="text-right">
                {submission.status === 'graded' && submission.grade ? (
                  <div>
                    <span className="text-2xl font-bold text-green-600">{submission.grade}</span>
                    <p className="text-sm text-gray-500">分</p>
                  </div>
                ) : (
                  <Button variant="primary" size="sm">
                    批改
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  const renderStudents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">学生管理</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-1" />
            导出名单
          </Button>
          <Button variant="primary">
            <UserPlus className="w-4 h-4 mr-1" />
            添加学生
          </Button>
        </div>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">学号</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">姓名</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">课程</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">出勤率</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">平均成绩</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-600">{student.studentId}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{student.name}</td>
                  <td className="text-center py-3 px-4 text-gray-600">{student.course}</td>
                  <td className="text-center py-3 px-4">
                    <span className={`font-medium ${
                      student.attendance >= 95 ? 'text-green-600' :
                      student.attendance >= 85 ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      {student.attendance}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`font-medium ${
                      student.avgGrade >= 90 ? 'text-green-600' :
                      student.avgGrade >= 80 ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      {student.avgGrade}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <Button variant="ghost" size="sm">
                      <BarChart2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">教师端</h1>
              <p className="text-sm text-gray-500">欢迎，{user?.username || '教师'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleSwitchRole}>
              <Users className="w-4 h-4 mr-1" />
              切换角色
            </Button>
            <Button variant="primary" size="sm">
              <Upload className="w-4 h-4 mr-1" />
              上传资源
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
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
                { key: 'grading', label: '批改作业', icon: FileText },
                { key: 'students', label: '学生', icon: Users },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600'
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
        {activeTab === 'grading' && renderGrading()}
        {activeTab === 'students' && renderStudents()}
      </main>
    </div>
  )
}

export default TeacherDashboard