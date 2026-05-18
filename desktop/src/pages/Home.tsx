import { Cat, BookOpen, Trophy, Calendar, TrendingUp, Star, Zap, Heart } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useStore from '../store/useStore'

function Home() {
  const { user, currentPet, goldBalance } = useStore()

  const stats = [
    { icon: BookOpen, label: '今日任务', value: '3', color: 'from-blue-400 to-indigo-500' },
    { icon: Trophy, label: '本周积分', value: '+120', color: 'from-yellow-400 to-orange-500' },
    { icon: Star, label: '连续签到', value: '7天', color: 'from-purple-400 to-pink-500' },
    { icon: Heart, label: '宠物好感', value: '95%', color: 'from-red-400 to-rose-500' },
  ]

  const quickActions = [
    { icon: BookOpen, label: '开始学习', description: '完成今日任务', color: 'bg-blue-50 hover:bg-blue-100 text-blue-600' },
    { icon: Cat, label: '宠物互动', description: '陪宠物玩耍', color: 'bg-orange-50 hover:bg-orange-100 text-orange-600' },
    { icon: Trophy, label: '领取奖励', description: '获取金币奖励', color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-600' },
    { icon: Zap, label: '捉虫挑战', description: '巩固知识', color: 'bg-green-50 hover:bg-green-100 text-green-600' },
  ]

  const upcomingTasks = [
    { id: 1, title: '数学作业 - 第三章习题', subject: '数学', deadline: '今天 18:00', progress: 60 },
    { id: 2, title: '英语背诵 - 第五单元', subject: '英语', deadline: '明天 10:00', progress: 30 },
    { id: 3, title: '历史测验', subject: '历史', deadline: '本周六', progress: 0 },
  ]

  return (
    <div className="space-y-6 page-transition">
      {/* 欢迎区域 */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
          <Cat className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-orange-800">欢迎回来，{user?.username}！</h2>
          <p className="text-orange-600">今天也要好好加油哦！</p>
        </div>
      </div>

      {/* 宠物状态卡片 */}
      {currentPet && (
        <Card className="relative overflow-hidden card-hover">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center text-5xl shadow-xl">
              🐱
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-800">{currentPet.name}</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-orange-400 to-amber-500 text-white text-sm font-medium rounded-full">
                  Lv.{currentPet.level}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">成长值</span>
                    <span className="text-sm font-medium text-gray-700">{currentPet.growth_value}/{currentPet.max_growth}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${(currentPet.growth_value / currentPet.max_growth) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">快乐值</span>
                    <span className="text-sm font-medium text-gray-700">{currentPet.happiness}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${currentPet.happiness}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <Button className="self-center">
              <Heart className="w-5 h-5 mr-2" />
              互动一下
            </Button>
          </div>
        </Card>
      )}

      {/* 统计数据 */}
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
        {/* 快捷操作 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              快捷操作
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <button
                  key={index}
                  className={`p-4 rounded-xl ${action.color} transition-all duration-200 flex flex-col items-start gap-2 card-hover`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="font-medium">{action.label}</span>
                  <span className="text-xs opacity-70">{action.description}</span>
                </button>
              )
            })}
          </div>
        </Card>

        {/* 待办任务 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              待办任务
            </h3>
            <Button variant="outline" size="sm">
              查看全部
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{task.title}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">{task.subject}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {task.deadline}
                  </span>
                  {task.progress > 0 && (
                    <span className="text-sm text-green-600">{task.progress}%</span>
                  )}
                </div>
                {task.progress > 0 && (
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 学习趋势 */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            学习趋势
          </h3>
          <select className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600 border-none">
            <option>本周</option>
            <option>本月</option>
            <option>本季度</option>
          </select>
        </div>
        <div className="flex items-end justify-between h-32 gap-4">
          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => {
            const height = Math.random() * 80 + 20
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gradient-to-t from-orange-400 to-amber-400 rounded-t-lg transition-all hover:from-orange-500 hover:to-amber-500" style={{ height: `${height}%` }} />
                <span className="text-sm text-gray-500">{day}</span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* 金币余额 */}
      <Card className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 mb-1">当前金币余额</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white-glow">{goldBalance}</span>
              <span className="text-white/80">金币</span>
            </div>
          </div>
          <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
            去赚取
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Home
