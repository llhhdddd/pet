import { useState, useEffect } from 'react'
import { Building2, Plus, Users, Trophy, X, LogIn, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useStore from '../store/useStore'
import { classApi } from '../services/api'

interface ClassItem {
  id: number
  name: string
  invite_code: string
  student_count?: number
  member_count?: number
  group_count: number
  created_at: string
}

function ClassPage() {
  const user = useStore((s) => s.user)
  const isTeacher = user?.role === 'teacher'

  const [classes, setClasses] = useState<ClassItem[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchClasses = async () => {
    try {
      const res = await classApi.getClasses()
      setClasses(res.data)
    } catch {
      // ignore
    }
  }

  useEffect(() => { fetchClasses() }, [])

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return
    setLoading(true)
    try {
      await classApi.createClass(newClassName)
      setNewClassName('')
      setShowCreate(false)
      showMsg('success', '班级创建成功！')
      fetchClasses()
    } catch {
      showMsg('error', '创建班级失败')
    }
    setLoading(false)
  }

  const handleJoinClass = async () => {
    if (!inviteCode.trim()) return
    setLoading(true)
    try {
      await classApi.joinByCode(inviteCode.trim())
      setInviteCode('')
      setShowJoin(false)
      showMsg('success', '成功加入班级！现在可以看到教师发布的任务了')
      fetchClasses()
    } catch (err: any) {
      const detail = err.response?.data?.detail || '加入失败，请检查邀请码'
      showMsg('error', detail)
    }
    setLoading(false)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-orange-800">班级管理</h2>
            <p className="text-orange-500">
              {isTeacher ? '创建和管理你的班级' : '加入或查看你的班级'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {isTeacher ? (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-5 h-5" /> 创建班级
            </Button>
          ) : (
            <Button onClick={() => setShowJoin(true)}>
              <LogIn className="w-5 h-5" /> 加入班级
            </Button>
          )}
        </div>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">{classes.length}</p>
            <p className="text-gray-500 text-sm">班级数</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">
              {classes.reduce((s, c) => s + (c.member_count || c.student_count || 0), 0)}
            </p>
            <p className="text-gray-500 text-sm">成员数</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">
              {classes.reduce((s, c) => s + (c.group_count || 0), 0)}
            </p>
            <p className="text-gray-500 text-sm">小组数</p>
          </div>
        </Card>
      </div>

      {/* 班级列表 */}
      {classes.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{isTeacher ? '暂无班级，点击"创建班级"开始' : '暂未加入任何班级，点击"加入班级"输入邀请码'}</p>
          </div>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {classes.map((cls) => (
            <Card key={cls.id} hover onClick={() => { setSelectedClass(cls); setShowDetail(true) }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-gray-800">{cls.name}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {cls.member_count || cls.student_count || 0} 名成员
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {cls.group_count || 0} 个小组
                    </span>
                  </div>
                </div>
                {isTeacher && cls.invite_code && (
                  <div className="text-right">
                    <p className="text-sm text-gray-400">邀请码</p>
                    <p className="font-mono text-gray-600">{cls.invite_code}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 班级详情弹窗 */}
      {showDetail && selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">{selectedClass.name}</h3>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {isTeacher && selectedClass.invite_code && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-500">邀请码</span>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-gray-700 bg-white px-3 py-1 rounded-lg">
                      {selectedClass.invite_code}
                    </code>
                    <button onClick={() => handleCopyCode(selectedClass.invite_code)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                      {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl text-center">
                  <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{selectedClass.member_count || selectedClass.student_count || 0}</p>
                  <p className="text-sm text-gray-500">成员数</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl text-center">
                  <Trophy className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{selectedClass.group_count || 0}</p>
                  <p className="text-sm text-gray-500">小组数</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={() => setShowDetail(false)} variant="secondary">关闭</Button>
            </div>
          </Card>
        </div>
      )}

      {/* 创建班级弹窗（教师） */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-6">创建班级</h3>
            <div>
              <label className="block text-sm text-gray-500 mb-2">班级名称</label>
              <input type="text" value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="例如：初一(1)班"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => setShowCreate(false)} variant="secondary">取消</Button>
              <Button onClick={handleCreateClass} disabled={loading || !newClassName.trim()}>
                {loading ? '创建中...' : '创建'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 加入班级弹窗（学生） */}
      {showJoin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-2">加入班级</h3>
            <p className="text-gray-500 text-sm mb-6">输入教师分享的邀请码加入班级</p>
            <div>
              <label className="block text-sm text-gray-500 mb-2">邀请码</label>
              <input type="text" value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="输入6位邀请码"
                maxLength={8}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 font-mono text-lg tracking-widest text-center" />
            </div>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => setShowJoin(false)} variant="secondary">取消</Button>
              <Button onClick={handleJoinClass} disabled={loading || inviteCode.length < 3}>
                {loading ? '加入中...' : '加入'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ClassPage
