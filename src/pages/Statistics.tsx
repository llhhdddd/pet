import Card from '../components/common/Card'

function Statistics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
          <span className="text-2xl">📊</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white text-white-shadow">学情分析</h1>
          <p className="text-white/80 text-white-shadow">查看班级学习数据和异常预警</p>
        </div>
      </div>

      <Card>
        <p className="text-gray-600">学情分析数据加载中...</p>
      </Card>
    </div>
  )
}

export default Statistics
