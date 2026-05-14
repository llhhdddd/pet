import { useState, useEffect } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useStore from '../store/useStore'

interface Task {
  id: number
  title: string
  description: string
  type: 'homework' | 'preview' | 'project' | 'quiz'
  deadline: string
  goldReward: number
  growthReward: number
  status: 'available' | 'completed' | 'expired'
  className: string
}

const mockTasks: Task[] = [
  {
    id: 1,
    title: '完成数学作业第三章',
    description: '完成课本第45-50页的所有练习题',
    type: 'homework',
    deadline: '2026-05-20 23:59',
    goldReward: 50,
    growthReward: 20,
    status: 'available',
    className: '数学一班'
  },
  {
    id: 2,
    title: '预习语文古诗词',
    description: '预习《静夜思》《望庐山瀑布》两首古诗',
    type: 'preview',
    deadline: '2026-05-18 23:59',
    goldReward: 30,
    growthReward: 15,
    status: 'available',
    className: '语文提高班'
  },
  {
    id: 3,
    title: '英语单词打卡',
    description: '完成本周20个新单词的记忆和默写',
    type: 'quiz',
    deadline: '2026-05-15 23:59',
    goldReward: 40,
    growthReward: 25,
    status: 'completed',
    className: '英语兴趣班'
  },
  {
    id: 4,
    title: '科学小实验项目',
    description: '完成"火山爆发"科学实验报告',
    type: 'project',
    deadline: '2026-05-25 23:59',
    goldReward: 100,
    growthReward: 50,
    status: 'available',
    className: '科学探索班'
  }
]

const taskTypeIcons: Record<string, string> = {
  homework: '📝',
  preview: '📖',
  project: '🚀',
  quiz: '✏️'
}

const taskTypeLabels: Record<string, string> = {
  homework: '作业',
  preview: '预习',
  project: '项目',
  quiz: '测验'
}

function Task() {
  const { updateGold, updatePet } = useStore()
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [filter, setFilter] = useState<'all' | 'available' | 'completed'>('all')
  const [claimingId, setClaimingId] = useState<number | null>(null)
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [rewardData, setRewardData] = useState<{ gold: number; growth: number } | null>(null)

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    return task.status === filter
  })

  const handleCompleteTask = async (taskId: number) => {
    setClaimingId(taskId)
    await new Promise(resolve => setTimeout(resolve, 1000))

    const task = tasks.find(t => t.id === taskId)
    if (task) {
      updateGold(task.goldReward)
      updatePet({ growth: (useStore.getState().currentPet?.growth || 0) + task.growthReward })
      setRewardData({ gold: task.goldReward, growth: task.growthReward })
      setShowRewardModal(true)

      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: 'completed' as const } : t
      ))
    }
    setClaimingId(null)
  }

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days < 0) return '已过期'
    if (days === 0) return '今日截止'
    if (days === 1) return '明日截止'
    return `${days}天后截止`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
          <span className="text-2xl">📝</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white text-white-shadow">任务中心</h1>
          <p className="text-white/80 text-white-shadow">查看和完成学习任务</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'available', 'completed'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? '全部' : f === 'available' ? '可领取' : '已完成'}
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredTasks.map(task => (
          <Card key={task.id} className="animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{taskTypeIcons[task.type]}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-800">{task.title}</h3>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
                    {taskTypeLabels[task.type]}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {task.className}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-amber-500">💰 {task.goldReward}金币</span>
                    <span className="text-green-500">📈 +{task.growthReward}成长值</span>
                    <span className={`${task.status === 'expired' ? 'text-red-500' : 'text-gray-500'}`}>
                      ⏰ {formatDeadline(task.deadline)}
                    </span>
                  </div>
                  {task.status === 'available' && (
                    <Button
                      size="sm"
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={claimingId === task.id}
                    >
                      {claimingId === task.id ? '领取中...' : '完成任务'}
                    </Button>
                  )}
                  {task.status === 'completed' && (
                    <span className="text-green-500 text-sm font-medium">✓ 已完成</span>
                  )}
                  {task.status === 'expired' && (
                    <span className="text-red-500 text-sm">已过期</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredTasks.length === 0 && (
          <Card>
            <p className="text-gray-500 text-center py-8">暂无任务</p>
          </Card>
        )}
      </div>

      {showRewardModal && rewardData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-sm animate-scaleIn">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">任务完成！</h2>
              <div className="space-y-2 mb-6">
                <p className="text-amber-500 text-lg">💰 +{rewardData.gold} 金币</p>
                <p className="text-green-500 text-lg">📈 +{rewardData.growth} 成长值</p>
              </div>
              <Button onClick={() => setShowRewardModal(false)}>太棒了！</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Task