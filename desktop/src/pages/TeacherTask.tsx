import { useState } from 'react'
import { ListTodo, Plus, Calendar, CheckCircle2, Edit3, Trash2, FileText, Clock, Users } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'

interface Task {
  id: number
  title: string
  description: string
  task_type: 'homework' | 'preview' | 'project' | 'quiz'
  deadline: string
  status: 'draft' | 'published' | 'closed'
  class_name: string
  submission_count: number
  total_students: number
}

interface Submission {
  id: number
  student_name: string
  submit_time: string
  content: string
  score?: number
  graded: boolean
}

function TeacherTask() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: '数学作业 - 函数章节',
      description: '完成课本第56-60页的练习题，包括选择题、填空题和解答题。',
      task_type: 'homework',
      deadline: '2026-05-16',
      status: 'published',
      class_name: '初一(1)班',
      submission_count: 32,
      total_students: 45,
    },
    {
      id: 2,
      title: '英语预习 - 新单词',
      description: '预习下节课要学习的20个新单词，背诵并默写。',
      task_type: 'preview',
      deadline: '2026-05-15',
      status: 'published',
      class_name: '初一(1)班',
      submission_count: 40,
      total_students: 45,
    },
    {
      id: 3,
      title: '小组项目 - 科学实验报告',
      description: '小组合作完成植物生长实验报告。',
      task_type: 'project',
      deadline: '2026-05-20',
      status: 'draft',
      class_name: '初一(1)班',
      submission_count: 0,
      total_students: 45,
    },
    {
      id: 4,
      title: '历史测验',
      description: '完成第3单元的历史测验，共20道选择题和5道问答题。',
      task_type: 'quiz',
      deadline: '2026-05-17',
      status: 'published',
      class_name: '初一(1)班',
      submission_count: 42,
      total_students: 45,
    },
  ])

  const [submissions, setSubmissions] = useState<Submission[]>([
    { id: 1, student_name: '张三', submit_time: '2026-05-14 16:30', content: '这是我的作业答案...', score: 95, graded: true },
    { id: 2, student_name: '李四', submit_time: '2026-05-14 17:45', content: '我完成的作业内容...', score: 88, graded: true },
    { id: 3, student_name: '王五', submit_time: '2026-05-14 18:20', content: '作业提交内容...', graded: false },
    { id: 4, student_name: '赵六', submit_time: '2026-05-14 19:00', content: '我的答案在这里...', graded: false },
  ])

  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    task_type: 'homework' as 'homework' | 'preview' | 'project' | 'quiz',
    deadline: '',
    class_name: '初一(1)班',
  })

  const [score, setScore] = useState('')

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

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description || !newTask.deadline) return
    
    const task: Task = {
      id: tasks.length + 1,
      ...newTask,
      status: 'draft',
      submission_count: 0,
      total_students: 45,
    }
    
    setTasks([...tasks, task])
    setShowCreateModal(false)
    setNewTask({
      title: '',
      description: '',
      task_type: 'homework',
      deadline: '',
      class_name: '初一(1)班',
    })
  }

  const handlePublishTask = (taskId: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'published' as const } : t))
    )
  }

  const handleGrade = () => {
    if (!selectedSubmission || !score) return
    
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === selectedSubmission.id
          ? { ...s, score: parseInt(score), graded: true }
          : s
      )
    )
    setShowGradeModal(false)
    setScore('')
  }

  const getSubmissionStats = (task: Task) => {
    const graded = submissions.filter((s) => s.graded).length
    const ungraded = task.submission_count - graded
    return { graded, ungraded }
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
            <h2 className="text-2xl font-bold text-white">任务管理</h2>
            <p className="text-white/60">管理和发布学习任务</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-5 h-5" />
          创建任务
        </Button>
      </div>

      {/* 筛选标签 */}
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
                : 'bg-white/10 text-white hover:bg-white/20'
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
          const stats = getSubmissionStats(task)
          return (
            <Card key={task.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${taskTypeColors[task.task_type]}`}>
                      {taskTypeLabels[task.task_type]}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      task.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {task.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{task.title}</h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(task.deadline).toLocaleDateString('zh-CN')}
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <FileText className="w-4 h-4" />
                      {task.class_name}
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Users className="w-4 h-4" />
                      {task.submission_count}/{task.total_students} 已提交
                    </span>
                  </div>
                  
                  {task.submission_count > 0 && (
                    <div className="mt-3 flex gap-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs">
                        已批改: {stats.graded}
                      </span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs">
                        待批改: {stats.ungraded}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  {task.status === 'draft' ? (
                    <Button size="sm" onClick={() => handlePublishTask(task.id)}>
                      <CheckCircle2 className="w-4 h-4" />
                      发布
                    </Button>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedTask(task); setShowGradeModal(true); }}>
                        <Edit3 className="w-4 h-4" />
                        批改
                      </Button>
                      <Button size="sm" variant="danger">
                        <Trash2 className="w-4 h-4" />
                        删除
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* 创建任务弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">创建新任务</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-2">任务标题</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="请输入任务标题"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-2">任务类型</label>
                <select
                  value={newTask.task_type}
                  onChange={(e) => setNewTask({ ...newTask, task_type: e.target.value as 'homework' | 'preview' | 'project' | 'quiz' })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {Object.entries(taskTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-2">所属班级</label>
                <select
                  value={newTask.class_name}
                  onChange={(e) => setNewTask({ ...newTask, class_name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="初一(1)班">初一(1)班</option>
                  <option value="初一(2)班">初一(2)班</option>
                  <option value="初一(3)班">初一(3)班</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-2">截止时间</label>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-2">任务描述</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="请输入任务描述..."
                  className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={() => setShowCreateModal(false)} variant="outline">
                取消
              </Button>
              <Button onClick={handleCreateTask} disabled={!newTask.title || !newTask.description || !newTask.deadline}>
                创建任务
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 作业批改弹窗 */}
      {showGradeModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">批改作业 - {selectedTask.title}</h3>
              <button onClick={() => setShowGradeModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ✕
              </button>
            </div>

            {/* 学生提交列表 */}
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className={`p-4 rounded-xl border-2 ${submission.graded ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'} ${selectedSubmission?.id === submission.id ? 'ring-2 ring-blue-400' : ''}`}
                  onClick={() => !submission.graded && setSelectedSubmission(submission)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                        {submission.student_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{submission.student_name}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {submission.submit_time}
                        </p>
                      </div>
                    </div>
                    {submission.graded ? (
                      <span className="px-3 py-1 bg-green-200 text-green-700 rounded-lg font-bold">
                        {submission.score}分
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-200 text-yellow-700 rounded-lg">
                        待批改
                      </span>
                    )}
                  </div>
                  {selectedSubmission?.id === submission.id && !submission.graded && (
                    <div className="mt-4 p-3 bg-white rounded-xl">
                      <p className="text-gray-700 mb-4">{submission.content}</p>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={score}
                          onChange={(e) => setScore(e.target.value)}
                          placeholder="输入分数"
                          min="0"
                          max="100"
                          className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <Button onClick={handleGrade} disabled={!score}>
                          提交评分
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default TeacherTask
