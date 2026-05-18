import { useState, useEffect } from 'react'
import { Users, Plus, Coins, TrendingUp, Heart, Trophy, X, AlertCircle, CheckCircle } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { groupApi, classApi } from '../services/api'
import useStore from '../store/useStore'

interface Group {
  id: number
  name: string
  class_id: number
  class_name: string
  gold_balance: number
  growth_value: number
  health_value: number
  member_count: number
  created_at: string
}

interface ClassItem {
  id: number
  name: string
}

function GroupPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedClassId, setSelectedClassId] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { setCurrentGroup } = useStore()

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const fetchGroups = async () => {
    try {
      const res = await groupApi.getGroups()
      setGroups(res.data)
    } catch {
      showMsg('error', '加载小组失败')
    }
  }

  const fetchClasses = async () => {
    try {
      const res = await classApi.getClasses()
      setClasses(res.data)
      if (res.data.length > 0 && selectedClassId === 0) {
        setSelectedClassId(res.data[0].id)
      }
    } catch { /* ignore */ }
  }

  useEffect(() => { fetchGroups(); fetchClasses() }, [])

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group)
    setCurrentGroup({
      id: group.id, name: group.name, class_id: group.class_id,
      class_name: group.class_name, gold_balance: group.gold_balance,
      growth_value: group.growth_value, health_value: group.health_value,
      member_count: group.member_count,
    })
    setShowModal(true)
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !selectedClassId) return
    setLoading(true)
    try {
      await groupApi.createGroup(selectedClassId, newGroupName)
      setNewGroupName('')
      setShowCreateModal(false)
      showMsg('success', '小组创建成功！')
      fetchGroups()
    } catch (err: any) {
      const detail = err.response?.data?.detail || '创建小组失败'
      showMsg('error', detail)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-orange-800">小组管理</h2>
            <p className="text-orange-500">查看和管理你的小组</p>
          </div>
        </div>
        <Button onClick={() => { setShowCreateModal(true); fetchClasses() }}>
          <Plus className="w-5 h-5" />创建小组
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {groups.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无小组</p>
            <p className="text-sm mt-1">点击"创建小组"开始</p>
          </div>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card key={group.id} hover onClick={() => handleSelectGroup(group)}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-3xl mb-4">👥</div>
                <h3 className="font-bold text-gray-800 mb-1">{group.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{group.class_name}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-yellow-50 rounded-xl">
                    <Coins className="w-4 h-4 mx-auto text-yellow-600 mb-1" />
                    <p className="text-xs text-gray-600">{group.gold_balance}</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-xl">
                    <TrendingUp className="w-4 h-4 mx-auto text-green-600 mb-1" />
                    <p className="text-xs text-gray-600">{group.growth_value}</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Heart className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                    <p className="text-xs text-gray-600">{group.health_value}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    <Users className="inline w-4 h-4 mr-1" />{group.member_count} 名成员
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 小组详情弹窗 */}
      {showModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">{selectedGroup.name}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedGroup.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{selectedGroup.name}</p>
                    <p className="text-sm text-gray-500">{selectedGroup.class_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-yellow-100 px-3 py-2 rounded-xl">
                  <Coins className="w-5 h-5 text-yellow-600" />
                  <span className="font-bold text-yellow-700">{selectedGroup.gold_balance}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-green-50 rounded-xl text-center">
                  <TrendingUp className="w-6 h-6 mx-auto text-green-500 mb-2" />
                  <p className="text-lg font-bold text-gray-800">{selectedGroup.growth_value}</p>
                  <p className="text-sm text-gray-500">成长值</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl text-center">
                  <Heart className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                  <p className="text-lg font-bold text-gray-800">{selectedGroup.health_value}</p>
                  <p className="text-sm text-gray-500">健康值</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl text-center">
                  <Users className="w-6 h-6 mx-auto text-purple-500 mb-2" />
                  <p className="text-lg font-bold text-gray-800">{selectedGroup.member_count}</p>
                  <p className="text-sm text-gray-500">成员数</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => setShowModal(false)} variant="secondary">关闭</Button>
              <Button><Trophy className="w-5 h-5" />查看排行榜</Button>
            </div>
          </Card>
        </div>
      )}

      {/* 创建小组弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">创建小组</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-2">小组名称</label>
                <input type="text" value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="请输入小组名称"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2">选择班级</label>
                <select value={selectedClassId}
                  onChange={(e) => setSelectedClassId(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400">
                  {classes.length === 0 ? (
                    <option value={0}>请先加入班级</option>
                  ) : (
                    classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  )}
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => setShowCreateModal(false)} variant="secondary">取消</Button>
              <Button onClick={handleCreateGroup}
                disabled={loading || !newGroupName.trim() || !selectedClassId}>
                {loading ? '创建中...' : '创建'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default GroupPage
