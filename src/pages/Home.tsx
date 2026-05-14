import Card from '../components/common/Card'

function Home() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
          <span className="text-2xl">🏠</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white text-white-shadow">首页</h1>
          <p className="text-white/80 text-white-shadow">欢迎来到小组学习陪伴宠物系统</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="card-hover">
          <div className="text-4xl mb-4">🐱</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">我的宠物</h3>
          <p className="text-gray-600">查看和照顾你的学习伙伴</p>
        </Card>

        <Card className="card-hover">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">今日任务</h3>
          <p className="text-gray-600">完成学习任务获取奖励</p>
        </Card>

        <Card className="card-hover">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">金币余额</h3>
          <p className="text-gray-600">管理你的金币和商城</p>
        </Card>
      </div>
    </div>
  )
}

export default Home
