import { useState, useEffect } from 'react'
import { ListTodo, Calendar, CheckCircle2, XCircle, FileText, Upload, Clock, Award, Loader2 } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useStore from '../store/useStore'
import { taskApi } from '../services/api'

interface BackendTask {
  id: number
  class_id: number
  class_name: string
  title: string
  content?: string
  deadline: string
  task_type: string
  status: string
}

function Task() {
  const [tasks, setTasks] = useState<BackendTask[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [selectedTask, setSelectedTask] = useState<BackendTask | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitContent, setSubmitContent] = useState('')

  const goldBalance = useStore((state) => state.goldBalance)
  const setGoldBalance = useStore((state) => state.setGoldBalance)

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await taskApi.getTasks()
      setTasks(res.data)
    } catch {
      // 没有加入班级则任务列表为空
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return task.status === 'published'
    if (filter === 'completed') return task.status === 'closed'
    return true
  })

  const taskTypeLabels: Record<string, string> = {
    homework: '作业',
    preview: '预习',
    project: '项目',
    quiz: '测验',
  }

  const taskTypeColors: Record<string, string> = {
    homework: 'bg-blue-100 text-blue-700',
    preview: 'bg-green-100 text-green-700',
    project: 'bg-purple-100 text-purple-700',
    quiz: 'bg-orange-100 text-orange-700',
  }

  const getDaysRemaining = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const handleSubmit = async () => {
    if (!selectedTask || !submitContent.trim()) return

    setSubmitting(true)
    try {
      await taskApi.submitTask(selectedTask.id, submitContent)
      setGoldBalance(goldBalance + 10)
      setShowModal(false)
      setSubmitContent('')
      await fetchTasks()
    } catch {
      // 提交失败
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
            <ListTodo className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-orange-800">任务管理</h2>
            <p className="text-orange-500">查看和完成学习任务</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-orange-700">
          <Award className="w-5 h-5 text-yellow-500" />
          <span className="font-bold">{goldBalance}</span>
          <span className="text-orange-500">金币</span>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'all', label: '全部', count: tasks.length },
          { key: 'pending', label: '待完成', count: tasks.filter((t) => t.status === 'published').length },
          { key: 'completed', label: '已完成', count: tasks.filter((t) => t.status === 'closed').length },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key as typeof filter)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
              filter === item.key
                ? 'bg-white text-indigo-600 shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {item.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              filter === item.key ? 'bg-indigo-100' : 'bg-white/20'
            }`}>
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无任务</p>
            <p className="text-sm mt-1">教师发布任务后会显示在这里</p>
          </div>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const daysRemaining = getDaysRemaining(task.deadline)
            return (
              <Card key={task.id} hover onClick={() => { setSelectedTask(task); setShowModal(true) }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${taskTypeColors[task.task_type]}`}>
                        {taskTypeLabels[task.task_type] || task.task_type}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">{task.title}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{task.content || ''}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`flex items-center gap-1 ${
                        daysRemaining < 1 ? 'text-red-500' : daysRemaining <= 2 ? 'text-yellow-500' : 'text-gray-400'
                      }`}>
                        <Clock className="w-4 h-4" />
                        {daysRemaining < 0 ? '已过期' : daysRemaining === 0 ? '今天截止' : `${daysRemaining}天后截止`}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <FileText className="w-4 h-4" />
                        {task.class_name}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {task.status === 'published' ? (
                      <XCircle className="w-8 h-8 text-orange-400" />
                    ) : (
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${taskTypeColors[selectedTask.task_type]}`}>
                  {taskTypeLabels[selectedTask.task_type] || selectedTask.task_type}
                </span>
                <h3 className="text-xl font-bold text-gray-800">{selectedTask.title}</h3>
              </div>
              <button onClick={() => { setShowModal(false); setSubmitContent('') }}
                className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">所属班级</label>
                <p className="text-gray-800">{selectedTask.class_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">截止时间</label>
                <p className={`flex items-center gap-2 ${getDaysRemaining(selectedTask.deadline) < 1 ? 'text-red-500' : 'text-gray-800'}`}>
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedTask.deadline).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">任务描述</label>
                <p className="text-gray-800 leading-relaxed">{selectedTask.content || '暂无描述'}</p>
              </div>

              {selectedTask.status === 'published' && (
                <div>
                  <label className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    提交作业
                    <span className="ml-auto text-xs text-gray-400">完成任务可获得 10 金币</span>
                  </label>
                  <textarea value={submitContent}
                    onChange={(e) => setSubmitContent(e.target.value)}
                    placeholder="请输入你的答案或上传作业内容..."
                    className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={() => { setShowModal(false); setSubmitContent('') }} variant="outline">关闭</Button>
              {selectedTask.status === 'published' && (
                <Button onClick={handleSubmit} disabled={submitting || !submitContent.trim()}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      提交任务
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Task
