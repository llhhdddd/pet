import { useState, useEffect } from 'react'
import { ListTodo, Plus, Calendar, CheckCircle2, Trash2, FileText, Loader2, AlertCircle } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { taskApi, classApi } from '../services/api'

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

interface ClassItem {
  id: number
  name: string
}

function TeacherTask() {
  const [tasks, setTasks] = useState<BackendTask[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [newTask, setNewTask] = useState({
    title: '',
    content: '',
    task_type: 'homework' as string,
    deadline: '',
    class_id: 0,
  })

  const fetchClasses = async () => {
    try {
      const res = await classApi.getClasses()
      setClasses(res.data)
      if (res.data.length > 0 && newTask.class_id === 0) {
        setNewTask(prev => ({ ...prev, class_id: res.data[0].id }))
      }
    } catch {
      // 班级加载失败不影响任务显示
    }
  }

  const fetchTasks = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await taskApi.getTasks()
      setTasks(res.data)
    } catch {
      setError('加载任务失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClasses()
    fetchTasks()
  }, [])

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'draft') return task.status === 'draft'
    if (filter === 'published') return task.status === 'published'
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

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.content || !newTask.deadline || !newTask.class_id) return

    try {
      await taskApi.createTask({
        class_id: newTask.class_id,
        title: newTask.title,
        content: newTask.content,
        task_type: newTask.task_type,
        deadline: newTask.deadline + ':00',
      })
      setShowCreateModal(false)
      setNewTask({ title: '', content: '', task_type: 'homework', deadline: '', class_id: classes[0]?.id || 0 })
      await fetchTasks()
    } catch (err: any) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : '创建任务失败')
    }
  }

  const handlePublishTask = async (taskId: number) => {
    try {
      await taskApi.updateTask(taskId, { status: 'published' })
      await fetchTasks()
    } catch {
      setError('发布失败')
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      await taskApi.deleteTask(taskId)
      await fetchTasks()
    } catch {
      setError('删除失败')
    }
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
            <p className="text-orange-500">管理和发布学习任务</p>
          </div>
        </div>
        <Button onClick={() => { setShowCreateModal(true); fetchClasses() }}>
          <Plus className="w-5 h-5" />
          创建任务
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="flex gap-2">
        {[
          { key: 'all', label: '全部', count: tasks.length },
          { key: 'draft', label: '草稿', count: tasks.filter((t) => t.status === 'draft').length },
          { key: 'published', label: '已发布', count: tasks.filter((t) => t.status === 'published').length },
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
            <p>暂无任务，点击上方"创建任务"开始</p>
          </div>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${taskTypeColors[task.task_type]}`}>
                      {taskTypeLabels[task.task_type] || task.task_type}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      task.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {task.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{task.title}</h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{task.content || ''}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(task.deadline).toLocaleDateString('zh-CN')}
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <FileText className="w-4 h-4" />
                      {task.class_name}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  {task.status === 'draft' ? (
                    <Button size="sm" onClick={() => handlePublishTask(task.id)}>
                      <CheckCircle2 className="w-4 h-4" />
                      发布
                    </Button>
                  ) : null}
                  <Button size="sm" variant="danger" onClick={() => handleDeleteTask(task.id)}>
                    <Trash2 className="w-4 h-4" />
                    删除
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">创建新任务</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-2">任务标题</label>
                <input type="text" value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="请输入任务标题"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-2">任务类型</label>
                <select value={newTask.task_type}
                  onChange={(e) => setNewTask({ ...newTask, task_type: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400">
                  {Object.entries(taskTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-2">所属班级</label>
                <select value={newTask.class_id}
                  onChange={(e) => setNewTask({ ...newTask, class_id: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400">
                  {classes.length === 0 ? (
                    <option value={0}>请先创建班级</option>
                  ) : (
                    classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-2">截止时间</label>
                <input type="datetime-local" value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-2">任务描述</label>
                <textarea value={newTask.content}
                  onChange={(e) => setNewTask({ ...newTask, content: e.target.value })}
                  placeholder="请输入任务描述..."
                  className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={() => setShowCreateModal(false)} variant="outline">取消</Button>
              <Button onClick={handleCreateTask}
                disabled={!newTask.title || !newTask.content || !newTask.deadline || !newTask.class_id}>
                创建任务
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default TeacherTask
