import { useState } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import useStore from '../store/useStore'

interface GroupMember {
  id: number
  name: string
  avatar: string
  role: 'leader' | 'member'
  contribution: number
  taskCount: number
  joinDate: string
}

interface GroupData {
  id: number
  name: string
  className: string
  pet: {
    name: string
    emoji: string
    level: number
    health: number
  }
  stats: {
    totalGold: number
    totalGrowth: number
    rank: number
  }
  members: GroupMember[]
}

const mockGroupData: GroupData = {
  id: 1,
  name: '橘猫小组',
  className: '三年级一班',
  pet: { name: '小橘', emoji: '🐱', level: 2, health: 85 },
  stats: { totalGold: 2500, totalGrowth: 450, rank: 3 },
  members: [
    { id: 1, name: '张三', avatar: '🧑‍🎓', role: 'leader', contribution: 1200, taskCount: 15, joinDate: '2026-03-01' },
    { id: 2, name: '李四', avatar: '🧑‍🎓', role: 'member', contribution: 850, taskCount: 12, joinDate: '2026-03-01' },
    { id: 3, name: '王五', avatar: '🧑‍🎓', role: 'member', contribution: 620, taskCount: 8, joinDate: '2026-03-02' },
    { id: 4, name: '赵六', avatar: '🧑‍🎓', role: 'member', contribution: 450, taskCount: 6, joinDate: '2026-03-02' },
  ],
}

const rankingList = [
  { rank: 1, name: '汪汪小组', emoji: '🐶', gold: 3200, growth: 580 },
  { rank: 2, name: '飞翔小组', emoji: '🦅', gold: 2800, growth: 510 },
  { rank: 3, name: '橘猫小组', emoji: '🐱', gold: 2500, growth: 450 },
  { rank: 4, name: '萌兔小组', emoji: '🐰', gold: 2100, growth: 380 },
  { rank: 5, name: '学习小组', emoji: '📚', gold: 1800, growth: 320 },
]

