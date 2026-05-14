import { useState, useEffect } from 'react'
import { Building2, Plus, Users, Trophy, BarChart3, X } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { classApi } from '../services/api'

interface Class {
  id: number
  name: string
  invite_code: string
  student_count: number
  group_count: number
  created_at: string
}

function Class() {
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newClassName, setNewClassName] = useState('')

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await classApi.getClasses()
        setClasses(response.data)
      } catch (err) {
        console.error('Failed to fetch classes:', err)
      }
    }

    fetchClasses()
  }, [])

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return

    try {
      await classApi.createClass(newClassName)
      setNewClassName('')
      setShowCreateModal(false)
      const response = await classApi.getClasses()
      setClasses(response.data)
    } catch (err) {
      alert('创建班级失败')
    }
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white text-white-shadow">班级管理</h2>
            <p className="text-white/80 text-white-shadow">查看和管理你的班级</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-5 h-5" />
          创建班级
        </Button>
      </div></function></seed:tool_call>

      {/* 班级统计 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">{classes.length}</p>
            <p className="text-gray-500 text-sm">总班级数</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">
              {classes.reduce((sum, c) => sum + c.student_count, 0)}
            </p>
            <p className="text-gray-500 text-sm">总学生数</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">
              {classes.reduce((sum, c) => sum + c.group_count, 0)}
            </p>
            <p className="text-gray-500 text-sm">总小组数</p>
          </div>
        </Card>
      </div>

      {/* 班级列表 */}
      <div className="grid lg:grid-cols-2 gap-4">
        {classes.map((cls) => (
          <Card key={cls.id} hover onClick={() => { setSelectedClass(cls); setShowModal(true); }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-gray-800">{cls.name}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {cls.student_count} 名学生
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    {cls.group_count} 个小组
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">邀请码</p>
                <p className="font-mono text-gray-600">{cls.invite_code}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 班级详情弹窗 */}
      {showModal && selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">{selectedClass.name}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500">邀请码</span>
                <code className="font-mono text-gray-700 bg-white px-3 py-1 rounded-lg">
                  {selectedClass.invite_code}
                </code>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl text-center">
                  <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{selectedClass.student_count}</p>
                  <p className="text-sm text-gray-500">学生数</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl text-center">
                  <Trophy className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{selectedClass.group_count}</p>
                  <p className="text-sm text-gray-500">小组数</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={() => setShowModal(false)} variant="secondary">
                关闭
              </Button>
              <Button>
                <BarChart3 className="w-5 h-5" />
                查看统计
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 创建班级弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">创建班级</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-2">班级名称</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="请输入班级名称"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={() => setShowCreateModal(false)} variant="secondary">
                取消
              </Button>
              <Button onClick={handleCreateClass} disabled={!newClassName.trim()}>
                创建
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Class
