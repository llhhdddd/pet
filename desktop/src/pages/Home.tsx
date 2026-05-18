import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cat, BookOpen, Trophy, Calendar, Star, Zap, Heart, Clock, Bug } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useStore from '../store/useStore'
import { taskApi } from '../services/api'

interface TaskItem {
  id: number
  title: string
  content?: string
  deadline: string
  task_type: string
  status: string
  class_name: string
}

function Home() {
  const { user, currentPet, goldBalance } = useStore()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<TaskItem[]>([])

  useEffect(() => {
    if (user?.role === 'student') {
      taskApi.getTasks().then(res => {
        const published = res.data.filter((t: TaskItem) => t.status === 'published')
        setTasks(published)
      }).catch(() => {})
    }
  }, [user])

  const pendingCount = tasks.length
  const urgentTasks = tasks.filter(t => {
    const days = Math.ceil((new Date(t.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days <= 2
  })

  const stats = [
    { icon: BookOpen, label: '待办任务', value: `${pendingCount}`, color: 'from-blue-400 to-indigo-500' },
    { icon: Trophy, label: '金币余额', value: `${goldBalance}`, color: 'from-yellow-400 to-orange-500' },
    { icon: Star, label: '连续签到', value: '1天', color: 'from-purple-400 to-pink-500' },
    { icon: Heart, label: '宠物状态', value: currentPet?.status === 'happy' ? '开心' : currentPet?.status === 'sad' ? '难过' : '正常', color: 'from-red-400 to-rose-500' },
  ]

  const quickActions = [
    { icon: BookOpen, label: '查看任务', description: '完成今日任务', color: 'bg-blue-50 hover:bg-blue-100 text-blue-600', path: '/task' },
    { icon: Cat, label: '宠物互动', description: '陪宠物玩耍', color: 'bg-orange-50 hover:bg-orange-100 text-orange-600', path: '/pet' },
    { icon: Trophy, label: '赚取金币', description: '获取金币奖励', color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-600', path: '/gold' },
    { icon: Bug, label: '捉虫挑战', description: '巩固知识', color: 'bg-green-50 hover:bg-green-100 text-green-600', path: '/bugcatch' },
  ]

  const taskTypeLabels: Record<string, string> = {
    homework: '作业', preview: '预习', project: '项目', quiz: '测验',
  }

  const getDays = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days < 0) return '已过期'
    if (days === 0) return '今天截止'
    if (days === 1) return '明天截止'
    return `${days}天后截止`
  }

  return (
    <div className="space-y-6 page-transition">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
          <Cat className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-orange-800">欢迎回来，{user?.username}！</h2>
          <p className="text-orange-600">今天也要好好加油哦！</p>
        </div>
      </div>

      {currentPet && (
        <Card className="relative overflow-hidden card-hover">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center text-5xl shadow-xl">🐱</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-800">{currentPet.name}</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-orange-400 to-amber-500 text-white text-sm font-medium rounded-full">Lv.{currentPet.level}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">成长值</span>
                    <span className="text-sm font-medium text-gray-700">{currentPet.growth_value}/{currentPet.max_growth}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${(currentPet.growth_value / currentPet.max_growth) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">快乐值</span>
                    <span className="text-sm font-medium text-gray-700">{currentPet.happiness}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${currentPet.happiness}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <Button className="self-center" onClick={() => navigate('/pet')}>
              <Heart className="w-5 h-5 mr-2" />互动一下
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="card-hover">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />快捷操作
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <button key={index}
                  onClick={() => navigate(action.path)}
                  className={`p-4 rounded-xl ${action.color} transition-all duration-200 flex flex-col items-start gap-2 card-hover`}>
                  <Icon className="w-6 h-6" />
                  <span className="font-medium">{action.label}</span>
                  <span className="text-xs opacity-70">{action.description}</span>
                </button>
              )
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />待办任务
            </h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/task')}>查看全部</Button>
          </div>
          {tasks.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>暂无待办任务</p>
              <p className="text-xs mt-1">加入班级后可见教师发布的任务</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => navigate('/task')}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{task.title}</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                      {taskTypeLabels[task.task_type] || task.task_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />{getDays(task.deadline)}
                    </span>
                    <span className="text-xs text-gray-400">{task.class_name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {urgentTasks.length > 0 && (
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-red-500" />
            <div>
              <h3 className="font-bold text-red-700">即将过期提醒</h3>
              <p className="text-red-600 text-sm">你有 {urgentTasks.length} 个任务即将到期，请尽快完成</p>
            </div>
            <Button className="ml-auto" onClick={() => navigate('/task')}>立即查看</Button>
          </div>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 mb-1">当前金币余额</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white-glow">{goldBalance}</span>
              <span className="text-white/80">金币</span>
            </div>
          </div>
          <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            onClick={() => navigate('/gold')}>去赚取</Button>
        </div>
      </Card>
    </div>
  )
}

export default Home
