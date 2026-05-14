import { useState } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import useStore from '../store/useStore'

interface ClassMember {
  id: number
  name: string
  avatar: string
  role: 'teacher' | 'student'
  contribution: number
  joinDate: string
}

interface ClassNotification {
  id: number
  title: string
  content: string
  date: string
  isPinned: boolean
}

const mockClassData = {
  id: 1,
  name: '三年级一班',
  inviteCode: 'ABC123',
  description: '三年级一班是一个充满活力的班级，同学们热爱学习，团结友爱。',
  teacher: { id: 1, name: '李老师', avatar: '👨‍🏫' },
  stats: {
    totalMembers: 32,
    totalGroups: 8,
    avgContribution: 850,
  },
  members: [
    { id: 1, name: '张三', avatar: '🧑‍🎓', role: 'student', contribution: 1200, joinDate: '2026-03-01' },
    { id: 2, name: '李四', avatar: '🧑‍🎓', role: 'student', contribution: 1050, joinDate: '2026-03-01' },
    { id: 3, name: '王五', avatar: '🧑‍🎓', role: 'student', contribution: 980, joinDate: '2026-03-02' },
    { id: 4, name: '赵六', avatar: '🧑‍🎓', role: 'student', contribution: 890, joinDate: '2026-03-02' },
    { id: 5, name: '钱七', avatar: '🧑‍🎓', role: 'student', contribution: 750, joinDate: '2026-03-03' },
  ] as ClassMember[],
  notifications: [
    { id: 1, title: '本周任务安排', content: '本周我们将完成数学第三章的作业和语文古诗词的预习。', date: '2026-05-14', isPinned: true },
    { id: 2, title: '小组活动通知', content: '本周六下午2点将进行小组户外学习活动。', date: '2026-05-13', isPinned: false },
    { id: 3, title: '宠物养成排行榜', content: '恭喜"橘猫小组"获得本周最佳宠物养成小组称号！', date: '2026-05-12', isPinned: false },
  ] as ClassNotification[],
}

function Class() {
  const { user } = useStore()
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'notifications'>('info')
  const [inviteModal, setInviteModal] = useState(false)
  const [notificationModal, setNotificationModal] = useState(false)

  const isTeacher = user?.role === 'teacher'

  const copyInviteCode = () => {
    navigator.clipboard.writeText(mockClassData.inviteCode)
    setInviteModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
          <span className="text-2xl">🏫</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white text-white-shadow">班级</h1>
          <p className="text-white/80 text-white-shadow">查看班级信息和成员</p>
        </div>
      </div>

      <Card className="animate-fadeIn">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center text-3xl">
            🏫
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{mockClassData.name}</h2>
            <p className="text-gray-500 text-sm">班主任: {mockClassData.teacher.name}</p>
          </div>
          {isTeacher && (
            <Button variant="outline" size="sm" onClick={() => setInviteModal(true)}>
              邀请码
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <p className="text-2xl font-bold text-blue-600">{mockClassData.stats.totalMembers}</p>
            <p className="text-xs text-gray-500">班级人数</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-600">{mockClassData.stats.totalGroups}</p>
            <p className="text-xs text-gray-500">小组数量</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-xl">
            <p className="text-2xl font-bold text-purple-600">{mockClassData.stats.avgContribution}</p>
            <p className="text-xs text-gray-500">平均贡献</p>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        {(['info', 'members', 'notifications'] as const).map(tab => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'info' ? '📋 班级信息' : tab === 'members' ? '👥 成员' : '📢 通知'}
          </Button>
        ))}
      </div>

      {activeTab === 'info' && (
        <Card className="animate-fadeIn">
          <h3 className="font-bold text-gray-800 mb-3">班级简介</h3>
          <p className="text-gray-600 mb-6">{mockClassData.description}</p>
          <h3 className="font-bold text-gray-800 mb-3">班级公告</h3>
          <div className="space-y-3">
            {mockClassData.notifications.filter(n => n.isPinned).map(notification => (
              <div key={notification.id} className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-yellow-200 text-yellow-700 text-xs rounded">置顶</span>
                  <h4 className="font-medium text-gray-800">{notification.title}</h4>
                </div>
                <p className="text-gray-600 text-sm">{notification.content}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'members' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">共 {mockClassData.members.length} 名成员</p>
            {isTeacher && (
              <Button variant="outline" size="sm">添加学生</Button>
            )}
          </div>
          {mockClassData.members.map((member, index) => (
            <Card key={member.id} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{member.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">{member.name}</h3>
                    {member.role === 'teacher' && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">老师</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">加入时间: {member.joinDate}</p>
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

      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {isTeacher && (
            <Button variant="outline" className="w-full" onClick={() => setNotificationModal(true)}>
              发布新通知
            </Button>
          )}
          {mockClassData.notifications.map((notification, index) => (
            <Card key={notification.id} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">{notification.isPinned ? '📌' : '📢'}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {notification.isPinned && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">置顶</span>
                    )}
                    <h3 className="font-bold text-gray-800">{notification.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{notification.content}</p>
                  <p className="text-gray-400 text-xs">{notification.date}</p>
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
              <div className="text-5xl mb-4">🔗</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">邀请码</h2>
              <p className="text-gray-600 mb-4">分享邀请码给其他学生加入班级</p>
              <div className="bg-gray-100 rounded-xl p-4 mb-4">
                <p className="text-3xl font-bold text-center tracking-widest">{mockClassData.inviteCode}</p>
              </div>
              <Button onClick={copyInviteCode} className="w-full">复制邀请码</Button>
              <Button variant="secondary" onClick={() => setInviteModal(false)} className="w-full mt-2">
                关闭
              </Button>
            </div>
          </Card>
        </div>
      )}

      {notificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md animate-scaleIn">
            <h2 className="text-xl font-bold text-gray-800 mb-4">发布通知</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">标题</label>
                <Input placeholder="通知标题" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">内容</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  rows={4}
                  placeholder="通知内容..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="pin" className="w-4 h-4 text-orange-500" />
                <label htmlFor="pin" className="text-sm text-gray-600">置顶通知</label>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setNotificationModal(false)} className="flex-1">
                  取消
                </Button>
                <Button className="flex-1">发布</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Class