function Group() {
  const { user, setGroup } = useStore()
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'ranking'>('info')
  const [inviteModal, setInviteModal] = useState(false)
  const [leaveModal, setLeaveModal] = useState(false)

  const isLeader = user?.role === 'teacher'
  const currentUser = mockGroupData.members[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
          <span className="text-2xl">👥</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white text-white-shadow">小组</h1>
          <p className="text-white/80 text-white-shadow">查看小组信息和成员</p>
        </div>
      </div>

      <Card className="animate-fadeIn">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center text-3xl">
            {mockGroupData.pet.emoji}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{mockGroupData.name}</h2>
            <p className="text-gray-500 text-sm">{mockGroupData.className}</p>
            <p className="text-orange-500 text-sm">小组宠物: {mockGroupData.pet.name} (Lv.{mockGroupData.pet.level})</p>
          </div>
          {isLeader && (
            <Button variant="outline" size="sm" onClick={() => setInviteModal(true)}>
              邀请
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-amber-50 rounded-xl">
            <p className="text-2xl font-bold text-amber-600">{mockGroupData.stats.totalGold}</p>
            <p className="text-xs text-gray-500">小组金币</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-xl">
            <p className="text-2xl font-bold text-purple-600">{mockGroupData.stats.totalGrowth}</p>
            <p className="text-xs text-gray-500">成长总值</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-600">第{mockGroupData.stats.rank}名</p>
            <p className="text-xs text-gray-500">班级排名</p>
          </div>
        </div>

        <div className="p-3 bg-orange-50 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">宠物健康度</span>
            <span className="text-orange-500 font-medium">{mockGroupData.pet.health}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-500"
              style={{ width: `${mockGroupData.pet.health}%` }}
            />
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        {(['info', 'members', 'ranking'] as const).map(tab => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'info' ? '📋 小组信息' : tab === 'members' ? '👥 成员' : '🏆 排行榜'}
          </Button>
        ))}
      </div>

      {activeTab === 'info' && (
        <Card className="animate-fadeIn">
          <h3 className="font-bold text-gray-800 mb-3">小组简介</h3>
          <p className="text-gray-600 mb-6">
            {mockGroupData.name}是由{user?.username || '张三'}创建的学习小组。我们的小组宠物是{mockGroupData.pet.name}，
            通过完成学习任务来获取金币和成长值，让宠物不断升级进化！
          </p>

          <h3 className="font-bold text-gray-800 mb-3">小组成就</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-yellow-50 rounded-xl text-center">
              <div className="text-3xl mb-1">🏆</div>
              <p className="text-sm text-gray-600">本周最佳小组</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <div className="text-3xl mb-1">📚</div>
              <p className="text-sm text-gray-600">完成作业 45 次</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <div className="text-3xl mb-1">🌟</div>
              <p className="text-sm text-gray-600">连续打卡 7 天</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl text-center">
              <div className="text-3xl mb-1">💎</div>
              <p className="text-sm text-gray-600">宠物达到 Lv.2</p>
            </div>
          </div>

          {!isLeader && (
            <Button variant="danger" className="w-full mt-6" onClick={() => setLeaveModal(true)}>
              退出小组
            </Button>
          )}
        </Card>
      )}

      {activeTab === 'members' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">共 {mockGroupData.members.length} 名成员</p>
            {isLeader && (
              <Button variant="outline" size="sm">添加成员</Button>
            )}
          </div>

          {mockGroupData.members.map((member, index) => (
            <Card key={member.id} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="text-4xl">{member.avatar}</div>
                  {member.role === 'leader' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
                      👑
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">{member.name}</h3>
                    {member.role === 'leader' && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-600 text-xs rounded">组长</span>
                    )}
                    {member.id === currentUser?.id && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">我</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">完成任务 {member.taskCount} 个</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-500 font-bold">{member.contribution}</p>
                  <p className="text-gray-400 text-xs">贡献值</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'ranking' && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800">班级小组排行榜</h3>
          {rankingList.map((group, index) => (
            <Card
              key={group.rank}
              className={`animate-fadeIn ${group.name === mockGroupData.name ? 'ring-2 ring-orange-400' : ''}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                  group.rank === 1 ? 'bg-yellow-100' :
                  group.rank === 2 ? 'bg-gray-200' :
                  group.rank === 3 ? 'bg-orange-100' :
                  'bg-gray-50'
                }`}>
                  {group.rank === 1 ? '🥇' : group.rank === 2 ? '🥈' : group.rank === 3 ? '🥉' : `#${group.rank}`}
                </div>
                <div className="text-3xl">{group.emoji}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{group.name}</h3>
                  <p className="text-gray-500 text-sm">成长值: {group.growth}</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-500 font-bold">{group.gold}</p>
                  <p className="text-gray-400 text-xs">金币</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {inviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-sm animate-scaleIn">
            <div className="text-center">
              <div className="text-5xl mb-4">👥</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">邀请成员</h2>
              <p className="text-gray-600 mb-4">分享小组邀请码给同学加入小组</p>
              <div className="bg-gray-100 rounded-xl p-4 mb-4">
                <p className="text-3xl font-bold text-center tracking-widest">{mockGroupData.name.slice(0, 4).toUpperCase()}{mockGroupData.id}23</p>
              </div>
              <Button onClick={() => setInviteModal(false)} className="w-full">复制邀请码</Button>
              <Button variant="secondary" onClick={() => setInviteModal(false)} className="w-full mt-2">
                关闭
              </Button>
            </div>
          </Card>
        </div>
      )}

      {leaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-sm animate-scaleIn">
            <div className="text-center">
              <div className="text-5xl mb-4">😢</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">确定要退出小组吗？</h2>
              <p className="text-gray-600 mb-6">
                退出后你将失去小组的所有贡献值和宠物养成进度。
              </p>
              <Button variant="danger" onClick={() => setLeaveModal(false)} className="w-full">
                确定退出
              </Button>
              <Button variant="secondary" onClick={() => setLeaveModal(false)} className="w-full mt-2">
                取消
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Group