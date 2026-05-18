import { useState, useEffect } from 'react'
import { ListTodo, Calendar, CheckCircle2, XCircle, FileText, Upload, Clock, Award } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useStore from '../store/useStore'

interface Task {
  id: number
  title: string
  description: string
  task_type: 'homework' | 'preview' | 'project' | 'quiz'
  deadline: string
  status: 'draft' | 'published' | 'closed'
  class_name: string
  score?: number
  submitted: boolean
  submit_time?: string
}

function Task() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitContent, setSubmitContent] = useState('')
  
  const goldBalance = useStore((state) => state.goldBalance)
  const setGoldBalance = useStore((state) => state.setGoldBalance)

  useEffect(() => {
    const mockTasks: Task[] = [
      {
        id: 1,
        title: '数学作业 - 函数章节',
        description: '完成课本第56-60页的练习题，包括选择题、填空题和解答题。注意书写工整，步骤清晰。',
        task_type: 'homework',
        deadline: '2026-05-16',
        status: 'published',
        class_name: '初一(1)班',
        submitted: false,
      },
      {
        id: 2,
        title: '英语预习 - 新单词',
        description: '预习下节课要学习的20个新单词，背诵并默写。',
        task_type: 'preview',
        deadline: '2026-05-15',
        status: 'published',
        class_name: '初一(1)班',
        submitted: false,
      },
      {
        id: 3,
        title: '小组项目 - 科学实验报告',
        description: '小组合作完成植物生长实验报告，包括实验目的、步骤、数据分析和结论。',
        task_type: 'project',
        deadline: '2026-05-20',
        status: 'published',
        class_name: '初一(1)班',
        submitted: false,
      },
      {
        id: 4,
        title: '历史测验',
        description: '完成第3单元的历史测验，共20道选择题和5道问答题。',
        task_type: 'quiz',
        deadline: '2026-05-17',
        status: 'published',
        class_name: '初一(1)班',
        submitted: true,
        score: 95,
        submit_time: '2026-05-14 16:30',
      },
      {
        id: 5,
        title: '语文作文 - 我的假期',
        description: '写一篇关于假期生活的作文，字数不少于500字。',
        task_type: 'homework',
        deadline: '2026-05-12',
        status: 'closed',
        class_name: '初一(1)班',
        submitted: true,
        score: 88,
        submit_time: '2026-05-11 20:15',
      },
    ]
    setTasks(mockTasks)
  }, [])

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return task.status === 'published' && !task.submitted
    if (filter === 'completed') return task.submitted
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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleSubmit = async () => {
    if (!selectedTask || !submitContent.trim()) return
    
    setSubmitting(true)
    
    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask!.id
            ? { ...t, submitted: true, submit_time: new Date().toLocaleString('zh-CN') }
            : t
        )
      )
      setGoldBalance(goldBalance + 10)
      setSubmitting(false)
      setShowModal(false)
      setSubmitContent('')
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
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

      {/* 筛选标签 */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: '全部', count: tasks.length },
          { key: 'pending', label: '待完成', count: tasks.filter((t) => t.status === 'published' && !t.submitted).length },
          { key: 'completed', label: '已完成', count: tasks.filter((t) => t.submitted).length },
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

      {/* 任务列表 */}
      <div className="grid lg:grid-cols-2 gap-4">
        {filteredTasks.map((task) => {
          const daysRemaining = getDaysRemaining(task.deadline)
          return (
            <Card key={task.id} hover onClick={() => { setSelectedTask(task); setShowModal(true); }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${taskTypeColors[task.task_type]}`}>
                      {taskTypeLabels[task.task_type]}
                    </span>
                    {task.submitted && task.score !== undefined && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {task.score}分
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{task.title}</h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{task.description}</p>
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
                  {task.submitted ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  ) : (
                    <XCircle className="w-8 h-8 text-gray-300" />
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* 任务详情弹窗 */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${taskTypeColors[selectedTask.task_type]}`}>
                  {taskTypeLabels[selectedTask.task_type]}
                </span>
                <h3 className="text-xl font-bold text-gray-800">{selectedTask.title}</h3>
              </div>
              <button onClick={() => { setShowModal(false); setSubmitContent(''); }} className="text-gray-400 hover:text-gray-600 text-2xl">
                ✕
              </button>
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
                  {new Date(selectedTask.deadline).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  <span className="text-sm text-gray-400">
                    ({getDaysRemaining(selectedTask.deadline) < 0 ? '已过期' : getDaysRemaining(selectedTask.deadline) === 0 ? '今天截止' : `${getDaysRemaining(selectedTask.deadline)}天后截止`})
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">任务描述</label>
                <p className="text-gray-800 leading-relaxed">{selectedTask.description}</p>
              </div>

              {selectedTask.submitted && (
                <div>
                  <label className="text-sm text-gray-500">提交状态</label>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 font-medium">已提交</span>
                    {selectedTask.submit_time && (
                      <span className="text-gray-400 text-sm">提交于 {selectedTask.submit_time}</span>
                    )}
                    {selectedTask.score !== undefined && (
                      <span className="ml-auto px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-bold">
                        <Award className="inline w-4 h-4 mr-1" />
                        {selectedTask.score}分
                      </span>
                    )}
                  </div>
                </div>
              )}

              {!selectedTask.submitted && selectedTask.status === 'published' && (
                <div>
                  <label className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    提交作业
                    <span className="ml-auto text-xs text-gray-400">完成任务可获得 10 金币</span>
                  </label>
                  <textarea
                    value={submitContent}
                    onChange={(e) => setSubmitContent(e.target.value)}
                    placeholder="请输入你的答案或上传作业内容..."
                    className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={() => { setShowModal(false); setSubmitContent(''); }} variant="outline">
                关闭
              </Button>
              {!selectedTask.submitted && selectedTask.status === 'published' && (
                <Button onClick={handleSubmit} disabled={submitting || !submitContent.trim()}>
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
