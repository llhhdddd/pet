import Card from '../components/common/Card'

function Profile() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
          <span className="text-2xl">👤</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white text-white-shadow">个人中心</h1>
          <p className="text-white/80 text-white-shadow">管理你的个人信息和设置</p>
        </div>
      </div>

      <Card>
        <p className="text-gray-600">个人信息加载中...</p>
      </Card>
    </div>
  )
}

export default Profile
